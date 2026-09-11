# DNA VISUAL — o que faz esta página parecer esta página

Este documento descreve o sistema visual que deve **sobreviver** à troca de
produto. A paleta muda, a foto muda, o texto muda. Isto aqui não.

---

## As cinco regras

1. **UM acento.** O acento (`--rs`) aparece no que é clicável e em quase nada
   mais: botões, links, o `<em>` dos títulos, o eyebrow das seções, o selo de
   desconto. Se ele começa a aparecer em fundo de card, ícone decorativo e
   borda, a página perde a hierarquia — tudo grita igual.

2. **Superfície é branco com fio de 1px.** Sombra só onde há elevação **real**:
   a barra fixa e o modal. Gradiente só no selo de desconto.

3. **Hierarquia vem de tamanho, peso e espaço.** Não de cor e não de caixa. Se
   você está pensando em colocar um card em volta de um parágrafo para
   destacá-lo, o que ele precisa é de espaço em volta e de um tamanho maior.

4. **Movimento só onde comunica.** Existe **uma** `@keyframes` no projeto
   inteiro (`r-slide`, o marquee dos carrosséis) e 13 `transition`. O revelar
   de entrada (`.reveal`) e o hover dos botões. Nada mais.

5. **`prefers-reduced-motion` é respeitado.** Há uma media query dedicada. Não
   adicione animação que a ignore.

> **O que este sistema substituiu:** 42 gradientes, 25 animações infinitas,
> glassmorphism, orbes girando no fundo, CTA pulsante e um card para cada
> frase. É a assinatura visual de landing gerada por IA. Não vende, e faz a
> marca parecer improvisada. Se você se pegar adicionando qualquer um desses,
> pare.

---

## Tokens

Definidos em `src/tema.css`, sobrescritos pelo bloco `:root` que o `build.js`
gera a partir de `cores` e `tipografia` no config.

### Cor

| Token | Config | Papel |
|---|---|---|
| `--pp` | `cores.pp` | fundo da página — papel, não branco de escritório |
| `--sf` | `cores.sf` | superfície de card |
| `--sf2` | `cores.sf2` | superfície secundária |
| `--ln` | `cores.ln` | fio de 1px |
| `--ln2` | `cores.ln2` | fio mais marcado |
| `--t1` | `cores.t1` | títulos |
| `--t2` | `cores.t2` | corpo |
| `--t3` | `cores.t3` | meta, legendas |
| `--rs` | `cores.rs` | **o acento** — texto e botão |
| `--rs-d` | `cores.rsD` | pressionado / fim de gradiente |
| `--rs-w` | `cores.rsW` | lavado — fundo de tarja e chip |
| `--rs-ln` | `cores.rsLn` | fio no tom do acento |
| `--au` | `cores.au` | estrela — ouro fosco |
| `--gr` | `cores.gr` | confirmação |

### Forma e medida

| Token | Valor | Papel |
|---|---|---|
| `--wrap` | `1120px` | largura máxima do conteúdo |
| `--r` | `14px` | raio padrão |
| `--r-sm` | `10px` | raio pequeno |
| `--dsp` | `tipografia.display` | fonte de display (H1, H2, `<em>`) |
| `--txt` | `tipografia.texto` | fonte de texto |

---

## Contraste — mede, não confie no olho

```bash
npm run contraste
```

`--t3` (legendas) nasceu `#867680` na versão original. Dava **3,74:1** no pior
fundo e **reprovava o AA em 51 elementos** da página. Ninguém percebeu olhando:
o texto parecia "clarinho de propósito". Foi para `#736570` = 4,81:1.

Um token de texto tem que passar no **pior** dos quatro fundos em que aparece —
`--pp`, `--sf`, `--sf2` e `--rs-w` — não na média. O validador mede exatamente
isso, mais o branco sobre o botão.

Ao trocar o acento de um produto novo, **os quatro fundos mudam de uma vez**.
Rode o validador antes de publicar. Legenda ilegível no celular ao sol é
conversão perdida, não detalhe de acessibilidade.

---

## Tipografia

| Classe | Tamanho | Uso |
|---|---|---|
| `.r-h1` | `clamp(30px, 7.4vw, 53px)` | um por página, no hero |
| `.r-h2` | `clamp(25px, 5.1vw, 39px)` | título de seção |
| `.r-h3` | `17.5px` | título de card |
| `.r-lead` | `clamp(15.5px, 2.1vw, 18px)` | subtítulo de seção, `max-width: 56ch` |
| `.r-eyebrow` | `11.5px` / `800` / `.15em` | rótulo acima do H2, no acento |
| corpo | `16px` / `1.65` / `450` | `body` |

- H1 e H2 usam a fonte de display, peso 500, `line-height` apertado (1.06 /
  1.12) e `letter-spacing` negativo. É o que dá o ar editorial.
- O `<em>` em H1/H2 vira **itálico no acento**. Uma por título, na palavra que
  carrega a promessa.
- `.r-lead` tem `max-width: 56ch`, `.r-head` tem `62ch`. Linha longa demais
  cansa; nenhum texto do template escapa disso.

**Trocar de fonte** exige trocar `public/fonts.css` também. Ele traz os
`@font-face` com `font-display: swap` e `unicode-range` por subset — não
substitua por um `<link>` para o Google Fonts: são dois RTTs a mais no caminho
crítico.

---

## Espaçamento e ritmo

- `.r-wrap` — `max-width: var(--wrap)`, padding lateral **20px** no celular,
  **32px** a partir de 768px.
- `.r-sec` — padding vertical `clamp(52px, 8vw, 92px)`.
- `.r-head` — `margin-bottom: clamp(30px, 4.4vw, 48px)`.
- Alternância de fundo: seções pares e ímpares alternam `--pp` e `.r-sec--sf`
  (`--sf` + fio em cima e embaixo). É isso que separa os blocos sem card.

Todo espaçamento importante é `clamp()`. Não troque por valor fixo: é o que faz
a página respirar igual no celular e no desktop sem uma media query para cada
coisa.

---

## Responsividade

Mobile-first. Desktop é a exceção declarada.

**Breakpoints em uso:** 520, 640, 719 (max), 760, 768, 820 (max), 821, 860,
900, 940.

| Faixa | O que muda |
|---|---|
| `< 640` | tudo empilhado; hero em coluna única |
| `640+` | grades de card viram 2 colunas |
| `768+` | padding lateral sobe para 32px |
| `860+` | grades de 3 colunas (passos, mecanismo, trust) |
| `940+` | hero em duas colunas; a foto ganha 520px fixos |

**Experiência mobile — o que não pode ser perdido:**

- O hero cabe em uma tela e meia. Foto, nota, título, subtítulo, preço, oferta
  e botão: o botão tem que estar alcançável sem muita rolagem.
- Os cards de oferta são **linhas cheias**, não colunas espremidas. Cada um
  mostra miniatura, nome, benefício e preço na mesma linha.
- Carrosséis são arrastáveis com o dedo, e a animação congela ao toque.
- A tabela comparativa rola horizontalmente dentro do próprio container. **A
  página nunca rola na horizontal** (`overflow-x: hidden` no `body`).
- A barra fixa não cobre o conteúdo final: o fechamento tem folga embaixo.
- `viewport-fit=cover` + o notch: a barra fixa respeita a safe area.

---

## Ícones

14 símbolos SVG em `src/tpl-icons.svg`, embutidos no topo do `<body>` e usados
via `<use href="#i-nome">`:

```
lock  truck  shield  star  check  zap  arrows
spark vol    mute    box   chat   pix  gift
```

Um `<symbol>` só, reutilizado N vezes — sem request extra e sem sprite. Para
adicionar um ícone, coloque o `<symbol id="i-...">` nesse arquivo e cite o nome
no config.

---

## Performance — o que já foi otimizado

Peso medido em produção: **272KB** (era 418KB).

- **Poster de vídeo foi o maior ganho.** `preload="none"` segura o MP4 mas
  **não** segura o poster: o atributo nativo baixa a imagem na hora, sempre.
  Eram 211KB de JPG para um carrossel muito abaixo da dobra. Viraram WebP no
  tamanho de exibição (97KB) e passaram a `data-poster`, atribuído por
  `IntersectionObserver` com 300px de antecedência — mais uma rede de segurança
  que atribui tudo 3s depois do `load` (sem ela, observer que não dispara =
  card preto para sempre).
- **Hero com `preload` + `fetchpriority="high"`** e `srcset` de 3 tamanhos.
- **CSS e JS embutidos** no `index.html`: um arquivo só, zero request extra.
- **Todo `<img>` e `<video>` tem `width` e `height`** declarados. É o que evita
  o layout pulando.
- O maior recurso restante é o script do pixel da Meta (119KB). Não dá para
  encolher.

**O CSS morto fica de propósito.** `base.css` e `add.css` continuam no build
porque o CSS do checkout mora no `add.css` e depende de tokens do `base.css`
(`--ac`, `--border`, `--bg`, `--ink`, `--muted`, `--serif`). O tema novo usa
nomes de token **totalmente diferentes** (`--pp`, `--sf`, `--t1`…), então o
checkout renderiza idêntico sem ninguém ter tocado numa linha dele. Purgar
salvaria ~10KB transferidos e mexeria na folha compartilhada com o checkout.
Risco alto, ganho baixo — **não faça**.

---

## Namespace

As classes do sistema visual usam o prefixo **`r-`**, escolhido para não
colidir com `base.css`/`add.css`, que continuam no build apenas pelo checkout.

Os cinco ganchos que o `app.js` exige mantêm o nome antigo (`.of-kit`,
`.sk-kit`, `.stickycta`, `.buycta`, `[data-open-checkout]`) e são
**reestilizados** em `tema.css`. Ver `AI-INSTRUCTIONS.md` §5.
