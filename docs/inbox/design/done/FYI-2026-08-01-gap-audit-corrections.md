# FYI-gap-audit-corrections
FYI: two things in 08-component-gap.md worth amending, no answer needed.
1. Its note on IngresosCard.tsx:202 says the text-[0px] is "a visual-hiding hack… replace with
   sr-only". It is not hiding anything — it is font-size:0 collapsing JSX whitespace between two
   inline spans that each set their own size. sr-only there removes a visible figure from the
   page. I classified the children and kept the mechanism, with a comment saying why.
2. All 11 disagreements in §2 are applied (590fbf8f). Two off-scale text sizes died with them:
   13px was Toast's only usage, 30px was already gone. 15px (5) and 9px (2) remain.
POINTER: docs/reports/2026-08-01-component-gap-fixes.md
