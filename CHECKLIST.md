# CHECKLIST — antes de publicar

Percorra na ordem. Cada item aqui existe porque a falta dele já custou alguma
coisa em produção.

> ### Antes destes: a auditoria de conversão
>
> Este checklist confere se a página **funciona**. Ele não confere se ela
> **vende**. Rode antes:
>
> - **[`docs/CONVERSAO.md §12`](docs/CONVERSAO.md)** — 22 itens sobre a máquina
>   estar montada (dobra, escada de oferta, escada de objeção, CTA, prova,
>   garantia). Menos de 25 marcados = você usou o layout, não o template.
> - **[`docs/COPY.md §15`](docs/COPY.md)** — 16 itens sobre o texto.
>
> Página tecnicamente perfeita com a máquina desmontada não converte.

---

## 1. Build

- [ ] `node build.js` termina **sem erro** e sem nenhuma linha começando com `***`
- [ ] `npm run contraste` aprova a paleta no AA
- [ ] Nenhum `{{placeholder}}` sobrou no `index.html`
      — o build reclama, mas confira: `grep -o '{{[^}]*}}' index.html`
- [ ] Nenhum `<<< PREENCHER` sobrou no config
      — `grep -n 'PREENCHER' config/produtos/*.js`
- [ ] Todos os assets referenciados existem
- [ ] `index.html`, `termos.html`, `privacidade.html`, `rastrear-pedido.html`
      foram **gerados**, não editados à mão

## 2. Preço e oferta

- [ ] Os preços do config batem com os do **painel do gateway**, oferta por oferta
      (ver `tools/README-precos.md`)
- [ ] O frete expresso do config bate com o order bump no painel
- [ ] `deCentavos > centavos` em todas as ofertas
- [ ] Só **uma** oferta com `destaque`
- [ ] `ofertaPadrao` abre selecionada e o preço do hero é o dela
- [ ] O percentual de desconto faz sentido (é calculado, mas confira o "de")
- [ ] O "por dia" faz sentido — `dias` está preenchido corretamente?
- [ ] Trocar de oferta atualiza: preço do hero, "de", selo de desconto, rótulo,
      "por dia", os três cards e a barra fixa

## 3. Checkout — o teste que importa

Rode `node dev-server.js` e percorra **os quatro passos**, em cada oferta:

- [ ] O resumo mostra a oferta certa e o total certo
- [ ] Marcar o frete expresso soma o valor certo
- [ ] Validação de campo reage: `/?cenario=validacao`
- [ ] Sem credenciais cai no checkout hospedado: `/?cenario=semchave`
- [ ] Gateway fora do ar cai no checkout hospedado: `/?cenario=forade`
- [ ] **Gere o Pix, feche o modal, troque de oferta e reabra.** O código Pix
      antigo **não** pode continuar na tela. O valor do campo 54 do BR Code tem
      que bater com o total exibido.
- [ ] O CEP preenche endereço
- [ ] O código copia-e-cola copia mesmo

## 4. CTAs e links

- [ ] Todos os `[data-open-checkout]` abrem o modal: hero, fechamento, barra fixa
- [ ] O CTA do cabeçalho leva a `#oferta` (**não** abre o modal)
- [ ] Os links da nav chegam nas seções certas
- [ ] Rodapé: e-mail abre o cliente de e-mail, telefone disca
- [ ] `/termos`, `/privacidade`, `/rastrear-pedido` respondem (sem 404)
- [ ] O link de rastreio aponta para onde a cliente rastreia de verdade

## 5. Mobile

Teste em um aparelho de verdade, não só no emulador.

- [ ] O hero cabe em uma tela e meia; o botão está alcançável
- [ ] A página **não rola na horizontal** em nenhum ponto
- [ ] A tabela comparativa rola dentro do próprio container
- [ ] Os carrosséis arrastam com o dedo e a animação congela ao toque
- [ ] Os posters de vídeo aparecem (nenhum card preto)
- [ ] A barra fixa aparece ao rolar e **some** quando um botão de compra está
      visível — e **não pisca** na borda
- [ ] A barra fixa não cobre o conteúdo do fechamento
- [ ] Nada de layout pulando durante o carregamento
- [ ] Com o teclado aberto, o modal de checkout continua utilizável

## 6. Desktop

- [ ] Hero em duas colunas a partir de 940px
- [ ] Grades de 3 colunas a partir de 860px
- [ ] Foco visível ao navegar por Tab (`:focus-visible`)
- [ ] Os cards de oferta funcionam pelo teclado (setas dentro do radiogroup)
- [ ] O link "pular para o conteúdo" aparece no primeiro Tab

## 7. Console e rede

- [ ] Console **sem erro** (aviso de terceiro é aceitável)
- [ ] `POST /api/capi` responde 200 em cada evento
- [ ] Nenhum 404 na aba Rede
- [ ] Nenhum recurso pesado inesperado — confira o total transferido

## 8. Tracking

- [ ] `?fbtest=TESTxxxxx` → os eventos aparecem em **Testar eventos**
- [ ] `PageView`, `ViewContent`, `AddToCart`, `InitiateCheckout`,
      `AddPaymentInfo` aparecem **pareados** (navegador + servidor), não duplicados
- [ ] `InitiateCheckout` sai **uma vez** mesmo abrindo e fechando o modal
- [ ] `?utm_source=teste&utm_campaign=x` persiste na navegação
- [ ] Uma campanha nova **não** herda `utm_content` da anterior
- [ ] `META_TEST_EVENT_CODE` está **vazio** em produção
- [ ] O pixel do config e o token do `.env` são do **mesmo** pixel

## 9. Conteúdo e jurídico

- [ ] Nenhuma avaliação inventada — se não há avaliação real, a lista está
      vazia **e** a nota saiu do hero
- [ ] Nenhuma promessa de resultado que o produto não sustenta
- [ ] `escassez` só está preenchida se for verdade
- [ ] `src/pg-termos.html` **reescrito** para esta operação
- [ ] `src/pg-privacidade.html` **reescrito** para esta operação
- [ ] `src/pg-rastrear-pedido.html` **reescrito** — o método de rastreio descrito
      é o que existe de verdade
- [ ] Razão social, CNPJ e endereço preenchidos nas institucionais
- [ ] Disclaimer no rodapé, com a não-afiliação a Facebook/Instagram/Meta
- [ ] Advertências e contraindicações presentes (cosmético/suplemento)
- [ ] Texto revisado — o config é copiado do esqueleto e é fácil sobrar um
      placeholder no meio de uma frase

## 10. Segurança

- [ ] `git status --porcelain | grep -iE "\.env|\.vercel"` **não devolve nada**
- [ ] Nenhuma chave em `config/`, `src/` ou em comentário
- [ ] Nenhum arquivo em `api/` que não seja handler HTTP
      (a Vercel transforma tudo ali em função pública)

## 11. Publicação

- [ ] Variáveis de `.env.example` cadastradas na Vercel
- [ ] **Redeploy depois de cadastrar** — variável nova não entra em deployment existente
- [ ] `vercel --prod --yes`
- [ ] `vercel alias ls` — o domínio principal está no deployment novo?
      Se não: `vercel alias set <deployment-url> <seu-dominio>`
- [ ] Abrir o domínio de produção e repetir os itens 4, 5 e 7
- [ ] Uma **venda real de teste**: o `Purchase` no Gerenciador bate com o valor
      cobrado, e o pedido apareceu na UTMify

---

## Depois de publicar

- [ ] Guardar o link do painel do gateway e o id do pixel em lugar acessível
- [ ] Conferir o primeiro dia de campanha: eventos recebidos × vendas reais
- [ ] **Não** montar polling contra a API do gateway para monitorar — o WAF do
      fornecedor bloqueia a origem e derruba o checkout
