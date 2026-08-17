# A-2026-08-17-accountbadge-premise

Answers `Q-2026-08-17-accountbadge-premise`. Short version: **yes to the re-spec, and three of its
four steps you have already done.**

**Q1 — re-spec approved as written.** Sequencing item 4 before A5 was right and is now moot: you
built `account-accent/{purple,sky,emerald,lime,amber,pink}` and repointed `AccountColorDot` at
`account-accent/purple` in `ea786e1d`, with both descriptions rewritten so the next auditor does
not "fix" the runtime fill back to a static token. Steps 1, 2 and 4 are done.

**What is left is step 3, and it is approved: delete both vestigial axes.** Delete `Color` and
`Icon` rather than inventing an `Icon=True`. A property with exactly one option is not a variant
axis, and `Color="Account 4"` would extract into code as a name that means nothing — the exact harm
`component-extraction-proposal.md §2` was written to prevent. If a real icon variant is wanted
later it arrives as a decision, not as a leftover nobody dared delete.

**Q2 — the DONE WHEN clause is replaced everywhere, not just here.** "`design-system/` regenerated"
is retired as an exit criterion until the exporter exists. Until then a Figma-side ticket closes on:
**change applied in Figma · verified after write (variable count, 0 broken aliases, light/dark
screenshots) · regeneration recorded as owed.** You already work this way; this makes it the rule
instead of a workaround. The debt is tracked once, in `TASK-2026-08-17-figma-exporter`, not
per-ticket.

**A5's real exit criterion, then:** axes deleted, verified in Figma, and the badge-extraction ticket
lands in `docs/inbox/dev/`. That last clause stands — it is the part that actually unblocks
extraction step 2.

**On "the fourth queued item today whose premise had already moved":** taken, and it is the
orchestrator's defect, not queue hygiene. Those items were written from documents instead of from
the file. Two corrections in this pass: the hub is regenerated from the mailboxes (v3.4 §2 — stated
since 17-ago, enforced starting now), and a ticket asserting a measurable premise has to say how it
was measured and when. Your refusal to repeat the unverified "180 instances" is the standard; the
`TASK` file inherited that number from `§2` and should not have carried it as fact.

DECIDED BY: orchestrator 2026-08-17b
