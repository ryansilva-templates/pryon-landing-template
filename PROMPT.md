# PROMPT — como pedir a adaptação para uma IA

Este arquivo existe para ser **copiado e colado**. Você entrega o repositório à
IA (Claude Code, ou qualquer uma que consiga ler os arquivos) junto com o
material do produto novo, e cola o prompt abaixo.

**Antes de colar, troque só o bloco `PRODUTO NOVO`.** O resto é o que garante
que a página saia com a máquina de conversão montada, e não com o layout
preenchido.

---

## 1. O prompt principal — adaptar um produto novo

```
Você vai criar uma landing page de venda usando este repositório como
referência de ESTRUTURA E CONVERSÃO. Ele é o PRYON Landing Master, extraído de
uma LP de produto físico que está no ar e vendendo no Pix.

ANTES DE ESCREVER QUALQUER COISA, leia nesta ordem:
  1. AI-INSTRUCTIONS.md
  2. docs/CONVERSAO.md      <- o mais importante
  3. docs/COPY.md
  4. config/produtos/ritual-da-pele.js   (o exemplo preenchido)

A REGRA QUE DECIDE TUDO
  Deste repositório vem: a ordem das seções, a hierarquia de informação, a
  estrutura do hero, a matemática da escada de oferta, a sequência de quebra de
  objeção, o padrão dos CTAs, a lógica do checkout Pix e o sistema visual.
  Do produto novo vem: todo o conteúdo, a identidade, as imagens e as ofertas.
  NÃO copie textos, claims, depoimentos, nomes de ativos, imagens ou marca da
  página de referência. Nada disso serve para outro produto, e boa parte é
  regulada.

O QUE EU QUERO: uma página com PODER DE PERSUASÃO PARA COMPRA NO PIX.
Isso não é a mesma coisa que uma página de cartão. Siga docs/CONVERSAO.md §9:
  - Pix não parcela: a oferta inteira tem que caber à vista, e o preço por dia
    é o único reenquadramento de valor disponível. Preencha `dias` com a
    duração REAL de uso.
  - Pix não tem estorno: quem paga não tem a proteção da bandeira. A garantia
    ocupa o lugar do chargeback, e por isso ela precisa dizer o PASSO ÚNICO
    para acionar, não só que existe.
  - "Aprovação na hora" é o único ponto em que o Pix ganha do cartão. Ele tem
    que aparecer na barra do topo, no chip do preço, nos selos do hero e na
    linha embaixo do CTA.
  - O último metro (o app do banco) é onde se perde a venda. Mantenha os
    avisos do passo 3 do checkout, principalmente a frase que diz QUAL NOME
    aparece no extrato de quem paga. Se você não souber o nome, me pergunte.

PROCESSO, NESTA ORDEM

ETAPA 1 — Analise o material do produto novo e me diga o que você extraiu:
  o que é, para quem, qual a dor, o que promete, itens/variações, preço e
  preço "de", provas que EXISTEM (avaliações reais, vídeos, fotos),
  diferenciais, quem entrega, qual o gateway.

ETAPA 2 — Me liste o que falta antes de começar. Não invente nada: imagem,
  código de oferta no gateway, ID do pixel, e-mail de atendimento, CNPJ,
  prazo de entrega e depoimento são coisas que eu preciso fornecer.
  Depoimento fabricado e claim de resultado inventado são risco jurídico.

ETAPA 3 — Monte a ESCADA DE OFERTA antes de escrever uma linha de copy
  (docs/CONVERSAO.md §3). Me mostre a tabela e confirme comigo:
  - o salto de preço tem que ENCOLHER a cada degrau
  - o desconto tem que CRESCER com o tamanho da oferta
  - a opção do MEIO abre pré-selecionada e leva a tarja
  - cada opção precisa da SUA razão de existir (remove risco / justificativa
    social / justificativa clínica) — "1un, 2un, 3un" é lista de SKU
  - se houver brinde, ele deve valer MAIS que a oferta de entrada

ETAPA 4 — Para cada seção, responda primeiro "que objeção ela mata neste
  produto?" e só depois escreva. Use a escada de objeção de
  docs/CONVERSAO.md §5 e as fórmulas de docs/COPY.md.

ETAPA 5 — Preencha config/produtos/<produto>.js a partir de
  config/produtos/_NOVO-PRODUTO.js e aponte config/produto.js para ele.
  TODO conteúdo mora nesse arquivo. Se você precisou editar src/body.html para
  trocar uma frase, o campo está faltando no config: adicione o campo, não o
  texto solto.

ETAPA 6 — Reescreva o texto jurídico de src/pg-termos.html,
  src/pg-privacidade.html e src/pg-rastrear-pedido.html para a operação real.
  A marca é substituída sozinha, mas prazo, forma de pagamento, quem é o
  vendedor e como se rastreia precisam ser verdade.

ETAPA 7 — Rode e me mostre o resultado:
    node build.js && node tools/contraste.js && node dev-server.js
  Depois percorra a auditoria de conversão (docs/CONVERSAO.md §12, 31 itens),
  a checagem de copy (docs/COPY.md §15, 16 itens) e o CHECKLIST.md.
  Me diga quantos itens passaram e quais não.

REGRAS QUE NÃO SE NEGOCIAM
  - Não invente avaliação, depoimento, nota ou número de clientes. Se o produto
    não tem avaliação: `avaliacoes.itens: []` E tire a nota do hero.
  - Não invente prazo de entrega, claim de resultado nem contraindicação.
  - Escassez só se for verdade. Se não for, `hero.escassez: null`.
  - Preço SEMPRE em centavos, inteiro, e só no config. Nunca digite um preço
    na copy: use os macros {{PRECO_PADRAO}}, {{PRECO_MENOR}},
    {{FRETE_EXPRESSO}}.
  - Não renomeie os 5 ganchos que o app.js exige (AI-INSTRUCTIONS.md §5).
  - Não comente nem afrouxe nenhuma trava do build para "fazer passar".
  - Nenhuma chave, token ou senha no repositório — só em .env.

PRODUTO NOVO
[cole aqui: o link do site, o print, a descrição, os preços, as imagens que
você tem, o nome da marca, o e-mail de atendimento, e qual gateway vai usar]
```

---

## 2. Variação — quando já existe uma página do produto

Troque o bloco final do prompt por este:

```
PRODUTO NOVO
Aqui está a página atual do produto: [link ou arquivo]

Analise essa página e me diga, antes de mexer em qualquer coisa:
  - o que ela já faz bem e deve ser preservado como CONTEÚDO
  - onde ela perde venda em relação à estrutura deste template
    (ordem das seções, escada de oferta, objeções não respondidas,
     CTA fraco, prova mal posicionada, garantia sem o "como")
  - o que existe nela que eu não devo reaproveitar

Depois reestruture o conteúdo dela dentro da arquitetura deste repositório.
O conteúdo é dela; a máquina de conversão é daqui.
```

---

## 3. Variação — só revisar a conversão de uma página já feita no template

```
Esta página já foi montada com o PRYON Landing Master. Faça uma auditoria de
conversão, sem mexer no código ainda.

Leia docs/CONVERSAO.md e docs/COPY.md e percorra as duas checagens:
  - docs/CONVERSAO.md §12 (31 itens)
  - docs/COPY.md §15 (16 itens)

Para cada item reprovado, me diga: o que está errado, por que isso custa venda,
e qual seria a correção. Ranqueie por impacto. Só depois de eu aprovar, aplique.
```

---

## 4. O que dizer para o sócio, em uma linha

> Duplica o repositório com **"Use this template"**, lê o `README.md`, preenche
> `config/produtos/<produto>.js`, troca as imagens em `public/`, e roda
> `node build.js`. Se quiser que uma IA faça, cola o prompt do `PROMPT.md`.

---

## 5. A armadilha que o build agora impede

Ao duplicar, é fácil esquecer de trocar os IDs e publicar com os dados da LP de
referência. As consequências não são cosméticas:

| Campo esquecido | O que acontece |
|---|---|
| `tracking.metaPixelId` | o tráfego pago de um produto alimenta o pixel de **outro**; os dois públicos se contaminam e as duas campanhas otimizam errado |
| `checkout.produtoId` ou `code` da oferta | a venda é criada na conta de **outra pessoa** no gateway — o dinheiro entra na conta errada |
| `tracking.storagePrefix` | duas LPs no mesmo domínio dividem a mesma atribuição de UTM |

O `node build.js` **derruba** se qualquer um desses ainda for o da referência, e
diz exatamente qual. Não é aviso: é erro, e o build não gera nada.

Quem realmente quiser publicar a LP de referência como ela é usa
`PRYON_REFERENCIA=1 node build.js`.
