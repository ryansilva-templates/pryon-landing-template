/* ============================================================================
   PRODUTO ATIVO — o único arquivo que você troca para mudar de produto.
   ----------------------------------------------------------------------------
   Aponte para o arquivo do produto que esta cópia do template vai vender.
   Todo o resto (build.js, catalogo.js, api/, src/) lê daqui.

   Para lançar um produto novo:
     1. cp config/produtos/_NOVO-PRODUTO.js config/produtos/meu-produto.js
     2. preencha config/produtos/meu-produto.js
     3. troque a linha abaixo para './produtos/meu-produto.js'
     4. node build.js

   Deixe `ritual-da-pele.js` no repositório. Ele é a referência preenchida —
   é olhando para ele que se entende o que cada campo faz na página.
   ============================================================================ */

module.exports = require('./produtos/ritual-da-pele.js');
