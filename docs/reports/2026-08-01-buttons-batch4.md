# 2026-08-01 — buttons batch 4, and a correction to my own count

Screenshots: `2026-08-01-buttons-batch4-{light,dark}.png`.

DID — 8 buttons migrated:

| Where | Now |
|---|---|
| `MonthNav` prev/next | `<Button variant="outline" size="icon-sm">` — 44 mobile / 32 desktop is exactly that variant |
| `AppErrorBoundary` ×2 | `<Button>` and `<Button variant="outline">` |
| `SheetBase` close | `<IconButton variant="ghost" size="lg">` |
| `ProfileView` back | `<IconButton variant="ghost" size="lg">` |
| `FAB` action | `<Button variant="outline">` — gains the focus ring and disabled state it never had |
| `EgresosCard` filter chip | `<Button variant="outline" size="xs">`, **and its radius went `xl` → `full`**, which `06-radius-map.md` had specified for `action-chip` all along |

Typography rode along where it was unambiguous: `MonthNav`'s month title and `ProfileView`'s
screen title were 17px and 18px Bold → `Heading/Subsection` (18/28 SemiBold). Verified on the
page: `18px/28px w600 ls-0.25px`, and the nav buttons compute to `32×32 r9999px`.

FOUND — **my "10 remaining" figure in the last report was wrong. It is 20.**

I counted with a regex that only matched a literal `className="…rounded-…"` on the `<button>`
tag. Every button whose classes are composed inside `cn(...)` — which is most of the interesting
ones — was invisible to it. Re-counted by scanning the whole element including its `cn()` block:
**20 raw buttons carry a radius**, across `OnboardingView` (6), `AccountCardView` (2),
`ProfileView` (2) and nine files with one each.

I found this only because the browser reported ten radius-bearing raw buttons on a screen where
my source scan said there should be none. Worth stating plainly: the source scan was the wrong
instrument and the rendered page corrected it, same as with the focus ring.

**What those 20 actually are matters more than the number.** The ten the browser showed were the
four sidebar nav items and the five MesView tabs — `menu-item`, `Tab` and nav in Figma, all of
them in the list of 37 components that exist in code only as inline markup (`08-component-gap.md`
§1). They are not `Button`s and should not become one; they need extraction into their own
components, which is a decision that doc explicitly parks. Same for `DatePicker`'s trigger (an
input field wearing a `<button>`, radius 8 = the input rung, already correct) and `ProfileView`'s
currency selector (a selection card, `border-2`, `py-4`).

So the ticket's DONE WHEN — "zero raw `<button>` with its own radius" — **cannot be met by
migrating to `<Button>`**. What is left divides into: things awaiting component extraction (§1),
and things that are not buttons at all.

NEEDS:
- **Orchestrator: the buttons ticket needs its DONE WHEN restated,** or closing with the
  remainder handed to the §1 extraction decision. Everything that is genuinely a `Button` or an
  `IconButton` has now been migrated. I would rather it close honestly than be marked done
  against a condition the codebase cannot satisfy.
- Peer mail to Design is in `docs/inbox/design/`: `Q-amount-rungs` (the two Amount calls I made
  on my own reading) and `FYI-gap-audit-corrections` (the `sr-only` note that would remove a
  visible figure).
