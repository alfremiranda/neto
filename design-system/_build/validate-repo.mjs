#!/usr/bin/env node
/**
 * REPO-SIDE half of the design-system validator.
 *
 * `20-roadmap.md §0.4` splits enforcement honestly: the `T*`/`C*` checks need the Figma
 * Plugin API and CANNOT run in CI. These three can, and only these three. Claiming CI
 * runs the Figma audit would be governance theatre — so this file does not pretend to.
 *
 *   R1  no raw hex in component code (the repo mirror of Figma's C1)
 *   R2  design-system/tokens/ is reproducible from _build/tokens.json
 *   R3  every var(--x) in tokens.map.css resolves to a token that exists
 *
 * Plus one ratchet, R4, which reports rather than forbids: the count of hard-coded
 * colours still defined in src/index.css. Those are the pre-token surface; the migration
 * is real work, so the gate only forbids the number going UP.
 *
 *   node design-system/_build/validate-repo.mjs [--update-baseline]
 */
import { readFileSync, writeFileSync, readdirSync, statSync, rmSync, existsSync } from 'node:fs'
import { execFileSync } from 'node:child_process'
import { join, dirname, relative } from 'node:path'
import { fileURLToPath } from 'node:url'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const BASELINE = join(HERE, 'validate-baseline.json')
const TMP = join(process.env.TMPDIR || '/tmp', `ds-verify-${process.pid}`)

const walk = d => readdirSync(d, { withFileTypes: true })
  .flatMap(e => e.isDirectory() ? walk(join(d, e.name)) : [join(d, e.name)])

const failures = []
const notes = []
const fail = (check, msg) => failures.push(`${check}  ${msg}`)

// ── R1 · no raw hex in component code ────────────────────────────────────────
// A hex inside a brand mark's SVG is not a violation. Google's brand guidelines
// forbid recolouring their logotype, so writing those fills as raw hexes is the only
// way to say "do not touch this" (16-marks.md). That exemption belongs here, in the
// validator, and not in anyone's memory — which is exactly what 16-marks.md asks for.
// The rule is structural, not an allowlist of files: a hex is exempt when it is a
// `fill=`/`stroke=` attribute inside an SVG. Anything in a className is ours.
const HEX = /#[0-9a-fA-F]{3,8}\b/
function scanHex(file, src) {
  const hits = []
  src.split('\n').forEach((line, i) => {
    if (!HEX.test(line)) return
    const inMark = /(fill|stroke)=["']#[0-9a-fA-F]{3,8}["']/.test(line)
    if (inMark) return
    for (const m of line.matchAll(/#[0-9a-fA-F]{3,8}\b/g)) {
      hits.push({ line: i + 1, hex: m[0], text: line.trim().slice(0, 90) })
    }
  })
  return hits.map(h => `${relative(ROOT, file)}:${h.line}  ${h.hex}  ${h.text}`)
}

const componentFiles = walk(join(ROOT, 'src')).filter(f => /\.(tsx|ts)$/.test(f))
const r1 = componentFiles.flatMap(f => scanHex(f, readFileSync(f, 'utf8')))
r1.forEach(v => fail('R1', v))
notes.push(`R1  ${componentFiles.length} archivos de componente · ${r1.length} hex crudos`)

// ── R2 · design-system/ reproducible from tokens.json ────────────────────────
// The system declares design-system/ a generated artefact. If a hand edit can survive
// in it, that declaration is a comment rather than a fact.
try {
  rmSync(TMP, { recursive: true, force: true })
  execFileSync('python3', [join(HERE, 'build.py')], {
    env: { ...process.env, DS_OUT: TMP }, stdio: 'pipe',
  })
  for (const f of ['tokens.css', 'tokens.map.css']) {
    const committed = join(ROOT, 'design-system', 'tokens', f)
    const rebuilt = join(TMP, 'tokens', f)
    if (!existsSync(rebuilt)) { fail('R2', `build.py no produjo ${f}`); continue }
    if (readFileSync(committed, 'utf8') !== readFileSync(rebuilt, 'utf8')) {
      fail('R2', `${f} no se reproduce desde tokens.json — o fue editado a mano, o build.py cambió sin republicar`)
    }
  }
  notes.push('R2  build.py corrió y se comparó tokens.css + tokens.map.css')
} catch (e) {
  fail('R2', `build.py falló: ${String(e.message).split('\n').slice(-3).join(' ').trim()}`)
} finally {
  rmSync(TMP, { recursive: true, force: true })
}

// ── R3 · every var(--x) in tokens.map.css resolves ───────────────────────────
// tokens_map_css() emits var(--x) verbatim, so a dangling reference is valid CSS
// pointing at nothing: no error, just an uncoloured element weeks later.
const tokensCss = readFileSync(join(ROOT, 'design-system/tokens/tokens.css'), 'utf8')
const mapCss = readFileSync(join(ROOT, 'design-system/tokens/tokens.map.css'), 'utf8')
const defined = new Set([...tokensCss.matchAll(/^\s*(--[a-z0-9-]+)\s*:/gim)].map(m => m[1]))
const referenced = new Set([...mapCss.matchAll(/var\((--[a-z0-9-]+)\)/g)].map(m => m[1]))
for (const r of [...referenced].sort()) {
  if (!defined.has(r)) fail('R3', `tokens.map.css apunta a var(${r}), que tokens.css no define`)
}
notes.push(`R3  ${referenced.size} referencias contra ${defined.size} tokens definidos`)

// ── R4 · ratchet on the pre-token surface in index.css ───────────────────────
// These are app-owned variables still carrying literal values that tokens.css now also
// holds. Migrating them is real work with real review; forbidding them today would just
// mean disabling the check. So the gate only refuses to let the number grow.
const indexCss = readFileSync(join(ROOT, 'src/index.css'), 'utf8')
const rawInIndex = [...indexCss.matchAll(/^\s*--[a-z0-9-]+\s*:\s*#[0-9a-fA-F]{3,8}\s*;/gim)].length
const baseline = existsSync(BASELINE) ? JSON.parse(readFileSync(BASELINE, 'utf8')) : {}
if (process.argv.includes('--update-baseline')) {
  writeFileSync(BASELINE, JSON.stringify({ ...baseline, indexCssRawColors: rawInIndex }, null, 2) + '\n')
  console.log(`baseline actualizado: indexCssRawColors = ${rawInIndex}`)
} else if (typeof baseline.indexCssRawColors === 'number') {
  if (rawInIndex > baseline.indexCssRawColors) {
    fail('R4', `src/index.css subió de ${baseline.indexCssRawColors} a ${rawInIndex} colores literales. `
      + 'La deuda solo puede bajar; usa un token de design-system/tokens/tokens.css.')
  } else if (rawInIndex < baseline.indexCssRawColors) {
    notes.push(`R4  ✅ bajó de ${baseline.indexCssRawColors} a ${rawInIndex} — corre --update-baseline para fijarlo`)
  } else {
    notes.push(`R4  ${rawInIndex} colores literales en index.css (sin cambio)`)
  }
}

// ── report ───────────────────────────────────────────────────────────────────
console.log('design-system · validador del lado del repo')
console.log('(la mitad de Figma —T*/C*— necesita el Plugin API y no corre aquí; ver 20-roadmap §0.4)\n')
notes.forEach(n => console.log('  ' + n))
if (failures.length) {
  console.log(`\n✗ ${failures.length} fallo(s):\n`)
  failures.forEach(f => console.log('  ' + f))
  process.exit(1)
}
console.log('\n✓ sin fallos')
