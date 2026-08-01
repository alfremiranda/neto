# Radius map

Requested by Dev before migrating `--radius` off `calc()`. This is what every component in Figma
actually binds today — extracted from the file, not inferred.

## The semantic scale

| Token | px |
|---|---|
| `radius/none` | 0 |
| `radius/xs` | 2 |
| `radius/sm` | 4 |
| `radius/md` | 6 |
| `radius/lg` | 8 |
| `radius/xl` | 12 |
| `radius/2xl` | 16 |
| `radius/full` | 9999 |

## What each component binds

| Component | Radius |
|---|---|
| Button · Icon Button · action-chip · FAB · FABAction | `full` |
| Badge · Status · AccountBadge · CurrencyBadge · NotificationBadge · TRMBadge · category-badge | `full` |
| Indicator · Switch · Toast · DistribucionCard · bottom-nav · topnav | `full` |
| Avatar | `avatar/radius` (9999) |
| Input · Select · DatePicker | `input/radius` (8) |
| Card · SectionCard · MetricCard · KPI-Card · AccountCard (legacy) | `xl` (12) |
| IncomeContainer · ExpenseContainer · transferContainer · ProvisionContainer | `xl` |
| TaxContainer | `xl` + `lg` |
| Empty | `xl` outer + `lg` on the media tile |
| menu-item | `2xl` (16) |
| Sheet · RowActionsSheet | `2xl` on the panel + `full` on the drag handle |
| Popover | `lg` (8) |
| Calendar | `lg` container + `md` on day cells |
| Tooltip · Skeleton | `md` (6) |
| Icon Account | `sm` (4) |
| income-itemrow · transfer-itemrow | `none` (0) |

## Three things this surfaced — all resolved 2026-08-01

**1 — `button/size/*/radius` existed but the Button component never used it. → Deleted.**

The Component collection carried `button/size/sm|md|lg|xl/radius` = 10 · 12 · 14 · 16 while the
Button set binds `radius/full`. Verified dead before deleting: zero variable aliases, and zero
node bindings across all 16 pages (~21,500 nodes scanned). The four variables are gone; the
Component collection went from 135 to 131.

**Buttons are pills, at every size.** Ratified by Alfredo on 2026-08-01 *after* the counter-evidence
below, not before it. The generator's button previews render `radius/full`, so
`design-system/components/button.html` and `icon-button.html` match the component again.

> **The counter-evidence, on the record.** Dev found that `src/components/ui/button.tsx` implements
> the graduated scale deliberately — `rounded-[10px]` / `[12px]` / `[14px]` / `[16px]`, with
> comments citing the Figma sizes they came from. So the four tokens were not dead by accident:
> they encoded an intent someone had already shipped. This audit called them dead on Figma
> evidence alone and never checked the code, which is the wrong bar for a deletion. The decision
> still went to pill, but it was made knowing the app changes shape, not by assuming it would not.
>
> **What this costs Dev:** every button radius in the app moves to `rounded-full`, including the
> `icon-xs` / `icon-sm` / `icon-lg` sizes. It is the largest visual change of the migration.

**2 — Two components bound a spacing token to a radius field. → Rebound.**

`income-itemrow` and `transfer-itemrow` bound `spacing/0` on all four corners of both `Device`
variants. Now `radius/none`. Value unchanged (0), semantics fixed; the ~90 instances across
*Rows* and *Blocks · Containers* inherit it, none had an override.

**3 — The scale has no 10 or 14. → Moot.**

Those two steps existed only for the tokens deleted in #1. Nothing in the file needs them, so the
semantic scale stays as-is: 0 · 2 · 4 · 6 · 8 · 12 · 16 · 9999.

## `rounded-md` (10px, 25 usages) — where each one lands

Dev asked whether these go to 8 or 12. Neither, uniformly: 10px is one Tailwind class doing three
different jobs, and **none of the 25 is a card**, which is the only thing the 12 rung is for.
Default is 8; the exceptions are the ones the map already speaks to.

| Usage | Rung | Why |
|---|---|---|
| `ui/tooltip.tsx` | `--radius-md` (6) | Tooltip binds `radius/md` in Figma |
| `ui/skeleton.tsx` | `--radius-md` (6) | Skeleton binds `radius/md` |
| `ui/calendar.tsx:73` (`today` cell) | `--radius-md` (6) | Calendar day cells bind `radius/md` |
| `ui/calendar.tsx:54` (container) | `--radius-lg` (8) | Calendar container binds `radius/lg` |
| `ui/select.tsx:117` (option row) | `--radius-lg` (8) | Sits inside the input/popover family, all `lg` |
| `ui/sidebar.tsx` (8 usages) | `--radius-lg` (8) | **Figma is silent here** — see note below |
| App chrome: `Header`, `MonthNav`, `DashboardView`, `OnboardingView`, `EgresosBreakdown`, `DeductionsPanel`, `AccountEditSheet`, `AppErrorBoundary` | `--radius-lg` (8) | Compositions, not library components. 8 is the interactive rung and the smaller move from today's 10 |

**Nothing goes to 12.** The 12 rung is cards and containers; keeping these at 10-ish sizes on the
8 rung preserves the visual hierarchy that made them read as subordinate in the first place.

**Open, and mine:** the Sidebar component set in Figma binds no radius at all on any node — the 8
above is a judgement call, not a reading. `menu-item`, its nearest specified sibling, is `2xl`
(16), which would be a much rounder sidebar than the app has today. Binding Sidebar properly in
Figma is on the design backlog; until then treat the 8 as provisional and do not let it block
the PR.

## Suggested mapping for `src/index.css`

The app currently derives everything from one base:

```css
--radius: 10px;                          /* or whatever the base is */
border-radius: calc(var(--radius) - 4px)  /* = 6px, "input radius" */
```

Proposed replacement — named, and each one traceable to a component:

```css
--radius-none: 0px;
--radius-xs:   2px;
--radius-sm:   4px;
--radius-md:   6px;   /* tooltip, skeleton, calendar day */
--radius-lg:   8px;   /* input, select, datepicker, popover */
--radius-xl:   12px;  /* every card and container */
--radius-2xl:  16px;  /* sheets, menu-item */
--radius-full: 9999px;/* buttons, badges, avatar, toast, nav */
```

`calc(var(--radius) - 4px)` currently produces 6px, which happens to equal `radius/md`. That
coincidence is why nothing looks broken today — and why it will break silently the first time
someone adjusts the base.
