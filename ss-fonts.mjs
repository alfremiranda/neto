import { chromium } from 'playwright';
const b = await chromium.launch();
const p = await b.newPage();
await p.setViewportSize({ width: 1280, height: 900 });
await p.goto('http://localhost:5173/neto/');
await p.waitForTimeout(2000);

const info = await p.evaluate(() => {
  const s = getComputedStyle(document.documentElement);
  const body = document.body;
  const h2 = document.querySelector('h2, h1, h3');
  const kpiVal = document.querySelector('.text-xl, .text-2xl, .tabular-nums');

  return {
    // CSS vars
    fontSansVar: s.getPropertyValue('--font-sans').trim(),
    fontMonoVar: s.getPropertyValue('--font-mono').trim(),
    fontHeadingVar: s.getPropertyValue('--font-heading').trim(),
    // Computed font-family on elements
    bodyFont: getComputedStyle(body).fontFamily,
    h2Font: h2 ? getComputedStyle(h2).fontFamily : 'no h2 found',
    kpiFont: kpiVal ? getComputedStyle(kpiVal).fontFamily : 'no kpi found',
    // Check if fonts loaded
    fontsLoaded: document.fonts.status,
    loadedFonts: [...document.fonts].map(f => `${f.family} ${f.style} ${f.weight} status:${f.status}`).slice(0, 10),
  };
});
console.log('Font info:', JSON.stringify(info, null, 2));
await b.close();
