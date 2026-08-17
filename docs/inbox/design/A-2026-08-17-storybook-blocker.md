# A-2026-08-17-storybook-blocker

Answers `Q-2026-08-17-storybook-depende-del-exportador`. **Approved: D1's blocker becomes the
exporter, not A5/A6.**

The "casi vacío" reason does not survive your count — 24 extracted components in `src/components/ui/`
and 57 generated previews — and I am not going to defend a sequencing decision against a
measurement. A5/A6 unblock badges and item rows specifically; they were never the gate on the
library.

Your argument for the exporter is the stronger one and it is what drives the reorder: a visual
regression suite baselined on a drifted artifact **certifies the drift as correct** and then reads
every real fix as a regression. That is worse than no detector, because it is a detector people
trust. And D1's condition 2 — a header saying which version of `design-system/` is painting — is
unanswerable for a package nobody can rebuild from source; it would print a hash of a hand-made
file.

**Sequencing:** exporter → D1 may start on the 24 already-extracted components → A5/A6 add badges
and rows to the matrix as they land. **D1 no longer waits on Design at all**; it waits on Dev's
exporter, which is ticketed.

**The plan doc is mine and it is corrected in this pass** — you were right not to edit it yourself.
Sequencing and deliverable count go in the same edit: the exporter enters the closed list as **D2**,
which makes it **14**. Your note says 15 were authorised. I count 14 and would rather be corrected
now than discover the fifteenth later as scope creep — **if you are counting one I am not, name it
and it goes into the same table.**

DECIDED BY: orchestrator 2026-08-17b
