# 2026-08-17 — Token drift, measured (queue items 2 and 3)

Report written first, per v3.4. **Nothing under `design-system/tokens/` was regenerated — see
WHY NOT.** This session only read Figma and diffed; the only files it writes are this report and
one `Q-`.

DID:
- Re-read every COLOR variable of the Semantic and Component collections out of Figma (214 of
  them) with a **mode-aware** alias resolver, and diffed the result against
  `design-system/_build/tokens.json`, which is the input `build.py` consumes.
- Re-ran the broken-alias check over all 720 variables: **0 broken aliases**, confirming the
  `currency/*` repair.

## FOUND — item 2's premise is false

The queue says the four `currency/*` tokens "are right in Figma but the generated CSS still
publishes the old values." Measured in both modes:

| token | repo (light / dark) | Figma (light / dark) |
|---|---|---|
| `currency/usd/surface` | `#ecfeff` / `#083344` | `#ecfeff` / `#083344` |
| `currency/usd/foreground` | `#0e7490` / `#67e8f9` | `#0e7490` / `#67e8f9` |
| `currency/cop/surface` | `#ecfdf5` / `#022c22` | `#ecfdf5` / `#022c22` |
| `currency/cop/foreground` | `#047857` / `#6ee7b7` | `#047857` / `#6ee7b7` |

All four are identical. **There is nothing to regenerate for currency.** The repair aliased the
primitives that `account/1..4` had been resolving to, so it preserved the exact pixel — which is
what the handoff itself said it did ("conservando el píxel exacto"). The two statements in the
handoff contradict each other and the measurement settles it.

## FOUND — item 3's premise is also false: `kpi/*` does exist in Figma

It is named `color/{income,expense,provision,tax,net}/{default,surface,foreground}` in the
**Semantic** collection. All 15 pairs match in both modes, exactly.

The `--kpi-` prefix is invented by the Figma → `tokens.json` export step, not by Figma. It is the
same class of rename as `color/wrap/default → --surface-wrap-default`,
`color/categorical/N → --data-categorical-N`, `color/danger/* → --status-danger-*` and
`color/feedback/* → --surface-feedback-*`. So this is **naming drift in the export map, not a
phantom token family**, and the `currency/*` analogy in the queue does not hold.

## FOUND — what actually is stale

**1. Two component values diverge.** Same name on both sides, so no rename ambiguity:

| key | repo | Figma |
|---|---|---|
| `--sidebar-surface` | `rgba(255,255,255,0.5)` / `#1e293b` | `#ffffff` / `#1e293b` |
| `--fav-selected-foreground` | `#b45309` / `#fde68a` | `#f59e0b` / `#fde68a` |

Both differ in **light only**. `--sidebar-surface` is the translucent-vs-solid sidebar that the
hub has had open since 02-ago: Figma now says solid. Under the SSOT rule the repo is the bug —
but "sidebar translúcido vs sólido" is listed as Alfredo's open decision, so it goes in the `Q-`
rather than getting applied here.

**2. 15 Component variables exist in Figma that the package never publishes:** the eight
`account-chart/*`, `account-summary-card/icon/foreground`, and the six `breadcrumb/*`. These are
the components built after the 02-ago export. Anything implementing them today has no token to
read.

**3. 16 Semantic variables likewise unpublished**, 13 of which are the whole `color/overlay/*`
family (brand, danger, disabled, focus, frosted, hover, info, pressed, scrim, scrim-heavy,
selected, skeleton, success, warning), plus `color/account/border`, `color/border/strong` and
`color/foreground/danger-inverse`.

**4. `--account-{1..4}-{surface,foreground}` — 8 keys with no source in Figma.** `build.py`
lines 109–112 still map them to `--color-account-{arq,toptal,bancol,other}-{bg,txt}`: hardcoded
account identities from before account colour became a user choice. Only `--account-2-surface`
(`#f5f3ff` / `#4c1d95`) has a value pair that exists nowhere in Figma; **the other seven collide
by value with surviving tokens, which is precisely why nobody noticed.** Five generated previews
under `design-system/components/` still paint chips with them.

## WHY NOT regenerated

`build.py` reads `design-system/_build/tokens.json`. It does not read Figma. **The step that
produces `tokens.json` from Figma — including the rename map that turns `color/income/default`
into `--kpi-income-default` — does not exist in this repo.**

Without it, "regenerate" means hand-editing the generated input, which `_build/README.md`
forbids ("Do not edit generated output... If a value is wrong, it is wrong in Figma") and which
`00-principios.md §A1` forbids ("Nadie edita el paquete generado a mano. Si hay que tocarlo, se
toca el generador"). Naming the 31 unpublished variables would be guessing at the exporter's
convention, not reproducing it.

**That missing exporter is the root cause of every drift above**, and it makes the claim
"`design-system/` is a generated artifact" false today: nobody can reproduce it. See the `Q-`.

## NOTE ON METHOD — I got this wrong once first

My first resolver followed aliases by mode **index**. Component modes are `light`/`dark`;
Semantic's are `Light`/`Dark`; when a Component token aliases a Semantic one, the target mode id
does not exist there, and the fallback took the target's *first* mode. Every Component→Semantic
alias therefore resolved to Semantic **Light in both modes**, and the diff came back with 21
confident dark-mode "divergences" — every badge, both notifications, the switch, the ghost
button. All false.

The second resolver matches modes by name and reports any hop it cannot match; it returned 0
warnings. This is exactly the failure described in `00-principios.md §A6` — an instrument used
outside its range, with a plausible-looking result — and it is the reason the numbers above are
stated as measurements with the method attached.
