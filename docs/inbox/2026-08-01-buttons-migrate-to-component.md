# buttons-migrate-to-component
TASK: migrate the 54 hand-rolled <button> elements to <Button>/<IconButton> so the pill
decision (and states/focus ring) reaches the whole app. Start with the AUTH screens —
Alfredo flagged them in the batch-1 sign-off. Then batch per view, riding with the
typography-3 batches (one visual pass covers both).
CONTEXT: your 2026-08-01-typography-1-family report (76 vs 54 count; OnboardingView 16,
Header 9, ObligacionesCard 6, EgresosCard 5, rest scattered).
DONE WHEN: zero raw <button> with its own radius; screenshots per batch; report per batch.
DECIDED BY: Alfredo 2026-08-01 ("migrarlos", opción recomendada). Batch-1 typography is
APPROVED as-is — only the buttons observation carries forward into this ticket.
