# COMPONENTES — o catálogo reutilizável

Todo componente aqui é dirigido por um campo do config. A coluna "config" diz
qual. Nenhum deles precisa de JS para aparecer — o JS só cuida de interação.

---

## Blocos de seção

### `.r-head` — cabeçalho de seção
```html
<div class="r-head">
  <span class="r-eyebrow">RÓTULO</span>
  <h2 class="r-h2">Título com <em>acento</em></h2>
  <p class="r-lead">Subtítulo, no máximo 56ch.</p>
</div>
```
Variante `.r-head--mid` centraliza (usada em vídeos e FAQ).
**Config:** `<secao>.eyebrow`, `.titulo`, `.lead`.

### `.r-sec` / `.r-sec--sf` — a seção
`.r-sec` = fundo de página. `.r-sec--sf` = superfície branca com fio em cima e
embaixo. **Alternam** ao longo da página; é o que separa os blocos sem card.

---

## Oferta e preço

### `.of-kit` — card de oferta ★ gancho obrigatório
O componente mais importante da página.

```html
<button class="of-kit on" role="radio" aria-checked="true" data-i="1" data-offer="kit2">
  <span class="tag">MAIS VENDIDO</span>
  <span class="radio"></span>
  <span class="imgs"><img …><img …></span>          <!-- uma por unidade -->
  <span class="kinfo">
    <span class="kname">2 Kits Completos</span>
    <span class="kper" data-per="1">4 meses · divida com quem você ama</span>
  </span>
  <span class="kprice"><b data-price="1">R$ 54,90</b><s data-old="1">R$ 137,00</s></span>
</button>
```

- Linha cheia, não coluna. Funciona igual no celular e no desktop.
- `role="radio"` dentro de um `role="radiogroup"`: o teclado e o leitor de tela
  entendem que é uma escolha.
- `data-i` é o índice, `data-offer` é o id da oferta no config.
- `data-price` / `data-old` são reescritos pelo `app.js`.
- Só **uma** oferta pode ter `.tag`.

**Config:** `ofertas[]`. **Não renomeie nada aqui** — ver `AI-INSTRUCTIONS.md` §5.

### `.r-price` — o bloco de preço
Rótulo da oferta (`#hero-kit`), preço agora (`#hero-price`), preço riscado
(`#hero-old`) e três chips. Todos reescritos a cada troca de oferta.

O terceiro chip (`#perday-txt`) é **calculado**: `centavos ÷ dias`. É o que
transforma "R$ 66,90" em "R$ 0,37 por dia".

**Config:** `hero.perDiaPrefixo`, `hero.perDiaSufixo`, `ofertas[].dias`.

### `.r-shot-tag` / `#disc-badge` — selo de desconto
Percentual **calculado** a partir de `centavos` e `deCentavos`. Nunca digitado.

### `.sk-kit` — mini-card na barra fixa ★ gancho obrigatório
```html
<button class="sk-kit on" data-idx="1"><span>2 Kits</span><b>R$ 54,90</b></button>
```
Precisa do `<b>` dentro: é ele que o `app.js` reescreve.
**Config:** `ofertas[].rotuloCurto`.

### `.r-cta` — o botão
Variante `.r-cta--lg` para o botão grande do hero e do fechamento.

- `.buycta` marca "botão de compra **dentro do conteúdo**". É o que a barra
  fixa observa. **Nunca** ponha em botão que já esteja fixo na tela.
- `[data-open-checkout]` é o que realmente abre o modal e dispara o tracking.

CTA em **primeira pessoa** ("Quero meu kit"), não imperativo genérico.

### `.r-cta-note` — a linha embaixo do botão
Três garantias separadas por `·`. Segurança, pagamento, devolução.

---

## Confiança e prova

### `.r-chip` — etiqueta pequena
Ícone + texto. Variante `.r-chip--rs` no acento lavado.
**Config:** `hero.chips[]`.

### `.r-assure` — faixa de selos
Quatro itens ícone + texto, em linha.
**Config:** `hero.selos[]`.

### `.r-rate` / `.r-score` — nota agregada
`.r-rate` é a versão compacta do hero (estrelas + nota + contagem).
`.r-score` é a versão grande da seção de avaliações.
**Config:** `hero.nota`, `hero.notaTexto`, `avaliacoes.nota`, `avaliacoes.resumo`.

### `.rev` — cartão de avaliação
Nome, selo "compra verificada", estrelas, texto, data.
**Config:** `avaliacoes.itens[]`.

### `.r-guar` — bloco de garantia
Selo, título com `<em>`, parágrafo. Sozinho na seção.
**Config:** `garantia`.

### `.r-trust-item` — card de confiança
Ícone em círculo, título, parágrafo.
**Config:** `entrega.itens[]`.

---

## Conteúdo

### `.r-why-item` — item do mecanismo
Número (`01`, `02`, `03` — gerado por `{{@pad}}`), título, parágrafo.
**Config:** `mecanismo.itens[]`.

### `.r-step` — card de passo
Número + rótulo da etapa, foto, título com `<em>`, parágrafo, tags.
**Config:** `protocolo.passos[]`.

### `.r-rt` — bloco de rotina
Tag com ícone + lista ordenada.
**Config:** `protocolo.rotinas[]`.

### `.r-care` — advertências
Título com escudo + lista. Obrigatório em cosmético e suplemento.
**Config:** `protocolo.cuidados`.

### `.r-tl-item` — item da linha do tempo
Barra, marcador de tempo, título, parágrafo.
**Config:** `timeline.itens[]`.

### `.r-cmp` — tabela comparativa
Primeira coluna com `.hi` (destaque). Células:

| No config | Vira |
|---|---|
| `'texto livre'` | texto simples |
| `{ sim: 'Sim' }` | `<span class="r-yes">` |
| `{ nao: 'Não' }` | `<span class="r-no">` |
| `{ precoOferta: true, sub: '…' }` | `<span id="cmp-price">` + subtexto |

Cada linha precisa de tantos valores quantas colunas — o build confere.
Rola horizontalmente dentro de `.r-cmp-wrap`.
**Config:** `comparativo`.

### `.r-faq` — acordeão
`<details>`/`<summary>` nativo, sem JS. A primeira vem `open`.
**Config:** `faq.itens[]`.

### `.r-gift` — bloco de brinde
Foto, tag, nome, descrição, selo "GRÁTIS". Opcional.
**Config:** `hero.brinde` (`null` remove).

### `.r-stock` — aviso de escassez
Ícone + frase. Opcional, e **só se for verdade**.
**Config:** `hero.escassez` (`null` remove).

---

## Carrosséis

Três fitas, mesmo padrão: `.r-vids`/`#vtrack`, `.r-revs`/`#rtrack`,
`.r-ugc`/`#utrack`.

- Os itens são **duplicados** no template; os clones levam `aria-hidden="true"`.
  O marquee precisa de duas voltas para o laço não dar salto.
- A animação é a única `@keyframes` do projeto (`r-slide`).
- **Ao tocar, arrastar ou rolar**, a fita "solta": o deslocamento do
  `translateX` é lido e convertido em `scrollLeft` **antes** de o transform ser
  zerado, então o cartão sob o dedo continua exatamente onde estava. Congelar é
  necessário — animação e rolagem se somam, e passando da metade da volta o
  transform empurra a janela para além do fim do trilho.

### `.vidcard` — cartão de vídeo
`preload="none"` + **`data-poster`** (nunca `poster`). Ver `docs/DNA-VISUAL.md`.
**Config:** `videos.itens[]`.

### `.r-mainvid` — vídeo em destaque
Com botão "toque para ouvir". Opcional.
**Config:** `videos.destaque` (`null` remove).

---

## Navegação e estrutura

### `.r-announce` / `.tb-rot` — barra rotativa
Três mensagens em `grid-area: 1/1`, alternando opacidade. O bloco é
`aria-hidden`; o texto para leitor de tela é o `<p class="sr">` com as três
frases em texto corrido.
**Config:** `anuncio[]`, `anuncioSr`.

### `.r-mast` — cabeçalho sticky
Marca, nav e CTA que leva a `#oferta` (não abre o checkout).
**Config:** `marca`, `nav[]`, `navCta`.

### `.stickycta` — barra fixa ★ gancho obrigatório
Aparece só quando nenhum `.buycta` está visível. `IntersectionObserver` com
`rootMargin` + threshold + debounce — sem isso ela pisca no fio da borda.

### `.r-ft` — rodapé
Grade de 3 colunas: marca + selos, atendimento, institucional. Mais disclaimer
e copyright.
**Config:** `rodape`, `marca`, `legal`.

---

## Utilidades

| Classe | Uso |
|---|---|
| `.r-wrap` | container centralizado, `max-width: var(--wrap)` |
| `.sr` / `.r-sr` | conteúdo só para leitor de tela |
| `.skip` | link "pular para o conteúdo" |
| `.reveal` | revelar ao entrar na tela |
| `.reveal-zoom` | idem, com escala (usado na garantia) |
| `.r-yes` / `.r-no` | selo verde / vermelho na tabela |
| `.tnum` | numerais tabulares (para preço não dançar) |

---

## Sintaxe do template

`src/body.html` usa três construções, implementadas em `tools/render.js`:

```
{{ caminho.do.campo }}        insere (HTML permitido: <b>, <em>, <br>, <a>)
{{# each lista }} … {{/ each }}    repete; dentro, o contexto é o item
{{# if campo }} … {{ else }} … {{/ if }}    esconde quando vazio/null
```

Dentro de um `each`: `{{@index}}` `{{@num}}` `{{@pad}}` `{{@first}}`
`{{@last}}` `{{@total}}`, e `{{$.campo}}` para voltar à raiz do config.

Um `{{campo}}` que não existe **derruba o build**. Em `{{#if}}`, campo
inexistente é o mesmo que vazio — é assim que `brinde: null` some da página.
