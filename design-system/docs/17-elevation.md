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
