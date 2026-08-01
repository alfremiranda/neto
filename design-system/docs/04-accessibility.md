# Accessibility

## Contrast

Every foreground/background pair in the Component layer, measured in both modes. WCAG AA requires **4.5:1** for normal text.

| Pair | Light | Dark |
|---|---|---|
| `button/filled` | 5.36:1 | 7.41:1 |
| `button/danger` | 4.83:1 | 5.84:1 |
| `notification/primary` | 5.36:1 | 5.36:1 |
| `sidebar/item` selected | 5.36:1 | 5.52:1 |
| `badge/primary` | 4.89:1 | 5.68:1 |
| `fav/selected` | 4.84:1 | 7.28:1 |

All pass.

### What had to change

Four pairs failed and were fixed in August 2026:

| Pair | Before | After | Change |
|---|---|---|---|
| `button/filled` | 3.68:1 | 5.36:1 | background cyan-600 → **cyan-700** |
| `sidebar/item` selected | 3.68:1 | 5.36:1 | background cyan-600 → **cyan-700** |
| `badge/primary` | 3.36:1 | 4.89:1 | text cyan-600 → **cyan-700** |
| `fav/selected` | 3.07:1 | 4.84:1 | text amber-600 → **amber-700** |

In the first two the **background** moved, because the label was already white and there was nowhere lighter to go. In the last two the **text** moved, because darkening a decorative chip's background turns it into a block of colour competing with the content it accompanies.

`button/filled/background/hover` moved to cyan-800 at the same time — leaving it at cyan-700 would have made hover invisible against the new default.

### Do not undo this

cyan-700 is noticeably more sober than cyan-600. That is the cost of AA with a white label. `interactive/primary`, the filled button and the selected sidebar item now share exactly one cyan, which was the goal. Each token's description records the contrast it had before, so nobody reverts it for looking livelier.

### Measuring correctly

**Composite alpha tokens over their real surface before measuring.** `badge/primary/background` is `cyan-500` at 10%. Measured raw it reads 1.5:1; composited over `surface/wrap/card` the real figure is 3.36:1. The raw number is meaningless and will send you fixing the wrong thing.

```js
const composite = (fg, bg) => {
  const a = fg.a ?? 1
  return { r: fg.r*a + bg.r*(1-a), g: fg.g*a + bg.g*(1-a), b: fg.b*a + bg.b*(1-a) }
}
```

## Beyond contrast

**Row actions are always visible.** Never `opacity-0 group-hover:opacity-100` — there is no hover on touch, and a keyboard user cannot find them.

**Icon-only buttons need an accessible name in code.** The glyph is not a name.

**Touch targets are 44px on mobile**, 32px on desktop. `MonthNav` carries both as a `Device` variant for exactly this reason.

**Destructive actions take two taps.** The first turns the control red and rewrites its label; the second commits. The confirmation happens in place, so the user never loses sight of what they are deleting.

**Tooltips are desktop-only.** Anything a mobile user needs must be legible without hover.

**Dark mode is not an inversion.** It is a second set of values on the same semantic tokens. Anything bound to a Primitive will not follow it — see `docs/01-token-layers.md`.
