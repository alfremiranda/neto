# 10 — AccountChart and AccountSummaryCard (the account page)

Status: **complete in Figma and handed to Dev on 2026-09-01** (`TASK-2026-09-01e`). The flow
Alfredo approved is §10. Two things are still open and NEITHER is a design decision: where the
detail view lives (§4) and which tooltip language wins (§5a).

Figma: page `Components · Cards` (`302:10368`).
Sets: `AccountChart` (`379:12672`), `AccountSummaryCard` (`379:12631`), both already inside their
matching `doc:` block.

---

## 1. What they are

Alfredo drew them for a specific idea: **each account gets its own page.** `AccountSummaryCard` on
top — identity, metrics, 30-day chart — and below it the transactions container that already
exists today in `CuentasView`.

`AccountSummaryCard` **does not replace `AccountCard`**. That one is the compact, selectable tile
in the grid; this is the detail view of a single account, which is why it includes the chart. The
two coexist.

| | `AccountCard` | `AccountSummaryCard` |
|---|---|---|
| where | grid in `CuentasView` | header of an account page |
| size | ~150–220px wide | 680px |
| selection | yes, it is a control | no, you are already inside |
| chart | no | yes |

## 2. What I found, and what I fixed

First, the good part: **both were well built.** Every text on a text style, zero raw hex, and
`AccountSummaryCard` composes real instances of `Button` (Outline/SM), `Separator`, `Icon` and of
`AccountChart` itself — not copies. That is the expensive thing to get right and it was already
right.

What I corrected:

**The chart series borrowed other components' tokens.** The main stroke used
`badge/primary/foreground` — a Badge token — and the legend used `interactive/primary`: two
different sources for the same colour. The debt series used raw `color/rose/600`, skipping the
component layer. There are now six `account-chart/series/*` tokens of its own. The colour on
screen did not change; what changed is that if Badge shifts its accent, the chart no longer moves
with it.

**The debt band was painted twice.** In `Series=Dual`, the vector of the debt *line* also carried a
fill gradient copied from the area. The balance group does not. I removed the fill: the band now
has the opacity it was designed with, not twice it.

**A gradient ended in the wrong colour.** The final stop of the debt area pointed at `cyan/500/0`
instead of `rose/500/0`. Invisible — alpha 0 — until somebody raises that opacity.

**The X axis repeated a date.** It read `1/7 · 25/7 · 10/7 · 15/7 · 20/7 · 25/7 · Hoy`. The second
tick should have been `5/7`.

**`Property 1 = Default | Variant2`.** Now `Series = Single | Dual`, which is what the property
means: one series or two.

**79 layers with generic names** (`Frame 3`, `Group 1`, `Details`, `Vector`, `Container`). Renamed
to the real anatomy: `header / legend / plot / series-balance / series-debt / area / line / marker
/ x-axis / tick`, and in the card `top / account-info / title-row / identity / account-meta /
metrics / metric / chart / divider`. Two frames were called `Deuda actual` while containing
"Intereses" and "Saldo actual" — names inherited from a copy-paste.

**`title` → `Title`**, for consistency with the rest of the file's properties.

## 3. Tokens

11 new variables in **Components**, all aliases of **Primitives**, light and dark.

| Token | Light | Dark |
|---|---|---|
| `account-chart/series/balance/stroke` | `cyan/700` | `cyan/400` |
| `account-chart/series/balance/fill-from` | `cyan/500/50` | same |
| `account-chart/series/balance/fill-to` | `cyan/500/0` | same |
| `account-chart/series/debt/stroke` | `rose/600` | `rose/400` |
| `account-chart/series/debt/fill-from` | `rose/500/50` | same |
| `account-chart/series/debt/fill-to` | `rose/500/0` | same |
| `account-chart/axis/foreground` | `slate/500` | `slate/400` |
| `account-chart/marker/line` | `slate/500` | `white/70` |
| `account-summary-card/icon/foreground` | `purple/500` | `purple/400` |

The gradients use the same alias in both modes on purpose: they are alpha tints, they lean on
whatever surface is underneath. The debt series does step from `rose/600` to `rose/400` in dark —
`rose/600` on a dark background loses its red and reads brown.

**The tooltip carries no tokens of its own.** It is an instance of the shared `Tooltip` component;
I created `account-chart/tooltip/*` and deleted them once I realised. A token nobody binds is worse
than none.

**Two of these duplicate the semantic layer.** `axis/foreground` is exactly `foreground/subtle` and
`marker/line` is exactly `border/strong`. I created them because the rule is that a new component
gets its own tokens in Components bound to Primitives. If you would rather they follow the semantic
layer, they can be repointed in a minute — but then the rule needs a written exception, not a
case-by-case decision.

## 4. The blocker is not a design one

I checked the repo before writing this:

- **There is no router.** `react-router` is not in `package.json` and there is no `<Routes>`
  anywhere. Views change by state: `uiStore.view` with `ViewType`, and `App.tsx` does
  `{view === 'cuentas' && <CuentasView />}`. "Each account has its page" needs either a new view
  with a selected account id, or a router. **That is an architecture decision, for the orchestrator
  and Dev, not mine.**
- **d3 is already installed**, and `src/components/annual/TrendChart.tsx` already draws an area
  with axes and a tooltip. `AccountChart` needs no new dependency: it needs to reuse that pattern.
  It is the first thing whoever implements it should read.
- **`AccountCardView.tsx` already exists** and `CuentasView` already renders card-on-top +
  transactions-below for the selected account. The account page does not start from zero: it starts
  from splitting that in two.
- **This is what makes the breadcrumb necessary**, the one finished yesterday (`docs/09`).
  `Cuentas › CMR Falabella` is exactly the 2-level case.

## 5. Three open decisions

**a. ~~The tooltip.~~ RESOLVED 2026-09-02.** It was never a tie. Five call sites already use
`ui/tooltip.tsx`, which renders `bg-foreground` + `text-background` — the inverted bubble Figma
draws. `TrendChart.tsx:269` is the only one that hand-rolls `--popover`, and `--popover` is the
**Popover** component's language: an anchored panel, 288px, desktop-only. `TrendChart` is the
outlier and migrates.

Three things the choice made me settle, none of which were in the original framing:

1. **A data readout is not a short explanation, but it is not a different bubble either.** Only
   the CONTENT differs — the surface, the arrow, the inversion and the cap are the same object.
   So `Tooltip` gained a `Content` instance-swap, the same shape `Sheet` uses, with `TooltipText`
   as the default sentence and `TooltipReadout` as the readout. Forking the bubble would have put
   the inversion in two places. `ReadoutRow` carries one line; its `Divider` draws the hairline
   ABOVE the row, so a group boundary belongs to the row that opens the group instead of being a
   blank item slipped between two rows, which is what `KPITooltipContent` does today.

2. **The chips cannot follow the mode.** `bg/inverse` is slate/900 in Light and white in Dark, so
   a swatch that took the current mode's series colour would be painted on the surface it was NOT
   chosen against. Measured against `bg/inverse`, every category colour fails 3:1 in Dark —
   `tax` 1.44, `provision` 1.92, `income` 1.80, `net` 2.43, `expense` 2.77 — and `income` also
   fails in Light at 2.66. `readout/swatch/*` is therefore a single rung per series that clears
   3:1 on BOTH surfaces (amber/700 5.02·3.56 · red/500 3.76·4.74 · cyan/600 3.68·4.85 ·
   emerald/600 3.77·4.74 · blue/500 3.68·4.85 · rose/600 4.70·3.80). Same value in both modes, on
   purpose. The chart's own line keeps its mode pair: it sits on the card, not on the tooltip —
   one job per token.

   `tax` is the fourth amber/400 contrast failure in two days (ss glyph 1.61, account dot 2.91,
   Progress fill 1.52, and now 1.44). It is a rung problem, not four site problems.

3. **Mobile gets the readout, and not as a tooltip.** Dev is right that `TrendChart` binds
   `mousemove`/`mouseleave` only, so on a phone the chart is interactive and the figures never
   appear. `tooltip.html` already forbids that. The answer is not a touch tooltip: the selected
   point's figures belong in `AccountSummaryCard`'s own `metrics`, which already exist and already
   lead with "Saldo actual". Hover on desktop and tap on mobile both do the same thing — move the
   selection — and the card reads it out. This is how the stock apps in Alfredo's `chart-range`
   reference behave. The floating bubble becomes desktop sugar on top of a readout that is always
   visible.

The inverse surface also gained the two roles it was missing, because both were being hand-rolled:
`fg/on-inverse-subtle` (the label column, 9.1:1 Light / 4.76:1 Dark) and `border/on-inverse` (the
hairline, decorative, no minimum). `KPITooltipContent`'s hardcoded `white/20` would have drawn a
white line on the white Dark surface.

**b. ~~The account icon's colour.~~ RESOLVED 2026-09-01.** Neither purple nor grey: it is an
`AccountAvatar` carrying the account's own hue, which is what `25-account-color.md` §2 always
said and what `AccountCardView` already rendered. `AccountSummaryCard`'s fixed
`account-summary-card/icon/foreground` is retired and has no consumer left.

**c. `Bank Account` hides "Intereses" and still shows the rate.** The variant hides the secondary
metric and its meta line still says `3.5% a.a. · ≈ COP 0,00/mes`. `Savings` shows both. It may be
intentional; I did not touch it.

## 6. Mobile — added later

`AccountChart` and `AccountSummaryCard` gained a second dimension. **The property is called
`Device`, not `Breakpoint`.** I started by calling it `Breakpoint` and renamed it on seeing that
the whole file already used `Device`: `MonthNav`, `topnav`, `IncomeContainer`, `ExpenseContainer`,
`transferContainer`, `income-itemrow`, `outcome-itemrow`, `savings-itemrow`, `transfer-itemrow`. An
existing convention beats a better invented one.

| Set | Before | Now |
|---|---|---|
| `AccountChart` | `Series` (2) | `Series` × `Device` (4) |
| `AccountSummaryCard` | `Type` (4) | `Type` × `Device` (8) |

**AccountChart · Device=Mobile — 348 × 180.** 348 = 380 of card minus 16 of padding on each side.
Three decisions:

- **The axis goes from 7 ticks to 4** — `1 · 10 · 20 · Hoy`, every ten days. Seven 11px labels in
  348 pixels are a picket fence; they read as texture, not as dates.
- **The tooltip drops the year.** `13 Jul 2026` → `13 Jul`. In a 30-day window the year is always
  the current one: it is the least informative token in the string and the one that costs the most
  width.
- **The tooltip was unpinned from `SCALE`.** It came with `SCALE/SCALE` constraints inherited from
  the SVG; on narrowing it would have stretched out of shape. It is now `CENTER/MIN`.

**AccountSummaryCard · Device=Mobile — 380 × 371.** 380 = 412 of screen minus 16 of margin. Padding
drops from 20 to 16. What sits in a row on desktop — identity on the left, metrics on the right —
stacks: identity, the Editar button, and below them the metrics pushed to the edges with
`SPACE_BETWEEN`. The primary metric is `FILL` so its text stays flush right **even when the
secondary is hidden**; without that, `Bank Account` and `Cash` — the two that hide "Intereses" —
left the balance stranded on the left.

The nested chart switches to `Device=Mobile` on its own.

Two things that bit me, noted in case they come back:

- **A `COMPONENT_SET` with auto-layout stretches whatever you put in it.** On `appendChild` of the
  mobile variants, the set (which was `VERTICAL`) resized them to its own width: all eight ended up
  at 1116px. The set has to be put in `layoutMode = 'NONE'` before adding, and each variant's width
  reset afterwards.
- **Watch `clipsContent` when changing axis.** Moving `top` from `HORIZONTAL` to `VERTICAL` left it
  with a `FIXED` height and clipping on: the meta line and the Editar button disappeared with no
  error at all. `HUG` + `clipsContent = false` all the way down the chain.

## 7. The flow page

New page: **`Page - Accounts`**. Four screens and two arrows.

| | desktop 1024 | mobile 412 |
|---|---|---|
| 1 · index | Sidebar + topnav + grid of `AccountCard` | topnav + horizontal carousel + bottom-nav |
| 2 · detail | breadcrumb + `AccountSummaryCard` + transactions | the same, stacked |

Everything is instances: `Sidebar`, `topnav`, `breadcrumb`, `AccountCard`, `AccountSummaryCard`,
`AccountChart`, `IncomeContainer`, `bottom-nav`. Nothing hand-drawn except the page titles and the
flow labels.

The mobile carousel leaves the third card peeking past the edge: it is the same decision already in
the code (`overflow-x-auto` with cards at 46% width), and that peek *is* the signal that there is
more.

## 8. What the page exposed

**There is no transactions container.** In the mock-up I used `IncomeContainer` with its title
overridden to "Movimientos" and its footer to "Saldo actual". It works as a simulation and not as a
deliverable: an account's real container mixes income, expenses and transfers, and the `LedgerRow`
in `CuentasView` still has no component in Figma. Those are two gaps, not one:

1. `LedgerRow` — a transaction row with date, description, amount and running balance.
2. A container to house it. It could be generalising `IncomeContainer` — it already has `SLOT` and
   `Device` — rather than creating a fifth nearly identical container.

Until they exist, the account page cannot be implemented in full no matter how ready the header is.

## 9. What this document does not decide

Where the route lives, how it is navigated to, and whether `CuentasView` keeps the card grid or
becomes an index. All of that is product and architecture.

---

## 10. The flow as shipped (2026-09-01)

Both screens compose the same three pieces, in this order:

    breadcrumb  ·  AccountSummaryCard  ·  LedgerContainer

`Desktop · 2 · Cuenta (detalle)` (`397:359`) and `Mobile · 2 · Cuenta (detalle)` (`397:16540`),
page `Page - Accounts` (`396:16108`).

| Piece | Figma | What it owns |
|---|---|---|
| `AccountSummaryCard` | `379:12631` · 8 | identity, the headline figures, the chart and the range strip |
| `AccountChart` | `379:12672` · 4 | the series. Lost its fixed "Últimos 30 días" label |
| `chart-range` | `938:2` · 1 | the date range, as a variable-length strip of `Segment` |
| `LedgerContainer` | `930:2` · 1 | the card and a `Rows` slot. **No header** |
| `ledger-itemrow` | `857:332` · 12 | one movement, plus `State=Opening` for the starting balance |
| `LedgerEntryIcon` | `849:23160` · 7 | the entry mark, including `Type=opening` |
| `AccountAvatar` | `817:23064` · 24 | the account's colour, and the only thing that carries it |

**Three things this flow decided by removing something**, which is the part worth keeping:

1. **The ledger has no header.** Four of its six items repeated the card above it; of the other
   two, the movement count was noise and Entradas/Salidas summed the whole history while sitting
   under a chart labelled "last 30 days".
2. **The card has no colour banner.** `25-account-color.md` §2 forbids it in as many words, and
   the banner had been contradicting that doc for three days.
3. **The type badge is text, not a pill.** Once the avatar drew the type glyph, the outlined chip
   was a border around a single word.

Each removal was found by putting the thing on the real screen, never by reading the component in
its own `doc:` frame — which is `§A6c`, three times in two days.

### Corrected 2026-09-02 — where the type text goes

This section, `AccountCard`'s description and `TASK-…e §2.5` all said the type sat **junto al
avatar**, in the header, with the name on a line of its own below. Dev built it on the **meta
line** and asked, because the generated `accountcard.html` preview showed it there too — my prose
and my own generated preview had been disagreeing since the badge came out.

Dev's placement wins, for a reason neither of us had written down: **the name is the account's
identity and the type is a classifier.** A header that leads with the classifier and pushes the
identity to a second line has the hierarchy backwards, and on the meta line the type stands beside
the two classifiers it belongs with — currency and number. Dev's own reasons (the savings KIND
already lives there; a fourth header item truncates the name on a 390 viewport; the type had been
accessible only through an `aria-hidden` glyph) all hold as well.

Figma now matches: header is `avatar · name · star`, meta is `currency | type | number`, and the
name is Body/Small-Emphasis clamped to one line with an ellipsis. All twelve variants are 120px
tall instead of 130/120. The name **does** truncate at 220px — that is the shipped behaviour, and
the sample name is long on purpose (`§A3.8`).
