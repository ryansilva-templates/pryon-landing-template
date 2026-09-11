# COPY — o playbook, com as fórmulas tiradas da página real

Toda fórmula aqui foi extraída de uma linha que **está no ar** em
ritualdapele.vercel.app. O padrão está no formato `[ ]` para você preencher.

Leia [CONVERSAO.md](CONVERSAO.md) antes: ele explica *por que* cada bloco existe.
Este aqui é *como escrever* cada um.

---

## 0. As sete regras de voz

1. **Você, não "o cliente".** A página fala com uma pessoa.
2. **Frase curta.** Se a frase tem duas vírgulas e um "que", corte em duas.
3. **Concreto vence adjetivo.** "R$ 0,37 por dia" > "preço acessível".
   "Alguém comenta sem você falar nada" > "resultados visíveis".
4. **Benefício com o mecanismo colado.** Não "clareia": "reduz a produção de
   melanina e age no fator vascular ligado ao melasma".
5. **Nunca culpe quem lê.** A culpa é do processo incompleto, nunca dela.
6. **Negrito é o resumo.** Quem ler só os negritos tem que sair com a
   informação. Use `<b>` assim, não para "dar ênfase".
7. **Prometa o que o produto entrega.** Claim inflado é reembolso adiado — e,
   em cosmético e suplemento, é problema regulatório.

---

## 1. O título (H1)

**A linha real:**

> Sérum sozinho não apaga a mancha.
> O ***protocolo*** apaga.

**O padrão — "a solução parcial falha, a completa funciona":**

```
[o que ela já tentou] não [resolve o problema].
O [seu mecanismo] <em>[resolve]</em>.
```

Duas frases. A primeira **nega** a solução incompleta que ela já conhece. A
segunda **afirma** a sua. O `<em>` cai na palavra que carrega a promessa — ela
vira itálica no acento.

**Outros padrões que servem à mesma máquina:**

```
"Não é [o que ela culpa]. É [a causa real]."
"[Resultado] em [prazo] — sem [o sacrifício que ela teme]."
"O que faltava não era [produto]. Era [mecanismo]."
```

**Teste do título:** se você trocar o nome do produto pelo do concorrente e a
frase continuar verdadeira, o título não diz nada. Reescreva.

**Não use:** "Transforme sua pele", "A revolução em cuidados", "Descubra o
segredo". São títulos que cabem em qualquer produto e por isso não vendem
nenhum.

---

## 2. A linha de qualificação (`hero.paraQuem`)

**A linha real:**

> Para manchas de acne, sol e melasma

**O padrão:**

```
Para [problema 1], [problema 2] e [problema 3]
```

Três a seis palavras. Nomeia o problema **como a pessoa o chama**, não como a
indústria chama. Ela busca "mancha", não "hiperpigmentação pós-inflamatória".

Serve para dizer "isto é para você" **e** "isto não é para você". Filtrar cedo
sobe a conversão de quem fica.

---

## 3. O subtítulo (`hero.subtitulo`)

**A linha real:**

> Três produtos, três etapas: o sabonete abre caminho, o sérum com **Ácido
> Tranexâmico, Kójico e Niacinamida** trata a fundo, e o Protetor FPS 70 impede
> a mancha de voltar. A maioria das clientes vê o tom emparelhar entre a 3ª e a
> 4ª semana.

**O padrão — mecanismo + prazo:**

```
[Estrutura em número]: [item 1] [faz X], [item 2] com <b>[os ativos/
componentes]</b> [faz Y], e [item 3] [faz Z].
[Quantos] veem [resultado concreto] em [prazo].
```

Duas frases. A primeira é **como funciona** (o mecanismo, com os nomes técnicos
em negrito — eles fazem o produto parecer sério). A segunda é **quando
funciona**.

O prazo no subtítulo é o que segura a próxima pergunta da cabeça dela.

---

## 4. Os cards de oferta

**As linhas reais:**

| campo | 1 kit | 2 kits | 3 kits |
|---|---|---|---|
| `rotulo` | 1 Kit Completo | 2 Kits Completos | 3 Kits Completos |
| `sub` | 2 meses · ideal para testar | 4 meses · divida com quem você ama | 6 meses · o ciclo completo do melasma |
| `desc` | 2 meses de tratamento | 4 meses de tratamento | 6 meses de tratamento |

**O padrão do `sub` — duração + o motivo de escolher ESTE:**

```
[duração] · [o motivo desta pessoa específica escolher esta opção]
```

Repare que os três motivos são **diferentes tipos de razão**:

- **entrada** → *"ideal para testar"* — remove risco
- **meio** → *"divida com quem você ama"* — dá uma justificativa social para
  gastar mais (não é ganância, é generosidade)
- **topo** → *"o ciclo completo do melasma"* — dá uma justificativa **clínica**,
  amarrada na linha do tempo

> Cada opção precisa da **sua própria razão de existir**. "1 unidade", "2
> unidades", "3 unidades" não é escada de oferta — é lista de SKU.

---

## 5. Os três porquês do mecanismo

**As linhas reais:**

```
01  Você trata, mas não protege
02  O ativo não chega na pele
03  Você para cedo demais
```

**O padrão de cada item:**

```
título:  [o erro, em 3 a 5 palavras, no presente]
texto:   [por que acontece, em linguagem física/concreta].
         <b>[a consequência, em uma frase curta].</b>
```

**Exemplo real do item 3:**

> A célula que produz o pigmento leva cerca de 28 dias para se renovar.
> **Parar na 2ª semana é parar exatamente antes do resultado aparecer.**

Mecanismo + consequência em negrito. O negrito é o que ela leva embora.

**O fecho, que amarra os três:**

> É por isso que o kit vem com os três. *Limpar, tratar e proteger* não são três
> produtos — são três etapas do mesmo protocolo.

```
É por isso que [o produto] vem com [todos].
<em>[verbo 1, verbo 2 e verbo 3]</em> não são [N produtos] — são [N etapas do
mesmo processo].
```

Essa frase é a que impede a pessoa de querer comprar só uma parte. Ela vale
dinheiro: sem ela, o FAQ inteiro sobre "posso comprar só o sérum?" chega tarde.

---

## 6. Os passos do protocolo

**As linhas reais (passo 2):**

> rótulo: **Tratar**
> título: Age ***direto na mancha***
> texto: Sérum Multicorretivo Clareador, 30 ml. O Ácido Tranexâmico reduz a
> produção de melanina e age no fator vascular ligado ao melasma. O Kójico apaga
> mancha de acne e sol; a Niacinamida uniformiza e hidrata, para a pele não
> descamar.
> tags: `3% Tranexâmico` · `1% Kójico` · `5% Niacinamida`

**O padrão:**

```
rotulo:  [um verbo]                    ← Limpar / Tratar / Proteger
titulo:  [o que faz] <em>[para quê]</em>
texto:   [nome do item, medida]. [o que cada componente faz, um por um].
tags:    [3 especificações verificáveis]
```

**As tags carregam o peso técnico.** `3% Tranexâmico` é uma concentração — dá
para conferir. Números específicos fazem mais pelo produto do que qualquer
adjetivo.

**A regra de ouro do protocolo:** cada passo tem que justificar **um item da
caixa**. Se sobrar um item sem passo, a pessoa vai perguntar por que está
pagando por ele. Se sobrar um passo sem item, é enchimento.

---

## 7. A linha do tempo

**As linhas reais:**

```
Semana 1         A pele muda de textura
Semanas 2 e 3    As bordas da mancha abrem
Semana 4         Alguém comenta sem você falar nada
Mês 2 em diante  O resultado para de voltar atrás
```

**O padrão:**

```
quando:  [período — vago o suficiente para ser honesto]
titulo:  [a CENA, não a métrica]
texto:   [o que está acontecendo por dentro] + [o que ela vai notar por fora]
```

**Três coisas para copiar:**

**1. O primeiro marco NÃO é o resultado principal.**
> *"Semana 1: ainda não é clareamento. É a pele voltando a respirar."*

Dizer que a semana 1 não entrega o principal compra credibilidade para tudo que
vem depois. Prometer resultado na semana 1 gera reembolso na semana 2.

**2. Nomeie o momento em que a maioria desiste.**
> *"É aqui que a maioria desiste — e é exatamente quando o ativo começou a agir."*

Esta é a frase mais lucrativa da seção. Ela atravessa o vale de desistência
**antes** de a pessoa entrar nele.

**3. O marco do meio é uma cena social.**
> *"Alguém comenta sem você falar nada."*

Não é "redução de 40% na hiperpigmentação". É o que ela realmente quer.

---

## 8. As avaliações

**A que está no ar, e por que funciona:**

> *"Tenho 20 dias de uso contínuo e é a primeira vez que realmente vejo
> diferença ainda mais minha pele que tem mancha de melasma. O brilho, claridade
> e vicosidade da pele estão ótimas... Estou adorando o resultado, de verdade!"*
> — N. N., Avaliou em 30/06

- **prazo específico** ("20 dias de uso contínuo")
- **caso específico** ("mancha de melasma")
- **erro de digitação preservado** ("vicosidade") — avaliação limpa demais
  parece escrita pela loja
- **data** — dá para verificar

**Ao escolher quais publicar, prefira:** número, prazo, detalhe físico, e a
frase "é a primeira vez que". Descarte: "amei", "recomendo", "produto top".

**O resumo agregado:**

> 4,94 · 53 avaliações de clientes — **51 com nota máxima**

Admitir que 2 não deram nota máxima é o que torna as outras 51 críveis. Prova
perfeita demais não é prova.

> ⚠️ Isto só vale se for verdade. Só publique avaliação que existe. Produto sem
> avaliação: `avaliacoes.itens: []` **e** tire a nota do hero.

---

## 9. O comparativo

**A pergunta que vira título:**

> ### "Não dá pra comprar só o sérum?"
> Dá. Só não costuma dar certo — e sai mais caro no fim.

**O padrão:**

```
titulo:  "[a objeção, com aspas, do jeito que ela pensa]"
lead:    [concede] . [mas] — e [o custo escondido].
```

**Conceder primeiro desarma.** "Dá." é a palavra que faz a pessoa continuar
lendo em vez de se defender.

**A ordem das linhas da tabela:**

```
1-3. critérios FUNCIONAIS  (onde só a sua coluna marca sim)
4.   conveniência
5.   CUSTO                  ← a penúltima, nunca a primeira
6.   devolução do dinheiro   ← termina em risco zero
```

**Não marque "sim" em tudo na sua coluna.** A Ritual da Pele marca "Sim" para a
concorrência em *"Ativos clareadores em concentração dermatológica"*. Tabela em
que você ganha em 100% das linhas parece propaganda; tabela em que você ganha
onde importa parece comparação.

---

## 10. A garantia

**A linha real:**

> ### 30 dias em casa.
> ### ***Ou seu dinheiro de volta***
>
> Use o protocolo por **30 dias inteiros**. Mudou de ideia por qualquer motivo —
> resultado, textura, cheiro — e devolvemos **100% do que você pagou**. Basta
> responder o e-mail do pedido: a gente resolve por ali mesmo.

**O padrão:**

```
titulo:  [prazo] [onde/como].<br><em>Ou [a reversão]</em>
texto:   Use [o produto] por <b>[prazo] inteiros</b>.
         [Motivo de desistir] por qualquer motivo — [motivo banal 1],
         [banal 2], [banal 3] — e devolvemos <b>100% do que você pagou</b>.
         Basta [O PASSO ÚNICO]: [o que acontece depois].
```

**As três peças que quase todo mundo esquece:**

1. **Os motivos banais explicitados** — "resultado, textura, cheiro". Dizer que
   até "não gostei do cheiro" vale é o que torna a garantia real.
2. **"100% do que você pagou"** — não "seu dinheiro". Não deixa dúvida sobre
   frete, taxa, parcela.
3. **O passo único** — "basta responder o e-mail do pedido". A objeção real não
   é *"eles têm garantia?"*, é *"vai dar trabalho?"*.

---

## 11. O FAQ

**O padrão de cada resposta:**

```
[Resposta direta na primeira frase]. [Especificidade com <b>número/prazo</b>].
[A nuance honesta]. [Para onde isso leva — devolve para a oferta].
```

**Exemplo real:**

> **Em quanto tempo eu vejo o clareamento?**
> A maioria das clientes começa a ver a pele mais uniforme **entre a 3ª e a 4ª
> semana** [...]. Manchas mais profundas, como melasma, costumam levar de **8 a
> 12 semanas**. É por isso que o kit de 3 unidades (6 meses) é o mais indicado:
> ele cobre o tratamento inteiro sem você ficar sem produto no meio do caminho.

Repare no fecho: a resposta honesta ("pode levar 12 semanas") **vira argumento
para o kit maior**. Toda resposta de FAQ que puder terminar devolvendo para a
oferta, deve.

**Responda "não" quando for não.** *"Estou grávida. Posso usar?"* → *"Consulte
seu obstetra antes de começar [...] quem deve liberar é o seu médico — não a
gente."* Um "não" honesto compra credibilidade para os dez "sim".

**A ordem:** objeção mais cara primeiro. Ver [CONVERSAO.md §5](CONVERSAO.md).

---

## 12. O fechamento

**As linhas reais:**

> ### Sua pele leva 28 dias para se renovar.
> ### ***Comece hoje***
>
> Frete grátis, brinde incluso e 30 dias para testar em casa. Se não gostar,
> devolvemos tudo.
>
> **[ Quero meu kit ]**
> Pix aprovado na hora · Compra 100% segura

**O padrão:**

```
titulo:  [um FATO sobre o produto/corpo que cria urgência real].<br>
         <em>[o chamado, 2 palavras]</em>
texto:   [o que está incluso, em lista corrida]. [a reversão de risco].
```

**A urgência vem de um fato, não de um relógio.** "Sua pele leva 28 dias para se
renovar" é verdade e é urgente: cada dia sem começar é um dia a mais até o
resultado. Não precisa de contador.

**Nada de novo no fechamento.** Só a decisão.

---

## 13. Os CTAs

| Onde | Texto real |
|---|---|
| hero e fechamento | **Quero meu kit** |
| barra fixa | **Comprar** |
| cabeçalho | **Ver oferta** (âncora) |

**O padrão:**

```
Quero [o que ela leva]
```

Primeira pessoa. O botão é a fala dela, não a ordem da loja.

**A linha embaixo, sempre:**

```
[segurança] · [velocidade do pagamento] · [garantia]
```

**Nunca:** "Comprar agora", "Saiba mais", "Enviar", "Clique aqui", "Adicionar ao
carrinho".

---

## 14. A barra de aviso

**As três reais:**

```
🚚  Frete grátis  para todo o Brasil
🛡️  30 dias  de garantia — devolvemos 100%
⚡  Pix  com aprovação na hora
```

**O padrão:**

```
forte:  [1 a 3 palavras — o benefício]
texto:  [a qualificação que o torna crível]
```

Três mensagens, uma por atrito: **entrega**, **risco**, **pagamento**. Não venda
aqui. A pessoa ainda não sabe o que é o produto.

---

## 15. Antes de dar por pronto

- [ ] O título continua verdadeiro se eu trocar o nome do produto? → reescreva
- [ ] Lendo **só os negritos**, a mensagem principal chega?
- [ ] Cada passo do protocolo justifica **um item** da caixa?
- [ ] Os três porquês do mecanismo culpam o **processo**, nunca a pessoa?
- [ ] O primeiro marco da linha do tempo **não** promete o resultado principal?
- [ ] Existe uma frase nomeando **onde a maioria desiste**?
- [ ] Cada opção de oferta tem uma **razão própria** de existir?
- [ ] A tabela comparativa dá **"sim" à concorrência** em pelo menos uma linha?
- [ ] A garantia diz o **passo único** para acionar?
- [ ] Cada resposta do FAQ **devolve para a oferta** quando pode?
- [ ] Existe pelo menos um **"não" honesto** no FAQ?
- [ ] A urgência do fechamento é um **fato**, não um relógio?
- [ ] Todo CTA está em **primeira pessoa**?
- [ ] Todo preço citado na copy usa **macro** (`{{PRECO_PADRAO}}`,
      `{{FRETE_EXPRESSO}}`), nunca o número digitado?
- [ ] Toda avaliação publicada **existe**?
- [ ] Toda promessa é **sustentável** pelo produto?
