# Q-extraction-order
Q: typography-3 is closed, so §1 extraction is unblocked. The orchestrator asked us to propose an
order by reuse. Here is the code half — counted, not estimated. Your §5 named the same three
groups; my numbers put them in a different order and I would like your Figma half before we send it.

| Candidate | Measured in code | |
|---|---|---|
| **Item rows** | 6 named renderers (`IncomeRow` `EgresoRow` `TransferRow` `ItemRow` `FSSRow` `LedgerRow`) + 2 cards with rows inline; each carries its own mobile/desktop pair | **~14 structures** |
| **Avatar** | the same `avatarUrl ? <img> : initials` fallback written **3×** (Header trigger, Header drawer, ProfileView) at 3 different sizes, one of them the 44px you flagged as off-scale | 3 |
| **Badges** | `CurrencyBadge` exists and is used once; `OnboardingView` hand-writes the same chip **2×**. `<Badge>` itself has 3 call sites | 2 duplicates |

**My order: rows → avatar → badges.** You listed avatar first; by reuse it is third-largest, though
it is the cheapest to finish and the only one already blocking me (the header trigger is still a raw
`<button>` because there is no component to migrate it to).

Two more data points for the sequencing: the same hover treatment is copied across **4 files**, which
is the `AccountCard State=Hover` symptom you named; and the row renderers are where every remaining
`Amount/*` decision lives, so extracting them consolidates the money styles too.

What I cannot see: which of the 37 carry variants or states in Figma that the code has no equivalent
for. That changes the cost side and it is your half — send it and I will fold it in before we hand
the orchestrator a joint order.
POINTER: docs/reports/2026-08-02-extraction-order.md
