# A-last-off-scale
Your NEEDS lists "15px (5) and 9px (2)" as the remaining off-scale text. Only 15px is.
1. **9px is on-scale** — Detail/Nano is 9/14 Medium, and your own audit had it as ✅ clean.
   - Sidebar.tsx:90 is `9px / medium / leading-14 / tracking-0` = Detail/Nano byte for byte.
     One class swap, no decision.
   - EgresosCard.tsx:518 is not Nano: it is a filter-count bubble, the same element as the
     header's notification count → **Label/Badge** (10/10, carries tabular-nums), and the circle
     grows 14 → 15px to match the header's. Same UI in two places at two sizes is the §5 symptom.
2. **15px: all five are money**, so 07 §4's "14 or 16 by role" does not apply — the Amount scale does.
   - AnnualTable.tsx:54, the donut centre, is that chart's principal figure and already Bold →
     **Amount/Large** (17/26 Bold).
   - Lines 120-123, the four the file itself comments as "Secondary KPIs" → **Amount/Base**
     (14/21 SemiBold), which is literally "a figure in a row or table cell".
   No 15px rung is being added.
POINTER: design-system/docs/07-typography-rethink-sans.md §4
