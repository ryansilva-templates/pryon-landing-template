// Diz para a página se o Pix já foi pago, para a tela virar sozinha em
// "pagamento confirmado" sem a cliente precisar atualizar nada.
//
// CUIDADO COM A FREQUÊNCIA. A Korvex bloqueia consulta repetida:
//
//   { "error": { "code": "TOO_MANY_REQUESTS",
//                "message": "Tentativa de polling bloqueada. Receba atualizações via webhook." } }
//
// (https://app.korvex.com.br/docs/faq/polling-blocked). A confirmação DE VERDADE
// é o webhook — é ele que dispara o Purchase e é ele que a Korvex garante. Esta
// rota existe só para a tela reagir enquanto a cliente ainda está olhando, e por
// isso ela:
//
//   - guarda em memória o que já perguntou, por 8s, para várias abas ou um
//     retry do navegador não virarem várias chamadas à Korvex;
//   - devolve `aguarde: true` quando a Korvex bloqueia, e o front aumenta o
//     intervalo em vez de insistir;
//   - nunca é a fonte da verdade do faturamento. Se ela falhar, a venda continua
//     acontecendo e o Purchase continua saindo pelo webhook.
//
// O cache é por instância quente da função. Não é um banco: some quando a Vercel
// recicla o processo. Serve só para amortecer rajada, que é o que ele precisa
// fazer.

const PRODUTO_UA = require('../config/produto.js');
/* User-Agent que a Korvex vê nos nossos requests. Sai do config para uma cópia
   do template não se identificar como outra loja. */
const UA_PRYON = 'PryonLanding/1.0 (+' + PRODUTO_UA.seo.dominio + '; contato ' + PRODUTO_UA.marca.email + ')';

const KORVEX_API = 'https://app.korvex.com.br/api/v1';
const CACHE_MS = 8000;
const cache = new Map();

const PAGO = 'COMPLETED';
const FINAIS = ['COMPLETED', 'FAILED', 'REFUNDED', 'CHARGED_BACK'];

function limparCache(agora) {
  // Sem isso o Map cresce sem limite numa instância que fica quente muito tempo.
  if (cache.size < 500) return;
  for (const [k, v] of cache) if (agora - v.quando > CACHE_MS) cache.delete(k);
}

module.exports = async function handler(req, res) {
  if (req.method !== 'GET') return res.status(405).json({ erro: 'use GET' });

  const id = String((req.query && req.query.id) || '').trim();
  // Ids da Korvex são alfanuméricos; recusar o resto evita virar proxy de URL.
  if (!id || id.length > 64 || !/^[A-Za-z0-9_-]+$/.test(id)) {
    return res.status(400).json({ ok: false, erro: 'id invalido' });
  }

  const publica = process.env.KORVEX_PUBLIC_KEY;
  const secreta = process.env.KORVEX_SECRET_KEY;
  if (!publica || !secreta) return res.status(503).json({ ok: false, motivo: 'sem credenciais' });

  const agora = Date.now();
  const guardado = cache.get(id);
  if (guardado && agora - guardado.quando < CACHE_MS) {
    return res.status(200).json(Object.assign({ cache: true }, guardado.resposta));
  }
  limparCache(agora);

  try {
    const r = await fetch(KORVEX_API + '/gateway/transactions?id=' + encodeURIComponent(id), {
      headers: {
        'User-Agent': UA_PRYON,
        'Accept': 'application/json',
        'x-public-key': publica, 'x-secret-key': secreta
      }
    });
    const bruto = await r.text();
    let dados = {};
    try { dados = JSON.parse(bruto); } catch (e) { dados = {}; }

    // Polling bloqueado: não é erro do pedido. A tela continua esperando e o
    // front espaça as próximas perguntas.
    const codigo = dados && dados.error && dados.error.code;
    if (r.status === 429 || codigo === 'TOO_MANY_REQUESTS') {
      const resposta = { ok: true, status: 'PENDING', pago: false, aguarde: true };
      cache.set(id, { quando: agora, resposta });
      return res.status(200).json(resposta);
    }

    if (!r.ok) {
      console.error('[status] korvex', r.status, bruto.slice(0, 200));
      return res.status(200).json({ ok: false, status: 'PENDING', pago: false, aguarde: true });
    }

    const status = String(dados.status || 'PENDING').toUpperCase();
    const resposta = {
      ok: true,
      status,
      pago: status === PAGO,
      final: FINAIS.includes(status)
    };
    cache.set(id, { quando: agora, resposta });
    return res.status(200).json(resposta);
  } catch (err) {
    console.error('[status] falha de rede:', err.message);
    return res.status(200).json({ ok: false, status: 'PENDING', pago: false, aguarde: true });
  }
};
