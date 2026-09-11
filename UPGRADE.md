# UPGRADE — trazer melhorias do template para um projeto já feito

Quando você cria um projeto com **"Use this template"**, a cópia nasce **sem
ligação** com o original. Isso é bom (histórico limpo) e é ruim: uma correção
feita no template não chega sozinha nas páginas que já existem.

Sem um caminho de volta, seis projetos viram seis versões divergentes, cada
correção é refeita seis vezes à mão, e depois de um tempo ninguém sabe qual
está certa.

Este documento é o caminho de volta.

---

## Por que isso funciona aqui

O repositório é separado em duas metades que **não se misturam**:

```
A MÁQUINA                          O PRODUTO
src/tema.css  src/secoes.css       config/produto.js
src/app.js    src/checkout.html    config/produtos/*.js
build.js      catalogo.js          public/images/  public/media/
tools/        docs/                src/pg-termos.html
                                   src/pg-privacidade.html
                                   src/pg-rastrear-pedido.html
```

Como **todo** o conteúdo do seu produto mora em `config/` e `public/`, dá para
substituir a máquina inteira sem encostar no produto. É por isso que a regra
"nunca escreva texto dentro de `src/`" existe: ela é o que torna esta
atualização possível.

---

## O jeito curto

```bash
node tools/atualizar.js
```

Mostra o que mudou no template desde a sua versão, separado por nível de risco.
**Não altera nada.**

```bash
node tools/atualizar.js --aplicar
node build.js
```

Aplica o que é seguro e lista o que você precisa revisar à mão.

Na primeira vez ele adiciona o remote `upstream` sozinho. Se a árvore estiver
suja, ele se recusa a rodar — sobrescrever arquivo com alteração não commitada
é trabalho perdido sem aviso.

> **Projeto criado antes deste script existir?** Ele não vai estar lá. Traga-o
> uma vez, à mão, e depois o fluxo normal funciona:
>
> ```bash
> git remote add upstream https://github.com/ryansilva-templates/pryon-landing-template.git
> git fetch upstream --tags
> git checkout upstream/main -- tools/atualizar.js
> node tools/atualizar.js
> ```

---

## Os três níveis, e por que eles existem

### Nível 1 — sempre seguro

```
docs/  tools/  AI-INSTRUCTIONS.md  PROMPT.md  CHECKLIST.md  README.md
CHANGELOG.md  UPGRADE.md
```

Documentação e ferramentas. Não entram na página. Pode sobrescrever sempre.

### Nível 2 — seguro no padrão

```
src/tema.css  src/secoes.css  src/base.css  src/add.css  src/pagina.css
src/app.js  src/checkout.html  src/tpl-icons.svg
build.js  catalogo.js  vercel.json  .vercelignore  .gitattributes
```

O motor. Só conflita se você editou `src/` na mão — que é exatamente o que o
template pede para não fazer. É aqui que moram as correções que interessam:
comportamento do checkout, sincronia de preço, barra fixa, travas do build.

> Se você trocou a paleta, ela está em `cores` no config e é **injetada depois**
> do `tema.css`. Atualizar o tema não apaga a sua cor.

### Nível 3 — revisar o diff, nunca aplicar às cegas

```
src/body.html  src/part1-head.html  api/  package.json
```

- **`body.html` / `part1-head.html`** — são a estrutura. Se você adicionou uma
  seção ou um campo próprio, sobrescrever apaga isso. Traga a mudança à mão; o
  diff costuma ser pequeno.
- **`api/`** — só sobrescreva se você usa o **mesmo gateway**. Se trocou, esses
  arquivos são seus.
- **`package.json`** — pode ter dependência sua.

O script **nunca** aplica esses. Ele só mostra o comando para você ver o diff.

### Nunca tocado

```
config/         o conteúdo do seu produto
public/         suas imagens e vídeos
src/pg-*.html   seu texto jurídico
index.html, termos.html, privacidade.html, rastrear-pedido.html   (gerados)
```

---

## Na mão, se preferir

```bash
git remote add upstream https://github.com/ryansilva-templates/pryon-landing-template.git
git fetch upstream --tags

# o que mudou desde a sua versão
git log --oneline HEAD..upstream/main

# níveis 1 e 2
git checkout upstream/main -- docs/ tools/ AI-INSTRUCTIONS.md PROMPT.md CHECKLIST.md
git checkout upstream/main -- src/tema.css src/secoes.css src/app.js src/checkout.html build.js catalogo.js

# nível 3: olhe antes
git diff HEAD upstream/main -- src/body.html

node build.js
```

---

## Depois de toda atualização

```bash
node build.js
node tools/contraste.js
node dev-server.js
```

O `index.html` é **gerado**. Atualizar `src/` sem rodar o build não muda nada no
que está no ar.

Depois, a passada curta do [`CHECKLIST.md`](CHECKLIST.md): abrir o checkout nos
quatro passos, trocar de oferta, conferir que o preço sincroniza. É rápido e
pega 90% do que uma atualização poderia quebrar.

E commite separado:

```bash
git add -A && git commit -m "atualiza template para vX.Y.Z"
```

Atualização de template misturada com mudança de conteúdo é impossível de
reverter depois.

---

## Se der conflito

Não vai dar, no fluxo normal — o script usa `git checkout`, que sobrescreve.
O "conflito" possível é outro: **você editou um arquivo do nível 2 na mão** e a
sua alteração some.

Se isso aconteceu, ela está no histórico:

```bash
git log -p --follow -- src/app.js
```

Recupere o trecho, e depois mova essa customização para onde ela devia estar:
um campo no `config`. Se não couber num campo, é sinal de que o template
precisa de um campo novo — vale abrir a questão no repositório do template em
vez de manter um remendo local que some na próxima atualização.

---

## Para quem mantém o template

Ao publicar uma melhoria:

1. Anote em [`CHANGELOG.md`](CHANGELOG.md), dizendo **o que muda na prática** —
   quem lê está decidindo se vale atualizar.
2. Marque o nível (1, 2 ou 3) de cada mudança.
3. Crie a tag:

```bash
git tag -a v1.1.0 -m "resumo da versao"
git push origin main --tags
```

A tag é o que o `tools/atualizar.js` usa para dizer em que versão cada projeto
está. Sem tag, ele funciona, mas não sabe informar a versão.

**Evite mexer em `body.html` sem necessidade.** É o arquivo de nível 3 mais
provável de estar customizado nos projetos derivados, e toda mudança nele vira
trabalho manual para todo mundo.
