/* ============================================================================
   RENDERIZADOR DE TEMPLATE — 3 construções, e só.
   ----------------------------------------------------------------------------
   Existe para que `src/body.html` continue sendo HTML legível (a estrutura, o
   DNA da página) e o conteúdo venha de `config/produto.js`. Nada de framework:
   o build tem que rodar com `node build.js` e nenhuma dependência.

   Sintaxe:

     {{ caminho.do.campo }}     insere o valor. NÃO escapa: o conteúdo do
                                config é HTML de propósito (<b>, <em>, <br>).
                                Nada aqui vem de usuário final — é copy que
                                você mesmo escreveu.

     {{# each lista }}          repete o bloco para cada item da lista.
       ...                      dentro, o contexto é o item: {{ titulo }}.
     {{/ each }}                variáveis do laço:
                                  {{@index}} 0,1,2…   {{@num}} 1,2,3…
                                  {{@pad}} 01,02,03…  {{@first}} {{@last}}
                                fora do item, use {{$.campo}} para voltar à
                                raiz do config.

     {{# if campo }} … {{ else }} … {{/ if }}
                                mostra o bloco se o campo tiver valor.
                                Lista vazia conta como falso — é assim que
                                `brinde: null` some da página inteira.

   Um `{{ campo }}` que não existe DERRUBA O BUILD. Silenciar isso significaria
   publicar a página com um buraco no lugar do preço.
   ============================================================================ */

'use strict';

const ABRE = /\{\{\s*(#each|#if|else|\/each|\/if)?\s*([^}]*?)\s*\}\}/g;

/* ------------------------------------------------------------------ parser */

function parse(tpl, arquivo) {
  const raiz = { tipo: 'raiz', filhos: [] };
  const pilha = [raiz];
  let pos = 0;
  let m;
  ABRE.lastIndex = 0;

  const topo = () => pilha[pilha.length - 1];
  const texto = (s) => { if (s) empurrar(topo(), { tipo: 'texto', valor: s }); };

  while ((m = ABRE.exec(tpl)) !== null) {
    texto(tpl.slice(pos, m.index));
    pos = m.index + m[0].length;

    const tag = m[1];
    const expr = m[2];

    if (tag === '#each' || tag === '#if') {
      const no = { tipo: tag.slice(1), expr, filhos: [], senao: null, emSenao: false, linha: linhaDe(tpl, m.index) };
      empurrar(topo(), no);
      pilha.push(no);
    } else if (tag === 'else') {
      const no = topo();
      if (no.tipo !== 'if') throw new Error(arquivo + ': {{else}} fora de um {{#if}} (linha ' + linhaDe(tpl, m.index) + ')');
      no.senao = [];
      no.emSenao = true;
    } else if (tag === '/each' || tag === '/if') {
      const esperado = tag.slice(1);
      const no = topo();
      if (no.tipo !== esperado)
        throw new Error(arquivo + ': {{/' + esperado + '}} fecha um {{#' + no.tipo + '}} (linha ' + linhaDe(tpl, m.index) + ')');
      pilha.pop();
    } else {
      empurrar(topo(), { tipo: 'valor', expr, linha: linhaDe(tpl, m.index) });
    }
  }
  texto(tpl.slice(pos));

  if (pilha.length > 1) {
    const aberto = pilha[pilha.length - 1];
    throw new Error(arquivo + ': {{#' + aberto.tipo + ' ' + aberto.expr + '}} da linha ' + aberto.linha + ' nunca foi fechado');
  }
  return raiz;
}

function linhaDe(s, i) {
  return s.slice(0, i).split('\n').length;
}

/* Empurra um filho para o ramo certo do {{#if}} (antes ou depois do else). */
function empurrar(no, filho) {
  if (no.tipo === 'if' && no.emSenao) no.senao.push(filho);
  else no.filhos.push(filho);
}

/* ----------------------------------------------------------------- lookup */

/* `permissivo` só vale para {{#if}}: lá, campo que não existe é a MESMA coisa
   que campo vazio — é assim que `brinde: null` (ou simplesmente não escrever
   `brinde`) faz o bloco inteiro sumir da página. Em {{campo}} a busca é
   estrita: um caminho errado ali significa um buraco no lugar do preço. */
function buscar(expr, ctx, raiz, arquivo, linha, permissivo) {
  const bruto = expr.trim();
  if (bruto === '' ) throw new Error(arquivo + ':' + linha + ': {{ }} vazio');
  if (bruto === '.' || bruto === 'this') return ctx.valor;

  let partes = bruto.split('.');
  let atual;

  if (partes[0] === '$') {                 // {{$.campo}} volta para a raiz
    atual = raiz;
    partes = partes.slice(1);
  } else if (partes[0].charAt(0) === '@') { // variáveis do laço
    const nome = partes[0];
    if (!(nome in ctx.laco)) {
      if (permissivo) return undefined;
      throw new Error(arquivo + ':' + linha + ': ' + nome + ' só existe dentro de {{#each}}');
    }
    atual = ctx.laco[nome];
    partes = partes.slice(1);
  } else {
    // procura no contexto do item; se não achar, cai para a raiz
    atual = (ctx.valor && typeof ctx.valor === 'object' && partes[0] in ctx.valor) ? ctx.valor : raiz;
  }

  for (const p of partes) {
    if (atual === null || atual === undefined) {
      if (permissivo) return undefined;
      throw new Error(arquivo + ':' + linha + ': "' + bruto + '" — "' + p + '" não existe (o caminho morreu antes)');
    }
    if (!(p in atual)) {
      if (permissivo) return undefined;
      throw new Error(arquivo + ':' + linha + ': "' + bruto + '" não existe no config (faltou "' + p + '")');
    }
    atual = atual[p];
  }
  return atual;
}

/* Falso = null, undefined, false, '', 0, lista vazia. É o que faz um bloco
   inteiro sumir quando você zera o campo no config. */
function vazio(v) {
  if (v === null || v === undefined || v === false || v === '') return true;
  if (Array.isArray(v)) return v.length === 0;
  return false;
}

/* ----------------------------------------------------------------- render */

function renderNo(no, ctx, raiz, arquivo, saida) {
  for (const f of no.filhos) {
    if (f.tipo === 'texto') { saida.push(f.valor); continue; }

    if (f.tipo === 'valor') {
      const v = buscar(f.expr, ctx, raiz, arquivo, f.linha);
      if (v === null || v === undefined)
        throw new Error(arquivo + ':' + f.linha + ': "' + f.expr + '" é null — use {{#if}} para esconder o bloco');
      saida.push(String(v));
      continue;
    }

    if (f.tipo === 'if') {
      const v = buscar(f.expr, ctx, raiz, arquivo, f.linha, true);
      if (!vazio(v)) renderNo({ filhos: f.filhos }, ctx, raiz, arquivo, saida);
      else if (f.senao) renderNo({ filhos: f.senao }, ctx, raiz, arquivo, saida);
      continue;
    }

    if (f.tipo === 'each') {
      const lista = buscar(f.expr, ctx, raiz, arquivo, f.linha);
      if (!Array.isArray(lista))
        throw new Error(arquivo + ':' + f.linha + ': {{#each ' + f.expr + '}} — o campo não é uma lista');
      lista.forEach((item, i) => {
        renderNo({ filhos: f.filhos }, {
          valor: item,
          laco: {
            '@index': i,
            '@num': i + 1,
            '@pad': String(i + 1).padStart(2, '0'),
            '@first': i === 0,
            '@last': i === lista.length - 1,
            '@total': lista.length
          }
        }, raiz, arquivo, saida);
      });
      continue;
    }
  }
}

function render(tpl, dados, arquivo) {
  arquivo = arquivo || 'template';
  const arvore = parse(tpl, arquivo);
  const saida = [];
  renderNo(arvore, { valor: dados, laco: {} }, dados, arquivo, saida);
  return saida.join('');
}

module.exports = { render, parse };
