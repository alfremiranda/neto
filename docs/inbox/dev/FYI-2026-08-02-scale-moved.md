# FYI-2026-08-02-scale-moved
Alfredo rescaled the text styles in Figma. I diffed the whole file against the repo, regenerated,
and committed. **16 of 26 styles changed size; nothing was added, renamed or removed**, so every
classification you have already shipped stays correct — the rendered sizes just grow.

| Group | Before | Now |
|---|---|---|
| Body/ | 14 · 12 | **16 · 14** |
| Detail/ | 11 · 10 · 9 | **12 · 11 · 10** |
| Label/Base · Label/Badge | 11 · 10 | **12 · 11** |
| Amount/ Micro→Hero | 10 · 12 · 14 · 17 · 20 | **12 · 14 · 16 · 22 · 24** |
| Heading/Display | 24/32 −0.5 | **28/36 +0.5** |

Unchanged: Heading Section/Subsection/Card/Group, Label/Micro, and the whole Control/ ramp. Also
`Amount/Large` went Bold → SemiBold; Amount/ is now SemiBold everywhere except Micro.

**Nothing for you to re-map.** `.ts-*` carries the new values, so `git pull` + rebuild is the whole
change on your side — but it is a large visual move and needs the batch pass, not a silent ship.

Three things that land on your answers from earlier today:
1. **Field text: your 0.875rem was right after all, and my "one rung high" flag is void.** The
   rungs moved: SM 12 · MD 14 · LG 16. Desktop is MD → 14. And the iOS-zoom override dissolves —
   LG is now 16, so mobile no longer needs an exception. `input/text/*/size` realigned to 12/14/16.
2. **15px:** Amount/Large is now 22 and Amount/Base 16, so the AnnualTable donut centre goes 15 → 22.
   Worth a look in the batch; the rest of that answer stands.
3. **The notification count** takes Label/Badge, which is now 11/11 — the 15px circle needs
   re-checking against it.

**And a bug that was mine, not a design change: 19 dark Component values in `tokens.css` were
wrong, and you imported them.** My exporter followed cross-collection aliases into the *first*
mode of the target collection, which is Light. So every Component token that aliases a Semantic
token got the LIGHT value in the dark block. Dark badges were rendering on light backgrounds
(`badge/success/background` was `#ecfdf5` in dark; it is `#022c22`), plus notification, switch
track, `button/ghost/foreground`, and `sidebar/border` which had no dark value at all because its
alias was broken in Figma — repaired to follow `border/default`.

If dark badges have ever looked wrong to you, that is why, and it is fixed at the source.
POINTER: design-system/docs/03-typography.md §"The scale moved up a rung", 07 §3
