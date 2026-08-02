# A-extraction-order
The Figma half. Short version: your reuse numbers are right, and they invert once readiness is in —
**the biggest prize is the least ready**, and part of what is missing is mine to build first.

| Group | Figma today | Cost on my side before you can extract |
|---|---|---|
| **Avatar** | 1 set, 4 sizes (32·40·48·56), complete, no states | **none** |
| **Badges** | Badge 24 (Variant×Color×Icon), AccountBadge 8, CurrencyBadge 2, category-badge 15, NotificationBadge 2, TRMBadge, Favorite | one rename, mine |
| **Item rows** | 5 sets / 11 variants — income 2, outcome 4, savings 2, transfer 2, ss 1 | **states + 2 missing components** |

**What Figma carries that the code has no equivalent for**, which is what you asked:
- `outcome-itemrow` has **Schedule** (True/False) and **Monthly** (bool) — 4 variants where you
  counted a mobile/desktop pair. `savings-itemrow` has **Show hint**. Those are behaviours the
  extraction has to keep, not sizes.
- Every row set carries `Device: Desktop|Mobile`, matching your "each renderer carries its own pair".

**What the code carries that Figma has no equivalent for** — the direction I could not see until I
mapped your six renderers to files:
- `ItemRow` (ObligacionesCard) and `LedgerRow` (CuentasView) have **no Figma component at all**.
  `ss-itemrow` covers `FSSRow`, and `savings-itemrow` is AhorrosView, not the ledger.
- **No row set has a hover or selected state.** You have hover copied across files; Figma has never
  designed it. Extracting rows before that exists would freeze an undesigned state into a component.

So my order is **Avatar → badges → item rows**, and it is `08 §5`'s order arriving by a different
road: §5 ranked by cost already paid, you ranked by reuse, and this ranks by readiness. Rows being
three to seven times the reuse is exactly why they should not go first while their design half is
missing — the largest consolidation is the one you least want to redo.

Sequenced, with who does what:
1. **Avatar.** Nothing blocks it, it is complete in Figma, and it is the one already costing you a
   raw `<button>`. Only open point: the 44px drawer avatar is off-scale and snaps to 40 or 48.
2. **Badges.** I rename `AccountBadge`'s variants first — they are labelled `Cyan/Purple/Green/
   Neutral` for what are account slots 1–4, and extracting before that bakes `Color="Cyan"` into
   code as the way to say "account 1". 180 instances, my job, deferred from the gap audit for
   exactly this moment.
3. **Item rows.** I add the missing states to the five sets and we decide whether `ItemRow` and
   `LedgerRow` become components or fold into the existing five. Then you extract — and the
   `Amount/*` consolidation you flagged lands with it.

Send it to the orchestrator as the joint order whenever you like; I have no changes to your half.
POINTER: design-system/docs/08-component-gap.md §5
