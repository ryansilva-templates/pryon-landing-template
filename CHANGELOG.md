# CHANGELOG

Histórico de versões do PRYON Landing Master.

Para trazer uma versão nova para um projeto já feito, veja
[`UPGRADE.md`](UPGRADE.md) ou rode `node tools/atualizar.js`.

Cada mudança vem com o **nível** de atualização, que diz o risco de aplicá-la
num projeto derivado:

| Nível | Significa |
|---|---|
| **1** | documentação e ferramentas — sempre seguro |
| **2** | o motor (`src/`, `build.js`, `catalogo.js`) — seguro se você não editou `src/` na mão |
| **3** | estrutura e backend (`body.html`, `part1-head.html`, `api/`) — revisar o diff antes |

---

## v1.0.0 — 10/09/2026

Primeira versão publicada. A arquitetura da LP Ritual da Pele, que está no ar e
vendendo, extraída como template reutilizável.

### O template

**Nível 2 · Separação entre máquina e produto.**
Todo o conteúdo passou a morar em `config/produtos/<produto>.js`.
`src/body.html` e `src/part1-head.html` viraram templates com campos. Trocar de
produto não toca em `src/`.

**Nível 2 · Renderizador próprio** (`tools/render.js`).
Três construções — inserir, repetir, esconder — sem nenhuma dependência. Campo
inexistente derruba o build em vez de virar buraco na página.

**Nível 2 · Preço com fonte única.**
`catalogo.js` deixou de guardar preço e passou a derivar do config, mantendo as
travas de sanidade. `build.js` gera os blocos `KITS` e `KORVEX` do bundle e os
índices da oferta padrão e da oferta de comparação. O backend lê o mesmo
arquivo — a página e o gateway não têm como divergir.

**Nível 2 · Paleta vinda do config.**
As cores são injetadas como `:root` depois do `tema.css`. O ritmo, as
proporções e o espaçamento não mudam.

**Nível 1 · Assets organizados** em
`public/images/{product,offers,testimonials,benefits,banners,brand}` e
`public/media/`.

### Travas do build

Cada uma existe por causa de um estrago real em produção. O build sai com
erro (exit 1) quando:

- um campo do template não existe no config, ou sobrou placeholder no HTML;
- o preço renderizado diverge do catálogo;
- uma linha do comparativo tem número de valores diferente do de colunas;
- uma cor não é hex válido ou não é um token conhecido;
- o CSS tem chave desbalanceada ou declaração fora de bloco;
- o HTML tem `<section>`, `<div>`, `<button>` ou `<form>` desbalanceado.

**Nível 2 · Trava de herança do produto de referência.**
Derruba se o config ainda tiver o pixel, o `produtoId`, um `code` de oferta, o
domínio, o e-mail ou o `storagePrefix` da LP de referência. Sem ela, uma cópia
esquecida manda evento para o pixel de outra pessoa e cria a venda na conta de
outra pessoa no gateway. Válvula de escape: `PRYON_REFERENCIA=1 node build.js`.

**Nível 1 · Validador de contraste** (`tools/contraste.js`).
Mede a paleta do config contra a WCAG AA nos quatro fundos da página. O token
de legenda já reprovou em 51 elementos sem ninguém perceber no olho.

### Documentação

**Nível 1 · `docs/CONVERSAO.md`** — o documento principal. O funil do anúncio ao
Purchase, a primeira dobra, a matemática da escada de oferta (custo marginal
decrescente, desconto que cresce com o tamanho, preço por dia, a opção do meio
pré-selecionada), a escada de objeção, o sistema de CTA, a pilha de prova, a
reversão de risco, a remoção de atrito e a **persuasão específica do Pix**.
Termina numa auditoria de 31 itens.

**Nível 1 · `docs/COPY.md`** — a fórmula de cada bloco de texto, extraída das
linhas que estão no ar, com checagem final de 16 itens.

**Nível 1 · `PROMPT.md`** — prompt pronto para colar numa IA, em três variações:
adaptar produto novo, reestruturar página existente, auditar página pronta.

**Nível 1 · `AI-INSTRUCTIONS.md`, `docs/ESTRUTURA.md`, `docs/DNA-VISUAL.md`,
`docs/COMPONENTES.md`, `docs/TRACKING.md`, `CHECKLIST.md`.**

**Nível 1 · `UPGRADE.md` + `tools/atualizar.js`** — o caminho de volta das
melhorias do template para projetos já feitos.

### Verificado

Com o config de referência, o texto visível e a sequência de tags do
`index.html` gerado batem **1:1** com a página em produção. Um produto fictício
com 2 ofertas e os blocos opcionais desligados compila limpo. O build é
reproduzível.

---

## Como escrever uma entrada aqui

Quem lê esta página está decidindo **se vale atualizar**. Então diga o que muda
na prática, não o que foi tocado no código:

> ✅ "O código Pix deixa de ser reaproveitado quando a pessoa troca de oferta —
> antes dava para a tela mostrar um valor e o banco cobrar outro."
>
> ❌ "Refatorado o `resumo()` em `app.js`."

Sempre com o nível na frente.
