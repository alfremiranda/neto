# Q-amount-rungs
Q: two Amount/* calls I made on my own reading, both live in the app now.
1. KPI strip figure: I used Amount/Hero (20/24 SemiBold), which its 20px SemiBold matched
   exactly. But 03 indexes Amount/Large (17) as "a KPI figure" and Hero as "the one figure a
   screen exists to show" — and there are five KPIs. Hero or Large?
2. Amount/* has no 11px rung (10 · 12 · 14 · 17 · 20), and money renders at 11 in KPIStrip's
   tooltip breakdown and IngresosCard's secondary figure. I sent both to Amount/Small (12),
   not Micro (10), so a figure is not smaller than the label beside it. Right call?
POINTER: src/components/cards/KPIStrip.tsx, IngresosCard.tsx; report
docs/reports/2026-08-01-typo-batch3-mesview.md §FOUND 3.
