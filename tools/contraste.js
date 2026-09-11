/* ============================================================================
   CONTRASTE — mede a paleta do config contra a WCAG AA
     $ node tools/contraste.js

   Existe por causa de um caso real: o `--t3` (texto de legenda) nasceu
   #867680 e dava 3,74:1 no pior fundo. Reprovava o AA em 51 elementos da
   página, e ninguém percebeu no olho — o texto parecia "clarinho de
   propósito". Foi para #736570 (4,81:1).

   Ao trocar o acento de um produto novo, os quatro fundos mudam de uma vez.
   Rode isto ANTES de publicar. Não é acessibilidade por burocracia: legenda
   ilegível no celular ao sol é conversão perdida.
   ============================================================================ */

'use strict';

const PRODUTO = require('../config/produto.js');
const C = PRODUTO.cores;

function rgb(hex) {
  let h = hex.replace('#', '');
  if (h.length === 3) h = h.split('').map((c) => c + c).join('');
  return [0, 2, 4].map((i) => parseInt(h.slice(i, i + 2), 16));
}

/* Luminância relativa, fórmula da WCAG 2.x. */
function lum(hex) {
  const [r, g, b] = rgb(hex).map((v) => {
    const s = v / 255;
    return s <= 0.03928 ? s / 12.92 : Math.pow((s + 0.055) / 1.055, 2.4);
  });
  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

function razao(a, b) {
  const la = lum(a), lb = lum(b);
  return (Math.max(la, lb) + 0.05) / (Math.min(la, lb) + 0.05);
}

/* Os quatro fundos em que texto aparece na página. Um token de texto tem que
   passar no PIOR deles, não na média. */
const FUNDOS = [
  ['pp  (fundo da página)', C.pp],
  ['sf  (card branco)', C.sf],
  ['sf2 (superfície 2)', C.sf2],
  ['rsW (chip lavado)', C.rsW]
];

/* AA: 4.5 para texto normal, 3.0 para texto grande (>=24px ou >=18.66px bold)
   e para elementos de interface. */
const ALVOS = [
  ['t1 títulos', C.t1, 4.5],
  ['t2 corpo', C.t2, 4.5],
  ['t3 legendas', C.t3, 4.5],
  ['rs acento (texto e link)', C.rs, 4.5],
  ['au estrelas', C.au, 3.0],
  ['gr confirmação', C.gr, 4.5]
];

let falhou = false;
console.log('\nCONTRASTE DA PALETA —', PRODUTO.seo.siteName || '(sem nome)', '\n');

for (const [nome, cor, alvo] of ALVOS) {
  let pior = Infinity, piorFundo = '';
  for (const [rotuloFundo, fundo] of FUNDOS) {
    const r = razao(cor, fundo);
    if (r < pior) { pior = r; piorFundo = rotuloFundo; }
  }
  const ok = pior >= alvo;
  if (!ok) falhou = true;
  console.log(
    '  ' + nome.padEnd(26),
    cor.padEnd(9),
    'pior: ' + pior.toFixed(2) + ':1',
    '(alvo ' + alvo.toFixed(1) + ')',
    ok ? 'ok' : '*** REPROVA em ' + piorFundo + ' ***'
  );
}

/* O botão é texto branco sobre o acento. É o elemento mais clicado da página:
   se ele reprova, a pessoa não lê o que está prestes a fazer. */
const btn = razao('#FFFFFF', C.rs);
const btnOk = btn >= 4.5;
if (!btnOk) falhou = true;
console.log('\n  botão (branco sobre rs)   ', C.rs.padEnd(9), btn.toFixed(2) + ':1', '(alvo 4.5)', btnOk ? 'ok' : '*** REPROVA ***');

const btnD = razao('#FFFFFF', C.rsD);
console.log('  botão pressionado (rs-d)  ', C.rsD.padEnd(9), btnD.toFixed(2) + ':1', '(alvo 4.5)', btnD >= 4.5 ? 'ok' : '*** REPROVA ***');
if (btnD < 4.5) falhou = true;

if (falhou) {
  console.error('\n  PALETA REPROVADA. Escureça o token que falhou e rode de novo.\n');
  process.exitCode = 1;
} else {
  console.log('\n  paleta aprovada no AA.\n');
}
