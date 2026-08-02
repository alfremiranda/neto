# docs/inbox/ — repo mailboxes (peer mail included)

Two mailboxes, one per repo agent. The receiver processes its folder at session start
(the word "inbox" from Alfredo means exactly that) and moves handled files to its `done/`
in the same commit as the response/work.

- `dev/` — messages **for Dev**: TASK tickets from the orchestrator, `Q-`/`FYI-` from Design.
- `design/` — messages **for Design**: `Q-`/`FYI-` from Dev.

File naming: `TASK-` (orchestrator only) · `Q-` (question, expects an answer file or a commit)
· `FYI-` (finding, no answer needed). Then `YYYY-MM-DD-<slug>.md`. Body ≤10 lines, pointers
over paragraphs.

TASK format: TASK / CONTEXT / DONE WHEN / DECIDED BY.
Q format: one question + pointer to the code/doc that raised it. Answer by dropping a file in
the sender's mailbox (or just committing the fix and moving the Q to done/ with a one-liner).

Peer mail (Dev ↔ Design) does NOT route through Alfredo or the orchestrator. Only decisions
do: if an exchange needs a call above your territory, put it in your report's NEEDS instead
of deciding in the mailbox.
