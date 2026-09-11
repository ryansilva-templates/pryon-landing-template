# CONVERSÃO — o sistema que faz esta página vender

> **Este é o documento mais importante do repositório.**
>
> O template não é um layout bonito com campos trocáveis. É uma **máquina de
> conversão** com uma ordem específica, uma matemática de oferta específica e
> uma sequência de quebra de objeção específica. O visual é consequência.
>
> Trocar de produto significa **refazer o conteúdo mantendo a máquina**. Se
> você preencheu todos os campos e a página não segue mais a lógica descrita
> aqui, o template foi usado como papel de parede.

---

## 1. O funil inteiro, em uma tela

```
ANÚNCIO (Meta)
   │  utm + fbclid capturados na 1ª visita, janela de 7 dias
   ▼
PRIMEIRA DOBRA  ──────────────────────────────► pode comprar AQUI
   │  foto · nota · promessa · preço · escolha · BOTÃO
   │  (quem já decidiu não rola mais nada)          2 toques até o modal
   ▼
SEQUÊNCIA DE OBJEÇÃO  (para quem não comprou de cara)
   │  1. por que falhou antes      → mecanismo
   │  2. o que é, por função       → protocolo
   │  3. quando vejo resultado     → linha do tempo
   │  4. funciona mesmo?           → vídeo + avaliações
   │  5. não dá mais barato?       → comparativo
   │  6. como pago e recebo        → entrega
   │  7. e se eu me arrepender     → garantia
   │  8. dúvidas residuais         → FAQ
   ▼
FECHAMENTO  ──────────────────────────────────► repete a oferta
   │  sem argumento novo. só a decisão.
   ▼
CHECKOUT NA PRÓPRIA PÁGINA  (4 passos, sem redirect)
   │  resumo → dados → endereço + order bump → Pix
   ▼
PIX PAGO → webhook → Purchase
```

**A barra fixa acompanha a rolagem inteira**, com a escolha de oferta junto.
Em qualquer ponto da sequência de objeção a pessoa está a **um toque** da
compra — e a cada seção que ela lê, ela está mais pronta.

**Regra de ouro do funil:** cada seção existe para matar **uma** objeção, na
ordem em que ela aparece na cabeça de quem lê. Seção que não mata objeção é
enfeite e deve sair.

---

## 2. A primeira dobra — onde a venda acontece

A dobra é montada para que **quem já está pronto compre sem ler nada**, e quem
não está encontre o próximo argumento logo abaixo.

```
foto do produto          ← o que é (0,5s)
nota 4,94 · 53 avaliações ← outros já compraram (prova ANTES da promessa)
"Para manchas de acne, sol e melasma"  ← isto é para MIM
TÍTULO: a promessa
subtítulo: o mecanismo em 2 frases
PREÇO + de + "R$ 0,46 por dia"
ESCOLHA DA OFERTA (3 cards)
BOTÃO  ◄──────────────── o botão vem AQUI
brinde
escassez
4 selos de confiança
```

### As quatro decisões que fazem a dobra funcionar

**1. A prova social vem ANTES do título.**
A nota aparece acima da promessa. Quando a pessoa lê a promessa, já sabe que
53 pessoas validaram. Promessa sem prova é anúncio; promessa depois da prova é
recomendação.

**2. A qualificação vem antes da promessa.**
`"Para manchas de acne, sol e melasma"` — cinco palavras que dizem "isto é para
você" ou "isto não é para você". Filtrar cedo aumenta a conversão de quem fica.

**3. O botão vem logo depois da escolha da oferta.**
Na versão anterior ele ficava depois do brinde e do aviso de estoque, **~110px
mais fundo**. Quem já decidiu não precisa rolar por argumento nenhum. Brinde,
escassez e selos continuam ali — mas **abaixo** do botão, para quem ainda não
decidiu.

**4. O preço já vem com a oferta escolhida.**
A oferta do meio abre **pré-selecionada**. A pessoa nunca vê "a partir de" nem
precisa escolher para saber quanto custa. A decisão é "compro ou não", não
"quanto custa afinal".

### A ordem é essa. No config, ela é:

```
hero.nota / notaTexto     → prova
hero.paraQuem             → qualificação
hero.titulo               → promessa
hero.subtitulo            → mecanismo
(preço, calculado)        → âncora
ofertas[]                 → escolha
hero.cta                  → ação
hero.brinde               → valor extra
hero.escassez             → urgência
hero.selos                → risco
```

---

## 3. A arquitetura da oferta — a matemática

Esta é a parte que mais gente copia errado. Os números da Ritual da Pele:

| | 1 kit | 2 kits | 3 kits |
|---|---|---|---|
| preço | R$ 37,90 | **R$ 54,90** | R$ 66,90 |
| "de" | R$ 89,00 | R$ 137,00 | R$ 197,00 |
| desconto | −57% | **−60%** | −66% |
| por unidade | R$ 37,90 | R$ 27,45 | R$ 22,30 |
| por dia | R$ 0,63 | **R$ 0,46** | R$ 0,37 |
| tarja | — | **MAIS VENDIDO** | — |

### Os cinco mecanismos embutidos

**1. Custo marginal decrescente.**
A 1ª unidade custa R$ 37,90. A 2ª custa **+R$ 17,00**. A 3ª custa **+R$ 12,00**.
Cada degrau é mais barato que o anterior — subir parece burrice não fazer.

> Ao montar a sua escada: o salto para o próximo nível tem que ser **menor** que
> o preço da primeira unidade, e ir **encolhendo**. Se o degrau for constante ou
> crescente, a escada não puxa ninguém para cima.

**2. O desconto cresce com o tamanho.**
57% → 60% → 66%. Isso só é possível porque o preço "de" cresce **mais que
proporcionalmente** (89 → 137 → 197, e não 89 → 178 → 267). O selo de desconto
no canto da foto muda junto: escolher maior faz o número na tela **subir**.

**3. Preço por dia.**
`R$ 66,90 ÷ 180 dias = R$ 0,37/dia`. É o que transforma uma decisão de R$ 66,90
numa decisão de trinta e sete centavos. O template **calcula** isso — você só
preenche `dias`.

> `dias` é o campo mais subestimado do config. Ele define o denominador da
> comparação mental. Use a duração real de uso, não um número inflado — se o
> produto dura 30 dias e você escreve 90, a pessoa descobre e você perde a
> recompra.

**4. O padrão é o do meio.**
A oferta de baixo existe para dar um piso barato e fazer a do meio parecer
razoável. A de cima existe para dar destino a quem quer o melhor — e é ela que
a **linha do tempo** justifica ("melasma leva 8 a 12 semanas", e o kit de 2
meses não cobre isso).

**5. O brinde vale mais que a oferta de entrada.**
O brinde é declarado em R$ 39,90. A oferta mais barata custa R$ 37,90. **O que
vem de graça vale mais do que o mínimo que você paga.** Isso não é acidente: é
o que faz a oferta parecer desequilibrada a favor de quem compra.

### O order bump fica no checkout, não na página

O frete expresso (R$ 9,90) só aparece no **passo 3 do modal**, depois de a
pessoa já ter decidido. Colocá-lo na página adicionaria uma variável à decisão
principal — e decisão com duas variáveis converte menos que decisão com uma.

---

## 4. O sistema de CTA

| Onde | Texto | Ação |
|---|---|---|
| cabeçalho | "Ver oferta" | **âncora** para `#oferta` |
| hero | "Quero meu kit" | abre o checkout |
| fechamento | "Quero meu kit" | abre o checkout |
| barra fixa | "Comprar" | abre o checkout |

### As regras

**Primeira pessoa.** "Quero meu kit", não "Comprar agora". O botão é a fala da
pessoa, não a ordem da loja. Quem clica está completando a própria frase.

**O CTA do cabeçalho não abre o checkout.** Quem clica no topo ainda não
escolheu a oferta — abrir o modal ali é pedir uma decisão que a pessoa não
tomou. Ele leva para a oferta.

**A barra fixa é curta.** "Comprar". A pessoa já rolou meia página, já sabe o
que é. Repetir a frase longa ali só ocupa espaço numa barra que precisa caber a
escolha de kit também.

**Todo CTA tem uma linha de risco embaixo.**

```
hero:       Compra segura · Pix aprovado na hora · 30 dias de garantia
fechamento: Pix aprovado na hora · Compra 100% segura
```

Três removedores de risco, separados por `·`, na mesma linha. É a última coisa
que a pessoa lê antes de clicar.

**Nunca:** "Comprar agora", "Saiba mais", "Enviar", "Clique aqui".

---

## 5. A escada de objeção — a ordem importa mais que o texto

### As seções, na ordem, e o que cada uma mata

| Seção | Objeção que mata | Por que nessa posição |
|---|---|---|
| **Mecanismo** | *"já tentei, não funcionou"* | É a primeira coisa que passa na cabeça de quem não comprou de cara. Sem ela, você compete por preço. |
| **Protocolo** | *"o que é isso, exatamente?"* | Apresenta **por função**, um passo por item. É o que impede "dá pra comprar só uma parte?". |
| **Linha do tempo** | *"quando eu vejo resultado?"* | Antes da prova, porque expectativa mal calibrada faz a prova parecer exagero. |
| **Vídeo** | *"isso é real?"* | Rosto antes de texto. |
| **Avaliações** | *"funcionou para outras?"* | Depois do rosto, o texto convence mais. |
| **Comparativo** | *"não dá mais barato de outro jeito?"* | Só faz sentido depois que a pessoa já quer o produto. |
| **Entrega** | *"como pago e quando chega?"* | Última objeção logística. |
| **Garantia** | *"e se eu me arrepender?"* | Sozinha, no fim, como último empurrão. |
| **FAQ** | dúvidas residuais | Varredura final. |

### O mecanismo é a peça que transforma o produto

Os três "porquês" da Ritual da Pele:

```
01  Você trata, mas não protege
02  O ativo não chega na pele
03  Você para cedo demais
```

Repare no que eles têm em comum: **nenhum culpa a pessoa pelo produto errado.**
Culpam o *processo incompleto*. E os três, somados, descrevem exatamente o que o
kit resolve.

> **A fórmula:** liste as 3 razões pelas quais as tentativas anteriores dela
> falharam, de um jeito que (a) não seja culpa dela, (b) não seja culpa do
> produto que ela comprou, e (c) só possa ser resolvido pelo que você vende.
> Feche amarrando os três: *"não são três produtos — são três etapas do mesmo
> protocolo"*.

Sem esta seção, o produto é "mais um". Com ela, é a peça que faltava.

### A linha do tempo trabalha duas vezes

```
Semana 1        → A pele muda de textura
Semanas 2 e 3   → As bordas da mancha abrem      ◄── "é aqui que a maioria desiste"
Semana 4        → Alguém comenta sem você falar nada
Mês 2 em diante → O resultado para de voltar atrás
```

**Antes da compra:** calibra a expectativa e justifica o kit maior.
**Depois da compra:** salva o reembolso. Dizer de antemão *"a semana 2 é onde a
maioria desiste, e é exatamente quando começou a agir"* faz a pessoa atravessar
o vale em vez de pedir o dinheiro de volta.

A semana 4 é a melhor linha da página inteira: **"Alguém comenta sem você falar
nada"**. Não é uma promessa de produto — é a cena que a pessoa quer viver.

> Escreva os marcos como **cenas**, não como métricas. "Redução de 40% na
> hiperpigmentação" não é o que ela quer. Alguém reparar é.

### O comparativo termina no custo, nunca começa

```
critérios funcionais  (o que só o seu faz)
        ↓
critérios de conveniência
        ↓
CUSTO   ← a última linha
        ↓
devolução do dinheiro
```

Quando o preço aparece, a pessoa já concordou com cinco linhas de superioridade.
R$ 66,90 contra "R$ 300 a R$ 600" e "R$ 2.000+" fecha a conta.

Repare também que a linha de custo usa o **kit de 3** — o mais caro — e não o
selecionado. Ele é comparado contra a alternativa mais cara, no período mais
longo. É a comparação mais favorável possível, e continua sendo verdadeira.

### O FAQ é uma escada, não uma lista

```
 1. Em quanto tempo eu vejo o resultado?        ← a que decide a compra
 2. Será que funciona na MINHA pele?
 3. Posso comprar só uma parte?                 ← protege o ticket médio
 4. Serve para o meu caso específico?
 5-7. contraindicação, interação, uso
 8. Como funciona o pagamento?
 9. Como funciona o frete?
10. E se eu não gostar?
11. Meus dados estão seguros?
```

**Objeção mais cara primeiro.** As três primeiras decidem a venda; as últimas só
tiram o pé de trás. Quem inverte essa ordem põe "meus dados estão seguros" na
frente de "isso funciona" — e perde a pessoa antes da pergunta que importa.

A primeira vem **aberta**, para a seção não parecer uma parede de títulos
fechados.

---

## 6. A pilha de prova

Em ordem de encontro:

```
1. nota 4,94 · 53 avaliações        no hero, ANTES do título
2. selo "dermatologicamente testado" no hero
3. vídeos de clientes                rosto e voz
4. nota agregada grande              4,94 · "51 com nota máxima"
5. avaliações escritas               nome + "compra verificada" + data
6. fotos enviadas por clientes       UGC
```

**Rosto antes de texto.** Vídeo vem antes das avaliações escritas: quem já viu
uma pessoa real lê o texto com outra disposição.

**Especificidade vence entusiasmo.** *"Tenho 20 dias de uso contínuo"* converte
mais que *"amei o produto"*. Ao escolher quais avaliações publicar, prefira as
que trazem **número, prazo ou detalhe físico**.

**"51 com nota máxima" de 53.** Admitir que duas não deram nota máxima torna as
outras 51 críveis. Prova perfeita demais não é prova.

> ⚠️ **Só publique avaliação que existe.** Se a página exibe "compra
> verificada" e o disclaimer fala em clientes reais, elas precisam ser reais.
> Produto sem avaliação: lista vazia **e** tire a nota do hero. Fabricar prova é
> risco jurídico, não licença criativa.

---

## 7. A pilha de reversão de risco

Aparece **cinco vezes**, em camadas:

```
barra do topo   "30 dias de garantia — devolvemos 100%"
chips do preço  "À vista no Pix" · "Frete grátis"
selos do hero   "30 dias de garantia" · "Aprovação na hora"
nota do CTA     "Compra segura · Pix aprovado na hora · 30 dias de garantia"
seção garantia  sozinha, com o COMO
```

### A garantia diz COMO, não só QUE existe

> *"Basta responder o e-mail do pedido: a gente resolve por ali mesmo."*

Isso vale mais que "30 dias de garantia". A objeção real não é *"eles têm
garantia?"* — é *"vai dar trabalho conseguir meu dinheiro de volta?"*.

**A fórmula:** prazo + "por qualquer motivo" + os motivos banais explicitados
("resultado, textura, cheiro") + 100% do valor + **o passo único** para acionar.

Ela fica **sozinha na seção**, de propósito. Dividir espaço enfraquece.

---

## 8. Remoção de atrito no checkout

Cada item aqui vale pontos de conversão:

| Decisão | Atrito removido |
|---|---|
| checkout **na própria página** | sair do site mata a venda |
| **Pix**, aprovação na hora | sem cartão, sem parcelamento, sem recusa |
| **4 passos** curtos | formulário longo assusta |
| CEP **preenche o endereço** | 5 campos a menos |
| order bump só no passo 3 | não polui a decisão principal |
| **fallback** para checkout hospedado | API fora = redirect, não venda perdida |
| resumo do pedido no passo 1 | a pessoa confirma o que está comprando |

> **A armadilha que já custou caro:** o modal guarda o passo entre aberturas. Se
> a pessoa gera o Pix, fecha, troca de oferta e reabre, o resumo é redesenhado
> com o preço novo — e o código Pix na tela continuaria sendo o antigo.
> **R$ 67,13 escrito, R$ 55,16 cobrado.** Divergência de preço na hora de pagar é
> das piores: a pessoa já decidiu comprar, vê outro valor no app do banco e
> desiste — e ainda fica com a impressão de que a loja tentou enganá-la.
> Está corrigido. Se mexer no fluxo, reconfira.

---

## 9. Persuasão no Pix — o que muda quando não existe cartão

Vender no Pix **não é vender no cartão com outro botão**. Três coisas mudam, e
a página inteira é desenhada em cima delas.

### 9.1. Não existe parcelamento — então o preço tem que caber hoje

No cartão, R$ 197 vira "12× de R$ 16,42" e a objeção de preço some. No Pix, a
pessoa tira R$ 66,90 da conta **agora**. Por isso:

- a escada inteira mora abaixo de R$ 70;
- o **"por dia"** (R$ 0,37) é o substituto do parcelamento — é o único
  reenquadramento de valor disponível;
- o preço "de" riscado carrega mais peso, porque não há prestação para diluir a
  comparação.

> Se o seu produto só fecha conta acima de R$ 200, o Pix à vista vai doer. Ou
> você monta uma oferta de entrada que caiba, ou aceita converter menos.

### 9.2. Não existe estorno — a garantia substitui o chargeback

Quem paga no cartão tem a bandeira como rede de segurança. Quem paga no Pix
**não tem nada**: o dinheiro sai e não volta sozinho. A pessoa sabe disso.

Isso torna a reversão de risco **mais importante** aqui do que numa página de
cartão, não menos. A garantia não é enfeite de rodapé: ela é o que ocupa o lugar
do estorno na cabeça de quem está prestes a transferir dinheiro para um
desconhecido.

É por isso que a confiança aparece **cinco vezes** antes do botão (§7), e por
isso a seção de garantia diz o **passo único** para acionar. "Basta responder o
e-mail do pedido" é a frase que responde *"e se eu for roubada?"* sem que a
pergunta precise ser feita.

### 9.3. O último metro é onde se perde a venda

O Pix tem um ponto de abandono que não existe no cartão: **o app do banco**. A
pessoa sai da sua página, vai para outro aplicativo, e tudo pode dar errado lá.
A página trata cada um desses riscos:

| Risco no último metro | O que a página faz |
|---|---|
| **o nome estranho no app do banco** | avisa **antes**: *"No app do banco vai aparecer o nome [NOME DO PROCESSADOR]. É a empresa que processa o pagamento do nosso checkout. O pedido é da [marca] e chega normalmente."* |
| "será que caiu?" | *"A tela vira sozinha quando o pagamento cair"* — polling do status |
| perdeu o código | *"Mandamos o código também para o seu e-mail"* |
| está no desktop | QR Code; no celular, copia-e-cola |
| pressa demais | *"o código vale por 24 horas"* — prazo generoso, não pressão |
| por que meu CPF? | *"O CPF é exigido para emitir a nota fiscal do pedido"* |

**O aviso do nome do processador é o item mais subestimado da lista.** A pessoa
decidiu comprar, abriu o banco, e vê o nome de uma empresa que ela nunca ouviu
falar recebendo o dinheiro dela. Sem o aviso, uma parte simplesmente fecha o app.
Custa uma frase e salva vendas já ganhas.

> No seu produto: descubra **qual nome aparece de fato** no extrato (não o nome
> do gateway — o do recebedor) e escreva essa frase com esse nome. Se você não
> sabe qual é, faça um Pix de R$ 1,00 para a sua própria cobrança e olhe.

### 9.4. A recuperação do Pix abandonado

Este é o mecanismo mais valioso do checkout, e ele é invisível.

A pessoa gera o Pix, sai para o banco e volta. Se o navegador do celular
descartou a aba — ou ela voltou pelo anúncio, recarregando — a tela vinha
zerada. Ela preenchia **nome, e-mail, telefone, CPF e o endereço inteiro de
novo**, e gerava OUTRA cobrança. Cada volta virava mais uma pendência. É assim
que uma pessoa aparece com 4 Pix não pagos e nenhum pagamento.

Hoje o código fica guardado por **24 horas**. Ao voltar, a página consulta o
servidor **antes** de mostrar qualquer coisa:

- já foi pago → ela vê a confirmação;
- ainda pendente → vê o **mesmo** código, sem gerar outro;
- venceu ou falhou → o registro é descartado.

A janela era de 30 minutos. Os Pix abandonados auditados tinham **horas** de
idade — quando a pessoa pensava em voltar, o registro já havia sido descartado.
Quase ninguém preenche tudo de novo.

> Ao adaptar: **não encurte essa janela.** Ela não tem risco de mostrar código
> velho, porque o estado real é checado no servidor antes de reexibir.

### 9.5. A regra que não se negocia

**O valor do campo 54 do BR Code tem que bater com o total exibido na tela.**

Já aconteceu de divergir: R$ 67,13 escrito, R$ 55,16 cobrado, porque o modal
guardava o passo entre aberturas e a pessoa trocava de oferta. Divergência de
preço no app do banco é a pior falha possível — a pessoa já decidiu comprar, vê
outro valor e desiste, e ainda sai com a impressão de que a loja tentou
enganá-la. Está corrigido; se mexer no fluxo, reconfira.

### 9.6. O que o Pix dá de graça, e a página usa

**Aprovação na hora.** É o argumento de velocidade que o boleto não tem e o
cartão não garante. Ele aparece **quatro vezes** antes do checkout: barra do
topo, chip do preço, selo do hero e nota do CTA. Não é repetição preguiçosa — é
o único benefício em que o Pix ganha do cartão, e ele é martelado de propósito.

---

## 10. Urgência e escassez — a única regra

```
"Estes preços valem enquanto durar o estoque.
 Quando acabar, o kit volta ao valor cheio."
```

**Não tem contador regressivo.** Existia um de 12h e foi **removido**: além do
markup e do CSS, ele gravava um prazo no `localStorage` de quem visitava. Um
relógio que reinicia a cada visita não engana ninguém duas vezes, e destrói a
confiança que a página inteira construiu.

A escassez aqui é **condicional e verificável**: "enquanto durar o estoque". Se
o estoque acabar, o preço sobe de verdade.

> **A regra:** só use escassez que você honra. Se você não vai subir o preço,
> não escreva que vai. `hero.escassez: null` remove o bloco inteiro — e uma
> página sem escassez falsa converte melhor que uma com escassez descoberta.

---

## 11. As micro-conversões que o funil mede

O tracking não é burocracia: cada evento é um degrau, e a queda entre dois
degraus diz onde a página está perdendo gente.

| Evento | Degrau | O que uma queda aqui significa |
|---|---|---|
| `PageView` | chegou | — |
| `ViewContent` (1,2s) | ficou | anúncio prometeu outra coisa |
| `AddToCart` | abriu o checkout | a oferta não convenceu |
| `InitiateCheckout` | começou a preencher | o resumo assustou (preço? frete?) |
| `AddPaymentInfo` | gerou o Pix | o formulário é longo demais |
| `Purchase` | pagou | o valor do Pix assustou na hora H |

`ViewContent` espera **1,2s** de propósito: quem fecha antes disso não viu nada,
e contá-lo inflaria o topo do funil. `InitiateCheckout` sai **uma vez por
sessão** — abrir e fechar o modal três vezes é uma intenção, não três.

Detalhe completo em [TRACKING.md](TRACKING.md).

---

## 12. Auditoria de conversão — antes de publicar qualquer produto novo

Não é sobre "está bonito". É sobre a máquina estar montada.

- [ ] Dá para **comprar sem rolar a página** — preço, escolha e botão cabem na
      primeira dobra no celular?
- [ ] A **prova social aparece antes do título**?
- [ ] Existe uma linha que diz **para quem é** antes da promessa?
- [ ] A **oferta do meio** abre pré-selecionada e tem a tarja?
- [ ] O **salto de preço encolhe** a cada degrau da escada?
- [ ] O **desconto cresce** com o tamanho da oferta?
- [ ] O **"por dia"** faz sentido (o campo `dias` é a duração real)?
- [ ] O **brinde vale mais** que a oferta de entrada? (ou não existe brinde)
- [ ] O **mecanismo** explica por que ela falhou antes, sem culpá-la?
- [ ] A **linha do tempo** nomeia o momento em que a maioria desiste?
- [ ] Os marcos da linha do tempo são **cenas**, não métricas?
- [ ] O **comparativo termina no custo**, e usa a oferta maior?
- [ ] O **FAQ está em ordem de objeção mais cara primeiro**?
- [ ] A **garantia diz COMO** se pede a devolução, em um passo?
- [ ] Os **3 CTAs de compra** existem (hero, fechamento, barra fixa)?
- [ ] Os CTAs estão em **primeira pessoa**?
- [ ] Todo CTA tem a **linha de 3 removedores de risco** embaixo?
- [ ] O CTA do cabeçalho **não** abre o checkout?
- [ ] A **escassez é verdadeira**, ou está desligada?
- [ ] Toda **avaliação publicada é real**?
- [ ] O **order bump** está no checkout, não na página?
- [ ] O checkout tem **fallback** se a API do gateway cair?

### Específicos do Pix (§9)

- [ ] A oferta inteira **cabe à vista** — nada aqui vai ser parcelado?
- [ ] O **"por dia"** está correto, com `dias` = duração real de uso?
- [ ] A garantia diz o **passo único** para acionar? (no Pix ela substitui o
      chargeback, não é enfeite)
- [ ] **"Aprovação na hora"** aparece na barra do topo, no chip, nos selos e na
      nota do CTA?
- [ ] O passo do Pix avisa **qual nome aparece no extrato** de quem paga?
- [ ] O código Pix tem prazo **generoso** (24h), e não pressão de minutos?
- [ ] A tela **vira sozinha** ao confirmar, e o código também vai por e-mail?
- [ ] A **janela de recuperação** do Pix pendente continua em 24h?
- [ ] O valor do **campo 54 do BR Code** bate com o total exibido?

Se você marcou menos de 25 dos 31, ainda não é o template — é o layout do
template.

---

## 13. O que sai da página, e o que nunca sai

Podem ser removidos por `null` no config sem quebrar a máquina:
brinde, escassez, rotinas, cuidados, UGC, vídeo em destaque, thumbs do hero,
notas de rodapé de seção.

**Nunca removem-se:** hero com escolha de oferta e CTA, mecanismo, prova,
garantia, FAQ, fechamento, barra fixa. Cada um desses é um degrau — tirar um é
tirar o degrau, não o enfeite.
