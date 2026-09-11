/* ================================================================
   PRYON Landing Master — JS da landing page.
   Estrutura, CSS e interações do template, com a camada de
   oferta/checkout por cima. Os blocos KITS e KORVEX sao GERADOS pelo build.
   ================================================================ */
document.documentElement.classList.remove('nojs');

var RM = window.matchMedia('(prefers-reduced-motion: reduce)').matches;
function money(c){ return 'R$ ' + (c/100).toFixed(2).replace('.',','); }
/* ---------------- Rastreamento: navegador + servidor ----------------
   Cada evento sai por dois caminhos com o MESMO event_id: pelo pixel no
   navegador e por /api/capi no servidor. A Meta reconhece o par pelo id e
   conta uma vez só. Vale a redundância porque bloqueador de anúncio, iOS e
   perda de cookie derrubam boa parte dos disparos do navegador — e o que sai
   do servidor ainda leva IP e user-agent reais, que melhoram o match.
   Purchase não passa por aqui: vem do webhook da Korvex, quando o pagamento
   confirma de verdade. */
function novoId(){
  try{ if(crypto && crypto.randomUUID) return crypto.randomUUID(); }catch(e){}
  return 'e' + Date.now().toString(36) + Math.random().toString(36).slice(2,10);
}
/* ?fbtest=TESTxxxxx faz a navegação desta sessão aparecer na aba Testar Eventos
   do Meta. Fica no sessionStorage para valer nos cliques seguintes, e some quando
   a aba fecha — não tem como escapar para o tráfego real por engano. */
var TESTE_META = (function(){
  try{
    var q = new URLSearchParams(location.search).get('fbtest');
    if(q){ sessionStorage.setItem('hb_fbtest', q); return q; }
    return sessionStorage.getItem('hb_fbtest') || null;
  }catch(e){ return null; }
})();

function cookie(nome){
  var m = document.cookie.match('(^|;)\\s*' + nome + '\\s*=\\s*([^;]+)');
  return m ? decodeURIComponent(m[2]) : null;
}
/* Mesma trava do <head> (ver a nota longa lá). O fallback existe para o caso de
   o bloco do head não ter rodado: na dúvida, o padrão é MANDAR — desligar o
   tracking de produção por acidente seria pior que um evento de teste. */
var HB_LOCAL = (typeof window.HB_LOCAL === 'boolean')
  ? window.HB_LOCAL
  : ['localhost','127.0.0.1','[::1]','::1'].indexOf(location.hostname) !== -1;

function px(name, params, dados){
  var id = novoId();
  // Devolve o id mesmo sem enviar: quem chama usa como event_id.
  if(HB_LOCAL) return id;
  params = params || {};
  dados = dados || {};
  // 1) navegador
  if(window.fbq) try{ window.fbq('track', name, params, { eventID: id }); }catch(e){}
  // 2) servidor — keepalive para o envio sobreviver à saída da página
  try{
    var t = window.HB_TRACKING ? window.HB_TRACKING() : {};
    var corpo = JSON.stringify({
      event_name: name,
      event_id: id,
      event_source_url: location.href,
      value: params.value,
      currency: params.currency,
      content_ids: params.content_ids,
      content_name: params.content_name,
      num_items: params.num_items,
      fbp: cookie('_fbp') || undefined,
      fbc: cookie('_fbc') || undefined,
      fbclid: t.fbclid || undefined,
      /* A partir do passo 1 do checkout já sabemos quem é. O hash é feito no
         servidor (/api/capi); daqui só sai para a nossa própria origem. Sem
         isso os eventos de meio de funil iam sem identidade nenhuma e a Meta
         tinha muito menos com que parear o Purchase depois. */
      email: dados.email || undefined,
      telefone: dados.telefone || undefined,
      nome: dados.nome || undefined,
      test_event_code: TESTE_META || undefined
    });
    fetch('/api/capi', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: corpo,
      keepalive: true,
      credentials: 'same-origin'
    }).catch(function(){});
  }catch(e){}
  return id;
}

/* ---------------- Kits e preço ----------------
   O índice de cada kit é o `data-i` do botão na página.
   offer  = id da oferta no config, e chave do bloco KORVEX no fim deste script
   dias   = duração do tratamento, usada no cálculo do "por dia" */
/* ===== @gerado-por-build: KITS =======================================
   Mesma regra do bloco KORVEX: build.js substitui isto por completo a partir
   de config/produto.js. Não edite preço aqui, e não declare `selIdx` fora
   daqui — o índice da oferta padrão também é gerado. */
var KITS = [];
var selIdx = 0;
var CMP_IDX = 0;
/* ===== fim @gerado-por-build: KITS =================================== */
function kit(){ return KITS[selIdx]; }

function setTxt(id,v){ var e=document.getElementById(id); if(e) e.textContent=v; }

function renderKits(){
  KITS.forEach(function(k,j){
    document.querySelectorAll('[data-price="'+j+'"]').forEach(function(el){ el.textContent = money(k.p); });
    document.querySelectorAll('[data-old="'+j+'"]').forEach(function(el){ el.textContent = money(k.o); });
  });
  document.querySelectorAll('.sk-kit').forEach(function(el){
    var b = el.querySelector('b'); if(b) b.textContent = money(KITS[+el.dataset.idx].p);
  });
}

function selectKit(i){
  selIdx = i;
  var k = kit();
  var disc = Math.round((1 - k.p/k.o) * 100);
  var perDay = k.p / k.dias;

  document.querySelectorAll('.of-kit').forEach(function(el){
    var on = +el.getAttribute('data-i') === i;
    el.classList.toggle('on', on);
    el.setAttribute('aria-checked', String(on));
  });
  document.querySelectorAll('.sk-kit').forEach(function(el){
    el.classList.toggle('on', +el.dataset.idx === i);
  });

  setTxt('hero-price', money(k.p));
  setTxt('hero-old', money(k.o));
  setTxt('disc-badge', '-' + disc + '%');
  setTxt('hero-kit', k.n + ' · ' + k.desc);
  setTxt('perday-txt', 'Sai a ' + money(Math.round(perDay)) + ' por dia de tratamento');
  setTxt('vl-perday', money(Math.round(perDay)));
  // A linha de custo da tabela comparativa fala de um período fixo ("os 6
  // primeiros meses"), então ela é SEMPRE a oferta de comparação — nunca a
  // selecionada. Amarrada ao selecionado, o kit de 4 meses apareceria como se
  // fosse o custo de 6. O índice vem de `ofertaComparativo` no config.
  if(KITS[CMP_IDX]) setTxt('cmp-price', money(KITS[CMP_IDX].p));
  if(window.renderReview) window.renderReview();
}

/* O preço sai do bloco KORVEX (fim do arquivo), que é o mesmo lugar de onde
   sai o código da oferta — assim o que a página mostra e o que a Korvex cobra
   não têm como divergir. */
function hydrate(){
  try{
    KITS.forEach(function(k){
      var o = KORVEX.ofertas[k.offer];
      if(o && o.preco) k.p = o.preco;
    });
  }catch(e){}
  renderKits();
  selectKit(selIdx);
}

document.querySelectorAll('.of-kit').forEach(function(el){
  el.addEventListener('click', function(){ selectKit(+el.getAttribute('data-i')); });
});
document.querySelectorAll('.sk-kit').forEach(function(el){
  el.addEventListener('click', function(){ selectKit(+el.dataset.idx); });
});

/* ---------------- Topbar rotativa ---------------- */
(function(){
  var items = [].slice.call(document.querySelectorAll('.tb-rot .tb-item'));
  if(items.length < 2) return;
  var i = 0;
  if(!items[0].classList.contains('on')) items[0].classList.add('on');
  setInterval(function(){
    var cur = items[i], nx = (i+1) % items.length;
    cur.classList.remove('on'); cur.classList.add('out');
    items[nx].classList.add('on');
    (function(p){ setTimeout(function(){ p.classList.remove('out'); }, 600); })(cur);
    i = nx;
  }, 3600);
})();

/* ---------------- 3 passos (toque nos números) ---------------- */
(function(){
  var sec = document.getElementById('protocolo'); if(!sec) return;
  var dots = [].slice.call(sec.querySelectorAll('.ps-dot'));
  var f1 = document.getElementById('psFill1'), f2 = document.getElementById('psFill2');
  function show(i){
    sec.style.setProperty('--a1', i===0 ? 1 : 0);
    sec.style.setProperty('--a2', i===1 ? 1 : 0);
    sec.style.setProperty('--a3', i===2 ? 1 : 0);
    if(f1) f1.style.setProperty('--f', i >= 1 ? 1 : 0);
    if(f2) f2.style.setProperty('--f', i >= 2 ? 1 : 0);
    dots.forEach(function(d,j){
      d.classList.toggle('on', j===i);
      d.setAttribute('aria-selected', String(j===i));
    });
  }
  dots.forEach(function(d,j){
    d.addEventListener('click', function(){ show(j); });
    d.addEventListener('keydown', function(e){
      var n = e.key === 'ArrowRight' || e.key === 'ArrowDown' ? j+1
            : e.key === 'ArrowLeft'  || e.key === 'ArrowUp'   ? j-1 : null;
      if(n === null) return;
      e.preventDefault();
      n = (n + dots.length) % dots.length;
      show(n); dots[n].focus();
    });
  });
  show(0);
})();

/* ---------------- Âncora de valor (um argumento por vez) ---------------- */
(function(){
  var sec = document.getElementById('scn-valor'); if(!sec) return;
  var dots = [].slice.call(sec.querySelectorAll('.vl-dots button'));
  var idx = 0, auto;
  function show(i, fromAuto){
    idx = i;
    sec.style.setProperty('--b1', i===0 ? 1 : 0);
    sec.style.setProperty('--b2', i===1 ? 1 : 0);
    sec.style.setProperty('--b3', i===2 ? 1 : 0);
    dots.forEach(function(d,j){
      d.classList.toggle('on', j===i);
      d.setAttribute('aria-selected', String(j===i));
    });
    if(!fromAuto) restart();
  }
  function restart(){
    clearInterval(auto);
    if(RM) return;
    auto = setInterval(function(){ show((idx+1)%3, true); }, 4800);
  }
  dots.forEach(function(d,j){ d.addEventListener('click', function(){ show(j); }); });
  show(0, true); restart();
})();

/* ---------------- Reveal on scroll ---------------- */
(function(){
  var els = document.querySelectorAll('.reveal,.reveal-l,.reveal-r,.reveal-zoom,.reveal-tilt,.thr');
  if(RM || !('IntersectionObserver' in window)){
    els.forEach(function(el){ el.classList.add('in'); });
    return;
  }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ e.target.classList.add('in'); io.unobserve(e.target); } });
  }, { threshold:0, rootMargin:'0px 0px -35% 0px' });
  els.forEach(function(el){ io.observe(el); });
})();

/* ---------------- CTA fixo: só quando nenhum botão de compra está visível ---------------- */
(function(){
  var sticky = document.querySelector('.stickycta'); if(!sticky) return;
  if(!('IntersectionObserver' in window)){ sticky.classList.add('show'); return; }

  /* PISCA-PISCA — causa raiz achada em 30/08/2026, depois de uma tentativa
     anterior que só tratou o sintoma. Gravado em vídeo num iPhone 14 Pro.

     A CAUSA: o botão "Comprar" DA PRÓPRIA BARRA tinha a classe `buycta`, que é
     exatamente o que este observer observa. O laço fecha sozinho:

         barra visível -> o botão dela está na tela -> esconde a barra
         -> o botão sai da tela -> mostra a barra -> recomeça

     Isso oscila SEM ninguém rolar a página. Foi introduzido quando o body.html
     foi reescrito no redesign; a barra antiga usava `class="btn"` e por isso
     nunca se observou.

     A CORREÇÃO REAL é o filtro abaixo: um botão dentro da `.stickycta` nunca
     entra na lista de observados. A classe também saiu do HTML, mas o filtro
     fica como trava — se alguém recolocar `buycta` ali, não volta a piscar.

     `buycta` significa "botão de compra DENTRO DO CONTEÚDO". Clique e
     rastreamento vêm de `data-open-checkout`, então tirar a classe da barra
     não afeta checkout nem pixel.

     As duas travas abaixo continuam, para o gatilho não ficar no fio da borda:
     `rootMargin` tira a faixa coberta pela barra (CTA escondido atrás dela não
     conta como visível) e `threshold` de 0,55 exige o botão mais da metade na
     tela. O `pendente` de 140ms absorve rolagem rápida.

     A garantia da auditoria anterior segue de pé: no celular a barra NASCE
     visível pelo CSS e só se esconde com CTA de verdade na tela — o pior caso
     é um botão a mais, nunca a tela sem nenhum. */
  var ctas = [].slice.call(document.querySelectorAll('.buycta'))
    .filter(function(b){ return !sticky.contains(b); });
  if(!ctas.length){ sticky.classList.add('show'); return; }

  var ALTURA_BARRA = 104;
  var vis = new Set();
  var pendente = null;

  /* TRAVA DE PERMANÊNCIA — a barra não pode trocar de estado mais de uma vez a
     cada 450ms, aconteça o que acontecer. A transição do CSS dura 300ms, então
     cada mudança termina de desenhar antes que outra possa começar: pisca-pisca
     deixa de ser improvável e passa a ser impossível.

     Existe porque o ambiente onde este código é escrito (viewport degenerado)
     não consegue reproduzir o bug, então a correção não pôde ser confirmada por
     teste — só por leitura. Esta trava é a rede embaixo disso: mesmo que sobre
     alguma outra fonte de oscilação que eu não enxerguei, o usuário vê no
     máximo uma transição limpa, nunca tremidinha. */
  var DWELL = 450;
  var ultimaMudanca = 0;

  function aplicar(){
    pendente = null;
    var querEsconder = vis.size > 0;
    if(querEsconder === sticky.classList.contains('hide')) return;  // já está assim
    var desde = Date.now() - ultimaMudanca;
    if(desde < DWELL){ pendente = setTimeout(aplicar, DWELL - desde); return; }
    ultimaMudanca = Date.now();
    sticky.classList.toggle('show', !querEsconder);
    sticky.classList.toggle('hide', querEsconder);
  }
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){
      if(e.isIntersecting && e.intersectionRatio >= 0.55) vis.add(e.target);
      else vis.delete(e.target);
    });
    if(pendente) clearTimeout(pendente);
    pendente = setTimeout(aplicar, 140);
  }, { threshold:[0, 0.55, 1], rootMargin:'0px 0px -' + ALTURA_BARRA + 'px 0px' });
  ctas.forEach(function(c){ io.observe(c); });
})();

/* ---------------- Timeline "semana a semana" ---------------- */
(function(){
  var tl = document.getElementById('timeline'), fill = document.getElementById('tlFill');
  if(!tl || !fill) return;
  var line = tl.querySelector('.tl-line');
  var steps = [].slice.call(tl.querySelectorAll('.tl-step'));
  if(RM){
    steps.forEach(function(s){ s.classList.add('on'); s.querySelector('.tl-dot').classList.add('on'); });
    fill.style.height = '100%';
    return;
  }
  var queued = false;
  function upd(){
    queued = false;
    var y = window.innerHeight * 0.55;
    /* LÊ tudo primeiro, ESCREVE depois. Antes o laço alternava
       getBoundingClientRect (leitura) com classList.toggle (escrita), e cada
       leitura depois de uma escrita obriga o navegador a refazer o layout ali
       mesmo — a cada passo, a cada frame de rolagem. É layout thrashing, e o
       preço cresce com a página: esta tem 13 mil pixels de altura. */
    var r = line.getBoundingClientRect();
    var estados = steps.map(function(s){
      var d = s.querySelector('.tl-dot'), dr = d.getBoundingClientRect();
      return { passo:s, ponto:d, on: dr.top + dr.height/2 < y };
    });
    fill.style.height = Math.max(0, Math.min(r.height, y - r.top)) + 'px';
    estados.forEach(function(e){
      e.passo.classList.toggle('on', e.on); e.ponto.classList.toggle('on', e.on);
    });
  }
  function onScroll(){ if(!queued){ queued = true; requestAnimationFrame(upd); } }
  window.addEventListener('scroll', onScroll, { passive:true });
  window.addEventListener('resize', onScroll);
  upd();
})();

/* ---------------- Vídeos ---------------- */
(function(){
  // carrossel: só começa a tocar quando entra na tela (economiza dados no mobile)
  var cards = [].slice.call(document.querySelectorAll('.vidcard video'));
  if(!cards.length) return;

  /* POSTER SÓ QUANDO CHEGA PERTO — medido em 31/08/2026.
     Os posters somavam 211KB baixados no carregamento, para um carrossel que
     fica muito abaixo da dobra. `preload="none"` segura o vídeo, mas NÃO segura
     o poster: o atributo `poster` baixa a imagem na hora, sempre. Em tráfego
     pago no celular isso é banda gasta antes de a pessoa ver qualquer coisa.

     Agora o HTML traz `data-poster` e o poster real é atribuído aqui, com 300px
     de antecedência para já estar desenhado quando o card aparece. Os arquivos
     também viraram WebP no tamanho de exibição: 211KB -> 97KB. */
  function poster(v){
    if(v.dataset.poster){ v.poster = v.dataset.poster; delete v.dataset.poster; }
  }
  function play(v){ poster(v); v.muted = true; v.preload = 'metadata'; v.play().catch(function(){}); }

  // Sem IntersectionObserver, tudo carrega — pior em banda, nunca em conteúdo.
  if(!('IntersectionObserver' in window)){ cards.forEach(play); return; }

  /* Dois observers de propósito: o poster entra cedo (300px antes) para não
     aparecer card preto; o play só quando o card está de fato na tela. */
  var ioPoster = new IntersectionObserver(function(es){
    es.forEach(function(e){ if(e.isIntersecting){ poster(e.target); ioPoster.unobserve(e.target); } });
  }, { rootMargin:'300px 0px' });
  var io = new IntersectionObserver(function(es){
    es.forEach(function(e){ e.isIntersecting ? play(e.target) : e.target.pause(); });
  }, { threshold:0.1 });
  cards.forEach(function(v){ ioPoster.observe(v); io.observe(v); });

  /* REDE DE SEGURANÇA — o ganho é adiar o poster, não arriscar ficar sem ele.
     Se o IntersectionObserver não disparar por qualquer motivo (viewport
     degenerado, aba em segundo plano no momento do load, navegador se
     comportando de forma que eu não previ), os cards ficariam pretos para
     sempre. Passados 3s do load o caminho crítico já acabou, então atribuir
     tudo o que sobrou não custa nada de LCP e elimina o modo de falha.
     Quem já recebeu poster pelo observer não é tocado: `poster()` limpa o
     data-poster e vira no-op. */
  addEventListener('load', function(){
    setTimeout(function(){ cards.forEach(poster); }, 3000);
  });
})();

(function(){
  var v = document.getElementById('mv-video'), box = document.getElementById('mv-box'), btn = document.getElementById('mv-play');
  if(!v || !box || !btn) return;

  // O vídeo principal fica lá embaixo na página. Com autoplay ele baixava 3 MB
  // no carregamento inicial, antes de a pessoa ter chegado perto dele — peso
  // que em tráfego pago no celular se paga em conversão perdida. Agora só
  // começa a carregar quando entra na tela, e só enquanto ainda está mudo
  // (depois que a pessoa toca em "ouvir", quem manda é ela).
  // Mesmo motivo do carrossel: o `poster` baixa na hora, mesmo com preload=none.
  // Aqui ele entra 400px antes — é a imagem que segura a seção enquanto o vídeo
  // não começou, então não pode aparecer depois que a pessoa já está olhando.
  function posterPrincipal(){
    if(v.dataset.poster){ v.poster = v.dataset.poster; delete v.dataset.poster; }
  }

  if('IntersectionObserver' in window){
    var ioPoster = new IntersectionObserver(function(es){
      if(es.some(function(e){ return e.isIntersecting; })){ posterPrincipal(); ioPoster.disconnect(); }
    }, { rootMargin:'400px 0px' });
    ioPoster.observe(v);

    var io = new IntersectionObserver(function(es){
      es.forEach(function(e){
        if(!v.muted) return;
        if(e.isIntersecting){ posterPrincipal(); v.preload = 'auto'; v.play().catch(function(){}); }
        else v.pause();
      });
    }, { threshold:0.25 });
    io.observe(v);
    // mesma rede de segurança do carrossel: sem poster, a seção fica um retângulo preto
    addEventListener('load', function(){ setTimeout(posterPrincipal, 3000); });
  } else { posterPrincipal(); v.preload = 'auto'; v.play().catch(function(){}); }

  btn.addEventListener('click', function(){
    v.muted = false; v.loop = false; v.controls = true;
    try{ v.currentTime = 0; }catch(e){}
    v.play().catch(function(){});
    box.classList.add('playing');
  });
  v.addEventListener('play', function(){ if(!v.muted) box.classList.add('playing'); });
  v.addEventListener('pause', function(){ if(!v.ended && !v.muted) box.classList.remove('playing'); });
  v.addEventListener('ended', function(){ box.classList.remove('playing'); });
})();

/* ---------------- Fitas arrastáveis: fotos, avaliações e vídeos ----------
   As três andam sozinhas, o que convida ao arrasto — então o arrasto precisa
   funcionar. No primeiro toque a fita é "liberada": a animação para e ela passa
   a ser um carrossel comum, controlado pelo dedo.

   O pulo do gato é não deixar o conteúdo saltar nesse instante. A animação
   desloca o trilho por `translateX`; ao congelar, esse deslocamento é convertido
   em posição de rolagem ANTES de o transform ser zerado, então o cartão que
   estava sob o dedo continua exatamente onde estava.

   Congelar é necessário, não preguiça: animação e rolagem se somam, e passando
   da metade da volta o transform empurra a janela para além do fim do trilho —
   apareceria vazio à direita. */
(function(){
  function deslocamentoX(el){
    var t = getComputedStyle(el).transform;
    if(!t || t === 'none') return 0;
    var m = t.match(/matrix3d(([^)]+))/);
    if(m) return parseFloat(m[1].split(',')[12]) || 0;
    m = t.match(/matrix(([^)]+))/);
    return m ? (parseFloat(m[1].split(',')[4]) || 0) : 0;
  }

  var EVENTOS = ['pointerdown','touchstart','wheel'];

  function armar(seletorFita, idTrilho){
    var fita = document.querySelector(seletorFita);
    var trilho = document.getElementById(idTrilho);
    if(!fita || !trilho) return;
    var livre = false;
    function liberar(){
      if(livre) return;
      livre = true;
      var x = deslocamentoX(trilho);   // ler ANTES de zerar o transform
      trilho.classList.add('livre');
      fita.scrollLeft = -x;
      EVENTOS.forEach(function(ev){ fita.removeEventListener(ev, liberar); });
    }
    EVENTOS.forEach(function(ev){ fita.addEventListener(ev, liberar, { passive:true }); });
  }

  armar('.umarquee', 'utrack');   // fotos de clientes
  armar('.rmarquee', 'rtrack');   // avaliações
  armar('.vmarquee', 'vtrack');   // vídeos
})();

/* O contador regressivo de 12h foi removido em 27/08/2026. Além do bloco de
   markup e do CSS, este IIFE também saiu: mesmo sem os dígitos na página ele
   continuaria gravando um prazo no localStorage de quem visita, um
   prazo que ninguém mais lê. */


/* ================================================================
   CHECKOUT — na própria página

   A cobrança Pix é criada por /api/criar-pix, que chama a API da Korvex
   (POST /gateway/pix/receive) e devolve o código copia-e-cola. A cliente
   preenche, paga e vê a confirmação sem sair da nossa página.

   Por que não é iframe: a Korvex bloqueia em dois níveis
   (x-frame-options: SAMEORIGIN e CSP frame-ancestors 'self'). Com a API,
   iframe não é necessário — o Pix é gerado no nosso servidor.

   ESTE BLOCO CONTINUA SENDO A FONTE DO PREÇO EXIBIDO.
   O valor aqui tem que ser igual ao da tabela em api/criar-pix.js, que é
   quem manda o valor cobrado. Divergiu, a cliente vê um preço e paga outro.

   REDE DE SEGURANÇA: se /api/criar-pix não responder — chave ausente, API
   fora, rede ruim — o botão manda para o checkout hospedado da Korvex, como
   antes. Checkout morto perde a venda inteira; redirect perde uma parte.
   ================================================================ */
/* ===== @gerado-por-build: KORVEX =====================================
   NÃO EDITE ESTE BLOCO. Ele é substituído inteiro por build.js a partir de
   `catalogo.js`, que é a fonte única do preço — o MESMO arquivo que o
   api/criar-pix.js lê para montar a cobrança.

   Antes o preço era mantido aqui à mão E lá no backend, e os dois saíram de
   sincronia: a página exibia R$ 37,90 e o Pix cobrava R$ 38,14. Para mudar
   preço, edite catalogo.js e rode `node build.js`.

   O que está escrito abaixo é só um esqueleto para o arquivo continuar
   sintaticamente válido se alguém abrir o src/ direto. */
var KORVEX = { base:'', produto:'', ofertas:{}, freteExpresso:0 };
/* ===== fim @gerado-por-build: KORVEX ================================= */

function korvexURL(offerId){
  var o = KORVEX.ofertas[offerId];
  if(!o || !o.code || !KORVEX.produto) return '';
  var qs = ['offer=' + encodeURIComponent(o.code)];
  var t = window.HB_TRACKING ? window.HB_TRACKING() : {};
  Object.keys(t).forEach(function(k){
    if(t[k]) qs.push(encodeURIComponent(k) + '=' + encodeURIComponent(t[k]));
  });
  var fbc = cookie('_fbc'); if(fbc) qs.push('fbc=' + encodeURIComponent(fbc));
  var fbp = cookie('_fbp'); if(fbp) qs.push('fbp=' + encodeURIComponent(fbp));
  return KORVEX.base + encodeURIComponent(KORVEX.produto) + '?' + qs.join('&');
}

(function(){
  var ck = document.getElementById('ck'); if(!ck) return;
  var pan = ck.querySelector('.ck-pan');
  var alerta = document.getElementById('ck-alert');
  var lastFocus = null, expresso = false, passo = 1, pedido = null, poll = null;
  /* null = ainda não perguntamos; true = Pix na página; false = redirect.
     Sem isso a cliente preencheria nome, CPF e endereço aqui para descobrir
     depois que vai preencher tudo de novo na Korvex. */
  var pixAtivo = null;

  /* ---- lembrança de indisponibilidade, no navegador ----
     O servidor também guarda isso, mas a memória dele é por instância quente
     da função: uma pessoa pode cair numa instância que ainda não viu falha
     nenhuma e receber o formulário completo à toa.

     Aqui a lembrança é do próprio visitante, então é confiável para ele: se a
     criação de cobrança falhou há pouco, o modal já abre no botão que leva ao
     checkout hospedado, sem pedir nome, CPF e endereço para no fim redirecionar
     e fazer a pessoa digitar tudo de novo.

     Dez minutos. Passado o prazo, tenta o caminho bom de novo sozinho. */
  var MARCA_FALHA = 'hb_pix_indisponivel';
  var FALHA_MS = 10 * 60 * 1000;
  function marcarIndisponivel(){
    try{ sessionStorage.setItem(MARCA_FALHA, String(Date.now())); }catch(e){}
    pixAtivo = false;
    aplicarModo();
  }
  function indisponivelHaPouco(){
    try{
      var t = parseInt(sessionStorage.getItem(MARCA_FALHA), 10);
      if(!t) return false;
      if(Date.now() - t > FALHA_MS){ sessionStorage.removeItem(MARCA_FALHA); return false; }
      return true;
    }catch(e){ return false; }
  }
  /* InitiateCheckout saía a cada abertura do modal. Quem abre, fecha para
     conferir o preço e abre de novo gerava 3 ICs — o relatório inflava e o
     custo por IC parecia melhor do que é. Agora sai uma vez por carregamento
     de página, que é o que "iniciou checkout" quer dizer. */
  var icJaSaiu = false;

  /* ---- cobrança pendente sobrevive a recarregamento ----
     Motivo, achado auditando as pendências na Korvex: a cliente gera o Pix, sai
     para o app do banco e volta. Se o navegador do celular descartou a aba (ou
     ela voltou pelo anúncio, recarregando), a tela vinha zerada — e ela
     preenchia tudo de novo, gerando OUTRA cobrança. Cada volta virava mais uma
     pendência, e é isso que faz uma pessoa aparecer com 4 Pix não pagos.

     Agora o código fica guardado por 30 minutos. Ao voltar, a página pergunta
     ao servidor o estado real antes de mostrar qualquer coisa: se já foi pago,
     ela vê a confirmação; se ainda está pendente, vê o MESMO código, sem gerar
     outro; se falhou ou venceu, o registro é descartado. */
  var GUARDA = 'hb_pix_pendente';
  /* JANELA DE RECUPERAÇÃO DO PIX.

     Era 30 minutos. Os Pix abandonados que auditei em 26/08/2026 tinham HORAS
     de idade — quando a cliente pensava em voltar, o registro já havia sido
     descartado, e voltar significava preencher nome, e-mail, telefone, CPF e o
     endereço inteiro de novo. Quase ninguém faz isso.

     24 horas. Não há risco de mostrar código velho: antes de reexibir, a página
     consulta /api/status-pedido e só devolve o mesmo código se a cobrança ainda
     estiver pendente de verdade — se foi paga, vai para a tela de confirmação;
     se venceu ou falhou, o registro é descartado. */
  var GUARDA_MS = 24 * 60 * 60 * 1000;

  function guardarPix(d){
    try{
      localStorage.setItem(GUARDA, JSON.stringify({
        transactionId: d.transactionId, orderId: d.orderId,
        code: d.pix.code, pedidoUrl: d.pedidoUrl || null, imagem: (d.pix && d.pix.image) || null,
        total: d.total, offerId: d.offerId, expresso: d.expresso, quando: Date.now()
      }));
    }catch(e){}
  }
  function limparPix(){ try{ localStorage.removeItem(GUARDA); }catch(e){} }
  function lerPixGuardado(){
    try{
      var g = JSON.parse(localStorage.getItem(GUARDA) || 'null');
      if(!g || !g.code || !g.transactionId){ return null; }
      if(Date.now() - g.quando > GUARDA_MS){ limparPix(); return null; }
      return g;
    }catch(e){ return null; }
  }

  /* Identificadores que a página já conhece do comprador. Vão junto com os
     eventos do funil para a Meta parear com o Purchase depois. */
  function dadosCliente(){
    var e = function(id){ var el = campo(id); return el && el.value ? el.value.trim() : ''; };
    var d = { nome: e('nome'), email: e('email'), telefone: e('telefone') };
    if(!d.email && !d.telefone) return {};
    return d;
  }

  var campo = function(id){ return document.getElementById('f-' + id); };
  var erroEl = function(id){ return document.getElementById('e-' + id); };
  var painel = function(n){ return document.getElementById('ck-p' + n); };

  /* ---------------- máscaras ----------------
     Aplicadas no input, não a cada tecla do teclado virtual: no celular, mexer
     no valor durante a digitação faz o cursor pular e a pessoa erra o número. */
  function so(v){ return String(v||'').replace(/\D/g,''); }
  function mascaraTel(v){
    var d = so(v).slice(0,11);
    if(d.length <= 10) return d.replace(/(\d{0,2})(\d{0,4})(\d{0,4})/, function(_,a,b,c){
      return (a ? '(' + a : '') + (a.length===2 ? ') ' : '') + b + (c ? '-' + c : '');
    }).trim();
    return d.replace(/(\d{2})(\d{5})(\d{0,4})/, '($1) $2-$3');
  }
  function mascaraCpf(v){
    var d = so(v).slice(0,11);
    return d.replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d)/, '$1.$2').replace(/(\d{3})(\d{1,2})$/, '$1-$2');
  }
  function mascaraCep(v){
    var d = so(v).slice(0,8);
    return d.length > 5 ? d.slice(0,5) + '-' + d.slice(5) : d;
  }
  function ligarMascara(id, fn){
    var el = campo(id); if(!el) return;
    el.addEventListener('input', function(){
      var pos = el.selectionStart, antes = el.value.length;
      el.value = fn(el.value);
      if(pos !== null && pos < antes) el.setSelectionRange(pos, pos);
    });
  }
  ligarMascara('telefone', mascaraTel);
  ligarMascara('cpf', mascaraCpf);
  ligarMascara('cep', mascaraCep);

  /* ---------------- validação ----------------
     No blur, não a cada tecla: marcar "e-mail inválido" enquanto a pessoa ainda
     está digitando o e-mail é hostil e faz ela desistir do campo. */
  function cpfValido(v){
    var c = so(v);
    if(c.length !== 11 || /^(\d)\1{10}$/.test(c)) return false;
    var pares = [[9,10],[10,11]];
    for(var p = 0; p < 2; p++){
      var ate = pares[p][0], pos = pares[p][1], soma = 0;
      for(var i = 0; i < ate; i++) soma += Number(c[i]) * (pos - i);
      var d = (soma * 10) % 11; if(d === 10) d = 0;
      if(d !== Number(c[ate])) return false;
    }
    return true;
  }

  var REGRAS = {
    nome:      function(v){ return v.trim().split(/\s+/).filter(Boolean).length >= 2 ? '' : 'Escreva nome e sobrenome.'; },
    email:     function(v){ return /^[^\s@]+@[^\s@]+\.[a-z]{2,}$/i.test(v.trim()) ? '' : 'E-mail inválido — é nele que chega o rastreio.'; },
    telefone:  function(v){ var d = so(v); return (d.length === 10 || d.length === 11) ? '' : 'Telefone com DDD, 10 ou 11 dígitos.'; },
    cpf:       function(v){ return cpfValido(v) ? '' : 'CPF inválido. Confira os números.'; },
    cep:       function(v){ return so(v).length === 8 ? '' : 'CEP com 8 dígitos.'; },
    rua:       function(v){ return v.trim() ? '' : 'Informe a rua.'; },
    numero:    function(v){ return v.trim() ? '' : 'Informe o número.'; },
    bairro:    function(v){ return v.trim() ? '' : 'Informe o bairro.'; },
    cidade:    function(v){ return v.trim() ? '' : 'Informe a cidade.'; },
    uf:        function(v){ return /^[A-Za-z]{2}$/.test(v.trim()) ? '' : 'UF com 2 letras.'; }
  };
  var PASSO_CAMPOS = { 1: ['nome','email','telefone','cpf'], 2: ['cep','numero','rua','bairro','cidade','uf'] };

  function marcar(id, msg){
    var el = campo(id), e = erroEl(id);
    if(!el) return;
    el.classList.toggle('ruim', !!msg);
    el.setAttribute('aria-invalid', msg ? 'true' : 'false');
    if(e){ e.textContent = msg || ''; e.classList.toggle('on', !!msg); }
  }
  function checar(id){
    var el = campo(id); if(!el || !REGRAS[id]) return '';
    var msg = REGRAS[id](el.value);
    marcar(id, msg);
    return msg;
  }
  Object.keys(REGRAS).forEach(function(id){
    var el = campo(id); if(!el) return;
    el.addEventListener('blur', function(){ checar(id); });
    // Some com o erro assim que a pessoa começa a corrigir — cobrar de novo só no blur.
    el.addEventListener('input', function(){ if(el.classList.contains('ruim')) marcar(id, ''); });
  });

  function validaPasso(n){
    var ruim = null;
    PASSO_CAMPOS[n].forEach(function(id){ if(checar(id) && !ruim) ruim = id; });
    if(ruim){
      var el = campo(ruim);
      el.focus({ preventScroll:true });
      el.scrollIntoView({ block:'center', behavior: RM ? 'auto' : 'smooth' });
      return false;
    }
    return true;
  }

  /* ---------------- CEP ----------------
     Preenche rua/bairro/cidade/UF. Se o ViaCEP não responder, os campos ficam
     editáveis e a compra segue — CEP que não busca não pode travar a venda. */
  var cepDica = document.getElementById('cep-dica');
  var ultimoCep = '';
  /* Promessa da busca em andamento. Existe por causa de um bug real, achado na
     auditoria mobile: quem digitava o CEP e tocava em "Gerar" antes de o ViaCEP
     responder via a validação reprovar contra rua/bairro/cidade vazios; um
     instante depois os campos preenchiam sozinhos e apagavam os erros. A pessoa
     ficava olhando um botão que aparentemente não fez nada. Agora o envio espera
     a busca terminar. */
  var cepEmVoo = null;

  function buscarCep(){
    var d = so(campo('cep').value);
    if(d.length !== 8 || d === ultimoCep) return cepEmVoo;
    ultimoCep = d;
    if(cepDica) cepDica.textContent = 'buscando endereço…';
    cepEmVoo = fetch('https://viacep.com.br/ws/' + d + '/json/')
      .then(function(r){ return r.json(); })
      .then(function(j){
        if(!j || j.erro){ if(cepDica) cepDica.textContent = 'CEP não encontrado — preencha à mão.'; return; }
        if(cepDica) cepDica.textContent = '';
        if(j.logradouro) campo('rua').value = j.logradouro;
        if(j.bairro) campo('bairro').value = j.bairro;
        if(j.localidade) campo('cidade').value = j.localidade;
        if(j.uf) campo('uf').value = j.uf;
        ['rua','bairro','cidade','uf'].forEach(function(id){ marcar(id, ''); });
        if(!campo('numero').value) campo('numero').focus({ preventScroll:true });
      })
      .catch(function(){ if(cepDica) cepDica.textContent = 'Não deu para buscar — preencha à mão.'; })
      .then(function(){ cepEmVoo = null; });
    return cepEmVoo;
  }
  campo('cep').addEventListener('blur', buscarCep);
  campo('cep').addEventListener('input', function(){ if(so(campo('cep').value).length === 8) buscarCep(); });
  campo('uf').addEventListener('input', function(){ campo('uf').value = campo('uf').value.toUpperCase().replace(/[^A-Z]/g,''); });

  /* ---------------- resumo e navegação ---------------- */
  function totalCentavos(){
    return kit().p + (expresso ? KORVEX.freteExpresso : 0);
  }
  /* Invalida um Pix já gerado quando a oferta muda.

     Sem isto acontecia o pior tipo de erro desta página: a pessoa gerava o Pix
     do kit de 2 (R$ 55,16), fechava o modal, trocava para o kit de 3 e reabria.
     O modal volta no passo 3, o resumo é redesenhado com o preço novo — mas o
     código Pix na tela continua sendo o antigo. Resultado: R$ 67,13 escrito na
     tela e R$ 55,16 cobrado no banco. Medido em produção antes da correção.

     Aqui a cobrança velha é descartada e a pessoa volta ao passo 2 para gerar
     outra, com os dados que ela já preencheu ainda no formulário. */
  function invalidarPix(){
    if(poll) clearTimeout(poll);
    poll = null;
    pedido = null;
    limparPix();
    if(passo === 3){
      irPara(2);
      btnGerar.disabled = false;
      lblGerar.textContent = 'Gerar meu código Pix';
      // Mensagem serve nos dois passos: o botão do passo 2 tem um nome, o do 1 tem outro.
      avisar('Você mudou a oferta, então o código anterior não vale mais. Siga para gerar o código novo.');
    }
  }

  function resumo(){
    var k = kit();
    /* Passo 4 é venda paga: nada a invalidar, e mexer ali só confundiria. */
    if(pedido && passo !== 4 && (pedido.offerId !== k.offer || pedido.expresso !== expresso)){
      invalidarPix();
      return resumo();
    }
    ck.querySelectorAll('[data-sum-name]').forEach(function(e){ e.textContent = k.n; });
    ck.querySelectorAll('[data-sum-desc]').forEach(function(e){ e.textContent = k.desc; });
    ck.querySelectorAll('[data-sum-sub]').forEach(function(e){ e.textContent = money(k.p); });
    ck.querySelectorAll('[data-sum-frete]').forEach(function(e){
      e.textContent = expresso ? '+ ' + money(KORVEX.freteExpresso) : 'Grátis';
      e.style.color = expresso ? '' : 'var(--ok-t)';
    });
    ck.querySelectorAll('[data-sum-frete-nome]').forEach(function(e){
      e.textContent = expresso ? 'Frete expresso (1 a 3 dias)' : 'Frete grátis (5 a 9 dias)';
    });
    ck.querySelectorAll('[data-sum-total]').forEach(function(e){ e.textContent = money(totalCentavos()); });
    ck.querySelectorAll('.ck-inc li:not(.bonus) .q').forEach(function(e){ e.textContent = k.q + '×'; });
    ck.querySelectorAll('.ship-opt').forEach(function(b){
      var on = (b.dataset.ship === 'expresso') === expresso;
      b.classList.toggle('on', on);
      b.setAttribute('aria-checked', String(on));
    });
  }
  window.renderReview = resumo;

  function irPara(n){
    passo = n;
    [1,2,3,4].forEach(function(i){
      var p = painel(i); if(!p) return;
      p.hidden = i !== n;
      p.classList.toggle('on', i === n);
    });
    // O resumo e a lista de itens não fazem sentido depois de pago.
    var inc = document.getElementById('ck-inc');
    if(inc) inc.hidden = n === 4;
    document.querySelectorAll('#ck-steps li').forEach(function(li){
      var s = +li.dataset.step;
      li.classList.toggle('on', s === Math.min(n,3));
      li.classList.toggle('feito', s < n);
    });
    var titulo = { 1:'Finalizar pedido', 2:'Onde entregar', 3:'Pague com Pix', 4:'Pedido confirmado' }[n];
    document.getElementById('ck-title').textContent = titulo;
    var body = ck.querySelector('.ck-body'); if(body) body.scrollTop = 0;
  }

  /* ---------------- abrir / fechar ---------------- */
  function aplicarModo(){
    var form = document.getElementById('ck-form1');
    var legado = document.getElementById('ck-legado');
    if(!form || !legado) return;
    // Enquanto não sabemos, mostra o formulário: é o caminho bom, e a resposta
    // da sonda chega em milissegundos.
    var comApi = pixAtivo !== false;
    form.hidden = !comApi;
    legado.hidden = comApi;
    var passos = document.getElementById('ck-steps');
    if(passos) passos.hidden = !comApi;
  }

  function sondar(){
    if(pixAtivo !== null) return;
    // A lembrança local vale mais que a sonda: ela é deste visitante.
    if(indisponivelHaPouco()){ pixAtivo = false; aplicarModo(); return; }
    fetch('/api/criar-pix', { method:'GET', credentials:'same-origin' })
      .then(function(r){ return r.json(); })
      .then(function(j){ pixAtivo = !!(j && j.ativo); aplicarModo(); })
      .catch(function(){ pixAtivo = false; aplicarModo(); });
  }
  // Pergunta cedo, para o modal já abrir no modo certo.
  sondar();

  document.getElementById('ck-legado-btn').addEventListener('click', function(){
    var k = kit();
    px('AddToCart', { value:+(k.p/100).toFixed(2), currency:'BRL', content_ids:[k.offer], num_items:k.q });
    document.getElementById('ck-legado-btn').disabled = true;
    document.getElementById('ck-legado-lbl').textContent = 'Abrindo o pagamento…';
    caiParaKorvex();
  });

  function abrir(){
    var k = kit();
    if(!icJaSaiu){
      icJaSaiu = true;
      px('InitiateCheckout', { value:+(k.p/100).toFixed(2), currency:'BRL', content_ids:[k.offer], num_items:k.q });
    }
    lastFocus = document.activeElement;
    sondar();
    aplicarModo();
    /* Reabrir não volta ao começo se a pessoa já tinha passado do passo 1 —
       os dados continuam preenchidos e fazer digitar de novo é perda pura.
       Só uma sessão realmente nova (passo 1) reseta a escolha de frete. */
    if(passo === 1){ expresso = false; irPara(1); }
    resumo();
    /* Reabrir dentro dos 300ms do fechamento anterior deixava o timer antigo
       vivo: ele disparava depois deste abrir e removia 'on' e 'ck-open' do
       modal novo — a pessoa tocava em comprar e não acontecia nada. */
    clearTimeout(tFechar);
    ck.classList.add('on');
    document.body.classList.add('ck-open');
    requestAnimationFrame(function(){ ck.classList.add('in'); });
    setTimeout(function(){
      var alvo = (passo === 1 && pixAtivo !== false) ? campo('nome')
               : pan.querySelector('.ck-btn:not([hidden])') || pan.querySelector('.ck-btn');
      if(alvo) alvo.focus({ preventScroll:true });
    }, 320);
  }
  var tFechar = null;
  function fechar(){
    ck.classList.remove('in');
    clearTimeout(tFechar);
    tFechar = setTimeout(function(){ ck.classList.remove('on'); document.body.classList.remove('ck-open'); }, 300);
    if(lastFocus && lastFocus.focus) lastFocus.focus();
  }

  /* ---------------- passo 1 → 2 ---------------- */
  document.getElementById('ck-ir2').addEventListener('click', function(){
    if(!validaPasso(1)) return;
    var k = kit();
    px('AddToCart', { value:+(k.p/100).toFixed(2), currency:'BRL', content_ids:[k.offer], num_items:k.q }, dadosCliente());
    irPara(2);
    setTimeout(function(){ campo('cep').focus({ preventScroll:true }); }, 120);
  });
  ck.querySelectorAll('[data-voltar]').forEach(function(b){
    b.addEventListener('click', function(){ irPara(+b.dataset.voltar); });
  });
  ck.querySelectorAll('.ship-opt').forEach(function(b){
    b.addEventListener('click', function(){ expresso = (b.dataset.ship === 'expresso'); resumo(); });
  });

  /* ---------------- passo 2 → Pix ---------------- */
  var btnGerar = document.getElementById('ck-gerar');
  var lblGerar = document.getElementById('ck-gerar-lbl');

  function avisar(msg){
    alerta.textContent = msg;
    alerta.classList.add('on');
  }
  function caiParaKorvex(){
    // Registra a falha para o próximo passo desta pessoa já vir no caminho curto.
    try{ sessionStorage.setItem(MARCA_FALHA, String(Date.now())); }catch(e){}
    // Última linha de defesa: manda para o checkout hospedado com as UTMs.
    var url = korvexURL(kit().offer);
    if(!url){
      avisar('Não conseguimos abrir o pagamento agora. Fale com a gente em {{marca.email}} e a gente fecha seu pedido.');
      btnGerar.disabled = false;
      lblGerar.textContent = 'Gerar meu código Pix';
      return;
    }
    lblGerar.textContent = 'Abrindo o pagamento…';
    window.location.href = url;
  }

  btnGerar.addEventListener('click', function(){
    /* Espera a busca de CEP terminar antes de validar. Sem isso, tocar em
       "Gerar" logo depois de digitar o CEP reprovava contra campos ainda
       vazios — e o erro sumia sozinho quando a resposta chegava. */
    btnGerar.disabled = true;
    lblGerar.textContent = cepEmVoo ? 'Conferindo o endereço…' : 'Gerando seu Pix…';
    Promise.resolve(cepEmVoo).then(enviar);
  });

  function enviar(){
    if(!validaPasso(2)){
      btnGerar.disabled = false;
      lblGerar.textContent = 'Gerar meu código Pix';
      return;
    }
    alerta.classList.remove('on');
    lblGerar.textContent = 'Gerando seu Pix…';

    var k = kit();
    var t = window.HB_TRACKING ? window.HB_TRACKING() : {};
    var corpo = {
      offerId: k.offer,
      frete: expresso ? 'expresso' : 'gratis',
      cliente: {
        nome: campo('nome').value.trim(),
        email: campo('email').value.trim(),
        telefone: campo('telefone').value,
        cpf: campo('cpf').value
      },
      endereco: {
        cep: campo('cep').value,
        rua: campo('rua').value.trim(),
        numero: campo('numero').value.trim(),
        complemento: campo('complemento').value.trim(),
        bairro: campo('bairro').value.trim(),
        cidade: campo('cidade').value.trim(),
        uf: campo('uf').value.trim().toUpperCase()
      },
      tracking: {
        fbc: cookie('_fbc') || undefined,
        fbp: cookie('_fbp') || undefined,
        fbclid: t.fbclid || undefined,
        utm_source: t.utm_source, utm_medium: t.utm_medium, utm_campaign: t.utm_campaign,
        utm_content: t.utm_content, utm_term: t.utm_term,
        /* src e sck sao os parametros proprios da UTMify. A pagina ja os captura
           (KEYS em part1-head.html) e o korvexURL() do redirect ja os repassava,
           mas este corpo nao os mandava — e api/criar-pix.js le t.src/t.sck para
           gravar no metadata. Sem estas duas linhas eles chegavam sempre nulos
           em trackingParameters na UTMify nas vendas pelo Pix da propria pagina. */
        src: t.src, sck: t.sck
      }
    };

    /* Segundo cinto de segurança, do lado do navegador. O servidor já desiste
       da Korvex em 12s, mas se a própria função demorar (fila, cold start), a
       cliente não pode ficar presa num spinner. Em 18s cai para o checkout
       hospedado, que é lento mas funciona. */
    var desistir = new AbortController();
    var relogio = setTimeout(function(){ desistir.abort(); }, 18000);
    /* Botão parado com o mesmo texto por 12 segundos passa a sensação de
       travado — e a pessoa fecha a página. Estes avisos não aceleram nada, só
       mostram que a coisa está viva. Só aparecem quando a espera é anormal:
       quando a Korvex está bem, a resposta chega em 2 a 4 segundos. */
    var avisos = [
      setTimeout(function(){ lblGerar.textContent = 'Ainda gerando, só um instante…'; }, 4500),
      setTimeout(function(){ lblGerar.textContent = 'O banco está demorando a responder…'; }, 9000)
    ];
    function pararAvisos(){ avisos.forEach(clearTimeout); }
    fetch('/api/criar-pix', {
      method:'POST', headers:{'Content-Type':'application/json'},
      body: JSON.stringify(corpo), credentials:'same-origin', signal: desistir.signal
    })
    .then(function(r){ clearTimeout(relogio); pararAvisos(); return r.json().then(function(j){ return { http:r.status, j:j }; }); })
    .then(function(res){
      // Chave não configurada ou API fora: vai para o checkout hospedado.
      if(res.http === 503 || res.http === 502){ caiParaKorvex(); return; }

      if(res.http === 400 && res.j && res.j.erros){
        var primeiro = null;
        Object.keys(res.j.erros).forEach(function(id){
          marcar(id, res.j.erros[id]);
          if(!primeiro) primeiro = id;
        });
        if(primeiro && campo(primeiro)) campo(primeiro).focus({ preventScroll:true });
        avisar('Confira os campos marcados.');
        btnGerar.disabled = false;
        lblGerar.textContent = 'Gerar meu código Pix';
        return;
      }

      if(!res.j || !res.j.ok || !res.j.pix || !res.j.pix.code){ caiParaKorvex(); return; }

      /* Guarda para qual oferta esta cobrança foi criada. É o que permite
         detectar depois que a pessoa trocou de kit e o código na tela ficou
         valendo outro valor. */
      pedido = res.j;
      pedido.offerId = k.offer;
      pedido.expresso = expresso;
      guardarPix(pedido);
      mostrarPix(res.j);
    })
    .catch(function(){ clearTimeout(relogio); pararAvisos(); caiParaKorvex(); });
  }

  /* ---------------- passo 3: Pix na tela ---------------- */
  function mostrarPix(dados){
    document.getElementById('pix-code').textContent = dados.pix.code;
    /* O QR é conveniência: no celular, que é onde a maioria paga, ninguém
       escaneia a própria tela — o copia-e-cola resolve. Ele importa no
       computador. A Korvex devolve pix.image null na prática, então caímos
       para a página do pedido, que mostra o QR. */
    var img = document.getElementById('pix-qr');
    var caixaQr = img.closest('.pix-qr-wrap');
    var linkQr = document.getElementById('pix-qr-link');
    if(dados.pix.image){
      img.src = dados.pix.image;
      img.hidden = false;
      if(linkQr) linkQr.hidden = true;
      img.onerror = function(){ if(caixaQr) caixaQr.hidden = true; };
    } else if(dados.pedidoUrl){
      img.hidden = true;
      if(linkQr){ linkQr.href = dados.pedidoUrl; linkQr.hidden = false; }
    } else if(caixaQr){
      caixaQr.hidden = true;
    }
    irPara(3);
    /* Numa restauração o evento já saiu quando a cobrança foi criada.
       Repetir aqui contaria a mesma intenção de pagamento duas vezes. */
    if(dados.jaExistia){ if(dados.transactionId) acompanhar(dados.transactionId); return; }
    px('AddPaymentInfo', {
      value:+(dados.total).toFixed(2), currency:'BRL',
      content_ids:[kit().offer], num_items:kit().q
    }, dadosCliente());
    if(dados.transactionId) acompanhar(dados.transactionId);
  }

  document.getElementById('pix-copiar').addEventListener('click', function(){
    var btn = this, txt = document.getElementById('pix-code').textContent;
    function ok(){
      btn.textContent = 'Código copiado ✓';
      btn.classList.add('copiado');
      setTimeout(function(){ btn.textContent = 'Copiar código Pix'; btn.classList.remove('copiado'); }, 2600);
    }
    if(navigator.clipboard && navigator.clipboard.writeText){
      navigator.clipboard.writeText(txt).then(ok, selecionar);
    } else selecionar();
    function selecionar(){
      // Sem permissão de clipboard (iOS antigo, http): seleciona para a pessoa
      // copiar no dedo, em vez de não acontecer nada.
      var r = document.createRange();
      r.selectNodeContents(document.getElementById('pix-code'));
      var s = window.getSelection(); s.removeAllRanges(); s.addRange(r);
      btn.textContent = 'Toque e segure para copiar';
    }
  });

  /* ---------------- confirmação ----------------
     A Korvex bloqueia polling frequente e manda usar webhook — e o webhook é
     mesmo a fonte da verdade do faturamento (é ele que dispara o Purchase).
     Aqui a consulta é só para a tela virar sozinha enquanto a pessoa olha:
     intervalo cresce, para em 15 min, e nunca é a fonte da verdade. */
  function acompanhar(trxId){
    var esperas = [8000, 8000, 10000, 12000, 15000, 20000, 25000, 30000];
    var i = 0, inicio = Date.now(), LIMITE = 20 * 60 * 1000;
    var ultima = 0, encerrado = false;

    function proxima(){
      if(encerrado || Date.now() - inicio > LIMITE) return;
      var espera = esperas[Math.min(i, esperas.length - 1)];
      i++;
      clearTimeout(poll);
      poll = setTimeout(consultar, espera);
    }

    function consultar(){
      if(encerrado) return;
      /* Aba escondida: não adianta perguntar, ninguém está olhando — e a Korvex
         bloqueia consulta repetida. Mas NÃO dá para simplesmente pular: quem
         paga sai desta aba para o app do banco, então a aba fica escondida
         exatamente durante o pagamento. Quem retoma é o visibilitychange
         abaixo, no segundo em que a pessoa volta. */
      if(document.hidden){ proxima(); return; }
      ultima = Date.now();
      fetch('/api/status-pedido?id=' + encodeURIComponent(trxId), { credentials:'same-origin' })
        .then(function(r){ return r.json(); })
        .then(function(j){
          if(j && j.pago){ encerrado = true; confirmado(); return; }
          // Bloqueio de polling: espaça mais em vez de insistir.
          if(j && j.aguarde) i = Math.max(i, esperas.length - 1);
          proxima();
        })
        .catch(proxima);
    }

    // O momento mais provável de a venda já estar paga é este: a pessoa voltou
    // do app do banco. Pergunta na hora, sem esperar o próximo intervalo.
    function aoVoltar(){
      if(encerrado || document.hidden) return;
      if(Date.now() - ultima < 5000) return;   // trava anti-rajada
      i = 0;
      clearTimeout(poll);
      consultar();
    }
    document.addEventListener('visibilitychange', aoVoltar);
    window.addEventListener('focus', aoVoltar);
    window.addEventListener('pageshow', aoVoltar);

    proxima();
  }

  function confirmado(){
    if(poll) clearTimeout(poll);
    limparPix();
    document.getElementById('ck-pedido').textContent = (pedido && pedido.orderId) || '';
    irPara(4);
    /* Purchase NÃO sai daqui de propósito. Ele vem do webhook, em
       api/korvex-webhook.js, que é o único lugar onde a venda é fato
       confirmado pelo banco — e o único que não dá para forjar pelo console. */
  }

  /* ---------------- fechar, trocar kit, foco ---------------- */
  document.querySelectorAll('[data-open-checkout]').forEach(function(b){ b.addEventListener('click', abrir); });
  ck.querySelectorAll('[data-close-checkout]').forEach(function(b){ b.addEventListener('click', fechar); });
  document.getElementById('ck-trocar').addEventListener('click', function(){
    fechar();
    var sel = document.getElementById('ofKits');
    if(sel) setTimeout(function(){ sel.scrollIntoView({ block:'center', behavior: RM ? 'auto' : 'smooth' }); }, 260);
  });

  document.addEventListener('keydown', function(e){
    if(!ck.classList.contains('on')) return;
    if(e.key === 'Escape'){ fechar(); return; }
    if(e.key !== 'Tab') return;
    var f = pan.querySelectorAll('a[href], button:not([disabled]), input:not([disabled]), summary');
    var vis = [].filter.call(f, function(el){ return el.offsetParent !== null; });
    if(!vis.length) return;
    var first = vis[0], last = vis[vis.length-1];
    if(e.shiftKey && document.activeElement === first){ e.preventDefault(); last.focus(); }
    else if(!e.shiftKey && document.activeElement === last){ e.preventDefault(); first.focus(); }
  });

  // Enter dentro de um campo avança o passo, em vez de não fazer nada.
  ck.querySelectorAll('input').forEach(function(el){
    el.addEventListener('keydown', function(e){
      if(e.key !== 'Enter') return;
      e.preventDefault();
      (passo === 1 ? document.getElementById('ck-ir2') : btnGerar).click();
    });
  });

  /* ---- restaura a cobrança pendente, se houver ----
     Não abre o modal sozinho: só deixa tudo pronto. Quando a pessoa tocar em
     qualquer botão de compra, ela cai direto no código que já existe em vez de
     começar do zero — que é o que gerava cobrança duplicada. */
  (function restaurar(){
    var g = lerPixGuardado(); if(!g) return;
    fetch('/api/status-pedido?id=' + encodeURIComponent(g.transactionId), { credentials:'same-origin' })
      .then(function(r){ return r.json(); })
      .then(function(j){
        if(!j) return;
        if(j.pago){
          // Pagou e voltou: mostra a confirmação em vez de pedir tudo de novo.
          pedido = g;
          irPara(4);
          document.getElementById('ck-pedido').textContent = g.orderId || '';
          limparPix();
          return;
        }
        if(j.final){ limparPix(); return; }   // falhou, venceu ou estornou
        // Ainda pendente: recoloca a oferta certa e devolve o MESMO código.
        var i = KITS.findIndex(function(k){ return k.offer === g.offerId; });
        if(i < 0){ limparPix(); return; }

        /* O CÓDIGO GUARDADO PODE TER O PREÇO DE ONTEM.

           Este registro vive 24 horas. Se o preço da oferta mudar nesse meio
           tempo, o código Pix guardado continua cobrando o valor velho — e a
           página, que já foi atualizada, mostraria o preço novo ao lado dele.
           Foi assim que a cliente acabava vendo R$ 37,90 na tela e R$ 38,14 no
           app do banco.

           Cobrança pendente com preço vencido é para ser descartada, não
           ressuscitada: a pessoa gera outra na hora, pelo valor certo. Perder
           uma pendência não custa nada; cobrar um valor que não combinou custa
           a venda e a confiança. */
        var centavosAgora = KITS[i].p + (g.expresso ? KORVEX.freteExpresso : 0);
        var centavosGuardados = Math.round(Number(g.total) * 100);
        if(!isFinite(centavosGuardados) || centavosGuardados !== centavosAgora){
          limparPix();
          return;
        }

        expresso = !!g.expresso;
        if(i !== selIdx) selectKit(i);
        pedido = g;
        resumo();
        mostrarPix({ pix:{ code:g.code, image:g.imagem }, pedidoUrl:g.pedidoUrl,
                     total:g.total, transactionId:g.transactionId, jaExistia:true });
      })
      .catch(function(){});
  })();

  resumo();
})();


/* ---------------- PageView e ViewContent ----------------
   O PageView já saiu pelo pixel no <head>, com o id em window.__pvId — aqui
   só mandamos a metade do servidor, com o MESMO id, para a Meta parear.
   O ViewContent é novo: a página não tinha, e ele é o evento que diz à Meta
   "esta pessoa olhou ESTE produto", que é a base dos públicos semelhantes. */
(function(){
  function servidor(nome, id, extra){
    // Este caminho NÃO passa por px() — precisa da própria trava.
    if(HB_LOCAL) return;
    try{
      var t = window.HB_TRACKING ? window.HB_TRACKING() : {};
      var corpo = Object.assign({
        event_name: nome, event_id: id, event_source_url: location.href,
        fbp: cookie('_fbp') || undefined,
        fbc: cookie('_fbc') || undefined,
        fbclid: t.fbclid || undefined
      }, extra || {});
      fetch('/api/capi', { method:'POST', headers:{'Content-Type':'application/json'},
        body: JSON.stringify(corpo), keepalive:true, credentials:'same-origin' }).catch(function(){});
    }catch(e){}
  }

  if(window.__pvId) servidor('PageView', window.__pvId);

  // ViewContent com o kit em destaque. Espera 1,2s: quem fecha antes disso não
  // viu o produto, e contar essa visita só sujaria o público.
  setTimeout(function(){
    var k = kit();
    px('ViewContent', {
      value: +(k.p/100).toFixed(2), currency:'BRL',
      content_ids:[k.offer], content_name:k.n, num_items:k.q
    });
  }, 1200);
})();
hydrate();
