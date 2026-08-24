/*
  Gera o cartao de compartilhamento (og:image, 1200x630).

  O card e o produto, nao o site: e ele que aparece no WhatsApp, no grupo de
  marceneiros e no Instagram — quase sempre ANTES de alguem abrir a pagina.
  Por isso ele nao e um recorte do site: e uma peca propria, com a promessa
  legivel em miniatura.

  Uso: node scripts/gera-og.js     (nao precisa de servidor)
*/
const PLAYWRIGHT = process.env.PLAYWRIGHT_CORE
  || 'C:/Projetos/SITES/luizeduardodf/node_modules/playwright-core';
const { chromium } = require(PLAYWRIGHT);
const fs = require('fs'), path = require('path');

const raiz = process.cwd();
const b64 = f => fs.readFileSync(path.join(raiz, f)).toString('base64');

const html = `<!doctype html><html lang="pt-BR"><head><meta charset="utf-8">
<link href="https://fonts.googleapis.com/css2?family=Inter:wght@500&family=Sora:wght@700;800&display=swap" rel="stylesheet">
<style>
  *{margin:0;box-sizing:border-box}
  body{width:1200px;height:630px;overflow:hidden;background:#070B14;color:#F5F7FC;
       font-family:Inter,sans-serif;position:relative;display:flex;align-items:center;
       padding:0 76px;gap:56px}
  .brilho{position:absolute;width:900px;height:900px;right:-140px;top:-260px;
    background:radial-gradient(circle,rgba(46,107,255,.34),transparent 64%);filter:blur(20px)}
  .brasa{position:absolute;width:700px;height:700px;left:-180px;bottom:-320px;
    background:radial-gradient(circle,rgba(231,169,60,.22),transparent 62%);filter:blur(24px)}
  .txt{position:relative;flex:1}
  .selo{display:inline-block;padding:9px 18px;border-radius:999px;background:#E7A93C;
    color:#1A1204;font-family:Sora;font-weight:700;font-size:17px;letter-spacing:.1em;
    text-transform:uppercase;margin-bottom:30px}
  h1{font-family:Sora;font-weight:800;font-size:70px;line-height:.98;letter-spacing:-.035em}
  h1 .fraco{color:#7E8DAB}
  h1 .quente{color:#E7A93C}
  p{margin-top:26px;font-size:25px;line-height:1.4;color:#B6C2DA;max-width:22ch}
  .pe{position:absolute;left:76px;bottom:44px;font-size:20px;color:#7E8DAB;
      letter-spacing:.04em}
  .medalha{position:relative;width:392px;flex:none}
  .medalha img{width:100%;filter:drop-shadow(0 30px 60px rgba(0,0,0,.8))
    drop-shadow(0 0 54px rgba(46,107,255,.34))}
  .fio{position:absolute;left:0;right:0;bottom:0;height:5px;
    background:linear-gradient(90deg,#2E6BFF,#E7A93C)}
</style></head><body>
  <div class="brilho"></div><div class="brasa"></div>
  <div class="txt">
    <span class="selo">Araruama · RJ</span>
    <h1><span class="fraco">Não vendemos MDF.</span><br>Entregamos <span class="quente">possibilidades.</span></h1>
    <p>MDF, ferragens e acessórios para marcenaria — com corte e fitagem sob medida.</p>
  </div>
  <div class="medalha"><img src="data:image/png;base64,${b64('assets/img/logo-mr-512.png')}" alt=""></div>
  <div class="pe">MR Distribuidora · Rede Pró — Rod. Amaral Peixoto, km 80 · (22) 97405-9854</div>
  <div class="fio"></div>
</body></html>`;

(async () => {
  const nav = await chromium.launch({ channel: 'chrome' });
  const p = await nav.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 });
  await p.setContent(html, { waitUntil: 'networkidle' });
  await p.evaluate(() => document.fonts.ready);
  await p.waitForTimeout(350);

  /* nenhum texto pode encostar na borda nem transbordar */
  const fura = await p.evaluate(() => [...document.querySelectorAll('h1,p,.selo,.pe')]
    .filter(e => { const b = e.getBoundingClientRect();
      return b.left < 40 || b.right > 1160 || b.top < 24 || b.bottom > 606; })
    .map(e => `${e.tagName}.${e.className} ${JSON.stringify(e.getBoundingClientRect())}`));
  if (fura.length) { console.error('TEXTO FORA DA MARGEM:', fura.join('\n')); process.exit(1); }

  await p.screenshot({ path: 'assets/img/og.png' });
  await nav.close();
  const kb = (fs.statSync('assets/img/og.png').size / 1024).toFixed(0);
  console.log(`assets/img/og.png — 1200x630, ${kb} KB, margens conferidas`);
})();
