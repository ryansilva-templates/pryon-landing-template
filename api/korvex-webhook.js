// Recebe o webhook de venda aprovada da Korvex e envia o Purchase para a Meta
// pela Conversions API.
//
// Existe porque a venda é no PIX: o cliente gera o QR Code, sai do site e paga no app
// do banco. A maioria nunca volta para uma tela de obrigado, então um Purchase disparado
// pelo navegador perderia a maior parte das vendas. Aqui o evento sai do servidor, no
// momento em que o pagamento é confirmado — que é o único momento em que ele é verdade.
//
// ─────────────────────────────────────────────────────────────────────────────
// ESTE ARQUIVO FOI REESCRITO CONTRA A DOCUMENTAÇÃO REAL DA KORVEX
// (https://app.korvex.com.br/docs/webhooks/payment), em 23/08/2026.
//
// A versão anterior foi escrita adivinhando o formato do payload e tinha dois
// defeitos que impediam QUALQUER venda de chegar na Meta:
//
//   1. Autenticação. Ela só olhava `?k=` e o header `x-webhook-secret`, e a Korvex
//      manda um campo `token` no corpo. Toda notificação real levava 401.
//      A primeira correção trocou a ordem para `corpo.token || ?k= || header` — e
//      continuou errada, porque o `token` que a Korvex manda é o token DELA, não o
//      nosso KORVEX_WEBHOOK_SECRET: como ele sempre existe, o `?k=` nunca era
//      consultado. Os logs de 23/08/2026 mostravam três recusas por cobrança, com
//      "origem do segredo: corpo.token". Agora os três caminhos são testados e
//      basta um bater — na prática quem bate é o `?k=` do callbackUrl.
//
//   2. event_id. Ele saía de uma varredura genérica que procurava a chave `id` e
//      encontrava `client.id` (o id do CLIENTE) antes de `transaction.id`. Duas
//      compras da mesma pessoa sairiam com o mesmo event_id, e a Meta descartaria
//      a segunda como duplicata.
//
// Payload real conferido em 23/08/2026 (log de produção). Duas surpresas úteis:
//   - Em venda por API, `client.address` vem NULL. O endereço de entrega chega em
//     `trackProps`, porque a Korvex devolve ali o `metadata` que nós mandamos.
//   - `pixInformation.expiresAt` vem null: a cobrança não tem prazo declarado.
//
// Agora o mapeamento é explícito. A varredura genérica continua como rede de
// segurança para o caso de a Korvex mudar um nome de campo, mas o caminho
// documentado sempre ganha.
// ─────────────────────────────────────────────────────────────────────────────
//
// Formato que a Korvex envia (POST, JSON):
//   event        TRANSACTION_CREATED | TRANSACTION_PAID | TRANSACTION_CANCELED
//                TRANSACTION_REFUNDED | TRANSACTION_CHARGED_BACK
//   token        segredo de autenticidade
//   offerCode    código da oferta (checkout interno)
//   checkoutUrl  URL do checkout com todos os search params (UTMs, sessão, oferta)
//   client       { id, name, email, phone, cpf, cnpj, address:{ country, zipCode,
//                  state, city, neighborhood, street, number, complement } }
//   transaction  { id, identifier, status, paymentMethod, amount, currency,
//                  createdAt, payedAt, ... }
//   orderItems   [ { id, price, product:{ id, name, externalId } } ]
//   trackProps   { utm_*, fbc, fbp, ip, country, user_agent }
//
// Variáveis de ambiente (Vercel → Settings → Environment Variables):
//   META_CAPI_TOKEN         token de acesso da Conversions API   (obrigatório, secreto)
//   KORVEX_WEBHOOK_SECRET   segredo combinado com a Korvex       (obrigatório)
//   META_PIXEL_ID           id do pixel  (opcional, default abaixo — desde
//                           28/08/2026 o default é o pixel novo; env vence default)
//   META_TEST_EVENT_CODE    código do Testar Eventos (opcional, só para depuração)
//
// Dois modos de verificação, por query string:
//   ?dry=1        monta o evento e devolve o que MANDARIA, sem enviar nada para a Meta.
//                 Serve para conferir a esteira sem sujar o pixel com venda falsa.
//   ?test=CODE    envia de verdade, mas com test_event_code: o evento aparece só na aba
//                 Testar Eventos e não entra no relatório nem na otimização.

const crypto = require('crypto');
const PRODUTO_UA = require('../config/produto.js');
/* User-Agent que a Korvex ve nos nossos requests. Sai do config para uma
   copia do template nao se identificar como outra loja. */
const UA_PRYON = 'PryonLanding/1.0 (+' + PRODUTO_UA.seo.dominio + '; contato ' + PRODUTO_UA.marca.email + ')';

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
const ORIGEM = 'https://ritualdapele.vercel.app/';
// Usada para confirmar a transação quando o webhook chega sem o nosso segredo.
const KORVEX_API = 'https://app.korvex.com.br/api/v1';

/* ---------------------------------------------------------------- utilidades */

const sha256 = (v) => crypto.createHash('sha256').update(String(v)).digest('hex');

// A Meta exige normalização antes do hash. Errar aqui não dá erro nenhum — só
// derruba o match rate em silêncio, que é o pior tipo de bug nesse sistema.
function hashEmail(v) {
  if (!v) return null;
  const e = String(v).trim().toLowerCase();
  return e.includes('@') ? sha256(e) : null;
}

function hashPhone(v) {
  if (!v) return null;
  let d = String(v).replace(/\D/g, '');
  if (!d) return null;
  if (d.length <= 11) d = '55' + d;   // celular/fixo brasileiro sem DDI
  return sha256(d);
}

// Nome: a Meta quer `fn` e `ln` separados, minúsculos, sem acento nem pontuação.
// Mandar o nome inteiro em `fn` (o que a versão anterior fazia) casa menos.
function partesDoNome(v) {
  if (!v) return {};
  const limpo = String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z\s]/g, ' ').replace(/\s+/g, ' ').trim();
  if (!limpo) return {};
  const p = limpo.split(' ');
  const out = { fn: sha256(p[0]) };
  if (p.length > 1) out.ln = sha256(p[p.length - 1]);
  return out;
}

// Cidade, estado, CEP e país: minúsculo, sem espaço, sem pontuação.
// São os campos mais baratos de melhorar o match — a Korvex já manda todos.
const hashSimples = (v) => {
  if (!v) return null;
  const s = String(v).normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .toLowerCase().replace(/[^a-z0-9]/g, '');
  return s ? sha256(s) : null;
};

// A Korvex não documentava o formato quando isto foi escrito pela primeira vez.
// Hoje documenta, e o mapeamento explícito abaixo é o caminho principal — mas a
// varredura fica como rede: se um campo mudar de nome, o evento sai mesmo assim.
function achar(obj, nomes, profundidade = 0) {
  if (!obj || typeof obj !== 'object' || profundidade > 6) return undefined;
  for (const nome of nomes) {
    for (const chave of Object.keys(obj)) {
      if (chave.toLowerCase() === nome.toLowerCase()) {
        const v = obj[chave];
        if (v !== null && v !== undefined && v !== '' && typeof v !== 'object') return v;
      }
    }
  }
  for (const chave of Object.keys(obj)) {
    const v = obj[chave];
    if (v && typeof v === 'object') {
      const achado = achar(v, nomes, profundidade + 1);
      if (achado !== undefined) return achado;
    }
  }
  return undefined;
}

// A Korvex manda `amount` em REAIS (55.16). Aceita string com vírgula por garantia.
// Não existe mais o chute "acima de 1000 é centavo": ele quebraria um pedido de
// R$ 1.200 legítimo, e a documentação diz que a unidade é real.
function normalizarValor(bruto) {
  if (bruto === undefined || bruto === null) return null;
  if (typeof bruto === 'number') return Number.isFinite(bruto) ? bruto : null;
  const s = String(bruto).trim().replace(/[^\d,.-]/g, '');
  if (!s) return null;
  const n = s.includes(',') ? Number(s.replace(/\./g, '').replace(',', '.')) : Number(s);
  return Number.isFinite(n) ? n : null;
}

// A Meta espera fbc no formato fb.<indice_subdominio>.<hora_do_clique>.<fbclid>.
// O índice NÃO é sempre 1: conta os rótulos acima do domínio registrável. Como
// vercel.app é sufixo público, ritualdapele.vercel.app dá 2 — e foi isso que o
// pixel gravou no cookie. Com índice errado a Meta não parea com o clique.
// Preferir SEMPRE o valor pronto (a Korvex devolve `trackProps.fbc`);
// montar na mão é último recurso, e aí falta o horário real do clique.
const FBC_INDICE_SUBDOMINIO = 2;

function montarFbc(valor, quandoClique) {
  if (!valor) return null;
  // já veio pronto do pixel — usar como está, sem remontar
  if (String(valor).startsWith('fb.')) return String(valor);
  return 'fb.' + FBC_INDICE_SUBDOMINIO + '.' + (quandoClique || Date.now()) + '.' + valor;
}

// Comparação de segredo em tempo constante. Com `!==` o tempo de resposta vaza,
// byte a byte, quanto do segredo o atacante já acertou.
/* event_source_url PRECISA ser um domínio NOSSO.

   Até 25/08/2026 esta era `corpo.checkoutUrl || ORIGEM`, com o comentário "a URL
   exata do checkout traz as UTMs da sessão; é melhor sinal que a home". O
   raciocínio vale enquanto o checkout é na nossa página — aí `checkoutUrl` vem
   vazio e cai em ORIGEM, que é nosso.

   Só que com o Pix da página fora do ar, TODA venda passa pelo checkout
   hospedado, e aí `checkoutUrl` vem preenchido com uma URL do domínio da
   KORVEX. Resultado: todo Purchase foi reportado à Meta como tendo acontecido
   num domínio que não é nosso e não está verificado no nosso Business Manager.
   O evento chega (events_received: 1) e mesmo assim não atribui — que é
   exatamente o sintoma de "2 vendas, 1 atribuída".

   Agora a URL é sempre a nossa, com as UTMs da sessão penduradas. Assim não se
   perde o sinal de campanha que motivava o código antigo, e o domínio passa a
   ser o mesmo que o pixel já reporta em PageView, ViewContent e InitiateCheckout. */
const UTMS = ['utm_source', 'utm_medium', 'utm_campaign', 'utm_content', 'utm_term'];

function urlDoEvento(track) {
  try {
    const u = new URL(ORIGEM);
    UTMS.forEach((k) => { if (track && track[k]) u.searchParams.set(k, String(track[k])); });
    return u.toString();
  } catch (e) {
    return ORIGEM;
  }
}

function segredoConfere(enviado, esperado) {
  if (!enviado || !esperado) return false;
  const a = Buffer.from(String(enviado));
  const b = Buffer.from(String(esperado));
  if (a.length !== b.length) return false;
  return crypto.timingSafeEqual(a, b);
}

/* ============================================================================
   UTMify — envio direto do pedido

   POR QUE ISTO EXISTE. A UTMify lê as UTMs do `checkoutUrl` que a Korvex manda
   no webhook dela. A documentação da Korvex é explícita: `checkoutUrl` é a
   "URL exata do checkout acessada pelo cliente, contendo todos os search params
   (sessão, oferta, afiliação e UTMs)" e vem **vazia quando não há sessão de
   checkout associada**.

   Venda criada por API não tem sessão de checkout. Conferido no payload real de
   produção: `"checkoutUrl":""`. Ou seja, desde que o checkout passou a ser na
   própria página, TODA venda chega na UTMify sem UTM — e cai em "Não Trackeado
   / UTMs vazias", que foi exatamente o que apareceu no dashboard.

   As UTMs não se perderam: elas estão em `trackProps`, porque nós as mandamos
   no `metadata` da cobrança. O que faltava era alguém entregá-las à UTMify.
   É o que este bloco faz, pela API oficial deles
   (https://docs.utmify.com.br — POST /api-credentials/orders).

   CUIDADO COM DUPLICATA: a Korvex também manda pedidos para a UTMify pela
   integração nativa dela. Se as duas fontes ficarem ligadas, o mesmo pedido pode
   entrar duas vezes e inflar o faturamento do painel. O `orderId` daqui é o
   `transaction.id`, o mesmo identificador da Korvex, o que dá à UTMify a chance
   de tratar como atualização — mas isso não é garantido. A recomendação é
   desligar a integração nativa Korvex→UTMify, já que ela não consegue mandar
   UTM nenhuma em venda por API.

   Sem UTMIFY_API_TOKEN configurado, esta função não faz nada — nenhum
   comportamento muda. Token em: Utmify → Integrações → Webhooks →
   Credenciais de API → Adicionar Credencial.
   ========================================================================== */
const UTMIFY_URL = 'https://api.utmify.com.br/api-credentials/orders';

/* ---------------------------------------- trava contra entrega duplicada ----

   MEDIDO EM PRODUÇÃO em 25/08/2026. A mesma transação, o mesmo evento
   TRANSACTION_PAID, entregue DUAS vezes com 740ms de diferença:

       15:05:10.29  POST /api/korvex-webhook  -> [utmify] enviado | pedido cmt8z46vg0vod01ppbpsgn9wp | paid
       15:05:11.03  POST /api/korvex-webhook  -> [utmify] enviado | pedido cmt8z46vg0vod01ppbpsgn9wp | paid

   A causa é estrutural: há DOIS webhooks registrados na Korvex apontando para
   esta mesma URL — o "API CallbackURL" (criado pelo nosso callbackUrl, cobre as
   cobranças da nossa página) e o "LP Ritual da Pele - Purchase" (do painel,
   todos os produtos, cobre venda pelo checkout hospedado). Para uma cobrança
   criada por API os dois disparam. Ambos carregam o `?k=`, então nem dá para
   distinguir pela autenticação.

   Na Meta isso não faz estrago: os dois Purchase saem com o mesmo `event_id`
   (o transaction.id) e ela deduplica. Na UTMify, dois POSTs quase simultâneos
   com o mesmo `orderId` correm um contra o outro no upsert e nascem dois
   pedidos — que é o "faturamento não bate" no painel.

   A trava reserva a chave ANTES de mandar e a solta se o envio falhar, para que
   uma falha real ainda possa ser reenviada.

   LIMITE HONESTO: esta memória vive na instância quente da função. Duas
   entregas que caiam em instâncias diferentes ainda passam. Reduz muito, não
   zera. O fim definitivo é remover um dos dois registros de webhook no painel
   da Korvex (ou desligar a integração nativa Korvex->UTMify, que também manda
   pedido por conta própria e não consegue mandar UTM em venda por API). */

const ENTREGAS = new Map();
const ENTREGA_TTL_MS = 15 * 60 * 1000;

function reservarEnvio(chave) {
  const quando = ENTREGAS.get(chave);
  if (quando && Date.now() - quando < ENTREGA_TTL_MS) return false;  // já mandamos
  ENTREGAS.set(chave, Date.now());
  if (ENTREGAS.size > 500) {
    const limite = Date.now() - ENTREGA_TTL_MS;
    for (const [k, v] of ENTREGAS) if (v < limite) ENTREGAS.delete(k);
  }
  return true;
}
function soltarEnvio(chave) { ENTREGAS.delete(chave); }

// "2026-08-24T21:19:57.283Z" → "2026-08-24 21:19:57" (UTC, como eles exigem)
function dataUtmify(iso) {
  if (!iso) return null;
  const d = new Date(iso);
  if (isNaN(d.getTime())) return null;
  return d.toISOString().slice(0, 19).replace('T', ' ');
}

const STATUS_UTMIFY = {
  TRANSACTION_CREATED: 'waiting_payment',
  TRANSACTION_PAID: 'paid',
  TRANSACTION_CANCELED: 'refused',
  TRANSACTION_REFUNDED: 'refunded',
  TRANSACTION_CHARGED_BACK: 'chargedback'
};
const METODO_UTMIFY = {
  PIX: 'pix', CREDIT_CARD: 'credit_card', BOLETO: 'boleto'
};

async function enviarParaUtmify({ evento, transacao, cliente, track, itens, req }) {
  const token = (process.env.UTMIFY_API_TOKEN || '').trim();
  if (!token) return;

  const situacao = STATUS_UTMIFY[evento];
  if (!situacao) return;                       // evento que a UTMify não modela
  if (!transacao || !transacao.id) return;

  /* UMA SÓ ORIGEM MANDA PARA A UTMIFY.

     MEDIDO EM 25/08/2026, com o marcador &via=api já no ar. Para UMA transação e
     UM único status, o log mostrou QUATRO entregas:

         origem: callbackUrl da API  -> entrega repetida ignorada
         origem: webhook do painel   -> enviado 200
         origem: callbackUrl da API  -> entrega repetida ignorada
         origem: webhook do painel   -> enviado 200

     Ou seja: os dois webhooks disparam (isso o marcador provou), e a trava de
     memória logo abaixo só resolve dentro de uma instância. As duas entregas do
     painel caíram em INSTÂNCIAS DIFERENTES da função, cada uma achou que era a
     primeira, e a UTMify recebeu o mesmo pedido duas vezes. Daí as notificações
     de "Venda aprovada!" chegando em pares no celular.

     A correção não pode depender de memória compartilhada, que não existe aqui.
     Então é por regra: **só a entrega do webhook do painel manda para a UTMify.**

     Por que o do painel e não o do callbackUrl:
       - o do painel cobre TODOS os produtos e os 5 eventos, incluindo venda pelo
         checkout hospedado — que o "API CallbackURL" não cobre;
       - o do callbackUrl só existe para cobrança criada pela nossa página.
     Escolher o outro cegaria as vendas do fallback.

     Cobrança criada ANTES do marcador entrar no ar não tem `via=api` em entrega
     nenhuma, então as duas passam como "painel" e a trava de memória segue como
     segunda linha. É o comportamento de antes para elas — não piora nada, e some
     sozinho conforme essas cobranças terminam.

     DEPENDÊNCIA QUE PRECISA FICAR DE PÉ: se o webhook "LP Ritual da Pele -
     Purchase" for apagado do painel da Korvex, a UTMify para de receber pedido.
     Ele passou a ser a única origem. */
  if (req && req.query && req.query.via === 'api') {
    console.log('[utmify] ignorado — entrega do callbackUrl da API |', transacao.id, situacao,
      '| quem manda para a UTMify e o webhook do painel');
    return;
  }

  /* Uma transação por situação. O mesmo pedido PODE e DEVE ser mandado de novo
     quando a situação muda (waiting_payment -> paid): aí é atualização, não
     duplicata. O que a trava barra é a MESMA situação chegando duas vezes.
     Continua valendo como segunda linha, para cobrança antiga sem marcador. */
  const chaveEnvio = transacao.id + ':' + situacao;
  if (!reservarEnvio(chaveEnvio)) {
    console.log('[utmify] entrega repetida ignorada |', chaveEnvio);
    return;
  }

  const centavos = (v) => Math.round((Number(v) || 0) * 100);
  const total = centavos(transacao.amount);
  // `commissionAmount` é o líquido do produtor. Sem ele, assume-se que não há
  // taxa — melhor do que mandar 0, que a documentação proíbe.
  const liquido = transacao.commissionAmount != null ? centavos(transacao.commissionAmount) : total;

  const produtos = (itens.length ? itens : [{ id: 'kit', price: transacao.amount, product: {} }])
    .map((i) => {
      const p = (i && i.product) || {};
      return {
        id: String(p.externalId || p.id || i.id || 'kit'),
        name: String(p.name || 'Kit Protocolo Clareador'),
        planId: null,
        planName: null,
        quantity: Number(i.quantity) || 1,
        priceInCents: centavos(i.price != null ? i.price : transacao.amount)
      };
    });

  const corpoUtmify = {
    orderId: String(transacao.id),
    platform: 'Korvex',
    paymentMethod: METODO_UTMIFY[String(transacao.paymentMethod || '').toUpperCase()] || 'pix',
    status: situacao,
    createdAt: dataUtmify(transacao.createdAt) || dataUtmify(new Date().toISOString()),
    approvedDate: dataUtmify(transacao.payedAt || transacao.paidAt),
    refundedAt: dataUtmify(transacao.refundedAt),
    customer: {
      name: String(cliente.name || 'Cliente'),
      email: String(cliente.email || ''),
      phone: cliente.phone ? String(cliente.phone).replace(/\D/g, '') : null,
      document: cliente.cpf || cliente.cnpj ? String(cliente.cpf || cliente.cnpj).replace(/\D/g, '') : null,
      country: 'BR',
      ip: track.ip || undefined
    },
    products: produtos,
    // O ponto de toda a operação: as UTMs que a Korvex não entrega sozinha.
    trackingParameters: {
      src: track.src || null,
      sck: track.sck || null,
      utm_source: track.utm_source || null,
      utm_campaign: track.utm_campaign || null,
      utm_medium: track.utm_medium || null,
      utm_content: track.utm_content || null,
      utm_term: track.utm_term || null
    },
    commission: {
      totalPriceInCents: total,
      gatewayFeeInCents: Math.max(0, total - liquido),
      userCommissionInCents: liquido,
      currency: String(transacao.currency || 'BRL').toUpperCase()
    }
  };
  // ?utmifyTest=1 valida o formato sem salvar o pedido no painel.
  if (req && req.query && req.query.utmifyTest) corpoUtmify.isTest = true;

  const parar = new AbortController();
  const cron = setTimeout(() => parar.abort(), 6000);
  try {
    const r = await fetch(UTMIFY_URL, {
      method: 'POST',
      headers: { 'Content-Type': 'application/json', 'x-api-token': token },
      body: JSON.stringify(corpoUtmify),
      signal: parar.signal
    });
    const texto = (await r.text()).slice(0, 300);
    // Falhou: solta a chave para que a Korvex possa reenviar de verdade.
    if (!r.ok) {
      soltarEnvio(chaveEnvio);
      // Em falha, registra o TAMANHO do token (nunca o valor): separa
      // "não colaram nada" e "colaram cortado" de "colaram errado".
      console.error('[utmify] token com', token.length, 'caracteres — confira se bate com o do painel');
    }
    const temUtm = !!(track.utm_source || track.utm_campaign);
    console.log('[utmify]', r.ok ? 'enviado' : 'RECUSADO', r.status,
      '| pedido', corpoUtmify.orderId, '| status', situacao,
      '| utm_source', track.utm_source || '(vazio)',
      '| com utm?', temUtm, '->', texto);
  } catch (e) {
    // Rede caiu ou estourou o tempo: solta a chave, senão o reenvio da Korvex
    // seria ignorado pela trava e o pedido nunca chegaria.
    soltarEnvio(chaveEnvio);
    // Falha aqui nunca pode derrubar o webhook: o Purchase da Meta é mais
    // importante que o relatório, e a Korvex reenviaria tudo de novo.
    console.error('[utmify] falhou:', e.name === 'AbortError' ? 'tempo esgotado' : e.message);
  } finally {
    clearTimeout(cron);
  }
}

/* Só TRANSACTION_PAID vira Purchase.
   CREATED é cobrança gerada, não venda — contar isso infla o pixel com gente que
   só olhou o QR Code e nunca pagou, e a Meta passa a otimizar para esse público.
   REFUNDED e CHARGED_BACK precisariam de evento próprio; hoje são ignorados. */
const EVENTO_PAGO = 'TRANSACTION_PAID';
const STATUS_PAGO = ['COMPLETED', 'PAID', 'APPROVED'];

/* ------------------------------------------------------------------ handler */

module.exports = async function handler(req, res) {
  if (req.method !== 'POST') {
    return res.status(405).json({ erro: 'use POST' });
  }

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  if (!corpo || typeof corpo !== 'object') corpo = {};

  /* Sem isso qualquer pessoa que descubra a URL consegue inventar vendas no seu pixel.
   *
   * O segredo pode chegar por três caminhos, e é preciso testar OS TRÊS:
   *
   *   corpo.token                  o que a Korvex manda por conta própria
   *   ?k=                          o que nós penduramos no callbackUrl
   *   header x-webhook-secret      se algum dia for configurado assim
   *
   * A primeira versão fazia `corpo.token || req.query.k || header` e comparava só
   * o primeiro que existisse. Como a Korvex SEMPRE manda um `token` — que é o
   * token DELA, não o nosso KORVEX_WEBHOOK_SECRET — o `?k=` nunca era consultado
   * e todo webhook levava 401. Os logs mostravam três recusas seguidas por
   * cobrança, com "origem do segredo: corpo.token".
   *
   * Agora vale se QUALQUER um dos três bater. Continua sendo segredo compartilhado:
   * quem não tem nenhum dos valores certos não passa. */
  const segredo = process.env.KORVEX_WEBHOOK_SECRET;
  const candidatos = [
    ['corpo.token', corpo.token],
    ['query', req.query.k],
    ['header', req.headers['x-webhook-secret']]
  ].filter(([, v]) => v);
  const aceito = candidatos.find(([, v]) => segredoConfere(v, segredo));

  /* ---- segunda via de autenticação: perguntar para a própria Korvex ----
   *
   * Existem DOIS caminhos de venda, e só um carrega o nosso segredo:
   *
   *   A) checkout na página → /api/criar-pix define callbackUrl com ?k=SEGREDO
   *      → o webhook chega autenticado. Funciona.
   *
   *   B) checkout hospedado (para onde a página cai quando a API da Korvex está
   *      fora) → a transação é criada por ELA, sem o nosso callbackUrl. O
   *      webhook sai para a URL configurada no painel, com o `token` DELA no
   *      corpo — que não é o nosso KORVEX_WEBHOOK_SECRET. Resultado: 401, e o
   *      Purchase dessa venda nunca chegava na Meta.
   *
   * Em 24/08/2026 a API ficou fora por um intervalo e toda compra nesse período
   * passou pelo caminho B. É a explicação mais provável para "2 vendas reais,
   * 1 Purchase na Meta".
   *
   * Em vez de exigir que o painel seja reconfigurado, quando nenhum segredo bate
   * a gente confirma a transação na fonte: consulta o id na API da Korvex com as
   * NOSSAS chaves. Se ela responder que existe e está paga, o evento é
   * verdadeiro — não dá para forjar, porque o atacante teria que adivinhar o id
   * de uma transação real e paga da conta, e nesse caso o Purchase seria fato
   * de qualquer forma. */
  async function confirmadoNaKorvex(idTransacao) {
    const publica = process.env.KORVEX_PUBLIC_KEY;
    const secreta = process.env.KORVEX_SECRET_KEY;
    if (!publica || !secreta || !idTransacao) return false;
    const parar = new AbortController();
    // Curto de propósito: já vimos a API da Korvex travar 30s. O webhook não
    // pode ficar pendurado — a Korvex reenvia se a gente devolver erro.
    const cron = setTimeout(() => parar.abort(), 8000);
    try {
      const r = await fetch(KORVEX_API + '/gateway/transactions?id=' + encodeURIComponent(idTransacao), {
        headers: {
          'User-Agent': UA_PRYON,
          'Accept': 'application/json',
          'x-public-key': publica, 'x-secret-key': secreta
        },
        signal: parar.signal
      });
      if (!r.ok) return false;
      const t = await r.json();
      return String(t && t.status || '').toUpperCase() === 'COMPLETED';
    } catch (e) {
      console.error('[capi] nao deu para confirmar na korvex:', e.message);
      return false;
    } finally {
      clearTimeout(cron);
    }
  }

  let comoAutenticou = aceito ? aceito[0] : null;
  if (!aceito) {
    const idT = (corpo.transaction && corpo.transaction.id) || null;
    const confere = await confirmadoNaKorvex(idT);
    if (!confere) {
      console.warn('[capi] webhook recusado — nenhum segredo bateu e a Korvex não confirmou a transação.',
        'candidatos presentes:', candidatos.map(([nome]) => nome).join(', ') || 'nenhum',
        '| transaction.id:', idT || '(ausente)');
      return res.status(401).json({ erro: 'segredo invalido' });
    }
    comoAutenticou = 'confirmacao na korvex';
  }
  /* Ver o comentário do &via=api em api/criar-pix.js. "callbackUrl da API" e
     "webhook do painel" é o que permite decidir qual dos dois registros pode ser
     removido para acabar com a entrega dupla. */
  const origemEntrega = (req.query && req.query.via === 'api')
    ? 'callbackUrl da API' : 'webhook do painel';
  console.log('[capi] webhook autenticado por', comoAutenticou, '| origem:', origemEntrega);

  const token = process.env.META_CAPI_TOKEN;
  if (!token) {
    console.error('[capi] META_CAPI_TOKEN nao configurado');
    return res.status(200).json({ ok: false, motivo: 'token ausente' });
  }

  // Fica no log da Vercel. O segredo é removido antes: log de produção não é lugar
  // de guardar credencial, e esse log é lido justamente quando algo deu errado.
  const paraLog = Object.assign({}, corpo, { token: '[removido]' });
  console.log('[capi] payload recebido:', JSON.stringify(paraLog).slice(0, 4000));

  const cliente = corpo.client || {};
  const endereco = cliente.address || {};
  const transacao = corpo.transaction || {};
  const track = corpo.trackProps || {};
  const itens = Array.isArray(corpo.orderItems) ? corpo.orderItems : [];

  /* ---- é uma venda paga? ---- */
  const evento = String(corpo.event || achar(corpo, ['event', 'evento']) || '').toUpperCase();
  const status = String(transacao.status || achar(corpo, ['status', 'payment_status']) || '').toUpperCase();

  /* ---- UTMify ----
     Antes de decidir se é venda paga: a UTMify quer o pedido nos dois momentos
     (Pix gerado e Pix pago), então este envio acontece para todos os eventos. */
  await enviarParaUtmify({ evento, transacao, cliente, track, itens, req });

  const pago = evento === EVENTO_PAGO || (!evento && STATUS_PAGO.includes(status));
  if (!pago) {
    console.log('[capi] ignorado — event =', evento || '(vazio)', 'status =', status || '(vazio)');
    return res.status(200).json({ ok: true, ignorado: evento || status || 'desconhecido' });
  }

  /* ---- identidade do evento ----
     transaction.id, sempre. Nunca client.id: duas compras do mesmo cliente
     sairiam com o mesmo event_id e a Meta jogaria a segunda fora. */
  const pedidoId = transacao.id || transacao.identifier
    || achar(corpo, ['transaction_id', 'order_id', 'reference'])
    || ('sem-id-' + Date.now());

  const valor = normalizarValor(
    transacao.amount !== undefined ? transacao.amount : achar(corpo, ['amount', 'value', 'total', 'valor'])
  );
  const moeda = String(transacao.currency || achar(corpo, ['currency', 'moeda']) || 'BRL').toUpperCase();

  // Horário do pagamento, não o de agora. A Meta usa event_time na janela de
  // atribuição; se a Korvex reenviar o webhook horas depois, `Date.now()` jogaria
  // a venda para fora da janela do clique que a gerou.
  const pagoEm = transacao.payedAt || transacao.paidAt || transacao.createdAt;
  const quandoMs = pagoEm ? Date.parse(pagoEm) || Date.now() : Date.now();

  /* ---- identificadores do comprador ----
     Ordem importa: o fbc pronto (montado pelo pixel e repassado pela Korvex em
     trackProps) vale mais que o fbclid cru, porque carrega o índice de subdomínio
     e o horário do clique de verdade. O fbclid só entra se o fbc não tiver vindo. */
  const fbcBruto = track.fbc || achar(corpo, ['fbc', '_fbc']) || achar(corpo, ['fbclid']);

  const user_data = Object.assign(
    {
      em: hashEmail(cliente.email || achar(corpo, ['email', 'customer_email'])),
      ph: hashPhone(cliente.phone || track.entrega_telefone || achar(corpo, ['phone', 'telefone', 'celular'])),
      /* Cidade, estado, CEP e país sobem o match rate e saem de graça do payload.
         Em venda pelo checkout interno eles vêm em client.address. Em venda por
         API o client.address vem NULL — conferido no payload real de 23/08/2026 —
         e o endereço está no metadata que nós mesmos mandamos, que a Korvex
         devolve dentro de trackProps. Sem este fallback, toda venda pela nossa
         página perderia três campos de pareamento. */
      ct: hashSimples(endereco.city || track.entrega_cidade),
      st: hashSimples(endereco.state || track.entrega_uf),
      zp: hashSimples(endereco.zipCode || track.entrega_cep),
      country: hashSimples(endereco.country || track.country || 'BR'),
      // CPF como external_id: identificador estável do comprador, sem PII em claro.
      external_id: cliente.cpf ? sha256(String(cliente.cpf).replace(/\D/g, '')) : undefined,
      // Têm que ser os do COMPRADOR, não os do servidor. A Korvex manda os dois.
      client_ip_address: track.ip || achar(corpo, ['ip', 'client_ip']) || undefined,
      client_user_agent: track.user_agent || achar(corpo, ['user_agent', 'useragent']) || undefined,
      fbc: montarFbc(fbcBruto, quandoMs) || undefined,
      fbp: track.fbp || achar(corpo, ['fbp', '_fbp']) || undefined
    },
    partesDoNome(cliente.name || track.entrega_destinatario || achar(corpo, ['name', 'nome', 'customer_name']))
  );
  Object.keys(user_data).forEach((k) => { if (!user_data[k]) delete user_data[k]; });

  /* ---- conteúdo ---- */
  const content_ids = itens
    .map((i) => (i && i.product && (i.product.externalId || i.product.id)) || (i && i.id))
    .filter(Boolean)
    .map(String);
  const num_items = itens.reduce((s, i) => s + (Number(i && i.quantity) || 1), 0) || 1;

  const custom_data = {
    currency: moeda,
    value: valor != null ? valor : undefined,
    content_type: 'product',
    content_ids: content_ids.length ? content_ids : (corpo.offerCode ? [String(corpo.offerCode)] : undefined),
    content_name: (itens[0] && itens[0].product && itens[0].product.name) || undefined,
    num_items
  };
  Object.keys(custom_data).forEach((k) => { if (custom_data[k] === undefined) delete custom_data[k]; });

  const eventoCapi = {
    event_name: 'Purchase',
    event_time: Math.floor(quandoMs / 1000),
    // Mesmo id do pedido = se um dia o Purchase também vier pelo navegador, a Meta
    // conta uma vez só em vez de duplicar o faturamento.
    event_id: String(pedidoId),
    action_source: 'website',
    // Sempre o nosso domínio (ver urlDoEvento). checkoutUrl aponta para a
    // Korvex em venda pelo hospedado, e domínio não verificado não atribui.
    event_source_url: urlDoEvento(track),
    user_data,
    custom_data
  };

  const payload = { data: [eventoCapi] };
  const codigoTeste = req.query.test || process.env.META_TEST_EVENT_CODE;
  if (codigoTeste) payload.test_event_code = codigoTeste;

  // Simulação: mostra o que sairia, sem mandar. Nenhum dado sensível volta na resposta —
  // os identificadores já estão em hash e o token nunca entra no corpo.
  if (req.query.dry) {
    return res.status(200).json({
      ok: true,
      modo: 'simulacao',
      token_configurado: true,
      // Ajuda a conferir de bate-pronto o que costuma faltar.
      diagnostico: {
        pedido: String(pedidoId),
        valor,
        tem_fbc: !!user_data.fbc,
        tem_fbp: !!user_data.fbp,
        tem_email: !!user_data.em,
        tem_telefone: !!user_data.ph,
        tem_endereco: !!(user_data.ct && user_data.st && user_data.zp),
        campos_de_match: Object.keys(user_data).length,
        event_source_url: eventoCapi.event_source_url,
        checkout_url_recebida: corpo.checkoutUrl || '(vazia)'
      },
      enviaria: payload
    });
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
      console.log('[capi] enviado', pedidoId, 'valor', valor, 'fbc', !!user_data.fbc,
        'campos_match', Object.keys(user_data).length, '->', texto.slice(0, 300));
      let recebidos = null;
      try { recebidos = JSON.parse(texto).events_received; } catch (e) {}
      return res.status(200).json({ ok: true, pedido: pedidoId, click_id: !!user_data.fbc, events_received: recebidos });
    }

    // 4xx é erro de configuração (token, permissão, payload): reenviar não conserta e
    // só faria a Korvex martelar o endpoint. 5xx é passageiro — devolvemos erro para
    // a Korvex tentar de novo, que é o "retry" possível sem manter fila própria.
    console.error('[capi] meta recusou', r.status, texto.slice(0, 500));
    return res.status(r.status >= 500 ? 502 : 200).json({ ok: false, status: r.status });
  } catch (e) {
    console.error('[capi] falha de rede:', e.message);
    return res.status(502).json({ ok: false, erro: 'falha de rede' });
  }
};
