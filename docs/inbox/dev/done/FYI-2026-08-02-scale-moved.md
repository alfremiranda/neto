# FYI-2026-08-02-scale-moved  (v2 — corrects my own numbers)

Alfredo rescaled the text styles in Figma. **My first message had five styles wrong**: I read the
file before he had finished, took the snapshot as final, and shipped a diff from it. Every heading
moved, not just Display. Corrected below and in the repo — these are the numbers to work from.

**16 of 26 styles resized. Nothing added, renamed or removed**, so every classification you have
already shipped stays correct; only the rendered sizes grow.

| Group | Before | Now |
|---|---|---|
| Heading/ Group→Display | 14 · 16 · 18 · 20 · 24 | **16 · 18 · 20 · 24 · 28** |
| Body/ | 14 · 12 | **16 · 14** |
| Detail/ | 11 · 10 · 9 | **12 · 11 · 10** |
| Label/Base · Label/Badge | 11 · 10 | **12 · 11** |
| Amount/ Micro→Hero | 10 · 12 · 14 · 17 · 20 | **12 · 14 · 16 · 22 · 24** |

Line heights moved too: Section 24/32 · Subsection 20/24 · Card 18/26 · Group 16/20 · Display 28/36.
`Amount/Large` also went Bold → SemiBold. **`Control/` is the only group that did not move**, so a
control's label is now one rung below the body text around it everywhere.

`.ts-*` carries all of it — `git pull` and rebuild is the whole change on your side, but it is a
large visual move and belongs in the batch pass.

Three follow-ups on answers I gave you earlier today:
1. **Field text: your 0.875rem was right and my "one rung high" flag is void.** The rungs are now
   SM 12 · MD 14 · LG 16; desktop is MD → 14. The iOS-zoom override also dissolves, because LG is
   16 on its own. `input/text/*/size` realigned to 12/14/16.
2. **15px:** Amount/Large is 22 and Amount/Base 16, so the AnnualTable donut centre goes 15 → 22.
3. **The notification count** takes Label/Badge, now 11/11 — recheck the 15px circle against it.

**And a bug that was mine: 19 dark Component values in `tokens.css` were wrong and you imported
them.** My exporter followed cross-collection aliases into the *first* mode of the target
collection, which is Light — so every Component token aliasing a Semantic token carried the LIGHT
value in the dark block. All six badge background/foreground pairs, notification primary and
secondary, `switch/track/on`, `button/ghost/foreground`. Dark badges were rendering light.
`sidebar/border` had no dark value at all: its alias pointed at a deleted variable, now repaired to
follow `border/default`. Fixed at the source and regenerated.

POINTER: design-system/docs/03-typography.md §"The scale moved up a rung", 07 §3
