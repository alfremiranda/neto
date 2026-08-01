# 2026-08-01 — typography-3 batch 3: the MesView default tab

`KPIStrip`, `IngresosCard`, `DistribucionCard` — everything visible when the app opens.
Screenshots: `2026-08-01-typo-batch3-mesview-{light,dark}.png`.

DID:
- **Zero size/weight/leading/`font-mono` utilities left in the three files.** 23 declarations
  classified. Verified on the running page, not in the diff:

| Style | Computed | Spec |
|---|---|---|
| `Label/Micro` (KPI label) | 10/15 w600 ls+0.5 | ✅ |
| `Amount/Hero` (KPI figure) | 20/24 w600 tabular | ✅ |
| `Body/Base-Emphasis` (row title) | 14/21 w500 | ✅ |
| `Amount/Base` (row figure) | 14/21 w600 tabular | ✅ |
| `Amount/Micro` (secondary figure) | 10/15 w400 tabular | ✅ |
| `Detail/Large` (metadata) | 11/17 w400 | ✅ |

- The KPI label was a textual match for the spec — *"`Label/Micro` is the KPI label: uppercase,
  wide tracking"*. Its tracking moves 1px → the style's 0.5px.
- Every `Amount/*` now carries `tabular-nums` from the generator, which is what `font-mono` used
  to be doing. That is the substitution `07 §1` predicted, now visible in the computed styles.

FOUND — three things, one of which changes the remaining work a lot:

**1. The buttons ticket has 10 left, not 45.** Its DONE WHEN is "zero raw `<button>` **with its
own radius**". Measured across `src/**`: only **10** of the 45 raw buttons carry one —
`AppErrorBoundary` 2, `MonthNav` 2, `ProfileView` 2, `DatePicker` 1, `SheetBase` 1, `FAB` 1,
`EgresosCard` 1. The other 35 are structural tap targets: a full-width mobile row, chart segments,
legend items. They have no radius, no button chrome, and converting them to `<Button>` would fight
their layout rather than serve it. The three in this batch are of that kind, so this batch has no
button work — correctly, not by omission.

**2. `IngresosCard.tsx:202` is not the hack the gap audit thought.** `08-component-gap.md` records
`text-[0px]` as "a visual-hiding hack… replace it with `sr-only`". It is not hiding anything: it
is `font-size: 0` on a parent to collapse the JSX whitespace between two inline spans that each
set their own size. **`sr-only` there would remove a visible figure from the page.** I classified
the two children (`Amount/Small` and `Detail/Large`, both exact matches) and left the mechanism,
with a comment saying why. Worth correcting in the audit so nobody acts on it later.

**3. `Amount/*` has no 11px rung, and money is being rendered at 11px in two places.** The scale
is 10 · 12 · 14 · 17 · 20. `KPIStrip`'s tooltip breakdown and `IngresosCard`'s secondary figure
both render money at 11. I sent both to `Amount/Small` (12) rather than `Amount/Micro` (10), on
the reasoning that a figure should not be smaller than the label it sits beside — the doc's own
argument for why `Amount/*` exists is that money carries more weight than the words around it.
**It is a judgement call and it grows those figures by 1px.**

DECISIONS:
- `KPIStrip`'s figure took `Amount/Hero` (20/24 SemiBold), which its current 20px SemiBold matches
  exactly. The doc indexes `Amount/Large` as "a KPI figure" at 17 and `Amount/Hero` as "the one
  figure a screen exists to show" — and there are five KPIs here, so by the index none of them is
  a Hero. I preserved the render and am flagging the semantics rather than shrinking the five most
  prominent numbers on the screen on my own reading.
- `DistribucionCard`'s percentages took `Amount/Small`. A percentage is not money, but it is a
  figure, and 12/SemiBold matched exactly.

NEEDS:
- **Design: two calls** — is the KPI strip figure `Hero` or `Large` (20 vs 17), and does money at
  11px round to 10 or 12? Both are live in the app right now at my reading.
- **Orchestrator: the buttons ticket is nearly done** — 10 buttons across 7 files. Worth deciding
  whether the 35 radius-less tap targets are out of scope permanently (my reading) or a separate
  "interactive regions" concern.
- Remaining off-scale text: `15px` (5) and `9px` (2). Neither is in a view I have batched yet.
