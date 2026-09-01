# 25 — The colour of an account

**Decided by Alfredo, 2026-08-21:** the user picks each account's colour in the edit drawer.
Accounts that already exist get one assigned without being asked.

This closes the eight `--account-{1..4}-*` tokens, which had hard-coded four of Alfredo's own
accounts — `arq`, `toptal`, `bancol`, `other` — into the design system.

---

## 1. Colour is runtime data, not a token

The system publishes **twelve accent/surface pairs** and nothing that names an account. Which
account is which colour lives on the account record. This is the same line `§A3.8` draws between
placeholder copy and sample content: a mock may show Bancolombia in emerald; a *token* called
`--account-3-surface` makes that mock into the specification.

    Account.color?: 'purple' | 'sky' | 'emerald' | 'lime' | 'amber' | 'pink'
                  | 'blue'   | 'green' | 'indigo' | 'orange' | 'rose' | 'teal'

Optional on purpose — see §4.

## 2. What the colour paints

**The avatar, and nothing else.** `AccountAvatar` is a tinted circle in `account/<hue>/surface`
with the account-type glyph in `account/<hue>/accent`. Cards, rows and amounts stay neutral.

That boundary is what makes twelve hues safe. Neto already spends colour on meaning — cyan is
brand and net, red is expense and danger, emerald is provision, amber is tax. An identity colour
that only ever appears inside a small circle never shares a surface with a number, so it cannot be
mistaken for one.

### The rule had to be enforced before it was true (2026-08-24)

This section was written on 08-21 and `AccountCard` went on breaking it for three days, because
nobody re-read the card against it. The card carried a **full-width accent banner directly above
the amount** — the exact arrangement the paragraph above forbids — and its own description said,
in bold, *do not "fix" it*. That description was written on 08-17, four days before this doc. Two
written decisions, both confident, pointing opposite ways, and no check that could see it: a
contradiction between two prose documents is invisible to `C1`–`C8`.

Alfredo settled it on 08-24 and the doc won. The banner is gone; `AccountCard` and
`AccountSummaryCard` both open with an `AccountAvatar`, which is the only carrier. `AccountCard`
also dropped the type badge's leading icon, because the avatar already draws that glyph.

**`AccountAvatar` gained a `size` axis** — SM (24) and LG (40) — because both new consumers sit
in a header, not a hero. MD (32) is in the code's `cva` and is deliberately not minted: nothing
uses it.

### Figma cannot inherit a colour, and that costs something here

The code sets `--account-accent` on the avatar's span and the glyph inherits it. Figma has no
such thing: the accent is bound on the glyph's **vector**, three instance levels down, and each
account type resolves to a *different* vector. Switching `Account Type` on an instance therefore
lands on a glyph still carrying the icon library's own `fg/subtle`, and the account colour
vanishes — silently, because nothing is unbound and every check stays green.

So in Figma, whoever changes an instance's account type must re-bind that glyph to
`account/<hue>/accent`. In code this cannot happen. It is a property of the tool, not of the
system, and the alternative — making type a variant axis — is the 48 variants §3 already refused.

## 3. Twelve, and what twelve costs

Alfredo's call. Measured rather than asserted, because it has a cost worth writing down:

| palette size | best achievable minimum hue separation |
|---|---|
| 8 colours | 25° |
| 10 colours | 14° |
| **12 colours** | **11°** |

Only **14** hue families are free once cyan, red, slate and gray are spent. Taking twelve of
fourteen forces near-neighbours: orange/amber sit 11° apart, emerald/teal and pink/rose 14°.
At 32px those are not reliably distinguishable.

**So colour never identifies an account on its own.** `AccountColorPicker` names the chosen colour
in words, and any surface showing an account's colour must also show its label. This is not a
courtesy — WCAG 1.4.1 says colour is never the sole carrier of information, and here the
measurement says it could not be even if the rule allowed it.

Rungs are 600 for the accent and 300 in Dark, except lime at 700 — chosen per hue by contrast, not
uniformly. Every glyph is verified ≥3:1 against its own tint in both modes (WCAG **1.4.11**: a
filled glyph is a graphic object). Light floor 3.07:1 (amber), Dark floor 8.02:1 (indigo).

### The names live in the accessible name, not on screen (2026-08-22)

**The picker shows no colour name.** Alfredo: *"el usuario no tiene que ver el nombre del color…
no afecta la selección ni la intención."* He is right and my earlier argument was wrong in a way
worth writing down: I defended the caption with WCAG 1.4.1, but 1.4.1 forbids colour being the
**sole carrier of information** — and choosing an account colour is a *preference*, not a task
with a right answer. Nothing is lost when two hues are hard to tell apart. The selection state is
carried by a check mark, which is not colour at all.

**The names still exist, as the accessible name of each swatch.** A screen-reader user pressing
a circle has to hear something, and "button" is not something. Visible caption removed, `aria-label`
required. These are the names, and they
are part of the contract — Figma and the app must not disagree:

| token | nombre | | token | nombre |
|---|---|---|---|---|
| `purple` | Morado | | `blue` | Azul |
| `sky` | Celeste | | `green` | Verde |
| `emerald` | Esmeralda | | `indigo` | Índigo |
| `lime` | Lima | | `orange` | Naranja |
| `amber` | Ámbar | | `rose` | Rosa |
| `pink` | **Fucsia** | | `teal` | Turquesa |

`pink` is **Fucsia**, not "Rosado". Dev proposed Rosado/Rosa for pink/rose and flagged the pair
themselves: those two are 14° apart, the tightest in the palette, and two names differing by one
suffix rescue nothing. Worse, Figma had them **inverted** — `rose` was labelled "Rosado" there
and "Rosa" in the app, so the same word meant two different colours. Fucsia and Rosa are told
apart in speech, which is the entire job of the caption.

## 4. Existing accounts: derive, do not migrate

> **Amended 2026-08-22.** The palette is now in chromatic order and that order is the DATA order —
> `hash(id) % 12` indexes into it. Alfredo authorised the one-time repaint this causes: *"no importa
> que cambien de color ahora. Prioriza el orden cromático en la selección del color."* The stability
> rule below is unchanged and starts from this order.
>
> **The order is now load-bearing.** Reordering the palette again repaints every account that has
> not chosen explicitly. From here that is a data migration, not a design tweak.
>
> **The repaint does not remove the repeats — it moves them.** Assuming the shipped `PALETTE` was in
> the order this document listed (Dev to confirm; the ids are not in Design's hands), Alfredo's
> seven go from three oranges to three purples:
>
> | | antes | después | | | antes | después |
> |---|---|---|---|---|---|---|
> | ARQ | orange | **purple** | | NU | amber | emerald |
> | Toptal | sky | amber | | Efectivo | rose | pink |
> | Bancolombia | indigo | indigo | | CMR | orange | **purple** |
> | Nequi | orange | **purple** | | | | |
>
> Three of seven still share a colour, because the repeat comes from 7 accounts over 12 colours,
> not from the ordering. Nothing here is a way out of that — §4 chose stability over distinction and
> this is still what that costs.

    color = PALETTE[ hash(account.id) % 12 ]

Alfredo asked for random. Derived-from-id is what random should mean here, and it is strictly
better on the three things that matter:

- **No migration write.** Nothing to run, nothing to fail halfway.
- **Same colour on every device**, with no sync round trip. A true random roll can produce two
  answers if two devices migrate before they talk to each other.
- **An account never changes colour on its own.** The hash is stable for the life of the id.

`color` stays optional in the type: absent means derived, present means chosen. Writing it on
first open would erase that distinction and make every account look deliberately coloured.

### Collisions are expected, and the picker should say so

With 7 accounts and 12 colours the chance of at least one repeat is ~85%. Alfredo's seven land on
three oranges. That is not a defect in the hash — Dev measured the spread at 89–109 per colour
over 1200 ids, against an ideal of 100 — it is what §4 costs: stability was chosen over
distinction, and avoiding collisions would mean adding an account could change another account's
colour, which §4 forbids.

**Reversed 2026-08-22, same day: no "in use" marker.** I approved a dot in the morning; Alfredo
struck it. *"Lo más importante es que los colores se pueden repetir en diferentes cuentas."* An
unexplained mark on a choice that has no wrong answer reads as a restriction, and a labelled one
("en uso por otra cuenta") reads as a warning against something explicitly allowed. Two accounts
in the same colour is a normal outcome of a rule we chose on purpose, not a collision to flag.

### Layout and hit target (2026-08-22)

**44px hit target**, disc 36. Above the touch minimum (WCAG 2.5.5, Apple HIG) rather than at it,
because the swatches sit close together.

**Ordered by hue angle**, measured rather than arranged: orange 21° · amber 32 · lime 86 · green 142 ·
emerald 161 · teal 175 · sky 200 · blue 221 · indigo 243 · purple 271 · pink 333 · rose 347. Read across,
it is a ramp that lands almost back where it started.

Alfredo asked for this because it looks better, and it also does something measurable: the palette's
two tightest pairs — orange/amber at 11° and emerald/teal at 14 — end up **adjacent**. Side by side
they read as two colours. Six positions apart, the second one reads as the first again.

**Two explicit rows of six, spread across the full width of the container.** Not a wrapping grid:
wrap packs as many as fit and then spaces them, so at 372px it silently becomes eight per row and
changes again on a wider drawer. Six per row is a decision, not an outcome of arithmetic.

**`Field`'s control slot now HUGS.** It was fixed at 40px — the height of an Input — and clipped
the picker's second row the moment it was swapped in. The drawer looked like it had six colours.
An instance-swap slot cannot carry the height of its default occupant.

## 5. What Design built (2026-08-21)

| | where |
|---|---|
| `AccountColorSwatch` — 12 colours × Default/Hover/Selected | `Components · Forms` → `doc: AccountColor` |
| `AccountColorPicker` — the grid plus the chosen colour's name | same |
| `AccountAvatar` — 12 colours, account type as a nested swap | `Components · Icons & Avatar` → `doc: AccountAvatar` |
| `AccountEditForm` — the drawer's colour section | `Components · Overlays` → `doc: Sheet` |
| `Flow · Color de cuenta` — three steps, mobile | `Page - Accounts` |

Two things fell out of building it that are worth keeping:

**The chip shows the accent, not the pairing.** The first version drew the tinted disc the avatar
uses. The render killed it: any tint pale enough to sit behind a glyph measures **1.0–1.2:1**
against the app canvas — it is simply not there. Deepening it to `hue-100` fixes nothing (still
1.04–1.18:1) and drops amber's glyph contrast to 2.86:1. The preview belongs on the live avatar in
the drawer, which is where it now is.

**`Sheet` gained a `Content` slot.** It had none: its body held a text node, and an instance
cannot have children added or removed, so every flow needing a real form had to detach the sheet.
`Content` is an `INSTANCE_SWAP`, the same shape `Field` uses for `Control`.

## 6. What Dev has to change

1. Add `color?: AccountColor` to `Account`, and the derive-from-id fallback (§4).
2. Set `--account-accent` / `--account-surface` per account at the point the avatar renders, from
   `account/<hue>/*`. The design system does not know which account is which.
3. `build.py` lines **109–112** still bridge `--color-account-{arq,toptal,bancol,other}-{bg,txt}`
   onto `--account-{1..4}-*`. Those eight are held in `token-ledger.json` as **pending**, not
   tombstoned, precisely because that bridge still points at them. Repoint it and they die.
4. Nothing here is a rename, so nothing here needs an alias.
