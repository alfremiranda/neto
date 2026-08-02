# Typography — Rethink Sans migration spec

This is the section `05-handoff-tokens.md` promised as "§7" and never had. Dev found the gap
(`docs/reports/2026-08-01-typography-audit.md`) and was right: the migration had a decision but no
spec, so it had nothing to be executed against. This doc is that spec. Read it with the audit —
the audit is the spec→code map, this is the spec.

Everything here is already true in Figma. The code has not moved yet.

---

## 1. One family

**Rethink Sans is the only family in the system.** Inter and Geist Mono are out.

| Variable | Today | After |
|---|---|---|
| `--font-sans` | `'Inter Variable', Inter, system-ui, sans-serif` | Rethink Sans |
| `--font-mono` | `'Geist Mono Variable', 'Geist Mono', monospace` | **delete** |
| `--font-heading` | `var(--font-mono)` | **delete** |

`--font-heading` cannot keep aliasing a family that no longer exists. Both it and `--font-mono`
collapse into `--font-sans`. If either has to survive a release for compatibility, it points at
Rethink Sans — it does not keep its old definition alive.

**This is a visible change and it is bigger than a variable swap.** The 42 `font-heading` usages
render as Geist Mono today, which means headings currently look monospaced *on purpose*, and will
not after. That is the intended outcome, not a regression, but it should be seen before it ships.

### Figures stay tabular, for a different reason

The old rule was `font-heading tabular-nums` on money, because **Inter has no tabular figures**.
Measured at 20px, ten digits:

| Family | `1111111111` | `0000000000` | `8888888888` |
|---|---|---|---|
| **Rethink Sans** | 118 | 118 | 118 |
| Geist Mono | 120 | 120 | 120 |
| Inter | 97 | 134 | 130 |

Rethink Sans is tabular by default, so the `font-heading` half of that rule loses its job.
**Keep `tabular-nums` anyway** — it is inert here and it protects the alignment if the family ever
changes again. Amounts get ~17% narrower (119px vs 144px for `$4.012.550,75`); dense tables and
KPI rows gain room, they do not lose it.

### Weight availability — cleared

Rethink Sans ships Regular, Medium, SemiBold, Bold, ExtraBold (plus italics). **No Light, no Thin.**
The audit counted zero `font-light` and zero `font-thin` in the app, so nothing breaks on this axis.

---

## 2. The two questions that were blocking Dev

Both were decided on 2026-08-01 against a rendered specimen in Figma
(*Foundations → "Typography specimen — heading weight & tracking"*), not from memory.

### 2.1 Is `Heading/Display` really ExtraBold? → **No. It is Bold (700).**

The spec said ExtraBold 800; the app renders `h1` at SemiBold 600 and uses `font-extrabold`
nowhere. Neither was right.

- **Not ExtraBold.** At 24px Rethink Sans ExtraBold reads as a marketing weight — the counters
  close up and it lands heavier than anything else on the screen. This is a finance app: the
  loudest thing on a screen should be the amount, not the heading above it. `Amount/Hero` is
  SemiBold 20; an ExtraBold 24 heading fights it and wins, which is the wrong outcome.
- **Not SemiBold either.** `Section`, `Subsection`, `Card` and `Group` are all SemiBold. If
  `Display` is too, it is distinguished by size alone and the scale has no display voice.
- **Bold 700** gives Display a step of its own without the block. It is also a weight the app
  already ships (35 `font-bold` usages), so nothing new gets loaded.

Applied in Figma: `Heading/Display` binds `weight/Bold`.

### 2.2 Do the negative letter-spacings survive? → **Yes, and the spec was the one that was wrong.**

The app carries `-0.02em` / `-0.015em` / `-0.01em` on `h1`–`h3`. The spec bound **+0.5px** on
`Display` and `Section`. Those are opposite corrections, and the code was closer to right.

Positive tracking is a small-text device: it opens up 10–12px labels and controls where the letters
would otherwise collide. Applied to a 24px heading it just reads loose. Rethink Sans sets
generously by default, so large text wants pulling *in*, not pushing out. The specimen makes this
plain at both 24 and 20.

The `+0.5` on `Display`/`Section` was the `Label`/`Control` convention leaking upward. Fixed.

**The rule, stated once:** *tracking goes negative as size goes up and positive as size goes down.*
Headings 18px and over get negative; everything from 12–16px sits at 0; only `Label/*` and
`Control/*` keep `+0.5`.

### The tracking scale

`tracking/tigh` was a typo. Renamed, and one step added:

| Token | px | Used by |
|---|---|---|
| `tracking/tighter` | -1 | unused — reserved for display type above 24px |
| `tracking/tight` | **-0.5** | unused since 2026-08-02 — `Heading/Display` moved to `wide` |
| `tracking/snug` | **-0.25** *(new)* | `Heading/Section`, `Heading/Subsection` |
| `tracking/normal` | 0 | everything else |
| `tracking/wide` | 0.5 | `Label/*`, `Control/*`, and `Heading/Display` |
| `tracking/wider` | 1 | unused |

**Superseded in part on 2026-08-02.** `Heading/Display` was rescaled to 28/36 and moved back to
`tracking/wide` (+0.5), so it is now the one heading that tracks out and also the largest. The rule
below still holds for `Section` and `Subsection`, which kept `snug`; Display is an explicit
exception in the file. Figma is the source of truth — this is recorded, not argued with, and it is
the first thing to check if display headings ever read loose.

Two negative steps, not three. `Subsection` at 18px takes the same `snug` as `Section` at 20px
rather than earning its own value — the difference would be 0.07px, which is not a design decision,
it is noise.

---

## 3. The 26 styles

Generated values live in `../tokens/tokens.css` as `.ts-*` classes. This is the semantic index —
**what each style is for**, which is the part that cannot be derived from the numbers.

Each class binds all five properties. `font-family` is a **reference** — `var(--font-sans)` — and
`tokens.css` deliberately does not define that variable: defining it there would swap the family
the moment the file is imported, before the font is installed. The app owns `--font-sans`, so
ticket 1 flips all 26 classes in one move. The `Amount/*` classes also carry `tabular-nums`
(inert under Rethink Sans, insurance against the next family).

| Style | Spec | Use it when the text is… |
|---|---|---|
| `Heading/Display` | 28/36 Bold +0.5 | the title of a screen. One per view, at most |
| `Heading/Section` | 20/28 SemiBold -0.25 | a major division inside a screen |
| `Heading/Subsection` | 18/28 SemiBold -0.25 | a division inside a section |
| `Heading/Card` | 16/24 SemiBold | the title of a card or panel |
| `Heading/Group` | 14/20 SemiBold | the label over a group of rows or fields |
| `Body/Base` | 16/24 Regular | running text. The default |
| `Body/Base-Emphasis` | 14/21 Medium | emphasis *inside* running text |
| `Body/Small` | 14/20 Regular | secondary running text |
| `Body/Small-Emphasis` | 12/18 Medium | emphasis inside secondary text |
| `Detail/Large` | 12/18 Regular | metadata, timestamps, helper text |
| `Detail/Base` | 11/16 Regular | the smallest readable metadata |
| `Detail/Emphasis` | 11/16 Medium | the same, when it must be picked out |
| `Detail/Nano` | 10/15 Medium | axis ticks and legends. Nothing a user must read |
| `Label/Base` | 12/17 Medium +0.5 | a form label or a field name |
| `Label/Micro` | 10/15 SemiBold +0.5 | a section eyebrow above a heading |
| `Label/Badge` | 11/11 Medium | text inside a badge or chip. Carries `tabular-nums`: a badge usually holds a count |
| `Amount/Hero` | 24/24 SemiBold | a headline figure — the ones a user opens the screen to read. The KPI strip is five of them |
| `Amount/Large` | 22/26 SemiBold | a figure inside a card — `MetricCard`, a metric beside other content |
| `Amount/Base` | 16/20 SemiBold | a figure in a row or table cell |
| `Amount/Small` | 14/18 SemiBold | a secondary or historical figure |
| `Amount/Micro` | 12/16 Regular | a figure inside dense chrome |
| `Control/XS…XL` | 10·12·14·16·18, Medium +0.5, line-height = size | the label of something you press — button, tab, chip. **Not a field's value**, see below |

### Fields: the value is content, not an affordance

`03-typography.md` had this right and this doc contradicted it by listing "input" under
`Control/*`. Corrected above. **A field's value is body text**, sized to the field — confirmed
against the Figma components on 2026-08-02, where every `Input`, `Select` and `DatePicker` value
binds one of these:

| Field size | Height | Value style |
|---|---|---|
| SM | 28 | `Detail/Large` — 12 Regular |
| MD | 36 | `Body/Small` — 14 Regular |
| LG | 44 | `Body/Base` — 16 Regular |

The reason is the distinction `Control/*` exists for: a button's label is an *affordance* — a fixed
string the system writes, centred on one line, which is why `Control/*` has line-height equal to
size and +0.5 tracking. A field's value is *content the user typed*. Tracking it out and collapsing
its line height treats their data like a button label.

The `input/text/{sm,md,lg}/size` tokens are the same three rungs expressed as component numbers.
They were 11 · 12 · 14 and were realigned to **12 · 14 · 16** when the scale moved on 2026-08-02.

**The platform override dissolved.** Mobile fields had to render at 16px — anything below makes iOS
zoom the page on focus — while the LG rung said 14. The rung is now 16, so the override and the
system agree and no exception is needed. Keep the comment saying why 16 matters; it is still a
behaviour, and it now constrains the rung.

### Overflow — the gap this closed

The system specified the field's box and said nothing about what happens when a value is longer
than it. Figma now does: **the value fills the remaining width and truncates with an ellipsis; the
icons hug and never shrink.** The fill half was already modelled (`FILL` on the value, `HUG` on the
icons in `Select` and `DatePicker`); the truncation was added to all 54 value nodes across `Input`,
`Select` and `DatePicker`.

### Why `Amount/*` exists at all

`Amount/Base` and `Body/Base` are both 14/21 and differ only by weight. That is deliberate: a
figure carries more weight than the words around it, and pairing them at the same size keeps a row
on one baseline. **Money always takes an `Amount/*` style**, never `Body/*` — even when the size
matches. This is the rule that resolves most of the ambiguity in §4.

Two corollaries, both settled against live code on 2026-08-02:

- **Never `Heading/*` either.** Figma's own `KPI-Card` had its figure bound to `Heading/Section`
  (20/28) — a heading style on money, which this rule forbids. Rebound to `Amount/Hero`, which is
  the same 20 SemiBold at the tighter 24 line height.
- **A figure is never smaller than the label beside it.** The `Amount/*` scale has no 11px rung
  (10 · 12 · 14 · 17 · 20) while `Detail/Large` and `Label/Base` both sit at 11. So money rendered
  at 11 rounds *up* to `Amount/Small` (12), not down to `Amount/Micro` (10). `Micro` is for figures
  inside dense chrome where there is no label to lose to. No 11px rung is being added: a rung that
  exists only to tie with a label defeats the reason `Amount/*` is heavier in the first place.

---

## 4. How to classify the 352 declarations

The audit's central finding: 14px maps to five styles and 10px to six, so **size does not identify
a style**. The test is always *what is this text*, in this order:

1. **Is it money?** → `Amount/*`, at the size the layout already uses.
2. **Is it the label of something you press?** (button, tab, chip) → `Control/*`, sized to the control.
   A *field's value* is not this — see the field rule below.
3. **Is it a title?** → `Heading/*`, by depth — screen, section, subsection, card, group.
4. **Is it a name for something else?** (form label, eyebrow, badge) → `Label/*`.
5. **Is it prose the user reads?** → `Body/*`.
6. **Otherwise** → `Detail/*`.

Weight is not a free choice. Within `Body/*` and `Detail/*`, Medium means *emphasis*, and
**emphasis in running text is Medium, never SemiBold.** The audit found 35 places where
`font-semibold` sits on a body size. Each one is one of two things:

- a figure wearing a body size → it becomes `Amount/Base` or `Amount/Small`, and the SemiBold is
  correct after all;
- a genuine emphasis → it becomes `Body/Base-Emphasis` or `Body/Small-Emphasis` (Medium).

Resolve them one at a time. There is no rule that sorts them in bulk.

### Off-scale sizes

| Size | Uses | Goes to | Why |
|---|---|---|---|
| **30px** | ~~2~~ 0 | `Heading/Display` (24) | Already gone by the time the fixes landed |
| **15px** | 5 | `Amount/Large` (1) · `Amount/Base` (4) — now 22 and 16 | **All five are money**, so the prose test does not apply — the `Amount/*` scale does. `AnnualTable.tsx:54` is the donut's principal figure and already Bold → `Amount/Large` (17/26). The four the file itself calls "Secondary KPIs" → `Amount/Base` (14/21), which is *a figure in a row or table cell* |
| **13px** | ~~1~~ 0 | `Body/Small` (12) | Was Toast's only usage; closed in `590fbf8f` |
| **`text-[12px]`** | 9 | `text-xs` | Duplicate spelling of a size that already has a name |
| **`text-[0px]`** | 1 | leave | `IngresosCard.tsx:202`. **This row was wrong.** Dev checked it: nothing is being hidden — it is `font-size: 0` collapsing the JSX whitespace between two inline spans that each set their own size. `sr-only` there would remove a visible figure from the page. The mechanism stays, now with a comment saying why |

**Remaining after the component-gap fixes:** 15px only. The gap audit and this one were closing the
same debt from opposite ends — see `08-component-gap.md` §2.

**9px was never off-scale.** `Detail/Nano` is 9/14 Medium and exists for exactly it.
`Sidebar.tsx:90` is `9px / medium / leading-14 / tracking-0` — the same five values, hand-written;
it is a class swap, not a decision. The other 9px, `EgresosCard.tsx:518`, is not Nano at all: it is
a filter-count bubble, the same element as the header's notification count, so it takes
`Label/Badge` and its circle grows 14 → 15px to match. One piece of UI living at two sizes in two
files is the §5 symptom of `08-component-gap.md`, not a typography question.

### `text-2xs` — resolved

It defined 10/14 under a name nothing used, while 44 places hand-wrote `text-[10px]`. Dev deleted
it in `2eb15cd7`; the replacement already existed as `.ts-detail-base` (10/15). Those 44 usages
land there.

### Line heights

36 `leading-*` usages against 352 size declarations: most text inherits its line height today.
All 26 styles bind one, so **most text will shift vertically** when the classes land. That is the
change that makes ticket 3 need a visual pass, more than the family swap does.

---

## 5. Sequencing

Dev's three-ticket shape is right and is adopted:

1. **Install and collapse the family.** Add Rethink Sans, drop Geist Mono, repoint `--font-sans`,
   delete `--font-mono` / `--font-heading`. Mechanical, reversible, safe without design review.
2. **Encode the 26 styles** as classes, so a style is one class binding all five properties and
   `text-[11px]` stops being a decision made 59 times.
3. **Classify the 352 declarations** against §4, resolving the off-scale sizes and the 35 emphasis
   cases as they come up. **This is the one carrying visual change** — it needs the same light/dark
   pass the radius work needed, ideally in batches.

Ticket 1 does not wait on anything. Ticket 3 does not ride along with ticket 1.

---

## 6. What this does not decide

- **Italics.** Rethink Sans ships them; the system does not use them and this spec does not add
  them. If a use appears, it gets a style, not an ad-hoc `italic`.
- **Component-level type.** 58 previews in `design-system/components/` against 23 in
  `src/components/ui/`, and nothing has compared form, spacing or states — only tokens. Type
  inside components is part of that audit, not this one.
- **The 30px case.** Two usages. Someone has to look at them and say whether the system needs a
  step above Display or those two are wrong.

---

## 7. Call log — header, batch 2

Three questions from `docs/reports/2026-08-01-buttons-batch2-header.md`. Answered here because the
answers are spec, not one-offs.

### The "Neto" wordmark → **no text style. It is brand chrome.**

Not `Heading/Card`, not anything else. A text style is a *semantic role in running UI*; a wordmark's
job is to be invariant. Binding it to `Heading/Card` means the logotype moves the next time card
titles do, which is exactly the coupling to avoid — same reasoning that kept the provider colours
out of the palette.

It keeps explicit values, frozen: **16px · Bold · -0.4px tracking**, which is what it renders today.
The one thing that must change is the family reference — it read `var(--font-heading)`, and that
variable is gone. Point it at `var(--font-sans)` and the pixels stay put.

If the wordmark ever becomes a real logotype (drawn, not typeset), this whole question disappears.

### The notification count → **yes: 9px → 10px, `Label/Badge`.**

That style exists for this: `line-height` equals `font-size` so a single line centres inside a chip
without fighting the padding. The weight drops Bold → Medium; at 10px on a solid `--primary` fill
that holds, and if it reads thin in the screenshot that is a finding about `Label/Badge` itself, not
a reason to special-case the header.

**`Label/Badge` now carries `tabular-nums`** in the generator. A badge usually holds a count, and
9 → 10 → 99 must not reflow the chip. That removes the hand-written `tabular-nums` at the call site.

### Avatar initials → **not a text style at all.**

They are a graphic stand-in for an image, sized by the component that holds them:

| Avatar | `avatar/size/*` | `avatar/font-size/*` |
|---|---|---|
| SM | 32 | **12** |
| MD | 40 | **14** |
| LG | 48 | **16** |
| XL | 56 | **18** |

Weight is SemiBold, from the component. So: the 32px header avatar takes **12px** (it ships 10 — a
real change), and the 44px drawer avatar already ships 14px, which is right for its size but the
**44px itself is off-scale** — the Avatar steps are 32 · 40 · 48 · 56. That one resolves in the
Avatar migration, not here.

While confirming this I found the Figma `Avatar` was still typesetting its initials in **Inter**,
with `fontFamily` and `fontStyle` unbound. Fixed, and see §8.

### And one that was not asked: the 32px icon button

`IconButton` has no 32px step, and that is deliberate — 24 · 28 · 36 · 44 pairs with the Button
heights at `sm`/`md`/`lg`/`xl`. Adding a 32 to fit one avatar trigger would break that pairing for
everything else. Growing it to 36px was the right call.

---

## 8. The family sweep nobody had run

Deciding on one family is not the same as the file using one. Swept all 16 pages:

| Where | Off-family text nodes | Now |
|---|---|---|
| `Screens · Neto (WIP)` | **246 of 246** — Inter 190, Geist Mono 56 | converted |
| `Foundations` | **378** — the documentation page itself, all Inter | converted |
| `Components · Rows` | 14 masters — the `·` separator glyph, Inter | converted |
| `Components · Icons & Avatar` | 4 — the Avatar initials, Inter | converted |
| `Screens & exploration` | 7 | converted |
| everything else | 0 | — |

**649 text nodes were still on a family the system had already dropped**, including the Foundations
page that documents the family decision. Reversible through Figma version history if any of the WIP
screens were being kept as a deliberate "before".

The lesson generalises past fonts: a decision recorded in tokens and styles does not propagate to
nodes that were authored before it. Anything ratified needs a sweep, not just a token edit.
