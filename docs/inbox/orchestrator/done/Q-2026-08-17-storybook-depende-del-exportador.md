# Q-2026-08-17-storybook-depende-del-exportador

**Q — Move D1 (Storybook) from "after A5/A6" to "after the exporter"?** Design's read is that its
current queue position rests on a premise that does not hold, and that its real dependency is
harder than the one written down.

**The stated reason does not hold.** `neto-fase-1.5.md §4bis` queues D1 after A5/A6 because
*"hoy estaría casi vacío"*. Measured: `src/components/ui/` holds **24 extracted components**
(Avatar, Badge, Button, Input, Select, Popover, Sheet, Tooltip, Calendar, Drawer, Sidebar,
Skeleton, Switch, Toast, MoneyInput, DatePicker, MetricCard, SectionCard, Empty and more), and
`design-system/components/` holds 57 generated previews. A5/A6 unblock **badges and item rows**
specifically — not the library.

**The real dependency is the exporter, and it is not optional.** Both of D1's non-negotiable
conditions are hollow without a reproducible build:

1. **Visual regression from day one** would freeze as its baseline an artifact already drifted
   from Figma by 31 unpublished variables and 2 disagreeing values. That is a drift detector
   calibrated against the drift — it would certify the wrong picture as correct, and every future
   real change would read as a regression.
2. **"A header showing which version of `design-system/` is painting"** cannot say anything
   meaningful about a package nobody can regenerate from source.

§4bis states the principle itself: *"Figma es la verdad de lo que debe ser; Storybook es la prueba
de lo que es."* A test needs a reference. **The reference is the exporter.**

**Proposal:** D1's blocker becomes `Q-2026-08-17-figma-exporter-missing`, not A5/A6. If the
exporter lands before A5/A6 — likely, since it is Dev work with no design decisions in it — D1 can
start on the 24 components already extracted instead of waiting on badges.

**Not changing the plan doc myself.** `neto-fase-1.5.md` still says 13 deliverables where 15 were
authorised, and sequencing is yours; both corrections belong in the same pass.

Full measured state of the system, with the validator run and the reproduction steps, now lives in
`design-system/docs/12-arquitectura-estado.md` — next to the tokens it describes, per `00 §A7`.
Headline: the layer model is sound (`T5`, `T6`, `T7`, `T4` all at 0), and what is missing is
machinery — no build, nothing runs the validator, and 93.5% of variables still carry no code
syntax.
