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

**Buttons are pills, at every size.** That is the decision, and it is now the only thing the file
says. The generator's button previews render `radius/full` instead of the graduated scale, so
`design-system/components/button.html` and `icon-button.html` match the component again.

**2 — Two components bound a spacing token to a radius field. → Rebound.**

`income-itemrow` and `transfer-itemrow` bound `spacing/0` on all four corners of both `Device`
variants. Now `radius/none`. Value unchanged (0), semantics fixed; the ~90 instances across
*Rows* and *Blocks · Containers* inherit it, none had an override.

**3 — The scale has no 10 or 14. → Moot.**

Those two steps existed only for the tokens deleted in #1. Nothing in the file needs them, so the
semantic scale stays as-is: 0 · 2 · 4 · 6 · 8 · 12 · 16 · 9999.

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
