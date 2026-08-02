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
`Display` 28/36 Bold +0.5 · `Section` 20/28 SemiBold −0.25 · `Subsection` 18/28 SemiBold −0.25 · `Card` 16/24 SemiBold · `Group` 14/20 SemiBold

`Heading/Group` is the most-used header in the app, because `SectionCard` uses it and ten files import `SectionCard`.

### `Body/` — running text
`Base` 16/24 Regular · `Base-Emphasis` 16/24 Medium · `Small` 14/20 Regular · `Small-Emphasis` 14/20 Medium

**Emphasis in running text is Medium, never SemiBold.** SemiBold belongs to headers and figures. Without this rule every size grows three weights and the scale doubles.

### `Detail/` — metadata
`Large` 12/18 Regular · `Base` 11/16 Regular · `Emphasis` 11/16 Medium · `Nano` 10/15 Medium

`Detail/Nano` is the floor. Collapsed sidebar labels only — nothing a user must actually read.

### `Label/` — tracked labels
`Base` 12/17 Medium · `Micro` 10/15 SemiBold · `Badge` 11/11 Medium

`Label/Micro` is the KPI label: uppercase, wide tracking. `Label/Badge` has line height equal to its size so a badge hugs its text.

### `Amount/` — monetary figures
`Hero` 24/24 SemiBold · `Large` 22/26 SemiBold · `Base` 16/20 SemiBold · `Small` 14/18 SemiBold · `Micro` 12/16 Regular

**Why this group exists when its metrics repeat `Heading/` and `Body/`:** it is the one place where meaning outranks form. If the family ever stops being tabular, or figures need `font-feature-settings`, you touch one group instead of thirty loose styles. In a finance app the figures *are* the product.

### `Control/` — text inside controls
`XS` 10/10 · `SM` 12/12 · `MD` 14/14 · `LG` 16/16 · `XL` 18/18, all Medium

**Line height equals font size.** These are single-line labels centred by auto-layout; a 1.5 line height pushes the text off-centre and grows the control.

There are **no input text styles**. Text inside a field *is* body text — `Detail/Large` (12) at SM, `Body/Small` (14) at MD, `Body/Base` (16) at LG. `Control/*` is the label of something you press; a field's value is content the user typed. The `input/text/{sm,md,lg}/size` tokens are those same three rungs.

## The scale moved up a rung — 2026-08-02

Sixteen of the 26 styles were resized in Figma in one pass. The **structure did not change**: same 26 styles, same six groups, same names, same meanings. What changed is that the reading scale stepped up, and `Amount/` grew faster than the rest.

| Group | Before | Now |
|---|---|---|
| `Body/` | 14 · 12 | **16 · 14** |
| `Detail/` | 11 · 10 · 9 | **12 · 11 · 10** |
| `Label/Base` · `Label/Badge` | 11 · 10 | **12 · 11** |
| `Amount/` Micro→Hero | 10 · 12 · 14 · 17 · 20 | **12 · 14 · 16 · 22 · 24** |
| `Heading/Display` | 24/32 | **28/36** |

Unchanged: `Heading/Section`, `Subsection`, `Card`, `Group`, `Label/Micro`, and the whole `Control/` ramp (10 · 12 · 14 · 16 · 18). Nothing was added, renamed or removed.

Two consequences worth stating outright:

- **`Amount/Large` dropped from Bold to SemiBold** while growing 17 → 22. `Amount/` is now SemiBold throughout except `Micro`, which stays Regular. Weight no longer separates the figure sizes; size does.
- **`Heading/Display` tracks out at +0.5** where `Section` and `Subsection` track in at −0.25. It is both the largest heading and the only one tracking positive. Figma is the source of truth and this is what it says — recorded here so nobody "fixes" it by inference from the rule in `07 §2.2`.

## Picking a style

Ask what the text *is*, then take the nearest size in that group. Do not invent a step: the code once had a 17px bold heading, which snapped to `Heading/Subsection` at 18. Snapping to the scale is correct; adding a 17px heading style is not.
