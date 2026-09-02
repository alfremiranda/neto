# 00 — Design system principles

> **This document is the system's constitution.** It explains the *why*: what each layer means,
> who decides what, and when something is finished. The other documents (`01`–`18`) describe
> concrete parts; this one describes the logic that joins them.
>
> It is split deliberately in two: **Part A** is generic and applies to any design system;
> **Part B** holds the decisions that only hold for this project. Moving to another project
> replaces Part B and leaves A untouched.

---

# PART A — The core (generic)

## A1. The rule of origin

**Figma is the truth of what the system should be.** The generated token package
(`design-system/`) is an **artefact**, not a parallel source. Code **implements**.

Everything else follows:

- When code and Figma differ, **there are not two opinions: there is a defect with a known
  direction.** Either the code is corrected, or Figma is changed on purpose and regenerated.
- A value that exists only in code is **debt**, not a decision. It either rises into Figma or it
  is documented as to why it stays out.
- Nobody edits the generated package by hand. If it has to be touched, the generator is touched.

## A2. The layers, and what each one decides

| Layer | Holds | Answers | Never |
|---|---|---|---|
| **Primitives** | raw values: the palette, the spacing scale, radii, widths | "what values exist in this universe?" | is used directly in a component |
| **Semantic** | intent, with light/dark modes | "what role does this value play?" | contains a raw value — always an alias |
| **Component** | a component's own tokens | "what does *this* component use?" | borrows another component's token |

**The test for which layer something belongs to:** ask what breaks if you change it. If the whole
universe moves → primitive. If the meaning changes everywhere → semantic. If only one component
changes → component.

**Why the third layer matters.** Without it, a component ties itself to another's semantics and
the two are married without anyone writing it down. The day one moves, the other follows and
nobody knows why.

## A3. Invariant rules

1. **Every variable carries scopes.** `ALL_SCOPES` is not an acceptable default: it is a picker
   with every variable in the file inside it, and that is where wrong bindings come from.
   Narrowing the scope does not document the rule — it **makes the mistake impossible**.
2. **Every variable carries `codeSyntax`.** The WEB syntax is wrapped: `var(--name)`. It is what
   makes Dev Mode tell whoever implements it **exactly** which CSS variable to use, instead of a
   token name to be translated from memory.
3. **Primitives are hidden.** They do not appear in pickers. Designers pick intent, not values.
4. **Semantics always alias.** A raw value in the semantic layer is a duplicated primitive
   waiting to diverge.
5. **Modes are named identically across collections.** `Light` in one and `light` in another is a
   trap for any script resolving aliases across collections.
6. **Every visual property is bound**: fill, border, padding, radius, gap. Legitimate exceptions:
   geometry fixed on purpose (an icon's pixel grid).
7. **No generic layer names.** `Frame 3`, `Group 1`, `Vector`, `Container` say nothing. The layer
   name is the only documentation that survives a copy-paste.
8. **Every component carries a description, and the description says why**, not what. The shape
   is already visible on the canvas; the reason is not.

### A3.7 Naming an optional part

Set by Alfredo, 2026-08-20, after the file was found carrying three conventions for the same idea —
`Button` said `Show leading Icon`, `Input` said `leadingIcon`, `ChoiceRow` said `Show media`.

> **An optional ICON before the text is `Show Leading Icon`. After the text, `Show Trailing Icon`.
> That naming applies to icons only — anything else must be called something else.**

The second sentence is what makes the rule usable. A boolean that hides a tile, a badge, a divider
or a line of text is not an icon slot and takes its own noun: `Show Media`, `Show Badge`,
`Show Divider`, `Show Description`. `Show` plus the noun, in Title Case, so the list reads as one
list.

Applied by measuring, not by reading names: for every boolean, find the node its `visible` property
controls, ask whether that node is an `Icon` instance, and ask whether it sits before or after the
text in its parent's order. 22 properties renamed, 31 booleans now consistent.

**A distinction the rule did not make at first, ratified by Alfredo the same day** — *"si hay
propósito en el icono y no es genérico ahí aplica la regla que probaste"*:

> **A generic icon slot takes the positional name. An icon that always means one thing keeps the
> name of the thing.**

`AccountCard :: Show Favorite` and `outcome-itemrow :: Monthly` both hide an icon and both stay.
Their boolean names a *meaning*, not a *slot* — the glyph is fixed and the property says what it
signifies. A Button's leading icon can be anything; a favourite star is always a star. Renaming
those would satisfy the rule and delete the information.

### The near-miss that came with it

The same sweep reported `SavingsCard :: Show Maturity` as a boolean controlling **no node at all**,
and 36 instances were carrying it. A switch with no wire is worse than a missing one, so it was
about to be deleted — and a last check before the delete found it controls **three** nodes, on the
`Type=CDT` variant. My scan had sampled **only the first variant** of each set and generalised.

A CDT has a maturity date and a plain savings account does not. The design was right; the
instrument was wrong, and it was wrong in the way that deletes working design rather than the way
that merely miscounts.

This is the fourth instrument failure recorded this month and they all have one shape: **sampling
one member and speaking for the set.** `TEXT` for foreground, one string match for a component
name, one component for a token's consumers, one variant for a property. The countermeasure is the
same each time — before an irreversible step, run the check against every member, not the first
one.

### A3.8 Placeholder copy and sample content are different jobs

Set by Alfredo, 2026-08-20, after a brand sweep treated both as one thing.

> **Placeholder copy is generic. Sample content is realistic.**

A **placeholder** is instruction. It sits in an empty field for every user, so a brand name there
reads as a recommendation — `Ej: Cuenta de ahorros`, never `Ej: Visa Bancolombia`.

**Sample content** is illustration. It never leaves the file, and its value is being specific:
`Skandia Ahorro Futuro Patrimonio`, `Cuota Prestamo Vehicular BBVA`, `SURA EPS`, `Toptal`. These
are a Colombian freelancer's real pension fund, real loan, real EPS, real client, and they are in
the mocks on purpose — *"con propósitos de visualización de la data real"*. Replace them with
`Fondo A` and `Cliente 1` and the screens stop testing anything: name lengths collapse, the
overflow cases become unreachable, and nobody can tell whether a layout survives contact with
reality.

The failure mode this prevents is a well-meant sweep. A regex cannot tell the two apart — both are
just text with a brand in it — so the distinction has to be made by asking **who sees it**: a
placeholder is seen by every user, sample content is seen only by us.

## A4. The definition of done

> **A component is not finished until the audit passes over it.**

Without that line, the rules in A3 are advice. With it, they are a threshold. It applies equally
to a new component, an added token and a palette update.

**And a component nobody can find is not finished either.** Amended 2026-08-20, after `Field` was
built correctly and then left sitting loose at the bottom of its page. Alfredo: *"cuando crees un
componente nuevo crea también la documentación y ubícalo en la página y frame container
correspondiente, sino queda suelto, difícil de encontrar."*

So done means all four, in the same session that creates it:

1. **The audit passes over it** — `C1`–`C4` on its own nodes.
2. **It lives inside its page's documentation container**, never as a loose child of the page. The
   component set itself goes in `doc: X / previews / mode: Light / preview`, which is where every
   other set already is. A page whose top level has anything other than its container has an
   orphan.
3. **It has a `doc: X` frame** in the established structure — title, `spec` (properties and the
   reason it exists), then `previews` with `mode: Light` and `mode: Dark`. Clone an existing one
   rather than rebuilding it; that is how the text styles stay identical.
4. **The header count is recomputed from the page**, never incremented. It has been wrong before:
   `Components · Forms` claimed 10 components and 79 variants when the measured truth was 12 and 93,
   and it was wrong *before* the component that triggered the check was added.

**And CHANGING a component is the same threshold as creating one.** Amended 2026-09-02.
Alfredo: *"cuando actualices un componente revisa siempre la documentación, seguramente requiera
actualizarse también."* Measured that day: **64 of 79 `doc:` frames disagreed with the component
they document** — the most common defect in the file, and one that is invisible, because the
frame's prose and the component's description are two copies of the same thing and an edit only
ever touches one.

5. **The `doc:` frame is re-derived, not left alone.** Its `spec` carries the axes, the variant
   count and the description; all three come from the component and none of them is typed twice.
   `C10` checks it.

The cost of skipping this is not tidiness. A component that exists but cannot be found gets built a
second time by the next person, and then there are two. A component whose documentation is stale is
worse: it is found, and it is believed.

## A5. What each check prevents

The validator is not a list of good manners: every check exists because a real defect came
through there.

| Check | The defect it prevents |
|---|---|
| `T1` open scopes | binding the wrong token by picking from an enormous list |
| `T2` exposed primitive | skipping the semantic layer by accident |
| `T3` no code syntax | making whoever implements it guess the CSS variable |
| `T4` code syntax without `var()` | Dev Mode handing over something that cannot be pasted |
| `T5` broken alias | a token pointing at a ghost and resolving in silence |
| `T6` semantic with a raw value | two sources for the same colour |
| `T7` token borrowed from another component | two components married without anyone knowing |
| `T8` inconsistent mode casing | alias resolvers reading the wrong mode |
| `C1` fill without a variable | colour that does not answer the theme |
| `C2` text without a text style | typography escaping the scale |
| `C3` component without a description | knowledge living only in someone's head |
| `C4` generic layer name | structure that is illegible to whoever arrives next |
| `C8` layout number without a variable | a gap, padding, radius or border width typed by hand, drifting off the scale one screen at a time |
| `C9` `doc:` heading pinned to a fixed width | a documentation title clipped by the next rename, silently, because the node's height does not grow with the wrap |
| `C10` `doc:` spec vs its component | documentation that describes a component the file no longer contains — a false variant count, or prose that stopped matching the thing |

## A5b. C5, C6 and C7 — what calibrating them cost (2026-08-22)

The three were specified in August and written today. What took the time was not writing them;
it was that **all three fired on correct work the first time**, and the fourth instrument this
month to do so.

- **C5** (a node painted with another component's token) opened at ~30 pairings, most of them
  legitimate: `AccountChart ← account-chart` differs only in punctuation, `topnav ← nav`,
  `Icon Button ← button`. Fixed by comparing names by containment rather than equality, plus
  three documented sharings in `SHARED_FAMILIES` — `Select`/`Field` share Input's ramp on
  purpose, `menu-item` IS the sidebar row.
- **C6** (a description naming a rung the token does not resolve to) opened at 18 findings on
  68 descriptions, and **nine were correct**. Two kinds: a primitive explaining that it sits
  BETWEEN its neighbours, and an accent naming the BACKGROUND it rests on. Excluding primitives
  and requiring the hue family to match killed both kinds. Then a third kind appeared, and only
  by reading rather than counting: descriptions that name a rung **to say it is not the value** —
  *"code uses white/25, rounded to white/30"*, *"pointed at cyan/500 instead of rose"*,
  *"slate/300, the previous value, sat at 1.6:1"*. Those are the descriptions we want people to
  write. A negation guard skips them, at the price of one possible miss.
- **C7** (an effect with a hand-written colour) needed no calibration and found 12.

**The rule this produces:** a mechanical check is calibrated by READING its first run, one finding
at a time — never by counting it. Every false positive above survives counting; none survives
reading. And a check is not shipped at whatever number it opens at: C5 and C7 carry a ratchet, the
same call Dev made when they held `R5` back until its 22 violations were fixed. A check that opens
red is a check that gets switched off.

## A6. The failure mode to watch for

Almost no design-system defect comes from not knowing the rule. They come from **using an
instrument outside its range and not verifying the result**: a search pattern that does not find
what you think, an alias resolver blind to modes, a stale reading treated as current, a token
name constructed instead of read.

The countermeasure is not more discipline. It is that **the result gets measured**, always, by
something that does not depend on anyone remembering.

### A6b. A rule in the wrong place beats a rule applied by hand (2026-08-24)

Two checks were repaired on the same day, and the repair was the same both times: the rule was
sitting one level away from where it belonged.

**`C8`.** `docChrome`, `figmaChrome` and `outOfScopePages` were written into `CONFIG` on
2026-08-20, with a comment recording that the layout sweep had left ~350 doc-chrome findings as
permanent false positives. **No function ever read any of the three.** The decision existed only
as prose sitting inside a config object, which reads exactly like a decision that is in force.
Wired, one page went from 94 findings to 12 — and the 12 were real.

**`C5`.** A node *inside* an instance was excluded as composition. The instance *itself* was not,
so putting a `Badge` inside a row counted as borrowing `badge/*`. C5 went **116 → 1 → 0**
file-wide; the 115 it dropped were every card containing a button and every row containing a
badge, which is what a component library is FOR.

The lesson is not "check your config". It is the one the token layers already taught: **three
times now, moving the rule to the right place has retired more findings than working through the
findings one at a time** — `currency/*` into Semantic retired 51 borrows at once, the instance
guard retired 115, and neither was reachable by fixing instances.

A corollary for the ratchet: `C5` reached 0, so its baseline entry is **deleted** rather than set
to 0. A ratchet at 0 still says "this used to be broken"; no ratchet says "this check is
absolute", which is the truth and the thing the next person needs to know.

### A6c. Put a new component on the real screen before calling it done (2026-09-01)

`ledger-itemrow` passed the audit, had a `doc:` frame, lived in its container and was
committed. It was still wrong in three ways, and all three appeared within minutes of placing
it on the account page it was built for:

1. Its badge was pinned beside the description by a `maxWidth` cap. **`maxWidth` is one of the
   few properties Figma refuses to override per instance**, so a cap authored for the 603
   canvas width still truncated at the 942 the page actually uses. A measurement that cannot
   follow the component is not a measurement, it is a guess frozen at authoring time.
2. Mobile could not hold its own layout at the 346 the screen gives it.
3. Its mobile action was 36, under the 2.5.5 touch target.

Every one of the three was already solved by `outcome-itemrow`, on the same shelf, and none
was reachable from the doc frame — where the component sits at exactly the width its author
chose, next to nothing, at one zoom level.

So `§A4`'s four clauses are necessary and **not sufficient**. A fifth: **a component is not
done until it has been placed in a real screen at a real width.** The doc frame proves the
component is internally coherent. Only the screen proves it survives contact with the layout
it exists for.

The cheaper half of the lesson: **read the sibling before building.** All three answers were
one `get_metadata` call away in a component shipped weeks ago.

### A6d. The scaffolding is not exempt from the system (2026-09-02)

Alfredo found `doc: Tooltip`'s heading clipped: pinned at 65px for a word that needs 73. Measured
across the file it was **17 of 79**, and all seventeen shared a signature — pinned roughly 10%
narrower than their own text and 64px tall, which is two line-heights. **Every one of them had
been clipping its second line since the day it was written.** None of them looked broken, because
the name that was clipping was the name they had been sized around.

Two things this says.

**A `doc:` frame is chrome for C8's purposes and system material for everything else.** The
auditor already excludes doc chrome from the layout-number check, because a documentation page's
padding is page layout and not a spacing decision. That exclusion is right and it quietly taught
me the wrong general lesson: that the frames are outside the system. They are not. They are what
Dev and Alfredo actually read.

**A title is named after something that changes.** Any node whose content is a name — a heading, a
label, a legend — must hug or fill, never sit at a fixed width, because the width was measured
against one particular string and nothing re-measures it when the string changes. This is the same
shape as `24-token-sync.md` §1: *a function cannot go stale and a table can.* A hugging title is a
function of its text; a pinned one is a table with a single row.

Now `C9`. It is deliberately narrow — only the title of a `doc:` frame — because a paragraph that
wraps on purpose is a different thing and should not be dragged in.

### A6e. Two copies of one paragraph will diverge, and neither will look wrong (2026-09-02)

The prose that describes a component exists in three places: the Figma component's `description`,
the `spec` text of its `doc:` frame, and the `d` field of the repo registry that generates
`components/*.html`. Only the first is the source. The other two were being typed.

Measured the day Alfredo asked about it:

- **`doc:` frame vs component — 64 of 79 disagreed.** Fixed by deriving the frame from the
  component and adding `C10`. 40 of those 64 drifted on one line alone, a pixel size of the variant
  grid, which measures how the previews happen to be arranged and not the component; it was deleted
  from the spec and from `build.py` the same day.
- **Registry vs component — 39 of 89 disagree, and in BOTH directions.** Seven are the registry
  deliberately trimming a trailing axis sentence the HTML already renders. The other thirty-two are
  real divergence: `Spinner` has four paragraphs in the registry and one in Figma; `Tooltip` had my
  own writing from the same morning, typed twice, already different by lunchtime.

The lesson is not "be careful". It is that **anything typed twice is one edit away from lying, and
the second copy never looks wrong** — it reads perfectly, it just describes a component that no
longer exists. The `doc:` frames are fixed because a frame can be re-derived from the component in
the same session. The registry is NOT fixed, and it must not be bulk-overwritten: in thirty-two
places the registry holds the better paragraph, and generating over it would destroy real writing.
It needs a one-time merge, then generation. See `20-roadmap.md`.

## A7. The three-piece shape

| Piece | What it is | Where it lives |
|---|---|---|
| **Constitution** | this document | next to the tokens it describes, versioned with them |
| **Procedure** | the steps to create, update and document | a thin skill that **points** here, never duplicates |
| **Validator** | the script that measures and fails loudly | executable, not prose |

If only one can be kept, **the validator**. Prose degrades; the script does not.

---

# PART B — This project (Neto)

> Everything below is specific and **does not generalise**. Reusing this system elsewhere
> replaces this part wholesale.

## B1. Architecture

Four collections: **Primitives** (1 mode) → **Semantic** (Light/Dark) → **Component**
(light/dark), plus **Typography** (1 mode). Component tokens **may alias primitives directly** —
ratified, not accidental.

`design-system/` is generated from Figma; `tokens.map.css` translates the system's names into the
names the app already used.

## B2. Judgements that were expensive and must not be lost

- **The dash is the only one in the system.** `Empty` uses it and it means *a real container, but
  empty*. That is why `ErrorState` has a solid border: an error is not empty, and repeating the
  dash would drain it of meaning.
- **A skeleton says what is coming; a spinner says wait.** So there is no spinner **for
  content**: where there is a shape to anticipate, the shape is drawn. But when someone presses a
  button there is no shape to anticipate — the only thing to confirm is that the click is being
  handled, and a silhouette cannot say that. For that there *is* a `Spinner` (`Components ·
  Feedback`, created 2026-08-18). The boundary is the subject: **content arriving → Skeleton;
  action in progress → Spinner.** The code already had six hand-drawn ones before the component
  existed, which is the sign that the rule was incomplete rather than broken.
- **Decorative graphics sit one step below the text they accompany**, in each mode. The
  breadcrumb separator, for instance.
- **A link's horizontal padding is not decoration: it is the box of the focus ring.** Removing it
  breaks focus without anyone noticing.
- **The app is local-first.** A sync failure **is not an error**: it is a state. And when
  something does fail, the copy says the data is still on the device.
- **Figures are always tabular.** This is a money app: a number cannot jump while it is typed.

## B3. Boundaries

- **Figma ↔ Storybook**: Figma is the truth of what should be; Storybook is the proof of what is.
  When they differ, Figma wins and the difference is a defect. Only components already extracted
  to code get in.
- **Language.** **The design system is written in English.** That covers Figma layer names,
  property names, component and variable descriptions, `doc:` frames, and `design-system/docs/**`.
  The reason is not preference: this material travels next to the code through Dev Mode and into
  the repo, and code is English.
  **Product copy stays in Spanish** — it is what users read, and a text layer named after its own
  content keeps that name. Agent correspondence (`docs/inbox/**`, `docs/reports/**`) also stays in
  Spanish: it is conversation, not system.
  Corrected 2026-08-19 by Alfredo. It had drifted from 2026-08-03: docs `01`–`08` were English and
  everything from `09` onward had slipped into Spanish, along with 406 layer names and 45
  descriptions in Figma. Measured before being fixed.
- **Territory in the repo**: `design-system/**` and `design.md` belong to Design; `src/**` belongs
  to Dev. A token change that touches `src` is reported as a finding, not applied.

## B4. Measure twice in this file (2026-08-18)

A node census over **the whole document** can under-report the first time it runs in a session.
Measured, not assumed: `Badge` instances gave **32** on the first pass and **52** on the next,
with 0 broken main components; and bindings to `action-chip/selected/*` gave **14** and then
**28**. In both cases the second and third passes agreed.

The cause is that Figma loads pages and instance subtrees lazily: `loadAsync()` on the page does
not guarantee that nested content is in memory. The low number arrives with no error — it looks
exactly like the good one.

**Rule:** any count used as evidence is run **twice inside the same script** and only reported if
the two agree. A `before` measured cold and an `after` measured warm are not comparable, and
subtracting them invents a change that never happened.

Corollary: a token check does not replace a screenshot. `action-chip` had `Disabled` and
`Default` bound to the same six tokens and looked like a defect — until the screenshot showed
they differ by node opacity. The token reading could not see it.

## B5. Known debt as of 2026-08-17

First validator run over 720 variables:

| | |
|---|---|
| `T1` open scopes | **291** |
| `T2` exposed primitives | **344** |
| `T3` no code syntax | **679** |
| `T5` broken alias | **8** — `currency/usd/*` and `currency/cop/*` pointed at `account/1..4/*`, which no longer exists |
| `T8` mode casing | `Light/light`, `Dark/dark` between Semantic and Component |
| `T6`, `T7` | **0** — the semantic layer is clean and no component borrows |

The 8 broken aliases were the serious find: they had been resolving in silence for weeks while
`tokens.map.css` exposed `--color-currency-*` to the app.

## B6. The session opens against Figma, not against memory (2026-08-21)

Alfredo, on the day the published CSS was found four days out of date with Figma: *"debe haber un
sistema para auditar y actualizar los tokens ya que en Figma se crean, se mueven, se cambian o se
eliminan dependiendo del diseño."*

So a design session starts with three commands, before anything is touched:

    1. stage 1 in Figma  ->  _build/dump-parts/*.tsv
    2. python3 design-system/_build/assemble-dump.py
    3. node   design-system/_build/token-drift.mjs

Exit 1 is a stop: something the app consumes has disappeared from Figma with no alias and no
tombstone. Exit 2 is a queue. Exit 0 means the package and Figma agree, and it means that **only
as far as the dump is fresh** — which is why the auditor prints the dump's age and why step 1 is
not optional. Four days of silence happened with every script running green.

The rule this enforces is `§A1`'s missing half. `§A1` says that when code and Figma differ there
is a defect with a known direction. Until 2026-08-21 nothing could tell you they differed.

**And the rename half:** when a token is renamed in Figma, the ledger entry is appended in the
same session, by the session that renamed it. Never reconstructed afterwards. Rebuilding the
first 132 entries cost a day and needed three separate derivations, and the one obvious shortcut —
matching by value — was wrong 88 times out of 132. See `24-token-sync.md §3`.
