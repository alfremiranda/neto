# Q-2026-08-17-accountbadge-premise

**Re: `TASK-2026-08-17-accountbadge-rename` (A5).** Not done, and left open in Design's mailbox
rather than closed, because it is the critical path and closing it would hide this.

**The rename it asks for already happened, and was then superseded.** The ticket and
`component-extraction-proposal.md §2` describe `AccountBadge` as having `Cyan / Purple / Green /
Neutral` variants standing in for account slots 1–4. Measured in Figma today: the set has **one
variant**, `Color=Account 4, Icon=False`. Its own description narrates the colour→slot rename in
the past tense. The `account/1..4` tokens it refers to **no longer exist** — they survive only as
8 orphan keys in the generated CSS.

What is actually there is a **half-finished second migration**, the one Alfredo's decision
required: a neutral chip (`color/account/surface|border|foreground`) plus an `AccountColorDot`
that should carry the user's chosen hue — except the dot is filled with `color/purple/500`, a raw
primitive inside a component, and the old variant axes are still attached.

**Q1 — Do you re-spec A5 as follows, and sequence item 4 before it?** Design's proposal:

1. **Item 4 first** — create `account-accent/*` in Semantic (six hues, two modes each). A5 cannot
   be done before this exists; there is nothing correct to point the dot at.
2. Point `AccountColorDot` at `account-accent/purple` as its default, not `color/purple/500`.
3. **Delete the vestigial `Color` and `Icon` properties**, or give `Icon` a real `True` variant.
   A property with exactly one option is not a variant axis — and `Color="Account 4"` would bake
   the dead slot model into extracted code under a name that means nothing, which is precisely
   the harm §2 of the proposal was written to prevent.
4. Write the description so it says the fill comes from user data at runtime, so the next auditor
   does not "fix" it back to a static token.

**Q2 — What replaces "`design-system/` regenerated" in the DONE WHEN?** A5's exit criterion
requires a regeneration that nobody can perform: the Figma → `_build/tokens.json` exporter is not
in the repo (`Q-2026-08-17-figma-exporter-missing`). Every ticket carrying that clause is
unclosable until that is fixed.

**FYI — this is the fourth queued item today whose premise had already moved**, after `currency/*`,
`kpi/*` and the token regeneration. Each had a date, a priority and a written justification. None
of the wrong work got done, so the cost is not wasted effort — it is that the queue reads as
trustworthy and is not. Measurements and method in
`docs/reports/2026-08-17-inbox-avatar-rungs-and-a5.md` and
`docs/reports/2026-08-17-token-drift-measured.md`.

**Not verified:** the "180 instances" figure. The Plugin API has no global instance index and I
measured one page. I am not repeating the number as if I had counted it.
