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

## Raw radius 10 — counted before asking, 2026-08-20

The open question was whether `radius/10` is a missing rung. The orchestrator was right to refuse
the question without a per-page split, and the split changed the answer.

| where | raw radius-10 corners |
|---|---:|
| `Foundations` | 400 — **all of them documentation swatch chips** (`chip`, `default`) |
| `Screens · Neto (WIP)` | 148 — out of scope |
| `Screens & exploration` | 128 |
| `Components · Navigation` | **48 — `bottom-nav-button`, a published component** |
| `Blocks · Containers` | 32 |
| `Page - Accounts` | 32 |
| `Layouts` | 16 |
| **total** | **804** |

Note `_docs-kit` holds **zero** of them, so the exclusion Alfredo set does not move this count —
it is a standing rule worth having, not a factor here.

**Verdict: not a rung. Normalise.** 400 of the 804 are the doc-kit's own chips — evidence that
someone typed 10, not that a design needed it. `radius/8` and `radius/12` already sit one step
either side, and adding 10 would make the ladder 4·6·8·10·12·16. The 656 in scope get normalised
to 8 or 12 as part of the hand-typed-numbers sweep, `bottom-nav-button` included.

The whole raw-radius distribution, for that sweep: 2px×176 · 3px×72 · 4px×168 · **5px×242** ·
6px×12 · 8px×416 · **10px×804** · 12px×628 · 16px×96 · 20px×400 · 24px×8 · 28px×4 · **999px×184** ·
9999px×516. The 5px and the 999px are their own findings — 999 should be 9999, and 5 is on no scale
at all.

## bg/container → bg/chrome, and border-width joins the ladder

`bg/container` looked like a duplicate: identical to `bg/canvas` in Light, identical to
`bg/surface` in Dark. Measuring its 23 bindings showed it is not — **18 of them are the desktop
`rail`**, a structural panel beside the content, and `bg/subtle` (icon tiles, badges, progress bars)
does a different job entirely.

So it survives, renamed for its relationship rather than its layout noun (Rule 10). On its Light
value: the only room between `slate-50` and `slate-100` is **0.74 L\***, which is a value on paper
and not on screen, so it deliberately shares the page in Light and earns its own rung in Dark
(slate-900 against slate-950, ΔL* 6.1). What separates the rail from the content in Light is
`border/default`, not a fill — the same resolution already used for `bg/sunken` in Dark.

`border-width` keeps words rather than numbers, but joins Rule 4's closed ladder instead of
inventing its own: `default` (1) · `strong` (2) · `strongest` (4). That answers the real concern —
room to grow — without minting a new adjective: `subtle` and `subtlest` are already defined below
`default` if a hairline is ever needed.

## Phase 1.4 · primitives hidden — 2026-08-20

| | before | after |
|---|---:|---:|
| primitives exposed to consumers (`T2`) | 334 | **0** |
| nodes binding a primitive directly | 203 | **57** |

Exposed after: Semantic 156 · Typography 41 · Component 172 · **Primitives 0**.

### Hiding is not the point — the direct bindings are

`hiddenFromPublishing` removes primitives from a *consumer's* picker. It does nothing about the 203
nodes inside this file binding a raw value directly and skipping the semantic layer. Those were
repointed, choosing the family by the property each was bound to — the same rule that makes the
property-first names work:

    *Radius         -> radius/N
    *Weight         -> border-width/{default,strong,strongest}
    width/height    -> icon-size/N when square and <= 24, otherwise spacing/N
    everything else -> spacing/N

133 repointed at component level. `_docs-kit` and `Screens · Neto (WIP)` excluded via
`CONFIG.outOfScopePages`.

### The 57 that remain, and why each stays

| what | count | why |
|---|---:|---|
| `scale/20` on `minHeight` of a `Name` TEXT node | 54 | **The Plugin API reads this binding but refuses to write it** — `setBoundVariable` returns *"invalid field for text node: 'minHeight'"*. It was made some other way and cannot be moved programmatically. |
| `color/rose/400` on `textRangeFills` | 2 | a per-range fill, needs `setRangeFills`, and rose-400 has no semantic equivalent |
| `scale/6` on `paddingTop` | 1 | **there is no `spacing/6` in Semantic** — either a missing rung or a node that should say 4 or 8 |

The first row is the same class as the `strokeTopWeight` trap: an instrument asymmetry that would
otherwise sit in the audit forever as an unexplained non-zero. Written down rather than fought.

## The hand-typed layout numbers, swept — 2026-08-20

Approved in `A-2026-08-20-numeros-de-layout` and run in the order the orchestrator asked:
`Foundations` → `Components · *` / `Blocks` / `Brand` / `Icons` / `Layouts` → screens.
`_docs-kit` and `Screens · Neto (WIP)` excluded structurally via `CONFIG.outOfScopePages`.

| | |
|---|---:|
| bindings written | **19,560** |
| failures | **0** |
| layout numbers now bound | **196,952** |
| still unbound | **3,453** |
| **coverage** | **98.3%** |

Per group: Foundations 4,874 · Navigation/Overlays/Feedback 2,774 · Icons&Avatar/Blocks/Brand/
Icons/Layouts 3,811 · Flow-Onboarding + Page-Accounts 6,631 · Screens & exploration 1,466 · Forms
(pill fix) 4. Actions, Badges, Rows and Cards were already fully bound.

Nothing moved: the values written are the values that were already there. Verified by screenshot on
the desktop consent frame.

### The 3,453 that remain, and they are not a backlog

**859 are instance overrides** — a node inside an instance whose value differs from its component.
Binding those would mint an override rather than remove one. Left alone deliberately.

**2,594 are values with no rung.** This is the real output of the sweep: the list of numbers the
system does not have a word for.

| value | count | reading |
|---|---:|---|
| `radius 10` | 656 | already decided: **not a rung**, normalise to 8 or 12 |
| `gap 6` | 467 | **there is no `spacing/6`** — the same gap that surfaced in 1.4 |
| `radius 20` | 304 | no rung |
| `radius 5` | 222 | on no scale, before or after |
| `radius 2` | 176 | the rung was deleted in 1.3 as dead; it is not dead |
| `radius 999` | 128 | instance-level overrides of the pill sentinel. The four **components** were normalised to `radius/full`; these 128 are overrides that survived it |
| `pad 7` · `pad 3` · `pad 18` · `pad 14` | 264 | off-scale paddings |
| fractional (`1.8`, `7.8`, `2.88`, `12.48`) | ~120 | scaled-group artefacts, not decisions |
| `gap -1.5` | 34 | negative gap — overlapping avatars. Legitimate, no rung wanted |

**The three that are arguably missing rungs, in order of evidence: `spacing/6` (467), `radius/2`
(176), `radius/20` (304).** Each needs the same treatment `radius 10` got — count first, then ask.
`radius/2` is the sharpest: 1.3 deleted it for being unbound, and 176 hand-typed 2s were the reason
it looked unbound.

### The rung review — five values, one at a time, 2026-08-20

Alfredo reviewed each residual value against its evidence rather than its count. Two of the five
answers came out the opposite of what the raw number suggested, and one of my measurements was
wrong in a way that mattered.

| value | count | decision | what it turned out to be |
|---|---:|---|---|
| `radius/2` | 80 | **restored** | Phase 1.3 deleted it as unused. It was not unused — 32 of the 80 are `CurrencyRadio`, and everyone was typing the 2 instead of binding it. A token can look dead because nobody uses it, or because everybody wrote its value by hand. Only the sweep tells the two apart. |
| `spacing/6` | 274 | **minted** | Four unrelated components — `KPI-Card`, `AccountCard`, `chart-legend`, `SavingsCard` — had each chosen 6 by hand. The 4→8 jump was the widest at the bottom of the ladder. 248 bound. |
| `radius/20` | 120 | **not a rung** | And **my evidence was wrong**. I attributed it to `SavingsCard` (72) and `AccountSummaryCard` (32) because my ownership walk climbed to the *outermost* component. They were `Favorite` instances nested inside those cards. `Favorite` is 24×24 with a 20px corner — a circle wearing a number. All 120 resolved by binding 8 masters to `radius/full`. |
| `radius/10` | 448 | **minted**, Alfredo's call | I recommended against and gave the reason: 448 corners is 112 nodes and **three** design decisions, 100 of them clones of one documentation chip. He minted it anyway, which is his to do — recorded in the variable's own description so the next person sees both the count and the decision count. |
| `radius 5` | 222 | **not ours** | Every one is on a `COMPONENT_SET` frame — the dashed wrapper Figma draws around a variant set. 55 sets × 4 corners. Never a design value. |

### Two exceptions now structural, not remembered

`CONFIG.figmaChrome` — a `COMPONENT_SET` frame's corner belongs to Figma.

`CONFIG.docChrome` — a frame whose job is to *document* the system is not the system. The rule is a
function, not a location: the doc-kit's grid lives on `Foundations` as well as on `_docs-kit`, and
~350 of the residue were its `section:` / `grid` / `chip` frames. Without this the audit carries
350 permanent false positives.

### Where the sweep finished

| | |
|---|---:|
| layout numbers bound | **198,175** |
| coverage | **99.2%** |
| instance overrides left alone | 889 |
| real residue after both exceptions | **~257** |

What is left is genuinely off-scale and mostly not a decision: ~154 fractional values from scaled
groups, `gap 1` and `gap 3` hairline gaps, `gap -1.5` for overlapping avatars, and a tail of
one-off paddings on exploration screens.

## The onboarding inputs after the Input rebuild — 2026-08-20

Alfredo asked whether the onboarding inputs had been updated. They had — automatically, which is
the point and also the problem.

| | |
|---|---:|
| `Input` instances in `Flow - Onboarding` | **32** |
| that inherited `Show Trailing Icon = true` from the new default | **32** |
| that were **empty** while showing a clear (×) affordance | **32** |
| that have a label | **0** |

**Defect one, fixed.** The rebuilt `Input` defaults `Show Trailing Icon` to `true`, so every
existing instance picked up a clear button — on a field with nothing to clear, where an × reads as
"remove this field" rather than "empty it". Turned off on all 32. Confirmed by screenshot before
and after.

The rule underneath it: **the clear affordance belongs to `Filled=True`.** Figma cannot make a
boolean depend on a variant, so the two have to be kept in agreement by hand — and the default
being `true` means the disagreement is what you get for free.

**Defect two, not fixed — it needs copy.** All 32 fields are labelled by their placeholder, and the
four on the credit-card screen show what that costs:

| placeholder today | what it actually is |
|---|---|
| `Ej: Cuenta de Ahorros` | a real placeholder — an example |
| `Ej: Visa Bancolombia` | a real placeholder |
| `Cupo total` | **a label wearing a placeholder's clothes** |
| `Deuda actual` | same |
| `Día de corte` | same |
| `Día de pago` | same |

Four numeric fields side by side whose only name disappears the moment you type in them. A user
who fills `Cupo total` and `Deuda actual` is then looking at two numbers with nothing to say which
is which. This is the case `Field` was built for, and it is live in the flow.

## Onboarding fields, and the brand names — 2026-08-20

**32 bare `Input` instances → 32 `Field` instances**, each with a label that does not disappear
when the user types. Zero failures, layout verified by screenshot.

Copy generic per Alfredo — *"utiliza placeholders genéricos, no menciones marcas ni franquicias"*:

| label | placeholder |
|---|---|
| Nombre de la cuenta | `Ej: Cuenta de ahorros` |
| Nombre de la tarjeta | `Ej: Tarjeta principal` |
| Cupo total | `$5.000.000` |
| Deuda actual | `$1.200.000` |
| Día de corte | `15` |
| Día de pago | `5` |

Note which way the four numeric ones went: `Cupo total` was never a placeholder, it was a label in
a placeholder's slot. Moving it up and putting a real example below it is the whole difference —
the field keeps its name **and** shows what shape of answer it wants.

### The brand sweep, and a fifth instrument failure

A first pass found 101 text nodes carrying a bank or franchise name. Converged: **402** — under by
75%, the lazy-loading trap again. The first pattern also matched **In*sura*nce** and **me*nu***,
because the short brand names were not anchored on both sides.

| page | brand-bearing text nodes |
|---|---:|
| `Screens & exploration` | 138 |
| `Blocks · Containers` | 88 |
| `Components · Cards` | 72 |
| `Components · Rows` | 41 |
| `Screens · Neto (WIP)` | 21 |
| `Page - Accounts` | 18 |
| **`Flow - Onboarding`** | **12 → 0** |
| `Foundations` | 8 |

The onboarding flow is clean: `Bancolombia Ahorros` → `Ahorros principal`, and the long-name edge
case became `Ahorros Nómina Principal Empresa` — still long, because that frame exists to test
overflow.

**The other 390 are correct and must not be "fixed".** I reported them as pending brand exposure;
Alfredo corrected it the same day — *"por eso solo dije los placeholders, el resto que menciona es
contenido contextual con propósitos de visualización de la data real."*

That is a decision already taken, not a gap. `Skandia Ahorro Futuro Patrimonio`,
`Cuota Prestamo Vehicular BBVA`, `Toptal → Bancolombia`, `SURA EPS` exist so the mocks show what
this product's data actually looks like — a Colombian freelancer's real pension fund, real EPS,
real client. Replace them with `Fondo A` and `Cliente 1` and the screens stop testing anything:
name lengths collapse, the row overflow cases become unreachable, and nobody can tell whether the
layout survives contact with reality.

> **Placeholder copy is generic. Sample content is realistic. They are different jobs and the same
> sweep will keep confusing them.**

A placeholder is instruction — it appears in an empty field for every user, so a brand there reads
as a recommendation. Sample content is illustration — it appears only in the file, and its whole
value is being specific.

Recorded here because the previous version of this entry framed the 390 as a defect, and a wrong
finding in the log is worse than no finding: someone would have acted on it.

## Input, after Alfredo removed the trailing icon from `Filled=False` — 2026-08-20

He fixed it at the component level, which is the right layer: **the `trailing-icon` node no longer
exists on any of the 15 `Filled=False` variants**, and exists on all 15 `Filled=True`. So the clear
affordance can no longer be inherited by an empty field at all — my earlier fix had only turned it
off on 32 instances, one at a time, which would have drifted back the moment someone made a new one.

The rule is now structural instead of remembered: **a field can only offer to clear itself if it
has something to clear.**

### One variant had lost its wiring

Walking all 30 to confirm the change turned up an unrelated defect:

| variant | leading-icon | value | trailing-icon |
|---|---|---|---|
| `Filled=True, State=Focused, Size=MD` | **unwired** | **unwired** | **unwired** |
| every other variant | bound | bound | bound |

On that one variant `value`, `Show Leading Icon` and `Show Trailing Icon` did nothing — an instance
set to it would lose its text and both toggles, silently. Rewired from its healthy sibling
`Filled=True, State=Focused, Size=SM`. All 30 verified clean afterwards.

Same shape as the `Show Maturity` near-miss two entries up: **one member of a set differing from its
siblings, invisible unless you walk every member.** That is now three findings from the same habit,
and it is worth stating as a check rather than a habit — a variant whose children are wired
differently from its siblings is a defect, and it is mechanical to detect.

## The media icons — 2026-08-20

Alfredo: *"algunos colores de los iconos de media no están renderizando bien en instancias de este
componente, pasa en varias pantallas."*

Not a render bug. A contrast failure, and the cause is one layer deeper than the component.

### Measured

`ChoiceRow`'s media tile is `bg/subtle` when unselected and **`bg/brand` solid** when selected. The
glyph inside is whatever the consumer swapped in, and **every glyph component's `Vector` is bound to
`fg/subtle`** — the `Icon` wrapper has no colour property at all, only `Glyph` and `size`.

So a selected row puts a slate glyph on a solid brand tile:

| | glyph on the solid tile | glyph on a 20% brand tint |
|---|---:|---:|
| Light | **1.93:1** | 8.26:1 |
| Dark | **1.64:1** | 7.69:1 |

1.6 and 1.9 against a 3:1 floor for a graphic. That is why it looked like a rendering fault — the
icon was there, it just could not be seen.

### Fixed by changing the tile, not the glyph

The selected tile is now `bg/brand-alpha-20`. The glyph stays `fg/subtle` and reads at 7.7–8.3:1 in
both modes. Selection is still unmistakable: the row keeps its brand border and its filled radio.

**The reason it was fixed on the tile is not preference — the glyph could not be reached.** The
`Vector` lives inside a nested, swappable instance, and the Plugin API will not expose it for
override: `findAll` returns nothing, and walking `.children` explicitly stops at the glyph instance.
Even if it could be set, an override on a swappable glyph would be lost the moment a consumer
changed the icon.

### The finding is the Icon component

> **`Icon` cannot be recoloured by its context.** Its properties are `Glyph` and `size`. Every
> glyph's `Vector` is hard-bound to `fg/subtle`.

That means an icon is slate wherever it sits, and the only defence is never to put one on a surface
that slate cannot survive. The sweep found no other case today — the four `ChoiceRow` variants were
the only place an icon sat on a solid brand or inverse fill — but the gap is structural and the next
solid-filled component with an icon will hit it again.

A `Tone` axis on `Icon` is the obvious fix and it does not work in Figma for the same reason the
override does not: the colour lives inside the swappable child, where the wrapper cannot reach it.
The workable options are to bind glyph `Vector`s to a Component-collection token per usage, or to
keep the rule that icons only ever sit on surfaces `fg/subtle` survives. Recorded for a decision.

## Onboarding, audited before handoff — 2026-08-20

Alfredo: *"creo que onboarding está listo para dev."* Verified rather than accepted, per `§A4`.

| check | result |
|---|---|
| `T9` — token used against the property its name claims | **0 violations** |
| unbound strokes | **4** |
| unbound effects | **0** |
| unbound fills | 544 — **all accounted for** |
| raw layout numbers | 120 — **all fractional** |

**The 544 unbound fills are not a finding.** 400 are the stars of the US flag inside `CurrencyRadio`,
plus its stripes and canton, plus the Colombian flag and Google's four brand colours in the sign-in
button. Every one is a `brand-mark/*`, which `CONFIG.foreignBrand` already exempts — a national flag
and another company's logo must not be tokenised. The remainder is three `SECTION` backgrounds,
which are canvas chrome and not product.

**The 120 raw numbers are all fractional** — `1.8`, `7.8`, `2.88`, `12.48` — the scaled-group
artefacts identified in the hand-typed-numbers sweep. Not decisions anyone made.

So the flow is clean and the claim holds. It is now measured instead of asserted.

## Motion is available in Figma, and the premise was out of date

Alfredo: *"lo único que hace falta son las animaciones y transiciones que en Figma no las podemos
determinar."*

Checked, because this decides whether the handoff is a spec or a prose description:

    figma.motion.figmaAnimationStyles()  ->  6 first-party styles
       position · scale · rotation · size · opacity · path

    every onboarding frame already carries a timeline, 2s by default
       Mobile · 0a · Login          745:25047
       Mobile · 0b · Consentimiento 745:25059
       Desktop · 2 · Moneda         549:868      ... and the rest

**We can determine them in Figma.** The API is enabled on this account, the timelines exist, and the
motion tokens were minted on 2026-08-19 and are still bound to nothing:

    motion/duration/instant  100ms      motion/easing/enter  cubic-bezier(0.16, 1, 0.3, 1)
    motion/duration/fast     150ms      motion/easing/exit   cubic-bezier(0.4, 0, 1, 1)
    motion/duration/moderate 200ms      motion/easing/move   cubic-bezier(0.4, 0, 0.2, 1)
    motion/duration/slow     300ms      motion/easing/spin   linear

The honest caveat: `get_screenshot` shows only the resting state, so the only way to verify motion is
`export_video` plus frame sampling, which renders server-side and is slow. That makes motion the one
part of the system where checking costs real time — but it is checkable, which is the difference
between a specification and a wish.

## 2026-08-21 · The exporter, measured end to end for the first time

The loop had never closed. Stage 1 ran on 08-17 and produced a file that read as finished.

    dump               17 Aug          21 Aug
    ---------------------------------------------
    rows                  220             731
    collections             2 (colours)     4
    text styles             0              26

The 08-17 dump was truncated, not partial-by-design: `use_figma` caps its response at 20 kB and
**stops without erroring**. A short dump and a complete one are the same shape, so nothing
downstream could tell them apart. Stage 1 now runs in eight slices and `assemble-dump.py` asserts
162 / 41 / 177 / 351 before writing — the only place a lost slice fails loudly.

Then the measurement that matters, `apply-rename-map.mjs --check`:

    semantic mapped    17 Aug: 128 of 128       21 Aug:   9 of 162
    UNMAPPED           17 Aug:   0              21 Aug: 153
    component mapped   17 Aug:  92              21 Aug: 177 of 177

Component is whole. Semantic collapsed, and not because anything broke: `rename-map.json` was
authored on 08-19 against `color/surface/*`, `color/foreground/*`, `color/income/*` — the namespace
phase 1.2 retired two days later. **`motion/` is the only prefix that survived, and it survived
because it was added after the rename.** A map is a bridge, and 1.2 moved the far bank.

The published package still speaks the old language — `--surface-wrap-*`, `--surface-popover`,
`--surface-container`, `--foreground-*`, `--kpi-*`, `--data-*`. Those are the component nouns
Alfredo struck out of the semantic layer. The system currently has two vocabularies and the only
thing reconciling them is the file that just proved it goes stale in silence.

**20 CHANGED values.** Two were decided on 08-17 and behaved: the favourite star does not appear at
all (Figma and the repo now agree on `#b45309`), and `--sidebar-surface` goes
`rgba(255,255,255,0.5)` → `#ffffff`. The other 18 are the Light surface ladder and the contrast
work reaching the package for the first time. Not absorbed — listed, and left for the decision.

One provenance note, small and the same shape as everything else this month: the 08-17 dump carried
`"file": "Neto"`. `figma.root.name` returns `"Document"`. It was hand-typed into a field that reads
as measured.
