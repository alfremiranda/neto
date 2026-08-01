# Typography

**One family: Rethink Sans.** 26 text styles in 6 semantic groups. Every style binds all five properties — family, weight, size, line height, letter spacing — to the Typography collection. No hardcoded values, no `AUTO` line heights.

## Why there is no monospace

Monetary figures used Geist Mono so they would not jitter as values changed. Measured at 20px, ten digits:

| Family | `1111111111` | `0000000000` | `8888888888` | Tabular? |
|---|---|---|---|---|
| **Rethink Sans** | 118 | 118 | 118 | **yes, by default** |
| Geist Mono | 120 | 120 | 120 | yes |
| Inter | 97 | 134 | 130 | **no** |

Rethink Sans is already tabular, so the monospace face was doing nothing the family does not do. It was removed. Keep `tabular-nums` in CSS anyway — harmless, and it protects the day the family changes.

## The six groups

Each group answers *what is this text*, not *how big is it*.

### `Heading/` — structural titles
`Display` 24/32 ExtraBold · `Section` 20/28 SemiBold · `Subsection` 18/28 SemiBold · `Card` 16/24 SemiBold · `Group` 14/20 SemiBold

`Heading/Group` is the most-used header in the app, because `SectionCard` uses it and ten files import `SectionCard`.

### `Body/` — running text
`Base` 14/21 Regular · `Base-Emphasis` 14/21 Medium · `Small` 12/18 Regular · `Small-Emphasis` 12/18 Medium

**Emphasis in running text is Medium, never SemiBold.** SemiBold belongs to headers and figures. Without this rule every size grows three weights and the scale doubles.

### `Detail/` — metadata
`Large` 11/17 Regular · `Base` 10/15 Regular · `Emphasis` 10/15 Medium · `Nano` 9/14 Medium

`Detail/Nano` is the floor. Collapsed sidebar labels only — nothing a user must actually read.

### `Label/` — tracked labels
`Base` 11/17 Medium · `Micro` 10/15 SemiBold · `Badge` 10/10 Medium

`Label/Micro` is the KPI label: uppercase, wide tracking. `Label/Badge` has line height equal to its size so a badge hugs its text.

### `Amount/` — monetary figures
`Hero` 20/24 SemiBold · `Large` 17/26 Bold · `Base` 14/21 SemiBold · `Small` 12/18 SemiBold · `Micro` 10/15 Regular

**Why this group exists when its metrics repeat `Heading/` and `Body/`:** it is the one place where meaning outranks form. If the family ever stops being tabular, or figures need `font-feature-settings`, you touch one group instead of thirty loose styles. In a finance app the figures *are* the product.

### `Control/` — text inside controls
`XS` 10/10 · `SM` 12/12 · `MD` 14/14 · `LG` 16/16 · `XL` 18/18, all Medium

**Line height equals font size.** These are single-line labels centred by auto-layout; a 1.5 line height pushes the text off-centre and grows the control.

There are **no input text styles**. Text inside a field *is* body text — use `Body/Base`, `Body/Small` or `Detail/Large` depending on control size.

## Picking a style

Ask what the text *is*, then take the nearest size in that group. Do not invent a step: the code once had a 17px bold heading, which snapped to `Heading/Subsection` at 18. Snapping to the scale is correct; adding a 17px heading style is not.
