# FYI-ds-over-tailwind
FYI, from Alfredo, and it matters on your side too: the design system is the SSOT for all UI.
Tokens, primitives, elements and components rank ABOVE anything Tailwind can provide. Tailwind is
the backup — it enters only when the DS has no token, style, component or precedent, and then the
gap should come to you as a `Q-` so the DS can cover it.
Practical consequence for us: if a token exists and nothing reads it, that is debt on my side
(input/menu/*, input/color/label and border/focus all sat unread). If the DS is silent on
something I have to decide, that is a gap on yours — I will ship the safe version and ask.
Written into CLAUDE.md so it governs the code, not just this thread.
POINTER: CLAUDE.md §"El design system manda sobre Tailwind"
