# 09 — Breadcrumb

Status: **built in Figma, no code yet.** Awaiting Alfredo's review before a ticket goes to Dev.

Figma: page `Components · Navigation` (`302:10369`).
Sets: `breadcrumb-item` (`385:15243`) and `breadcrumb` (`385:15322`).

---

## 1. Why it exists

There is no breadcrumb in `src/`. The app navigates by tabs and a sidebar today, and no view
returns the user to where they started by text. As soon as there is a second layer —
`Cuentas → Bancolombia → Movimiento` — the tab stops saying where you are.

This component is created **before** the code exists, not after. It is the first time in this
project that Figma leads: until now the design system had been reconciling what Dev had already
written. Here the source of truth is born in Figma and Dev implements from the spec, not the
other way round.

## 2. Anatomy

```
breadcrumb            (horizontal auto-layout, gap = breadcrumb/gap)
├── breadcrumb-item   Type=Link,    Show icon=true   ← the root, and only the root, carries an icon
├── Icon              chevron-right, size=XS         ← separator
├── breadcrumb-item   Type=Link
├── Icon              chevron-right
└── breadcrumb-item   Type=Current                   ← the current page, not a link
```

`breadcrumb-item` in turn:

```
item              (horizontal auto-layout, gap = breadcrumb/item/gap,
                   padding = item/padding-y × item/padding-x, radius = item/radius)
├── icon          Icon instance, size=S, hidden by default
└── label         text, Body/Small (Link) or Body/Small-Emphasis (Current)
```

## 3. Properties

### `breadcrumb-item` — 4 variants

| Prop | Values | Note |
|---|---|---|
| `Type` | `Link` \| `Current` | `Current` is `<span aria-current="page">`, not `<a>` |
| `State` | `Default` \| `Hover` \| `Focus` | only for `Type=Link` |
| `Show icon` | boolean, default `false` | only the root crumb turns it on |
| `Label` | text, default `Cuentas` | |

The matrix is **deliberately incomplete**: `Current` exists only in `Default`. The current page is
not interactive, so it has no hover and no focus. Filling `Current/Hover` with a copy of
`Current/Default` would have completed the grid at the cost of lying about the behaviour.

### `breadcrumb` — 3 variants

| Prop | Values |
|---|---|
| `Levels` | `2` \| `3` \| `4` |

More than 4 is not supported. If the path is deeper, **collapse the middle segments before
reaching this component** — the breadcrumb does not truncate on its own, and should not: deciding
which segment hides is the view's decision, not the component's.

## 4. Tokens

15 new variables in the **Components** collection, all aliases of **Primitives**, all with light
and dark modes.

| Token | Light | Dark |
|---|---|---|
| `breadcrumb/item/foreground` | `slate/500` `#64748b` | `slate/400` `#94a3b8` |
| `breadcrumb/item/foreground-hover` | `slate/900` `#0f172a` | `slate/50` `#f8fafc` |
| `breadcrumb/item/background-hover` | `slate/500/10` | `slate/500/10` |
| `breadcrumb/current/foreground` | `slate/900` | `slate/50` |
| `breadcrumb/separator/foreground` | `slate/400` `#94a3b8` | `slate/500` `#64748b` |
| `breadcrumb/focus/ring` | `cyan/600` `#0891b2` | `cyan/500` `#06b6d4` |
| `breadcrumb/focus/ring-width` | `border-width/medium` 2 | same |
| `breadcrumb/gap` | `spacing/4` 4 | same |
| `breadcrumb/item/gap` | `spacing/4` 4 | same |
| `breadcrumb/item/padding-x` | `spacing/4` 4 | same |
| `breadcrumb/item/padding-y` | `spacing/2` 2 | same |
| `breadcrumb/item/radius` | `radius/4` 4 | same |
| `breadcrumb/icon/size` | `spacing/16` 16 | same |
| `breadcrumb/separator/size` | `spacing/12` 12 | same |
| `breadcrumb/height` | `spacing/24` 24 | same |

Three of these numbers carry a decision that does not read on its own:

**`gap` is 4, not 8.** The item already contributes 4px of `padding-x` on each side to house the
focus ring. With `gap: 8` the optical space between label and chevron is 12px, and the row stops
reading as a single line. I started at 8 and dropped it after looking at it rendered.

**`separator/size` is 12, not 16.** The chevron is punctuation, not content. At 16px — the size of
the house icon — it competes with the labels.

**`separator/foreground` sits exactly one step below the label in each mode.** Light: label
`slate/500`, separator `slate/400`. Dark: label `slate/400`, separator `slate/500`. The original
value was `slate/300` in light, which gives 1.6:1 against white and vanishes at 12px. I do not
demand 3:1 of it — it is decorative, order already carries the hierarchy — but I do demand that
it be visible.

## 5. Contrast

Measured against `#ffffff` (light) and `#020617` (dark).

| Pair | Light | Dark | Threshold |
|---|---|---|---|
| `item/foreground` on background | **4.76:1** | **7.9:1** | 4.5:1 (14px text) ✅ |
| `current/foreground` on background | **17.8:1** | **19.0:1** | 4.5:1 ✅ |
| `focus/ring` on background | **3.68:1** | **8.3:1** | 3:1 (UI component) ✅ |
| `separator/foreground` on background | 2.57:1 | 4.24:1 | — decorative |

Light `item/foreground` passes by 0.26. If the bar's background ever stops being pure white, this
pair falls over — it is the first one to re-measure.

## 6. Two decisions worth knowing

### The 4px `padding-x` is not decoration: it is the box of the focus ring

The ring is `OUTSIDE` at 2px. Without horizontal padding it cuts through ascenders and
descenders. Anyone trying to "clean up" that padding because the item has no visible background
at rest will break focus without noticing. It is also written in the component's description in
Figma.

### Hover carries no underline, and that was not an aesthetic choice

I tried. **Figma propagates `textDecoration` across variants of a set when layers share a name** —
setting `UNDERLINE` on `State=Hover` set it on all four variants; removing it from one removed it
from all four. I verified it three times, including via `setRangeTextDecoration`, which propagates
the same way. `fills` do **not** propagate, which is why per-state colours do work.

The available exits were renaming the `label` layer in the Hover variant — which breaks override
continuity when switching variants — or expressing hover another way. I chose the second:
**background (`item/background-hover`) + `item/foreground-hover`**, which is also what shadcn/ui
does and what justifies `item/radius` and `item/padding-x` existing at all.

`background-hover` uses `color/slate/500/10`, an alpha tint: the **same alias serves light and
dark** because it leans on whatever surface is underneath instead of fixing a colour. It is the
only breadcrumb token that does not need two values.

This is not a limitation Dev inherits: in CSS, `text-decoration: underline` on `:hover` has no
such problem. If it is later decided that the underline is needed, **that is a design decision,
not a Figma one** — and it has to be noted here, because Figma will not be able to show it.

## 7. What Dev picks up when the ticket opens

- `src/components/navigation/Breadcrumb.tsx` + `BreadcrumbItem`
- Semantics: `<nav aria-label="Ruta">` → `<ol>` → `<li>`; links `<a>`, current
  `<span aria-current="page">`; chevrons `aria-hidden`
- The 15 tokens enter `src/index.css` as `--breadcrumb-*` — **Dev's territory**; I report them,
  Dev applies them
- `Body/Small` = `ts-body-small`; `Body/Small-Emphasis` = `ts-body-small-emphasis`
- Focus is `:focus-visible`, not `:focus` — it must not fire from the pointer

## 8. What this document does not decide

- **Where it mounts.** Which views carry a breadcrumb and with what routes is a product decision,
  not the design system's.
- **The root route.** I used `Inicio` with a house icon because it is the convention; if the app
  calls that view something else, change the text, not the component.
- **Truncation.** See §3.
