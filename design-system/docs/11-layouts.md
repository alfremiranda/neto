# 11 — Layouts: the page template

New page in Figma: **`Layouts`**, right before `Page - Accounts`.

Four templates, taken from the code and not the other way round: desktop base, desktop with the
sidebar collapsed, desktop Mes, and mobile. The dashed blocks are content slots — they mark where
a card goes, not which card.

---

## 1. Why this appeared

Alfredo noticed that the backgrounds in `Page - Accounts` were not the ones in dev. He was right,
for two separate reasons.

**The first is mine.** I painted the frames with `V['surface/page'] || V['surface/base']`. Neither
name exists: the real token is `surface/wrap/default`. `setBoundVariableForPaint` with an
undefined variable **does not throw** — it leaves the `fill` raw. All four frames stayed pure
white with no variable bound, and nothing warned me.

It is the fourth time I have made the same mistake in this project and it has a shape now: **I
used an instrument outside its range and did not verify the result.** Before it was a grep
pattern, an alias resolver blind to modes, a Figma reading that was already stale. Now a lookup by
an invented name. The rule I keep missing is always the same: when I construct a lookup key
instead of reading it, I have to check that it found something.

**The second is structural.** My frame put the sidebar full height with the topnav sitting above
the content only. The code does the opposite:

```jsx
<Header />                              {/* full width, above everything */}
<div className="flex flex-row ...">
  <AppSidebar />
  <main className="bg-[var(--background)] overflow-y-auto">
```

The topnav crosses the whole screen and the sidebar starts **below** it. Corrected in both desktop
frames.

## 2. The backgrounds, now bound

Everything was already defined in the semantics. Nothing had to be added.

| Region | Token | Light | Dark | In code |
|---|---|---|---|---|
| main / page | `surface/wrap/default` | `#f8fafc` | `#020617` | `--background` |
| card | `surface/wrap/card` | `#ffffff` | `#1e293b` | `--card` |
| topnav | `nav/background` | `#ffffff` | — | `--card` |
| bottom-nav | `nav/background` | `#ffffff` | — | `--card` |
| sidebar | `sidebar/surface` | `#ffffff` | `#1e293b` | `--sidebar` |

I sampled the pixel from dev's screenshot rather than trusting my eye: the `main` background comes
out `#f7f9fb`, which is `#f8fafc` after the PNG's rescaling. It matches.

**One token corrected.** `sidebar/surface` was **white at 50%**, which over `surface/wrap/default`
renders `#fbfcfe`. The code ships `--sidebar: #ffffff` solid, and the token's own dark mode was
already solid. The asymmetry gave away an oversight rather than a decision, so I moved it to solid
white. **If the translucency was intentional, this has to be reverted** — it is the only change in
this batch that touches an already-published component.

**One token that is missing and I did not create.** The MonthNav's sticky band uses
`color-mix(in oklab, var(--card) 55%, var(--background))`. That is a mix computed at runtime, not a
colour. In Figma I represented it as `surface/wrap/card` at 55% opacity over the page, which is
literally the same thing. I did not invent a new token because a flat token would lie: the value
depends on whatever background is underneath.

## 3. The measurements, from the code

| | value | source |
|---|---|---|
| topnav height | 54 | `Header.tsx`, `height: calc(54px + safe-area)` |
| sidebar expanded | 256 (`16rem`) | `sidebar.tsx`, `SIDEBAR_WIDTH` |
| sidebar collapsed | 65 | `SIDEBAR_WIDTH_ICON` |
| sidebar mobile (drawer) | 288 (`18rem`) | `SIDEBAR_WIDTH_MOBILE` |
| centred container | 1024 (`max-w-5xl`) | `App.tsx` |
| container padding | 16 / 20 / 24 | `p-4 sm:p-5 lg:p-6` |
| bottom-nav height | 58 | Figma component |

**A 1px drift:** Figma's `Sidebar` component measures 255 and the code 256. I did not touch it, but
it is noted — it is the kind of thing nobody sees until someone aligns something against the edge.

## 4. Mes is the only view that breaks the box

The other views — Cuentas, Ahorros, Config, Resumen — sit on the base template: a container centred
at 1024 with padding. `Mes` does not:

- it carries a **sticky band** under the topnav with `MonthNav` inside, and that band is full width
  even though its content is centred at 1024;
- it renders its **tab bar full width, outside the centred container**.

It is the fourth template on the page precisely because it is the exception, and exceptions are
what gets implemented wrong when they are not drawn.

## 5. How the canvas is organised

The two screen pages (`Layouts` and `Page - Accounts`) now follow the same grid, and the next ones
should too:

- **Figma sections, one per device** — `Desktop · 1440`, `Mobile · 412`. The section is what makes
  a page readable at a glance when zoomed out.
- **Padding 64 inside the section, 120 between frames, 160 between sections.**
- **Every frame in a row shares a height**, even where one has space to spare. A row with uneven
  baselines reads as an error before it reads as content.
- **No labels of my own above the frames.** Figma already draws the frame name there; a text of
  mine in the same place is two labels fighting. The frame name *is* the label, so it is worth
  making it say something: `Desktop · 2 · Cuenta (detalle)`.
- **Spec panels go below their frame**, at 24, aligned to its left edge.

Two mistakes I fixed while tidying, in case they come back: **I widened the desktop frames from
1024 to 1440 and did not re-space them**, so they overlapped by 280px — the second covered the
first and they looked like loose white cut-outs. And **inside a `SECTION` a child's coordinates are
relative to the section**, not absolute as on the page: I set `x = 3352` expecting page position
and the mobile frames landed at `x = 6640`.

## 5b. Desktop onboarding: a full-bleed shell, not a floating card (2026-08-19)

Alfredo brought a reference and was right about what made it better. What changed is not
decoration, it is three structural decisions.

**1. The shell goes full bleed and full height.** There used to be a `container · 1024` centred and
floating on an empty page: the same mistake mobile was carrying, a container breathing in the
middle of nowhere. Now there are **two columns reaching all four edges**: a fixed 380 rail and a
panel that fills. The cut between them is not a card border, it is the surface change — which is
what makes it read as an application rather than a form stuck on top.

The 1200 limit Alfredo asked for still holds and now applies **to the content, not the shell**:
rail 380 + padding 64 + column 720 = **1164**. The shell can go full bleed because what has to be
bounded is the reading line, not the background.

**2. The title moves to the panel.** It used to be in the rail, next to the stepper. With the title
out, the rail stays **stable between steps** — logo, one line of context, the stepper — and the
panel carries everything that changes: the `PASO n DE 3` eyebrow, title, subtitle, controls,
footer. Whoever advances sees only half the screen move.

**3. All navigation in the panel's footer.** `Atrás` was at the bottom of the rail and
`Omitir` / `Continuar` inside the card: three controls about the same thing in two places. Now all
three are in one row — `Atrás` left, `Omitir` and `Continuar` right — anchored to the bottom of the
panel.

**And a surface correction that came from measuring, not looking.** The rail started on
`color/wrap/subtle`: correct in light (#f1f5f9 against a white panel, it recedes) and **inverted in
dark** (#334155 against a #1e293b panel — the rail lighter than the panel, advancing when it should
recede). The right token is `color/wrap/container`, which recedes in both modes by construction:
#f8fafc against white, #0f172a against #1e293b. The relationship is not left to the eye: you pick a
token whose two values guarantee it.

**Desktop frames go from 1440×1100 to 1440×900**, which is a real screen size. At 1100 the anchored
footer left a 200px void that exists on no monitor.

The gates — Login and Consentimiento — **carry no rail**: they are not wizard steps, they are
thresholds, and a centred card is right for them. Bienvenida and Listo likewise.

## 6. What this document does not decide

Whether the sidebar should be translucent (§2), and whether Figma's 255 or the code's 256 is the
right one (§3). Both are Alfredo's.
