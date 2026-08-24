/* =============================================================================
   MR Distribuidora · RedePRO — comportamento
   Sem dependencia externa. Tudo degrada: sem JS o site continua legivel,
   navegavel e com todos os contatos visiveis.
   ========================================================================== */
(() => {
  'use strict';

  const $  = (s, r = document) => r.querySelector(s);
  const $$ = (s, r = document) => [...r.querySelectorAll(s)];
  const calmo = matchMedia('(prefers-reduced-motion: reduce)').matches;

  const ZAP = '5522974059854';

  /* --- ano do rodape ------------------------------------------------------ */
  const ano = $('#ano');
  if (ano) ano.textContent = new Date().getFullYear();

  /* --- topo fixo + barra de progresso + botao flutuante ------------------- */
  const topo = $('#topo');
  const barra = $('#progresso');
  const flut = $('#zapFlut');

  const aoRolar = () => {
    const y = scrollY;
    topo.toggleAttribute('data-fixo', y > 24);
    const alcance = document.documentElement.scrollHeight - innerHeight;
    barra.style.transform = `scaleX(${alcance > 0 ? y / alcance : 0})`;
    flut.classList.toggle('vem', y > innerHeight * 0.6);
  };
  addEventListener('scroll', aoRolar, { passive: true });
  aoRolar();

  /* --- menu no celular ---------------------------------------------------- */
  const btnMenu = $('#hamburguer');
  const menu = $('#menu');
  const fechaMenu = () => {
    menu.removeAttribute('data-aberto');
    btnMenu.setAttribute('aria-expanded', 'false');
  };
  btnMenu.addEventListener('click', () => {
    const aberto = menu.toggleAttribute('data-aberto');
    btnMenu.setAttribute('aria-expanded', String(aberto));
  });
  $$('#menu a').forEach(a => a.addEventListener('click', fechaMenu));
  addEventListener('keydown', e => { if (e.key === 'Escape') fechaMenu(); });

  /* --- revela no scroll --------------------------------------------------- */
  const alvos = $$('[data-revela]');
  if (calmo || !('IntersectionObserver' in window)) {
    alvos.forEach(el => el.classList.add('vem'));
  } else {
    const olho = new IntersectionObserver((itens, obs) => {
      itens.forEach(i => {
        if (!i.isIntersecting) return;
        i.target.classList.add('vem');
        obs.unobserve(i.target);
      });
    }, { rootMargin: '0px 0px -12% 0px', threshold: 0.08 });
    alvos.forEach(el => olho.observe(el));
  }

  /* --- brilho que segue o ponteiro (so em ponteiro fino) ------------------ */
  const brilho = $('#brilho');
  if (brilho && !calmo && matchMedia('(pointer: fine)').matches) {
    addEventListener('pointermove', e => {
      brilho.style.setProperty('--px', `${(e.clientX / innerWidth) * 100}%`);
      brilho.style.setProperty('--py', `${(e.clientY / innerHeight) * 100}%`);
    }, { passive: true });
  }

  /* --- brilho de proximidade nos cartoes ---------------------------------- */
  $$('.cartao').forEach(c => {
    c.addEventListener('pointermove', e => {
      const r = c.getBoundingClientRect();
      c.style.setProperty('--mx', `${e.clientX - r.left}px`);
      c.style.setProperty('--my', `${e.clientY - r.top}px`);
    }, { passive: true });
  });

  /* =========================================================================
     CARTELA DE PADROES
     Amostras ILUSTRATIVAS de familia de acabamento, reproduzidas em CSS.
     Nao sao codigos de produto de fabrica — a cartela vigente Duratex e
     Guararapes e conferida no atendimento (esta ressalva esta impressa na pagina).
     `tom` = cor base, `veio` = intensidade da listra, `ang` = inclinacao do veio.
     ====================================================================== */
  const PADROES = [
    { n: 'Carvalho Claro',   f: 'amadeirado', tom: '#C8A171', veio: .09, ang: '88deg' },
    { n: 'Freijó',           f: 'amadeirado', tom: '#A9793F', veio: .11, ang: '90deg' },
    { n: 'Tauari',           f: 'amadeirado', tom: '#DCC098', veio: .07, ang: '87deg' },
    { n: 'Nogal',            f: 'amadeirado', tom: '#7E5233', veio: .13, ang: '91deg' },
    { n: 'Imbuia',           f: 'amadeirado', tom: '#6B452B', veio: .14, ang: '89deg' },
    { n: 'Jequitibá',        f: 'amadeirado', tom: '#C79A6E', veio: .10, ang: '92deg' },
    { n: 'Itapuã',           f: 'amadeirado', tom: '#B8895C', veio: .12, ang: '86deg' },
    { n: 'Ripado Natural',   f: 'amadeirado', tom: '#CBA57A', veio: .22, ang: '90deg' },

    { n: 'Branco',           f: 'unicolor',   tom: '#F5F4F1', veio: .02, ang: '90deg' },
    { n: 'Off-White',        f: 'unicolor',   tom: '#EDE8DF', veio: .02, ang: '90deg' },
    { n: 'Areia',            f: 'unicolor',   tom: '#D9CDBA', veio: .03, ang: '90deg' },
    { n: 'Cinza Cristal',    f: 'unicolor',   tom: '#BFC2C4', veio: .03, ang: '90deg' },
    { n: 'Argila',           f: 'unicolor',   tom: '#A99C8E', veio: .03, ang: '90deg' },

    { n: 'Grafite',          f: 'escuro',     tom: '#3C4149', veio: .05, ang: '90deg' },
    { n: 'Preto Absoluto',   f: 'escuro',     tom: '#1C1E22', veio: .05, ang: '90deg' },
    { n: 'Azul Petróleo',    f: 'escuro',     tom: '#2C4450', veio: .05, ang: '90deg' },
    { n: 'Verde Musgo',      f: 'escuro',     tom: '#3B4A3A', veio: .05, ang: '90deg' },
    { n: 'Ébano',            f: 'escuro',     tom: '#2A2119', veio: .16, ang: '89deg' },
  ];

  const grade = $('#padroes-grade');
  if (grade) {
    grade.innerHTML = PADROES.map(p => `
      <article class="padrao" data-familia="${p.f}">
        <div class="padrao__amostra" style="--tom:${p.tom};--veio:${p.veio};--ang:${p.ang}"></div>
        <div class="padrao__pe">
          <p class="padrao__nome">${p.n}</p>
          <p class="padrao__marca">${{
            amadeirado: 'Amadeirado',
            unicolor: 'Unicolor',
            escuro: 'Tom profundo'
          }[p.f]}</p>
        </div>
      </article>`).join('');

    const aplicar = fam => {
      $$('.padrao', grade).forEach(el => {
        el.hidden = fam !== 'tudo' && el.dataset.familia !== fam;
      });
    };

    $$('.filtro[data-familia]').forEach(b => b.addEventListener('click', () => {
      $$('.filtro[data-familia]').forEach(o => o.setAttribute('aria-pressed', String(o === b)));
      const troca = () => aplicar(b.dataset.familia);
      if (!calmo && document.startViewTransition) document.startViewTransition(troca);
      else troca();
    }));
  }

  /* --- tira de acabamentos (marquee) -------------------------------------- */
  const tira = $('#tira');
  if (tira) {
    const itens = PADROES.filter((_, i) => i % 2 === 0);
    const bloco = itens.map(p =>
      `<span class="tira__item"><i style="background:${p.tom}"></i>${p.n}</span>`).join('');
    tira.innerHTML = bloco + bloco;   // duas voltas: o keyframe anda -50%
  }

  /* --- contadores --------------------------------------------------------- */
  const conta = el => {
    const alvo = +el.dataset.conta;
    if (calmo) { el.textContent = alvo; return; }
    const dur = 900, t0 = performance.now();
    const passo = t => {
      const k = Math.min(1, (t - t0) / dur);
      el.textContent = Math.round(alvo * (1 - Math.pow(1 - k, 3)));
      if (k < 1) requestAnimationFrame(passo);
    };
    requestAnimationFrame(passo);
  };
  const contadores = $$('[data-conta]');
  if (contadores.length) {
    if (!('IntersectionObserver' in window)) contadores.forEach(conta);
    else {
      const o2 = new IntersectionObserver((it, obs) => it.forEach(i => {
        if (!i.isIntersecting) return;
        conta(i.target); obs.unobserve(i.target);
      }), { threshold: .6 });
      contadores.forEach(el => o2.observe(el));
    }
  }

  /* =========================================================================
     FORMULARIO -> WhatsApp
     Site estatico: nao ha servidor para receber POST. O envio monta a
     mensagem e abre a conversa; o cliente ainda aperta enviar do lado dele.
     ====================================================================== */
  const form = $('#form');
  if (form) form.addEventListener('submit', e => {
    e.preventDefault();
    const v = id => ($('#' + id)?.value || '').trim();
    const nome = v('nome');
    if (!nome) { $('#nome').focus(); $('#nome').style.borderColor = '#E7A93C'; return; }

    const itens = $$('input[name="item"]:checked', form).map(i => i.value);
    const linhas = [
      `Olá! Sou ${nome}${v('cidade') ? `, de ${v('cidade')}` : ''}.`,
      `Perfil: ${v('tipo')}.`,
      itens.length ? `Preciso de: ${itens.join(', ')}.` : '',
      v('detalhe') ? `Detalhes: ${v('detalhe')}` : '',
      'Vim pelo site e gostaria de um orçamento.'
    ].filter(Boolean);

    open(`https://wa.me/${ZAP}?text=${encodeURIComponent(linhas.join('\n'))}`, '_blank', 'noopener');
  });
})();
