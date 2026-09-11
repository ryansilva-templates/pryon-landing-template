# TRACKING — pixel, CAPI, UTMs

Todo evento sai por **duas pontas** com o mesmo `event_id`: pelo pixel no
navegador e por `/api/capi` no servidor. A Meta reconhece o par pelo id e conta
uma vez só.

Vale a redundância porque bloqueador de anúncio, iOS e perda de cookie derrubam
boa parte dos disparos do navegador — e o que sai do servidor ainda leva IP e
user-agent reais, que melhoram o match.

---

## O que é configurável e o que é secreto

**No config** (`config/produtos/<produto>.js`), porque é público de qualquer
forma — aparece no HTML:

```js
tracking: {
  metaPixelId: '000000000000000',
  storagePrefix: 'meuproduto',      // único por produto
  utmify: true,
  janelaAtribuicaoDias: 7
}
```

**Em `.env`**, porque é segredo e nunca entra no repositório:

| Variável | Para quê |
|---|---|
| `META_CAPI_TOKEN` | autentica o envio server-side |
| `META_PIXEL_ID` | o mesmo id, do lado do servidor |
| `META_TEST_EVENT_CODE` | **vazio em produção** — com ele preenchido, os eventos reais não contam |
| `UTMIFY_API_TOKEN` | reporta a venda para a UTMify |
| `KORVEX_PUBLIC_KEY` / `KORVEX_SECRET_KEY` | criam a cobrança |
| `KORVEX_WEBHOOK_SECRET` | valida o webhook de pagamento |

> **Trocar o pixel exige trocar o token junto.** Token velho não autentica no
> pixel novo — a Meta recusa a chamada e você fica sem a ponta do servidor sem
> perceber.

---

## Os eventos

| Evento | Quando | De onde |
|---|---|---|
| `PageView` | no load | inline no `<head>` + `/api/capi` |
| `ViewContent` | 1,2s depois do load | `app.js` — quem fecha antes não conta |
| `AddToCart` | abertura do checkout e passo 1 | `app.js` |
| `InitiateCheckout` | **uma vez por sessão** | `app.js` |
| `AddPaymentInfo` | geração do Pix | `app.js` |
| `Purchase` | pagamento confirmado | **só** `api/korvex-webhook.js` |

**`InitiateCheckout` sai uma vez por sessão**, não a cada abertura do modal.
Quem abre, fecha e reabre estava gerando três eventos para uma intenção só —
e o custo por IC nos relatórios ficava artificialmente baixo.

**`Purchase` nunca sai do navegador.** `api/capi.js` é endpoint público e
**recusa** Purchase de propósito: aceitar do navegador deixaria qualquer pessoa
inventar venda no seu pixel. Ele vem do webhook, quando o dinheiro cai de
verdade — a maioria das clientes nunca volta para uma tela de obrigado.

**Identidade a partir do passo 1.** Assim que a pessoa preenche o formulário,
`email`, `telefone` e `nome` seguem junto com os eventos de meio de funil (o
hash é feito no servidor). Sem isso, o `Purchase` era o único evento com
identidade e a Meta tinha muito menos com que parear.

---

## A trava de desenvolvimento

```js
window.HB_LOCAL = ['localhost','127.0.0.1','[::1]','::1'].indexOf(location.hostname) !== -1;
```

Sem ela, abrir a página no `dev-server.js` manda `PageView`, `ViewContent` e
`InitiateCheckout` **de verdade** para a conta — evento de teste misturado com
o funil real, no mesmo histórico que um analista da Meta pode acabar lendo.

A lista é **fechada de propósito**. Não adicione `.vercel.app` a ela: a
produção roda em um subdomínio `.vercel.app` e isso mataria o tracking real.

O sinal fica em `window.HB_LOCAL` porque o `app.js` precisa dele também — lá
saem os outros dois caminhos de envio.

### Testar eventos

Abra a página com `?fbtest=TESTxxxxx` (o código da aba **Testar eventos** do
Gerenciador). Ele vai para o `sessionStorage` e vale nos cliques seguintes;
some quando a aba fecha, então não tem como escapar para o tráfego real.

---

## UTMs e click ids

Capturados na primeira visita e injetados em todo link externo:

```
utm_source  utm_medium  utm_campaign  utm_content  utm_term
placement   site_source_name
fbclid  gclid  ttclid  msclkid  sck  src
```

### Duas decisões que corrigiram atribuição errada

**1. Clique novo SUBSTITUI o anterior, não mistura.**
Antes era `Object.assign` sobre o que já estava guardado. Quem chegasse pela
campanha B **sem** `utm_medium` herdava o `"cpc"` da campanha A — e a venda ia
para a campanha errada.

**2. As sobras da UTMify são apagadas antes do script dela rodar.**
A UTMify guarda cada UTM em uma chave própria, com validade própria, e só
sobrescreve as que vierem na URL nova. Quem chega hoje pela campanha B, sem
`utm_content`, fica com o `utm_content` da campanha A da semana passada — e a
venda aparece no criativo errado no relatório dela, enquanto a Meta credita o
clique de verdade.

O bloco inline no `<head>` roda **antes** do script dela (que é `async defer`)
e limpa só as chaves `utm_*` que não vieram neste clique. Nada mais do storage
dela é tocado.

**3. Atribuição vencida é apagada.** A janela é a mesma da Meta (7 dias por
padrão). Depois disso o clique já não conta para o anúncio, e continuar
mandando a UTM velha sujaria o relatório com venda orgânica creditada à
campanha.

**`storagePrefix` tem que ser único por produto.** Duas LPs no mesmo domínio
com o mesmo prefixo dividem a mesma atribuição.

---

## O webhook de pagamento

`api/korvex-webhook.js` recebe `TRANSACTION_PAID` e faz duas coisas: dispara o
`Purchase` para a Meta e reporta o pedido para a UTMify.

Coisas que já deram errado e estão resolvidas — **não desfaça**:

- **`event_id` é o `transaction.id`.** Ele já saiu de uma varredura genérica que
  procurava a chave `id`; duas compras da mesma pessoa saíam com o mesmo id e a
  Meta descartava a segunda como duplicata.
- **Entrega repetida é ignorada.** O mesmo `TRANSACTION_PAID` chegou duas vezes
  com 740ms de diferença (dois webhooks cadastrados no painel do gateway). Na
  Meta não fazia estrago — mesmo `event_id`, ela deduplica. Na UTMify, dois
  POSTs quase simultâneos viravam dois pedidos.
- **O valor reportado é o valor real cobrado**, incluindo o order bump do frete
  expresso quando ele existe.

---

## Conferindo que está funcionando

1. **Gerenciador de Eventos → Testar eventos.** Abra a página com `?fbtest=…` e
   percorra o funil. Os eventos devem aparecer **pareados** (navegador +
   servidor), não duplicados.
2. **Aba Rede do navegador.** `POST /api/capi` deve responder 200 em cada
   evento.
3. **Qualidade do evento.** O match rate do `Purchase` deve subir depois que o
   passo 1 do checkout passa a mandar identidade.
4. **Uma venda real.** É o único teste que fecha o ciclo: o `Purchase` no
   Gerenciador tem que bater com o valor cobrado.

**Não monte polling contra a API do gateway para "monitorar".** Um monitor de 3
em 3 minutos fez o WAF do fornecedor bloquear a origem e derrubou o checkout
inteiro.
