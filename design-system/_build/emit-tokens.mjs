#!/usr/bin/env node
/**
 * STAGE 2 — turns the Figma dump into `tokens.json`. Replaces `apply-rename-map.mjs`.
 *
 *   node design-system/_build/emit-tokens.mjs [--check] [--dump path]
 *
 * The old script translated Figma names into published names through a 24-prefix table in
 * `rename-map.json`. That table went stale the day phase 1.2 renamed the Semantic collection
 * and nobody could tell, because a table that matches nothing and a table that matches
 * everything both run green. Alfredo's call on 2026-08-21: the published CSS follows Figma.
 *
 *   published custom property = "--" + figma variable name, "/" -> "-"
 *
 * That is the whole naming rule and it cannot go stale. `token-ledger.json` holds the only
 * things a rule cannot know — what an old name BECAME, what died, and what still needs a
 * human — and this script reads it rather than inventing anything.
 *
 * BLOCKS, and why there are more of them than before
 * `build.py` appends a unit per block, so the block IS the unit. Semantic now carries lengths,
 * durations and easing curves side by side, and they cannot share one:
 *
 *   sem_light/sem_dark   Semantic COLOR         no unit
 *   cmp_light/cmp_dark   Component COLOR        no unit
 *   num                  FLOAT lengths          px
 *   dur                  motion/duration/*      ms   <- 150px would be silent nonsense
 *   raw                  STRING (easing curves) no unit
 *   alias                old name -> var(new)   no unit
 *   text                 carried over untouched
 *
 * ALIASES are what make this landable in one commit. Every retired name is still emitted,
 * pointing at its replacement, so `build.py`'s shadcn bridge and `src/` keep resolving while
 * Dev migrates. `token-drift.mjs` reports each alias's consumer count; at zero it is RETIRABLE
 * and deleting it is a one-line edit to the ledger.
 *
 * VALUE CHANGES are signed individually in `token-ledger.json.acceptedValueChanges`. A change
 * that is not on that list stops the write even with --accept-changes, so the flag can never
 * launder a disagreement nobody looked at.
 */
import { readFileSync, writeFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'

const HERE = dirname(fileURLToPath(import.meta.url))
const args = process.argv.slice(2)
const CHECK = args.includes('--check')
const DUMP = args.includes('--dump') ? args[args.indexOf('--dump') + 1] : join(HERE, 'figma-dump.json')

const read = p => JSON.parse(readFileSync(p, 'utf8'))
const dump = read(DUMP)
const ledger = read(join(HERE, 'token-ledger.json'))
const current = read(join(HERE, 'tokens.json'))

const published = n => '--' + n.replaceAll('/', '-')
const TOMB = new Set(Object.keys(ledger.tombstones ?? {}))
const PENDING = new Set(Object.keys(ledger.pending ?? {}))
const ACCEPTED = ledger.acceptedValueChanges ?? {}

const out = { sem_light: {}, sem_dark: {}, cmp_light: {}, cmp_dark: {}, num: {}, dur: {}, raw: {},
              alias: {}, legacy_light: {}, legacy_dark: {} }

for (const v of dump.variables) {
  if (v.collection !== 'Semantic' && v.collection !== 'Component') continue
  const key = published(v.name)
  if (TOMB.has(key) || PENDING.has(key)) continue

  if (v.type === 'COLOR') {
    const [L, D] = v.collection === 'Semantic' ? ['sem_light', 'sem_dark'] : ['cmp_light', 'cmp_dark']
    out[L][key] = v.values.Light
    out[D][key] = v.values.Dark
  } else if (v.type === 'FLOAT') {
    // A duration in a px block is not a rounding error, it is a different quantity.
    ;(v.name.startsWith('motion/duration/') ? out.dur : out.num)[key] = v.values.Light
  } else {
    out.raw[key] = v.values.Light
  }
}

// QUARANTINE, not amnesty. A `pending` name has no Figma source and no replacement yet, so
// dropping it would break whatever still consumes it and inventing a target would be the
// value-matching this system refuses. Instead its CURRENT published value is frozen verbatim
// and emitted under a block that says what it is. Nothing moves a pixel; the auditor still
// reports these as needing a decision; and the count only ever goes down.
//
// Today: the eight --account-{1..4}-* keys, which named four of Alfredo's own accounts. They
// die the moment Dev repoints build.py's bridge at the runtime accent (docs/25-account-color.md).
// The frozen value comes from the LEDGER, never from tokens.json. This script reads
// tokens.json as its baseline and then overwrites it, so sourcing the quarantine from
// there means the second run finds the key already gone and silently freezes nothing.
// Idempotence is not a nicety here: it is the difference between a re-runnable build and
// one that is only correct the first time anybody happens to run it.
const unfrozen = []
for (const key of PENDING) {
  const f = ledger.pending[key]?.frozen
  if (!f || f.light == null) { unfrozen.push(key); continue }
  out.legacy_light[key] = f.light
  out.legacy_dark[key] = f.dark ?? f.light
}

// Aliases resolve through var(), so one declaration covers both modes.
const liveKeys = new Set([...Object.keys(out.sem_light), ...Object.keys(out.cmp_light),
                          ...Object.keys(out.num), ...Object.keys(out.dur), ...Object.keys(out.raw),
                          ...Object.keys(out.legacy_light)])
const brokenAliases = []
for (const [old, entry] of Object.entries(ledger.aliases ?? {})) {
  if (!liveKeys.has(entry.to)) { brokenAliases.push(`${old} -> ${entry.to}`); continue }
  out.alias[old] = `var(${entry.to})`
}

// ── report ────────────────────────────────────────────────────────────────────
const flat = o => Object.fromEntries(Object.entries(o).flatMap(([b, kv]) =>
  b.endsWith('_dark') ? [] : Object.entries(kv)))
const now = flat({ sem_light: current.sem_light ?? {}, cmp_light: current.cmp_light ?? {}, num: current.num ?? {} })
const next = flat(out)
const added = Object.keys(next).filter(k => !(k in now))
const removed = Object.keys(now).filter(k => !(k in next))
const changed = Object.keys(next).filter(k => k in now && String(now[k]) !== String(next[k]) && !String(next[k]).startsWith('var('))
const unsigned = changed.filter(k => !(k in ACCEPTED))

const line = (label, items, fmt = x => x) => {
  console.log(`${label}: ${items.length}`)
  for (const i of items.slice(0, 25)) console.log('  ' + fmt(i))
  if (items.length > 25) console.log(`  … ${items.length - 25} more`)
}
console.log(`dump ${dump.exportedAt} · ${dump.variables.length} variables`)
console.log(`emitting: ${Object.keys(out.sem_light).length} semantic · ${Object.keys(out.cmp_light).length} component · ` +
            `${Object.keys(out.num).length} num · ${Object.keys(out.dur).length} dur · ${Object.keys(out.raw).length} raw · ` +
            `${Object.keys(out.alias).length} alias · ${Object.keys(out.legacy_light).length} quarantined\n`)
// Classify what disappears BY REASON. The earlier version counted "skipped" only for names
// Figma still has, which reported 0 while twelve published properties vanished — a number
// that reads as "nothing was dropped" and is worse than no number.
const why = k => TOMB.has(k) ? 'tombstone' : PENDING.has(k) ? 'quarantined — value frozen, decision pending' : 'UNEXPLAINED'
const unexplained = removed.filter(k => why(k) === 'UNEXPLAINED')
line('ADDED', added)
line('REMOVED — no longer emitted, by reason', removed, k => `${k}  (${why(k)})`)
line('CHANGED', changed, k => `${k}: ${now[k]} -> ${next[k]}  — ${ACCEPTED[k] ?? 'UNSIGNED'}`)
line('BROKEN ALIASES (target not emitted)', brokenAliases)

if (unexplained.length) {
  console.error(`\nRefusing to write: ${unexplained.length} published name(s) disappear with no ledger ` +
                `entry:\n  ${unexplained.join('\n  ')}`)
  process.exit(3)
}

if (unfrozen.length) {
  console.error(`\nRefusing to write: ${unfrozen.length} pending name(s) have no frozen value in the ` +
                `ledger, so emitting would drop them:\n  ${unfrozen.join('\n  ')}`)
  process.exit(4)
}
if (brokenAliases.length) { console.error('\nRefusing: an alias points at a token that is not emitted.'); process.exit(1) }
if (unsigned.length) {
  console.error(`\nRefusing to write: ${unsigned.length} value change(s) are not signed in ` +
                `token-ledger.json.acceptedValueChanges:\n  ${unsigned.join('\n  ')}\n` +
                `Each is a design decision. Sign it there, with a reason, then re-run.`)
  process.exit(2)
}
if (CHECK) { console.log('\n--check: nothing written.'); process.exit(0) }

writeFileSync(join(HERE, 'tokens.json'), JSON.stringify({ ...out, text: current.text }, null, 1) + '\n')
console.log('\nwrote tokens.json')
