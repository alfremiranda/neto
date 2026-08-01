# 2026-08-01 — component gap §2: all 11 disagreements closed

`08-component-gap.md` measured 11 places where the code and Figma disagree on form or spacing.
All of them are `src/**`, so all of them were mine. All 11 are applied.
Screenshots: `2026-08-01-component-gap-{light,dark}.png`.

| # | Was | Now |
|---|---|---|
| 1 | `Popover` p 10 / gap 10 / radius 12 | 12 / 8 / 8 — the worst-matched primitive, wrong on all three |
| 2 | `Card` header and content flush | content `pt-4`, so the 16 separation Figma has |
| 3 | `CardTitle` 16 Medium, line height unset | `.ts-heading-card` — 16/24 SemiBold |
| 4 | `Toast` `text-[13px]`, `py-[10px]` | `.ts-body-small`, `py-2` → the pill is 34px, not 38 |
| 5 | `Select` menu radius 12, rows ~36 / `pl-3` | radius 8, `h-8`, `pl-2` |
| 6 | `MetricCard` `p-3` | `p-4`, the 16 every other card uses |
| 7 | `Empty` media tile `rounded-xl` | `rounded-lg` — `06-radius-map.md` had already recorded this |
| 8 | `SectionCard` header `pb-3` | `pb-2` |
| 9 | `Button` XL `px-4` | `px-[18px]`; the other three sizes already matched |
| 10 | inputs LG height wearing MD padding | `px-4 sm:px-3` on `Input`, `Select`, `DatePicker` |
| 11 | generic `ui/sheet` had no radius | `rounded-t-2xl`, matching `RowActionsSheet` |

Also applied Design's three header answers (`907c1d2b`): notification count 9 → 10 as
`Label/Badge` — dropping the hand-written `tabular-nums`, since the generator now supplies it, so
9 → 10 → 99 cannot reflow the chip; avatar initials 10 → 12 SemiBold, sized by the component
rather than by a text style; and the wordmark keeps its frozen 16/Bold/-0.4px with only the dead
`--font-heading` reference moved to the sans.

FOUND:
- **Two of the eight off-scale text sizes died as a side effect.** `13px` was Toast's only usage
  and is now gone; `30px` (`text-3xl`) was already absent. What remains for typography-3 is
  `15px` (5 usages) and `9px` (2). The gap audit and the typography audit were closing the same
  debt from different directions.
- Fix #2 is the most visible of the eleven — four cards had their title block sitting flush
  against their content. It reads as a layout bug once you see it side by side, and no token
  change could ever have caught it. That is the argument for §1 of that doc.

DECISIONS:
- Applied all eleven in one commit rather than batching. They are independent one-to-three-line
  changes with both sides measured, and splitting them would have cost more review than it saved.
  If any single one is wrong it reverts cleanly on its own.
- Verified in the browser at 1280 in both themes: no page errors, no layout breakage. I did not
  verify mobile widths — #10 is specifically a mobile-only padding change, and `?preview` has no
  viewport switch yet.

NEEDS:
- **A mobile-width pass on #10.** The responsive input padding only differs below `sm`, so the
  desktop screenshots prove nothing about it. I can add viewport sizes to the harness next time
  rather than guessing.
- §1 of the gap doc — the 37 Figma components that exist in code only as inline markup — is a
  real decision about extraction, not a defect list. It wants its own ticket and probably its own
  sequencing discussion; I have not touched it.
