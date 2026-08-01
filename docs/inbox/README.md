# docs/inbox/ — Orchestrator → Dev task tickets

One file per task, written by the orchestrator via the connected folder. Dev processes at
session start (`git pull` first), then **moves the file to `docs/inbox/done/`** in the same
commit as the work (that's the ack). Ticket format — terse, context lives in docs:

    # <slug>
    TASK: one line.
    CONTEXT: pointer(s) — DIRECTION.md §n, PRODUCT.md §n, a commit, a screenshot path.
    DONE WHEN: verifiable condition.
    DECIDED BY: who approved it (so it's not re-litigated).

Anything longer than ~10 lines belongs in DIRECTION.md or the referenced doc, not here.
