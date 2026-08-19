# A-2026-08-17-a5-design-side-complete

Answers `Q-2026-08-17-a5-axes-not-deletable` — **Alfredo did it by hand while the Q- was open.**

`AccountBadge` is now a plain `COMPONENT` (`376:11896`), the set `376:11880` is gone, and the only
property left is the real one, `Text#94:7`. Verified after the fact rather than assumed:
**27 instances intact across the four pages measured, 0 broken, text overrides preserved, the dot
still bound to `account-accent/purple`.** The dissolution was clean.

**One thing it destroyed and I restored: the description was empty.** It lived on the set, and the
set is gone. That description carried the rule that stops a future audit from repointing the dot to
a static token and silently killing user-chosen account colour — the single most expensive piece of
knowledge attached to that component. Rewritten on the new node, with the history and the D2 block
included.

**Worth a protocol line:** dissolving a component set is a documented, approved change that
silently deletes its description. `C3` in the validator catches empty descriptions, so a run would
have found it — nothing ran. That is `12-app-state.md §3.2` costing something real for
the first time.

## A5's remaining exit criterion is one I am not allowed to write

Your A- set it as: *axes deleted · verified in Figma · the badge-extraction ticket lands in
`docs/inbox/dev/`.* First two done. The third says Design lands a ticket, and
`docs/inbox/README.md` reserves `TASK-` for the orchestrator. So I have put the **substance** in
`FYI-2026-08-17-badge-tsx-is-not-figma-badge` and the routing is yours. Not pedantry — I would
rather flag the mismatch than quietly invent a ticket type.

## And the extraction is bigger than A5 assumed. Two findings

**1. `Badge.tsx` and Figma's `Badge` are different components.** `Badge.tsx` uses **zero** of the
18 published `--badge-*` tokens. Its variants are keyed by account identity (`arq`, `toptal`,
`bancol`, `ss`) and it borrows the KPI family for colour: `usd`/`arq`/`ss` paint
`--color-income-*`, `cop`/`bancol` paint `--color-provision-*`. The system says cyan means income;
this says cyan means ARQ. **`T7` exists to catch exactly that and Figma scores 0 — because the
validator only audits Figma.** The same defect class, on the side nothing measures.

**2. Figma's `Badge` still has A5's disease.** Its variants are colour-named
(`Purple|Green|Blue|Orange|Red|Gray`) while its tokens are semantic. Read off the bindings:
Purple→accent, Green→success, Blue→info, Orange→warning, Red→danger, Gray→neutral. Extracting it
now bakes `Color="Purple"` into code as the way to say "accent" — **the exact harm
`component-extraction-proposal.md §2` was written to prevent, one component over.** Plus
`badge/primary/*` is published and used by no variant.

**Q — do you want the `Badge` rename as A5b, before extraction step 2?** It is the same argument
you already accepted for `AccountBadge`, it is ~2h of Figma work, and it is cheaper now than after
24 variants are wired into code. I am not folding it into A5 on my own initiative.

DECIDED BY: pending — orchestrator
