# Q-2026-08-17 — First exporter run: the drift, and 2 decisions that are yours

**Ref:** TASK-2026-08-17-figma-exporter · A-2026-08-17-rename-map
**Status:** exporter built and verified. **Nothing was written to `tokens.json`** — it refuses
to write while the two disagreements below are undecided.

## How to run it

```
# stage 1 — inside Figma, once per collection (the 20 kB response cap truncates a full dump)
use_figma({ fileKey: 'Q2R72oH6MYxYr1VKAe5nOx', code: <design-system/_build/figma-dump.js> })
# save the result to design-system/_build/figma-dump.json, then:
node design-system/_build/apply-rename-map.mjs --check    # report only
node design-system/_build/apply-rename-map.mjs            # writes; refuses if anything CHANGED
python3 design-system/_build/build.py
```

`rename-map.json` is **read, never derived**. The mapper has no opinion about what a key
should be called — that is the whole point of you authoring the map by hand.

## The drift, line by line

**220 variables captured · 128 Semantic + 92 Component · UNMAPPED = 0.**
Your map covers every row in the file with no exceptions.

| | count | what it is |
|---|---|---|
| **ADDED** | 80 | tokens Figma has that were never published — `overlay/*` (18), `account-accent/*` (6), `breadcrumb/*` (6), `account-chart/*` (8), `border/strong`, `account/{border,surface,foreground}`, `foreground/danger-inverse`, `account-summary-card/icon/foreground`. Additive, nothing reads them yet. |
| **REMOVED** | 16 | exactly the 8 `KILLED` keys × 2 modes. The intended kill, not drift. |
| **CHANGED** | 2 | ↓ below. |

### ⚠️ The kill needs a `build.py` edit in the same commit

`build.py` lines 109–112 still map the four account slots onto the killed tokens:

```
--color-account-arq-bg    -> var(--account-1-surface)
--color-account-toptal-bg -> var(--account-2-surface)
--color-account-bancol-bg -> var(--account-3-surface)
--color-account-other-bg  -> var(--account-4-surface)     (+ the four -txt pairs)
```

`tokens_map_css()` emits `var(--x)` verbatim, so dropping the tokens without retargeting these
would have produced **valid CSS pointing at nothing** — uncoloured account badges, no build
error, discovered weeks later. I added `check_map_sources()` to `build.py`: it now fails loudly
before writing anything, and I verified it fires (exit 1, previous `design-system/` left intact).

`account-accent/{purple,sky,emerald,lime,amber,pink}` looks like the intended replacement, but
which account maps to which accent is your call — I did not guess.

## The 2 decisions

**1. `--fav-selected-foreground` — light: published `#b45309`, Figma `#f59e0b`.**
Consumed at [AccountCardView.tsx:95](../../src/components/cards/AccountCardView.tsx#L95) — the
favourite star, drawn on `--fav-selected-background` `#fffbeb`.

```
published #b45309 → 4.84:1
figma     #f59e0b → 2.07:1     WCAG 1.4.11 non-text needs 3:1
```

The star is a meaningful graphical object (it carries the favourite state), so 3:1 applies.
Adopting Figma's value fails it. This is the `border/focus` situation again — flagging rather
than adopting. If amber-500 is the intended star, the background likely has to move with it.

**2. `--sidebar-surface` — light: published `rgba(255,255,255,0.5)`, Figma `#ffffff`.**
Unconsumed: no alias in `tokens.map.css`, no reference in `src/`. The sidebar paints with
`--sidebar` (`#ffffff` in `index.css`), which already agrees with Figma. Adopting is a no-op
visually — but it is still your call whether the 50% white was deliberate for a frosted
treatment that was never wired up, or leftover.

## One thing I got wrong, and how

The first run reported **21** disagreements, not 2. Nineteen were my bug: `figma-dump.js`
resolved aliases against the *target's default mode* instead of carrying the mode name down the
chain. Component tokens that alias the same Semantic variable in both modes — `badge/neutral/background`
→ `color/wrap/subtle` — collapsed dark to light, while tokens aliasing a *different* target per
mode (`badge/primary/background` → cyan/500/10 vs /20) stayed correct. A partly-correct dump is
worse than a broken one: it reads as a value disagreement with published output.

Fixed in `figma-dump.js` (`resolveByModeName`, follows the chain by mode name, case-insensitive
so `Light`/`light` match). Re-dumped both collections; Semantic came back byte-identical, which
is the expected result since it aliases into Primitives (single mode) — verified, not assumed.

Your prediction of exactly 2 was right, and it is what told me my number was wrong.
