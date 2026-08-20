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
