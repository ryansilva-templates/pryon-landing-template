/* ============================================================================
   ATUALIZAR — traz melhorias do PRYON Landing Master para este projeto
   ----------------------------------------------------------------------------
     node tools/atualizar.js             ve o que mudou, sem tocar em nada
     node tools/atualizar.js --aplicar   aplica o que e seguro

   POR QUE ISTO EXISTE

   "Use this template" corta o cordao: a copia nasce sem ligacao com o
   original. Sem um caminho de volta, cada correcao feita no template precisa
   ser refeita a mao em cada projeto — seis paginas, seis vezes, e elas divergem
   um pouco mais a cada rodada ate ninguem saber qual esta certa.

   Aqui isso funciona porque o repositorio e separado em duas metades que nao se
   misturam:

     A MAQUINA  src/ build.js catalogo.js tools/ docs/   <- vem do template
     O PRODUTO  config/ public/ src/pg-*.html            <- e so seu

   O script puxa a maquina e nao encosta no produto.

   OS TRES NIVEIS

     1. SEMPRE SEGURO     documentacao e ferramentas. Nao afetam a pagina.
     2. SEGURO NO PADRAO  o motor. So conflita se voce editou src/ na mao —
                          o que o template pede para nao fazer.
     3. REVISAR O DIFF    estrutura e backend. Se voce adicionou uma secao ou
                          trocou de gateway, sobrescrever apaga o seu trabalho.
                          O script NUNCA aplica estes; so mostra.

   O QUE ELE NUNCA TOCA
     config/          o conteudo do seu produto
     public/          suas imagens e videos
     src/pg-*.html    seu texto juridico
     index.html e as paginas da raiz  (sao geradas por node build.js)
     .env             nem existe no repositorio
   ============================================================================ */

'use strict';

const { execFileSync } = require('child_process');
const path = require('path');
const fs = require('fs');

const RAIZ = path.join(__dirname, '..');
const UPSTREAM_PADRAO = 'https://github.com/ryansilva-templates/pryon-landing-template.git';

const NIVEL1 = {
  rotulo: 'SEMPRE SEGURO — documentacao e ferramentas',
  caminhos: ['docs', 'tools', 'AI-INSTRUCTIONS.md', 'PROMPT.md', 'CHECKLIST.md', 'README.md', 'CHANGELOG.md', 'UPGRADE.md']
};
const NIVEL2 = {
  rotulo: 'SEGURO NO PADRAO — o motor',
  caminhos: ['src/tema.css', 'src/secoes.css', 'src/base.css', 'src/add.css', 'src/pagina.css',
             'src/app.js', 'src/checkout.html', 'src/tpl-icons.svg',
             'build.js', 'catalogo.js', 'vercel.json', '.vercelignore', '.gitattributes']
};
const NIVEL3 = {
  rotulo: 'REVISAR O DIFF — o script nao aplica',
  caminhos: ['src/body.html', 'src/part1-head.html', 'api', 'package.json']
};

const APLICAR = process.argv.includes('--aplicar');

function git(args, silencioso) {
  try {
    return execFileSync('git', args, { cwd: RAIZ, encoding: 'utf8', stdio: silencioso ? ['ignore', 'pipe', 'ignore'] : ['ignore', 'pipe', 'pipe'] }).trim();
  } catch (e) {
    if (silencioso) return null;
    throw e;
  }
}

function morrer(msg) {
  console.error('\n  ' + msg + '\n');
  process.exit(1);
}

/* ------------------------------------------------------------- preparacao */

if (!fs.existsSync(path.join(RAIZ, '.git'))) morrer('Isto nao e um repositorio git.');

const remotes = (git(['remote'], true) || '').split('\n').filter(Boolean);
if (!remotes.includes('upstream')) {
  console.log('\n  Nao existe o remote "upstream". Adicionando…');
  git(['remote', 'add', 'upstream', UPSTREAM_PADRAO]);
  console.log('  upstream -> ' + UPSTREAM_PADRAO);
}

console.log('\n  Buscando novidades do template…');
if (git(['fetch', 'upstream', '--tags'], true) === null)
  morrer('Nao consegui falar com o upstream. Sem acesso ao repositorio, ou sem rede.\n  Confira:  git remote -v');

const REF = git(['rev-parse', '--verify', 'upstream/main'], true);
if (!REF) morrer('O upstream nao tem a branch main.');

/* ------------------------------------------------------------ comparacao */

/* Compara o upstream com a ARVORE DE TRABALHO, nao com o HEAD.

   Com HEAD, depois de `--aplicar` a previa continuava listando os mesmos
   arquivos — porque os arquivos ja tinham mudado no disco, mas o commit ainda
   nao existia. Quem rodasse de novo acharia que a atualizacao falhou.

   O sentido do diff e "do upstream para ca", entao as letras vem invertidas em
   relacao ao que se espera: um arquivo que existe no template e nao aqui
   aparece como D (sumiu, indo de la para ca) — do ponto de vista de quem le, e
   um arquivo novo no template. O mapa abaixo traduz isso. */
function mudancas(caminhos) {
  const saida = git(['diff', '--name-status', 'upstream/main', '--'].concat(caminhos), true);
  if (!saida) return [];
  return saida.split('\n').filter(Boolean).map((l) => {
    const [estado, ...resto] = l.split('\t');
    return { estado: estado[0], arquivo: resto.join('\t') };
  });
}

const SIMBOLO = {
  M: 'alterado',
  D: 'novo no template',        // existe la, nao existe aqui
  A: 'so no seu projeto',       // existe aqui, nao existe la — nao sera tocado
  R: 'renomeado'
};

function mostrar(nivel) {
  const m = mudancas(nivel.caminhos);
  console.log('\n  ' + nivel.rotulo);
  console.log('  ' + '-'.repeat(nivel.rotulo.length));
  if (!m.length) { console.log('    (nada mudou)'); return m; }
  m.forEach((x) => console.log('    ' + (SIMBOLO[x.estado] || x.estado).padEnd(18) + x.arquivo));
  return m;
}

/* Versao: vem da tag mais recente do upstream, nao do package.json — a tag e o
   que o template realmente publicou. */
const versaoUpstream = git(['describe', '--tags', '--abbrev=0', 'upstream/main'], true) || '(sem tag)';
const versaoLocal = git(['describe', '--tags', '--abbrev=0'], true) || '(sem tag)';

console.log('\n  ============================================================');
console.log('  PRYON Landing Master — atualizacao');
console.log('  ============================================================');
console.log('  seu projeto:  ' + versaoLocal);
console.log('  template:     ' + versaoUpstream);

const m1 = mostrar(NIVEL1);
const m2 = mostrar(NIVEL2);
const m3 = mostrar(NIVEL3);

const total = m1.length + m2.length + m3.length;
if (!total) {
  console.log('\n  Nada a fazer: este projeto ja esta na mesma versao do template.\n');
  process.exit(0);
}

/* -------------------------------------------------------------- aplicacao */

if (!APLICAR) {
  console.log('\n  ------------------------------------------------------------');
  console.log('  Isto foi so uma previa. Nada foi alterado.');
  if (m1.length + m2.length) console.log('  Para aplicar os dois primeiros niveis:  node tools/atualizar.js --aplicar');
  if (m3.length) {
    console.log('');
    console.log('  Os arquivos do nivel 3 nunca sao aplicados sozinhos. Veja o que');
    console.log('  mudou em cada um antes de decidir:');
    m3.forEach((x) => console.log('    git diff HEAD upstream/main -- ' + x.arquivo));
  }
  console.log('');
  process.exit(0);
}

/* Arvore suja + sobrescrita de arquivo = trabalho perdido sem aviso. */
const sujo = git(['status', '--porcelain'], true);
if (sujo) {
  console.error('\n  Ha alteracoes nao commitadas. Commite ou guarde antes de atualizar:');
  sujo.split('\n').slice(0, 10).forEach((l) => console.error('    ' + l));
  console.error('\n    git stash        (para guardar)');
  console.error('    git add -A && git commit -m "wip"\n');
  process.exit(1);
}

/* Arquivo que so existe aqui (A) nao deve ser apagado: pode ser um asset ou um
   config do proprio projeto dentro de uma pasta do nivel 1. So aplicamos onde
   ha diferenca real vinda do template. */
const aAplicar = NIVEL1.caminhos.concat(NIVEL2.caminhos)
  .filter((c) => mudancas([c]).some((x) => x.estado !== 'A'));

if (!aAplicar.length) {
  console.log('\n  Nada nos niveis 1 e 2 para aplicar.\n');
} else {
  console.log('\n  Aplicando…');
  git(['checkout', 'upstream/main', '--'].concat(aAplicar));
  aAplicar.forEach((c) => console.log('    ' + c));
  console.log('\n  Pronto. Agora:');
  console.log('    node build.js          <- obrigatorio, o index.html e gerado');
  console.log('    node tools/contraste.js');
  console.log('    git add -A && git commit -m "atualiza template para ' + versaoUpstream + '"');
}

if (m3.length) {
  console.log('\n  ------------------------------------------------------------');
  console.log('  NAO APLICADOS (nivel 3). Revise um por um:');
  m3.forEach((x) => console.log('    git diff HEAD upstream/main -- ' + x.arquivo));
  console.log('');
  console.log('  src/body.html e part1-head.html so devem ser sobrescritos se');
  console.log('  voce NAO adicionou secao nem campo proprio. Se adicionou, traga');
  console.log('  a mudanca a mao — o diff costuma ser pequeno.');
  console.log('  api/ so deve ser sobrescrito se voce usa o mesmo gateway.');
}
console.log('');
