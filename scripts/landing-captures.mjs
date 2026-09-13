#!/usr/bin/env node
/**
 * Photographs the app with the demo persona, for the landing's feature blocks.
 *
 * Why a script and not six manual screenshots: the app changes. A hand-taken set cannot be
 * re-taken after a UI fix without someone remembering which six views, at which width, in
 * which theme, with which tab open. This is that memory.
 *
 * It drives the running dev server at ?preview=demo, which mounts the authenticated app
 * with the invented persona and NO Supabase session (src/lib/demoSeed.ts). Nothing here
 * touches real data, and the fixture is dropped from production builds by tree-shaking.
 *
 * Usage:
 *   npm run dev                    # in another terminal
 *   node scripts/landing-captures.mjs [--theme dark] [--port 5173]
 *
 * Writes webp straight into public/landing/images/ through the same encoder as
 * scripts/landing-image.mjs.
 */
import { writeFileSync, statSync, mkdirSync } from 'node:fs'
import { join, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
import { chromium } from 'playwright'

const root = join(dirname(fileURLToPath(import.meta.url)), '..')
const OUT = join(root, 'public/landing/images')
const BUDGET = 250 * 1024

const flag = (n, d) => {
  const i = process.argv.indexOf(`--${n}`)
  return i === -1 ? d : process.argv[i + 1]
}
const PORT = flag('port', '5173')
const THEME = flag('theme', 'light')
const BASE = `http://localhost:${PORT}/panel/?preview=demo`

/** The six blocks, in the order they appear on the landing.
 *
 *  Every shot is the same shape: RATIO wide, cut from the app's main column at full width. The
 *  landing shows one capture at a time in one box (the feature tabs), and captures at six aspect
 *  ratios — a 3.5:1 KPI strip, a near-square chart — floated in that box with bands of empty
 *  ground above and below (Alfredo: they must fill the container). One ratio means the image
 *  fills the box's width in every tab and the box never changes shape.
 *
 *  A fixed ratio cannot snap its bottom edge to a line the way the old per-shot heights did, so
 *  the landing fades the bottom of each capture instead: the cut reads as the view continuing,
 *  not as a slice through a row.
 *
 *  `start` — where the frame's top edge sits:
 *            'top'           the top of the view,
 *            { tabs: true }  the Mes view's tab bar (so the tab that is open is in frame, and the
 *                            shot does not repeat the KPI strip the first one already shows),
 *            { card: name }  the card with this heading.
 *  `account` — open this account's detail from the Cuentas grid before framing.
 *  `width` — viewport width for this shot (default 1280). A view with little content leaves the
 *            bottom half of a 3:2 frame empty at desktop width; a narrower window reflows it
 *            into more rows, so it fills the frame and its UI reads larger in the box.
 */
const RATIO = 3 / 2
const OUT_WIDTH = 1200 // 2× the widest the box renders (~600 CSS px), so it stays sharp

const SHOTS = [
  { name: 'feature-kpis', view: 'mes', tab: 'Ingresos', start: 'top',
    label: 'KPIs, barra de distribución e ingresos' },
  { name: 'feature-deducciones', view: 'mes', tab: 'Tributarias', start: { tabs: true },
    label: 'obligaciones tributarias del mes' },
  { name: 'feature-obligaciones', view: 'tributarias', start: 'top',
    label: 'página de Obligaciones' },
  // One account opened, not the grid. The grid of six fills 46% of a 3:2 frame at 1280, and any
  // window narrow enough to stack it more rows truncates the account names. The savings account's
  // detail fills the frame and shows what the feature copy promises: its history month by month,
  // and transfers (to the CDT, to the DIAN reserve, from dollars) that do not count as spending.
  { name: 'feature-cuentas', view: 'cuentas', account: 'Cuenta de ahorros', start: 'top',
    label: 'detalle de la cuenta de ahorros' },
  { name: 'feature-analitica', view: 'dashboard', start: { card: 'Resumen anual' },
    label: 'resumen anual' },
  // From the top at 1180: the month's figures, the tab bar and the transfers fill 96% of the frame.
  // From the tab bar the three transfers filled 47%. 1180 is still wide enough that no KPI wraps.
  { name: 'feature-movimientos', view: 'mes', tab: 'Movimientos', start: 'top', width: 1180,
    label: 'movimientos y TRM efectiva' },
]

const browser = await chromium.launch()
const page = await browser.newPage({
  // 1280 wide: the narrowest desktop width at which the month's KPI figures stay on one line
  // (measured: at 1120 "$21,81 m" wraps). Tall, so a frame that starts low still fits on screen.
  viewport: { width: 1280, height: 1500 },
  deviceScaleFactor: 2, // retina: the landing scales these down, and a 1x capture looks soft
  colorScheme: THEME === 'dark' ? 'dark' : 'light',
})

page.on('pageerror', e => { console.error('page error:', e.message); process.exitCode = 1 })

await page.goto(BASE, { waitUntil: 'networkidle' })
await page.evaluate(t => {
  localStorage.setItem('neto-theme', t)
  document.documentElement.classList.toggle('dark', t === 'dark')
}, THEME)
await page.waitForSelector('main', { timeout: 15000 })

async function encode(buffer, width, height) {
  const dataUrl = `data:image/png;base64,${buffer.toString('base64')}`
  return page.evaluate(async ({ url, width, height }) => {
    const img = new Image()
    img.src = url
    await img.decode()
    const c = document.createElement('canvas')
    // Without a size, the image keeps its own (the phone shots).
    c.width = width || img.naturalWidth
    c.height = height || img.naturalHeight
    const ctx = c.getContext('2d')
    ctx.imageSmoothingQuality = 'high'
    ctx.drawImage(img, 0, 0, c.width, c.height)
    return c.toDataURL('image/webp', 0.85).split(',')[1]
  }, { url: dataUrl, width, height })
}

mkdirSync(OUT, { recursive: true })
const suffix = THEME === 'dark' ? '-dark' : ''

for (const shot of SHOTS) {
  await page.setViewportSize({ width: shot.width ?? 1280, height: 1500 })
  await page.waitForTimeout(300)

  // uiStore drives navigation — there is no router, so a view plus an id is the whole of
  // what a route would have carried (src/types/index.ts).
  await page.evaluate(v => {
    const btn = [...document.querySelectorAll('button, a')].find(
      b => b.textContent?.trim().toLowerCase() === v,
    )
    btn?.click()
  }, { mes: 'mes', dashboard: 'resumen', cuentas: 'cuentas', tributarias: 'obligaciones' }[shot.view])
  await page.waitForTimeout(500)

  if (shot.account) {
    await page.locator('main').getByText(shot.account).first().click()
    await page.waitForTimeout(700)
  }

  if (shot.tab) {
    await page.evaluate(t => {
      const btn = [...document.querySelectorAll('button')].find(b => b.textContent?.trim() === t)
      btn?.click()
    }, shot.tab)
    await page.waitForTimeout(600)
  }

  const clip = await page.evaluate(({ start, ratio }) => {
    const main = document.querySelector('main')
    const PAD = 16
    main.scrollTop = 0
    const m = main.getBoundingClientRect()
    let top = m.top
    if (start && start.tabs) {
      const tab = [...main.querySelectorAll('button')].find(b => b.textContent?.trim() === 'Ingresos')
      if (!tab) return { error: 'tab bar not found' }
      top = tab.getBoundingClientRect().top - PAD
    } else if (start && start.card) {
      // Card titles are a <span class="ts-heading-group">, not a heading tag — the design
      // system's text styles carry the level, and the markup does not. Matching on the text
      // of a leaf element is what actually finds them.
      const card = [...main.querySelectorAll('*')]
        .find(e => e.children.length === 0 && e.textContent.trim() === start.card)
        ?.closest('[class*="rounded-xl"]')
      if (!card) return { error: `card not found: ${start.card}` }
      top = card.getBoundingClientRect().top - PAD
    }
    // Bring the frame's top to the top of the scroll area when the page is long enough.
    main.scrollTop = Math.max(0, top - m.top)
    const shift = main.scrollTop
    const width = m.width
    const height = Math.round(width / ratio)
    return { x: m.left, y: top - shift, width, height }
  }, { start: shot.start, ratio: RATIO })

  if (clip.error) {
    console.error(`✗ ${shot.name}: ${clip.error}`)
    process.exitCode = 1
    continue
  }

  // Charts animate in. Waiting for the network is not waiting for d3.
  await page.waitForTimeout(1100)

  const png = await page.screenshot({ type: 'png', clip })
  const webp = await encode(png, OUT_WIDTH, Math.round(OUT_WIDTH / RATIO))
  const file = join(OUT, `${shot.name}${suffix}.webp`)
  writeFileSync(file, Buffer.from(webp, 'base64'))
  const size = statSync(file).size
  console.log(
    `${size > BUDGET ? '⚠ ' : '  '}${shot.name}${suffix}.webp  ${Math.round(size / 1024)} kB  ` +
    `${OUT_WIDTH}×${Math.round(OUT_WIDTH / RATIO)} (frame ${Math.round(clip.width)}×${Math.round(clip.height)} at y ${Math.round(clip.y)}) — ${shot.label}`,
  )
}

/* ── Phone shots ─────────────────────────────────────────────────────────────────────
   Screens shown inside a phone frame on the landing rather than as a desktop card. They get
   their own viewport and their own URL, because the screen that makes the privacy section's
   point — the Ley 1581 authorisation — is a gate, reachable only through ?preview=consent.

   `clipHeight` crops the IMAGE, not the layout. The landing lets the frame run off the bottom
   of its panel the way the reference does; if that crop were done with the panel's height it
   would move at every width as the phone scales, and land somewhere different each time — at
   one size through the middle of a button. Cropped here, it ends in the same place always:
   just past "No acepto", before the small print. */
const PHONE_SHOTS = [
  { name: 'privacy-consent', url: '/panel/?preview=consent', clipHeight: 780,
    label: 'pantalla de autorización (Ley 1581)' },
]

for (const shot of PHONE_SHOTS) {
  const phone = await browser.newPage({
    viewport: { width: 390, height: 844 },
    deviceScaleFactor: 2,
    colorScheme: THEME === 'dark' ? 'dark' : 'light',
  })
  await phone.addInitScript(t => { try { localStorage.setItem('neto-theme', t) } catch (e) {} }, THEME)
  await phone.goto(`http://localhost:${PORT}${shot.url}`, { waitUntil: 'networkidle' })
  await phone.evaluate(t => document.documentElement.classList.toggle('dark', t === 'dark'), THEME)
  await phone.waitForTimeout(1200)
  const png = await phone.screenshot({ type: 'png', clip: { x: 0, y: 0, width: 390, height: shot.clipHeight } })
  await phone.close()
  const webp = await encode(png)
  const file = join(OUT, `${shot.name}${suffix}.webp`)
  writeFileSync(file, Buffer.from(webp, 'base64'))
  const size = statSync(file).size
  console.log(`${size > BUDGET ? '⚠ ' : '  '}${shot.name}${suffix}.webp  ${Math.round(size / 1024)} kB  390×${shot.clipHeight} — ${shot.label}`)
}

await browser.close()
console.log(`\n${SHOTS.length + PHONE_SHOTS.length} capturas · tema ${THEME} · public/landing/images/`)
