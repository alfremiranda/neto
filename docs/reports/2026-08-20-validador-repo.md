# 2026-08-20 — The repo-side validator (`c616901e`)

Written late, in answer to `Q-2026-08-20-reporte-faltante`. The orchestrator is right: the work
shipped and the report did not, so the one number in it that needs an owner — `R4` — has been
sitting at 49 with nobody named against it. That is what this file fixes.

DID:
- Built `design-system/_build/validate-repo.mjs`: the **repo half** of `20-roadmap §0.4`, four
  checks, plus `.github/workflows/design-system.yml` to run them on every push touching `src/**`
  or `design-system/**`.
- Negative-tested all four: broke each one on purpose, confirmed it fails with a message that
  names the fix, and confirmed the restored tree goes green again.
- Fixed the one violation `R1` found and verified it in a browser, in both themes.
- Appended a **Repo side** section to `_build/coherence-log.md`.

| | forbids | today |
|---|---|---|
| `R1` | raw hex in `src/**/*.tsx` — the repo mirror of `C1` | 0 / 92 files |
| `R2` | `design-system/tokens/` not reproducible from `tokens.json` | ✅ reproducible |
| `R3` | a `var(--x)` in `tokens.map.css` that `tokens.css` does not define | 0 / 83 refs |
| `R4` | the count of literal colours in `src/index.css` **rising** | 49, ratcheted |

## DECISIONS

**The Figma half is not running, and the tooling says so out loud.** `T*`/`C*` need the Plugin
API. The workflow header and the validator's own stdout both state it on every run, so nobody
reading a green check can conclude the Figma audit passed. That is `§0.4`'s own argument, not an
apology for a gap.

**The brand-mark exemption is structural, not an allowlist.** `16-marks.md` asked for it to
"live in the validator and not in anyone's memory". A hex is exempt when it is a `fill=`/`stroke=`
attribute inside SVG; anything in a `className` is ours. LoginScreen's four Google fills pass and
a hex in a `className` fails — verified both directions. **Known limit:** a future mark arriving
as a CSS custom property or an imported asset with inline style would not be covered. Design has
been told rather than left to discover it.

**It does not gate the deploy.** `deploy.yml`'s gates already froze production for seven commits
once, silently, on an advisory nobody introduced. Design-system drift is a real defect; it is not
a reason to stop shipping a bug fix to Alfredo's phone. Reversible in two lines if the call
changes.

**`R4` is a ratchet, not a gate** — see NEEDS, which is the part this report exists to write down.

## FOUND — `R1`'s first run caught a dark-mode bug, not a style preference

`EgresosCard`'s "Programado" badge hard-coded `#fdba74`. That is
`--badge-warning-border`'s **light** value; the dark value is `#d97706`. So that border had been
staying light amber on dark backgrounds. Nobody had reported it.

Verified in the browser after the fix, on the exact className, in both themes:
`rgb(253,186,116)` light → `rgb(217,119,6)` dark. This is the argument for `R1` in one line: the
violation was invisible as a style question and visible as a defect.

## FOUND — Design swept my uncommitted validator into their commit

`validate-repo.mjs` and `validate-baseline.json` landed in Design's `599d29ff`, not mine, because
`git add -A` caught them while they were still uncommitted here. Verified byte-identical to what
was written, so nothing was captured half-finished. It is the exact mirror of this repo's own
rule — unpushed work does not exist — and it cost a `HEAD.lock` collision to notice. That
collision is now documented as normal in protocol v3.5.1, not as a crash artifact.

## NEEDS

**`R4`: 49 literal colours in `src/index.css`. Owner: Dev. Not scheduled yet, and deliberately.**

They are app-owned variables still carrying values that `tokens.css` now also holds. They cannot
be migrated safely **before Phase 2**: the exporter has never run, phases 1.2–1.4 renamed 138
semantic tokens to 121 on 2026-08-20, and `token-migration.json` says in writing not to migrate
by hand or the reconciliation happens twice.

So the schedule is a dependency, not a date:

1. **Phase 2 — run the exporter.** Now unblocked: all three decisions in
   `A-2026-08-18-exporter-drift` are made, and Design fixed the fav star in Figma so that diff
   should vanish on a fresh dump rather than need an exception.
2. **`TASK-2026-08-20-migracion-de-tokens`** — before `TASK-2026-08-19-extraer-badges`, confirmed
   by the orchestrator. Extracting first is extracting against dead names.
3. **Then `R4`.** Most of those 49 stop being literals as a side effect of the migration, since
   the whole point of the new `bg/`·`fg/`·`border/`·`shadow/` prefixes is that a token exists for
   each. Target after the migration pass: report the new number here and re-baseline. It should
   fall a lot; if it does not, that is itself the finding.

**Proposed `R5`, and it is the cheapest check left.** `token-migration.json` puts the property in
the name, so `--fg-*` in a `border-color`, or `--bg-*` in a `color`, becomes lint-detectable. The
same check in Figma just found three real leaks that had been invisible for months
(`border/default` used as a fill 88 times). It cannot be written until the migration lands — the
names it depends on do not exist in the repo yet — but it is the highest-value check on the board
and this is the note that stops it from being forgotten.

**`C6` for the Figma side** is Design's proposal, not mine, and I have no opinion to add beyond
that its one true positive was a description contradicting its own binding for weeks.
