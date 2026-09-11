# Preço: onde mexer

**A fonte única é `catalogo.js`, na raiz.** Não existe segundo lugar.

- `api/criar-pix.js` faz `require` dele — é o valor que vira a cobrança Pix.
- `build.js` GERA daqui os blocos `KORVEX` e `KITS` do bundle, e CONFERE os
  preços escritos como texto no HTML. Divergência **quebra o build**.
- `dev-server.js` (dublê local) também lê daqui.

## Para mudar um preço

1. **Mude primeiro na Korvex.** O painel é quem cobra de verdade nas ofertas do
   checkout hospedado; se a página baixar o preço antes, a Korvex cobra o velho.
2. Confira o valor real que a Korvex está cobrando (ver abaixo).
3. Edite `catalogo.js`.
4. `node build.js` — se reclamar de preço, o HTML ficou para trás; ajuste o
   texto em `src/body.html` e rode de novo.
5. `vercel --prod --yes` e **confira `vercel alias ls`**: `vercel --prod` promove
   só parte dos aliases, e `ritualdapele.vercel.app` já ficou preso em deploy
   antigo mais de uma vez.

## Como ler o preço real da Korvex

O checkout hospedado é SPA — `curl` não devolve o preço. Abra no navegador:

    https://checkout.korvex.com.br/checkout/<PRODUTO>?offer=<CODE>

e leia "Subtotal / Total" na tela. Os códigos estão em `catalogo.js`.

## Por que isto existe

Em 30/08/2026 os preços foram arredondados só em `src/`. O `api/criar-pix.js`
tinha uma cópia própria da tabela e ficou com os valores velhos. Por um dia a
página exibiu R$ 37,90 e o Pix cobrou R$ 38,14 — em todas as ofertas, e o frete
expresso cobrou R$ 12,90 anunciado a R$ 9,90. Quem gerou Pix nesse período viu
um valor diferente no app do banco e teve todo motivo para desistir.

O `tools/aplica-precos.js` que existia aqui foi **removido de propósito**: ele
editava `src/` por busca-e-substituição e não enxergava `api/`, então dava a
sensação de ter atualizado tudo. Era parte do problema, não da solução.
