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

## A4. The definition of done

> **A component is not finished until the audit passes over it.**

Without that line, the rules in A3 are advice. With it, they are a threshold. It applies equally
to a new component, an added token and a palette update.

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

## A6. The failure mode to watch for

Almost no design-system defect comes from not knowing the rule. They come from **using an
instrument outside its range and not verifying the result**: a search pattern that does not find
what you think, an alias resolver blind to modes, a stale reading treated as current, a token
name constructed instead of read.

The countermeasure is not more discipline. It is that **the result gets measured**, always, by
something that does not depend on anyone remembering.

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
