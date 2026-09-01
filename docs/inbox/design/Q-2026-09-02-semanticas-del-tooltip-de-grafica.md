# Q-2026-09-02 — las semánticas del tooltip de gráfica son tuyas

`10-account-page.md` §5a is blocking `AccountChart`, and Alfredo wants you to work the semantics
rather than have me pick. Here is what the code actually says, so the decision rests on facts and
not on my taste.

## §5a is not a tie, and the outlier is TrendChart

You framed it as two languages. It is five to one.

`src/components/ui/tooltip.tsx:43` already renders your sanctioned bubble — `bg-foreground` +
`text-background` with an arrow, which is `bg/inverse` + `fg/on-inverse` exactly as
`tooltip.html` describes it. Five call sites use it: `App.tsx`, `ui/sidebar.tsx`,
`layout/Sidebar.tsx`, `KPIStrip.tsx`, `EgresosCard.tsx`.

`TrendChart.tsx:269` is the only one that hand-rolls its own: `--popover` with a border, a
shadow and `rounded-xl`. So the app already speaks inverted, and Figma agrees with the five.

Migrating it is mechanical and I can do it in an hour. **What I am not doing is deciding what
the object MEANS**, and that is the part below.

## The three semantic questions

**1. A chart tooltip is a data readout, not a short explanation.** Your `tooltip.html` says
"short explanation on hover or focus" and the primitive is `max-w-xs`, `items-center`,
`ts-detail-large` — built for a sentence. `TrendChart`'s carries a title plus N rows of
`swatch · label · amount`, minimum 160px wide. `KPIStrip` already pushes a multi-row breakdown
through the same primitive (`KPITooltipContent`, with its own separator rule at `white/20`), so
the precedent exists — but it exists because someone needed it, not because you specified it. Is
the data readout a variant of Tooltip, or its own element?

**2. Series colours on an inverted surface.** `TrendChart`'s swatches paint the series colours,
chosen against a light card. On `bg/inverse` they sit on near-black in light mode. You just
created six `account-chart/series/*` tokens — do they hold on the inverted surface, or does the
readout need its own on-inverse set? This is the one I would get wrong by guessing.

**3. Mobile gets nothing, and that is your own principle.** I told Alfredo this tooltip works
on touch. It does not — `TrendChart.tsx:233,241` bind `mousemove` and `mouseleave` only. So on
a phone the chart is interactive (the points take a click and set the month) but the readout
never appears at all.

`tooltip.html` says "Desktop only: there is no hover on touch. Anything a mobile user needs to
know must be visible without one." By that rule the amounts behind those points either are not
needed — in which case fine — or they are, and something other than a tooltip has to carry them
on mobile. `AccountChart` will land in exactly the same spot, and mobile is where this app is
actually used.

## What I need back

A decision on 1 and 2, and a position on 3. `AccountChart` and `chart-range` wait on it —
`AccountSummaryCard` is built and takes the chart as a slot, so the moment this is settled the
chart drops in.

Still also waiting on Alfredo, separately: the `1S`/`7D` and `YTD`/`Año` copy.

POINTER: src/components/ui/tooltip.tsx:43, src/components/annual/TrendChart.tsx:233-300,
src/components/cards/KPIStrip.tsx:25 (KPITooltipContent),
design-system/components/tooltip.html, design-system/docs/10-account-page.md §5a.
