# PRYON Landing Master

Template mestre de landing page de produto físico, com checkout Pix na própria
página e rastreamento Meta em duas pontas (pixel + Conversions API).

A **estrutura** vem da LP [Ritual da Pele](https://ritualdapele.vercel.app),
que está no ar e vendendo. Este repositório extrai essa arquitetura para ser
reaproveitada: **a estrutura fica, o produto muda**.

Sem framework, sem bundler, sem dependência de front. `node build.js` gera um
`index.html` único com CSS e JS embutidos.

> ### O ponto principal é conversão
>
> O que está sendo reaproveitado aqui **não é o layout** — é a máquina de
> conversão: o funil, a matemática da escada de oferta, a ordem em que as
> objeções são quebradas, o sistema de CTA e as fórmulas de copy de cada bloco.
>
> **Comece por [`docs/CONVERSAO.md`](docs/CONVERSAO.md)** e por
> [`docs/COPY.md`](docs/COPY.md). O visual é consequência.

> **Vai pedir para uma IA adaptar?** O [`PROMPT.md`](PROMPT.md) tem o prompt
> pronto para copiar e colar — é ele que garante que a página saia com a máquina
> de conversão montada, e não com o layout preenchido. A IA, por sua vez, lê
> [`AI-INSTRUCTIONS.md`](AI-INSTRUCTIONS.md).

---

## Como usar este template

### 1. Duplique o repositório

No GitHub, clique em **"Use this template" → Create a new repository**. Você
recebe uma cópia limpa, sem o histórico deste repo.

Depois, na sua máquina:

```bash
git clone <a-sua-copia> minha-nova-lp
cd minha-nova-lp
npm install
```

`npm install` só instala `qrcode`, usado pelas funções em `api/`. O front não
tem dependência nenhuma.

> **O primeiro `node build.js` vai falhar de propósito.** O build derruba
> enquanto o config ainda tiver o pixel, o produto no gateway e os códigos de
> oferta da LP de referência — publicar assim mandaria venda e evento para a
> conta de outra pessoa. Ele diz exatamente qual campo falta trocar. Siga para
> o passo 2.

### 2. Coloque as informações do produto

```bash
cp config/produtos/_NOVO-PRODUTO.js config/produtos/meu-produto.js
```

Preencha `config/produtos/meu-produto.js` — ele está numerado por seção, na
mesma ordem da página, com `<<< PREENCHER` em tudo que é obrigatório.

Ao lado dele fica `config/produtos/ritual-da-pele.js`, **preenchido**. Quando
tiver dúvida sobre um campo, olhe lá e depois olhe o campo renderizado na
página no ar. **Não apague esse arquivo:** ele é a referência viva do template.

Aponte o produto ativo:

```js
// config/produto.js
module.exports = require('./produtos/meu-produto.js');
```

### 3. Substitua as imagens

```
public/images/product/        foto principal (3 tamanhos) + itens + miniatura
public/images/offers/         imagens de kit/combo (opcional)
public/images/testimonials/   fotos de clientes (UGC)
public/images/benefits/       ilustrações de benefício (opcional)
public/images/banners/        brinde, faixas
public/images/brand/          logo, favicon
public/media/                 vídeos .mp4 + poster .webp
```

Os caminhos são declarados no config — troque o arquivo **e** o caminho.

- Hero: WebP quadrado em 3 tamanhos (480 / 760 / 1160). O produto deve ocupar
  **70%+ do quadro**.
- Vídeo: MP4 vertical (9:16) + poster **WebP no tamanho de exibição**. O
  template usa `data-poster`, não `poster` — ver por quê em
  [`docs/DNA-VISUAL.md`](docs/DNA-VISUAL.md).

### 4. Configure as ofertas

No config, o array `ofertas`. Pode ter 1, 2, 3 ou mais — a página se adapta.

```js
{
  id: 'kit2',              // id interno, vai para o tracking
  code: 'ABC1234',         // código da oferta no gateway
  centavos: 5490,          // R$ 54,90  — SEMPRE em centavos, inteiro
  deCentavos: 13700,       // preço riscado (tem que ser maior)
  rotulo: '2 Kits Completos',
  rotuloCurto: '2 Kits',   // barra fixa
  desc: '4 meses de tratamento',
  sub: '4 meses · divida com quem você ama',
  unidades: 2, dias: 120,
  destaque: 'MAIS VENDIDO' // só UMA oferta pode ter
}
```

`ofertaPadrao` abre selecionada. `ofertaComparativo` é a que aparece na linha
de custo da tabela comparativa.

**Preço tem fonte única.** Ele nunca é escrito à mão em HTML: sai do config,
passa por `catalogo.js` e é gerado dentro do bundle. O backend lê o mesmo
arquivo. O build **quebra** se algum valor divergir.

### 5. Configure o checkout

Também no config, um lugar só:

```js
checkout: {
  provedor: 'korvex',
  produtoId: 'seu-id-no-gateway',
  baseCheckout: 'https://checkout.korvex.com.br/checkout/',
  freteExpressoCentavos: 990
}
```

O código de cada oferta é o campo `code` dela. **Não existe link de checkout
espalhado pelo código** — se você encontrar um, é bug.

As **chaves** do gateway vão em `.env`, nunca no repositório:

```bash
cp .env.example .env
```

### 6. Configure o Pixel

```js
tracking: {
  metaPixelId: '000000000000000',   // público, aparece no HTML
  storagePrefix: 'meuproduto',      // único por produto
  utmify: true,
  janelaAtribuicaoDias: 7
}
```

O **token** da Conversions API vai em `.env` (`META_CAPI_TOKEN`), nunca aqui.

### 7. Configure as UTMs

Já vem pronto. A captura guarda `utm_*`, `fbclid`, `gclid`, `ttclid`,
`msclkid`, `sck` e `src` na primeira visita, injeta em todo link externo e
expira na janela configurada. Um clique novo **substitui** o anterior.

Ajuste apenas `storagePrefix` (para duas LPs no mesmo domínio não dividirem a
mesma atribuição) e `janelaAtribuicaoDias`.

Para testar na aba **Testar eventos** do Gerenciador, abra a página com
`?fbtest=TESTxxxxx`.

### 8. Revise os textos

- Todo texto está no config, numerado por seção.
- **Reescreva o texto jurídico**: `src/pg-termos.html`,
  `src/pg-privacidade.html`, `src/pg-rastrear-pedido.html`. A marca é
  substituída automaticamente, mas o conteúdo tem que refletir a sua operação.
- Não publique avaliação que não existe.

### 9. Teste no celular

```bash
node build.js && node dev-server.js     # http://localhost:4321
```

O `dev-server.js` traz **dublês** das rotas de API: dá para percorrer os 4
passos do checkout sem gerar cobrança. Cenários de falha:

| URL | O que simula |
|---|---|
| `/?cenario=validacao` | gateway recusa um campo (400) |
| `/?cenario=semchave` | sem credenciais (503) → cai no checkout hospedado |
| `/?cenario=forade` | gateway fora do ar (502) |

Percorra o [`CHECKLIST.md`](CHECKLIST.md) antes de publicar.

### 10. Publique na Vercel

```bash
vercel --prod --yes
```

Cadastre as variáveis de `.env.example` em **Project → Settings → Environment
Variables** e **redeploye** (variável nova não entra em deployment existente).

> **Confira os aliases depois de todo deploy.** `vercel --prod` promove só
> parte deles. `vercel alias ls` e, se preciso,
> `vercel alias set <deployment-url> <seu-dominio>`.

---

## Comandos

| Comando | O que faz |
|---|---|
| `npm run build` | gera `index.html` + as 3 páginas institucionais |
| `npm run dev` | build + servidor local em `localhost:4321` |
| `npm run contraste` | mede a paleta do config contra a WCAG AA |
| `npm run atualizar` | mostra o que mudou no template desde a sua versão |

---

## Estrutura do repositório

```
config/
  produto.js               ponteiro: qual produto esta cópia vende
  produtos/
    ritual-da-pele.js      DEMO PREENCHIDO — a referência. Não apagar.
    _NOVO-PRODUTO.js       esqueleto comentado, copie daqui
src/
  part1-head.html          head, pixel, captura de UTM
  body.html                a estrutura da página (só tags e campos)
  checkout.html            modal de pagamento, 4 passos
  app.js                   interações, tracking, checkout
  tema.css                 tokens, tipografia, botões
  secoes.css               layout de cada seção
  base.css add.css         CSS herdado — no build APENAS pelo checkout
  tpl-icons.svg            os 14 ícones, usados via <use href="#i-...">
  pg-*.html                termos, privacidade, rastreio (TEXTO JURÍDICO)
api/
  criar-pix.js             cria a cobrança Pix
  korvex-webhook.js        confirma pagamento → dispara Purchase
  capi.js                  Conversions API (recusa Purchase de propósito)
  status-pedido.js         consulta de status
public/
  images/                  product · offers · testimonials · benefits · banners · brand
  media/                   vídeos e posters
  fonts.css                as fontes
tools/
  render.js                o mini-renderizador de template
  contraste.js             validador de paleta
  README-precos.md         como ler o preço real no gateway
docs/                      ESTRUTURA · DNA-VISUAL · COMPONENTES · TRACKING
build.js                   monta tudo
catalogo.js                deriva e valida o preço — FONTE ÚNICA
dev-server.js              servidor local com dublês de API
```

**Arquivos gerados — nunca edite na mão:** `index.html`, `termos.html`,
`privacidade.html`, `rastrear-pedido.html`.

---

## O que o build garante

`node build.js` sai com erro (exit 1) quando um campo do template não existe
no config, quando sobra placeholder no HTML, quando o preço renderizado
diverge do catálogo, quando uma cor não é hex válido, quando o CSS tem chave
desbalanceada ou declaração fora de bloco, e quando o HTML tem tag
desbalanceada.

Cada trava dessas existe por causa de um estrago real em produção. Preço
errado e layout quebrado passam a ser **erro de build**, nunca venda perdida.

---

## Documentação

| Arquivo | Conteúdo |
|---|---|
| **[`PROMPT.md`](PROMPT.md)** | **prompt pronto para colar numa IA e pedir a adaptação de um produto novo** |
| **[`docs/CONVERSAO.md`](docs/CONVERSAO.md)** | **o funil, a matemática da oferta, a escada de objeção, CTA, prova, risco, atrito e a persuasão específica do Pix — comece por aqui** |
| **[`docs/COPY.md`](docs/COPY.md)** | **as fórmulas de texto de cada bloco, extraídas das linhas que estão no ar** |
| [`AI-INSTRUCTIONS.md`](AI-INSTRUCTIONS.md) | como uma IA deve adaptar um produto novo usando esta arquitetura |
| [`docs/ESTRUTURA.md`](docs/ESTRUTURA.md) | as 15 seções, a ordem e a função de cada uma |
| [`docs/DNA-VISUAL.md`](docs/DNA-VISUAL.md) | tokens, tipografia, espaçamento, responsividade, animação |
| [`docs/COMPONENTES.md`](docs/COMPONENTES.md) | catálogo dos componentes reutilizáveis |
| [`docs/TRACKING.md`](docs/TRACKING.md) | pixel, CAPI, UTMs, eventos, o que é secreto |
| [`CHECKLIST.md`](CHECKLIST.md) | o que conferir antes de publicar |
| [`UPGRADE.md`](UPGRADE.md) | como trazer melhorias do template para um projeto já feito |
| [`CHANGELOG.md`](CHANGELOG.md) | o que mudou em cada versão, e o risco de aplicar |

---

## Segurança

Nenhuma credencial no repositório. Chaves de gateway, token da CAPI e token da
UTMify vivem só em variável de ambiente — ver `.env.example`. O `.gitignore`
cobre `.env` e `.vercel`.

Antes do primeiro push:

```bash
git status --porcelain | grep -iE "\.env|\.vercel"
```

Não deve devolver nada.
