/* ============================================================================
   ESQUELETO DE PRODUTO NOVO
   ----------------------------------------------------------------------------
   1. Copie este arquivo:   cp config/produtos/_NOVO-PRODUTO.js config/produtos/meu-produto.js
   2. Preencha tudo que está marcado com  <<<  PREENCHER
   3. Aponte config/produto.js para a sua cópia
   4. node build.js   (o build reclama de tudo que faltar)

   NÃO apague campos para "simplificar": o template conta com eles. Para
   ESCONDER um bloco, use `null` (brinde, escassez, rotinas, destaque, ugc,
   thumbs, chips) — está indicado em cada um.

   Ao lado deste arquivo existe `ritual-da-pele.js`, PREENCHIDO. Quando tiver
   dúvida sobre o que um campo faz, olhe lá e depois olhe a página no ar.

   MACROS: dentro de qualquer texto você pode escrever {{FRETE_EXPRESSO}},
   {{EMAIL}}, {{TELEFONE}}, {{MARCA}}, {{PRECO_MENOR}}, {{PRECO_PADRAO}} — o
   build substitui pelo valor real. Use SEMPRE que citar um preço na copy: é o
   que impede a copy de envelhecer quando o preço muda.

   ----------------------------------------------------------------------------
   ANTES DE PREENCHER: leia docs/CONVERSAO.md e docs/COPY.md.

   Este arquivo não é um formulário de cadastro de produto. Cada campo ocupa uma
   posição numa MÁQUINA DE CONVERSÃO — a ordem das seções, a matemática da
   escada de oferta e a sequência de quebra de objeção são o que faz a página
   vender. `docs/CONVERSAO.md` explica o porquê de cada bloco;
   `docs/COPY.md` traz a fórmula de texto de cada um, tirada das linhas que
   estão no ar.

   A pergunta em cada seção NÃO é "que texto ponho aqui?".
   É "que objeção esta seção mata neste produto?".
   ============================================================================ */

module.exports = {

  /* ---------------------------------------------------------------- 1. SEO */
  seo: {
    lang: 'pt-BR',
    dominio: 'https://SEU-PROJETO.vercel.app',      // <<< PREENCHER (sem barra no fim)
    titulo: '',                                      // <<< PREENCHER (até ~60 caracteres)
    descricao: '',                                   // <<< PREENCHER (até ~155 caracteres)
    ogTipo: 'product',
    ogTitulo: '',                                    // <<< PREENCHER
    ogDescricao: '',                                 // <<< PREENCHER
    ogImagem: 'public/images/product/hero.webp',     // <<< caminho relativo, sem barra inicial
    ogImagemW: 760,
    ogImagemH: 760,
    siteName: '',                                    // <<< PREENCHER (nome do site)
    themeColor: '#FAF7F5'                            // igual ao fundo da página (cores.pp)
  },

  /* -------------------------------------------------------------- 2. MARCA */
  marca: {
    nome: '',            // <<< logo, minúsculo costuma cair melhor no tipo
    ponto: '.',          // caractere que fecha a marca; '' para nenhum
    nomeLegal: '',       // <<< como a marca é escrita em texto corrido
    sobre: '',           // <<< uma linha no rodapé
    email: '',           // <<< e-mail de atendimento (aparece na página e nos erros)
    telefone: '',        // <<< (00) 00000-0000
    telefoneLink: '',    // <<< +5500000000000
    horario: 'Atendimento: seg a sex, 9h às 18h',
    copyright: ''        // <<< © 2026 Marca. Todos os direitos reservados.
  },

  /* ------------------------------------------------------ 3. CORES E FONTES
     Só a PALETA muda. Espaçamento, proporção e ritmo são o DNA do template e
     ficam em src/tema.css. Um acento só: o resto é papel e tinta.
     Depois de trocar `rs`, rode `node tools/contraste.js`. */
  cores: {
    pp:    '#FAF7F5',   // fundo da página
    sf:    '#FFFFFF',   // superfície de card
    sf2:   '#F4EFEC',   // superfície secundária
    ln:    '#E9E1DD',   // fio de 1px
    ln2:   '#D8CCC6',   // fio mais marcado
    t1:    '#1E1218',   // títulos
    t2:    '#54444C',   // corpo
    t3:    '#736570',   // meta e legendas
    rs:    '#B0446E',   // <<< ACENTO ÚNICO — é o que muda a cara do site
    rsD:   '#8B2F55',   // <<< acento pressionado (mais escuro)
    rsW:   '#FBF2F5',   // <<< acento lavado (fundo de chip)
    rsLn:  '#F0DCE4',   // <<< fio no tom do acento
    au:    '#8A6524',   // estrelas
    gr:    '#1F6B45'    // confirmação
  },
  tipografia: {
    display: "'Fraunces',Georgia,serif",
    texto: "'Plus Jakarta Sans',system-ui,-apple-system,sans-serif"
    /* Trocar a fonte exige trocar também public/fonts.css. Ver docs/DNA-VISUAL.md. */
  },

  /* ----------------------------------------------------------- 4. TRACKING */
  tracking: {
    metaPixelId: '',                 // <<< PREENCHER
    storagePrefix: 'meuproduto',     // <<< único por produto (chave do localStorage)
    utmify: true,
    janelaAtribuicaoDias: 7
  },

  /* ----------------------------------------------------------- 5. CHECKOUT
     Único lugar com link/ID de pagamento no projeto inteiro.
     As CHAVES do gateway NÃO ficam aqui — ficam em variável de ambiente.
     Ver .env.example. */
  checkout: {
    provedor: 'korvex',
    produtoId: '',                          // <<< ID do produto no gateway
    baseCheckout: 'https://checkout.korvex.com.br/checkout/',
    /* O nome que aparece no app do banco de quem paga. NAO e o da sua loja
       nem o do gateway: e o do recebedor no BR Code. Descubra fazendo um Pix
       de R$ 1,00 para a sua propria cobranca. Sem isso a pessoa ve um nome
       desconhecido na hora de confirmar e desiste — docs/CONVERSAO.md §9.3. */
    nomeNoExtrato: '',                      // <<< PREENCHER (null esconde o aviso)
    freteExpressoCentavos: 990,             // <<< tem que bater com o painel do gateway
    freteExpressoPrazo: '1 a 3 dias úteis',
    fretePadraoPrazo: '5 a 9 dias úteis'
  },

  /* ------------------------------------------------------------ 6. OFERTAS
     A ordem do array é a ordem na página, e o índice é o `data-i` dos botões.
     PREÇO EM CENTAVOS, INTEIRO. 3790 = R$ 37,90.
     Pode ter 1, 2, 3 ou mais ofertas — a página se adapta.

     ┌── A MATEMÁTICA VEM ANTES DA COPY (docs/CONVERSAO.md §3) ──────────────┐
     │ Monte a escada ANTES de escrever qualquer texto. Na Ritual da Pele:   │
     │                                                                       │
     │   1 un  R$ 37,90  de R$  89,00  -57%  R$ 37,90/un  R$ 0,63/dia        │
     │   2 un  R$ 54,90  de R$ 137,00  -60%  R$ 27,45/un  R$ 0,46/dia  ★     │
     │   3 un  R$ 66,90  de R$ 197,00  -66%  R$ 22,30/un  R$ 0,37/dia        │
     │                                                                       │
     │ 1. O SALTO ENCOLHE: a 1a unidade custa 37,90; a 2a, +17,00; a 3a,     │
     │    +12,00. Se o degrau for constante ou crescente, a escada não puxa  │
     │    ninguém para cima.                                                 │
     │ 2. O DESCONTO CRESCE com o tamanho (57 -> 60 -> 66%). Só dá se o "de" │
     │    crescer mais que proporcionalmente (89 -> 137 -> 197, não 178/267).│
     │ 3. `dias` é a duração REAL de uso — é o denominador do "por dia", que │
     │    transforma R$ 66,90 numa decisão de R$ 0,37.                       │
     │ 4. A oferta do MEIO é a padrão e leva a tarja (★).                    │
     │ 5. Se houver brinde, ele deve valer MAIS que a oferta de entrada.     │
     │ 6. Cada opção precisa da SUA razão de existir, no campo `sub`:        │
     │      entrada -> remove risco    ("ideal para testar")                 │
     │      meio    -> justificativa social ("divida com quem você ama")     │
     │      topo    -> justificativa clínica ("o ciclo completo do melasma") │
     │    "1un / 2un / 3un" não é escada de oferta — é lista de SKU.         │
     └───────────────────────────────────────────────────────────────────────┘ */
  ofertas: [
    {
      id: 'kit1',              // <<< id interno (vai para o tracking)
      code: '',                // <<< código da oferta no gateway (A-Z0-9)
      centavos: 0,             // <<< o que a pessoa paga
      deCentavos: 0,           // <<< preço riscado (tem que ser MAIOR)
      nome: '',                // <<< descrição que vai para o gateway
      rotulo: '',              // <<< "1 Kit Completo" — card da oferta
      rotuloCurto: '',         // <<< "1 Kit" — barra fixa (curto de verdade)
      desc: '',                // <<< "2 meses de tratamento" — linha do preço
      sub: '',                 // <<< "2 meses · ideal para testar" — dentro do card
      unidades: 1,             // <<< quantas miniaturas aparecem no card
      dias: 30,                // <<< duração — usada no cálculo do "por dia"
      destaque: null
    },
    {
      id: 'kit2', code: '', centavos: 0, deCentavos: 0,
      nome: '', rotulo: '', rotuloCurto: '', desc: '', sub: '',
      unidades: 2, dias: 60,
      destaque: 'MAIS VENDIDO'   // a tarja fica na oferta do meio, que é a padrão
    },
    {
      id: 'kit3', code: '', centavos: 0, deCentavos: 0,
      nome: '', rotulo: '', rotuloCurto: '', desc: '', sub: '',
      unidades: 3, dias: 90, destaque: null
    }
  ],
  ofertaPadrao: 'kit2',        // já vem selecionada — costuma ser a do meio
  ofertaComparativo: 'kit3',   // a que aparece na linha de custo da tabela

  /* -------------------------------------------------- 7. BARRA DE ANÚNCIO
     Ícones disponíveis: truck shield pix star check zap spark box chat lock
     gift vol mute arrows. Ver src/tpl-icons.svg. */
  anuncio: [
    { icone: 'truck',  forte: '', texto: '' },   // <<< PREENCHER
    { icone: 'shield', forte: '', texto: '' },
    { icone: 'pix',    forte: '', texto: '' }
  ],
  anuncioSr: '',   // <<< as três frases em texto corrido, para leitor de tela

  /* ---------------------------------------------------------- 8. CABEÇALHO
     Os href têm que casar com os id das seções: #protocolo #resultados
     #avaliacoes #faq #oferta #entrega #garantia */
  nav: [
    { href: '#protocolo',  label: '' },   // <<< PREENCHER
    { href: '#resultados', label: '' },
    { href: '#avaliacoes', label: '' },
    { href: '#faq',        label: '' }
  ],
  navCta: 'Ver oferta',

  /* --------------------------------------------------------------- 9. HERO
     A ORDEM DA PRIMEIRA DOBRA É DECISÃO DE CONVERSÃO (docs/CONVERSAO.md §2):
       foto → nota → paraQuem → titulo → subtitulo → PREÇO → OFERTAS → CTA
       → brinde → escassez → selos
     A prova (nota) vem ANTES do título: promessa depois da prova é
     recomendação, promessa antes é anúncio. E o botão vem logo depois da
     escolha da oferta — quem já decidiu não deve rolar por argumento nenhum.
     Fórmulas de texto de cada campo: docs/COPY.md §1 a §4. */
  hero: {
    imagem: {
      src:     'public/images/product/hero.webp',       // <<< 760x760, produto ocupando 70%+ do quadro
      src480:  'public/images/product/hero@sm.webp',    // <<< mesma foto, 480px
      src760:  'public/images/product/hero.webp',
      src1160: 'public/images/product/hero@2x.webp',    // <<< mesma foto, 1160px
      alt: ''                                          // <<< descreva o que está na foto
    },
    thumbs: [                                           // null esconde a faixa
      { src: 'public/images/product/item-1.webp', alt: '', linha1: '', linha2: '' },
      { src: 'public/images/product/item-2.webp', alt: '', linha1: '', linha2: '' },
      { src: 'public/images/product/item-3.webp', alt: '', linha1: '', linha2: '' }
    ],
    miniOferta: 'public/images/product/mini.webp',      // <<< repetida por unidade no card

    nota: '',            // <<< "4,94"
    notaTexto: '',       // <<< "53 avaliações de clientes"
    paraQuem: '',        // <<< para quem é, em 5 palavras. null remove.
    titulo: '',          // <<< H1. Use <em> na palavra da promessa e <br> onde quebrar.
    subtitulo: '',       // <<< o mecanismo em 2 frases. <b> no que importa.

    chips: [
      { icone: 'pix',   texto: 'À vista no Pix', acento: true },
      { icone: 'truck', texto: 'Frete grátis' }
    ],
    perDiaPrefixo: 'Sai a',
    perDiaSufixo: 'por dia de uso',

    kitsLabel: '',       // <<< "Escolha o seu kit — frete grátis em todos"
    cta: '',             // <<< primeira pessoa: "Quero meu kit", não "Comprar agora"
    ctaNota: '',         // <<< as 3 garantias em uma linha

    brinde: null,        // ou { imagem, alt, tag, nome, texto, selo }
    escassez: null,      // ou a frase. SÓ SE FOR VERDADE.

    selos: [
      { icone: 'check',  texto: '' },   // <<< PREENCHER
      { icone: 'truck',  texto: '' },
      { icone: 'shield', texto: '' },
      { icone: 'zap',    texto: '' }
    ]
  },

  /* --------------------------------------------------------- 10. MECANISMO
     POR QUE o que a pessoa já tentou não funcionou. 3 itens.
     É a seção que transforma "mais um produto" em "a peça que faltava". */
  mecanismo: {
    eyebrow: '',   // <<< "O que ninguém te conta"
    titulo: '',    // <<< a pergunta que a pessoa se faz
    lead: '',      // <<< tira a culpa dela
    itens: [
      { titulo: '', texto: '' },   // <<< PREENCHER os três
      { titulo: '', texto: '' },
      { titulo: '', texto: '' }
    ],
    fecho: ''      // <<< amarra os 3 problemas na sua solução. null remove.
  },

  /* ---------------------------------------------------------- 11. PROTOCOLO
     O produto apresentado POR FUNÇÃO, um passo por item da caixa. É o que
     impede a pessoa de querer comprar só uma parte. */
  protocolo: {
    eyebrow: '',
    titulo: '',
    lead: '',
    passos: [
      { rotulo: '', imagem: 'public/images/product/item-1.webp', alt: '', titulo: '', texto: '', tags: ['', '', ''] },
      { rotulo: '', imagem: 'public/images/product/item-2.webp', alt: '', titulo: '', texto: '', tags: ['', '', ''] },
      { rotulo: '', imagem: 'public/images/product/item-3.webp', alt: '', titulo: '', texto: '', tags: ['', '', ''] }
    ],
    rotinas: null,     // ou [{ icone, tag, passos:['','',''] }, { ... }]
    cuidados: null     // ou { titulo, itens:['','',''] } — OBRIGATÓRIO em cosmético/suplemento
  },

  /* ----------------------------------------------------- 12. LINHA DO TEMPO
     Expectativa realista. Segura o arrependimento e justifica o kit maior. */
  timeline: {
    eyebrow: '',
    titulo: '',
    lead: '',
    itens: [
      { quando: '', titulo: '', texto: '' },   // <<< PREENCHER
      { quando: '', titulo: '', texto: '' },
      { quando: '', titulo: '', texto: '' },
      { quando: '', titulo: '', texto: '' }
    ],
    nota: null
  },

  /* --------------------------------------------------------- 13. VÍDEOS
     Vertical (9:16), curto, sem áudio no carrossel. Formato MP4 (h264).
     Cada item precisa de um poster WEBP no tamanho de exibição — poster
     pesado é o maior vilão do peso desta página. */
  videos: {
    eyebrow: '',
    titulo: '',
    lead: '',
    itens: [
      { src: 'public/media/v1.mp4', poster: 'public/media/v1.webp', titulo: '', legenda: '', alt: '' }
      // <<< 3 a 5 itens
    ],
    destaque: null    // ou { src, poster, botaoAria, botaoLabel, hint }
  },

  /* ---------------------------------------------------------- 14. AVALIAÇÕES
     SÓ PUBLIQUE AVALIAÇÃO QUE EXISTE. Se a página exibe "avaliações de
     clientes reais", elas precisam ser reais — é publicidade enganosa, não
     detalhe de copy. Produto sem avaliação: deixe `itens: []` e tire a
     menção a nota do hero. */
  avaliacoes: {
    eyebrow: '',
    titulo: '',
    nota: '',
    resumo: '',
    selo: 'Compra verificada',
    itens: [
      { nome: '', estrelas: 5, texto: '', meta: '' }   // <<< 4 a 6
    ],
    ugc: null,        // ou lista de caminhos em public/images/testimonials/
    ugcAlt: 'Foto enviada por cliente'
  },

  /* --------------------------------------------------------- 15. COMPARATIVO
     Coluna 1 é sempre a SUA (ganha o destaque).
     Célula: 'texto'  |  {sim:'Sim'}  |  {nao:'Não'}  |  {precoOferta:true, sub:''}
     Cada linha precisa de exatamente tantos valores quantas colunas. */
  comparativo: {
    eyebrow: '',
    titulo: '',
    lead: '',
    caption: '',       // descrição da tabela para leitor de tela
    colunas: ['', '', ''],
    linhas: [
      { criterio: '', valores: [{ sim: 'Sim' }, { nao: 'Não' }, ''] },
      { criterio: '', valores: [{ precoOferta: true, sub: '' }, '', ''] }
    ],
    nota: null
  },

  /* ----------------------------------------------------- 16. ENTREGA E CONFIANÇA */
  entrega: {
    eyebrow: '',
    titulo: '',
    lead: '',
    itens: [
      { icone: 'pix',   titulo: '', texto: '' },
      { icone: 'box',   titulo: '', texto: '' },
      { icone: 'truck', titulo: '', texto: '' }   // cite o frete como {{FRETE_EXPRESSO}}
    ]
  },

  /* -------------------------------------------------------------- 17. GARANTIA */
  garantia: {
    titulo: '',   // <<< use <em> e <br>
    texto: ''     // <<< diga COMO se pede a devolução, não só que existe
  },

  /* ------------------------------------------------------------------ 18. FAQ
     Ordem = objeção mais cara primeiro. A primeira abre sozinha. */
  faq: {
    eyebrow: 'Dúvidas',
    titulo: 'Perguntas frequentes',
    itens: [
      { p: '', r: '' }   // <<< 8 a 12
    ]
  },

  /* ------------------------------------------------------------ 19. FECHAMENTO */
  fechamento: {
    titulo: '',
    texto: '',
    cta: '',        // pode ser o mesmo do hero
    ctaNota: ''
  },

  /* ---------------------------------------------------------------- 20. RODAPÉ */
  rodape: {
    selos: [
      { icone: 'pix',    texto: '' },
      { icone: 'lock',   texto: '' },
      { icone: 'truck',  texto: '' },
      { icone: 'shield', texto: '' }
    ],
    colunas: [
      {
        titulo: 'Atendimento',
        links: [
          { icone: 'chat',  label: '{{EMAIL}}',            href: 'mailto:{{EMAIL}}' },
          { icone: 'chat',  label: '{{TELEFONE}}',         href: 'tel:{{TELEFONE_LINK}}' },
          { icone: 'truck', label: 'Rastrear meu pedido',  href: '/rastrear-pedido' },
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
    aria: 'Trocar a opção de compra'
  },

  /* -------------------------------------------- 22. PÁGINAS INSTITUCIONAIS
     Os campos abaixo trocam a identidade nas três páginas de apoio, MAS o
     texto delas é jurídico e precisa ser LIDO E REESCRITO para a sua
     operação: prazo de entrega, forma de pagamento, quem é o vendedor, como
     se rastreia o pedido. Publicar a política de outro produto é risco
     jurídico, não detalhe. Arquivos: src/pg-termos.html,
     src/pg-privacidade.html, src/pg-rastrear-pedido.html. */
  paginas: {
    rastreioUrl: ''    // <<< onde a cliente rastreia de verdade
  },

  /* ------------------------------------------------------------------ 23. LEGAL */
  legal: {
    disclaimer: '',    // <<< ressalva de resultado + "não afiliado ao Facebook/Meta"
    voltarLabel: 'Voltar para a página do produto',
    paginaKitLabel: 'Página do produto'
  }
};
