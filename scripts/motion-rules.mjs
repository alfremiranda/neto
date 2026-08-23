import { chromium } from 'playwright'
import { spawn } from 'node:child_process'
import { dirname, join } from 'node:path'
import { fileURLToPath } from 'node:url'

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..')

// Against the dev server, not a build: the ?preview flags are gated on import.meta.env.DEV
// and fold to false in anything production-like, which is exactly the guarantee that keeps
// the fixture out of the shipped bundle. So the only place these screens are reachable is
// the dev server.
const dev = spawn('npx', ['vite', '--port', '5199', '--strictPort'], { cwd: ROOT, stdio: 'pipe' })
const base = 'http://localhost:5199'

// Polls the URL rather than watching stdout for a banner. Parsing the log made this depend
// on Vite's output format and on a cold CI runner printing it inside 30s — it did not, and
// the failure said "no arrancó" when the real cause was "no dijo lo que yo esperaba oír".
let log = ''
dev.stdout.on('data', d => { log += d })
dev.stderr.on('data', d => { log += d })
const ready = await (async () => {
  for (let i = 0; i < 120; i++) {
    try {
      const r = await fetch(base, { signal: AbortSignal.timeout(1000) })
      if (r.ok) return true
    } catch { /* not up yet */ }
    await new Promise(r => setTimeout(r, 1000))
  }
  return false
})()
if (!ready) {
  console.error('el dev server no respondió en 120s. Salida:\n' + log.slice(-2000))
  dev.kill('SIGTERM')
  process.exit(1)
}
const stop = () => { try { dev.kill('SIGTERM') } catch { /* already gone */ } }

const fails = []
const check = (name, ok, detail) => {
  console.log(`  ${ok ? '✓' : '✗'} ${name}${detail ? `  ${detail}` : ''}`)
  if (!ok) fails.push(name)
}

const browser = await chromium.launch()

// ── Rule 3 · direction of travel ─────────────────────────────────────────────
// Going back mirrors the Y. It is the only thing that tells a user whether they advanced
// or retreated, so a transition that looks identical in both directions is a defect even
// though every frame of it is "correct".
{
  const p = await browser.newPage({ viewport: { width: 1440, height: 900 } })
  await p.goto(`${base}/?preview=onboarding`, { waitUntil: 'networkidle' })
  const col = () => p.evaluate(() => {
    const c = document.querySelector('[class*="max-w-sm"]')
    return getComputedStyle(c).transform
  })
  const next = () => p.getByRole('button', { name: /Comenzar|Continuar/ }).click()

  await next(); await p.waitForTimeout(55)
  const forward = await col()
  await p.waitForTimeout(500)
  await next(); await p.waitForTimeout(500)
  await p.getByRole('button', { name: /Atrás/ }).click(); await p.waitForTimeout(55)
  const backward = await col()

  const y = t => { const m = /matrix\(([^)]+)\)/.exec(t); return m ? Number(m[1].split(',')[5]) : 0 }
  check('la dirección se invierte al retroceder',
        y(forward) !== 0 && y(backward) !== 0 && Math.sign(y(forward)) !== Math.sign(y(backward)),
        `adelante ${y(forward)}px · atrás ${y(backward)}px`)
  await p.close()
}

// ── Rule 4 · reduced motion removes movement, not feedback ───────────────────
// The standard mistake is to strip the state change along with the movement, which makes
// the product feel broken rather than calm. The Spinner is the case that matters: it is
// the only signal that an operation is still running.
{
  const p = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' })
  await p.goto(`${base}/?preview=consent`, { waitUntil: 'networkidle' })
  const width = () => p.evaluate(() => {
    const b = [...document.querySelectorAll('button')].find(x => /Autorizar/.test(x.textContent))
    return Math.round(b.getBoundingClientRect().width)
  })
  const before = await width()
  await p.getByRole('button', { name: /Autorizar/ }).click(); await p.waitForTimeout(250)
  const state = await p.evaluate(() => {
    const s = document.querySelector('span.animate-spin')
    return s ? { present: true, animation: getComputedStyle(s).animationName } : { present: false }
  })
  check('el spinner sobrevive a prefers-reduced-motion', state.present && state.animation === 'spin',
        `animación: ${state.animation ?? 'ninguna'}`)
  check('el botón ocupado no cambia de ancho bajo reduced-motion', before === await width(),
        `${before}px`)

  // And movement really is gone: the step column keeps its opacity transition but loses
  // the transform.
  const p2 = await browser.newPage({ viewport: { width: 1440, height: 900 }, reducedMotion: 'reduce' })
  await p2.goto(`${base}/?preview=onboarding`, { waitUntil: 'networkidle' })
  await p2.getByRole('button', { name: /Comenzar/ }).click(); await p2.waitForTimeout(400)
  const rm = await p2.evaluate(() => {
    const c = document.querySelector('[class*="max-w-sm"]')
    const cs = getComputedStyle(c)
    return { transform: cs.transform, duration: cs.transitionDuration, opacity: cs.opacity }
  })
  check('reduced-motion quita el desplazamiento pero conserva la opacidad',
        rm.transform === 'none' && rm.opacity === '1' && rm.duration === '0.1s',
        `transform ${rm.transform} · ${rm.duration}`)
  await p.close(); await p2.close()
}

await browser.close()
stop()

if (fails.length) {
  console.log(`\n✗ ${fails.length} regla(s) de movimiento incumplidas`)
  process.exit(1)
}
console.log('\n✓ las reglas temporales se cumplen')
