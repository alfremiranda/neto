# 17 — Elevation

Created 2026-08-19 at Alfredo's request: *"define the elevation scale yourself, per best
practices"*. Before it there were **0 effect styles in Figma** and **21 shadows in the code**, 19
of which were Tailwind defaults — that is, nobody chose them: they came with the framework.

References consulted: [Atlassian Design · Elevation](https://atlassian.design/foundations/elevation)
and [Elevation Design Patterns · designsystems.surf](https://designsystems.surf/articles/depth-with-purpose-how-elevation-adds-realism-and-hierarchy).
What is taken from each is stated below, not assumed.

## The decisions, and why

### 1. Four rungs

The guidance says **4–6 layers** and warns that more produces decision fatigue. Four is also what
this codebase's own evidence supports: grouping the 21 shadows by *what they hold up* yields
exactly four groups, not five or six.

| rung | what uses it today | where it came from |
|---|---|---|
| `raised` | `Switch` thumb, sidebar items, `App.tsx:44` | `shadow-sm` ×4 |
| `menu` | `Popover`, `Select`, chart tooltips, the `Header` menu | `shadow-md` ×2 (+ 3 from `lg`) |
| `floating` | `FAB` | `shadow-lg` |
| `overlay` | `Sheet`, `Drawer`, `Dialog`, `RowActionsSheet` | `shadow-xl` ×2, `shadow-2xl` |

**`shadow-lg` had ten uses doing four different jobs** — chart tooltip, dialog, FAB, sheet panel
and a switch thumb. That is the exact symptom of a scale named by size: when you do not know
which one goes, you take the middle one.

### 2. Named by role, not by size

The reference allows both conventions. Semantics wins here without argument, because it is the
same decision already taken in `Badge` (`Tone`, not `Color`) and in motion (`fast`, not `150`).

The practical difference: `shadow-lg` **forces a comparison** with `md` and `xl` before you can
choose. `overlay` **chooses itself** — either the surface takes over or it does not.

Each rung carries the question that picks it, and the four questions are mutually exclusive:

- **raised** — does it lift *without ceasing to belong* to the page?
- **menu** — is it *tied to what you pressed*, gone when you look away?
- **floating** — does it stay above *attached to nothing*, without covering what is below?
- **overlay** — does it *take over*, with a scrim behind?

### 3. Two layers per rung: key light and ambient light

A single shadow looks like a pasted cut-out. Two layers — one short and directional that states
the height, one long and diffuse that rests it — is the standard technique, and it is what makes
`xl` read as depth rather than as a smudge.

`color/shadow/key` is the short one; `color/shadow/ambient` the long one. They are variables, not
values buried inside the style, precisely so dark mode can change them.

### 4. The shadow is tinted slate, not pure black

`slate-900` at 20% and 10% in light, not `#000`. Neto's whole palette is slate; a pure black
shadow over `slate-50` reads as dirt rather than light. It is a small difference against what
Tailwind paints today, and it is deliberate: Alfredo asked for best practices, not zero change.

### 5. **In dark the surface leads.** This was measured, not assumed

Atlassian says it — "shadows can be harder to see in dark mode" — and I checked it in our own
file before believing it. With the page at `slate-950` and the four rungs drawn with shadow
alone, all four came out **indistinguishable**. I pushed the dark shadow to black at **90%** key
and **70%** ambient and they were **still indistinguishable**: black over near-black is not
depth, it is nothing. I put the values back to 50%/30%, which is what makes sense when there is
a scrim behind.

The fix is Atlassian's: **each rung carries two tokens, shadow and surface.**

| rung | surface light | surface dark |
|---|---|---|
| `raised` | white | `slate-900` |
| `menu` | white | `slate-800` |
| `floating` | white | `slate-700` |
| `overlay` | white | `slate-700` |

In light all four are white and the shadow does all the work. In dark the surface climbs the
ladder and it is the surface that reads.

**`floating` and `overlay` share a surface on purpose.** What separates a modal from a FAB is not
colour, it is the scrim. A fifth slate tone would add no information, and at that height the grey
starts competing with the text.

## Left out

- **The two `shadow-[0_0_0_1px_…]` in `sidebar.tsx:475`.** A `box-shadow` with no blur is not a
  shadow: it is a border written in the wrong place. They are focus geometry and belong to the
  focus ring, not to a rung of this scale. **They are not this document's debt.**
- **`sunken`.** Atlassian has a sunken rung for content wells. Neto has none: `Empty` solves "a
  real container, but empty" with the dash, the only one in the system (`00-principles §B2`).
  Adding `sunken` would be inventing demand.
- **Depth animation in charts.** `EgresosBreakdown` animates the width of a bar: that counts
  something, it does not lift.

## What is still missing

The **21 shadows in the code are still Tailwind's**. Migrating them is a change in `src/**` and
by `00-principles §B3` belongs to Dev. What changed today is that there is somewhere to take
them from, and that the next surface to lift does not have to choose between `md` and `lg` by eye.

There is also a pipeline gap: the four rungs are **effect styles**, not variables. The exporter
does not see them yet — reported in `docs/inbox/dev/FYI-2026-08-19-elevacion.md`.


---

## Correction, 2026-08-20 — the ladder never accounted for the card

Alfredo caught this reviewing phase 1.2: `wrap/card` did not match the plan.

The table in §5 assigns the four rungs against **the page** (`slate-950`) and stops there. But a
card is not the page — it is already a lift off it, and `wrap/card` (now `bg/surface`) had been
given `slate-800` independently of this document. The result was measurable and absurd:

| token | Dark before | luminance |
|---|---|---:|
| `bg/surface` | slate-800 | 0.022 |
| `bg/raised` | slate-900 | **0.009** |

**`bg/raised` sat below the surface it exists to lift from.** In Light this was invisible, because
in Light all six surface tokens are `#ffffff` and the shadow does all the work — which is exactly
why the Dark check in phase 1.2 refused to merge them and is the reason the defect surfaced at all.

The fix keeps everything this document decided — four rungs, named by role, surface leads in dark —
and shifts them one to make room for the card as the first lift:

| token | Dark before | Dark after |
|---|---|---|
| `bg/surface` | slate-800 | **slate-900** — a card, the first lift off the page |
| `bg/subtle` | slate-700 | **slate-800** — a tint on a card, not an elevation rung |
| `bg/raised` | slate-900 | **slate-800** — lifted off a card |
| `bg/menu` | slate-800 | **slate-700** |
| `bg/popover` | slate-800 | **slate-700** |
| `bg/floating` | slate-700 | **slate-600** |
| `bg/overlay` | slate-700 | **slate-600** |

Luminance now rises monotonically from `bg/canvas` to `bg/overlay`, and that is now a check rather
than a claim.

### `bg/sunken` in dark is deliberately equal to the page

There is no rung below `slate-950`. Rather than invent a fake one — black at `#000000` is a
luminance difference of 0.002 and reads as nothing — a sunken well in dark is drawn with
`border/subtle` as an inset edge and its fill matches the page on purpose. That is written into the
token's own description so the next person does not "fix" it.

### `bg/container` is now suspect

It is identical to `bg/canvas` in Light (both slate-50) and identical to `bg/surface` in Dark (both
slate-900). It has 21 product bindings and no value of its own in either mode. It is a merge
candidate, recorded here rather than acted on.


---

## Correction 2, 2026-08-20 — five values were carrying nine tokens

Alfredo: *"si crees que es más útil añadir nuevas escalas al color para hacer más evidente la
luminancia, hazlo, de primitive a semantic."*

Measured before deciding. The perceptual steps in the shifted ladder were fine — ΔL* of 6 to 11,
all clearly visible. The problem was not the size of the steps, it was that there were only
**five distinct values for nine tokens**, so every rung collided with its neighbour:

    bg/container = bg/surface     bg/subtle = bg/raised
    bg/menu = bg/popover          bg/floating = bg/overlay

A ladder where half the rungs are the same height is not a ladder.

### Three intermediate primitives

Tailwind's slate stops at 100-unit steps. The gaps that matter for dark elevation — 900→800,
800→700, 700→600 — are ΔL* 8.4, 10.7 and 8.6, each wide enough to hold a rung. Three were added,
**interpolated in CIELAB** between their neighbours rather than in sRGB: a naive midpoint drifts
off slate's hue and reads as a different grey.

| primitive | hex | L* | between |
|---|---|---:|---|
| `color/slate/850` | `#162032` | 12.2 | 900 (8.0) and 800 (16.4) |
| `color/slate/750` | `#283548` | 21.8 | 800 (16.4) and 700 (27.1) |
| `color/slate/650` | `#3d4b5f` | 31.5 | 700 (27.1) and 600 (35.7) |

### The ladder, measured after applying

| token | primitive | L* | step |
|---|---|---:|---:|
| `bg/canvas` | slate-950 | 1.9 | |
| `bg/container` | slate-900 | 8.0 | +6.1 |
| `bg/surface` | slate-850 | 12.2 | +4.2 |
| `bg/subtle` | slate-800 | 16.4 | +4.2 |
| `bg/raised` | slate-750 | 21.8 | +5.4 |
| `bg/anchored` | slate-700 | 27.1 | +5.3 |
| `bg/floating` | slate-650 | 31.5 | +4.4 |
| `bg/overlay` | slate-600 | 35.7 | +4.2 |

Monotonic, eight distinct levels for nine tokens, every step between 4.2 and 6.1 L*.

**Correction, same day.** The two tokens sharing that rung were `bg/menu` and `bg/popover`, and
Alfredo pointed out that both are component names — inconsistent with having just renamed
`wrap/card` to `bg/surface` for exactly that reason. They collapsed into **`bg/anchored`**, named
for §2's question rather than for the widgets that answer it. The ladder now has **nine tokens at
eight levels with no share**, because there are only eight tokens. See `21-token-naming.md` Rule 10.

### A principle that fell out of this

`bg/subtle` recedes by **darkening** in Light (slate-100 under a white card) and by **lightening**
in Dark (slate-800 over a slate-850 card), because in Dark there is nowhere darker to go without
hitting the page. The direction inverts; the invariant is that a tint moves **away from its
surface**. That is written into the token's own description, because it looks like a bug until you
know it is the rule.

### Light is deliberately left with two levels

`bg/canvas` at slate-50 and everything else at white. §5 already decided this — in Light the shadow
does the work — and the scrim carries modals. Adding a Light ladder would mean cards that are not
white, which is a look decision and not a legibility one.

---

## Correction 3, 2026-08-20 — Light gets a real ladder, and hits a ceiling

Alfredo, looking at the four elevation rungs all resolving to `color/white` in Light while each has
its own slate in Dark: *"lo ideal sería crear variaciones en la escala de color no solo en dark
sino también en light, si no, no sería consecuente."*

The principle is right. The measurement says how far it can go.

### Runway is the constraint, not rungs

| mode | page | ceiling | runway |
|---|---|---|---:|
| Dark | `slate-950` (L\* 1.85) | `slate-600` (L\* 35.71) | **33.9 L\*** |
| Light | `slate-50` (L\* 98.18) | **white (L\* 100)** | **1.8 L\*** |

White is a hard ceiling — not a choice. That is why the four Light rungs had collapsed into one
value: there was nowhere to go.

**So the page came down.** With `bg/canvas` at `slate-100` the runway becomes **3.65 L\***:

| token | Light before | Light after | L\* |
|---|---|---|---:|
| `bg/sunken` | slate-100 | **slate-200** | 91.76 |
| `bg/canvas` | slate-50 | **slate-100** | 96.35 |
| `bg/chrome` | slate-50 | slate-100 | 96.35 |
| `bg/subtle` | slate-100 | slate-100 | 96.35 |
| `bg/surface` | white | **slate-50** | 98.18 |
| `bg/raised` · `anchored` · `floating` · `overlay` | white | white | 100 |

Light went from **2 distinguishable surface levels to 4**, monotonic, and cards are now off-white
so that a lifted surface has somewhere to go.

### New slate rungs would not have helped, and the arithmetic is why

Alfredo, mid-flight: *"crea nuevos peldaños en slate si es necesario."* Checked before minting:

    3.65 L* of runway, split N ways above the canvas
       1 level  -> 3.65 L* per step   OK
       2 levels -> 1.83 L* per step   below threshold
       4 levels -> 0.91 L* per step   below threshold

A `slate-25` between `slate-50` and white lands at L\* 99.09 — 0.91 from each neighbour. On a large
flat area that is invisible. **The limit is not the supply of rungs, it is the total runway**, and
minting more names would only divide the same 3.65 L\* more finely while pretending to be a ladder.

Getting four perceptible Light rungs needs the page at `slate-200` — 8.24 L\* of runway, 2.06 per
step, right at threshold — and that makes the page a clearly grey surface. Offered and declined:
Neto stops reading as a light-background app.

### So the consistency is in the rule, not in the values

> **The surface moves away from the page as elevation rises, as far as the mode allows.**

Dark has 34 L\* of room and spends it on eight distinct rungs. Light has 3.65 and spends it on
three. The four top rungs sharing white in Light is now a **stated consequence of the ceiling**,
not an oversight — and the shadow scale is what separates them, which is what §5 decided and
measured in the first place.
