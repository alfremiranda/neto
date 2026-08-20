# Coherence log

One dated row per measurement. Not opinions with adjectives — numbers with dates.

Produce a row with `_build/audit-figma.js` (`await auditTokens()`) and `_build/usage-census.js`
(`await census()`), both inside a `use_figma` call. Both are pure reads.

The point of this file is that "the system is fine" and "the system is broken" stop being claims
and become a direction of travel. An undated number here is worth what a memory is worth, which
in this project is zero.

---

## Tokens

| date | vars | `T1` scopes | `T2` primitives | `T3` codeSyntax | `T5` | `T6` | `T7` | `T8` | note |
|---|---|---|---|---|---|---|---|---|---|
| 2026-08-17 | 720 | 291 | 344 | 679 | 8 | 0 | 0 | 2 | first run |
| 2026-08-20 | 766 | 292 | 344 | 701 | **0** | 0 | 0 | **0** | `T5` closed by the rename map · `T8` closed in phase 0.1 |

`T3` rose because the file grew by 46 variables. The 15 published ones added since 2026-08-18
(motion, shadow, elevation surfaces, action-chip) **all carry `codeSyntax`**; the increase is
primitives, which do not need it. Of the 701, **346 are mandatory** — Semantic and Component.

## Intent coverage

How many variables carry a description saying *why they exist*. The article that prompted the
roadmap calls this the difference between a token and a colour value.

| date | Semantic | Component | Primitives | Typography | Components |
|---|---|---|---|---|---|
| 2026-08-20 | 110 / 200 | 52 / 170 | 99 / 355 | 7 / 41 | **73 / 77** |

Components are nearly complete; tokens are at roughly a third. Phase 1.2 closes it in the same
pass as the rename, because a later pass never comes.

## Usage

| date | components | instances | converged in | specimens (≤2) | unused |
|---|---|---|---|---|---|
| 2026-08-20 | 77 | 5,686 | 4 passes | ~10 | 1 (`obligation-itemrow`) |

Top of the distribution: `Icon` 2,290 · `Icon Button` 547 · `Button` 294 · `category-badge` 162 ·
`AccountBadge` 162.

The tail is the finding: `Toast`, `Skeleton`, `Popover`, `Empty`, `ErrorState`, `RowActionsSheet`
sit at 1–2 instances, and those instances are their own documentation previews.

## Pipeline

| date | package regenerated | drift Figma → package |
|---|---|---|
| 2026-08-20 | **never** — `tokens/` frozen at 2026-08-02 | unmeasurable: nothing to compare against |

This row is the reason phase 2 exists. Until the exporter runs once, drift has no number.

## Semantic colour, by whether anything binds it

Produced by `_build/naming-analysis.js`. Only recorded when two consecutive passes agree; the
`cold` column is the first pass, kept because it is the argument for `§B4`.

| date | tokens | product | doc-only | never bound | duplicate values | bindings (cold → converged) |
|---|---|---|---|---|---|---|
| 2026-08-20 | 138 | 48 | 58 | 32 | 29 groups | 4,183 → **10,108** |

**65% of the semantic colour collection does not appear on a product screen.** Ten separate
tokens hold `#ffffff`; nine hold `#f1f5f9`; four hold `#0f172a`.

The cold pass was 59% low and raised no error. Any future measurement that is reported after one
pass should be assumed to be wrong by roughly this much.

## Tokens doing more than one job

A token bound to two different properties cannot change for one without changing the other.
This row should be zero and stays in the log for as long as it is not.

| date | multi-property tokens | worst offender |
|---|---|---|
| 2026-08-20 | 5 | `color/interactive/primary` — 234 fills · 185 strokes · 18 text |

Phase 1.2 takes this to 0 by splitting all five. The split is visually free: in every case the
tokens that come out of it hold the value that went in.

## Repo side

The other half of `20-roadmap §0.4`. These four run in CI on every push that touches `src/**`
or `design-system/**` (`.github/workflows/design-system.yml`), so unlike the rows above they
cannot go stale between sessions — a regression fails a run rather than waiting for a measurement.

Reproduce with `node design-system/_build/validate-repo.mjs`. It needs node and python3 and no
npm dependencies, so it runs from a bare checkout.

| date | `R1` raw hex in components | `R2` package reproducible | `R3` dangling `var()` | `R4` literal colours in `index.css` |
|---|---|---|---|---|
| 2026-08-20 | **0** / 92 files | ✅ yes | **0** / 83 refs | 49 |

`R1` was 1 when the check was written: `EgresosCard`'s "Programado" badge hard-coded
`#fdba74`, which is `--badge-warning-border`'s **light** value — so the border stayed light
amber on dark, where the token says `#d97706`. Fixed with the token; verified in the browser
that both themes now resolve correctly. That is the argument for the check in one line: the
violation was not a style preference, it was a dark-mode bug nobody had seen.

`R4` is a **ratchet, not a gate**. Those 49 are app-owned variables in `src/index.css` still
carrying literal values that `tokens.css` now also holds. Migrating them is real work with real
review, and a check that forbids them today would simply be switched off. So CI only refuses to
let the number grow. It is the one row here that is expected to fall over time, and the only one
whose target is not zero-by-tomorrow.

Not measured here, and deliberately: **drift between Figma and the published package**. `R2`
proves the package matches `tokens.json`; nothing repo-side can prove `tokens.json` matches
Figma. That comparison needs the exporter to run, which is `Phase 2`.

## After phase 1.2 — the rename applied, 2026-08-20

| | before | after |
|---|---:|---:|
| semantic colour tokens | 138 | **121** |
| names that lie about their property | 6 measured | **0** |
| tokens doing more than one job | 5 | **0** (excluding identity families, exempt by Rule 2) |
| tokens on `ALL_SCOPES` | 292 | **0** |
| tokens without `codeSyntax` | — | **0** |
| tokens without an intent description | 90 of 138 | **0** |
| vocabularies for "background" | 4 | 1 |
| families meaning "error" | 3 | 1 |
| total bindings | 10,108 | 10,048 |

The 60 bindings that disappeared are the 14 documentation swatches removed for tokens that no
longer exist, and their labels. Nothing on a product screen lost a binding.

`namesThatLieAboutTheirProperty` is the row that matters, and it is the one that could not be
computed before this phase: it compares what a token is *called* against what it is *bound to*.
It is zero, and from now on it is a regression test rather than an audit.

## Leaks that survive — now visible because the name declares the property

| token | defect | count |
|---|---|---:|
| `border/default` | bound as a **fill** on 1px shapes | 88 |
| `bg/inverse` | bound as an **icon glyph** fill | 34 |
| `fg/default` | bound as a **fill** | 18 |

These are node-level defects, not naming ones. They existed before and were undetectable; the
property-first name is what makes them a finding instead of a guess.
