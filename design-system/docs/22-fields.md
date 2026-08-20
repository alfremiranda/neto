# 22 · Form fields

Alfredo, 2026-08-20: *"algo que veo es que el label del input en algunos sale en otros no, cómo se
determina esa práctica."*

The honest answer is that it was not determined. Measured across the form family:

| component | instances | label |
|---|---:|---|
| `Input` | 66 | **none** |
| `Select` | 28 | **none** |
| `DatePicker` | 6 | **none** |
| `MoneyInput` | 10 | yes, as a **variant** `Label=True\|False` |

Four components, four answers. Two of them are defects rather than preferences.

## A placeholder is not a label

`Input`, `Select` and `DatePicker` were letting the placeholder carry the field's name. That fails
twice:

- **It disappears.** The moment the user types, the only thing naming the field is gone — exactly
  when they are most likely to need it.
- **It is not legible.** `fg/placeholder` is `#94a3b8`. On `bg/surface` that is **2.56:1** against
  a 4.5:1 minimum, and on `bg/subtle` it is 2.34:1. A real label at `fg/subtle` measures 10.35:1.

So 100 shipped fields had no accessible name. That is not a style question.

## Presence is composition, not state

`MoneyInput` modelled the label as `Label=True|False`, which doubled its matrix to **10 variants**
for a difference that is not a state. Worse, it had already solved the problem without noticing:
its internals are literally `label<TEXT>` + `field<INSTANCE of Input>`. **`MoneyInput` was the
wrapper this document proposes, welded to one currency.**

## `Field`

A wrapper that owns the three things around a control:

    label      the field's name. Always present.
    control    an INSTANCE SWAP — Input, Select, DatePicker, anything
    message    a hint or an error

| property | type | note |
|---|---|---|
| `Label` | TEXT | |
| `Control` | INSTANCE_SWAP | defaults to `Input / Size=MD` |
| `Message` | TEXT | |
| `State` | VARIANT | `Default` · `Hint` · `Error` |

`State` exists because a **boolean cannot carry a per-variant default**, and a field in `Error`
with no message is useless. The state is the message's reason to exist: `Default` hides it, `Hint`
shows it in `fg/subtle`, `Error` shows it in `fg/danger-strong`.

### What `Field` deliberately does not own

**The control's own visual state.** Focus, disabled and the error outline belong to the control and
are set on the instance. An `INSTANCE_SWAP` property has one default for the whole set, so `Field`
*cannot* pre-set its control to look wrong — and that limit turns out to be the right model rather
than a workaround. `Field` knows what the message says; the control knows how it looks.

### Two things it corrected on the way

`MoneyInput`'s label was bound to `input/color/label`, a Component token that resolves to exactly
`fg/subtle` in both modes — a component token duplicating a semantic one. `Field` binds the
semantic directly, and `input/color/label` is now a retirement candidate.

Every paint had to be **re-seeded** with its variable's resolved value after binding. Figma renders
a paint's cached colour, not the variable's, so the error message bound correctly to
`fg/danger-strong` and rendered grey until the cache was replaced. Same trap as the dark-mode
re-seed in August: the binding was right and the pixels were wrong, and only a screenshot said so.

## Adoption

- `MoneyInput` retires into `Field` + `Input` — 10 instances, 10 variants removed.
- `Input`, `Select` and `DatePicker` stay as controls. They are not wrong; they were just being
  used without a name.
- `ChoiceRow` and `AccountRow` keep their own `Label` property. Their label is the **content** of
  the row, not the name of a field — a different contract that happens to share a word.

## Where it lives

`Components · Forms` → `Documentation — Forms` → **`doc: Field`**, placed first among the field
docs because it is the wrapper the others sit inside. The component set itself is in
`doc: Field / previews / mode: Light / preview`, which is where every other set on that page
already lives.

It was not there when it was built — it sat loose at the bottom of the page, and Alfredo caught it.
`00-principles §A4` now says a component nobody can find is not finished either, with the four
things that "done" means.

Header after: **15 components · 112 variants**, recomputed from the page rather than incremented.

---

## DatePicker and MoneyInput retired — 2026-08-20

Alfredo, after updating `Input` himself: *"no solo Money Input, también debería ser Date picker."*

**The measurement made it free.** Every instance of both components — 6 `DatePicker`, 10
`MoneyInput` — was its own dark-mode documentation preview. Neither appeared on a single product
screen. Retiring them changed nothing a user can see.

What they actually were:

| | structure | what it really is |
|---|---|---|
| `DatePicker` | `icon(calendar)` + `TEXT` | an Input with a calendar glyph, **and no label at all** |
| `MoneyInput` | `label TEXT` + `field INSTANCE(Input)` | already a Field — a label wrapping an Input — welded to money, with the label modelled as a *variant* |

So `MoneyInput` was the prototype of `Field` without knowing it, and `DatePicker` was the case that
proved the point: a date field with no name on it.

Both are now compositions, shown in `doc: Field` under the variants:

    date field   = Field + Input, leading glyph `calendar`
    money field  = Field + Input, leading glyph `banknote`

`Components · Forms`: **15 components · 112 variants → 13 · 102**, recomputed from the page.

`Calendar` and `Calendar Day` stay. A date field opens a calendar; only the *trigger* was ever
duplicated.

## Alfredo's Input update, audited

He rebuilt `Input` before this: a trailing icon that can carry a clear affordance, a `Hover` state,
a `Filled` axis, and rebound variables. 2 × 5 × 3 = **30 variants**.

Audited per `§A4` because the rule applies to every component, not only to the ones I build:
**zero unbound colours, zero raw layout numbers, across all 30 variants.**

One thing found and fixed: the set carried `leadingIcon` and `trailingicon` — same component, two
capitalisation conventions. Renamed to `trailingIcon`.

**Still open, and it is a system-level question rather than a typo:** `Button` exposes
`Show leading Icon`, `Input` exposes `leadingIcon`, `ChoiceRow` exposes `Show media`. Three
conventions for "is this optional part visible". Worth one decision, applied everywhere.
