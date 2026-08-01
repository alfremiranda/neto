# Neto — Design System

Source of truth for the visual language of [netofinanzas.app](https://netofinanzas.app).

- **Design source:** [Figma · Neto](https://www.figma.com/design/Q2R72oH6MYxYr1VKAe5nOx/Neto) — 59 components across 10 pages, 700+ variables
- **This folder:** tokens generated from that file, plus one browsable preview per component
- **Nothing here is authored by hand.** `tokens/` is generated; the previews are built from the generated tokens.

## Layout

```
tokens/
  tokens.json        raw export — every semantic and component token, both modes
  tokens.css         CSS custom properties, light + dark + prefers-color-scheme
  tokens.map.css     bridge from the variable names src/index.css already uses
components/          one preview per component (58)
foundations/         colour, typography, spacing and radius scales
docs/                the rules — read these before designing or generating anything
```

## Read this first

| Doc | What it settles |
|---|---|
| [`docs/01-token-layers.md`](docs/01-token-layers.md) | Primitives → Semantic → Component, and which layer you are allowed to touch |
| [`docs/02-composition.md`](docs/02-composition.md) | A component never redraws another component |
| [`docs/03-typography.md`](docs/03-typography.md) | 26 text styles in 6 semantic groups, and why `Amount/*` exists |
| [`docs/04-accessibility.md`](docs/04-accessibility.md) | Measured contrast for every foreground/background pair |
| [`docs/05-handoff-tokens.md`](docs/05-handoff-tokens.md) | **Open handoff to Dev** — the values still pending in `src/index.css` |

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
