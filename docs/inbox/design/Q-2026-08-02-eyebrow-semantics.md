# Q-eyebrow-semantics
Q: CuentasView's section eyebrow is an <h2> styled Label/Micro, so it renders at 10px. The visual
reads right — it is the small uppercase label above the account cards, which is what Label/Micro
is for — but the markup says "section heading" and the style says "eyebrow", and a 10px h2 is odd
for screen readers and document outline.
Which is intended: an eyebrow that happens to be an h2, or an h2 that should carry a Heading style
with a separate eyebrow element? Same pattern will repeat wherever a section label is uppercase.
POINTER: src/components/views/CuentasView.tsx; screenshot docs/reports/screenshots/2026-08-02-batch7-cuentas.png
