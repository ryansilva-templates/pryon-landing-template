/* ============================================================================
   RITUAL DA PELE — CONFIG DE REFERÊNCIA (demo)
   ----------------------------------------------------------------------------
   Este arquivo é o EXEMPLO PREENCHIDO do template. Ele existe para você ver
   como cada campo se comporta na página real antes de preencher o seu.

   NÃO EDITE ESTE ARQUIVO para lançar um produto novo. Copie
   `config/produtos/_NOVO-PRODUTO.js`, preencha, e aponte `config/produto.js`
   para a sua cópia. Assim o demo continua servindo de referência.

   REGRA DE OURO: tudo que é específico do produto mora AQUI. Se você precisou
   abrir `src/body.html` para trocar um texto, o campo está faltando neste
   arquivo — adicione o campo, não o texto solto no HTML.
   ============================================================================ */

module.exports = {

  /* ---------------------------------------------------------------- 1. SEO */
  seo: {
    lang: 'pt-BR',
    dominio: 'https://exemplo.vercel.app',
    titulo: 'Kit Clareador Hidrabene — Protocolo de 3 Passos para Manchas | Ritual da Pele',
    descricao: 'Sabonete, Sérum com Ácido Tranexâmico e Protetor FPS 70: o protocolo de 3 passos que clareia manchas de acne, sol e melasma e impede que voltem. Frete grátis, brinde e 30 dias de garantia. Pague no Pix.',
    ogTipo: 'product',
    ogTitulo: 'Kit Clareador Hidrabene — o protocolo de 3 passos para manchas',
    ogDescricao: 'Sérum sozinho não apaga a mancha. O protocolo de 3 passos apaga — e impede que ela volte. Frete grátis + brinde. Pague no Pix.',
    ogImagem: 'public/images/product/kit-hero.webp',
    ogImagemW: 760,
    ogImagemH: 760,
    siteName: 'Ritual da Pele',
    themeColor: '#FAF7F5'
  },

  /* -------------------------------------------------------------- 2. MARCA */
  marca: {
    /* `nome` sai no logo. `ponto` é o caractere que fecha a marca no cabeçalho
       (fica no acento). Deixe vazio se a sua marca não usa. */
    nome: 'hidrabene',
    ponto: '.',
    nomeLegal: 'Hidrabene',
    sobre: 'Dermocosméticos com ativos dermatológicos testados, entregues em todo o Brasil.',
    email: 'contato@exemplo.com.br',
    telefone: '(00) 00000-0000',
    telefoneLink: '+5500000000000',
    horario: 'Atendimento: seg a sex, 9h às 18h',
    copyright: '© 2026 Hidrabene. Todos os direitos reservados.'
  },

  /* ------------------------------------------------------ 3. CORES E FONTES
     Estes valores viram um bloco `:root` injetado DEPOIS do tema.css. O tema
     em si (proporções, espaçamento, ritmo) não muda — só a paleta.
     Ao trocar `rs`, meça o contraste: `node tools/contraste.js`. */
  cores: {
    pp:    '#FAF7F5',   /* fundo da página        */
    sf:    '#FFFFFF',   /* superfície de card     */
    sf2:   '#F4EFEC',   /* superfície secundária  */
    ln:    '#E9E1DD',   /* fio de 1px             */
    ln2:   '#D8CCC6',   /* fio mais marcado       */
    t1:    '#1E1218',   /* títulos                */
    t2:    '#54444C',   /* corpo                  */
    t3:    '#736570',   /* meta e legendas        */
    rs:    '#B0446E',   /* ACENTO ÚNICO           */
    rsD:   '#8B2F55',   /* acento pressionado     */
    rsW:   '#FBF2F5',   /* acento lavado          */
    rsLn:  '#F0DCE4',   /* fio no tom do acento   */
    au:    '#8A6524',   /* estrelas               */
    gr:    '#1F6B45'    /* confirmação            */
  },
  tipografia: {
    display: "'Fraunces',Georgia,serif",
    texto: "'Plus Jakarta Sans',system-ui,-apple-system,sans-serif"
  },

  /* ----------------------------------------------------------- 4. TRACKING */
  tracking: {
    metaPixelId: '000000000000000',
    /* Prefixo das chaves em localStorage. Troque por produto, senão duas LPs
       no mesmo domínio dividem a mesma atribuição. */
    storagePrefix: 'exemplo',
    utmify: true,
    janelaAtribuicaoDias: 7
  },

  /* ----------------------------------------------------------- 5. CHECKOUT
     Um único lugar para IDs e links de pagamento. Nada de link de checkout
     espalhado por HTML. */
  checkout: {
    provedor: 'korvex',
    produtoId: 'SEUPRODUTO000',
    baseCheckout: 'https://checkout.korvex.com.br/checkout/',
    /* O nome que aparece no app do banco de quem paga. NÃO é o nome da sua
       loja nem o do gateway: é o do recebedor no BR Code. Descubra fazendo um
       Pix de R$ 1,00 para a sua própria cobrança e lendo o extrato.
       Sem isso, a pessoa vê um nome desconhecido na hora de confirmar e
       desiste com o código já colado — ver docs/CONVERSAO.md §9.3.
       null esconde o aviso. */
    nomeNoExtrato: null,
    freteExpressoCentavos: 990,
    freteExpressoPrazo: '1 a 3 dias úteis',
    fretePadraoPrazo: '5 a 9 dias úteis'
  },

  /* ------------------------------------------------------------ 6. OFERTAS
     A ordem do array é a ordem na página. `id` é a chave usada no tracking e
     no checkout. Preço SEMPRE em centavos, inteiro — float de dinheiro erra.
     `destaque` marca o card com a tarja (só um deve ter). */
  ofertas: [
    {
      id: 'kit1', code: 'EXEMPLO1',
      centavos: 3790, deCentavos: 8900,
      nome: '1 Kit Protocolo Clareador',
      rotulo: '1 Kit Completo',
      rotuloCurto: '1 Kit',
      desc: '2 meses de tratamento',
      sub: '2 meses · ideal para testar',
      unidades: 1, dias: 60, destaque: null
    },
    {
      id: 'kit2', code: 'EXEMPLO2',
      centavos: 5490, deCentavos: 13700,
      nome: '2 Kits Protocolo Clareador',
      rotulo: '2 Kits Completos',
      rotuloCurto: '2 Kits',
      desc: '4 meses de tratamento',
      sub: '4 meses · divida com quem você ama',
      unidades: 2, dias: 120, destaque: 'MAIS VENDIDO'
    },
    {
      id: 'kit3', code: 'EXEMPLO3',
      centavos: 6690, deCentavos: 19700,
      nome: '3 Kits Protocolo Clareador',
      rotulo: '3 Kits Completos',
      rotuloCurto: '3 Kits',
      desc: '6 meses de tratamento',
      sub: '6 meses · o ciclo completo do melasma',
      unidades: 3, dias: 180, destaque: null
    }
  ],
  ofertaPadrao: 'kit2',           /* já vem selecionada ao abrir a página */
  ofertaComparativo: 'kit3',      /* a que aparece na linha de custo da tabela */

  /* -------------------------------------------------- 7. BARRA DE ANÚNCIO */
  anuncio: [
    { icone: 'truck',  forte: 'Frete grátis', texto: 'para todo o Brasil' },
    { icone: 'shield', forte: '30 dias',      texto: 'de garantia — devolvemos 100%' },
    { icone: 'pix',    forte: 'Pix',          texto: 'com aprovação na hora' }
  ],
  anuncioSr: 'Frete grátis para todo o Brasil. Garantia de 30 dias. Pagamento via Pix com aprovação na hora.',

  /* ---------------------------------------------------------- 8. CABEÇALHO */
  nav: [
    { href: '#protocolo',  label: 'O protocolo' },
    { href: '#resultados', label: 'Resultados' },
    { href: '#avaliacoes', label: 'Avaliações' },
    { href: '#faq',        label: 'Dúvidas' }
  ],
  navCta: 'Ver oferta',

  /* --------------------------------------------------------------- 9. HERO */
  hero: {
    imagem: {
      src: 'public/images/product/kit-hero.webp',
      src480: 'public/images/product/kit-hero@sm.webp',
      src760: 'public/images/product/kit-hero.webp',
      src1160: 'public/images/product/kit-hero@2x.webp',
      alt: 'Kit Protocolo Clareador Hidrabene com os três produtos: Sabonete Líquido Facial 120 ml, Sérum Multicorretivo Clareador 30 ml e Protetor Solar Facial Clareador FPS 70 de 50 g'
    },
    /* Miniaturas do que vem na caixa. 2 a 4 itens. Vazio esconde a faixa. */
    thumbs: [
      { src: 'public/images/product/sabonete.webp', alt: 'Sabonete Líquido Facial Hidrabene, 120 ml', linha1: 'Sabonete', linha2: '120 ml' },
      { src: 'public/images/product/serum.webp',    alt: 'Sérum Multicorretivo Clareador Hidrabene, 30 ml', linha1: 'Sérum', linha2: '30 ml' },
      { src: 'public/images/product/protetor.webp', alt: 'Protetor Solar Facial Clareador FPS 70 Hidrabene, 50 g', linha1: 'Protetor', linha2: 'FPS 70' }
    ],
    /* Imagem miniatura repetida por unidade dentro do card de oferta. */
    miniOferta: 'public/images/product/kit.webp',

    nota: '4,94',
    notaTexto: '53 avaliações de clientes',
    paraQuem: 'Para manchas de acne, sol e melasma',
    /* <em> vira itálico no acento. Use para a palavra que carrega a promessa. */
    titulo: 'Sérum sozinho não apaga a mancha.<br>O <em>protocolo</em> apaga.',
    subtitulo: 'Três produtos, três etapas: o sabonete abre caminho, o sérum com <b>Ácido Tranexâmico, Kójico e Niacinamida</b> trata a fundo, e o Protetor FPS 70 impede a mancha de voltar. A maioria das clientes vê o tom emparelhar entre a 3ª e a 4ª semana.',

    chips: [
      { icone: 'pix',   texto: 'À vista no Pix', acento: true },
      { icone: 'truck', texto: 'Frete grátis' }
    ],
    /* O terceiro chip é calculado: preço ÷ dias. Texto ao redor do número: */
    perDiaPrefixo: 'Sai a',
    perDiaSufixo: 'por dia de tratamento',

    kitsLabel: 'Escolha o seu kit — frete grátis em todos',
    cta: 'Quero meu kit',
    ctaNota: 'Compra segura · Pix aprovado na hora · 30 dias de garantia',

    /* Brinde. `null` remove o bloco inteiro. */
    brinde: {
      imagem: 'public/images/banners/brinde.webp',
      alt: 'BellaFios Gummies, brinde que acompanha o kit',
      tag: 'Brinde · vai junto hoje',
      nome: 'BellaFios Gummies — Cabelo Forte &amp; Brilhante',
      texto: '60 unidades, vale R$ 39,90. Pele e cabelo cuidados de uma vez.',
      selo: 'GRÁTIS'
    },

    /* Urgência. `null` remove. Escassez tem que ser verdadeira. */
    escassez: 'Estes preços valem <b>enquanto durar o estoque</b>. Quando acabar, o kit volta ao valor cheio.',

    selos: [
      { icone: 'check',  texto: 'Dermatologicamente testado' },
      { icone: 'truck',  texto: 'Frete grátis' },
      { icone: 'shield', texto: '30 dias de garantia' },
      { icone: 'zap',    texto: 'Aprovação na hora' }
    ]
  },

  /* --------------------------------------------------------- 10. MECANISMO
     Por que as tentativas anteriores da pessoa falharam. 3 itens numerados.
     É o bloco que transforma "mais um produto" em "a peça que faltava". */
  mecanismo: {
    eyebrow: 'O que ninguém te conta',
    titulo: 'Por que a mancha sempre volta',
    lead: 'Não é que você escolheu o produto errado. É que faltou fechar o ciclo.',
    itens: [
      { titulo: 'Você trata, mas não protege', texto: 'O ácido clareia por baixo enquanto o sol — e a luz da tela do celular — reativa a melanina por cima. <b>Sem FPS alto todo dia, a mancha volta em semanas.</b>' },
      { titulo: 'O ativo não chega na pele',   texto: 'Resíduo de maquiagem, oleosidade e protetor do dia anterior formam uma barreira. <b>O sérum caro fica na superfície</b> e você culpa a fórmula.' },
      { titulo: 'Você para cedo demais',       texto: 'A célula que produz o pigmento leva cerca de 28 dias para se renovar. <b>Parar na 2ª semana é parar exatamente antes do resultado aparecer.</b>' }
    ],
    fecho: 'É por isso que o kit vem com os três. <em>Limpar, tratar e proteger</em> não são três produtos — são três etapas do mesmo protocolo.'
  },

  /* ---------------------------------------------------------- 11. PROTOCOLO
     Apresentação do produto por etapa de uso. Cada passo justifica um item
     da caixa — é o que impede a pessoa de querer comprar só uma parte. */
  protocolo: {
    eyebrow: 'Como funciona',
    titulo: 'O protocolo, passo a passo',
    lead: 'Dois minutos de manhã, dois à noite. Cada produto tem uma função — nenhum é acessório.',
    passos: [
      {
        rotulo: 'Limpar',
        imagem: 'public/images/product/sabonete.webp',
        alt: 'Sabonete Líquido Facial Hidrabene',
        titulo: 'Abre caminho <em>para o ativo</em>',
        texto: 'Sabonete Líquido Facial, 120 ml. Tira oleosidade, poluição e o resíduo do protetor do dia sem agredir a barreira. É o passo que faz o sérum penetrar de verdade, em vez de ficar por cima.',
        tags: ['Limpeza suave', 'Uso diário', 'Pele sensível']
      },
      {
        rotulo: 'Tratar',
        imagem: 'public/images/product/serum.webp',
        alt: 'Sérum Multicorretivo Clareador Hidrabene',
        titulo: 'Age <em>direto na mancha</em>',
        texto: 'Sérum Multicorretivo Clareador, 30 ml. O Ácido Tranexâmico reduz a produção de melanina e age no fator vascular ligado ao melasma. O Kójico apaga mancha de acne e sol; a Niacinamida uniformiza e hidrata, para a pele não descamar.',
        tags: ['3% Tranexâmico', '1% Kójico', '5% Niacinamida']
      },
      {
        rotulo: 'Proteger',
        imagem: 'public/images/product/protetor.webp',
        alt: 'Protetor Solar Facial Clareador FPS 70 Hidrabene',
        titulo: 'Blinda o <em>resultado</em>',
        texto: 'Protetor Solar Facial Clareador FPS 70, 50 g, com Argila e Niacinamida. É o passo que quase todo mundo pula — e o motivo nº 1 da mancha voltar. Toque seco e hipoalergênico: dá para usar todo dia sem a pele brilhar.',
        tags: ['Amplo espectro', 'Toque seco', 'Hipoalergênico']
      }
    ],
    /* Rotina em duas colunas. `null` remove o bloco. */
    rotinas: [
      {
        icone: 'spark', tag: 'De manhã',
        passos: [
          '<b>Lave o rosto</b> com o Sabonete Líquido Facial.',
          '<b>Aplique 3 a 5 gotas</b> do Sérum Multicorretivo.',
          '<b>Finalize com o Protetor FPS 70</b> — generosamente, e reaplique ao longo do dia.'
        ]
      },
      {
        icone: 'shield', tag: 'À noite',
        passos: [
          '<b>Lave o rosto</b> para tirar protetor, poluição e impurezas.',
          '<b>Aplique o Sérum Multicorretivo.</b>',
          '<b>Hidratante é opcional</b> — o próprio sérum já hidrata.'
        ]
      }
    ],
    /* Advertências e contraindicações. Obrigatório em cosmético/suplemento. */
    cuidados: {
      titulo: 'Antes de começar',
      itens: [
        '<b>O protetor solar é indispensável durante o tratamento</b> — sem ele o clareamento não se sustenta.',
        'Uso externo e adulto. Evite contato com os olhos e não aplique sobre pele lesionada ou irritada.',
        'Em caso de irritação, suspenda o uso e procure orientação médica.',
        'Grávidas e lactantes: consulte seu médico antes de iniciar.',
        'Indicado para todos os tipos de pele com manchas ou tom irregular. 100% vegano e cruelty-free.'
      ]
    }
  },

  /* ----------------------------------------------------- 12. LINHA DO TEMPO
     Expectativa realista de resultado. Segura o arrependimento na semana 2 e
     justifica o kit maior. */
  timeline: {
    eyebrow: 'O que esperar',
    titulo: 'Semana a semana',
    lead: 'O ritmo médio relatado por quem usa o protocolo completo, manhã e noite, sem pular o protetor.',
    itens: [
      { quando: 'Semana 1',        titulo: 'A pele muda de textura',                 texto: 'Ainda não é clareamento. É a pele voltando a respirar: menos oleosidade na zona T, menos aspereza, maquiagem assentando melhor.' },
      { quando: 'Semanas 2 e 3',   titulo: 'As bordas da mancha abrem',              texto: 'É aqui que a maioria desiste — e é exatamente quando o ativo começou a agir. A mancha perde o contorno duro e se dissolve na pele em volta.' },
      { quando: 'Semana 4',        titulo: 'Alguém comenta sem você falar nada',     texto: 'O ciclo de renovação da pele fecha e o tom emparelha. É o ponto em que a diferença aparece na foto — e não só no espelho de perto.' },
      { quando: 'Mês 2 em diante', titulo: 'O resultado para de voltar atrás',       texto: 'Melasma e manchas profundas pedem de 8 a 12 semanas. Com o FPS 70 todo dia, o que você já clareou não regride no primeiro fim de semana de sol.' }
    ],
    nota: 'Pele é individual: manchas mais profundas levam mais tempo, e é por isso que o kit de 3 unidades (6 meses) cobre o tratamento inteiro sem faltar produto no meio do caminho.'
  },

  /* --------------------------------------------------------- 13. PROVA EM VÍDEO
     Carrossel de vídeos + um vídeo em destaque com som. O poster fica em
     `data-poster` e é atribuído por IntersectionObserver — não troque para
     `poster`, o navegador baixaria todas as imagens no load. */
  videos: {
    eyebrow: 'Prova',
    titulo: 'Clientes mostrando a pele',
    lead: 'Vídeos de quem usou o protocolo completo',
    /* Os quatro vídeos originais mostravam o rosto de clientes reais e saíram
       deste demo público — eles autorizaram aparecer vendendo AQUELE produto,
       não servir de exemplo em repositório aberto. Sobrou o de produto.
       No seu projeto, use os seus: 3 a 5 itens é o normal. */
    itens: [
      { src: 'public/media/produto.mp4', poster: 'public/media/produto.webp', titulo: 'O que vem no kit', legenda: 'Sabonete + Sérum + FPS 70', alt: 'Vídeo: o que vem no kit' }
    ],
    /* Vídeo em destaque, com som. null remove o bloco. Na página de referência
       era um depoimento de cliente — ver a nota acima. */
    destaque: null
  },

  /* ---------------------------------------------------------- 14. AVALIAÇÕES
     ATENÇÃO LEGAL: só publique avaliação que existe. Se você exibe o
     disclaimer "avaliações de clientes reais", ela precisa ser real. */
  avaliacoes: {
    eyebrow: 'Avaliações reais',
    titulo: 'Elas contaram o que mudou na pele delas',
    nota: '4,94',
    resumo: '53 avaliações de clientes — 51 com nota máxima',
    selo: 'Compra verificada',
    itens: [
      { nome: 'D. F.',          estrelas: 5, texto: '"Kits chegaram rápido. Protetor solar maravilhoso não fica com a pele oleosa, sabonete limpa bem a pele, sérum tem cheiro suave e percebe-se que tem cheiro dos ácidos na composição. Iniciei uso recentemente.. na torcida pra clarear manchas de melasma."', meta: 'Avaliou em 27/08' },
      { nome: 'N. N.',          estrelas: 5, texto: '"Tenho 20 dias de uso contínuo e é a primeira vez que realmente vejo diferença ainda mais minha pele que tem mancha de melasma. O brilho, claridade e vicosidade da pele estão ótimas... Estou adorando o resultado, de verdade!"', meta: 'Avaliou em 30/06' },
      { nome: 'M. S.',             estrelas: 5, texto: '"Fantástico com apenas 10 dias de uso já percebi melhoras nas manchas que tinham no meu rosto."', meta: 'Avaliou em 11/08' },
      { nome: 'Cliente verificada',  estrelas: 5, texto: '"Antes de adquirir o produto fiquei receosa. Assim que comecei a usar já vi melhoras na pele."', meta: 'Avaliação anônima · 23/08' }
    ],
    /* Fotos enviadas por clientes. A fita duplica os itens sozinha. */
    ugc: [
      'public/images/testimonials/ugc-01.webp',
      'public/images/testimonials/ugc-02.webp',
      'public/images/testimonials/ugc-03.webp',
      'public/images/testimonials/ugc-04.webp',
      'public/images/testimonials/ugc-05.webp',
      'public/images/testimonials/ugc-06.webp',
      'public/images/testimonials/ugc-07.webp',
      'public/images/testimonials/ugc-08.webp'
    ],
    ugcAlt: 'Foto enviada por cliente'
  },

  /* --------------------------------------------------------- 15. COMPARATIVO
     Quebra a objeção "dá pra comprar mais barato de outro jeito".
     A coluna 1 é sempre a sua — ela recebe o destaque.
     Em `valores`, `sim`/`nao` viram selo verde/vermelho; o resto vira texto.
     `precoOferta:true` numa célula injeta o preço da oferta de comparação. */
  comparativo: {
    eyebrow: 'A conta que importa',
    titulo: '"Não dá pra comprar só o sérum?"',
    lead: 'Dá. Só não costuma dar certo — e sai mais caro no fim.',
    caption: 'Comparação entre o protocolo completo Hidrabene, comprar apenas um sérum clareador e fazer tratamento em clínica.',
    colunas: ['Protocolo completo', 'Só o sérum', 'Clínica / laser'],
    linhas: [
      { criterio: 'Limpa antes para o ativo penetrar',                 valores: [{ sim: 'Sim' }, { nao: 'Não' }, 'Sim'] },
      { criterio: 'Ativos clareadores em concentração dermatológica',  valores: [{ sim: 'Sim' }, 'Sim', 'Sim'] },
      { criterio: 'Bloqueia o rebote (FPS 70 + luz visível)',          valores: [{ sim: 'Sim' }, { nao: 'Não' }, 'Só comprando à parte'] },
      { criterio: 'Precisa sair de casa e marcar horário',             valores: [{ sim: 'Não' }, 'Não', { nao: 'Sim' }] },
      { criterio: 'Custo dos 6 primeiros meses',                       valores: [{ precoOferta: true, sub: 'kit de 3 unidades' }, 'R$ 300 a R$ 600', 'R$ 2.000+'] },
      { criterio: 'Devolução do dinheiro se não gostar',               valores: [{ sim: '30 dias' }, 'Varia', { nao: 'Não' }] }
    ],
    nota: 'Valores de clínica e de sérum avulso são faixas de mercado, para efeito de comparação.'
  },

  /* ----------------------------------------------------- 16. ENTREGA E CONFIANÇA */
  entrega: {
    eyebrow: 'Compra segura',
    titulo: 'Como o kit chega até você',
    lead: 'O preço que você vê na tela é o preço final.',
    itens: [
      { icone: 'pix',   titulo: 'Pagamento protegido',      texto: 'Pix processado por gateway certificado, com confirmação automática. Seus dados trafegam criptografados e <b>não ficam armazenados na loja</b>.' },
      { icone: 'box',   titulo: 'Postagem em até 24h úteis', texto: 'O código de rastreio chega no seu e-mail assim que o pedido sai do centro de distribuição. Dá para acompanhar pela <b>página de rastreio</b>.' },
      { icone: 'truck', titulo: 'Frete grátis, Brasil inteiro', texto: '5 a 9 dias úteis, sem valor mínimo. Com pressa? No pagamento você pode somar o <b>frete expresso por {{FRETE_EXPRESSO}}</b> e receber em 1 a 3 dias úteis.' }
    ]
  },

  /* -------------------------------------------------------------- 17. GARANTIA */
  garantia: {
    titulo: '30 dias em casa.<br><em>Ou seu dinheiro de volta</em>',
    texto: 'Use o protocolo por <b>30 dias inteiros</b>. Mudou de ideia por qualquer motivo — resultado, textura, cheiro — e devolvemos <b>100% do que você pagou</b>. Basta responder o e-mail do pedido: a gente resolve por ali mesmo.'
  },

  /* ------------------------------------------------------------------ 18. FAQ
     A primeira vem aberta. Ordem = objeção mais cara primeiro. */
  faq: {
    eyebrow: 'Dúvidas',
    titulo: 'Perguntas frequentes',
    itens: [
      { p: 'Em quanto tempo eu vejo o clareamento?', r: 'A maioria das clientes começa a ver a pele mais uniforme <b>entre a 3ª e a 4ª semana</b> usando o protocolo completo — Sabonete, Sérum e Protetor, duas vezes ao dia. Manchas mais profundas, como melasma, costumam levar de <b>8 a 12 semanas</b>. É por isso que o kit de 3 unidades (6 meses) é o mais indicado: ele cobre o tratamento inteiro sem você ficar sem produto no meio do caminho.' },
      { p: 'Será que funciona na minha pele?', r: 'O protocolo é indicado para <b>todos os tipos de pele com manchas ou tom irregular</b> — acne, sol e melasma. O que mais muda de pessoa para pessoa é o <b>tempo</b>, não o funcionamento: mancha superficial costuma responder entre a 3ª e a 4ª semana; melasma, que é mais profundo, leva de 8 a 12 semanas. Por isso a garantia é de 30 dias: você testa na sua pele, no seu ritmo, e se não gostar devolvemos o valor.' },
      { p: 'Posso usar só o sérum e pular o protetor?', r: 'Pode, mas é o caminho mais rápido para se decepcionar. O sol e a luz visível reativam a produção de melanina exatamente onde o sérum acabou de clarear — é o famoso <b>efeito rebote</b>. Sem o passo 3, você trata de noite e desfaz de dia. O protetor não é um extra do kit: é o que faz o resultado durar.' },
      { p: 'Serve para pele sensível, oleosa ou com acne?', r: 'Sim. A fórmula é <b>dermatologicamente testada, vegana e livre de testes em animais</b>, e a Niacinamida hidrata enquanto clareia — por isso o kit não costuma descamar como clareadores mais agressivos. O protetor é de <b>toque seco</b>, então não pesa nem deixa a pele oleosa. Se você tem alguma condição de pele diagnosticada ou usa ácido prescrito, converse com seu dermatologista antes de começar.' },
      { p: 'Estou grávida ou amamentando. Posso usar?', r: 'Nesse caso <b>consulte seu obstetra antes de começar</b>. O melasma gestacional é muito comum e o protocolo é usado por muitas mães no pós-parto, mas quem deve liberar o uso de ativos durante a gestação e a amamentação é o seu médico — não a gente.' },
      { p: 'Posso usar junto com ácidos ou vitamina C?', r: 'Depende da sensibilidade da sua pele e da combinação de ativos. Para evitar irritação, <b>comece o uso gradualmente</b> — ou consulte um dermatologista para uma orientação personalizada, principalmente se você já usa ácido prescrito.' },
      { p: 'Preciso reaplicar o protetor durante o dia?', r: 'Sim, e isso não é detalhe. <b>A reaplicação é indispensável</b> para manter a proteção contínua e evitar que a mancha escureça de novo, principalmente se você pega sol. Sem reaplicar, o passo 3 do protocolo fica pela metade.' },
      { p: 'Como funciona o pagamento no Pix?', r: 'Você clica em "Quero meu kit", confere o resumo do pedido e preenche seus dados. O <b>QR Code e o código copia-e-cola</b> aparecem na hora. Assim que o banco confirma, o pedido entra automaticamente e você recebe o e-mail com o número dele.' },
      { p: 'Como funciona o frete grátis?', r: 'Frete grátis nas três opções de kit, para <b>qualquer cidade do Brasil, sem valor mínimo</b>, com entrega em 5 a 9 dias úteis. Se você preferir receber mais rápido, na tela de pagamento aparece a opção de <b>frete expresso por {{FRETE_EXPRESSO}}</b>, com entrega em 1 a 3 dias úteis — é só marcar.' },
      { p: 'E se eu não gostar? Como devolvo?', r: 'Você tem <b>30 dias corridos</b> a partir do recebimento. Basta responder o e-mail do pedido dizendo que quer a devolução — nós cuidamos do resto e devolvemos 100% do valor pago. Sem formulário longo, sem justificativa obrigatória.' },
      { p: 'Meus dados estão seguros?', r: 'Sim. A conexão é criptografada de ponta a ponta e o pagamento é processado por um gateway certificado — a loja <b>não armazena dados de pagamento</b>. Usamos seus dados apenas para processar e entregar o pedido, como descrito na <a href="/privacidade" style="color:var(--rs);font-weight:700">Política de Privacidade</a>.' }
    ]
  },

  /* ------------------------------------------------------------ 19. FECHAMENTO */
  fechamento: {
    titulo: 'Sua pele leva 28 dias para se renovar.<br><em>Comece hoje</em>',
    texto: 'Frete grátis, brinde incluso e 30 dias para testar em casa. Se não gostar, devolvemos tudo.',
    cta: 'Quero meu kit',
    ctaNota: 'Pix aprovado na hora · Compra 100% segura'
  },

  /* ---------------------------------------------------------------- 20. RODAPÉ */
  rodape: {
    selos: [
      { icone: 'pix',    texto: 'Pix' },
      { icone: 'lock',   texto: 'Site seguro' },
      { icone: 'truck',  texto: 'Todo o Brasil' },
      { icone: 'shield', texto: '30 dias de garantia' }
    ],
    colunas: [
      {
        titulo: 'Atendimento',
        links: [
          { icone: 'chat',  label: '{{EMAIL}}',           href: 'mailto:{{EMAIL}}' },
          { icone: 'chat',  label: '{{TELEFONE}}',        href: 'tel:{{TELEFONE_LINK}}' },
          { icone: 'truck', label: 'Rastrear meu pedido', href: '/rastrear-pedido' },
          { icone: 'check', label: 'Perguntas frequentes', href: '#faq' }
        ]
      },
      {
        titulo: 'Institucional',
        links: [
          { icone: 'check', label: 'Termos de uso',           href: '/termos' },
          { icone: 'lock',  label: 'Política de privacidade', href: '/privacidade' }
        ]
      }
    ]
  },

  /* ------------------------------------------------------------- 21. BARRA FIXA */
  stickyCta: {
    cta: 'Comprar',
    aria: 'Trocar o tamanho do kit'
  },

  /* -------------------------------------------- 22. PÁGINAS INSTITUCIONAIS
     ATENÇÃO: `src/pg-termos.html`, `src/pg-privacidade.html` e
     `src/pg-rastrear-pedido.html` são TEXTO JURÍDICO. Os campos abaixo trocam
     a identidade (marca, e-mail, telefone, link de rastreio), mas o conteúdo
     precisa ser LIDO E REESCRITO para cada operação — prazo de entrega, forma
     de pagamento, quem é o vendedor, como se rastreia. Publicar a política de
     outro produto é risco jurídico, não detalhe. */
  paginas: {
    rastreioUrl: 'https://exemplo.com/rastrear-pedido'
  },

  /* ------------------------------------------------------------------ 23. LEGAL */
  legal: {
    disclaimer: 'Resultados variam de pessoa para pessoa e dependem do uso contínuo do protocolo. Este produto é um cosmético e não substitui avaliação, diagnóstico ou tratamento dermatológico. Este site não é afiliado ao Facebook, Instagram ou Meta.',
    voltarLabel: 'Voltar para a página do kit',
    paginaKitLabel: 'Página do kit'
  }
};
