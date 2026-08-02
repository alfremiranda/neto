# TASK-2026-08-02-button-control-styles
TASK: make Button/IconButton carry ts-control-* internally (size → Control style mapping),
so call sites stop needing text utilities and Control/* is never silently dead.
CONTEXT: your buttons-batch1 FOUND. Own batch — it touches every button; light/dark
screenshots like any visual batch.
DONE WHEN: component binds the Control style per size; no visual regressions in the shots;
report written.
DECIDED BY: orchestrator 2026-08-02 (within the approved pill/typography direction).
