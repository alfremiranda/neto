# Design System — Neto

> **Authoritative reference for all design and UI decisions.**
> This document overrides personal preferences and library defaults.

---

## Figma — Source of Truth for Visual Design

**Figma is the single source of truth for all visual specifications.**

- File: `https://www.figma.com/design/Q2R72oH6MYxYr1VKAe5nOx/Neto`
- When there is a conflict between code and Figma, Figma wins.
- When implementing UI changes, always inspect the relevant Figma node first.

### Key component nodes

| Component | Node ID |
|-----------|---------|
| Desktop layout (expanded) | `2:34` |
| Desktop layout (collapsed) | `129:9927` |
| Sidebar (expanded, 255px) | `124:4969` |
| Sidebar (collapsed, 65px) | `129:9931` |
| TopNav | `121:4745` |
| KPI cards strip | `128:5893` |

### Derived specs (verified against Figma, 2026-08-01)

| Element | Spec |
|---------|------|
| Sidebar expanded width | 255px |
| Sidebar collapsed width | 65px |
| TopNav height | 54px |
| Sidebar item height | 40px (h-10) |
| Sidebar item border-radius | 12px (rounded-[12px]) |
| Sidebar item padding (expanded) | `px-3 py-2` |
| Sidebar item padding (collapsed) | `p-[12px]` centered |
| Sidebar list padding | `px-[12px]` |
| Sidebar list gap | `gap-2` (8px) |
| KPI card padding | `p-[17px]` |
| KPI label | text style `Label/Micro` — 10px SemiBold, uppercase, tracking 0.5px |
| KPI value | text style `Amount/Hero` — 20px SemiBold |
| SectionCard title | text style `Heading/Group` — 14px SemiBold |
| IBC chip | `border border-[var(--border)] rounded-lg px-2 py-1` |

Text styles are named in Figma and listed in `design-system/foundations/typography.html`.
They are no longer described by family + weight here, because the family changed once
and every hardcoded mention of it went stale at the same time.

---

## Component Library: shadcn/ui

**All UI components must be based on shadcn/ui** as the primary source.

- Before building a new component, check if it exists at [ui.shadcn.com/docs](https://ui.shadcn.com/docs).
- If it exists: install with `npx shadcn@latest add <component>` and extend as needed.
- If it doesn't exist in shadcn: build using **Radix UI** primitives and apply system tokens.
- Never replace a shadcn component with a custom implementation without documenting the reason.

Custom components in `src/components/ui/` that extend shadcn:
- `Badge` — account and currency variants
- `SectionCard` — card with standardized header
- `DatePicker` — Popover + Calendar wrapper
- `MoneyInput` — input with automatic locale formatting
- `Empty` — composed empty state

---

## Token architecture

**Values live in Figma and are generated into this repo. They are not written here.**

```
design-system/tokens/tokens.json      raw export, both modes
design-system/tokens/tokens.css       CSS custom properties
design-system/tokens/tokens.map.css   bridge to the names src/index.css uses
```

This document describes *how to use* tokens in this codebase. It deliberately contains no
colour values: a second copy of the values is a second source of truth, and that is exactly
the drift this system spent a full audit removing.

### Three collections, not three layers

Figma holds four variable collections. Three of them carry colour and spacing:

```
Primitives  ──►  Semantic  ──►  Component
raw ramps        general design    internal to one component
```

- **Primitives** — `color/slate/500`, `spacing/12`. Raw, complete, and **never referenced directly**.
- **Semantic** — `surface/wrap/card`, `foreground/subtle`, `interactive/primary`, `spacing/16`, `radius/xl`.
  This is the layer you design and build with. It carries Light and Dark modes.
- **Component** — `button/filled/background/default`, `input/color/border/focus`.
  Private to the component that names them. **These may alias Primitives directly** — that is
  correct, not a layering violation.

The rule that matters: **a node must never bind to a Primitive.** A Component token aliasing a
Primitive is fine. A component's background reaching past two layers to grab `color/cyan/600`
is not — it will not follow the theme.

Full explanation: `design-system/docs/01-token-layers.md`.

**Open handoff:** values still pending in `src/index.css` are tracked in
`design-system/docs/05-handoff-tokens.md`. That file is the executable list — this one is
the reasoning behind it.

### How the app consumes them

`src/index.css` currently declares its own values. The intent is for it to import the generated
files instead:

```css
@import "../design-system/tokens/tokens.css";
@import "../design-system/tokens/tokens.map.css";
```

**Not wired up yet** — it is a build change and needs its own review. Read the `NO EQUIVALENT`
block at the end of `tokens.map.css` first: four variables have no counterpart and need a
decision rather than a mapping.

### Domain token shape

The three-slot pattern still holds for financial and category tokens:

```
--color-{role}      saturated: icons, chart fills, dots
--color-{role}-bg   tinted: badge and chip backgrounds
--color-{role}-txt  accessible text on that bg
```

| Suffix | Use for | Required contrast |
|--------|---------|-------------------|
| (none) | Chart fills, bars, icons | ≥ 3:1 against background (WCAG UI) |
| `-bg` | Badge/chip backgrounds | none (decorative) |
| `-txt` | Text on that background | ≥ 4.5:1 (WCAG AA) |

Expense categories use `--cat-{id}` / `--cat-{id}-bg` and map 1:1 with `EGRESO_CATEGORIAS`.
There are **15** of them. In dark mode every category surface is the `-950` tint and its text
the `-300`, with two documented exceptions: `connectivity` and `other` stay lighter, because
their neutral `-950` is indistinguishable from the page background.

**Dark mode is not an inversion.** Domain tokens are re-declared under `.dark {}`; components
need no dark-mode logic. Anything bound to a raw value will simply not follow.

### The `cv()` bridge function

```js
// tailwind.config.js
const cv = (v) => ({ opacityValue }) =>
  opacityValue !== undefined
    ? `color-mix(in oklch, var(${v}) ${Math.round(opacityValue * 100)}%, transparent)`
    : `var(${v})`
```

Tailwind v3 wraps colour values in `hsl()`, which breaks anything that is not HSL. `cv()`
bypasses it by returning `var(--token)` directly. Use `cv()` for **any** token registered in
`tailwind.config.js`.

> Historical note: this helper was written when the palette was oklch. The palette is hex now,
> but the wrapper problem is the same and `color-mix` still resolves correctly, so it stays.

---

## Principles

1. **Semantics over appearance** — tokens describe *purpose*, not colour. `--color-expense`,
   never `--n-pink`. A palette change must not touch a component.

2. **Never skip a layer** — components consume Semantic or their own Component tokens. Never a
   Primitive, never a literal.

3. **Tailwind as shorthand** — classes are fine as long as they resolve to a token
   (`bg-muted`, `text-foreground`). Never `text-[#0e7490]`.

4. **Cyan is reserved for selected state and focus ring.** Hover is neutral. Two cyan states
   side by side read as two selections.

---

## Typography

**One family: Rethink Sans.** It replaced the Inter + Geist Mono pair in August 2026.

| Variable | Value |
|----------|-------|
| `--font-sans` | Rethink Sans |
| `--font-mono` | *(retired — see below)* |
| `--font-heading` | *(retired — was an alias of `--font-mono`)* |

### Why the monospace face is gone

Monetary figures used Geist Mono so they would not jitter as values changed. Measured at 20px,
ten digits wide:

| Family | `1111111111` | `0000000000` | `8888888888` | Tabular |
|---|---|---|---|---|
| **Rethink Sans** | 118 | 118 | 118 | **yes, by default** |
| Geist Mono | 120 | 120 | 120 | yes |
| Inter | 97 | 134 | 130 | **no** |

Rethink Sans is already tabular, so the second family was doing nothing the first does not.

**Keep `tabular-nums` in the class list.** It is a no-op today and it is the guard if the family
ever changes again. What changes is the rule's *reason*, not its shape:

> All monetary values use `tabular-nums`. The `font-heading` half of the old rule no longer
> applies — there is nothing to switch to.

Monetary figures are ~17% narrower than before (119px vs 144px for `$4.012.550,75`). Dense
tables and KPI strips have more room, not less.

### Type scale

26 text styles in 6 semantic groups, named by *what the text is* rather than how large it is:

| Group | For |
|---|---|
| `Heading/` | Display · Section · Subsection · Card · Group |
| `Body/` | running text, ±Emphasis at two sizes |
| `Detail/` | metadata: Large 11 · Base 10 · Emphasis 10 · Nano 9 |
| `Label/` | Base · Micro (the KPI label) · Badge |
| `Amount/` | Hero · Large · Base · Small · Micro — monetary figures |
| `Control/` | XS–XL, line height 100% for single-line control labels |

Two rules that keep the scale from doubling in size:

- **Emphasis in running text is Medium, never SemiBold.** SemiBold belongs to headers and figures.
- **There are no input text styles.** Text inside a field *is* body text.

`Amount/` exists as its own group even where its metrics repeat `Body/` and `Heading/`, because
in a finance app the figures must be able to change without dragging the rest of the system.

Full reference: `design-system/docs/03-typography.md` and `design-system/foundations/typography.html`.

### Tailwind size classes

| Class | rem | Computed | Use for |
|-------|-----|----------|---------|
| `text-2xs` | 0.625rem | 10px | Timestamps, collapsed labels |
| `text-xs` | 0.75rem | 12px | Badges, metadata, filter labels |
| `text-sm` | 0.875rem | **14px** | **Default body text** |
| `text-base` | 1rem | 16px | Card headers, section titles |
| `text-lg`+ | ≥1.125rem | ≥18px | View titles only |

> `body` is set to `font-size: 14px`, but `rem` resolves against `html`, not `body`. The root
> stays at the browser default of 16px, so `text-sm` computes to **14px** — not 12.25px as an
> earlier version of this document claimed.

---

## Spacing & Sizing Scale

### Form elements (always consistent within a row)

| Context | Height class | px | When to use |
|---------|--------------|----|-------------|
| Standard | `h-9` | 36px | All form inputs (default) |
| Compact | `h-7` | 28px | Filter bars, inline selects |
| Icon | `h-8` | 32px | Icon-only buttons, small actions |

**Rule:** All form elements within the same row must share the same height class. `h-9` aligns `field-input`, `SelectTrigger`, `DatePicker`, and `MoneyInput`.

### Component spacing

| Pattern | Value | Use for |
|---------|-------|---------|
| Card padding | `p-4` / `p-5` | SectionCard content area |
| Row padding | `py-2` / `py-[9px]` | List rows (income, expense, transfers) |
| Gap between rows | `gap-2` or `border-b` | Use `border-b` for scannable lists |
| Filter bar | `px-4 py-2` | Filter/sort bars |

### Z-index scale (these values only)

```
z-10    Sidebar, dropdowns within page context
z-50    Modals, sheets, overlays
z-[100] Toast notifications
```

---

## Tailwind + shadcn Integration Rules

### Rule 1: shadcn component heights use `size` prop, not `h-*`

`SelectTrigger`, `Button`, and other shadcn components control height via `data-[size=...]` CSS attributes, not Tailwind classes. Passing `h-7` in `className` creates a conflict that `tailwind-merge` cannot resolve because data-attribute conditionals have higher specificity.

```tsx
// ❌ Wrong — h-7 may not apply
<SelectTrigger className="h-7 text-xs">

// ✅ Correct — uses the component's size system
<SelectTrigger size="sm">

// ✅ Also correct — bypasses data-[size] entirely
<SelectTrigger data-size="none" className="h-7 text-xs">
```

Use `data-size="none"` when you need a custom height that differs from the component's predefined sizes.

**Note:** `size="sm"` also changes border-radius (applies `data-[size=sm]:rounded-[min(var(--radius-md),10px)]`). If only the height needs to change, use `data-size="none"`.

### Rule 2: Domain tokens use `var()` in arbitrary classes

Domain tokens are intentionally NOT in `tailwind.config.js`. This makes domain token usage explicit and visually distinct in code from design system tokens.

```tsx
// ✅ Domain token — explicit, readable
<div className="bg-[var(--color-income-bg)] text-[var(--color-income-txt)]">

// ✅ Shadcn base token — via Tailwind utility
<div className="bg-muted text-muted-foreground">

// ❌ Never hardcode a colour inline
<div style={{ backgroundColor: '#0e7490' }}>
```

### Rule 3: shadcn v4 components require conversion for Tailwind v3

shadcn components are increasingly published with Tailwind v4 syntax. When installing, audit and convert:

| v4 syntax | v3 equivalent |
|-----------|---------------|
| `w-(--sidebar-width)` | `w-[var(--sidebar-width)]` |
| `h-(--var)` | `h-[var(--var)]` |
| `(--spacing(4))` | `1rem` |
| `max-w-(--var)` | `max-w-[var(--var)]` |

Run after any `npx shadcn@latest add`:
```bash
grep -r "w-(\|h-(" src/components/ui/
```

### Rule 4: Never override shadcn internals via CSS cascade

If a shadcn component isn't composable enough, extend it with a wrapper component rather than forcing overrides with `!important` or specificity hacks.

```tsx
// ✅ Extend with a wrapper
function CompactSelect(props) {
  return <SelectTrigger data-size="none" className="h-7" {...props} />
}
```

### Rule 5: One TooltipProvider in App.tsx

`TooltipProvider` lives once in `App.tsx`. Never instantiate it inside a component. `SidebarMenuButton` receives `tooltip` only when `state === 'collapsed'` — never pass `tooltip` when expanded because the `hidden` prop on `TooltipContent` doesn't reliably suppress the Radix portal. Correct pattern: sub-components that call `useSidebar()` and conditionally pass `tooltip`:

```tsx
function NavButton({ label, ... }) {
  const { state } = useSidebar()
  return (
    <SidebarMenuButton tooltip={state === 'collapsed' ? label : undefined}>
      ...
    </SidebarMenuButton>
  )
}
```

---

## Component Patterns

### List rows (income, expense, transfers)

```
flex items-center gap-2 py-2 border-b border-[var(--border)] last:border-0
│ icon (16px, shrink-0) │ content (flex-1 min-w-0) │ amount (shrink-0) │ actions (shrink-0) │
```

- **Actions:** always visible, never hidden on hover. `Button variant="ghost" size="icon-sm"` for edit/delete.
- **Delete:** two-tap confirm (first tap → `¿Eliminar?`, second tap → deletes). Never instant delete.

### Destructive confirmation pattern

```tsx
<Button
  variant={isPending ? 'destructive' : 'ghost'}
  size={isPending ? 'sm' : 'icon-sm'}
  className={!isPending ? 'hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]' : ''}
>
  {isPending ? '¿Eliminar?' : <Trash2 size={12} />}
</Button>
```

### Monetary amounts

```tsx
// Always: font-heading + tabular-nums
<span className="font-heading tabular-nums text-sm font-semibold">
  {COP(amount)}
</span>
// USD converted to COP as secondary
<div className="text-[10px] text-muted-foreground tabular-nums">
  {COP(amount * trm)}
</div>
```

### Account badges

Use the `Badge` component with a `variant` prop: `arq`, `toptal`, `bancol`, `otro`. Background from `--color-account-{type}-bg`, text from `--color-account-{type}-txt`.

### Sheet forms

All fields use `.field-label` + `.field-input` CSS classes or shadcn equivalents at `h-9`.
`DatePicker` base is `h-9`. Override with `className="h-7 text-xs"` in compact contexts.

---

## Filter Bars

Consistent pattern across all cards with filterable lists:

```
px-4 py-2 flex items-center gap-2 border-b border-[var(--border)]
│ account Select (data-size="none" h-7) │ DatePicker (h-7) │ sort Select (data-size="none" h-7) │
```

All three elements must be `h-7`. `SelectTrigger` with `data-size="none"` when built-in sizes don't match.

### Compact sort select with text

```tsx
<SelectTrigger data-size="none" className="h-7 w-auto px-2 gap-1.5 text-xs border-transparent bg-transparent hover:bg-[var(--accent)]">
  <ArrowUpDown size={12} className="text-muted-foreground shrink-0" />
  <SelectValue />
</SelectTrigger>
```

---

## Sidebar

shadcn Sidebar with `collapsible="icon"`. Critical constraints:

1. **Tailwind v3 compatibility**: The installed `sidebar.tsx` uses v4 CSS variable shorthand. Always convert after install (see Rule 3).
2. **Tooltip on collapse**: `SidebarMenuButton` receives `tooltip` only when `state === 'collapsed'`. Do not pass tooltip when expanded — the `hidden` prop on `TooltipContent` doesn't reliably suppress the Radix portal.
3. **Fixed → Absolute**: The sidebar container is modified to `absolute inset-y-0` (instead of `fixed`) to respect the app layout with a header above. `SidebarProvider` needs a `relative h-full` ancestor.
4. **Mobile**: Sidebar is `hidden md:block`. Mobile navigation uses the custom `Sidebar_MobileNav` (fixed bottom bar), not the shadcn mobile Sheet.

---

## Motion & Animation

Transitions are functional, never decorative.

| Property | Duration | Easing | Where |
|----------|----------|--------|-------|
| colors | 150ms | ease-in-out | Hover, active states |
| width/height | 200ms | ease-linear | Sidebar collapse, row expand |
| opacity | 150ms | ease-in-out | Tooltips, empty state fades |
| transform | 100ms | ease | `active:scale-95` on buttons |

`tw-animate-css` provides `animate-in`/`animate-out` for Radix popover/tooltip enter/exit.

---

## Correct vs. Incorrect Usage

### ✅ Correct

```tsx
// Domain token
<span className="text-[var(--color-expense)]">...</span>
<div className="bg-[var(--color-provision-bg)]">...</div>

// Shadcn base token via Tailwind utility
<p className="text-muted-foreground">...</p>
<div className="bg-card border border-border">...</div>

// Tertiary text token
<span className="text-[var(--n-txt3)]">...</span>
```

### ❌ Incorrect

```tsx
// Hardcoded primitive value
<span style={{ color: '#dc2626' }}>...</span>

// Non-semantic color token
<span className="text-[var(--n-pink)]">...</span>

// Hardcoded Tailwind color without token
<div className="bg-rose-100 text-rose-700">...</div>

// h-* on SelectTrigger without data-size="none"
<SelectTrigger className="h-7">  {/* won't apply */}

// Nested var() — invalid CSS
<div style={{ color: 'var(var(--color-income))' }}>
```

---

## Anti-patterns

| Anti-pattern | Why | Instead |
|--------------|-----|---------|
| `style={{ color: '#...' }}` inline | Breaks dark mode, not themeable | Use a CSS token |
| `opacity-0 group-hover:opacity-100` on actions | Actions invisible by default | Always visible with `size="icon-sm"` |
| `h-*` override on shadcn SelectTrigger | Lost to data-attribute specificity | `size="sm"` or `data-size="none"` |
| shadcn v4 syntax (`w-(--var)`) without conversion | Compiles to nothing in Tailwind v3 | Convert to `w-[var(--var)]` |
| `TooltipProvider` inside a component | Creates nested providers | Single instance in `App.tsx` |
| Drag & drop for list reordering | Poor mobile UX, complex state | Sort select with semantic options |
| `!important` in component className props | Defeats the cascade intentionally | Fix the root cause (data-attribute) |
| Hardcoded pixel values for spacing | Not responsive, not systematic | Use Tailwind scale or `--radius` |

---

## Checklist: New Component

Before committing any new UI component:

- [ ] Colours come from Semantic or Component tokens — never a Primitive, never a literal
- [ ] Monetary values use `font-heading tabular-nums`
- [ ] Form elements at `h-9` (or `h-7` for compact), consistent within row
- [ ] Destructive actions have two-tap confirm pattern
- [ ] Row actions are always visible (no `opacity-0`)
- [ ] No `var(var(--token))` double-wrapping
- [ ] shadcn component heights controlled via `size` prop or `data-size`, not `h-*` className
- [ ] Dark mode tested (toggle with sun/moon in header)
- [ ] No inline colour literals
- [ ] TypeScript: `npx tsc --noEmit` passes clean

---

## Deductions — color by group

Items in `deductions.ts` carry a `color: string` field referencing a domain token:

| Group | Token |
|-------|-------|
| Social Security | `--color-income` |
| Income tax retention | `--color-tax` |
| Primas / Cesantías / Vacaciones | `--color-provision` |
| Custom | `--color-provision` (default) |

---

## Changelog

| Version | Change |
|---------|--------|
| v1 | `--n-*` tokens — color names, not purpose |
| v2 | Migration to `--color-{semantic}` — domain names |
| v3 | Tailwind+shadcn rules, form heights, component patterns, anti-patterns, checklist |
| v4 | Translated to English |
| v5 | Token architecture rewritten against the real Figma structure (Primitives → Semantic → Component). Values moved out of this document into `design-system/tokens/`, generated. Typography collapsed to one family, Rethink Sans. Type scale replaced by 26 named text styles. Fixed the `text-sm` arithmetic — it computes to 14px, not 12.25px. |
