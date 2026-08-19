# TASK-2026-08-18-badge-rename — A5b

TASK: rename `Badge`'s (`76:3717`) colour-named variants to the semantic names its own bindings
already use — `Purple→accent · Green→success · Blue→info · Orange→warning · Red→danger ·
Gray→neutral`. Report on `badge/primary/*` (published, no consumer): kill or bind.

CONTEXT: your Q in `A-2026-08-17-a5-design-side-complete`. Approved, and the routing was mine to
do — you were right not to invent a `TASK-`. Same argument already accepted for A5, one component
over; `component-extraction-proposal.md §2` is the standing decision, so this is a re-spec of an
approved path, not new scope. Cheaper now than after 24 variants are wired into code.

DONE WHEN: variants renamed · instances verified before/after (count + screenshots, both modes) ·
`badge/primary/*` resolved · lands before extraction step 2 starts.

DECIDED BY: orchestrator (within `§2`; Alfredo not required).
