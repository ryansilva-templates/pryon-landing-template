/* Correção do fbc nos dois handlers.
   Bug: 'fb.1.' era fixo e o timestamp era o do evento.
   O pixel deste domínio produz 'fb.2.' — índice de subdomínio conta os rótulos
   acima do domínio registrável (vercel.app é sufixo público, então
   ritualdapele.vercel.app tem índice 2). Com o índice errado, a Meta não parea
   o evento com o clique no anúncio. */
const fs = require('fs');
const D = 'C:/Users/ryans/Desktop/lp-hidrabene-kit/api/';

const NOVA = `// A Meta espera fbc no formato fb.<indice_subdominio>.<hora_do_clique>.<fbclid>.
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
}`;

const ANTIGA = `// A Meta espera fbc no formato fb.1.<timestamp_ms>.<fbclid>
function montarFbc(fbclid, quando) {
  if (!fbclid) return null;
  if (String(fbclid).startsWith('fb.')) return String(fbclid);
  return 'fb.1.' + (quando || Date.now()) + '.' + fbclid;
}`;

for (const arquivo of ['capi.js', 'korvex-webhook.js']) {
  let s = fs.readFileSync(D + arquivo, 'utf8');
  if (!s.includes(ANTIGA)) throw new Error('montarFbc antiga não encontrada em ' + arquivo);
  s = s.replace(ANTIGA, NOVA);
  fs.writeFileSync(D + arquivo, s);
  console.log(arquivo + ': montarFbc corrigida');
}

// No webhook, o fbc pronto que a Korvex repassa tem prioridade sobre o fbclid cru.
let w = fs.readFileSync(D + 'korvex-webhook.js', 'utf8');
const alvoW = `  const fbclid = achar(corpo, ['fbclid', 'fbc', '_fbc']);`;
const novoW = `  // Ordem importa: o fbc pronto (montado pelo pixel e repassado pela Korvex na
  // URL do checkout) vale mais que o fbclid cru, porque carrega o horário do
  // clique de verdade. O fbclid só entra se o fbc não tiver vindo.
  const fbcPronto = achar(corpo, ['fbc', '_fbc']);
  const fbclid = fbcPronto || achar(corpo, ['fbclid']);`;
if (!w.includes(alvoW)) throw new Error('linha do fbclid não encontrada no webhook');
w = w.replace(alvoW, novoW);
fs.writeFileSync(D + 'korvex-webhook.js', w);
console.log('korvex-webhook.js: fbc pronto tem prioridade sobre fbclid');
