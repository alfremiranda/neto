#!/usr/bin/env node
/**
 * Visual regression over the story matrix.
 *
 * The reason this exists rather than a catalogue: `20-roadmap` argued that a baseline
 * taken over a derived artefact certifies drift as correct and then reads every real fix
 * as a regression. That condition lifted on 2026-08-22 — Figma and the published package
 * agree exactly, `index.css` defines no colours, and the package regenerates from
 * `tokens.json`. So a baseline now pins a real state.
 *
 * Every story is shot in both themes and both widths, because a component that is right
 * in light at 1280 and wrong in dark at 412 is still wrong.
 *
 *   node scripts/visual-regression.mjs            compare against the baseline
 *   node scripts/visual-regression.mjs --update   accept the current render as the baseline
 */
import { chromium } from 'playwright'
import { createServer } from 'node:http'
import { readFileSync, writeFileSync, existsSync, mkdirSync, readdirSync } from 'node:fs'
import { join, extname, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { execSync } from 'node:child_process'
import { PNG } from 'pngjs'
import pixelmatch from 'pixelmatch'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(ROOT, 'test/visual-baseline')
const DIFFS = join(ROOT, 'test/visual-diff')
const UPDATE = process.argv.includes('--update')
const BUILD = join(ROOT, 'storybook-static')

const THEMES = ['light', 'dark']
const DEVICES = [{ id: 'mobile', width: 412 }, { id: 'desktop', width: 1280 }]

if (!existsSync(BUILD)) {
  console.log('construyendo Storybook…')
  execSync('npx storybook build -o storybook-static --quiet', {
    cwd: ROOT, stdio: 'inherit', env: { ...process.env, STORYBOOK_DISABLE_TELEMETRY: '1' },
  })
}

// A plain static server: no dev server, no HMR, nothing that could differ between runs.
const MIME = { '.html': 'text/html', '.js': 'text/javascript', '.css': 'text/css',
               '.json': 'application/json', '.svg': 'image/svg+xml', '.woff2': 'font/woff2' }
const server = createServer((req, res) => {
  const path = join(BUILD, decodeURIComponent((req.url || '/').split('?')[0]))
  const file = existsSync(path) && !path.endsWith('/') ? path : join(path, 'index.html')
  if (!existsSync(file)) { res.writeHead(404); return res.end() }
  res.writeHead(200, { 'content-type': MIME[extname(file)] ?? 'application/octet-stream' })
  res.end(readFileSync(file))
})
await new Promise(r => server.listen(0, r))
const base = `http://localhost:${server.address().port}`

const index = JSON.parse(readFileSync(join(BUILD, 'index.json'), 'utf8'))
const stories = Object.values(index.entries).filter(e => e.type === 'story')

mkdirSync(OUT, { recursive: true })
mkdirSync(DIFFS, { recursive: true })

const browser = await chromium.launch()
let checked = 0, failed = [], created = 0
for (const story of stories) {
  for (const theme of THEMES) {
    for (const dev of DEVICES) {
      const name = `${story.id}--${theme}--${dev.id}.png`
      const page = await browser.newPage({ viewport: { width: dev.width, height: 720 } })
      await page.goto(
        `${base}/iframe.html?id=${story.id}&globals=theme:${theme};device:${dev.id}`,
        { waitUntil: 'networkidle' },
      )
      // The version header is library chrome, not the component under test — and it
      // carries the commit sha, so leaving it in the frame makes every baseline stale on
      // every push. A detector that goes red because someone committed is no detector.
      await page.addStyleTag({ content: '[data-ds-stamp]{display:none !important}' })
      // Transitions must have finished before the shot, or the baseline records a frame
      // mid-flight and every later run disagrees with it.
      await page.emulateMedia({ reducedMotion: 'reduce' })
      await page.waitForTimeout(250)
      // `animations: 'disabled'` pauses CSS animations and rolls them to their end state.
      // Without it the Spinner is the flake: it keeps rotating even under reduced motion —
      // deliberately, since it is the only sign an operation is still running — so each
      // run catches it at a different angle and the diff is a handful of pixels of noise.
      const shot = await page.screenshot({ fullPage: true, animations: 'disabled' })
      await page.close()

      const golden = join(OUT, name)
      checked++
      if (UPDATE || !existsSync(golden)) {
        writeFileSync(golden, shot)
        created++
        continue
      }
      const a = PNG.sync.read(readFileSync(golden))
      const b = PNG.sync.read(shot)
      if (a.width !== b.width || a.height !== b.height) {
        failed.push(`${name}  tamaño ${a.width}x${a.height} → ${b.width}x${b.height}`)
        writeFileSync(join(DIFFS, name), shot)
        continue
      }
      const diff = new PNG({ width: a.width, height: a.height })
      const px = pixelmatch(a.data, b.data, diff.data, a.width, a.height, { threshold: 0.1 })
      if (px > 0) {
        failed.push(`${name}  ${px} px distintos`)
        writeFileSync(join(DIFFS, name), PNG.sync.write(diff))
      }
    }
  }
}
await browser.close()
server.close()

console.log(`\n${stories.length} historias × ${THEMES.length} modos × ${DEVICES.length} anchos = ${checked} capturas`)
if (created) console.log(`  ${created} baseline(s) ${UPDATE ? 'actualizadas' : 'creadas por primera vez'}`)

// A baseline is only comparable against the renderer that produced it: a Mac and a Linux
// runner rasterise fonts differently, which is not a CSS difference. So the committed
// baseline has to come from CI, and a run that had to invent one has not compared
// anything — saying so is the difference between a detector and a green tick.
if (created && !UPDATE && process.env.CI) {
  console.log(`\n✗ No había baseline para ${created} captura(s), así que no se comparó nada.`)
  console.log('   Se generaron aquí y se suben como artefacto `visual-diff`.')
  console.log('   Descárgalas a test/visual-baseline/ y commitéalas; la próxima corrida ya compara.')
  for (const f of readdirSync(OUT)) writeFileSync(join(DIFFS, f), readFileSync(join(OUT, f)))
  process.exit(1)
}
if (failed.length) {
  console.log(`\n✗ ${failed.length} diferencia(s):`)
  failed.forEach(f => console.log('  ' + f))
  console.log(`\nimágenes de diferencia en test/visual-diff/`)
  console.log('Si el cambio es intencional: node scripts/visual-regression.mjs --update')
  process.exit(1)
}
console.log('\n✓ sin diferencias')
