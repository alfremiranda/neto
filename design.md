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

### Derived specs (verified against Figma)

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
| KPI label | Inter SemiBold 10px UPPERCASE `tracking-[1px]` |
| KPI value | Geist Mono SemiBold 20px (`text-xl font-heading`) |
| SectionCard title | Geist Mono SemiBold 14px (`font-mono font-semibold text-sm`) |
| IBC chip | `border border-[var(--border)] rounded-lg px-2 py-1` |

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

## Architecture: Three-Layer Token System

All visual values flow through three layers. Each layer has a clear responsibility and owner.

```
Layer 1 — Primitives    Raw oklch values. No semantic meaning.
    ↓
Layer 2 — Shadcn Base   Semantic surface roles. Managed by shadcn.
    ↓
Layer 3 — Neto Domain   Financial domain meaning. Owned by this project.
```

**Rule**: Never skip a layer. Domain tokens reference base tokens or primitive values. Components reference Layer 2 or Layer 3. Never inline oklch/hex literals in JSX.

---

## Principles

1. **Semantics over appearance** — tokens describe *purpose*, not color.
   `--color-expense` not `--n-pink`. A palette change doesn't touch components.

2. **Three layers, no skipping** — Primitives → Base (shadcn) → Domain (Neto).
   Components only consume the domain layer or the shadcn base layer.

3. **Tailwind as shorthand** — Tailwind classes are accepted as long as they point to existing tokens (`bg-muted`, `text-foreground`). Avoid direct `text-[oklch(...)]`.

---

## Layer 1 — Primitive Palette

Raw oklch values, named by color, never by role.

| Name         | Light oklch                  | Dark oklch                   | Role               |
|--------------|------------------------------|------------------------------|--------------------|
| blue-500     | `oklch(0.5 0.134 242.749)`   | `oklch(0.55 0.13 240.79)`    | Primary / Income   |
| rose-500     | `oklch(0.56 0.22 13)`        | `oklch(0.68 0.22 13)`        | Expenses           |
| emerald-600  | `oklch(0.59 0.18 163)`       | `oklch(0.73 0.18 163)`       | Provisions         |
| amber-400    | `oklch(0.77 0.18 73)`        | `oklch(0.83 0.18 73)`        | Taxes              |
| cyan-500     | `oklch(0.72 0.16 201)`       | `oklch(0.82 0.16 201)`       | Net income         |

**Why oklch:** Perceptually uniform — changing L (lightness) adjusts contrast without hue shift. Dark mode variants are formulaic: same H and C, different L.

---

## Layer 2 — Shadcn Base Tokens (do not modify)

Defined in `src/index.css` under `:root` and `.dark`. Registered in `tailwind.config.js` via the `cv()` helper.

### Surface roles
| Token             | Use for                                 |
|-------------------|-----------------------------------------|
| `--background`    | Page background                         |
| `--card`          | Card/panel surfaces                     |
| `--popover`       | Dropdowns, tooltips                     |
| `--muted`         | Subtle backgrounds, chips               |
| `--sidebar`       | Sidebar surface                         |

### Text roles
| Token                  | Use for                                              |
|------------------------|------------------------------------------------------|
| `--foreground`         | Body text, primary content                           |
| `--muted-foreground`   | Secondary text, metadata, helper labels              |
| `--n-txt3`             | Tertiary text — icons, timestamps, dim labels        |

`--n-txt3` is a project token, not a shadcn token. Defined in Layer 3 by historical convention.

### Interactive roles
| Token          | Use for                                     |
|----------------|---------------------------------------------|
| `--primary`    | CTAs, active states, brand accent            |
| `--accent`     | Hover backgrounds on neutral elements        |
| `--ring`       | Focus rings                                  |
| `--border`     | All borders and dividers                     |
| `--destructive`| Delete, error, danger states                |

### The `cv()` bridge function — oklch + Tailwind v3

```js
// tailwind.config.js
const cv = (v) => ({ opacityValue }) =>
  opacityValue !== undefined
    ? `color-mix(in oklch, var(${v}) ${Math.round(opacityValue * 100)}%, transparent)`
    : `var(${v})`
```

Tailwind v3 wraps colors in `hsl()`, which breaks oklch values. `cv()` bypasses this by returning `var(--token)` directly. Use `cv()` for **any** token in `tailwind.config.js`. The `!important` overrides in `src/index.css` are a secondary guard for classes Tailwind generates before the custom config applies.

---

## Layer 3 — Neto Domain Tokens

Three-slot pattern: **base color** (charts, icons), **bg** (tinted background), **txt** (accessible text on that bg).

```
--color-{role}      → saturated: icons, chart fills, dots
--color-{role}-bg   → desaturated: badge/chip backgrounds
--color-{role}-txt  → WCAG AA on bg (≥ 4.5:1 contrast)
```

### Financial tokens

| Token | Role | Primitive |
|-------|------|-----------|
| `--color-income` | Income — fill / chart | primary blue |
| `--color-income-bg` | Income — badge background | blue-50 |
| `--color-income-txt` | Income — badge text | blue-800 |
| `--color-expense` | Expenses — fill / chart | rose-500 |
| `--color-expense-bg` | Expenses — background | rose-50 |
| `--color-expense-txt` | Expenses — text | rose-800 |
| `--color-provision` | Provisions — fill / chart | emerald-600 |
| `--color-provision-bg` | Provisions — background | emerald-50 |
| `--color-provision-txt` | Provisions — text | emerald-900 |
| `--color-tax` | Tax obligations — fill | amber-400 |
| `--color-tax-txt` | Tax obligations — text | amber-700 (WCAG AA ✓) |
| `--color-net` | Net income — fill / chart | cyan-500 |
| `--color-net-bg` | Net income — background | cyan-50 |
| `--color-net-txt` | Net income — text | cyan-700 (WCAG AA ✓) |

### Color psychology

```
Blue/Primary  → Income      — trust, stability, positive input
Rose/Red      → Expenses    — cost, outflow, attention
Amber         → Taxes       — caution, pending obligation
Green         → Provisions  — savings, growth, constructive
Cyan          → Net         — result, clarity, availability
```

### Status tokens

| Token | Role |
|-------|------|
| `--color-danger` | Error / destructive action (`var(--destructive)`) |
| `--color-danger-bg` | Error state background |
| `--color-danger-txt` | Error state text |

### Account badge tokens

| Token | Account |
|-------|---------|
| `--color-account-arq[-bg\|-txt]` | ARQ / Dollar App |
| `--color-account-toptal[-bg\|-txt]` | Toptal |
| `--color-account-bancol[-bg\|-txt]` | Bancolombia |
| `--color-account-other[-bg\|-txt]` | Other / generic |

### Expense category palette

Prefix `--cat-{id}` and `--cat-{id}-bg`. Identifiers map 1:1 with `EGRESO_CATEGORIAS`.

| id | Color token | Background token |
|----|-------------|------------------|
| `vivienda` | `--cat-home` | `--cat-home-bg` |
| `alimentacion` | `--cat-food` | `--cat-food-bg` |
| `tecnologia` | `--cat-tech` | `--cat-tech-bg` |
| `bancario` | `--cat-bank` | `--cat-bank-bg` |
| `salud` | `--cat-health` | `--cat-health-bg` |
| `movilidad` | `--cat-transit` | `--cat-transit-bg` |
| `familia` | `--cat-family` | `--cat-family-bg` |
| `otro` | `--cat-other` | `--cat-other-bg` |

### Token emphasis scale

| Suffix | Use for | Required contrast |
|--------|---------|-------------------|
| (none) | Chart fills, bars, icons | ≥ 3:1 on background (WCAG UI) |
| `-bg` | Badge/chip/highlight backgrounds | None (decorative) |
| `-txt` | Text on white/light background | ≥ 4.5:1 (WCAG AA text) |

**Dark mode rule:** Domain tokens are re-declared in `.dark {}`. Components need no dark mode logic.

---

## Typography

| Variable | Family | Use for |
|----------|--------|---------|
| `--font-sans` | Inter Variable | Body, UI, form inputs |
| `--font-mono` | Geist Mono Variable | Monetary amounts, financial numbers |
| `--font-heading` | alias of `--font-mono` | `font-heading` Tailwind utility |

**Rule:** All monetary values (`COP`, `USD`, `%`) must use `font-heading tabular-nums`. This prevents layout jitter as numbers change and establishes visual hierarchy between narrative text and financial data.

### Type scale

| Class | Size | Leading | Use for |
|-------|------|---------|---------|
| `text-2xs` | 0.625rem | 0.875rem | Timestamps in collapsed state |
| `text-xs` | 0.75rem | 1rem | Badges, metadata, filter labels |
| `text-sm` | 0.875rem | 1.25rem | **Default body text** |
| `text-base` | 1rem | 1.5rem | Card headers, section titles |
| `text-lg+` | ≥1.125rem | — | View titles only (h3, h2) |

**Base font-size: 14px** (on `body`). `text-sm` (0.875rem = 12.25px) is the workhorse.

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

// ❌ Never hardcode oklch/hex inline
<div style={{ backgroundColor: 'oklch(0.94 0.03 242)' }}>
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
<span style={{ color: 'oklch(0.56 0.22 13)' }}>...</span>

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
| `style={{ color: 'oklch(...)' }}` inline | Breaks dark mode, not themeable | Use a CSS token |
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

- [ ] Colors come from Layer 2 or Layer 3 tokens — no hardcoded values
- [ ] Monetary values use `font-heading tabular-nums`
- [ ] Form elements at `h-9` (or `h-7` for compact), consistent within row
- [ ] Destructive actions have two-tap confirm pattern
- [ ] Row actions are always visible (no `opacity-0`)
- [ ] No `var(var(--token))` double-wrapping
- [ ] shadcn component heights controlled via `size` prop or `data-size`, not `h-*` className
- [ ] Dark mode tested (toggle with sun/moon in header)
- [ ] No inline oklch/hex literals
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
