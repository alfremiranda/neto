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

## Three things this surfaced

**1 — `button/size/*/radius` exists but the Button component does not use it.**

The Component collection carries `button/size/sm|md|lg|xl/radius` = 10 · 12 · 14 · 16. The Button
component set binds `radius/full` instead. Those four tokens are currently dead, and any code that
reads them will not match Figma.

Decide which is true before migrating: pill buttons (`full`) or the graduated scale (10–16). The
rendered file says pill.

**2 — Two components bind a spacing token to a radius field.**

`income-itemrow` and `transfer-itemrow` bind `spacing/0` where a radius belongs. The value is
right (0) and the semantics are wrong. Should be `radius/none`.

**3 — The scale has no 10 or 14.**

`button/size/*/radius` uses both. If buttons ever adopt the graduated scale, either those two
steps get added to the semantic scale or the buttons snap to `lg` (8) and `2xl` (16).

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
