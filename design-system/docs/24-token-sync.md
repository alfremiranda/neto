# 24 — Keeping the published tokens in sync with Figma

**Decided by Alfredo, 2026-08-21:** the published CSS follows Figma. Tokens are created,
moved, renamed and deleted in Figma as the design changes, so the package has to be able
to survive that — and, more importantly, to *notice* it.

This document is the contract. `13-rename-map.md` describes the old translating map and is
now history; it is kept because the failure it records is the reason this file exists.

---

## 1. The name is a function, not a table

    published custom property  =  "--" + figma variable name, with "/" replaced by "-"

    bg/surface              ->  --bg-surface
    chart/categorical/1     ->  --chart-categorical-1
    input/color/border/hover -> --input-color-border-hover

That is the whole rule and there are no exceptions. It replaces `rename-map.json`'s table
of 24 prefixes, which is not a stylistic change — **a function cannot go stale and a table
can.** The table did: it was authored on 08-19 against `color/surface/*`, `color/foreground/*`,
`color/income/*`; phase 1.2 renamed the Semantic collection to property-first a day later;
and for four days every script downstream kept running green, because a map that matches
nothing and a map that matches everything have the same shape. Measured the day it was
caught: **9 of 162 semantic tokens mapped, 153 unmapped, where a week earlier it had been
128 of 128 and zero.**

The cost of the rule is that a rename in Figma becomes a delete-and-add in CSS. That is
what §2 is for.

## 2. The ledger holds only what a function cannot know

`_build/token-ledger.json`. Three buckets, and nothing else belongs in it:

| bucket | means | emitted as |
|---|---|---|
| `aliases` | this old name became that new name | both names published; the old one points at the new |
| `tombstones` | this name died and nothing replaces it | not published at all |
| `pending` | this drift needs a decision no rule can make | not published; the audit exits 2 |

**An alias lives for one cycle and then dies.** The auditor reports every alias whose
consumer count has reached zero as RETIRABLE; retiring it is a deletion from the ledger,
not a migration. Today 75 of the 120 aliases are already retirable — they were published
names nothing ever consumed.

**The ledger is appended when the rename is applied, by the session that applies it.**
This is the rule that matters and it is the one that was missing. Reconstructing the
current 132 entries afterwards took a day and needed three separate derivations, because
the record of what became what only existed in Figma's history and in commit prose.

## 3. How an entry is derived — and how it is not

Every ledger entry carries `via`, saying how it was arrived at:

- **`provenance`** — invert the old prefix table to recover the old Figma name, then read
  `token-migration.json`, the record of what phase 1.2 actually applied. 81 of 132 came
  from here. This is a record, not an inference.
- **`scale`** — the numeric families. For a scale the number *is* the job (the argument in
  `A-2026-08-20-fav-star §3`), so family picks the target scale and value picks the rung:
  `--padding-md` = 16 → `--spacing-16`, `--size-icon-sm` = 16 → `--icon-size-md`. Both must
  agree or the entry goes to `pending`.
- **`logged`** — a second hop recorded in `coherence-log.md` after 1.2, where a 1.2 target
  was itself renamed later: `bg/popover` → `bg/anchored`, `bg/container` → `bg/chrome`.
- **`named`** — a written exception citing the decision that authorised it.

**Value matching is not a derivation and is not used.** It was tried first because it is
the obvious idea. It left **88 of 132 ambiguous** and produced confidently wrong uniques —
`--account-1-surface` → `--currency-usd-surface`, `--kpi-income-surface` →
`--currency-usd-surface`. Two tokens sharing a value today is **Rule 7**, not identity; an
account surface is not a currency chip any more than a favourite was a tax.

## 4. The generator

`node design-system/_build/emit-tokens.mjs [--check]` — replaces `apply-rename-map.mjs`, which now
fails loudly rather than quietly republishing the old namespace.

It writes `tokens.json` in blocks, and **the block is the unit**, because `build.py` appends one per
block. Semantic now carries lengths, durations and easing curves side by side, so they cannot share:

| block | holds | unit |
|---|---|---|
| `sem_light` / `sem_dark` · `cmp_light` / `cmp_dark` | colour | — |
| `num` | lengths | `px` |
| `dur` | `motion/duration/*` | `ms` — `150px` would be silent nonsense |
| `raw` | easing curves | — |
| `alias` | retired name → `var(new)` | — |
| `legacy_light` / `legacy_dark` | **quarantine** | — |

Three refusals, each with its own exit code, and none of them overridable by a general flag:

- **Unsigned value change (2).** Every disagreement between Figma and the package is signed
  individually in `token-ledger.json.acceptedValueChanges`, with a reason and a commit. A *new*
  disagreement still stops the write, so the accept step can never launder something nobody read.
- **Broken alias (1).** An alias whose target is not emitted.
- **Unfrozen pending name (4).** See quarantine below.

### Quarantine is not amnesty

A `pending` name has no Figma source *and* no replacement. Dropping it breaks live consumers;
inventing a target is the value-matching §3 refuses. So its current value is **frozen in the
ledger** and emitted under a block that says what it is. Nothing moves a pixel, the auditor keeps
reporting it as undecided, and the block can only shrink.

The frozen value lives in the ledger and never in `tokens.json`. The first version read it from
`tokens.json` — which this script also *writes* — so the second run found the key already gone and
froze nothing. A value that has to survive a transform cannot live in the thing being transformed.

## 5. The auditor

`node design-system/_build/token-drift.mjs [--json]`

It answers one question: *what changed between Figma and the published package, and does
anything still depend on what disappeared?* Output is ADDED · CHANGED · ALIASED · RETIRABLE
· TOMBSTONED · PENDING · UNACCOUNTED, and the exit code is the contract:

| exit | meaning |
|---|---|
| 0 | clean, or drift fully accounted for by the ledger |
| 1 | **UNACCOUNTED** — a published name vanished from Figma, still has consumers, and has no alias and no tombstone. This is the one that breaks the app |
| 2 | PENDING — drift the ledger says needs a human decision. A queue, not a failure |

Three ways to be unaccounted, all three negative-tested on 2026-08-21 by breaking them on
purpose and confirming the run fails, then confirming a restored ledger goes back:

1. a live name with no ledger entry at all,
2. an alias pointing at a target Figma no longer has — *the exact failure that produced this
   document*, so it is checked explicitly rather than assumed away,
3. a tombstone that something still consumes.

### Counting consumers is where this gets measured wrong

A published name is *defined* in `tokens/tokens.css` and *consumed* somewhere else.
Counting the definition as a use turns "one call site" into "one hundred and thirty-two" —
that mistake was made and published in a report on 2026-08-21 before it was caught. So the
auditor counts `var(--x)` in app source and in `build.py` (the hand-written shadcn bridge),
and never in generated output. Today: **1 consumer in `src/`, 53 in `build.py`, and 61 of
the 132 broken names consumed by nothing at all.**

### What it cannot do

`assemble-dump.py` is a pure transform: run it twice on the same chunks and you get the same
bytes. That is not a nicety — a committed artefact you cannot re-derive and diff is one you have
to take on trust. `exportedAt` therefore comes from `meta.json`, recorded by the run that actually
read Figma, not from the clock at assembly time. It was the clock for one commit, and re-running
the assembler produced a diff for no reason but the hour.

It cannot reach Figma. `figma-dump.json` is produced by stage 1 *inside* Figma's sandbox
(`docs/handoff/design.md` has the procedure). So the auditor prints the dump's date and its
age, and warns when it is more than a day old, because **a green run against a stale dump
proves nothing** — which is precisely how the last four days passed without anyone noticing.

## 6. When it runs

**At the start of every design session, before touching anything.** Alfredo's call,
2026-08-21. Stage 1, then the auditor, then work. The reasoning: that is the moment the
file is freshest, and the moment the person reading the diff is the one who can explain it,
because they either just caused it or are about to.

CI cannot do this half — it has no Figma access. What CI does own is the repo half
(`validate-repo.mjs`, `R1`–`R4`), including `R2`: the package is reproducible from
`tokens.json`. Between them the loop is closed: `R2` proves the package matches the tokens,
the auditor proves the tokens match Figma, and neither one alone is a claim about the other.

## 7. Order of operations for a rename, from now on

1. Rename it in Figma.
2. Append the alias to `token-ledger.json` **in the same session**, with `via` and a reason.
3. Run `token-drift.mjs`. Expect the old name under ALIASED, not UNACCOUNTED.
4. Dev regenerates; both names resolve, nothing breaks.
5. When the auditor lists the alias as RETIRABLE, delete it.
