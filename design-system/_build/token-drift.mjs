#!/usr/bin/env node
/**
 * THE TOKEN DRIFT AUDITOR — Design's instrument.
 *
 * Figma is the source of truth. Tokens get created, moved, renamed and deleted there
 * as the design changes, and until 2026-08-21 nothing noticed: `rename-map.json` spent
 * four days pointing at a namespace phase 1.2 had retired, and every downstream script
 * kept running green because a stale map and a correct one have the same shape.
 *
 * This closes that. It answers one question — **what changed between Figma and the
 * published package, and does anything still depend on what disappeared?**
 *
 *   node design-system/_build/token-drift.mjs [--json] [--dump path]
 *
 * Exit codes are the contract:
 *   0  clean, or drift that is fully accounted for by the ledger
 *   1  UNACCOUNTED: a published name vanished from Figma with live consumers and no
 *      alias and no tombstone. This is the one that breaks the app.
 *   2  PENDING: drift the ledger says needs a human decision. Not a failure — a queue.
 *
 * WHY THE NAME IS NOT IN A MAP ANY MORE
 * The published custom property is now a pure function of the Figma name:
 *   `--` + name, `/` -> `-`.  `bg/surface` -> `--bg-surface`.
 * A function cannot go stale. `token-ledger.json` holds only what a function cannot
 * know — what an old name BECAME, and what died — and it is appended at the moment a
 * rename is applied, by the session applying it. Never reconstructed afterwards; doing
 * that once cost a day and needed three separate derivations to get right.
 *
 * WHAT IT DOES NOT DO
 * It cannot fetch Figma. `figma-dump.json` is produced by stage 1 inside Figma's sandbox
 * (see `docs/handoff/design.md`). So this audits the dump, and reports the dump's age —
 * a green run against a three-week-old dump proves nothing, and says so out loud.
 */
import { readFileSync, existsSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join, extname } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const ROOT = join(HERE, '..', '..')
const args = process.argv.slice(2)
const AS_JSON = args.includes('--json')
const DUMP = args.includes('--dump') ? args[args.indexOf('--dump') + 1] : join(HERE, 'figma-dump.json')

const read = p => JSON.parse(readFileSync(p, 'utf8'))
const dump = read(DUMP)
const tokens = read(join(HERE, 'tokens.json'))
const ledger = existsSync(join(HERE, 'token-ledger.json')) ? read(join(HERE, 'token-ledger.json')) : { aliases: {}, tombstones: {}, pending: {} }

/** The rule. One line, deliberately. */
export const published = figmaName => '--' + figmaName.replaceAll('/', '-')

// ── what Figma says today ─────────────────────────────────────────────────────
const figma = new Map()
for (const v of dump.variables ?? []) {
  if (v.collection !== 'Semantic' && v.collection !== 'Component') continue
  figma.set(published(v.name), v)
}

// ── what the package publishes today ──────────────────────────────────────────
const pkg = new Map()
for (const [lightBlock, darkBlock] of [['sem_light', 'sem_dark'], ['cmp_light', 'cmp_dark']]) {
  for (const [k, v] of Object.entries(tokens[lightBlock] ?? {})) pkg.set(k, [v, tokens[darkBlock]?.[k]])
}
for (const [k, v] of Object.entries(tokens.num ?? {})) if (!pkg.has(k)) pkg.set(k, [v, v])
for (const [k, v] of Object.entries(tokens.dur ?? {})) if (!pkg.has(k)) pkg.set(k, [v, v])
for (const [k, v] of Object.entries(tokens.raw ?? {})) if (!pkg.has(k)) pkg.set(k, [v, v])
// The quarantine MUST be read. When it was added, these keys moved out of the blocks this map
// was built from and the auditor stopped seeing them — it reported 0 pending and exited clean
// while eight undecided names sat in the package. An instrument that goes green because it
// stopped looking is worse than one that is red.
for (const [k, v] of Object.entries(tokens.legacy_light ?? {}))
  if (!pkg.has(k)) pkg.set(k, [v, tokens.legacy_dark?.[k] ?? v])
// Aliases are emitted names too, but they are accounted for by construction — skip them here
// so they are not re-reported as drift against the targets they point at.
const ALIASED = new Set(Object.keys(tokens.alias ?? {}))
for (const k of ALIASED) if (!pkg.has(k)) pkg.set(k, ['(alias)', '(alias)'])

// ── who actually consumes a name ──────────────────────────────────────────────
// Counted where consumers really live, which is NOT only `src/`. Getting this wrong
// once turned "1 call site" into "132" in a report: the published package DEFINES these
// names in `tokens/tokens.css`, and counting a definition as a use inflates every number.
// So: `var(--x)` and quoted occurrences, in app source and in the generator, never in
// the generated output.
const CONSUMER_ROOTS = [
  { path: join(ROOT, 'src'), exts: ['.tsx', '.ts', '.jsx', '.js', '.css'] },
  { path: join(HERE, 'build.py'), exts: null },
]
const GENERATED = new Set(['tokens.css', 'tokens.map.css'])

function walk(p, exts, out = []) {
  if (!existsSync(p)) return out
  if (statSync(p).isFile()) { out.push(p); return out }
  for (const e of readdirSync(p)) {
    if (e === 'node_modules' || e === '.git') continue
    const f = join(p, e)
    if (statSync(f).isDirectory()) walk(f, exts, out)
    else if (!GENERATED.has(e) && (!exts || exts.includes(extname(e)))) out.push(f)
  }
  return out
}

const uses = new Map()
for (const { path, exts } of CONSUMER_ROOTS) {
  for (const f of walk(path, exts)) {
    const s = readFileSync(f, 'utf8')
    for (const re of [/var\(\s*(--[a-z0-9-]+)/g, /["'](--[a-z0-9-]+)["']/g]) {
      for (const m of s.matchAll(re)) {
        const k = m[1]
        if (!uses.has(k)) uses.set(k, [])
        uses.get(k).push(f.replace(ROOT + '/', ''))
      }
    }
  }
}
const useCount = k => (uses.get(k) ?? []).length
const useWhere = k => [...new Set(uses.get(k) ?? [])]

// ── classify ──────────────────────────────────────────────────────────────────
const R = { added: [], removed: [], changed: [], aliased: [], tombstoned: [], pending: [], unaccounted: [] }

for (const [k, v] of figma) {
  if (!pkg.has(k)) { R.added.push({ name: k, light: v.values.Light, dark: v.values.Dark }); continue }
  const [pl, pd] = pkg.get(k)
  if (pl === '(alias)') continue
  const fl = String(v.values.Light), fd = String(v.values.Dark)
  if (String(pl) !== fl || String(pd) !== fd) R.changed.push({ name: k, from: [pl, pd], to: [fl, fd] })
}

for (const k of pkg.keys()) {
  if (figma.has(k)) continue
  const n = useCount(k)
  if (ledger.aliases?.[k]) {
    const to = ledger.aliases[k].to
    // An alias is only an alias if its target exists. A ledger pointing at a name Figma
    // no longer has is the exact failure this file was written to stop, so it is checked.
    if (!figma.has(to)) R.unaccounted.push({ name: k, uses: n, where: useWhere(k), why: `alias target ${to} does not exist in Figma` })
    else R.aliased.push({ name: k, to, uses: n, via: ledger.aliases[k].via, retire: n === 0 })
  } else if (ledger.tombstones?.[k]) {
    if (n > 0) R.unaccounted.push({ name: k, uses: n, where: useWhere(k), why: 'tombstoned but still consumed' })
    else R.tombstoned.push({ name: k })
  } else if (ledger.pending?.[k]) {
    R.pending.push({ name: k, uses: n, where: useWhere(k), recommend: ledger.pending[k].recommend ?? null })
  } else {
    R.removed.push({ name: k, uses: n, where: useWhere(k) })
    if (n > 0) R.unaccounted.push({ name: k, uses: n, where: useWhere(k), why: 'gone from Figma, no ledger entry, still consumed' })
  }
}

const retirable = R.aliased.filter(a => a.retire)

if (AS_JSON) { console.log(JSON.stringify({ dumpDate: dump.exportedAt, ...R, retirable }, null, 1)); }
else {
  const age = dump.exportedAt ? Math.round((Date.now() - Date.parse(dump.exportedAt)) / 86400000) : null
  console.log(`dump ${DUMP.replace(ROOT + '/', '')} — exported ${dump.exportedAt ?? '?'}${age !== null ? ` (${age}d ago)` : ''}`)
  if (age !== null && age > 1) console.log(`  ⚠ this audit is only as fresh as the dump. Re-run stage 1 before trusting a green result.`)
  console.log(`figma ${figma.size} · published ${pkg.size}\n`)
  const block = (label, items, fmt) => {
    console.log(`${label}: ${items.length}`)
    for (const i of items.slice(0, 40)) console.log('  ' + fmt(i))
    if (items.length > 40) console.log(`  … ${items.length - 40} more (--json for all)`)
  }
  block('ADDED — in Figma, not published', R.added, i => `${i.name} = ${i.light} / ${i.dark}`)
  block('CHANGED — value disagreement', R.changed, i => `${i.name}: ${i.from[0]}|${i.from[1]} -> ${i.to[0]}|${i.to[1]}`)
  block('ALIASED — renamed, old name still emitted', R.aliased, i => `${i.name} -> ${i.to} (${i.uses} uses, ${i.via})`)
  block('RETIRABLE — alias at zero consumers, delete it', retirable, i => i.name)
  block('TOMBSTONED — deleted in Figma, nothing depends on it', R.tombstoned, i => i.name)
  block('PENDING — drift waiting on a decision', R.pending, i => `${i.name} (${i.uses} uses${i.recommend ? `, recommend: ${i.recommend}` : ''})`)
  block('UNACCOUNTED — this is the one that breaks the app', R.unaccounted, i => `${i.name} — ${i.why} [${i.where.join(', ')}]`)
}

if (R.unaccounted.length) process.exit(1)
if (R.pending.length) process.exit(2)
