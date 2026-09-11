# ESTRUTURA — as seções, a ordem e a função de cada uma

Esta é a estrutura **real** da landing page Ritual da Pele, na ordem exata em
que ela existe em `src/body.html`. Nada aqui é aspiracional: é o que está no
ar.

A ordem não é estética. Cada posição responde a uma objeção específica, no
momento em que ela aparece na cabeça de quem está lendo. Reordenar é uma
decisão de conversão — não faça por acaso.

---

## Mapa rápido

| # | Seção | Bloco no HTML | Âncora | Campo no config |
|---|---|---|---|---|
| 0 | Barra de aviso | `.r-announce` | — | `anuncio`, `anuncioSr` |
| 1 | Cabeçalho | `.r-mast` | — | `marca`, `nav`, `navCta` |
| 2 | Hero / primeira dobra | `.r-hero` | `#oferta` | `hero`, `ofertas` |
| 3 | Mecanismo | `.r-sec.r-sec--sf` | — | `mecanismo` |
| 4 | Protocolo | `.r-sec` | `#protocolo` | `protocolo` |
| 5 | Linha do tempo | `.r-sec.r-sec--sf` | `#resultados` | `timeline` |
| 6 | Prova em vídeo | `.r-sec` | — | `videos` |
| 7 | Avaliações | `.r-sec.r-sec--sf` | `#avaliacoes` | `avaliacoes` |
| 8 | Comparativo | `.r-sec` | — | `comparativo` |
| 9 | Entrega e segurança | `.r-sec.r-sec--sf` | `#entrega` | `entrega` |
| 10 | Garantia | `.r-sec` | `#garantia` | `garantia` |
| 11 | FAQ | `.r-sec.r-sec--sf` | `#faq` | `faq` |
| 12 | Fechamento | `.r-close` | — | `fechamento` |
| 13 | Rodapé | `.r-ft` | — | `rodape`, `marca`, `legal` |
| 14 | Barra fixa | `.stickycta` | — | `stickyCta`, `ofertas` |
| — | Modal de checkout | `#ck` | — | `checkout` |

**Ritmo de fundo:** as seções alternam entre fundo de página (`--pp`) e
superfície branca (`.r-sec--sf`, `--sf` + fio em cima e embaixo). É o que dá a
sensação de blocos separados sem precisar de card em volta de tudo.

---

## 0. Barra de aviso rotativa — `.r-announce`

**Função:** remover atrito **antes** de a pessoa começar a ler. Ela ainda não
sabe o que é o produto, mas já sabe que tem frete grátis, garantia e Pix.

Três mensagens que rotacionam sozinhas (`setInterval`, 600ms de transição).
O bloco visível é `aria-hidden`; a versão para leitor de tela é o `<p class="sr">`
com as três frases em texto corrido — senão o leitor anunciaria a barra a cada
troca.

**Não** venda aqui. É informação, não argumento.

---

## 1. Cabeçalho — `.r-mast`

Sticky no topo, com `backdrop-filter` quando o navegador suporta.

**Detalhe de conversão:** o CTA do cabeçalho (`.r-mast-cta`) leva para
`#oferta`, **não** abre o checkout. Quem clica no topo ainda não escolheu a
oferta — abrir o modal ali seria pedir uma decisão que a pessoa não tomou.

Os links da nav têm que casar com as âncoras que existem: `#protocolo`,
`#resultados`, `#avaliacoes`, `#faq`.

---

## 2. Hero / primeira dobra — `.r-hero` `#oferta`

**A seção mais importante da página.** Duas colunas no desktop, empilhada no
celular.

**Ordem no celular, e o motivo dela:**

```
foto → nota → para quem → título → subtítulo
  → PREÇO → ESCOLHA DA OFERTA → BOTÃO
    → brinde → escassez → selos
```

O botão vem **logo abaixo da escolha da oferta**. Antes ele ficava depois do
brinde e do aviso de estoque, ~110px mais fundo. Quem já decidiu não precisa
rolar por argumento nenhum — e quem não decidiu continua tendo brinde,
escassez e selos logo abaixo.

**Coluna da mídia** (`.r-hero-media`):
- `.r-shot` — a foto principal, com o selo de desconto (`#disc-badge`) sobreposto.
  O desconto é **calculado** a partir de `centavos` e `deCentavos`, não digitado.
- `.r-thumbs` — miniaturas do que vem na caixa. Opcional (`hero.thumbs: null`).

**Coluna da copy** (`.r-hero-copy`):
- `.r-rate` — nota + número de avaliações. Prova social **antes** do título.
- `.r-forwho` — para quem é, em cinco palavras. Qualifica antes de prometer.
- `.r-h1` — a promessa. O `<em>` vira itálico no acento; use na palavra que
  carrega a promessa.
- `.r-sub` — o mecanismo em duas frases.
- `.r-price` — preço agora, preço riscado, e três chips: forma de pagamento,
  frete e **custo por dia** (calculado: `centavos ÷ dias`). O "por dia" é o que
  transforma R$ 66,90 em "R$ 0,37 por dia".
- `.r-kits` — **o coração da conversão**. Os cards de oferta.
- `.r-cta-wrap` — o botão + a linha de três garantias.
- `.r-gift` — brinde. Opcional.
- `.r-stock` — escassez. Opcional, e **só se for verdade**.
- `.r-assure` — quatro selos de confiança.

---

## 3. Mecanismo — "por que sempre volta"

**Função:** explicar por que o que a pessoa **já tentou** não funcionou.

É a seção que transforma o produto de "mais um" em "a peça que faltava". Sem
ela, a página está competindo por preço. Com ela, está competindo por
diagnóstico.

Três itens numerados (`01`, `02`, `03` — gerados pelo `{{@pad}}`), cada um
descrevendo um erro que **não é culpa dela**. O fecho (`.r-why-out`) amarra os
três problemas na sua solução.

**Vem logo depois do preço** porque é o primeiro argumento de quem não comprou
de cara.

---

## 4. Protocolo / Como funciona — `#protocolo`

**Função:** apresentar o produto **por função**, não por lista de
características. Cada passo justifica um item da caixa — é o que impede a
pessoa de querer comprar só uma parte ("não dá pra levar só o sérum?").

- `.r-steps` — um card por passo: número, rótulo da etapa, foto, título com
  `<em>`, explicação e tags de composição.
- `.r-routine` — a rotina em duas colunas (manhã/noite). Opcional. Serve para
  a pessoa se ver usando: "dois minutos de manhã, dois à noite".
- `.r-care` — advertências e contraindicações. Opcional no template,
  **obrigatório** em cosmético e suplemento.

---

## 5. Linha do tempo — `#resultados`

**Função:** dar expectativa realista, e fazer isso **antes** da compra.

Este é o bloco que segura o arrependimento na semana 2 — o momento em que a
pessoa acha que não funcionou e pede o dinheiro de volta. Dizer de antemão
"é aqui que a maioria desiste, e é exatamente quando começou a agir" salva
reembolso e salva a próxima recompra.

Também é onde o kit maior se justifica sozinho: se o resultado leva 8 a 12
semanas, o kit de 2 meses não cobre o tratamento.

---

## 6. Prova em vídeo

**Função:** rosto e voz. Vem **antes** das avaliações em texto porque quem já
viu uma pessoa real lê o texto com outra disposição.

- `.r-vids` / `#vtrack` — carrossel horizontal, sem som, em loop. Os itens são
  **duplicados** de propósito: o marquee precisa de duas voltas para o laço não
  dar salto. Os clones levam `aria-hidden`.
- `.r-mainvid` — um vídeo em destaque, com botão "toque para ouvir". Opcional.

**Detalhe técnico que importa:** os vídeos usam `data-poster`, não `poster`.
`preload="none"` segura o MP4 mas **não** segura o poster — o atributo nativo
baixa a imagem na hora, sempre. Eram 211KB de JPG baixados no load para um
carrossel muito abaixo da dobra.

**Arrastar congela a animação.** Ao tocar/rolar/usar a roda, o deslocamento do
`translateX` é convertido em `scrollLeft` **antes** de o transform ser zerado —
assim o cartão sob o dedo continua exatamente onde estava.

---

## 7. Avaliações — `#avaliacoes`

**Função:** volume e especificidade. Nota agregada primeiro (`.r-score`),
depois os textos.

- `.r-revs` / `#rtrack` — carrossel de avaliações, mesmo padrão de duplicação.
  Cada uma tem nome, selo de compra verificada, estrelas, texto e data.
- `.r-ugc` / `#utrack` — fita de fotos enviadas por clientes. Opcional.

**Regra que não é negociável:** só publique avaliação que existe. Se a página
exibe o selo "compra verificada" e o disclaimer fala em clientes reais, elas
precisam ser reais. Produto sem avaliação: deixe a lista vazia e **tire a nota
do hero também**.

---

## 8. Comparativo

**Função:** quebrar a objeção "dá pra resolver mais barato de outro jeito".

Tabela com a sua oferta na primeira coluna (destaque) contra as alternativas
reais do mercado. Termina na linha de **custo**, que é onde a comparação
fecha.

A linha de custo usa `ofertaComparativo`, uma oferta **fixa** — não a
selecionada. A linha fala de um período fixo ("os 6 primeiros meses"); amarrada
ao kit selecionado, o de 4 meses apareceria como se fosse o custo de 6.

Rola horizontalmente no celular (`.r-cmp-wrap` com `overflow-x`), o que
mantém a tabela legível sem espremer as colunas.

---

## 9. Entrega e segurança — `#entrega`

**Função:** a última objeção logística. Como pago, quando chega, quanto custa
de verdade.

Três cards: pagamento protegido, prazo de postagem, frete. O lead — "o preço
que você vê na tela é o preço final" — existe porque frete surpresa no
checkout é a causa nº 1 de carrinho abandonado.

O valor do frete expresso vem do macro `{{FRETE_EXPRESSO}}`, nunca digitado.

---

## 10. Garantia — `#garantia`

**Função:** transferir o risco da cliente para a loja.

**Sozinha na seção, de propósito.** Dividir espaço com outra coisa enfraquece.
Um selo, um título com `<em>`, um parágrafo — e o parágrafo diz **como** se
pede a devolução, não só que ela existe. "Basta responder o e-mail do pedido"
vale mais que "30 dias de garantia".

---

## 11. FAQ — `#faq`

**Função:** responder objeção sem ocupar espaço de quem não a tem.

`<details>` nativo, sem JS. A primeira vem **aberta** para a seção não parecer
uma parede de títulos fechados.

**A ordem é: objeção mais cara primeiro.** "Em quanto tempo eu vejo
resultado?" e "será que funciona na minha pele?" vêm antes de "meus dados estão
seguros?" — porque são elas que decidem a compra.

Repita aqui as informações que já estão na página. Quem chega no FAQ chegou
rolando, não lendo.

---

## 12. Fechamento — `.r-close`

**Função:** repetir a oferta para quem leu tudo.

Sem novidade, sem argumento novo: só a decisão. Título com urgência legítima
(um fato sobre o produto, não um relógio falso), a lista curta do que está
incluso, o botão e a linha de segurança.

---

## 13. Rodapé — `.r-ft`

Marca, selos de confiança, coluna de atendimento, coluna institucional,
disclaimer legal e linha de copyright.

O **disclaimer** (`.r-ft-disc`) não é decoração: ressalva de resultado
individual, aviso de que o produto não substitui acompanhamento profissional, e
a não-afiliação a Facebook/Instagram/Meta — que é exigência da própria
plataforma para quem anuncia.

---

## 14. Barra fixa — `.stickycta`

**Função:** manter a oferta a um toque de distância no meio da página.

Aparece **só quando nenhum `.buycta` está visível**, via `IntersectionObserver`
com `rootMargin` e debounce. Sem isso, ela pisca no fio da borda quando o botão
do hero está entrando ou saindo da tela.

Repete a escolha de oferta (`.sk-kit`) — quem mudou de ideia no meio da página
não precisa voltar ao topo.

**O botão desta barra NÃO pode ter a classe `buycta`.** Essa classe marca
"botão de compra dentro do conteúdo", e é o que o observer observa. Com ela
aqui, a barra observaria o próprio botão e piscaria sem parar. O clique vem de
`data-open-checkout`.

---

## Modal de checkout — `#ck`

Não é seção: é overlay. Quatro passos na própria página, sem sair para o
gateway.

1. **Resumo do pedido** — oferta escolhida, order bump do frete expresso, total.
2. **Dados** — nome, e-mail, telefone, CPF.
3. **Endereço** — CEP com preenchimento automático.
4. **Pix** — QR Code + código copia-e-cola, com polling do status.

**Rede de segurança:** se `/api/criar-pix` não responder — chave ausente, API
fora, rede ruim — o botão manda para o checkout hospedado do gateway. Checkout
morto perde a venda inteira; redirect perde só uma parte.

**Armadilha corrigida, e que volta se você mexer no fluxo:** o modal guarda o
passo entre aberturas. Se a pessoa gera o Pix, fecha, troca de oferta e reabre,
o resumo é redesenhado com o preço novo — e o código Pix na tela continuaria
sendo o antigo. R$ 67,13 escrito, R$ 55,16 cobrado. O `pedido` guarda `offerId`
e `expresso`, e `resumo()` invalida a cobrança quando a oferta muda. **Sempre
reconfira: o valor do campo 54 do BR Code tem que bater com o total exibido.**
