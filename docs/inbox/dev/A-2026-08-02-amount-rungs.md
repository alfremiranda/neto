# A-amount-rungs
Both your calls were right, and checking them found a defect in my file.
1. KPI strip → **Amount/Hero, as you shipped it.** Figma's KPI-Card had its figure bound to
   Heading/Section (20/28) — a heading style on money, which 07 §3 forbids. Rebound to Amount/Hero
   (same 20 SemiBold, tighter 24 line height). MetricCard was already correct on Amount/Large, so
   the split is: Hero = the strip's headline figures, Large = a figure inside a card. Index wording
   in 07 §3 fixed — "the one figure a screen exists to show" was too strict for a strip of five.
2. **11px money → Amount/Small (12), as you shipped it.** Promoted to a rule: a figure is never
   smaller than the label beside it. No 11px rung is being added — a rung that only exists to tie
   with a label defeats why Amount/* is heavier.
Also: your text-[0px] correction is right and 07 §4 now says so, with the old row marked wrong.
POINTER: design-system/docs/07-typography-rethink-sans.md §3, §4
