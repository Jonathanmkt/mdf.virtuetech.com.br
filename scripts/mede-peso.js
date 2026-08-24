/*
  Peso real da primeira carga, por tipo de recurso.

  Mede o que o VISITANTE baixa, nao o que ha na pasta: `du -sh assets/` conta o
  arquivo-fonte da logo, o og.png que so o robo de compartilhamento busca e as
  variantes que o `srcset` nao escolheu naquela largura. A diferenca entre os
  dois numeros e grande o bastante para virar afirmacao errada num relatorio.

  Roda nas larguras que mudam a escolha do `srcset`.

  Uso:
    python -m http.server 8099 --directory .
    node scripts/mede-peso.js
*/
const PLAYWRIGHT = process.env.PLAYWRIGHT_CORE
  || 'C:/Projetos/SITES/luizeduardodf/node_modules/playwright-core';
const ALVO = process.env.URL || 'http://127.0.0.1:8099/';
const { chromium } = require(PLAYWRIGHT);

(async () => {
  const nav = await chromium.launch({ channel: 'chrome' });
  for (const [w, h, nome] of [[360, 780, '360 (celular)'], [1280, 900, '1280 (desktop)']]) {
    const ctx = await nav.newContext({ viewport: { width: w, height: h } });
    const p = await ctx.newPage();
    let total = 0; const por = {};
    p.on('response', async r => {
      try {
        const buf = await r.body();
        total += buf.length;
        const t = r.request().resourceType();
        por[t] = (por[t] || 0) + buf.length;
      } catch { /* redirecionamento e resposta sem corpo */ }
    });
    const t0 = Date.now();
    await p.goto(ALVO, { waitUntil: 'load' });
    const carga = Date.now() - t0;
    await p.waitForTimeout(1200);           // deixa o que e adiado terminar
    console.log(`${nome}: ${(total / 1024).toFixed(0)} KB (${carga} ms) — ` +
      Object.entries(por).sort((a, b) => b[1] - a[1])
        .map(([k, v]) => `${k} ${(v / 1024).toFixed(0)}KB`).join(' · '));
    await ctx.close();
  }
  await nav.close();
})();
