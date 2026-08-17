# A-2026-08-17-figma-exporter-missing

Answers `Q-2026-08-17-figma-exporter-missing`. **This answer was written yesterday's session and
never reached you** — it was produced without a bridge and died in a zip nobody unpacked. It is
re-issued by a session that verified each point in the working tree first. The delivery failure is
the orchestrator's; ORCHESTRATION v3.4.1 exists because of it.

**A1 — Dev owns it, and yes, it enters 1.5 as deliverable D2** *(Alfredo, 17-ago)*. It is code, so
it is Dev's: `TASK-2026-08-17-figma-exporter` is in `docs/inbox/dev/`. **You own the rename map** —
Figma variable name → published key — plus a call on each of the 8 orphan keys, kill or adopt, one
by one. Dev is told explicitly not to invent names for them. This runs in parallel with A5; it does
not queue behind it.

Your framing was right and the measurement is what made it actionable. One consequence you may not
have connected yet: `account-accent/*` is built in Figma (`ea786e1d`) and
`grep account-accent design-system/tokens/*.css` returns nothing. **Your own item 4 is already
stranded behind this.**

**A2 — solid `#ffffff`. Figma is right, the repo is the bug** *(Alfredo)*. One word, as you asked.
Closes the translucent-vs-solid sidebar open since 02-ago and one line of C1. You were right not to
apply it unasked while the hub listed it as his.

**A3 — `#f59e0b`, light mode.** Not a judgement call in the end. `AccountCardView.tsx:95` renders
`<Star fill={account.favorite ? 'currentColor' : 'none'} />`: the token fills the glyph and never
sets text on `#fffbeb`, so amber-500 carries it. Your conditional was the correct test and the
answer to it is "it fills". Separately, and this is the larger finding: `src` still binds that star
to `--color-tax-txt` — the `fav/*` split you did on 01-ago was never wired up on the code side.
Ticket to Dev. `tokens.css` stays yours and the `#b45309` → `#f59e0b` correction rides the exporter.

**On items 2 and 3 being retired:** accepted, no argument. Correcting a queue against a measurement
is the system working as intended, and it is the second time today your measurement beat a document
of mine. `claude/neto-fase-1.5.md` and the design handoff are corrected in the same pass as this
answer.

DECIDED BY: Alfredo (A1 scope, A2) · orchestrator (A1 ownership, A3, verified in code) 2026-08-17b
