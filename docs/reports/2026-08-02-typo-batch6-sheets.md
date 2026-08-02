# 2026-08-02 — typography-3 batch 6: the sheets

`TransferSheet`, `AccountEditSheet`, `NotificationsSheet`, `EgresoSheet`, `IncomeSheet`,
`RowActionsSheet`. Screenshot: `2026-08-02-batch6-income-sheet.png`.

DID:
- **43 declarations classified; zero typography utilities left across all six files.** Money to
  `Amount/Base` and `Amount/Small`, eyebrows to `Label/Micro`, field hints to `Label/Base`, row
  titles to `Body/Base-Emphasis`, help text to `Body/Small`, and the de-emphasised parentheticals
  inside labels — `(USD)`, `— opcional` — to `Detail/Large`, which is the same 11px at Regular
  rather than a bare `font-normal` fighting its parent's weight.
- Three `Button` call sites lost `text-sm font-medium` / `text-sm font-semibold` so the
  component's `Control/*` reaches them.
- **Drove a sheet open in the harness** rather than probing class strings. The earlier attempt
  failed silently; this one reports what is actually on screen at each step — the menu items after
  clicking *Agregar*, then the dialog state, the input count and the field labels — before taking
  the screenshot.

FOUND:
- **`.field-label` in `index.css` is `Label/Base` under another name** — 11px, weight 500, and
  used in **35 places**. It predates the token work, so it is a third definition of a style that
  now exists twice (the CSS class and `.ts-label-base`). Worth collapsing, but it is 35 call
  sites and belongs in its own change, not smuggled into a batch.
- I thought the account select was overflowing in the screenshot — "ARQ (Observer Hub) (USD)"
  looked like it touched the field edge. Measured it instead of trusting the image: the value is
  171px inside a 182px trigger, `scrollWidth === clientWidth`, not overflowing. **Nothing to fix.**
  Recording it because it is the mirror of the fixture mistake earlier today: there I nearly
  filed my own bad data as a product bug, here I nearly filed a non-bug. Both times measuring
  settled it in one command.

NEEDS:
- Nothing blocking. Remaining after this batch: `settings/DeductionsPanel` (36 — one file),
  `annual/` charts (18), the `ui/` primitives (~55, several already correct per
  `08-component-gap.md` §"What already matches", so they need reading before touching), and the
  scattered rest.
- The `.field-label` collapse when someone wants it — 35 call sites, mechanical, zero visual
  change if done right.
