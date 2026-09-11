# AI-INSTRUCTIONS.md

**Leia este arquivo inteiro antes de tocar em qualquer coisa deste repositório.**

Este projeto é o **PRYON Landing Master**: a estrutura da landing page
**Ritual da Pele** (https://ritualdapele.vercel.app), extraída como template
reutilizável. Quando o usuário trouxer um produto novo — um site, um print,
um link de concorrente, uma descrição — a tarefa é:

> **ESTRUTURA daqui + CONTEÚDO do produto novo = nova landing page.**

Não é "inspirar-se". É usar esta arquitetura como referência principal.

---

## 0. O ponto principal é CONVERSÃO

Antes de qualquer coisa: **leia [`docs/CONVERSAO.md`](docs/CONVERSAO.md).**

O que este template carrega não é um layout. É uma **máquina de conversão** com
uma ordem específica, uma matemática de oferta específica e uma sequência de
quebra de objeção específica:

- **o funil inteiro** — do anúncio ao Purchase, degrau por degrau
- **a primeira dobra** — por que o botão vem logo depois da escolha da oferta, e
  por que a prova social vem antes do título
- **a arquitetura da oferta** — custo marginal decrescente, desconto que cresce
  com o tamanho, preço por dia, a opção do meio pré-selecionada, o brinde que
  vale mais que a oferta de entrada
- **a escada de objeção** — qual seção mata qual objeção, e por que nessa ordem
- **o sistema de CTA** — 3 botões de compra, primeira pessoa, linha de risco
- **a pilha de prova** e a **pilha de reversão de risco**
- **a remoção de atrito no checkout**
- **as micro-conversões** que dizem onde a página está perdendo gente

E [`docs/COPY.md`](docs/COPY.md) traz as **fórmulas de texto** de cada bloco,
extraídas das linhas que estão no ar — título, qualificação, subtítulo,
mecanismo, passos, linha do tempo, avaliações, comparativo, garantia, FAQ,
fechamento e CTA.

**O visual é consequência da máquina, não o contrário.** Uma página que ficou
bonita e perdeu a ordem das objeções, ou a escada de preço, ou o botão na
primeira dobra, não é este template — é o layout dele.

Ao adaptar um produto novo, a pergunta em cada seção **não** é "que texto ponho
aqui?". É: **"que objeção esta seção mata neste produto, e qual conteúdo mata
essa objeção?"**

---

## 1. A regra que decide tudo

| | |
|---|---|
| **Ritual da Pele** | referência de **ESTRUTURA** |
| **Produto novo** | fonte de **CONTEÚDO, identidade, imagens e ofertas** |

**NUNCA copie da Ritual da Pele:** textos, claims, depoimentos, nomes de
ativos, informações do produto, imagens, identidade de marca, promessas de
resultado. Nada disso serve para outro produto, e boa parte é regulada.

**SEMPRE copie da Ritual da Pele:** a ordem das seções, a hierarquia de
informação, a estrutura do hero, a lógica das ofertas, o padrão dos cards, o
padrão dos CTAs, o ritmo visual, a responsividade, a experiência mobile e a
lógica de conversão.

Se você está escrevendo texto de produto dentro de `src/`, **parou de seguir o
template**. Todo conteúdo mora em `config/produtos/<produto>.js`.

---

## 2. O que é estrutura e o que é conteúdo

```
config/produto.js              ← ponteiro: qual produto esta cópia vende
config/produtos/
  ritual-da-pele.js            ← DEMO PREENCHIDO. Referência. Não apagar.
  _NOVO-PRODUTO.js             ← esqueleto comentado. Copiar daqui.
  <seu-produto>.js             ← o CONTEÚDO. É aqui que você trabalha.

src/body.html                  ← ESTRUTURA. Só tags e campos {{ }}.
src/part1-head.html            ← head, pixel, captura de UTM.
src/tema.css                   ← sistema visual: tokens, tipografia, botões.
src/secoes.css                 ← layout de cada seção.
src/app.js                     ← interações + tracking + checkout.
src/checkout.html              ← modal de pagamento em 4 passos.

catalogo.js                    ← deriva o preço do config. FONTE ÚNICA.
build.js                       ← junta tudo em index.html.
tools/render.js                ← o mini-renderizador de template.
```

**Regra prática:** trocar de produto deve tocar **apenas**
`config/produtos/<produto>.js`, `config/produto.js`, os arquivos em `public/`
e o texto jurídico em `src/pg-*.html`. Se você precisou editar `body.html`
para trocar uma frase, **o campo está faltando no config** — adicione o campo
e o `{{ }}` correspondente, nunca o texto solto.

---

## 3. Estrutura real da página (a ordem é uma decisão de conversão)

Esta é a estrutura **que existe de fato** neste repositório, na ordem exata.
Não invente seções; não reordene sem motivo declarado.

| # | Seção | Âncora | Função na conversão |
|---|---|---|---|
| 0 | Barra de aviso rotativa | — | Remove atrito antes da leitura: frete, garantia, pagamento. Rotaciona 3 mensagens. |
| 1 | Cabeçalho sticky | — | Navegação + CTA que leva à oferta (não abre o checkout: quem clica no topo ainda não escolheu). |
| 2 | **HERO / PRIMEIRA DOBRA** | `#oferta` | Foto → nota → título → subtítulo → **preço → escolha do kit → BOTÃO** → brinde → escassez → selos. |
| 3 | Mecanismo | — | Por que o que a pessoa já tentou falhou. 3 itens numerados. Transforma "mais um produto" em "a peça que faltava". |
| 4 | Protocolo / Como funciona | `#protocolo` | Produto apresentado **por função**, um passo por item da caixa. Impede querer comprar só uma parte. + rotina + advertências. |
| 5 | Linha do tempo | `#resultados` | Expectativa realista, semana a semana. Segura o arrependimento e justifica o kit maior. |
| 6 | Prova em vídeo | — | Carrossel de vídeos verticais + um vídeo em destaque com som. |
| 7 | Avaliações | `#avaliacoes` | Nota agregada + carrossel de textos + fita de fotos de clientes. |
| 8 | Comparativo | — | Tabela contra as alternativas. Quebra "dá pra resolver mais barato de outro jeito". |
| 9 | Entrega e segurança | `#entrega` | Pagamento, prazo, frete. Última objeção logística. |
| 10 | Garantia | `#garantia` | Sozinha na seção, de propósito. Transfere o risco para a loja. |
| 11 | FAQ | `#faq` | Objeção mais cara primeiro. A primeira abre sozinha. |
| 12 | Fechamento | — | Repete a oferta para quem leu tudo. Sem novidade: só a decisão. |
| 13 | Rodapé | — | Marca, selos, atendimento, institucional, disclaimer. |
| 14 | Barra fixa (sticky CTA) | — | Aparece só quando nenhum botão de compra está visível. Repete a escolha de oferta. |
| — | Modal de checkout | — | 4 passos na própria página. Não é seção: é overlay. |

**Por que o hero está nessa ordem:** o botão vem **logo abaixo da escolha do
kit**, não depois de brinde e aviso de estoque. Quem já decidiu não precisa
rolar por argumento nenhum. Isso subiu o CTA ~110px na versão original. Se
você reordenar o hero, está desfazendo uma decisão testada.

**Seções que podem sair sem quebrar nada** (basta `null`/lista vazia no
config): brinde, escassez, rotinas, cuidados, UGC, vídeo em destaque, thumbs
do hero, nota do comparativo, fecho do mecanismo.

**Seções que não devem sair:** hero, oferta, garantia, FAQ, fechamento,
barra fixa. Tirar qualquer uma delas é tirar um degrau da conversão.

---

## 4. O DNA visual — o que preservar

- **UM acento.** O rosa (`--rs`) aparece no que é clicável e em quase nada
  mais. Produto novo troca a cor; **não** troca a regra de "um acento só".
- **Superfície é branco com fio de 1px.** Sombra só onde há elevação real
  (barra fixa e modal). Gradiente só no selo de desconto.
- **Hierarquia vem de tamanho, peso e espaço** — não de cor e caixa.
- **Movimento só onde comunica:** os carrosséis e o revelar de entrada. Existe
  **uma** `@keyframes` no projeto inteiro (`r-slide`, o marquee) e 13
  `transition`. Isso é intencional.
- **Tipografia:** display serifado (`--dsp`) só em H1/H2 e no `<em>` do
  acento; texto sem serifa (`--txt`) no resto.
- **Respiro:** `--wrap: 1120px`, padding lateral 20px no celular e 32px a
  partir de 768px. Seções com `clamp(52px, 8vw, 92px)` de padding vertical.
- **Breakpoints reais:** 520, 640, 719, 760, 768, 820, 821, 860, 900, 940.
  Mobile-first; desktop é a exceção declarada.
- **`prefers-reduced-motion`** é respeitado — não adicione animação que ignore.

**O que É PARA MUDAR por produto:** paleta (`cores` no config), fontes
(`tipografia` + `public/fonts.css`), imagens, ícones usados, textos.

**O que NÃO É para mudar:** a grade, o ritmo vertical, as proporções do hero,
o padrão dos cards de oferta, o comportamento da barra fixa, a ordem do hero.

Se você estiver adicionando gradiente, glassmorphism, orbe girando no fundo,
CTA pulsante ou um card para cada frase — **pare**. Esse foi exatamente o
visual que a Ritual da Pele jogou fora no redesign, porque faz a marca parecer
improvisada.

---

## 5. Os ganchos que NENHUM redesign pode renomear

O `src/app.js` depende destes seletores. Renomear qualquer um quebra a página
em produção **sem erro de build**:

```
.of-kit          + data-i, data-offer, data-price="N", data-old="N"
.sk-kit[data-idx]  com um <b> dentro
.stickycta
.buycta          ← SÓ em botão de compra DENTRO do conteúdo
[data-open-checkout]
```

E os IDs de sincronia de preço:

```
hero-price   hero-old   hero-kit   disc-badge   perday-txt   cmp-price
```

**Armadilha documentada:** o botão da barra fixa **não pode** ter a classe
`buycta`. Essa classe marca "botão de compra dentro do conteúdo", e é o que o
observer da própria barra observa para decidir se aparece. Com ela lá, a barra
observa o próprio botão e pisca sem parar. O clique vem de
`data-open-checkout`, não de `buycta`.

Todo o resto (cenas de scroll, `.ps-dot`, `#timeline`, `#scn-valor`) tem
guarda de nulo no `app.js` e pode sair sem quebrar nada.

---

## 6. Ofertas e checkout

**Preço tem fonte única.** Ele vive em `ofertas` no config, é validado por
`catalogo.js` e é **gerado** para dentro do bundle por `build.js`. O backend
(`api/criar-pix.js`) lê o mesmo `catalogo.js`.

- Preço **sempre em centavos, inteiro**. `3790` = R$ 37,90. Float de dinheiro
  erra: `38.14 + 12.90` vira `51.040000000000006`.
- `deCentavos` (preço riscado) tem que ser **maior** que `centavos`. O build
  derruba se não for.
- Só **uma** oferta pode ter `destaque` (a tarja "MAIS VENDIDO").
- `ofertaPadrao` é a que abre selecionada — costuma ser a do meio.
- `ofertaComparativo` é a que aparece na linha de custo da tabela. É uma
  oferta **fixa**, não a selecionada: a linha fala de um período fixo.
- O número de ofertas é livre (1, 2, 3, 4…). A página se adapta.

**Nunca** escreva um preço como texto no HTML ou no config. Se precisar citar
um valor na copy, use os macros: `{{FRETE_EXPRESSO}}`, `{{PRECO_MENOR}}`,
`{{PRECO_PADRAO}}`. O build os substitui — e o build **quebra** se um preço
escrito à mão divergir do catálogo.

**Links de checkout** ficam só em `checkout.provedor/produtoId/baseCheckout`.
Se você encontrar um link de pagamento em qualquer outro arquivo, é bug.

**Chaves de API nunca entram no repositório** — só em `.env` (ver
`.env.example`).

---

## 7. Tracking — o que preservar e o que configurar

Configurável no config: `tracking.metaPixelId`, `tracking.storagePrefix`,
`tracking.utmify`, `tracking.janelaAtribuicaoDias`.
Secreto, só em `.env`: `META_CAPI_TOKEN`, `UTMIFY_API_TOKEN`, chaves do gateway.

Eventos, e de onde saem:

| Evento | Origem | Observação |
|---|---|---|
| `PageView` | head + `/api/capi` | mesmo `event_id` nos dois lados; a Meta deduplica |
| `ViewContent` | `app.js`, 1,2s após o load | quem fecha antes não conta |
| `AddToCart` | abertura do checkout e passo 1 | |
| `InitiateCheckout` | uma vez por sessão | não sai a cada reabertura do modal |
| `AddPaymentInfo` | geração do Pix | |
| `Purchase` | **só** `api/korvex-webhook.js` | quando o pagamento confirma de verdade |

**Não mova o Purchase para o navegador.** `api/capi.js` é endpoint público e
recusa Purchase de propósito — senão qualquer um forja venda na conta.

**Trava de desenvolvimento:** `window.HB_LOCAL` bloqueia todo disparo em
`localhost`. Não a remova, e **não** adicione `.vercel.app` à lista de
bloqueio: a produção roda lá.

**UTMs:** um clique novo **substitui** o anterior, não mistura. Guardar por
merge fazia a campanha B herdar o `utm_content` da campanha A e creditar a
venda ao criativo errado. A janela é a mesma da Meta (7 dias).

---

## 8. Processo para adaptar um produto novo

**ETAPA 1 — Analisar o produto novo.**
Leia o site/material que o usuário deu. Extraia: o que é, para quem, qual a
dor, o que promete, quais os itens/variações, preço e preço "de", provas
existentes (avaliações reais, vídeos, fotos), diferenciais, quem entrega, qual
o gateway.

**ETAPA 2 — Mapear para a MÁQUINA, não para o layout.**
Para cada seção, a pergunta é *que objeção ela mata neste produto?* — e só
depois *que conteúdo mata essa objeção?*. Use a tabela do item 3 junto com a
escada de objeção de [`docs/CONVERSAO.md §5`](docs/CONVERSAO.md). Exemplos:
- Produto de 1 item só? O "Protocolo" vira "Como usar" com 3 passos de uso — a
  função (justificar o que ela está pagando) continua a mesma.
- Produto digital? "Entrega e segurança" fala de acesso imediato, não de frete.
- Sem avaliações reais? `avaliacoes.itens: []` e **tire a nota do hero**.

**ETAPA 2b — Montar a escada de oferta antes de escrever qualquer texto.**
A matemática vem primeiro; a copy justifica a matemática, não o contrário.
Ver [`docs/CONVERSAO.md §3`](docs/CONVERSAO.md):
- o salto de preço tem que **encolher** a cada degrau;
- o desconto tem que **crescer** com o tamanho;
- `dias` tem que ser a duração **real** (é o denominador do "por dia");
- a opção do **meio** abre pré-selecionada e leva a tarja;
- se houver brinde, ele deve valer **mais** que a oferta de entrada;
- cada opção precisa da **sua própria razão de existir** — "1un, 2un, 3un" é
  lista de SKU, não escada de oferta.

**ETAPA 3 — Declarar o que falta.**
Liste para o usuário o que o material dele não cobre (imagens, código de
oferta no gateway, pixel, e-mail de atendimento, CNPJ). **Não invente**:
depoimento fabricado e claim de resultado inventado são risco jurídico, não
licença poética.

**ETAPA 4 — Preencher o config.**
`cp config/produtos/_NOVO-PRODUTO.js config/produtos/<produto>.js`, preencher,
apontar `config/produto.js`.

**ETAPA 5 — Trocar imagens e vídeos.**
Ver item 9.

**ETAPA 6 — Reescrever o texto jurídico.**
`src/pg-termos.html`, `src/pg-privacidade.html`, `src/pg-rastrear-pedido.html`
são **texto jurídico**. Os campos de marca são substituídos automaticamente,
mas o conteúdo precisa refletir a operação real: prazo, forma de pagamento,
quem é o vendedor, como se rastreia. Publicar a política de outro produto é
risco jurídico.

**ETAPA 7 — Rodar e conferir.**
```bash
node build.js && node tools/contraste.js && node dev-server.js
```
Percorrer o `CHECKLIST.md` **e a auditoria de conversão**
([`docs/CONVERSAO.md §12`](docs/CONVERSAO.md)) — 31 itens sobre a máquina estar
montada, não sobre a página estar bonita. Menos de 25 marcados significa que
você usou o layout do template, não o template.

E a checagem de copy de [`docs/COPY.md §15`](docs/COPY.md), que pega os erros
mais comuns: título que serve para qualquer produto, mecanismo que culpa a
pessoa, linha do tempo que promete resultado na semana 1, garantia que não diz
como acionar, tabela comparativa em que você ganha em 100% das linhas.

---

## 9. Como substituir imagens

```
public/images/product/        foto principal + itens da caixa + miniatura
public/images/offers/         imagens específicas de kit/combo (opcional)
public/images/testimonials/   fotos enviadas por clientes (UGC)
public/images/benefits/       ilustrações de benefício (opcional)
public/images/banners/        brinde, faixas
public/images/brand/          logo, favicon
public/media/                 vídeos .mp4 + poster .webp
```

Regras que vieram de problemas reais:

- **Hero:** 3 tamanhos (`@sm` 480, normal 760, `@2x` 1160), WebP, quadrado. O
  produto tem que ocupar **70%+ do quadro** — na foto original ocupava 33,8% e
  parecia um item perdido numa mesa. Recorte antes de exportar.
- **Poster de vídeo:** `preload="none"` segura o MP4 mas **NÃO** segura o
  poster — o atributo `poster` baixa a imagem na hora, sempre. Por isso o
  template usa `data-poster` e um IntersectionObserver. Exporte o poster em
  **WebP, no tamanho de exibição**. Eram 211KB de JPG por carrossel; viraram
  97KB.
- **Sempre declare `width` e `height`** no HTML. É o que evita o layout pulando.
- Formato: WebP para imagem, MP4 (h264) para vídeo, vertical 9:16 nos vídeos.

---

## 10. Como substituir textos

Todo texto está em `config/produtos/<produto>.js`, numerado por seção (1 a
23), na mesma ordem da página. Campos que aceitam HTML: `titulo`, `subtitulo`,
`texto`, `lead`, `fecho`, `r` (resposta de FAQ), `escassez`, `garantia.*`.
Use só `<b>`, `<em>`, `<br>` e `<a>`.

- `<em>` em H1/H2 vira **itálico no acento**. Use na palavra que carrega a
  promessa, uma por título.
- `<b>` no corpo é para a informação que a pessoa levaria embora se lesse só
  os negritos.
- CTA em **primeira pessoa** ("Quero meu kit"), não imperativo genérico
  ("Comprar agora").
- Citou um preço na copy? Use macro, nunca o número.

---

## 11. O que o build garante (e por que ele derruba)

`node build.js` sai com erro quando:

- um `{{campo}}` do template não existe no config;
- sobrou placeholder no HTML final;
- o preço renderizado diverge do catálogo;
- uma linha do comparativo tem número de valores diferente do de colunas;
- uma cor do config não é hex válido ou não é um token conhecido;
- o CSS tem chave desbalanceada ou declaração fora de bloco;
- o HTML tem `<section>`, `<div>`, `<button>` ou `<form>` desbalanceado.

Cada uma dessas travas existe por causa de um estrago real em produção. **Não
comente, não afrouxe, não contorne uma trava para "fazer passar".** Se ela
está reclamando, ela está certa.

**Nunca edite `index.html`, `termos.html`, `privacidade.html` ou
`rastrear-pedido.html` na mão.** São gerados; a próxima build apaga.

---

## 12. Armadilhas que já custaram caro

1. **Nada de código em `api/` que não seja handler HTTP.** A Vercel transforma
   todo arquivo dali em função serverless. Script de manutenção vai em `tools/`.
2. **`vercel --prod` não promove todos os aliases.** Confira com
   `vercel alias ls` e, se preciso, `vercel alias set <deployment> <dominio>`.
3. **Remover CSS por linha quebra regras.** Apagar por seletor deixa linhas
   órfãs, o parser descarta o bloco seguinte e o estrago vai para produção sem
   erro. O build tem uma trava para isso — respeite-a.
4. **O modal guarda o passo entre aberturas.** Se a pessoa gera o Pix, fecha,
   troca de oferta e reabre, o resumo é redesenhado com o preço novo. O código
   Pix **tem** que ser invalidado — o valor do campo 54 do BR Code precisa
   bater com o total exibido.
5. **Não faça polling em API de terceiro.** Um monitor de 3 em 3 minutos fez o
   WAF do fornecedor bloquear a origem e derrubou o checkout.
6. **`outputDirectory: "."` no `vercel.json` é obrigatório.** Sem ele, a Vercel
   trata `public/` como diretório de saída e serve o conteúdo dele na raiz —
   todos os `/public/images/...` dariam 404.

---

## 13. Quando estiver em dúvida

1. Abra `docs/CONVERSAO.md` e pergunte **que objeção esta seção mata**.
2. Abra `docs/COPY.md` e use a fórmula do bloco.
3. Abra `config/produtos/ritual-da-pele.js` e veja como o campo foi preenchido.
4. Abra https://ritualdapele.vercel.app e veja o campo renderizado.
5. Leia `docs/ESTRUTURA.md` para a função de cada seção.
6. Se ainda estiver em dúvida sobre conteúdo do produto, **pergunte ao
   usuário**. Não invente claim, depoimento, preço nem prazo de entrega.
