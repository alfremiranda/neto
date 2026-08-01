# Composition

> **If an element inside a component already exists as a component, it goes in as an instance.**

This is the only reason a library scales. A button changes in one place and changes in the forty places it appears. Redrawn by hand, the system becomes forty copies that drift apart on their own.

## What composes what

| Component | Instances |
|---|---|
| `Sheet` | Icon Button ×4 · Button ×2 |
| `RowActionsSheet` | Button ×6 |
| `MonthNav` | Icon Button ×4 · Button ×1 |
| `MoneyInput` | Input ×10 |
| `SectionCard` | Icon ×2 · Button ×1 |
| `Empty` | Icon ×1 · Button ×2 |
| `DatePicker` | Icon ×6 |
| `DistribucionCard` | chart-legend ×4 |
| `FAB` | Icon ×2 · FABAction ×3 |
| `AccountCard` | Icon Account ×24 · Favorite ×24 · CurrencyBadge ×23 · Button ×12 |
| `ExpenseContainer` | outcome-itemrow ×30 · chart-legend ×12 · Select ×4 · tab-navigation ×2 · Icon Button ×2 · Icon ×2 · Button ×1 |
| `topnav` | TRMBadge ×2 · Icon Button ×3 · Avatar ×2 · Icon ×1 |

## What legitimately composes nothing

`Switch` · `Separator` · `Skeleton` · `Toast` · `Card` · `Popover` · `Tooltip` · `MetricCard` · `Calendar`

These are atomic. Reporting zero instances is correct for them, not an omission.

## Icons

Every icon in the product goes through the `Icon` component. Its `size` variant is bound to `size/icon/*` — an icon at 17px is a bug, not a choice.

The glyph is a **`Glyph` instance-swap property** wired to the 76 Lucide components on the Icons page. Change the glyph through that property; never detach an instance to swap artwork.

Two API details that cost time:

- The value you pass to `setProperties` for an instance swap is the **node id**, not the component `key`. Keys are for `preferredValues`.
- `Button` exposes `Show leading Icon` and `Show trailing Icon` booleans. They currently **default to true**, so a fresh button arrives with a plus on both sides. Turn them off unless the button genuinely has an icon.

## Verifying it

Don't trust memory. Walk each component, count `INSTANCE` nodes, resolve each with `getMainComponentAsync()`:

```js
if (node.type === 'INSTANCE') {
  const main = await node.getMainComponentAsync()
  const name = main.parent?.type === 'COMPONENT_SET' ? main.parent.name : main.name
}
```

A component that should be composite and reports zero instances is almost always a defect. That check is what caught ten hand-drawn components that had been built in a single afternoon.
