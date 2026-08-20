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

## T9 · does a token's name match the property it is bound to?

The check phase 1.2 made possible. Before property-first naming there was nothing to compare a
binding against; now the name is a claim and every binding either honours it or does not.
Lives in `_build/audit-figma.js` as `auditProperty()`.

| date | tokens with a claim | violations | note |
|---|---:|---:|---|
| 2026-08-20 | 74 | **20** | converged over three passes |

| what | count | what it is |
|---|---:|---|
| `bg/canvas` on `Spinner` head and track | 8 | using the page colour to mean "white". A real defect — the spinner sits on a brand button and wants `fg/on-brand`. |
| `border/default` as a shadow colour | 12 | the focus-ring offset on `ChoiceRow`, `AccountRow`, `CurrencyRadio`. A legitimate technique with no token that says so — see the proposal for `shadow/ring-offset`. |

Two further hits were the instrument, not the file, and the config was widened rather than the file
changed: a swatch frame named `default` inside `Danger / delete` is documentation, and its job is to
paint a token as a fill whatever property that token is for.

## Property leaks closed, 2026-08-20

| token | was | now |
|---|---|---|
| `border/default` bound as a fill | 88 | **0** — hairlines moved to the new `bg/divider`, drawer handles to `bg/neutral-alpha-20` |
| `bg/inverse` bound as a glyph | 34 | **0** — 8 sign-in buttons moved off `fg/default`; the other 26 were Tooltip arrows, which are a surface continuation and never were a defect |
| `fg/default` bound as a fill | 18 | **0** — the residual 8 were Spinner ellipses, which are indicators, not backgrounds |

Two of the three "leaks" were partly the instrument. That is now encoded in `T9`'s exceptions
instead of living in someone's memory.

## Dark elevation, after the intermediate rungs — 2026-08-20

| date | distinct levels / tokens | monotonic | min step | max step |
|---|---|---|---:|---:|
| 2026-08-20 (before) | 5 / 9 | **no** — `bg/raised` sat below `bg/surface` | — | — |
| 2026-08-20 (after) | **8 / 9** | yes | 4.2 L* | 6.1 L* |

Three primitives added — `slate/650`, `slate/750`, `slate/850` — interpolated in CIELAB, not sRGB.
Primitives: 355 → **358**.

The single remaining share is `bg/menu` = `bg/popover`, which `17-elevation.md §2` treats as the
same question. A decision, not a leftover.

`T9` re-run after the change: **20**, unchanged. No regression, and the two false positives from a
documentation swatch named `default` are gone now that the exclusion covers it.

## Rule 10 · tokens named after components — 2026-08-20

| date | semantic colour tokens | named after a component |
|---|---:|---:|
| 2026-08-20 | 121 | **0** |

`bg/menu` + `bg/popover` → `bg/anchored`. The dark elevation ladder now has **eight tokens at eight
distinct levels and no share**.

The mechanical check was tried and rejected: matching token name segments against the 182 component
names in the file found `bg/popover`, missed `bg/menu` (nothing in the file is called "menu"), and
falsely flagged `fg/info` and `brand/logo-*`. The dependency direction is what matters — the Badge's
`info` variant is named after the token, not the other way round — and a script cannot see
direction. Rule 10 is therefore a review question, not an automated check. Recorded so nobody
rebuilds the script.

## Rule 11 · are colours in the right collection? — 2026-08-20

| direction | measured | real | acted on |
|---|---:|---:|---:|
| Semantic tokens used by exactly one component | 23 of 119 | **2** | 2 moved |
| Component tokens used by 3+ unrelated components | 38 raw | **2 families** | 0 — recorded |

`brand/logo-mark` and `brand/logo-bg` → `logo/mark`, `logo/bg` in Component. Semantic colour:
121 → **119**. Component colour: 102 → **104**.

The raw counts are both misleading and it is the same failure twice. On the Semantic side the
mechanical rule flags 23 and 21 of them are domain or system concepts that only one component uses
*because the product is half-built* — Rule 8. On the Component side the count is inflated by nested
icons, which inherit their parent's foreground and register as separate consumers: that is why
`button/ghost/foreground` appears to be used by 22 components including `moon` and `trash-2`.

Open, recorded not acted on:

- `currency/cop/*` and `currency/usd/*` are used by four unrelated components and describe a domain
  distinction, not a badge. Candidates to promote to Semantic.
- `action-chip` consumes `badge/*` and `notification/*` — a component reaching into another
  component's tokens. Already on the open list; needs its own family designed, not extracted.

## Phase 1.3 · the numeric ladders — 2026-08-20

| | before | after |
|---|---:|---:|
| Semantic numeric tokens | 58 | **33** |
| Semantic numeric families | 8 | **5** |
| bound nowhere | 21 | **5** (all `motion/duration/*`, reserved for Phase 3) |
| Primitives numeric tokens | 43 | **30** |
| Primitives numeric families | 4 | **2** |
| **name collisions across collections, any type** | **25** | **0** |

Semantic families, each with one job: `spacing` (13) · `radius` (7) · `motion/duration` (5) ·
`icon-size` (4) · `border-width` (3). Primitives: `scale` (25) · `duration` (5).

### What the four "parallel ladders" actually were

The roadmap said `spacing/N`, `spacing/component/*`, `padding/*` and `size/N` carried the same
values. Measuring found something worse:

| family | finding |
|---|---|
| `spacing/component/{xs..xl}` | 4/8/12/16/20 — **all five bound nowhere**, exact duplicates of `spacing/{4,8,12,16,20}` |
| `padding/{xs..xl}` | four bound nowhere. `padding/xs` had 85 bindings and **every one is `itemSpacing`** — a gap, not a padding. The family named the wrong property. |
| `size/N` | not a dimension ladder. `size/{10,12,16,24}` were bound to `fontSize` — a **second copy of the type scale Typography already owns**. `size/{20,32}` were bound to width and height. `size/6` to an effect. One name, three jobs. |
| `size/icon/*` | the only real dimension ladder → `icon-size/{12,16,20,24}` |
| `border-width` | `default`, `hairline` and `thin` all equal **1px** |

25 Semantic tokens deleted, 115 bindings repointed. The delete step aborted once because
`badge/size` in Component aliased Semantic `size/20`; repointed before anything was removed.

### Primitives collapse to one ladder — Alfredo's call, and the evidence backed it

*"Podemos cambiar el nombre en primitives a `scale/*` así puede aplicar a varios como spacing/,
size/, etc."*

The measurement made the case better than the argument did. `Primitives/spacing/12` was already
aliased by `Semantic::icon-size/12`, `Component::breadcrumb/separator/size` and
`Component::button/size/*/height`. The name `spacing` had been lying at the primitive layer exactly
the way `border/focus` lied at the semantic layer — and for the same reason: **a raw 4 is a raw 4,
and whether it becomes a gap, a padding, a radius or an icon size is a Semantic decision.**

Primitives held three tokens for zero (`spacing/0`, `radius/none`, `border-width/none`), three for
two, three for four, and pairs for 6, 8, 10, 12, 14, 16 and 18. All of it collapsed into `scale/N`.
`duration/*` stayed separate — time is not length.

**All 25 name collisions are gone**, at the root rather than hidden. That also unblocked the one
thing Phase 1.3 had to defer: `radius/{sm,md,lg,xl,2xl}` → **`radius/{4,6,8,12,16}`**, since
`Primitives/radius/N` no longer exists to collide with. `radius/none` and `radius/full` keep their
words — they are not rungs, they are the absence of one and a sentinel.

### Still open

**There is no blur or spread ladder.** Shadows bind `border-width/thick` for their effect geometry.

**`border-width/{default,medium,thick}` did not go numeric.** Unlike a gap, a border width is nearly
always "the standard one", so `default` carries intent a number would lose. Left as a question.
