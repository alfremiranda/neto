#!/usr/bin/env node
/**
 * STAGE 2 of the exporter — runs locally, no Figma access needed.
 *
 * Takes the verbatim dump from `figma-dump.js`, applies `rename-map.json`, and writes
 * the four colour blocks of `_build/tokens.json`. `num` and `text` are carried over
 * untouched: the map does not cover them yet (`13-rename-map.md §not_covered_yet`), and
 * inventing rules for them here would be the exact failure the map exists to prevent.
 *
 * The map is READ, never derived. If this script ever inferred names from the tokens.json
 * that already exists, it would canonise today's drift as the specification — the whole
 * reason Design authored the map by hand instead of generating it.
 *
 *   node design-system/_build/apply-rename-map.mjs [--dump path] [--check]
 *
 * --check compares against the committed tokens.json and reports the drift without
 * writing, which is what you want the first time and on every review afterwards.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const DUMP = args.includes('--dump') ? args[args.indexOf('--dump') + 1] : join(HERE, 'figma-dump.json')

const map = JSON.parse(readFileSync(join(HERE, 'rename-map.json'), 'utf8'))
const dump = JSON.parse(readFileSync(DUMP, 'utf8'))
const current = JSON.parse(readFileSync(join(HERE, 'tokens.json'), 'utf8'))

const KILLED = new Set(map.killed.keys)

/** Semantic: first matching prefix wins; the remainder is slugged and appended. */
function semanticKey(figmaName) {
  for (const [prefix, published] of map.semantic.prefixes) {
    if (figmaName.startsWith(prefix)) {
      return published + figmaName.slice(prefix.length).replace(/\//g, '-')
    }
  }
  return null
}

/** Component: one slug rule for the whole collection. */
function componentKey(figmaName) {
  return '--' + figmaName.replace(/\//g, '-')
}

const out = { sem_light: {}, sem_dark: {}, cmp_light: {}, cmp_dark: {} }
const unmapped = []

for (const chunk of dump.chunks) {
  const isSemantic = chunk.collection === 'Semantic'
  const [lightBlock, darkBlock] = isSemantic
    ? ['sem_light', 'sem_dark']
    : ['cmp_light', 'cmp_dark']

  for (const [name, light, dark] of chunk.rows) {
    const key = isSemantic ? semanticKey(name) : componentKey(name)
    if (!key) { unmapped.push(`${chunk.collection}: ${name}`); continue }
    if (KILLED.has(key)) continue          // §4 — killed, never republished
    out[lightBlock][key] = light
    out[darkBlock][key] = dark
  }
}

// ── report ────────────────────────────────────────────────────────────────────
const report = { added: [], removed: [], changed: [], unmapped }
for (const block of ['sem_light', 'sem_dark', 'cmp_light', 'cmp_dark']) {
  const now = current[block] || {}
  for (const k of Object.keys(out[block])) {
    if (!(k in now)) report.added.push(`${block} ${k} = ${out[block][k]}`)
    else if (now[k] !== out[block][k]) report.changed.push(`${block} ${k}: ${now[k]} -> ${out[block][k]}`)
  }
  for (const k of Object.keys(now)) {
    if (!(k in out[block])) report.removed.push(`${block} ${k} = ${now[k]}`)
  }
}

const line = (label, items) => {
  console.log(`${label}: ${items.length}`)
  for (const i of items) console.log(`  ${i}`)
}
console.log(`dump: ${DUMP}`)
console.log(`mapped: ${Object.keys(out.sem_light).length} semantic · ${Object.keys(out.cmp_light).length} component`)
line('ADDED (in Figma, not published today)', report.added)
line('REMOVED (published today, no Figma source)', report.removed)
line('CHANGED (value disagreement)', report.changed)
line('UNMAPPED (no rule matched — a map gap, fix the map not this script)', report.unmapped)

if (CHECK) {
  console.log('\n--check: nothing written.')
  process.exit(report.unmapped.length ? 1 : 0)
}

// A CHANGED entry is a value Figma and the published output disagree on. Writing it
// silently is how an exporter launders a design decision into a diff nobody reviewed —
// and at least one of them is load-bearing (the favourite star's contrast). Adopting
// them is fine; doing it without saying so is not.
if (report.changed.length && !args.includes('--accept-changes')) {
  console.error(
    `\nRefusing to write: ${report.changed.length} value disagreement(s) above.\n` +
    `Each is a decision. Re-run with --accept-changes once they are decided.`,
  )
  process.exit(2)
}

// num and text are carried over verbatim — the map does not cover them yet.
writeFileSync(
  join(HERE, 'tokens.json'),
  JSON.stringify({ ...out, num: current.num, text: current.text }, null, 1) + '\n',
)
console.log('\nwrote tokens.json (num and text carried over untouched)')
