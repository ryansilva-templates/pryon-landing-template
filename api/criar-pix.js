// Cria a cobrança Pix na Korvex e devolve o código copia-e-cola para a própria
// página desenhar. É o que tira o checkout de fora do site: a cliente não sai
// mais de ritualdapele.vercel.app para pagar.
//
// Por que existe (e por que não existia antes): a documentação da Korvex
// (https://app.korvex.com.br/docs) expõe POST /gateway/pix/receive. A decisão
// anterior do projeto — "a Korvex não tem API, só checkout hospedado" — estava
// errada, e foi ela que empurrou a venda para outro domínio.
//
// O QUE ESTE ARQUIVO PROTEGE
//
//   1. O preço. A tabela abaixo é a fonte no servidor. O navegador manda só o
//      `offerId`; se ele mandasse o valor, qualquer pessoa com o console aberto
//      compraria o kit de 3 por R$ 1,00.
//   2. As chaves. x-public-key / x-secret-key nunca chegam ao navegador.
//   3. O endereço. A API de Pix da Korvex NÃO tem campo de endereço — o objeto
//      `client` só aceita nome, e-mail, telefone e documento. Como o produto é
//      físico, o endereço vai em `metadata`, e é de lá que ele sai na hora de
//      expedir (aparece no painel junto do pedido e no corpo do webhook).
//
// Variáveis de ambiente (Vercel → Settings → Environment Variables):
//   KORVEX_PUBLIC_KEY       chave pública da API     (obrigatória)
//   KORVEX_SECRET_KEY       chave secreta da API     (obrigatória, secreta)
//   KORVEX_WEBHOOK_SECRET   segredo do webhook       (obrigatória)
//
// Sem as duas primeiras esta rota devolve 503 com `motivo: "sem credenciais"`,
// e a página cai sozinha no fluxo antigo de redirect. Isso é de propósito: é
// melhor a cliente ir para a Korvex do que encontrar um checkout morto.

const QRCode = require('qrcode');
const PRODUTO_UA = require('../config/produto.js');
/* User-Agent que a Korvex ve nos nossos requests. Sai do config para uma
   copia do template nao se identificar como outra loja. */
const UA_PRYON = 'PryonLanding/1.0 (+' + PRODUTO_UA.seo.dominio + '; contato ' + PRODUTO_UA.marca.email + ')';

const KORVEX_API = 'https://app.korvex.com.br/api/v1';

/* Um só User-Agent para TODA chamada à Korvex. Sonda e venda precisam mandar
   exatamente os mesmos headers: quando divergiram, a sonda levou 403 do
   Cloudflare, a venda não, e o projeto desligou o checkout da página por um
   bloqueio que não existia. */
const UA_KORVEX = UA_PRYON;
const BASE_URL = 'https://ritualdapele.vercel.app';

/* ---------------------------------------------------------------- catálogo */

/* O PREÇO NÃO MORA MAIS AQUI — vem de ../catalogo.js, que é a fonte única.

   Até 31/08/2026 esta tabela era uma cópia à mão do bloco KORVEX do
   src/app.js, com um comentário pedindo que alguém lembrasse de sincronizar os
   dois. Não foi lembrado: no arredondamento de 30/08 só o src/ mudou, e a
   página passou a mostrar R$ 37,90 enquanto ESTE arquivo mandava R$ 38,14 para
   a Korvex. Toda oferta ficou errada, e o frete expresso cobrava 12,90
   anunciado a 9,90.

   O que continua igual, e é o ponto: o navegador manda só o `offerId`. O preço
   é resolvido AQUI, no servidor. Se viesse do cliente, qualquer um com o
   console aberto compraria o kit de 3 por R$ 1,00. A correção foi tirar a
   duplicata, não afrouxar a validação. */
const CATALOGO = require('../catalogo.js');

const OFERTAS = Object.fromEntries(
  Object.entries(CATALOGO.OFERTAS).map(([id, o]) => [
    id,
    { nome: o.nome, unidades: o.unidades, preco: CATALOGO.emReais(o.centavos) }
  ])
);
const FRETE_EXPRESSO = CATALOGO.emReais(CATALOGO.FRETE_EXPRESSO_CENTAVOS);

/* ------------------------------------------- lembrança de falha no servidor */

/* Por que isto existe: até 25/08/2026 a sonda de capacidade (GET sem ?ping)
   respondia só `!!(chave publica && chave secreta)` — ou seja, "tem chave
   configurada", não "dá para vender". Com a origem barrada pelo Cloudflare da
   Korvex (403 em toda criação de cobrança), a resposta continuava `ativo:true`,
   a página montava o formulário completo, e CADA visitante novo digitava nome,
   e-mail, CPF, telefone e endereço para só então descobrir — depois de até 18s
   de espera — que ia ser mandado ao checkout hospedado preencher tudo de novo.

   O `sessionStorage` do navegador já guardava essa decepção, mas só depois de
   ela acontecer: não protegia a primeira tentativa, que é a de todo mundo que
   chega pelo anúncio. (O comentário no src/app.js dizia que "o servidor também
   guarda isso" — não guardava. Agora guarda.)

   Como funciona: quem alimenta esta memória é o tráfego que já existe. Nenhuma
   chamada nova à Korvex é feita para descobrir o estado dela — foi justamente
   um laço de sonda de 3 em 3 minutos que disparou o antibot e criou o bloqueio.
   Uma tentativa de venda que volta 403/429/5xx desliga o Pix da página pelos
   próximos 10 minutos; uma que dá certo religa na hora.

   Limite conhecido: a memória vive na instância quente da função. Instância
   nova começa sem saber de nada e ainda gasta uma tentativa para aprender. Isso
   reduz o vazamento, não zera. Para zerar enquanto o bloqueio durar, existe a
   chave KORVEX_PIX_DESLIGADO logo abaixo. */

const FALHA_LEMBRADA_MS = 10 * 60 * 1000;
let ultimaFalha = 0;
let motivoFalha = '';

function lembrarFalha(motivo) {
  ultimaFalha = Date.now();
  motivoFalha = motivo;
}
function lembrarSucesso() {
  ultimaFalha = 0;
  motivoFalha = '';
}
function falhouHaPouco() {
  return ultimaFalha > 0 && (Date.now() - ultimaFalha) < FALHA_LEMBRADA_MS;
}

/* Desligamento manual. Serve para quando já se SABE que a criação de cobrança
   está fora (o bloqueio de origem é o caso) e não se quer gastar nem a primeira
   tentativa de cada instância para redescobrir isso.

   vercel env add KORVEX_PIX_DESLIGADO production   → valor: 1

   É uma chave que precisa ser removida à mão depois. Deixada para trás, ela
   mantém a venda fora do domínio sem ninguém perceber — que é exatamente o
   erro que já custou semanas a este projeto. A memória acima se cura sozinha;
   esta não. Use enquanto o bloqueio durar e apague quando ele sair. */
/* ------------------------------------------------- leitura do BR Code (EMV)

   O código Pix copia-e-cola é TLV: campos de ID(2) + tamanho(2) + valor, um
   atrás do outro. Só precisamos do campo 54 (valor da transação), que fica no
   nível de cima — não há necessidade de descer nos campos aninhados.

   Anda de campo em campo pelo tamanho declarado, em vez de procurar "54" com
   regex: o texto "54" aparece dentro de chave Pix, cidade e identificador o
   tempo todo, e uma busca ingênua leria valor errado com facilidade. */
function lerCampoEmv(brcode, idProcurado) {
  const s = String(brcode || '');
  let i = 0;
  while (i + 4 <= s.length) {
    const id = s.slice(i, i + 2);
    const tam = parseInt(s.slice(i + 2, i + 4), 10);
    if (!Number.isInteger(tam) || tam < 0) return null;   // código malformado
    const inicio = i + 4;
    const fim = inicio + tam;
    if (fim > s.length) return null;
    if (id === idProcurado) return s.slice(inicio, fim);
    i = fim;
  }
  return null;
}

function pixDesligadoNaMao() {
  return /^(1|true|sim)$/i.test(String(process.env.KORVEX_PIX_DESLIGADO || '').trim());
}

/* ------------------------------------------------------------------- QR Code

   POR QUE O SERVIDOR GERA O QR.

   A Korvex devolve `pix.image: null` — sempre, na prática (reconferido em
   25/08/2026 numa cobrança real). Sem imagem, o `mostrarPix` do src/app.js caía
   no ramo de emergência e mostrava, na tela do Pix, o link
   "Abrir o QR Code numa aba nova →" apontando para checkout.korvex.com.br.

   Ou seja: no caminho feliz, em toda venda, a única forma de ver o QR era SAIR
   do nosso site. É o oposto do que o checkout na página existe para fazer, e
   some com a cliente no meio do pagamento.

   Gerando aqui, o `pix.image` chega preenchido e o primeiro ramo do
   `mostrarPix` assume sozinho: desenha a imagem e esconde o link. Não foi
   preciso mexer no src/ nem no markup do checkout.

   SVG em vez de PNG: fica nítido em tela retina, pesa ~1-2KB e é texto, então
   entra na resposta JSON sem inchar. Nível de correção M é o usado para Pix.

   Se a geração falhar por qualquer motivo, devolvemos null e a página volta ao
   comportamento antigo (o link de emergência). Nunca derrubar a venda por causa
   de uma imagem: o copia-e-cola sozinho já paga. */
async function qrDataUri(texto) {
  try {
    const svg = await QRCode.toString(String(texto), {
      type: 'svg',
      errorCorrectionLevel: 'M',
      margin: 1,
      width: 360
    });
    return 'data:image/svg+xml;base64,' + Buffer.from(svg, 'utf8').toString('base64');
  } catch (err) {
    console.error('[pix] nao deu para gerar o QR:', err.message);
    return null;
  }
}

/* -------------------------------------------------------------- validações */

// CPF com dígito verificador. Sem isso a Korvex recusa a cobrança depois de a
// cliente já ter preenchido tudo — o erro precisa aparecer no campo, na hora.
function cpfValido(v) {
  const c = String(v || '').replace(/\D/g, '');
  if (c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
  for (const [ate, pos] of [[9, 10], [10, 11]]) {
    let soma = 0;
    for (let i = 0; i < ate; i++) soma += Number(c[i]) * (pos - i);
    let d = (soma * 10) % 11;
    if (d === 10) d = 0;
    if (d !== Number(c[ate])) return false;
  }
  return true;
}

const emailValido = (v) => /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(String(v || '').trim());
const soDigitos = (v) => String(v || '').replace(/\D/g, '');
const texto = (v, max) => String(v == null ? '' : v).trim().slice(0, max);

function validar(corpo) {
  const erros = {};
  const c = corpo.cliente || {};
  const e = corpo.endereco || {};

  if (!OFERTAS[corpo.offerId]) erros.offerId = 'oferta desconhecida';
  if (texto(c.nome, 120).split(/\s+/).filter(Boolean).length < 2) erros.nome = 'informe nome e sobrenome';
  if (!emailValido(c.email)) erros.email = 'e-mail inválido';
  const tel = soDigitos(c.telefone);
  if (tel.length < 10 || tel.length > 11) erros.telefone = 'telefone com DDD, 10 ou 11 dígitos';
  if (!cpfValido(c.cpf)) erros.cpf = 'CPF inválido';

  if (soDigitos(e.cep).length !== 8) erros.cep = 'CEP com 8 dígitos';
  if (!texto(e.rua, 120)) erros.rua = 'informe a rua';
  if (!texto(e.numero, 20)) erros.numero = 'informe o número';
  if (!texto(e.bairro, 80)) erros.bairro = 'informe o bairro';
  if (!texto(e.cidade, 80)) erros.cidade = 'informe a cidade';
  if (!/^[A-Za-z]{2}$/.test(texto(e.uf, 2))) erros.uf = 'UF com 2 letras';

  return erros;
}

/* ------------------------------------------------------------------ handler */

module.exports = async function handler(req, res) {
  const publica = process.env.KORVEX_PUBLIC_KEY;
  const secreta = process.env.KORVEX_SECRET_KEY;

  /* Sonda de capacidade. A página pergunta isto antes de abrir o formulário:
     sem chave, pedir nome, CPF e endereço aqui só para depois redirecionar
     faria a cliente digitar tudo duas vezes — e desistir na segunda.
     Devolve só um booleano; nenhuma credencial sai daqui. */
  if (req.method === 'GET') {
    /* ?ping=1 — saúde do endpoint que importa, SEM criar cobrança.
       O GET /ping da Korvex não serve: em 24/08/2026 ele respondia "pong" em
       0,19s enquanto o POST /gateway/pix/receive estourava 504 aos 30s. Ele
       mede o gateway, não a criação de cobrança.
       Aqui mandamos ao próprio pix/receive um corpo propositalmente inválido
       (sem `client`, que é obrigatório). API sã responde 400 na hora e nada é
       criado; API doente estoura o tempo. É a diferença entre "recusou rápido"
       e "não respondeu" que diz se dá para vender. */
    if (req.query.ping) {
      if (!publica || !secreta) return res.status(200).json({ korvex: 'sem credenciais' });

      /* A SONDA PRECISA MANDAR OS MESMOS HEADERS DA VENDA. Este foi o erro que
         custou o checkout na página.

         Até 25/08/2026 esta sonda mandava só Content-Type e as duas chaves —
         SEM User-Agent. O caminho real de venda, logo abaixo, sempre mandou
         `NomeDaLoja/1.0 (+url; contato)`. O Cloudflare da Korvex desafia
         requisição sem User-Agent identificado e devolve 403 `Cf-Mitigated:
         challenge`; com o nosso UA, ele deixa passar. Medido em 25/08/2026, da
         mesma máquina, no mesmo minuto:

             sem User-Agent  -> 403 (challenge)
             UA da loja        -> 400 (a API respondeu: recusou o schema)

         Ou seja: a sonda media uma requisição que a venda nunca faz, e o
         projeto inteiro concluiu "nossa origem está bloqueada" a partir dela.
         Não estava. Se a sonda diverge da venda em qualquer header, ela mede
         outra coisa.

         O corpo vai propositalmente INVÁLIDO (sem `client`, que é obrigatório).
         Assim a sonda nunca cria cobrança — a versão anterior mandava payload
         válido de R$ 0,01 e enchia o painel de pendência de teste. O que esta
         sonda responde é "a API está alcançável", que é a pergunta que importa
         aqui. Saúde da CRIAÇÃO (o 504 de 24/08) quem detecta é a memória de
         falha lá em cima, alimentada por venda real — sem chamada extra. */
      const t0 = Date.now();
      const parar = new AbortController();
      const cron = setTimeout(() => parar.abort(), 12000);
      try {
        const r = await fetch(KORVEX_API + '/gateway/pix/receive', {
          method: 'POST',
          headers: {
            'Content-Type': 'application/json',
            'User-Agent': UA_KORVEX,
            'Accept': 'application/json',
            'x-public-key': publica,
            'x-secret-key': secreta
          },
          body: JSON.stringify({ identifier: 'sonda-' + Date.now().toString(36) }),
          signal: parar.signal
        });
        const ms = Date.now() - t0;
        let corpo = {};
        try { corpo = JSON.parse(await r.text()); } catch (e) {}
        /* 403 = Cloudflare barrando a nossa origem, não saúde da API. Classificar
           isso como "ok" (porque é < 500) cegou o monitor em 25/08/2026: ele
           dizia OK enquanto a criação de cobrança estava toda bloqueada. */
        /* 400/422 aqui é RESPOSTA da API recusando o corpo inválido de
           propósito — prova de que ela está alcançável, não de erro. */
        const bloqueado = r.status === 403 || r.status === 429;
        /* A sonda exercita exatamente o endpoint que a venda usa, então o que
           ela descobre vale para a memória acima — de graça, sem nenhuma
           chamada extra à Korvex. Um 4xx que não seja 403/429 é recusa de
           schema ou de valor mínimo: a API está viva, e isso conta como sucesso. */
        if (bloqueado || r.status >= 500) lembrarFalha('sonda ' + r.status);
        else lembrarSucesso();
        /* CF-RAY e cf-mitigated: quando o 403 vem do Cloudflare e não da Korvex,
           é isto que permite ao suporte DELES achar o evento no painel Cloudflare
           e ver qual regra disparou. Sem o ray, o chamado vira "não há bloqueios"
           de um lado e "está bloqueado" do outro, sem ninguém conseguir provar.
           O ray é público (vem no cabeçalho da resposta) e não é segredo. */
        return res.status(200).json({
          korvex: bloqueado ? 'bloqueado' : (r.status >= 500 ? 'com erro' : 'ok'),
          http: r.status,
          ms,
          cf_ray: r.headers.get('cf-ray') || undefined,
          cf_mitigated: r.headers.get('cf-mitigated') || undefined,
          servidor: r.headers.get('server') || undefined,
          quando: new Date().toISOString(),
          criouCobranca: !!corpo.transactionId,
          transactionId: corpo.transactionId || undefined,
          detalhe: corpo.message ? String(corpo.message).slice(0, 120) : undefined
        });
      } catch (err) {
        const ms = Date.now() - t0;
        const abortou = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
        lembrarFalha(abortou ? 'sonda estourou o tempo' : 'sonda sem rede');
        return res.status(200).json({ korvex: abortou ? 'fora' : 'erro de rede', ms });
      } finally {
        clearTimeout(cron);
      }
    }
    /* "ativo" quer dizer "vale a pena pedir os dados aqui", não "tem chave
       configurada". Chave sem API que responda é um formulário que não leva a
       lugar nenhum. */
    const temChave = !!(publica && secreta);
    const naMao = pixDesligadoNaMao();
    const recente = falhouHaPouco();
    return res.status(200).json({
      ativo: temChave && !naMao && !recente,
      motivo: !temChave ? 'sem credenciais'
            : naMao ? 'desligado na mao'
            : recente ? ('falha recente: ' + motivoFalha)
            : undefined
    });
  }
  if (req.method !== 'POST') return res.status(405).json({ erro: 'use POST' });
  if (!publica || !secreta) {
    // A página entende este código e volta para o redirect sem mostrar erro.
    console.warn('[pix] KORVEX_PUBLIC_KEY/KORVEX_SECRET_KEY ausentes — caindo para o redirect');
    return res.status(503).json({ ok: false, motivo: 'sem credenciais' });
  }

  let corpo = req.body;
  if (typeof corpo === 'string') { try { corpo = JSON.parse(corpo); } catch (e) { corpo = {}; } }
  if (!corpo || typeof corpo !== 'object') corpo = {};

  const erros = validar(corpo);
  if (Object.keys(erros).length) return res.status(400).json({ ok: false, erros });

  const oferta = OFERTAS[corpo.offerId];
  const expresso = corpo.frete === 'expresso';
  const frete = expresso ? FRETE_EXPRESSO : 0;

  /* amount = soma dos produtos + frete (documentação da Korvex, "Cálculo do
     valor da transação").

     A SOMA É FEITA EM CENTAVOS, com inteiros, e só vira reais no fim. Somar
     reais em float dá lixo — 37.9 + 9.9 é 47.800000000000004 em JavaScript — e
     esse lixo iria direto para o `amount` da cobrança. O arredondamento
     posterior salvava na prática, mas dependia de um detalhe do float; em
     inteiro não há do que depender. */
  const centavosOferta = CATALOGO.OFERTAS[corpo.offerId].centavos;
  const centavosFrete = expresso ? CATALOGO.FRETE_EXPRESSO_CENTAVOS : 0;
  const total = CATALOGO.emReais(centavosOferta + centavosFrete);

  const c = corpo.cliente;
  const e = corpo.endereco;
  const t = corpo.tracking || {};

  // Identificador nosso, único por tentativa. Vai no `identifier` e é o que
  // permite reconciliar pedido daqui com transação de lá.
  const pedidoId = 'hb-' + Date.now().toString(36) + '-' + Math.random().toString(36).slice(2, 8);

  const enderecoTexto =
    `${texto(e.rua, 120)}, ${texto(e.numero, 20)}` +
    (texto(e.complemento, 60) ? ' - ' + texto(e.complemento, 60) : '') +
    ` | ${texto(e.bairro, 80)} | ${texto(e.cidade, 80)}/${texto(e.uf, 2).toUpperCase()}` +
    ` | CEP ${soDigitos(e.cep)}`;

  const requisicao = {
    identifier: pedidoId,
    amount: total,
    shippingFee: frete || undefined,
    client: {
      name: texto(c.nome, 120),
      email: texto(c.email, 160).toLowerCase(),
      phone: soDigitos(c.telefone),
      document: soDigitos(c.cpf)
    },
    products: [{
      id: corpo.offerId,
      name: oferta.nome,
      quantity: 1,
      price: oferta.preco,
      physical: true
    }],
    // A API não tem campo de endereço. Ele vive aqui — e é daqui que sai a
    // etiqueta. `provider` e `orderId` são obrigatórios dentro de metadata.
    metadata: {
      provider: 'LP Ritual da Pele',
      orderId: pedidoId,
      entrega_endereco: enderecoTexto,
      entrega_cep: soDigitos(e.cep),
      entrega_cidade: texto(e.cidade, 80),
      entrega_uf: texto(e.uf, 2).toUpperCase(),
      entrega_destinatario: texto(c.nome, 120),
      entrega_telefone: soDigitos(c.telefone),
      frete: expresso ? 'Expresso (1 a 3 dias úteis)' : 'Grátis (5 a 9 dias úteis)',
      kit: corpo.offerId,
      unidades: String(oferta.unidades),
      brinde: 'BellaFios Gummies 60un',
      // Rastreamento: volta no webhook e é o que casa a venda com o anúncio.
      fbc: texto(t.fbc, 255) || undefined,
      fbp: texto(t.fbp, 255) || undefined,
      fbclid: texto(t.fbclid, 255) || undefined,
      utm_source: texto(t.utm_source, 120) || undefined,
      utm_medium: texto(t.utm_medium, 120) || undefined,
      utm_campaign: texto(t.utm_campaign, 120) || undefined,
      utm_content: texto(t.utm_content, 120) || undefined,
      utm_term: texto(t.utm_term, 120) || undefined,
      /* src e sck são os parâmetros próprios da UTMify (fonte secundária e
         "sck" de checkout). A página JÁ os captura (KEYS em part1-head.html) e
         o webhook JÁ os repassa em trackingParameters — mas eles não passavam
         por aqui, então chegavam sempre null do outro lado. Cadeia fechada.
         Só valem quando a URL do anúncio traz ?src= ou ?sck=; sem isso seguem
         undefined e são removidos logo abaixo, como os demais. */
      src: texto(t.src, 120) || undefined,
      sck: texto(t.sck, 120) || undefined
    },
    // O segredo vai na query porque, em transação criada por API, o `token` do
    // corpo não é garantido ser o mesmo do painel. O handler aceita os dois.
    /* &via=api etiqueta a ORIGEM da entrega.

       Existem dois webhooks na Korvex apontando para esta mesma URL: este
       "API CallbackURL" (que nasce deste campo) e o "LP Ritual da Pele -
       Purchase" do painel. Os dois disparam para a mesma cobrança criada por
       API — foi isso que duplicou pedido na UTMify em 25/08/2026.

       Para remover o webhook certo é preciso saber qual entrega veio de qual,
       e no log os dois ficavam idênticos: ambos autenticam por `?k=`, porque o
       do painel foi recriado com esta mesma URL. Este marcador desempata sem
       mudar comportamento nenhum — quem chegar com via=api veio daqui; quem
       chegar sem, veio do painel. Uma venda real responde a pergunta. */
    callbackUrl: BASE_URL + '/api/korvex-webhook?k=' +
      encodeURIComponent(process.env.KORVEX_WEBHOOK_SECRET || '') + '&via=api'
  };
  Object.keys(requisicao.metadata).forEach((k) => {
    if (requisicao.metadata[k] === undefined) delete requisicao.metadata[k];
  });

  /* Corte de paciência.

     Em 24/08/2026 o POST /gateway/pix/receive da Korvex passou a devolver 504
     depois de exatamente 30 segundos, três vezes em três tentativas — enquanto
     o GET /gateway/transactions respondia em 0,2s com as mesmas chaves. Ou seja:
     a conta e a autenticação estavam boas, só a criação de cobrança estava fora.

     Sem este corte, a cliente ficava meio minuto olhando "Gerando seu Pix…"
     antes de a página desistir. Meio minuto de spinner é venda perdida. Agora
     desistimos em 12s e a página cai para o checkout hospedado, que continuou
     de pé durante a falha. */
  const LIMITE_MS = 12000;
  const comecou = Date.now();
  const cancelar = new AbortController();
  const relogio = setTimeout(() => cancelar.abort(), LIMITE_MS);

  try {
    const r = await fetch(KORVEX_API + '/gateway/pix/receive', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'User-Agent': UA_KORVEX,
        'Accept': 'application/json',
        'x-public-key': publica,
        'x-secret-key': secreta
      },
      body: JSON.stringify(requisicao),
      signal: cancelar.signal
    });
    const bruto = await r.text();
    let dados = {};
    try { dados = JSON.parse(bruto); } catch (err) { dados = {}; }

    if (!r.ok) {
      // Log sem PII: o que interessa para depurar é o código, não o comprador.
      const levou = Date.now() - comecou;
      console.error('[pix] korvex recusou', r.status, 'em', levou + 'ms', bruto.slice(0, 300));
      /* 400 de validação é defeito do NOSSO payload — desligar o Pix da página
         inteira por causa dele esconderia o checkout bom de todo mundo por um
         bug nosso. 403/429 (antibot) e 5xx são a Korvex fora: esses, sim. */
      if (r.status === 403 || r.status === 429 || r.status >= 500) {
        lembrarFalha('criacao ' + r.status);
      }
      return res.status(502).json({
        ok: false,
        motivo: 'korvex recusou',
        status: r.status,
        ms: levou,
        limite_ms: LIMITE_MS,
        detalhe: dados && dados.message ? String(dados.message).slice(0, 200) : undefined
      });
    }

    const pix = dados.pix || {};
    if (!pix.code) {
      console.error('[pix] resposta sem pix.code:', bruto.slice(0, 400));
      return res.status(502).json({ ok: false, motivo: 'resposta sem codigo pix' });
    }

    /* ÚLTIMA CONFERÊNCIA, E A QUE MAIS IMPORTA: o valor DENTRO do BR Code.

       Tudo o que veio antes garante que pedimos o valor certo. Isto garante que
       recebemos o valor certo. É o único ponto que enxerga o que a cliente vai
       de fato ver no app do banco — o resto da cadeia é intenção nossa.

       Vale a pena porque o estrago é silencioso: um BR Code com valor diferente
       não dá erro em lugar nenhum. A página mostra "R$ 37,90", a pessoa abre o
       banco, lê outro número e desiste. Sem log, sem exceção, sem pista.

       Se divergir, devolvemos 502 em vez do Pix: melhor a cliente cair no
       checkout hospedado (que funciona) do que pagar um valor que não combinou.

       Campo 54 do EMV/BR Code = valor da transação. Formato TLV: cada campo é
       ID(2) + tamanho(2) + valor. */
    const valorNoBrCode = lerCampoEmv(pix.code, '54');
    if (valorNoBrCode !== null) {
      const centavosNoBrCode = Math.round(parseFloat(valorNoBrCode) * 100);
      const centavosEsperados = centavosOferta + centavosFrete;
      if (centavosNoBrCode !== centavosEsperados) {
        console.error('[pix] DIVERGENCIA NO BR CODE — cobranca abortada |',
          'pedido', pedidoId, '| pedimos', centavosEsperados, 'centavos |',
          'o codigo pix cobra', centavosNoBrCode, '| trx', dados.transactionId);
        return res.status(502).json({
          ok: false,
          motivo: 'valor divergente no codigo pix'
        });
      }
    } else {
      // Sem campo 54 o Pix é de valor livre: a cliente digitaria o valor à mão.
      console.error('[pix] BR Code sem campo 54 (valor) | pedido', pedidoId,
        '| trx', dados.transactionId, '| a cobranca sairia sem valor definido');
      return res.status(502).json({ ok: false, motivo: 'codigo pix sem valor' });
    }

    console.log('[pix] criado', pedidoId, 'trx', dados.transactionId, 'total', total, 'frete', frete,
      '| BR Code confere:', valorNoBrCode);
    lembrarSucesso();

    return res.status(201).json({
      ok: true,
      orderId: pedidoId,
      transactionId: dados.transactionId || null,
      total,
      frete,
      // A imagem da Korvex vem null na prática; quando vier, a dela ganha.
      pix: { code: pix.code, image: pix.image || (await qrDataUri(pix.code)) },
      // Só sobra como rede de emergência: com pix.image preenchido, o
      // mostrarPix nem chega a usar isto e o link para fora fica escondido.
      pedidoUrl: (dados.order && dados.order.url) || null
    });
  } catch (err) {
    /* AbortError = a Korvex passou dos 12s. Vale registrar diferente de queda de
       rede: são causas distintas e a diferença importa quando alguém for ler o
       log para entender por que a venda não saiu.

       ATENÇÃO ao ler o painel: um 504 da Korvex NÃO garante que a cobrança não
       foi criada do lado dela. É provável que o backend crie a transação e só a
       resposta se perca — o que deixa uma pendência órfã, sem ninguém nunca ter
       visto o código. Se aparecerem pendências que ninguém pagou e que a cliente
       jura não ter recebido, é aqui que nasceram. */
    const abortou = err && (err.name === 'AbortError' || /abort/i.test(err.message || ''));
    console.error('[pix] ' + (abortou ? 'korvex passou de ' + LIMITE_MS + 'ms' : 'falha de rede:') , err.message);
    lembrarFalha(abortou ? 'criacao estourou o tempo' : 'criacao sem rede');
    return res.status(502).json({ ok: false, motivo: abortou ? 'korvex demorou demais' : 'falha de rede', ms: Date.now() - comecou, limite_ms: LIMITE_MS });
  } finally {
    clearTimeout(relogio);
  }
};
