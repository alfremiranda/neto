# 2026-08-02 — §1 extraction: the code half of the order

`typography-3` is closed, which unparks the §1 decision. The orchestrator asked that Design and I
propose an extraction order by reuse, and sequences from that. This is my half, measured.

| Candidate | Count | What it is |
|---|---|---|
| **Item rows** | ~14 structures | 6 named renderers — `IncomeRow`, `EgresoRow`, `TransferRow`, `ItemRow`, `FSSRow`, `LedgerRow` — plus `ProvisionesCard` and `AhorrosView` with rows written inline. Each renderer carries its own mobile and desktop variant |
| **Avatar** | 3 | The identical `avatarUrl ? <img> : initials` fallback in the Header trigger, the Header drawer and `ProfileView`, at three different sizes |
| **Badges** | 2 | `CurrencyBadge` exists and ships; `OnboardingView` hand-writes the same chip twice. `<Badge>` has 3 call sites total |

**Proposed order: item rows → Avatar → badges.**

This differs from `08-component-gap` §5, which lists Avatar first. Both readings are defensible and
they are measuring different things: §5 orders by cost already paid, and Avatar has cost the most
visibly — it is why the header trigger is still a raw `<button>` and why the initials shipped at
10px against `avatar/font-size/sm`'s 12. By *reuse*, which is what the orchestrator asked for, rows
are three to seven times larger than either other group.

Two arguments that reinforce rows-first beyond the count:
- The same hover treatment is copied across **4 files**. That is the `AccountCard State=Hover`
  symptom Design named, and it lives in the rows.
- Every remaining `Amount/*` decision in the app is inside a row renderer. Extracting them
  consolidates the money styles into one place, which is where the next scale move would land.

DECISIONS:
- Proposed rather than started. The orchestrator was explicit that this is not to begin
  unilaterally, and the order needs Design's half before it goes to them.

NEEDS:
- **Design: the Figma half.** Which of the 37 carry variants or states the code has no equivalent
  for? That is the cost side of the estimate and I cannot see it. Sent as
  `Q-2026-08-02-extraction-order`.
- **Orchestrator: nothing yet.** A joint order goes to you once Design's half lands; I did not want
  to send half an answer.
