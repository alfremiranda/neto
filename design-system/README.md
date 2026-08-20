# Neto — Design System

Source of truth for the visual language of [netofinanzas.app](https://netofinanzas.app).

- **Design source:** [Figma · Neto](https://www.figma.com/design/Q2R72oH6MYxYr1VKAe5nOx/Neto) — 59 components across 10 pages, 700+ variables
- **This folder:** tokens generated from that file, plus one browsable preview per component
- **Nothing here is authored by hand.** `tokens/` is generated; the previews are built from the generated tokens.

## Layout

```
tokens/
  tokens.json        raw export — every semantic and component token, both modes
  tokens.css         CSS custom properties, light + dark ([data-theme] and .dark)
  tokens.map.css     bridge from the variable names src/index.css already uses
components/          one preview per component (58)
foundations/         colour, typography, spacing and radius scales
docs/                the rules — read these before designing or generating anything
```

## Read this first

| Doc | What it settles |
|---|---|
| [`docs/00-principles.md`](docs/00-principles.md) | **The constitution.** Layers, invariant rules, the definition of done, and the boundaries — read this one first |
| [`docs/01-token-layers.md`](docs/01-token-layers.md) | Primitives → Semantic → Component, and which layer you are allowed to touch |
| [`docs/02-composition.md`](docs/02-composition.md) | A component never redraws another component |
| [`docs/03-typography.md`](docs/03-typography.md) | 26 text styles in 6 semantic groups, and why `Amount/*` exists |
| [`docs/04-accessibility.md`](docs/04-accessibility.md) | Measured contrast for every foreground/background pair |
| [`docs/05-handoff-tokens.md`](docs/05-handoff-tokens.md) | **Open handoff to Dev** — the values still pending in `src/index.css` |
| [`docs/06-radius-map.md`](docs/06-radius-map.md) | Which radius token each component binds — input for the `--radius` migration |
| [`docs/07-typography-rethink-sans.md`](docs/07-typography-rethink-sans.md) | **Open handoff to Dev** — the Rethink Sans migration spec: weight, tracking, and how to classify 352 declarations |
| [`docs/08-component-gap.md`](docs/08-component-gap.md) | **Open handoff to Dev** — where the components themselves disagree: form, spacing, states |
| [`docs/09-breadcrumb.md`](docs/09-breadcrumb.md) | The first component born in Figma before the code, with its 15 tokens and two non-obvious decisions |
| [`docs/10-account-page.md`](docs/10-account-page.md) | `AccountChart` and `AccountSummaryCard`, and the router that does not exist yet |
| [`docs/11-layouts.md`](docs/11-layouts.md) | The page template, the canvas grid, and the desktop onboarding shell |
| [`docs/12-app-state.md`](docs/12-app-state.md) | **What the system is**, measured: the validator run, the three gaps, and why Storybook waits on the exporter |
| [`docs/13-rename-map.md`](docs/13-rename-map.md) | How Figma names translate into published CSS keys — the exporter's authored input |
| [`docs/14-component-inventory.md`](docs/14-component-inventory.md) | What is missing, measured in both directions, and what is deliberately not missing |
| [`docs/15-motion.md`](docs/15-motion.md) | Five durations and four curves, named from the code's own counts |
| [`docs/16-marks.md`](docs/16-marks.md) | Third-party marks and flags: the one colour rule that does not apply |
| [`docs/17-elevation.md`](docs/17-elevation.md) | Four rungs named by role, and why in dark the surface leads instead of the shadow |
| [`docs/18-consent.md`](docs/18-consent.md) | The consent gate: the legal constraints that shaped every sentence |
| [`docs/19-choice-rows.md`](docs/19-choice-rows.md) | ChoiceRow and AccountRow, and the focus ring that tinted its own fill |

## The short version

**One type family.** Rethink Sans, tabular by default — that is why monetary figures need no monospace face.

**Three token layers, one rule.** Design with `Semantic`. Never reach into `Primitives`. `Component` tokens belong to the component that names them.

**Spanish is product content, English is documentation.** UI strings, dates and currency are es-CO. Layer names, token names, descriptions and these docs are English.

**Amounts are the product.** `Amount/*` text styles and `kpi/*` colours exist as their own group even where the metrics repeat other groups, because a finance app's figures must be able to change without dragging the rest of the system with them.

## Consuming the tokens

`tokens.css` is generated truth. `tokens.map.css` maps it onto the variable names the app already uses:

```css
@import "../design-system/tokens/tokens.css";
@import "../design-system/tokens/tokens.map.css";
```

Then delete the corresponding declarations from `src/index.css`. This is **not** wired up yet — it is a build change and needs its own review. Read the `NO EQUIVALENT` block at the bottom of `tokens.map.css` first: five variables have no counterpart and need a decision, not a mapping.

## Regenerating

Tokens are exported from Figma and rebuilt with `build.py`. Do not edit `tokens/*` by hand — the next export overwrites it. If a value is wrong, it is wrong in Figma.
