/* ============================================================================
   BUILD — monta index.html e as páginas institucionais a partir de:
     config/produto.js   o CONTEÚDO (textos, imagens, ofertas, cores)
     src/*.html          a ESTRUTURA (o DNA do template)
     src/*.css           o SISTEMA VISUAL
     catalogo.js         o PREÇO (que por sua vez deriva do config)

     $ node build.js

   Rode depois de editar QUALQUER coisa em src/ ou config/, e antes de
   `vercel --prod --yes`.

   Por que a página é montada e não editada direto: o index.html final tem
   ~250KB com CSS e JS embutidos — um arquivo só, sem framework, carrega
   rápido. Editar isso na mão é costurar no escuro.

   Ordem do arquivo final:
     part1-head.html   <!doctype>, meta, pixel, captura de UTM, abre <style>
     base.css          CSS herdado — está no build APENAS pelo checkout
     add.css           camada de acessibilidade + CSS do checkout
     tema.css          o sistema visual novo (namespace r-)
     secoes.css        as seções da página
     :root gerado      paleta e fontes vindas do config
     tpl-icons.svg     <symbol> dos ícones usados via <use href="#i-...">
     body.html         a página inteira, renderizada com o config
     checkout.html     modal de confirmação do pedido
     app.js            todo o JS, com os blocos KITS e KORVEX gerados

   O BUILD DERRUBA (exit 1) quando:
     - um {{campo}} do template não existe no config
     - o preço renderizado diverge do catálogo
     - o CSS tem chave desbalanceada ou declaração fora de bloco
     - o HTML tem tag desbalanceada
   Preço errado e layout quebrado passam a ser erro de build, nunca venda
   perdida em produção.
   ============================================================================ */

const fs = require('fs');
const path = require('path');
const { render } = require('./tools/render.js');

const RAIZ = __dirname;
const SRC = path.join(RAIZ, 'src');
const ler = (f) => fs.readFileSync(path.join(SRC, f), 'utf8');

const PRODUTO = require('./config/produto.js');
const CATALOGO = require('./catalogo.js');

let erro = false;
function reclamar(msg) {
  console.error('  *** ' + msg);
  erro = true;
}

/* ============================================================================
   1. MACROS DO CONFIG
   ----------------------------------------------------------------------------
   O config pode conter {{FRETE_EXPRESSO}}, {{EMAIL}} etc. dentro dos próprios
   textos — o frete aparece em três lugares na copy e ninguém lembra dos três
   ao trocar o valor. Esta passada resolve os macros ANTES da renderização.
   ============================================================================ */
const MACROS = {
  MARCA: PRODUTO.marca.nome,
  MARCA_LEGAL: PRODUTO.marca.nomeLegal,
  EMAIL: PRODUTO.marca.email,
  TELEFONE: PRODUTO.marca.telefone,
  TELEFONE_LINK: PRODUTO.marca.telefoneLink,
  DOMINIO: PRODUTO.seo.dominio,
  FRETE_EXPRESSO: CATALOGO.emMoeda(CATALOGO.FRETE_EXPRESSO_CENTAVOS),
  PRECO_MENOR: CATALOGO.emMoeda(Math.min(...CATALOGO.ORDEM.map((id) => CATALOGO.OFERTAS[id].centavos))),
  PRECO_PADRAO: CATALOGO.emMoeda(CATALOGO.OFERTAS[CATALOGO.PADRAO].centavos)
};

function expandirMacros(v) {
  if (typeof v === 'string') {
    return v.replace(/\{\{([A-Z_]+)\}\}/g, (todo, nome) => {
      if (!(nome in MACROS)) {
        reclamar('macro {{' + nome + '}} usada no config nao existe. Disponiveis: ' + Object.keys(MACROS).join(', '));
        return todo;
      }
      return MACROS[nome];
    });
  }
  if (Array.isArray(v)) return v.map(expandirMacros);
  if (v && typeof v === 'object') {
    const saida = {};
    for (const k of Object.keys(v)) saida[k] = expandirMacros(v[k]);
    return saida;
  }
  return v;
}

/* ============================================================================
   2. VIEW MODEL
   ----------------------------------------------------------------------------
   O renderizador é burro de propósito: ele só sabe inserir, repetir e
   esconder. Tudo que precisa de cálculo (formatar preço, contar desconto,
   montar estrelas) é resolvido aqui, uma vez, e entra no template como campo.
   ============================================================================ */
function viewModel() {
  const d = expandirMacros(PRODUTO);

  /* Ofertas enriquecidas. O índice no array É o `data-i` dos botões — o app.js
     conta com isso, e o app.js é a fonte da troca de kit na página. */
  d.ofertas = CATALOGO.ORDEM.map((id, i) => {
    const o = CATALOGO.OFERTAS[id];
    const ehPadrao = id === CATALOGO.PADRAO;
    return {
      id,
      idx: i,
      code: o.code,
      centavos: o.centavos,
      deCentavos: o.deCentavos,
      precoFmt: CATALOGO.emMoeda(o.centavos),
      deFmt: CATALOGO.emMoeda(o.deCentavos),
      perDiaFmt: CATALOGO.emMoeda(Math.round(o.centavos / o.dias)),
      desconto: Math.round((1 - o.centavos / o.deCentavos) * 100),
      nome: o.nome,
      rotulo: o.rotulo,
      rotuloCurto: o.rotuloCurto,
      desc: o.desc,
      sub: o.sub,
      dias: o.dias,
      unidades: o.unidades,
      destaque: o.destaque,
      /* Uma miniatura por unidade dentro do card. Array só para o {{#each}}
         ter o que repetir — o valor de cada item não é usado. */
      unidadesArr: Array.from({ length: o.unidades }, (_, k) => k),
      sel: ehPadrao ? 'on' : '',
      checked: ehPadrao ? 'true' : 'false'
    };
  });

  const padrao = d.ofertas.find((o) => o.id === CATALOGO.PADRAO);
  const cmp = d.ofertas.find((o) => o.id === CATALOGO.COMPARATIVO);
  d.ofertaPadrao = padrao;
  d.ofertaComparativoObj = cmp;
  d.descontoPadrao = padrao.desconto;
  d.freteExpressoFmt = MACROS.FRETE_EXPRESSO;
  d.estrelas5 = [1, 2, 3, 4, 5];

  /* Avaliações: as estrelas viram array para o template repetir. */
  d.avaliacoes.itens = d.avaliacoes.itens.map((a) => Object.assign({}, a, {
    estrelasArr: Array.from({ length: a.estrelas }, (_, k) => k)
  }));

  /* Comparativo: normaliza cada célula para {cls, texto, sub, id}. É aqui que
     `{sim:'Sim'}` vira o selo verde e `{precoOferta:true}` puxa o preço da
     oferta de comparação — o template não precisa saber disso. */
  d.comparativo.linhas = d.comparativo.linhas.map((linha) => {
    if (linha.valores.length !== d.comparativo.colunas.length)
      reclamar('comparativo: a linha "' + linha.criterio + '" tem ' + linha.valores.length +
               ' valores para ' + d.comparativo.colunas.length + ' colunas');
    return {
      criterio: linha.criterio,
      valores: linha.valores.map((v) => {
        if (typeof v === 'string') return { cls: '', texto: v, sub: '', id: '' };
        if (v.precoOferta) return { cls: '', texto: cmp.precoFmt, sub: v.sub || '', id: 'cmp-price' };
        if ('sim' in v) return { cls: 'r-yes', texto: v.sim, sub: v.sub || '', id: '' };
        if ('nao' in v) return { cls: 'r-no', texto: v.nao, sub: v.sub || '', id: '' };
        return { cls: '', texto: v.texto || '', sub: v.sub || '', id: '' };
      })
    };
  });

  return d;
}

/* ============================================================================
   3. PREÇO NO BUNDLE
   ----------------------------------------------------------------------------
   Os blocos KITS e KORVEX do app.js são GERADOS. O mesmo catalogo.js que os
   gera é o que api/criar-pix.js lê para montar a cobrança — então o que a
   página exibe e o que o gateway cobra não têm como divergir.
   ============================================================================ */
function gerarBlocoKorvex() {
  const linhas = CATALOGO.ORDEM.map((id, i) => {
    const o = CATALOGO.OFERTAS[id];
    const virgula = i === CATALOGO.ORDEM.length - 1 ? ' ' : ',';
    return `    ${id}: { code:'${o.code}', preco:${o.centavos} }${virgula}  /* ${CATALOGO.emMoeda(o.centavos)} */`;
  }).join('\n');
  return [
    '/* GERADO por build.js a partir de config/produto.js — não editar no src/. */',
    'var KORVEX = {',
    `  base: '${CATALOGO.BASE_CHECKOUT}',`,
    `  produto: '${CATALOGO.PRODUTO_KORVEX}',`,
    '',
    '  ofertas: {',
    linhas,
    '  },',
    '',
    `  freteExpresso: ${CATALOGO.FRETE_EXPRESSO_CENTAVOS}`,
    '};'
  ].join('\n');
}

function gerarBlocoKits() {
  const linhas = CATALOGO.ORDEM.map((id) => {
    const o = CATALOGO.OFERTAS[id];
    return `  { p:${o.centavos}, o:${o.deCentavos}, n:'${o.rotulo.replace(/'/g, "")}', ` +
           `desc:'${o.desc.replace(/'/g, "")}', offer:'${id}', dias:${o.dias}, q:${o.unidades} }`;
  }).join(',\n');
  return '/* GERADO por build.js a partir de config/produto.js. */\nvar KITS = [\n' + linhas + '\n];';
}

/* Índices gerados. `selIdx` é o kit que abre selecionado; `CMP_IDX` é a oferta
   cujo preço aparece na linha de custo da tabela comparativa. Amarrados ao
   config: se a oferta padrão não for a segunda, a página abriria com um kit
   selecionado e o preço de outro. */
function gerarIndices() {
  const sel = CATALOGO.ORDEM.indexOf(CATALOGO.PADRAO);
  const cmp = CATALOGO.ORDEM.indexOf(CATALOGO.COMPARATIVO);
  return `var selIdx = ${sel};  /* GERADO: ofertaPadrao = "${CATALOGO.PADRAO}" */\n` +
         `var CMP_IDX = ${cmp}; /* GERADO: ofertaComparativo = "${CATALOGO.COMPARATIVO}" */`;
}

/* Substitui tudo entre os marcadores @gerado-por-build. Se o marcador sumir,
   o build para: melhor não gerar nada do que gerar um bundle com preço velho. */
function injetar(js, nome, conteudo) {
  const re = new RegExp(
    '/\\* ===== @gerado-por-build: ' + nome + ' =[\\s\\S]*?===== fim @gerado-por-build: ' + nome + ' =+ \\*/'
  );
  if (!re.test(js)) {
    reclamar('marcador @gerado-por-build:' + nome + ' nao encontrado em src/app.js');
    return js;
  }
  return js.replace(re, conteudo);
}

/* ============================================================================
   4. CONFERÊNCIA DE PREÇO NO HTML RENDERIZADO
   ----------------------------------------------------------------------------
   O template puxa o preço do view model, que vem do catálogo — então em teoria
   não pode divergir. Esta conferência existe porque "em teoria" já custou um
   dia de página exibindo R$ 37,90 enquanto o Pix cobrava R$ 38,14. Ela lê o
   HTML FINAL, o mesmo que vai para o ar.
   ============================================================================ */
function conferirPrecos(corpo, checkout) {
  CATALOGO.ORDEM.forEach((id, i) => {
    const o = CATALOGO.OFERTAS[id];
    const esperado = CATALOGO.emMoeda(o.centavos);
    const deEsperado = CATALOGO.emMoeda(o.deCentavos);

    const achado = (corpo.match(new RegExp('data-price="' + i + '">([^<]+)<')) || [])[1];
    if (achado !== esperado) reclamar(`PRECO: card ${i} exibe "${achado}", catalogo diz "${esperado}"`);

    const de = (corpo.match(new RegExp('data-old="' + i + '">([^<]+)<')) || [])[1];
    if (de !== deEsperado) reclamar(`PRECO: card ${i} "de" exibe "${de}", catalogo diz "${deEsperado}"`);

    const naBarra = (corpo.match(new RegExp('<span>' + o.rotuloCurto.replace(/[.*+?^${}()|[\]\\]/g, '') + '</span><b>([^<]+)</b>')) || [])[1];
    if (naBarra && naBarra !== esperado) reclamar(`PRECO: barra fixa "${o.rotuloCurto}" exibe "${naBarra}", catalogo diz "${esperado}"`);
  });

  const padrao = CATALOGO.OFERTAS[CATALOGO.PADRAO];
  const heroi = (corpo.match(/id="hero-price">([^<]+)</) || [])[1];
  if (heroi !== CATALOGO.emMoeda(padrao.centavos))
    reclamar(`PRECO: #hero-price exibe "${heroi}", catalogo diz "${CATALOGO.emMoeda(padrao.centavos)}" (oferta padrao)`);

  const comp = CATALOGO.OFERTAS[CATALOGO.COMPARATIVO];
  const cmp = (corpo.match(/id="cmp-price">([^<]+)</) || [])[1];
  if (cmp && cmp !== CATALOGO.emMoeda(comp.centavos))
    reclamar(`PRECO: #cmp-price exibe "${cmp}", catalogo diz "${CATALOGO.emMoeda(comp.centavos)}"`);

  /* Frete expresso escrito na copy. O macro {{FRETE_EXPRESSO}} resolve isso,
     mas alguem pode ter digitado o valor a mao num campo novo. */
  const frete = CATALOGO.emMoeda(CATALOGO.FRETE_EXPRESSO_CENTAVOS);
  const soltos = corpo.match(/frete expresso por R\$ [\d,]+/gi) || [];
  soltos.forEach((m) => {
    if (!m.includes(frete)) reclamar(`PRECO: "${m}" diverge do catalogo (${frete}) — use {{FRETE_EXPRESSO}} no config`);
  });

  const noResumo = (checkout.match(/class="pr tnum">\+ (R\$ [\d,]+)</) || [])[1];
  if (noResumo && noResumo !== frete)
    reclamar(`PRECO: checkout.html mostra frete "${noResumo}", catalogo diz "${frete}"`);
}

/* ============================================================================
   5. PALETA VINDA DO CONFIG
   ----------------------------------------------------------------------------
   O tema.css define a paleta padrão. Este bloco entra DEPOIS e sobrescreve só
   as variáveis — o ritmo, as proporções e o espaçamento (o DNA) ficam onde
   estão. Trocar de produto muda a cor, não a estrutura.
   ============================================================================ */
const MAPA_CORES = {
  pp: '--pp', sf: '--sf', sf2: '--sf2', ln: '--ln', ln2: '--ln2',
  t1: '--t1', t2: '--t2', t3: '--t3',
  rs: '--rs', rsD: '--rs-d', rsW: '--rs-w', rsLn: '--rs-ln',
  au: '--au', gr: '--gr'
};

/* Memoizada: ela é usada no index e nas três páginas institucionais, e sem
   isso um erro de cor aparecia quatro vezes no log. */
let paletaCache = null;
function gerarPaleta() {
  if (paletaCache !== null) return paletaCache;
  const linhas = [];
  for (const chave of Object.keys(PRODUTO.cores || {})) {
    if (!MAPA_CORES[chave]) {
      reclamar('cores.' + chave + ' nao e uma cor conhecida. Validas: ' + Object.keys(MAPA_CORES).join(', '));
      continue;
    }
    const v = PRODUTO.cores[chave];
    if (!/^#[0-9a-f]{3,8}$/i.test(v)) reclamar('cores.' + chave + ' = "' + v + '" nao e um hex valido');
    linhas.push('  ' + MAPA_CORES[chave] + ':' + v + ';');
  }
  if (PRODUTO.tipografia) {
    if (PRODUTO.tipografia.display) linhas.push('  --dsp:' + PRODUTO.tipografia.display + ';');
    if (PRODUTO.tipografia.texto) linhas.push('  --txt:' + PRODUTO.tipografia.texto + ';');
  }
  if (!linhas.length) { paletaCache = ''; return paletaCache; }
  paletaCache = '\n/* ===== paleta gerada de config/produto.js ===== */\n:root{\n' + linhas.join('\n') + '\n}\n';
  return paletaCache;
}

/* ============================================================================
   5b. TRAVA DE HERANÇA DO PRODUTO DE REFERÊNCIA
   ----------------------------------------------------------------------------
   O erro mais caro possível ao duplicar este template é publicar com os IDs do
   produto de referência ainda no config. As consequências não são cosméticas:

     - `tracking.metaPixelId` herdado  -> o tráfego pago de um produto alimenta
       o pixel de OUTRO. Os dois públicos se contaminam e as duas campanhas
       otimizam errado.
     - `checkout.produtoId` ou o `code` de uma oferta herdado  -> a venda é
       criada na conta de OUTRA pessoa no gateway. O dinheiro entra na conta
       errada e a cliente recebe o produto errado (ou nenhum).

   Por isso isto derruba o build em vez de avisar. Quem realmente quiser
   publicar a LP de referência tal como ela é usa PRYON_REFERENCIA=1.
   ============================================================================ */
const PLACEHOLDERS = {
  metaPixelId: ['000000000000000', ''],
  produtoId: ['SEUPRODUTO000', 'seu-id-no-gateway', ''],
  codes: ['EXEMPLO1', 'EXEMPLO2', 'EXEMPLO3'],
  dominio: ['https://exemplo.vercel.app', 'https://SEU-PROJETO.vercel.app', ''],
  email: ['contato@exemplo.com.br', ''],
  telefone: ['(00) 00000-0000', ''],
  storagePrefix: ['exemplo', 'meuproduto', '']
};

function conferirHeranca() {
  if (process.env.PRYON_REFERENCIA === '1') return;
  const p = PRODUTO;
  const achados = [];
  const t = p.tracking || {}, c = p.checkout || {}, s = p.seo || {}, m = p.marca || {};

  if (PLACEHOLDERS.metaPixelId.includes(t.metaPixelId))
    achados.push('tracking.metaPixelId ainda e o placeholder — o Pixel nao vai registrar nada');
  if (PLACEHOLDERS.produtoId.includes(c.produtoId))
    achados.push('checkout.produtoId ainda e o placeholder — a cobranca nao vai ser criada');
  for (const o of p.ofertas || []) {
    if (PLACEHOLDERS.codes.includes(o.code))
      achados.push('oferta "' + o.id + '" usa o code de exemplo "' + o.code + '"');
  }
  if (PLACEHOLDERS.dominio.includes(s.dominio))
    achados.push('seo.dominio ainda e o placeholder — canonical e Open Graph vao sair errados');
  if (PLACEHOLDERS.email.includes(m.email))
    achados.push('marca.email ainda e o placeholder — e o endereco que a cliente usa para pedir reembolso');
  if (PLACEHOLDERS.telefone.includes(m.telefone))
    achados.push('marca.telefone ainda e o placeholder');
  if (PLACEHOLDERS.storagePrefix.includes(t.storagePrefix))
    achados.push('tracking.storagePrefix ainda e generico — duas LPs no mesmo dominio dividiriam a atribuicao');

  if (!achados.length) return;

  console.error('');
  console.error('  ============================================================');
  console.error('  CONFIG AINDA NAO CONFIGURADO');
  console.error('  ============================================================');
  achados.forEach((a) => console.error('   - ' + a));
  console.error('');
  console.error('  Estes sao os valores de exemplo do demo. Publicar assim');
  console.error('  significa pagina no ar sem rastreio e sem conseguir cobrar.');
  console.error('  Edite config/produtos/<seu-produto>.js.');
  console.error('');
  console.error('  Para buildar o DEMO de referencia mesmo assim (ele existe so');
  console.error('  para ser lido, nao para ir ao ar):');
  console.error('    PRYON_REFERENCIA=1 node build.js');
  console.error('  ============================================================');
  console.error('');
  erro = true;
}

/* ============================================================================
   6. MONTAGEM
   ============================================================================ */
conferirHeranca();
const dados = viewModel();

/* Um {{#if}} que não rende deixa rastro no atributo: `class="of-kit "` e
   `<td >`. Não quebra nada, mas suja o HTML e polui qualquer diff entre duas
   versões da página — que é como se confere que um redesign não mexeu na
   estrutura. Esta passada limpa só isso, nada mais. */
function arrumar(html) {
  return html
    .replace(/class="\s*([^"]*?)\s*"/g, (todo, v) => 'class="' + v.replace(/\s+/g, ' ') + '"')
    .replace(/<([a-z][a-z0-9]*) >/g, '<$1>');
}

const corpo = arrumar(render(ler('body.html'), dados, 'src/body.html'));
const cabeca = render(ler('part1-head.html'), dados, 'src/part1-head.html');
const checkout = render(ler('checkout.html'), dados, 'src/checkout.html');

/* app.js passa pelo renderizador só por causa dos poucos textos de marca que
   ele exibe (mensagem de erro com o e-mail de contato). Ele NÃO pode conter a
   sequência "{{" em código JavaScript — hoje não contém, e o build reclama se
   sobrar placeholder. A injeção dos blocos de preço vem DEPOIS da renderização,
   para o código gerado nunca passar pelo parser de template. */
let js = render(ler('app.js'), dados, 'src/app.js');
js = injetar(js, 'KORVEX', gerarBlocoKorvex());
js = injetar(js, 'KITS', gerarBlocoKits() + '\n' + gerarIndices());

const html =
  cabeca +
  ler('base.css') + '\n' +
  ler('add.css') + '\n' +
  ler('tema.css') + '\n' +
  ler('secoes.css') +
  gerarPaleta() +
  '\n</style>\n</head>\n<body>\n' +
  ler('tpl-icons.svg') + '\n' +
  corpo + '\n' +
  checkout + '\n' +
  '<script>\n' + js + '\n</script>\n' +
  '</body>\n</html>\n';

conferirPrecos(corpo, checkout);

fs.writeFileSync(path.join(RAIZ, 'index.html'), html, 'utf8');
console.log('index.html gerado —', (html.length / 1024).toFixed(1) + 'KB');

/* ---------------- Páginas institucionais ----------------
   Uma casca só, para as três não saírem com cabeçalho e rodapé diferentes.
   Sem pixel: são páginas de suporte e de política, não fazem parte do funil,
   e disparar PageView nelas só sujaria o público das campanhas. */
const PAGINA_CSS = ler('pagina.css');

function casca(rota, titulo, desc, conteudo) {
  return `<!DOCTYPE html>
<html lang="${dados.seo.lang}">
<head>
<meta charset="utf-8">
<meta name="viewport" content="width=device-width,initial-scale=1,viewport-fit=cover">
<title>${titulo} — ${dados.seo.siteName}</title>
<meta name="description" content="${desc}">
<meta name="theme-color" content="${dados.seo.themeColor}">
<link rel="canonical" href="${dados.seo.dominio}/${rota}">
<meta name="robots" content="index,follow">
<meta property="og:type" content="website">
<meta property="og:locale" content="pt_BR">
<meta property="og:title" content="${titulo} — ${dados.seo.siteName}">
<meta property="og:description" content="${desc}">
<meta property="og:url" content="${dados.seo.dominio}/${rota}">
<link rel="stylesheet" href="public/fonts.css">
<style>
${PAGINA_CSS}${gerarPaleta()}</style>
</head>
<body>
<a class="skip" href="#conteudo">Pular para o conteúdo</a>
<header class="top">
  <div class="wrap">
    <a class="brand" href="/">${dados.marca.nome}<span>${dados.marca.ponto}</span></a>
    <a class="volta" href="/">&larr; ${dados.legal.voltarLabel}</a>
  </div>
</header>
<main id="conteudo"><div class="wrap">
${conteudo}</div></main>
<footer class="ft">
  <div class="wrap">
    <a href="/">${dados.legal.paginaKitLabel}</a>
    <a href="/termos">Termos de uso</a>
    <a href="/privacidade">Política de privacidade</a>
    <a href="/rastrear-pedido">Rastrear meu pedido</a>
    <a href="mailto:${dados.marca.email}">${dados.marca.email}</a>
    <p class="dis">${dados.legal.disclaimer}</p>
  </div>
</footer>
</body>
</html>
`;
}

for (const rota of ['termos', 'privacidade', 'rastrear-pedido']) {
  const bruto = render(ler('pg-' + rota + '.html'), dados, 'src/pg-' + rota + '.html');
  const titulo = (bruto.match(/<!--titulo:\s*([\s\S]*?)-->/) || [])[1];
  const desc = (bruto.match(/<!--desc:\s*([\s\S]*?)-->/) || [])[1];
  if (!titulo || !desc) {
    reclamar('pg-' + rota + '.html sem <!--titulo--> ou <!--desc-->');
    continue;
  }
  const conteudo = bruto.replace(/<!--(titulo|desc):[\s\S]*?-->\n?/g, '');
  const saida = casca(rota, titulo.trim(), desc.trim().replace(/\s+/g, ' '), conteudo);
  fs.writeFileSync(path.join(RAIZ, rota + '.html'), saida, 'utf8');
  console.log('  ' + (rota + '.html').padEnd(22), (saida.length / 1024).toFixed(1) + 'KB');
}

/* ---------------- Sanidade do CSS ----------------
   Isto existe por causa de um estrago real: ao apagar as regras do toast por
   linha, sobraram as linhas de continuação de duas regras que ocupavam duas
   linhas cada. As chaves ficaram desbalanceadas, o parser descartou o bloco
   seguinte e o modal de checkout perdeu o position:fixed — em produção, sem
   nenhum erro visível no build. */
for (const arq of ['base.css', 'add.css', 'tema.css', 'secoes.css', 'pagina.css']) {
  const css = ler(arq);
  const abre = (css.match(/{/g) || []).length;
  const fecha = (css.match(/}/g) || []).length;
  const ok = abre === fecha;
  if (!ok) erro = true;
  console.log('  ' + arq.padEnd(12), '{', String(abre).padStart(4), '}', String(fecha).padStart(4), ok ? 'ok' : '*** DESBALANCEADO ***');

  /* Declaração órfã: "prop:valor" solto fora de qualquer bloco — é o formato
     exato do estrago descrito acima, e chaves balanceadas não o pegam sozinhas.
     Comentários viram espaço antes da varredura (preservando as quebras de
     linha, para o número da linha continuar certo), senão um comentário que
     contém "height:auto" vira falso positivo. Linha com "{" é seletor, não
     declaração — é o que separa isto de "a:focus-visible{...}". */
  const semComentario = css.replace(/\/\*[\s\S]*?\*\//g, (m) => m.replace(/[^\n]/g, ' '));
  let prof = 0;
  semComentario.split('\n').forEach((linha, i) => {
    const limpa = linha.trim();
    if (prof === 0 && !limpa.includes('{') && /^[a-z-]+\s*:/i.test(limpa)) {
      reclamar(arq + ':' + (i + 1) + ' declaracao fora de bloco: ' + limpa.slice(0, 60));
    }
    prof += (linha.match(/{/g) || []).length - (linha.match(/}/g) || []).length;
    if (prof < 0) prof = 0;
  });
}

/* Sanidade: tag desbalanceada num arquivo de 250KB some no meio do ruído,
   e só aparece como layout quebrado em produção. */
for (const [abre, fecha] of [['<section', '</section>'], ['<div', '</div>'],
                             ['<button', '</button>'], ['<form', '</form>']]) {
  const a = (html.match(new RegExp(abre + '[\\s>]', 'g')) || []).length;
  const f = (html.match(new RegExp(fecha, 'g')) || []).length;
  const ok = a === f;
  if (!ok) erro = true;
  console.log('  ' + abre.padEnd(9), a, fecha.padEnd(11), f, ok ? 'ok' : '*** DESBALANCEADO ***');
}

/* Placeholder esquecido: um {{campo}} que sobrou no HTML final significa que o
   renderizador não o reconheceu — e ele iria para o ar como texto literal. */
const sobrou = html.match(/\{\{[^}]{1,60}\}\}/g);
if (sobrou) reclamar('sobrou placeholder no HTML final: ' + [...new Set(sobrou)].slice(0, 5).join(' '));

if (erro) {
  console.error('\n  BUILD COM ERRO — nada disso deve ir para producao.');
  process.exitCode = 1;
} else {
  console.log('\n  ok — produto:', PRODUTO.seo.siteName, '| ofertas:', CATALOGO.ORDEM.join(', '));
}
