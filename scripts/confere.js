/*
  Conferencia do site em Chrome de verdade.

  Existe porque o navegador do harness nao compoe quadro com o painel fechado:
  screenshot devolve "timed out" e medida de animacao devolve numero falso.
  A referencia de uma conferencia vem de FORA do que ela confere.

  O que mede:
    1. erro de console e requisicao quebrada
    2. transbordo horizontal em 5 larguras (360 -> 1920)
    3. CONTRASTE pelo PIXEL RENDERIZADO, nao pela cor declarada no CSS.
       Para isso a pagina e renderizada DUAS vezes: uma normal e outra com todo
       o texto em `transparent`. A segunda da o fundo real sob cada caixa de
       texto -- degrade, veu, brilho e sobreposicao ja compostos. Medir o par
       (cor declarada, cor de fundo declarada) aprova texto que na tela cai em
       cima de um degrade mais claro do que o token diz.
       Do fundo sob a caixa toma-se o pixel MAIS CLARO (pior caso para texto
       claro), nao a media.
    4. alt de imagem, foco visivel, hierarquia de titulo, meta de SEO

  Uso:
    python -m http.server 8099 --directory .     (na raiz do repositorio)
    node scripts/confere.js                      (noutro terminal)
*/
const PLAYWRIGHT = process.env.PLAYWRIGHT_CORE
  || 'C:/Projetos/SITES/luizeduardodf/node_modules/playwright-core';
const ALVO = process.env.URL || 'http://127.0.0.1:8099/';
const LARGURAS = [[360, 780, '360'], [414, 896, '414'], [768, 1024, '768'],
                  [1280, 900, '1280'], [1920, 1080, '1920']];

const { chromium } = require(PLAYWRIGHT);
const fs = require('fs');
const OUT = '_confere';
fs.mkdirSync(OUT, { recursive: true });

const canal = c => { c /= 255; return c <= 0.03928 ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4; };
const lum = ([r, g, b]) => 0.2126 * canal(r) + 0.7152 * canal(g) + 0.0722 * canal(b);
const razao = (a, b) => { const [x, y] = [lum(a), lum(b)].sort((p, q) => q - p); return (x + 0.05) / (y + 0.05); };
const rgb = s => (s.match(/[\d.]+/g) || [0, 0, 0]).slice(0, 3).map(Number);

let falhas = 0;
const erro = (...a) => { falhas++; console.log('  ✗', ...a); };
const ok = (...a) => console.log('  ✓', ...a);

(async () => {
  const navegador = await chromium.launch({ channel: 'chrome' });

  for (const [width, height, nome] of LARGURAS) {
    console.log(`\n── ${nome}px ─────────────────────────────`);
    const ctx = await navegador.newContext({ viewport: { width, height }, deviceScaleFactor: 1 });
    const pagina = await ctx.newPage();

    const consoles = [], quebradas = [];
    pagina.on('console', m => m.type() === 'error' && consoles.push(m.text()));
    pagina.on('requestfailed', r => quebradas.push(r.url()));
    pagina.on('response', r => r.status() >= 400 && quebradas.push(`${r.status()} ${r.url()}`));

    await pagina.goto(ALVO, { waitUntil: 'networkidle' });
    await pagina.evaluate(() => document.querySelectorAll('[data-revela]')
      .forEach(e => e.classList.add('vem')));
    await pagina.waitForTimeout(400);

    consoles.length ? erro('console:', consoles.join(' | ')) : ok('console limpo');
    quebradas.length ? erro('requisicao:', quebradas.join(' | ')) : ok('nenhuma requisicao quebrada');

    /* --- transbordo horizontal -------------------------------------------
       O sintoma que importa e a pagina ROLAR de lado, nao o scrollWidth: um
       decorativo dentro de `overflow:clip` estufa o scrollWidth sem que o
       visitante consiga arrastar nada. Entao o teste tenta rolar de verdade.
       Alem disso, todo elemento de CONTEUDO tem de caber. */
    const t = await pagina.evaluate(w => {
      scrollTo(9999, 0);
      const rolou = Math.round(scrollX);
      scrollTo(0, 0);
      const fora = [...document.querySelectorAll('body *')].filter(e => {
        if (e.closest('[aria-hidden="true"]')) return false;
        const s = getComputedStyle(e);
        if (s.position === 'fixed') return false;
        /* dentro de um recorte, passar da borda e o efeito pretendido */
        for (let a = e.parentElement; a; a = a.parentElement) {
          const o = getComputedStyle(a).overflowX;
          if (o === 'hidden' || o === 'clip' || o === 'auto' || o === 'scroll') return false;
        }
        const b = e.getBoundingClientRect();
        return b.width > 0 && (b.right > w + 1 || b.left < -1);
      }).map(e => `${e.tagName}.${(e.className.baseVal ?? e.className) || '-'}`);
      return { fora: [...new Set(fora)], rolou };
    }, width);
    (t.fora.length || t.rolou > 0)
      ? erro(`transbordo (rolou ${t.rolou}px):`, t.fora.slice(0, 6).join(', ') || '(so a rolagem)')
      : ok('sem rolagem lateral e todo conteudo dentro da largura');

    /* --- contraste pelo pixel renderizado --------------------------------- */
    const caixas = await pagina.evaluate(() => {
      const conta = [];
      const anda = n => {
        for (const f of n.childNodes) {
          if (f.nodeType === 3 && f.textContent.trim().length > 1) {
            const p = f.parentElement;
            if (!p || p.closest('[aria-hidden="true"]')) continue;
            const s = getComputedStyle(p);
            if (s.visibility === 'hidden' || s.opacity === '0') continue;
            const rr = document.createRange(); rr.selectNodeContents(f);
            const b = rr.getBoundingClientRect();
            if (b.width < 2 || b.height < 2) continue;
            const px = parseFloat(s.fontSize), peso = parseInt(s.fontWeight) || 400;
            conta.push({
              cor: s.color, px, peso,
              grande: px >= 24 || (px >= 18.66 && peso >= 700),
              onde: `${p.tagName}.${(p.className.baseVal ?? p.className) || '-'}`,
              texto: f.textContent.trim().slice(0, 26),
              x: b.x + scrollX, y: b.y + scrollY, w: b.width, h: b.height
            });
          } else if (f.nodeType === 1) anda(f);
        }
      };
      anda(document.body);
      return conta;
    });

    /* segunda renderizacao: mesmo layout, texto invisivel -> fundo puro.
       Sem isso mede-se o token declarado, e o token nao sabe que ha um
       degrade, um veu e um brilho compostos por cima dele. */
    await pagina.addStyleTag({ content: `*,*::before,*::after{
      color:transparent !important;-webkit-text-fill-color:transparent !important;
      text-shadow:none !important;caret-color:transparent !important}` });
    await pagina.waitForTimeout(200);
    await pagina.screenshot({ path: `${OUT}/${nome}-fundo.png`, fullPage: true });
    fs.writeFileSync(`${OUT}/${nome}-caixas.json`, JSON.stringify(caixas));
    ok(`${caixas.length} trechos de texto medidos -> ${OUT}/${nome}-*`);

    await pagina.close(); await ctx.close();
  }

  /* --- semantica e SEO, uma vez ------------------------------------------ */
  console.log('\n── semantica e SEO ──────────────────────');
  const ctx = await navegador.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto(ALVO, { waitUntil: 'networkidle' });
  const s = await p.evaluate(() => ({
    titulo: document.title,
    desc: document.querySelector('meta[name=description]')?.content || '',
    canonico: document.querySelector('link[rel=canonical]')?.href || '',
    og: ['og:title', 'og:description', 'og:image', 'og:url']
      .filter(k => !document.querySelector(`meta[property="${k}"]`)),
    h1: [...document.querySelectorAll('h1')].map(e => e.textContent.trim()),
    ordem: [...document.querySelectorAll('h1,h2,h3')].map(e => +e.tagName[1]),
    semAlt: [...document.querySelectorAll('img')].filter(i => !i.hasAttribute('alt')).map(i => i.src),
    semNome: [...document.querySelectorAll('a,button')]
      .filter(e => !e.textContent.trim() && !e.getAttribute('aria-label')).length,
    ancoras: [...document.querySelectorAll('a[href^="#"]')]
      .map(a => a.getAttribute('href')).filter(h => h !== '#' && !document.querySelector(h)),
    lang: document.documentElement.lang,
    jsonld: (() => { try { JSON.parse(document.querySelector('script[type="application/ld+json"]').textContent); return 'valido'; } catch (e) { return 'INVALIDO: ' + e.message; } })()
  }));

  s.titulo.length >= 20 && s.titulo.length <= 65 ? ok(`title (${s.titulo.length}): ${s.titulo}`) : erro('title fora de 20-65:', s.titulo.length);
  s.desc.length >= 80 && s.desc.length <= 175 ? ok(`description (${s.desc.length})`) : erro('description fora de 80-175:', s.desc.length);
  s.canonico ? ok('canonical', s.canonico) : erro('sem canonical');
  s.og.length ? erro('og faltando:', s.og.join(', ')) : ok('Open Graph completo');
  s.h1.length === 1 ? ok('um <h1>:', s.h1[0].replace(/\s+/g, ' ')) : erro(`${s.h1.length} <h1>`);
  const salto = s.ordem.findIndex((n, i) => i && n > s.ordem[i - 1] + 1);
  salto < 0 ? ok('hierarquia de titulo sem salto') : erro('salto de nivel na posicao', salto);
  s.semAlt.length ? erro('img sem alt:', s.semAlt.join(', ')) : ok('toda imagem com alt');
  s.semNome ? erro(`${s.semNome} link/botao sem nome acessivel`) : ok('todo link e botao com nome');
  s.ancoras.length ? erro('ancora quebrada:', s.ancoras.join(', ')) : ok('nenhuma ancora quebrada');
  s.lang === 'pt-BR' ? ok('lang=pt-BR') : erro('lang', s.lang);
  s.jsonld === 'valido' ? ok('JSON-LD valido') : erro(s.jsonld);

  /* foco visivel de teclado */
  const foco = await p.evaluate(() => {
    const n = [...document.querySelectorAll('a[href],button,input,select,textarea')]
      .filter(e => e.offsetParent !== null).length;
    return Math.min(n, 45);
  });
  /* Tab de verdade, nao .focus(): o indicador desta casa vem de :focus-visible,
     e foco por script NAO satisfaz :focus-visible. Medir com .focus() reprova
     um foco que, no teclado, aparece. */
  const semFoco = [];
  for (let i = 0; i < foco; i++) {
    await p.keyboard.press('Tab');
    const r = await p.evaluate(() => {
      const e = document.activeElement;
      if (!e || e === document.body) return null;
      const anel = el => {
        const c = getComputedStyle(el);
        return (c.outlineStyle !== 'none' && parseFloat(c.outlineWidth) > 0) || c.boxShadow !== 'none';
      };
      /* o anel pode estar no proprio elemento ou no invólucro (caso do <iframe>,
         que nunca casa com :focus quando o foco entra no documento de dentro) */
      return (anel(e) || (e.parentElement && anel(e.parentElement))) ? null
        : `${e.tagName}.${e.className || '-'} "${(e.textContent || '').trim().slice(0, 18)}"`;
    });
    if (r) semFoco.push(r);
  }
  semFoco.length ? erro('sem indicador de foco:', [...new Set(semFoco)].join(' | '))
                 : ok(`foco visivel nos ${foco} elementos focalizaveis (Tab real)`);

  /* quadros de animacao — o instrumento antes da peca */
  const quadros = await p.evaluate(() => new Promise(r => {
    let n = 0; const t = performance.now();
    const conta = () => { n++; performance.now() - t < 1000 ? requestAnimationFrame(conta) : r(n); };
    requestAnimationFrame(conta);
  }));
  quadros > 30 ? ok(`${quadros} quadros/s — o instrumento pinta, a medida vale`)
               : erro(`${quadros} quadros/s — navegador parado, nada aqui foi medido de fato`);

  await navegador.close();

  /* contraste: a conta da WCAG sobre os pixels, feita em Python (PIL) — nao ha
     decodificador de PNG disponivel para o Node nesta maquina. */
  console.log('\n── contraste pelo pixel renderizado ─────');
  const r = require('child_process').spawnSync('python',
    ['scripts/confere-contraste.py'], { stdio: 'inherit' });
  if (r.status !== 0) falhas++;

  console.log(falhas ? `\n${falhas} FALHA(S)\n` : '\nTudo verde.\n');
  process.exit(falhas ? 1 : 0);
})();
