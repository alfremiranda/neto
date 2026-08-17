# Component extraction — joint proposal

> **Dev + Design, 2026-08-03.** Answers the §1 decision `08-component-gap.md` parked: of the 37
> components that exist in Figma and in code only as inline markup, which get extracted and in what
> order. Written jointly by peer mail — Dev measured reuse in the code, Design measured readiness in
> Figma. Neither half was enough alone, and the two halves disagreed until they were put together.

## The recommendation

**Avatar → badges → item rows.** Three groups, sequenced by readiness rather than size.

The other 34 stay inline. Extraction is not the goal; a component earns one when the same shape is
written in more than one place *and* has a designed source to be extracted from.

## How the order was reached, including where it changed

The two halves ranked the same three groups in opposite orders, and both rankings were defensible
because they measured different things.

| Group | Reuse (Dev, counted in code) | Readiness (Design, counted in Figma) |
|---|---|---|
| **Item rows** | **~14 structures** — 6 renderers (`IncomeRow`, `EgresoRow`, `TransferRow`, `ItemRow`, `FSSRow`, `LedgerRow`) plus 2 cards with rows inline, each with its own mobile/desktop pair | 5 sets / 11 variants, **missing states and 2 components** |
| **Avatar** | 3 — the same `avatarUrl ? <img> : initials` fallback at three sizes | 1 set, 4 sizes, complete, **nothing blocking** |
| **Badges** | 2 hand-written duplicates of a `CurrencyBadge` that already ships | 7 sets, **one rename needed first** |

Dev proposed rows first, on reuse. Design proposed Avatar first, on readiness, and that argument
wins: **the largest consolidation is the one you least want to redo.** Extracting rows now would
freeze an undesigned state into a component — the same hover treatment is copied across **4 files**
today and Figma has never designed a row hover or selected state.

`08-component-gap.md §5` had already reached Avatar-first by a third road, ranking by cost already
paid. Three independent orderings, two of which agree; that is the strongest signal available here.

## The sequence

**1 — Avatar.** *No blockers. Design: none. Dev: extract.*
Complete in Figma at 32 · 40 · 48 · 56. It is already costing us: the Header's avatar trigger is
still a raw `<button>` because there was no component to migrate it to, and the initials shipped at
10px where `avatar/font-size/sm` says 12. One open point — the drawer avatar is **44px**, off that
scale, and snaps to 40 or 48.

**2 — Badges.** *Design first, then Dev.*
`AccountBadge`'s variants are labelled `Cyan / Purple / Green / Neutral` for what are account slots
1–4. Extracting before the rename bakes `Color="Cyan"` into code as the way to say "account 1" —
a colour name standing in for an identity. 180 instances, Design's job, deferred from the gap audit
for exactly this moment.

**3 — Item rows.** *Design first, then a joint call, then Dev.*
Design adds the missing states to the five sets. Then we decide whether `ItemRow` (ObligacionesCard)
and `LedgerRow` (CuentasView) become components or fold into the existing five — **neither has a
Figma counterpart at all**, which only surfaced when Design mapped Dev's six renderers onto its five
sets and two were left over.

Two things the code does not model that the extraction must keep: `outcome-itemrow` carries
**Schedule** and **Monthly** as variants — four, where Dev had counted a mobile/desktop pair — and
`savings-itemrow` carries **Show hint**. Those are behaviours, not sizes.

The `Amount/*` consolidation lands with this step: every remaining money-style decision in the app
lives inside a row renderer, so extracting them puts the figures in one place — which is where the
next scale move would otherwise have to be applied six times.

## What we are asking for

Sequencing, not approval of the contents. Specifically:

1. Confirm **Avatar → badges → item rows**, or reorder it.
2. Confirm the split: Design's Figma work on steps 2 and 3 gates Dev's extraction, so the two are
   not parallel.
3. Step 3 carries a genuine open question (`ItemRow` / `LedgerRow`: new components or fold in) that
   neither of us should settle alone.

Nothing starts before this comes back.
