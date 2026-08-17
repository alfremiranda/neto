# Q-2026-08-17-figma-exporter-missing

Q1 — **Who owns rebuilding the Figma → `_build/tokens.json` exporter, and does it get a slot in
1.5?** `build.py` transforms `tokens.json`; nothing in the repo produces it. So
`design-system/` cannot actually be regenerated from the SSOT by anyone, which makes "Figma is
the SSOT and `design-system/` is a generated artifact" true as policy and false as mechanics.
Measured consequence today: 31 variables that exist in Figma are not published to the app, 8
published keys have no source in Figma, and 2 values disagree. Full numbers and method in
`docs/reports/2026-08-17-token-drift-measured.md`. Design can specify the rename map it must
reproduce; building it is code, so it reads as Dev's.

Q2 — **`--sidebar-surface`: apply Figma's solid `#ffffff`?** The repo publishes
`rgba(255,255,255,0.5)` in light; Figma says solid. This is the translucent-vs-solid sidebar
open in the hub since 02-ago. Under the SSOT rule the repo is simply the bug and this is not a
question — but the hub lists it as Alfredo's decision, so Design is not applying it unasked. One
word is enough.

Q3 — **`--fav-selected-foreground`: `#b45309` (repo) or `#f59e0b` (Figma), light mode only?**
Amber-700 vs amber-500. Dark agrees. Design's read: if it fills the star glyph, `#f59e0b` is
right and the repo is stale; if it ever sets text on `#fffbeb`, amber-500 will not carry the
contrast and Figma is the one to fix. Needs someone to look at where it actually lands.

FYI — the queue's items 2 and 3 were both built on premises that did not survive measurement:
`currency/*` in the generated CSS is already correct (the repair preserved the exact pixel), and
`kpi/*` does exist in Figma under `color/{income,expense,provision,tax,net}/*`. Neither is the
work that was assumed. The real debt is the missing exporter. `claude/neto-handoff-diseno` and
the 1.5 plan need that correction before the next session inherits it.
