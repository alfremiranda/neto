# 20 — The plan: consistent, scalable, alive

Written 2026-08-20 at Alfredo's request. Every number in it was measured on that date; none is
recalled. Reproduce any of them with `_build/audit-figma.js` (§0.2 below).

The order is not by importance. It is by **what unblocks what**, and by **what is reversible**.
The irreversible step — renaming 240 colour tokens — comes after the instruments that will tell
us whether it worked, and after a dry run that can be read before anything moves.

---

## Where we actually are

| | measured 2026-08-20 |
|---|---|
| Variables | 766 (Primitives 355 · Semantic 200 · Component 170 · Typography 41) |
| `T1` open scopes | **292** — all `ALL_SCOPES`, none merely empty |
| `T2` exposed primitives | **344** (every primitive) |
| `T3` no `codeSyntax` | **701**, of which **346 are mandatory** (Semantic + Component) |
| `T8` mode casing | **2** — `Light/Dark` vs `light/dark` |
| `T5` broken alias · `T6` · `T7` | **0** ✅ |
| Tokens carrying intent (a description) | Semantic 110/200 · Component 52/170 · Primitives 99/355 · Typography 7/41 |
| Components | 77, with **73 described** ✅ |
| Instances across the file | **5,686**, converged over 4 passes |
| Components existing only in their own doc frame | **~10** (1–2 instances each) |
| Components with zero instances | **1** (`obligation-itemrow`) |
| Published package `design-system/tokens/` | frozen since **2026-08-02** — the exporter has never run |
| What runs the validator | **nothing** (`deploy.yml` is the repo's only workflow) |
| Figma Motion API | **enabled** on this account (6 first-party animation styles, timelines in seconds) |

The layer model is healthy — `T6` and `T7` at zero say so. What is missing is **naming
discipline, enforcement, and a pipeline that closes**.

---

## Phase 0 — Instrument before changing anything

Nothing here changes a pixel. It exists so that every later phase can be judged instead of
asserted, and it is the cheapest work in the plan.

**0.1 · Fix `T8` first.** Two mode renames, `Component` `light/dark` → `Light/Dark`. It is the
cheapest item in the whole plan and the only one whose cost is already known: mode-by-index
resolution produced 21 false divergences on 2026-08-17 and cost Dev a rebuild of the exporter's
dump. Do it before anything else touches aliases.

**0.2 · The coherence log.** One dated table per measurement, in
`design-system/_build/coherence-log.md`. The article that prompted this plan argues for measuring
**coherence, not adoption** — and the validator already produces exactly those numbers. A photo
becomes a series.

**0.3 · The usage census as a script, not a reading.** `_build/usage-census.js`, run inside Figma,
returns instances per component. It needed **four passes to converge** when run by hand, which is
the argument for scripting it (`00-principles §B4`). Its first output already earns itself: ~10
components exist only inside their own documentation frame. A component that appears only in its
own vitrine is a specimen, not part of the system.

**0.4 · Split enforcement honestly.** The `T*`/`C*` checks need the Figma Plugin API and
**cannot run in CI**. What can:

- repo-side CI: no raw hex in `src/**`, `tokens.css` reproducible from `tokens.json`, every
  `var(--x)` in `tokens.map.css` resolving to a key that exists;
- Figma-side: a **scheduled session** that runs the audit and appends to the coherence log.

Saying which half can be automated is the point. Claiming CI runs the Figma audit would be
governance theatre.

---

## Phase 1 — Naming: intent, consistency, clarity

The diagnosis, measured: `surface` is both a family and a property (`color/danger/surface` vs
`color/surface/sunken`); `wrap` and `surface` both mean background; there are four ways to say
danger (`danger`, `destructive`, `feedback/danger`, `status`); the `color/` prefix carries no
information and is not even consistent (132 of 138); depth varies 2/3/4 with no rule.

### The shape

```
<property>/<intent>[-<prominence>][-<state>]

property ∈ { bg · fg · border · shadow }      ← closed set of four
```

State is always a **suffix**, never a level — it modifies the whole token rather than being a
tier of hierarchy. That ordering (category → role → modifier) is what Primer, Polaris and
Atlassian converged on.

**The argument that decides it is not taste.** With the property first, `T1` stops being 292
decisions and becomes **four rules**: `bg/*` → `FRAME_FILL, SHAPE_FILL`; `fg/*` → `TEXT_FILL`;
`border/*` → `STROKE_COLOR`; `shadow/*` → `EFFECT_COLOR`. The scope becomes derivable from the
name, which is exactly what `§A3.1` asks for — not documenting the rule but making the mistake
impossible. `codeSyntax` becomes derivable the same way.

### What 1.1 found — converged, 2026-08-20

`_build/naming-analysis.js` now agrees with itself across two consecutive passes, so these are
facts rather than provisional counts. The cold pass returned **4183** bindings; the converged
answer is **10108** — 59% low, with no error raised. `§B4` earned its place again.

| of 138 semantic colour tokens | |
|---|---:|
| bound on a product screen | **48** |
| bound only in documentation swatches | **58** |
| bound nowhere at all | **32** |
| groups holding an identical value | **29** |

**65% of the semantic colour collection does not appear on a single product screen.**

Four findings are structural:

- **`color/interactive/primary` is doing three jobs** — 234 fills, 185 strokes, 18 text. Not a
  naming problem: one token standing in for three, and 437 bindings that cannot move
  independently. It **splits**; it does not pick a winner.
- **`color/border/focus` is not a border.** Zero strokes, twelve effect colours. It is the focus
  ring shadow and always was. → `shadow/focus`.
- **`/default` means the opposite thing in adjacent families.** `tax/default` and `net/default`
  are solid backgrounds; `income/default` is a text colour. Same suffix, opposite property,
  sibling families — the clearest single argument for property-first.
- **The two tokens named `brand` are not the brand colour.** They hold sky blue (`#e0f2fe`,
  `#0284c7`); Neto's brand is cyan (`#0e7490`, `#06b6d4`). Nothing binds them, so nothing ever
  broke — the name was simply never true.

The disposition of the 90 unbound tokens is a judgement, not a sweep: `color/categorical/*` and
`color/sequential/*` are unbound because the charts they exist for are **Phase 4**, and
`account-accent/*` because the mocks contain one account. Written up as Rule 8 in
`21-token-naming.md`; recorded per token in `_build/naming-map.json`.

**A correction to the instrument came out of this.** The first version bucketed a bound fill as
foreground only when the node was `TEXT`. It therefore reported
`color/interactive/primary-foreground` as 110 backgrounds and zero foregrounds — impossible for a
token that only paints icons. An icon glyph is a `VECTOR`, and it is foreground. The script now
keeps `text · glyph · shape · box` as separate buckets rather than pre-summing them, so its own
evidence can be re-argued with. Same lesson as every other defect this month (`§A6`): the counting
was fine, the instrument was being used outside its range.

The point of deriving the property by counting rather than by choosing is exactly this: it turns
a naming exercise into an audit, and it surfaces the tokens whose *name* was hiding a second job.

### The steps

**1.1 · Author the map as a dry run.** ✅ **done, awaiting review.** `_build/naming-map.json`
plus the readable diff in `_build/naming-proposal.md`: every current name, its proposed name, and
— where two tokens collapse into one — which survives and why. The convention it implements is
`docs/21-token-naming.md`. **Nothing has been applied.** These files are the thing to review, not
the result. Net effect if approved: 138 tokens → **121**, five tokens doing two jobs → **zero**,
four vocabularies for "background" → **one**, three families meaning "error" → **one**.

Three questions are open and are blocking 1.2: the convention itself (especially Rule 2, identity
colours exempt, and Rule 4, the closed ladder); whether `color/income/foreground` holding the
brand cyan `#0e7490` is a decision or an accident; and the 19 deletions, which are the only part
that is not reversible. Four of the merges are marked **PENDING** because Light-mode agreement is
not sufficient — elevation is often carried by fill in Dark and by shadow in Light, so the Dark
values get checked before those four are applied.

**Review, 2026-08-20 — convention approved with two amendments.** The prominence ladder goes from
four rungs to **six** (`subtlest < subtle < muted < default < strong < strongest`, default
unsuffixed), and `brand` + `neutral` gain an explicit **alpha ladder** at the rungs Primitives
already carries (`10 · 20 · 30 · 50 · 70 · 90`). Both are written up as Rules 4 and 9 in
`21-token-naming.md`. The alpha rule corrected four entries in my own map: `overlay/brand`,
`primary-overlay-subtle`, `border/overlay-primary` and `account/border` are alpha values that had
been given adjective names — the last of those carries 92 product bindings.

`income` was confirmed as an accident and moves off the brand cyan entirely: all three of its
tokens were on that scale. It goes to **green** (47° of hue away), with `fg/income` at green-700
for AA on both white and `bg/subtle`.

Two adjacency findings came out of that move and are recorded in `naming-map.json`: `provision`
now sits 19° from `income` (proposed fix: teal-700, 33°), and **`net` is 11° from the brand
cyan** — the same defect one family over, left open because `net` is the headline number and its
hue is a product decision.

**1.2 · Apply in Figma.** ✅ **done, 2026-08-20.** 138 semantic colour tokens → **121**. Every one
renamed, scoped from its property prefix, given `codeSyntax` and given an intent description —
intent coverage went from 90 missing to **zero**. The migration map for Dev is
`_build/token-migration.json`.

Two guards earned their keep. The **Dark-mode check rejected three of the four PENDING merges**:
`surface/raised`, `elevation/raised` and `wrap/card` are all `#ffffff` in Light but slate-700,
slate-900 and slate-800 in Dark — merging them would have flattened the entire dark elevation
ladder. `wrap/container` and `surface/sunken` diverge in Dark too. Only the merges that matched in
*both* modes were applied. And the delete step **aborted twice** rather than proceeding: once
because four Component tokens still aliased tokens on the delete list, and once because 14
documentation swatches were still bound to them.

Applied in five passes, ordered by reversibility: mint and split → repoint bindings → rename,
scope, codeSyntax, describe → repoint the Component aliases → delete. Verified by re-deriving every
token's property from its bindings and comparing it against the name: **zero names lie**, and zero
tokens remain on `ALL_SCOPES`.

**1.2 (original plan) · Apply in Figma, in one pass that does four things at once**: rename, derive scopes from
the property prefix, generate `codeSyntax`, and **write the intent description**. Intent coverage
is at 35% for tokens against 95% for components; the moment to write *why a token exists* is
while renaming it, not in a later pass that never comes.

**1.3 · Consolidate the numeric ladders.** ✅ **done, 2026-08-20.** Semantic numeric 58 → **33**
(five families), Primitives numeric 43 → **30** (two families), and **name collisions across
collections 25 → 0**.

The measurement changed the description. `spacing/component/*` was five tokens bound nowhere.
`padding/xs` had 85 bindings and every one was `itemSpacing` — a gap, so the family named the wrong
property. And `size/N` was not a dimension ladder: `size/{10,12,16,24}` were bound to `fontSize` and
duplicated the type scale Typography already owns, `size/{20,32}` to width and height, `size/6` to
an effect. One name, three jobs. `size/icon/*` was the only real dimension ladder → `icon-size/N`.

Alfredo then took the root cause: **Primitives collapse to a single `scale/*` ladder.** The evidence
was already there — `Primitives/spacing/12` was aliased by `icon-size/12`, by
`breadcrumb/separator/size` and by `button/size/*/height`. A raw 4 is a raw 4; what it becomes is a
Semantic decision. Three tokens for zero, three for two, three for four and pairs for 6–18 all
collapsed. `duration/*` stayed separate because time is not length.

That removed every collision at the root instead of hiding it, which unblocked the one deferral:
`radius/{sm,md,lg,xl,2xl}` → **`radius/{4,6,8,12,16}`**.

**1.3 (original plan) · Consolidate the numeric ladders.** Four parallel scales carry the same values today:
`spacing/N`, `spacing/component/{xs..xl}`, `padding/{xs..xl}`, `size/N`. Four names for 16.
The numeric one stays — it is legible and Alfredo is right about that — and the aliases either
justify themselves in writing or go.

**1.4 · Hide the primitives.** Done, 2026-08-20. `T2`: 334 exposed → **0**.

Hiding was the easy half and not the point. `hiddenFromPublishing` only cleans a *consumer's*
picker; it does nothing about the **203 nodes inside this file binding a raw value directly** and
skipping the semantic layer. Those were repointed by property — `*Radius` → `radius/N`, `*Weight`
→ `border-width/*`, square-and-small `width/height` → `icon-size/N`, everything else →
`spacing/N`. 203 → **57**.

Of the 57, 54 are one finding: the Plugin API **reads but cannot write** `minHeight` on a text node.
Recorded rather than fought, same class as the `strokeTopWeight` trap. The last is real and small:
`scale/6` is bound to a padding and **there is no `spacing/6` in Semantic**.

**1.4 (original plan) · Hide the primitives** (`T2`, 344). Last, because until the semantic layer is complete,
hiding them removes the escape hatch that is currently holding some screens up.

**Why now and not later:** `design-system/tokens/` has not moved since 2026-08-02 and none of the
new tokens ever reached it. Renaming today costs one file. After the first export, every rename
is a breaking change for `src/**`.

---

## Phase 2 — Close the pipeline

The system declares `design-system/` a generated artefact and nothing could generate it. Until
that was false, `§A1` was policy rather than mechanism: *"when code and Figma differ there is a
defect with a known direction"* is true, and nobody could apply the correction.

**2.1 ✅ 2026-08-21.** Stage 1 run and committed — `figma-dump.json`, 731 variables, four
collections, 26 text styles. It had never been run whole: the file committed on 08-17 was a
truncated 220-row pass, because the 20 kB `use_figma` cap **cuts without erroring**. Now chunked,
with `assemble-dump.py` asserting per-collection counts.

**2.2 ✅ 2026-08-21 — and the blocker was not the one this line assumed.** Re-running the pipeline
found that `rename-map.json` pointed at the namespace phase 1.2 retired: 9 of 162 semantic tokens
mapped, 153 unmapped. Alfredo decided the published CSS follows Figma, so the translating table is
gone — **the published name is now a pure function of the Figma name**, and `token-ledger.json`
holds only what a function cannot know. See `24-token-sync.md`.

**2.3 ⬜ Effect styles** are not variables and the dump still cannot see them. Either teach it to
read styles or emit the four elevation rungs by hand from the geometry already in `rename-map.json`.

**2.4 ⬜ The migration itself, and it is small.** Measured, not estimated: **1 consumer in `src/`**
(`index.css:256`, `--radius-lg`) and **53 in `build.py`**'s hand-written shadcn bridge. The other
61 broken names are consumed by nothing. 120 aliases carry the rest, 75 of which are already
retirable. Still open: the eight `--account-{1..4}-*` keys, which this roadmap has called dead
since it was written and which the ledger holds as `pending` because retiring them changes which
account gets which colour, and that is Alfredo's call, not a rename.

The coherence log has gained the row it never had: **drift between Figma and the package**, and it
is now a command with an exit code rather than a claim.

---

## Phase 3 — Motion and interaction

This is the part with no surface at all today, and the one Alfredo flagged as hard to hold in
Figma. Two things make it tractable now that were not true before.

**The vocabulary already exists.** `motion/duration/{instant,fast,moderate,slow,spin}` and
`motion/easing/{enter,exit,move,spin}`, named from counting the code's own 28 hand-written
durations. Nothing has to be invented; it has to be *applied*.

**Figma Motion is enabled on this account** — verified, not assumed: `figma.motion` answers, six
first-party animation styles exist (position, scale, rotation, size, opacity, path), timelines
carry real durations in seconds, and the MCP exposes `get_motion_context` for handoff. Motion can
be an authored, styled, handoff-able layer rather than a prototype demo that rots.

**3.1 · The interaction contract, per component, in writing.** The state machine already exists —
`State = Default · Hover · Focused · Disabled` is on `Button`, `CurrencyRadio`, `ChoiceRow`,
`AccountRow`, `action-chip`. What is missing is the sentence that says *what triggers each
transition and with which token*. One table per component: trigger → from → to → duration →
easing. Prose survives; a prototype wire does not.

**3.2 · Animation styles for the three motions the product actually has**: a surface entering
(`slow` + `enter`), a surface leaving (`moderate` + `exit`, one step faster than it arrived), a
state change in place (`fast` + `move`). Authored once as styles, applied by reference.

**3.3 · Motion on the onboarding flow**, which is the live redesign and therefore the honest test
case: step transitions, the stepper advancing, the Spinner. If the vocabulary cannot express
those three, it is wrong and better to learn it here.

**3.4 · Two rules to hold from the start.** Never document motion in a prototype that only one
person can open — the durable artefact is the token plus the written contract. And every
animation must degrade: `prefers-reduced-motion` is a requirement, not a nicety, in an app whose
users are checking money.

---

## Phase 4 — The missing components

From the measured inventory (`14-component-inventory.md`). **Two of the four items on the
original list were wrong**, and both were wrong in a way only a look at Figma could show — which
is what `§B6` asks for and why the list is re-measured before it is worked, not after:

- **the drawer handle already exists**, inside `Sheet`. It was never a missing component.
- **the distribution bar is two different things.** Figma's `DistribucionCard` has four fixed
  segments; the code's bar at `EgresosCard.tsx:67` draws one segment per category and dims the
  others on hover. Naming them as one item hid a real gap behind a component that already exists.

Done, 2026-08-24:

- `LedgerEntryIcon` — the 32px tinted bubble, six entry types as one nested swap. It also
  needed three glyphs the library did not have: `arrow-down-left`, `arrow-up-right` and
  `shield-check`.
- `ledger-itemrow` — the row that blocks the account page (`10`). Ten variants over
  `Device × Flow × State`, sparse on purpose: no `Pressed`, because this row has none in code.
  **Rebuilt the same day after putting it on the real screen**, which found three things the
  row family had already solved and I had not looked at hard enough: the “Programado” badge
  belongs on the metadata line rather than beside the description (the `maxWidth` cap I used
  instead cannot be overridden per instance, so a cap authored at 603 still truncated at the
  942 the account page actually uses); Mobile has to restack into three lines, because at the
  346 that screen gives it a single-line row cannot hold description, date and amount column;
  and Mobile's action is 44, the 2.5.5 touch target, not 36.
- Both account screens (`Desktop · 2` and `Mobile · 2`) now use it.

Still open:

- the three annual charts — 748 lines of hand-built SVG with no Figma counterpart;
- the per-category distribution bar (`EgresosCard.tsx:67`), which is NOT `DistribucionCard`;
- ~~a transactions container to hold the rows~~ — **`LedgerContainer`, 2026-08-24.** Both account
  screens were borrowing `IncomeContainer`, the Ingresos tab of the Mes view: it opens with an
  icon and the title “Ingresos del mes” and closes with a converted monthly gross, and a ledger
  has neither. Because its header could not carry the account, the page named the account twice —
  once in a summary card above and once in the borrowed title. Closes **A3/A4** of phase 1.5's
  block A.

These come **after** Phase 1 on purpose. New components mint new tokens — Alfredo said as much —
and minting them under the old naming means renaming them twice.

---

## Phase 5 — Keeping it alive

**5.1 · Finish the validator.** `C5`, `C6`, `C7` and `C8` all ship. Two of them were repaired on
2026-08-24 and both repairs were the same shape — the rule was in the wrong place, not the
findings:

- `C8` reported ~350 doc-chrome false positives because `docChrome`, `figmaChrome` and
  `outOfScopePages` were written into `CONFIG` on 2026-08-20 and **never read by any function**.
  The decision existed only as prose. Wired, `C8` on `Components · Icons & Avatar` went from 94
  findings to 12, and the 12 were real: `AccountAvatar`'s twelve variants each carried a raw
  `padding: 10` while `spacing/10` already existed.
- `C5` counted composition as borrowing. A node *inside* an instance was already excluded; the
  instance *itself* was not, so putting a `Badge` in a row counted as borrowing `badge/*`. With
  the guard, C5 went **116 → 1 → 0** file-wide and its ratchet is deleted: the check is now
  absolute. The 115 it dropped were every `AccountSummaryCard` with a `Favorite`, every `Sheet`
  with a `Button`, every `ExpenseContainer` with an `action-chip`.

Three times now, placing the rule correctly has retired more findings than chasing the findings
one at a time.

**5.2 · The coherence log becomes the review.** Numbers with dates, not opinions with adjectives.

**5.3 · Say who decides what.** Technical governance is mechanical: the validator decides.
Human governance is not: adding a variant, naming a pattern, breaking a contract. `§B3` already
draws the territory line; what is missing is the rule for **when a new component is allowed to
exist** — which the usage census now answers, because a component with one instance in its own
doc frame is not one.

---

## Order, and what it costs

| Phase | Cost | Reversible | Blocks |
|---|---|---|---|
| 0 · instrument | hours | fully | everything measurable |
| 1 · naming | days | dry run first | 2 and 4 |
| 2 · pipeline | hours, Dev's | yes | drift becomes measurable |
| 3 · motion | days | yes | the onboarding redesign |
| 4 · components | weeks | yes | — |
| 5 · alive | continuous | — | — |

The only step that cannot be undone cheaply is **1.2**, and it is deliberately preceded by a dry
run that can be read in full before a single variable moves.
