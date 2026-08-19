# 16 — Third-party marks

Created 2026-08-19, while bringing the sign-in screen into Figma.

Login draws two marks that are not ours, GitHub and Google. They look like the same problem and
**they are not**, and confusing them is expensive in both directions: tokenising Google's is
appropriating a colour that is not ours; pulling GitHub's out of the system loses an icon that
does behave like all the others.

## The test: is the colour the icon's, or the context's?

| | GitHub | Google |
|---|---|---|
| in code | one `path`, `fill="currentColor"` | four `path`, `fill="#4285F4\|#34A853\|#FBBC05\|#EA4335"` |
| inherits colour? | **yes** | **never** |
| has a dark mode? | yes, the context's | **no**, identical in both |
| where it lives | `Icons` → `Icon Library`, glyph `github` | `Brand`, component `brand-mark/google` |
| tokenised? | yes, like any glyph | **no, on purpose** |
| `C1` | applies | **exempt** via `CONFIG.foreignBrand` |

**GitHub's is monochrome and inherits `currentColor`.** That makes it an ordinary glyph: it binds
to a foreground token and behaves like `check` or `chevron-right`. Verified on the canvas —
inside a filled button it comes out white on its own, with nothing overriding it.

**Google's carries four colours that are not ours.** A token implies permission to change it, and
there is none: Google's brand guidelines forbid recolouring the logotype. Writing them as raw
hexes is not carelessness — it is the only way to say *do not touch this*. Which is why the
exemption lives in the validator and not in anyone's memory.

## Flags come in through the same door

`CurrencyRadio` brought the purest case of all: **a country flag**. Colombia's yellow, blue and
red; the red, white and blue of the United States. There is no version of this where tokenising
them makes sense — they are not ours, they have no dark mode, and changing them is not a design
adjustment but a mistake.

So the set is called **`brand-mark/flag`** and lives in `Brand`, next to the logo and the Google
mark. The prefix does all the work: the ten raw fills of its stripes are exempt from `C1` by
configuration, and **the exemption travels with the instance** — nested inside `CurrencyRadio`
the instance inherits the set's name and the check skips it with nothing to touch. Verified:
`CurrencyRadio` audits **77 nodes with zero violations**.

That is the proof the rule was written in the right place — in the name, not in a list of nodes.
The third foreign mark cost no new decision.

## The rule

> **A third party's colour never rises into the token layer.** If the icon inherits colour, it
> is a glyph. If it carries its own colour, it is a mark: it lives in `Brand` under the
> `brand-mark/` prefix, exempt from `C1` by configuration.

`CONFIG.foreignBrand = [/^brand-mark\//]`, and `C1`/`C1b` skip any node in that subtree. Adding
another mark means naming it properly, not editing the validator.

## How the screen ended up

- Login (mobile and desktop, light and dark): each button carries its mark as the leading icon.
- Login · authenticating: the pressed button swaps its mark for the `Spinner`, which inherits the
  button label's colour — head at 100%, track at 25%. The other button keeps its mark and both
  are disabled. Exactly the ternary in `LoginScreen.tsx:72,84`.

## An API trap that cost two passes

Copying the label's paint onto the spinner's track **loses the opacity on the first write**. The
paint has to be written and *then* read back and reassigned with its `opacity`. Same family as
the cached colour of `setBoundVariableForPaint`: the paint you get back is not the paint that
stays. You catch it by reading the value after writing it, never by assuming the write took.
