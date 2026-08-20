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
