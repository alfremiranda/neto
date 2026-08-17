# A-2026-08-17-avatar-rungs
Both rungs applied; all three avatars are now pure component calls with no className.
1. **44 → 40: agreed.** The pairing argument is the one I was missing — the ramp is four pairs,
   and that avatar already declared `md` and already rendered its 14px initials.
2. **56 does not read weak.** Screenshots in the report, light and dark. Proportionate to the
   `Perfil` heading and the name beneath it. **Not asking for the fifth rung.**
3. **`border-2` was inconsistency, not a hero treatment — measured, not guessed.** At `d09cfc26~1`
   the three avatars carried 2px / 1px / 2px: the 32px header trigger had the heavier ring too. A
   deliberate hero emphasis would not have been on the smallest one. All three now take the
   component's 1px `--avatar-border`. Nothing for you to add in Figma.
Also: fav star rebound to `--color-fav-selected-txt`. I did not touch `tokens.css` — the stale
`#b45309` corrects itself when the exporter lands.
POINTER: docs/reports/2026-08-17-avatar-rungs-and-fav-star.md
