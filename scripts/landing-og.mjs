#!/usr/bin/env node
/**
 * Renders the social-share images (Open Graph / X large card), 1200×630.
 *
 * Before this the pages shared the 512px app icon as a small "summary" card: a link to Neto in
 * WhatsApp, LinkedIn or X showed a logo and nothing about what it does. These are built from the
 * landing itself — the generated tokens, styles.css, and the hero's flow card and the calculator
 * card lifted out of public/index.html at run time — so the figures and the look cannot drift from
 * the page they advertise. Re-run after changing either card.
 *
 * Usage: node scripts/landing-og.mjs
 * Writes public/landing/og/{neto,calculadora}.jpg
 */
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, mkdirSync, statSync, existsSync } from 'node:fs'
import { join, dirname, extname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const PUBLIC = join(root, 'public')
const OUT = join(PUBLIC, 'landing/og')
const landing = readFileSync(join(PUBLIC, 'index.html'), 'utf8')

const pick = (re, what) => {
  const m = landing.match(re)
  if (!m) { console.error(`not found in public/index.html: ${what}`); process.exit(1) }
  return m[0]
}
const flow = pick(/<figure class="flow"[\s\S]*?<\/figure>/, 'hero flow card')
const card = pick(/<figure class="calc__card">[\s\S]*?<\/figure>/, 'calculator card')

const DOT = '<svg width="12" height="12" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true"><circle cx="12" cy="12" r="6" /></svg>'
const IMAGES = {
  neto: {
    eyebrow: 'Planeador financiero para independientes en Colombia',
    title: 'De lo que facturé este mes, <em style="font-style:normal;color:var(--fg-net)">¿cuánto es realmente mío?</em>',
    visual: flow,
  },
  calculadora: {
    eyebrow: 'Calculadora gratis · Colombia 2026',
    title: 'Calculadora de seguridad social para <em style="font-style:normal;color:var(--fg-tax)">independientes</em>',
    visual: `<div class="calc og__calc">${card}</div>`,
  },
}

const page = ({ eyebrow, title, visual }) => `<!doctype html>
<html lang="es-CO" class="dark"><head><meta charset="utf-8">
<link rel="stylesheet" href="/landing/tokens.css"><link rel="stylesheet" href="/landing/styles.css">
<style>
  html, body { margin: 0; width: 1200px; height: 630px; overflow: hidden; background: var(--marketing-panel-background); }
  .og {
    box-sizing: border-box; width: 1200px; height: 630px; padding: 64px 72px;
    display: grid; grid-template-columns: minmax(0, 1.1fr) minmax(0, 0.9fr); gap: 56px; align-items: center;
    color: var(--marketing-panel-foreground);
    background-image:
      radial-gradient(at 0% 0%, color-mix(in oklab, var(--bg-brand) 40%, transparent) 0, transparent 52%),
      radial-gradient(at 100% 100%, color-mix(in oklab, var(--marketing-accent-on-panel) 26%, transparent) 0, transparent 50%);
  }
  .og__copy { display: flex; flex-direction: column; gap: 28px; }
  .og__brand { display: flex; align-items: center; gap: 12px; }
  .og__brand img { width: 40px; height: 40px; border-radius: var(--radius-lg); }
  .og h1 { margin: 0; font-size: 58px; line-height: 1.05; letter-spacing: -1px; font-weight: 700; text-wrap: balance; }
  .og .eyebrow { color: var(--marketing-accent-on-panel); }
  .og__url { color: var(--marketing-panel-foreground-subtle); }
  .og .flow, .og .calc__card { margin: 0; }
  .flow__seg { width: var(--pct); }
  .og__calc { padding: 0; background: none; display: block; }
  [data-reveal] { opacity: 1 !important; transform: none !important; }
</style></head>
<body><div class="og">
  <div class="og__copy">
    <div class="og__brand ts-heading-section"><img src="/icon.svg" alt="">Neto</div>
    <span class="eyebrow ts-label-base">${DOT} ${eyebrow}</span>
    <h1>${title}</h1>
    <span class="og__url ts-body-base">netofinanzas.app</span>
  </div>
  <div>${visual}</div>
</div></body></html>`

const TYPES = { '.css': 'text/css', '.woff2': 'font/woff2', '.svg': 'image/svg+xml', '.png': 'image/png', '.webp': 'image/webp' }
const server = createServer((req, res) => {
  const url = decodeURIComponent(req.url.split('?')[0])
  const name = url.match(/^\/__og\/(\w+)$/)?.[1]
  if (name && IMAGES[name]) {
    res.writeHead(200, { 'content-type': 'text/html; charset=utf-8' })
    return res.end(page(IMAGES[name]))
  }
  const file = join(PUBLIC, url)
  if (!file.startsWith(PUBLIC) || !existsSync(file) || statSync(file).isDirectory()) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'content-type': TYPES[extname(file)] || 'application/octet-stream' })
  res.end(readFileSync(file))
}).listen(0)
const port = server.address().port

mkdirSync(OUT, { recursive: true })
const browser = await chromium.launch()
const tab = await browser.newPage({ viewport: { width: 1200, height: 630 }, deviceScaleFactor: 1 })
for (const name of Object.keys(IMAGES)) {
  await tab.goto(`http://localhost:${port}/__og/${name}`, { waitUntil: 'networkidle' })
  await tab.evaluate(() => document.fonts.ready)
  const file = join(OUT, `${name}.jpg`)
  writeFileSync(file, await tab.screenshot({ type: 'jpeg', quality: 90 }))
  console.log(`  ${name}.jpg  ${Math.round(statSync(file).size / 1024)} kB  1200×630`)
}
await browser.close()
server.close()
