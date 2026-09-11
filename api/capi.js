// Recebe os eventos do navegador e reenvia para a Conversions API da Meta.
//
// Por que existe: bloqueador de anúncio, iOS e perda de cookie derrubam boa parte
// dos disparos do pixel no navegador. O mesmo evento sai daqui, do servidor, onde
// nada disso alcança — e com IP e user-agent reais do comprador, que melhoram o
// match. O navegador continua disparando também.
//
// DEDUPLICAÇÃO: navegador e servidor mandam o MESMO event_id. A Meta reconhece o
// par e conta uma vez só. Sem isso, todo número dobra e a otimização vai junto.
//
// Purchase NÃO passa por aqui de propósito: este endpoint é público, e aceitar
// Purchase do navegador deixaria qualquer pessoa inventar venda no pixel. Ele vem
// só do korvex-webhook.js, disparado pela Korvex quando o pagamento confirma.
//
// Variáveis de ambiente:
//   META_CAPI_TOKEN   token da Conversions API   (obrigatório, secreto)
//   META_PIXEL_ID     id do pixel                (opcional, default abaixo)
//
// TROCA DE PIXEL: o id NAO e mais literal aqui. Ele vem de
// config/produto.js (`tracking.metaPixelId`), que e o MESMO valor que a pagina
// injeta no navegador — assim o evento do servidor e o do navegador nunca saem
// para pixels diferentes. A env META_PIXEL_ID continua vencendo, para dar uma
// saida rapida sem redeploy do bundle.
//
// O literal anterior era uma bomba numa copia do template: quem esquecesse de
// definir META_PIXEL_ID mandava os eventos para o pixel de outra pessoa, em
// silencio, e so descobria pelo publico contaminado.
//
// ATENCAO: o META_CAPI_TOKEN e emitido POR conjunto de dados. Token de um pixel
// nao autentica em outro — a Meta recusa a chamada.

const PIXEL_ID = process.env.META_PIXEL_ID || require('../config/produto.js').tracking.metaPixelId;
const API_VERSION = 'v21.0';

// Só estes. Qualquer outro nome é recusado.
const PERMITIDOS = ['PageView', 'ViewContent', 'InitiateCheckout', 'AddToCart', 'AddPaymentInfo'];

/* ---- identificadores do comprador ----
   A partir do passo 1 do checkout a página já sabe nome, e-mail e telefone.
   Antes isso não era aproveitado: os eventos de funil saíam só com fbp/fbc/IP,
   e o Purchase (que vem do webhook, com e-mail e endereço) ficava sendo o único
   evento com identidade. Mandar os mesmos identificadores no meio do funil sobe
   o match rate e ajuda a Meta a ligar o Purchase à mesma pessoa.

   O dado cru só trafega entre a página e este endpoint, na mesma origem e por
   HTTPS; o hash é feito aqui e é só o hash que sai para a Meta. A normalização
   é a mesma do korvex-webhook.js — divergir entre os dois derrubaria o
   pareamento em silêncio, sem erro nenhum. */
const crypto = require('crypto');
const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

function hashEmail(v) {
  if (!v) return null;
  const e = String(v).trim().toLowerCase();
  return e.includes('@') && e.length < 160 ? sha256(e) : null;
}

function hashPhone(v) {
  if (!v) return null;
  let d = String(v).replace(/\D/g, '');
  if (!d || d.length > 15) return null;
  if (d.length <= 11) d = '55' + d;
  return sha256(d);
}

function partesDoNome(v) {
  if (!v) return {};
  const limpo = String(v).slice(0, 120).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!limpo) return {};
  const p = limpo.split(' ');
  const out = { fn: sha256(p[0]) };
  if (p.length > 1) out.ln = sha256(p[p.length - 1]);
  return out;
}

function lerCookie(cabecalho, nome) {
  if (!cabecalho) return null;
  const partes = String(cabecalho).split(';');
  for (const p of partes) {
    const i = p.indexOf('=');
    if (i === -1) continue;
    if (p.slice(0, i).trim() === nome) return decodeURIComponent(p.slice(i + 1).trim());
  }
  return null;
}

// A Meta espera fbc no formato fb.<indice_subdominio>.<hora_do_clique>.<fbclid>.
// O índice NÃO é sempre 1: conta os rótulos acima do domínio registrável. Como
// vercel.app é sufixo público, ritualdapele.vercel.app dá 2 — e foi isso que o
// pixel gravou no cookie. Com índice errado a Meta não parea com o clique.
// Preferir SEMPRE o valor pronto (cookie do pixel ou repassado pela Korvex);
// montar na mão é último recurso, e aí o horário é o do clique, não o de agora.
const FBC_INDICE_SUBDOMINIO = 2;

function montarFbc(valor, quandoClique) {
  if (!valor) return null;
  // já veio pronto do pixel — usar como está, sem remontar
  if (String(valor).startsWith('fb.')) return String(valor);
  return 'fb.' + FBC_INDICE_SUBDOMINIO + '.' + (quandoClique || Date.now()) + '.' + valor;
}

function ipDoComprador(req) {
  // Na Vercel o IP real vem no x-forwarded-for; o primeiro da lista é o cliente.
  const xff = req.headers['x-forwarded-for'];
  if (xff) return String(xff).split(',')[0].trim();
  return req.headers['x-real-ip'] || undefined;
}

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') return res.status(405).json({ erro: 'use POST' });

  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.error('[capi] META_CAPI_TOKEN nao configurado');
    return res.status(200).json({ ok: false, motivo: 'token ausente' });
  }

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  if (!corpo || typeof corpo !== 'object') corpo = {};

  const nome = String(corpo.event_name || '');
  if (!PERMITIDOS.includes(nome)) {
    return res.status(400).json({ erro: 'evento nao permitido', recebido: nome });
  }
  if (!corpo.event_id) {
    // Sem event_id não há como deduplicar, e o número dobraria.
    return res.status(400).json({ erro: 'event_id obrigatorio' });
  }

  const agora = Date.now();
  const cookies = req.headers.cookie;

  // fbp/fbc: o cookie do servidor é mais confiável que o que o navegador manda,
  // então ele vem primeiro; o do corpo é só reserva.
  const fbp = lerCookie(cookies, '_fbp') || corpo.fbp || undefined;
  const fbcCookie = lerCookie(cookies, '_fbc');
  const fbc = fbcCookie || montarFbc(corpo.fbclid, agora) || corpo.fbc || undefined;

  const user_data = Object.assign(
    {
      client_ip_address: ipDoComprador(req),
      client_user_agent: req.headers['user-agent'] || undefined,
      fbp: fbp,
      fbc: fbc,
      em: hashEmail(corpo.email) || undefined,
      ph: hashPhone(corpo.telefone) || undefined
    },
    partesDoNome(corpo.nome)
  );
  Object.keys(user_data).forEach((k) => { if (!user_data[k]) delete user_data[k]; });

  // Valor só entra se for número de verdade — evita mandar lixo para o relatório.
  const custom_data = {};
  const v = Number(corpo.value);
  if (Number.isFinite(v) && v > 0 && v < 100000) {
    custom_data.value = +v.toFixed(2);
    custom_data.currency = String(corpo.currency || 'BRL').toUpperCase().slice(0, 3);
  }
  if (Array.isArray(corpo.content_ids) && corpo.content_ids.length) {
    custom_data.content_ids = corpo.content_ids.slice(0, 10).map(String);
    custom_data.content_type = 'product';
  }
  if (corpo.content_name) custom_data.content_name = String(corpo.content_name).slice(0, 120);
  const n = Number(corpo.num_items);
  if (Number.isFinite(n) && n > 0 && n < 100) custom_data.num_items = Math.round(n);

  const evento = {
    event_name: nome,
    event_time: Math.floor(agora / 1000),
    event_id: String(corpo.event_id).slice(0, 100),
    action_source: 'website',
    event_source_url: String(corpo.event_source_url || 'https://ritualdapele.vercel.app/').slice(0, 500),
    user_data
  };
  if (Object.keys(custom_data).length) evento.custom_data = custom_data;

  const payload = { data: [evento] };
  // Aceita o código de teste por query (?test=) ou pelo corpo, para a própria
  // navegação do site poder aparecer na aba Testar Eventos: basta abrir a página
  // com ?fbtest=TESTxxxxx que o cliente repassa aqui.
  const codigoTeste = req.query.test || corpo.test_event_code || process.env.META_TEST_EVENT_CODE;
  if (codigoTeste) payload.test_event_code = codigoTeste;

  // Simulação: mostra o que sairia sem mandar nada. Serve para conferir a esteira
  // sem sujar o pixel.
  if (req.query.dry) {
    return res.status(200).json({ ok: true, modo: 'simulacao', token_configurado: true, enviaria: payload });
  }

  const url = `https://graph.facebook.com/${API_VERSION}/${PIXEL_ID}/events?access_token=${encodeURIComponent(token)}`;

  try {
    const r = await fetch(url, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(payload)
    });
    const texto = await r.text();
    if (r.ok) {
      // events_received é a confirmação da Meta de quantos eventos ela registrou.
      // Sem isso, um 200 com corpo de erro passaria por sucesso.
      let recebidos = null;
      try { recebidos = JSON.parse(texto).events_received; } catch (e) {}
      return res.status(200).json({ ok: true, evento: nome, id: evento.event_id, events_received: recebidos });
    }

    // 4xx é erro de configuração: repetir não conserta. 5xx é passageiro.
    console.error('[capi] meta recusou', r.status, texto.slice(0, 400));
    return res.status(r.status >= 500 ? 502 : 200).json({ ok: false, status: r.status });
  } catch (e) {
    console.error('[capi] falha de rede:', e.message);
    return res.status(502).json({ ok: false, erro: 'falha de rede' });
  }
};
