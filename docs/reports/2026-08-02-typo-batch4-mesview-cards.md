# 2026-08-02 — typography-3 batch 4: the four remaining MesView cards

`EgresosCard`, `ObligacionesCard`, `ProvisionesCard`, `MovimientosCard`.
Screenshots: `2026-08-02-batch4-gastos-dark.png`, `-gastos-mobile-light.png`, `-tributarias-light.png`.

DID:
- **75 declarations classified across three passes; zero typography utilities left in the four
  files.** Money to `Amount/*` (micro 10 · small 12 · base 14 · large 17), eyebrows to
  `Label/Micro`, count bubbles and the action chip to `Label/Badge`, row titles to
  `Body/Base-Emphasis`, metadata to `Detail/Large` and `Detail/Base`, and one `<h2>` at 14
  SemiBold to `Heading/Group` — an exact match.
- Stripped `text-xs`/`text-sm` overrides from six `Button`/`Select`/`Popover` call sites so the
  component's `Control/*` reaches them, which is what the component refactor was for.
- Verified by driving all five tabs at 1280 and 390, light and dark. No page errors.

FOUND — **two failures of my own verification, one after the other:**

**1. My first tab sweep never changed tabs.** I clicked `button:has-text("Gastos")` and that
matched the distribution bar's legend button before the tab. The "Gastos" screenshot I was about
to accept still showed the Ingresos tab — visible only because hovering the legend had dimmed the
other bar segments. I had a screenshot labelled with the wrong content and would have reported it
as verified. Fixed by selecting the button whose parent holds four or more of the five tab labels.

**2. The `?preview` fixture used category IDs that do not exist.** `hogar`, `transporte` and
`conectividad` are not in `EGRESO_CATEGORIAS` — the real ones are `vivienda`, `movilidad` and
`tecnologia`. So three expense rows rendered with no category icon and the rows sat at ragged
indentation. **I nearly filed that as a product bug.** It was my fixture inventing data the app
could not resolve. Corrected; every row now has its icon, and the filter chips show the real
category names, which is also a better test surface than before.

Both are the same shape as the logomark miss: the check ran, produced output, and the output was
not what I assumed it was. The tab one is worse than the fixture one — a wrong screenshot passing
as evidence is exactly the failure mode this whole harness exists to prevent.

NEEDS:
- Nothing blocking. `typography-3` now covers auth, Header, OnboardingView and all of MesView.
  Remaining: `AnnualTable` (partly done), `CuentasView`, `AhorrosView`, `ConfigView`,
  `ProfileView`, `DashboardView`, `AccountCardView`, `KPIStrip`'s siblings in the annual view.
- One for whoever reviews the fixture: it is worth asserting in a test that every
  `category` in `previewDB()` exists in `EGRESO_CATEGORIAS`. It would have caught this in CI
  instead of in a screenshot I almost misread.
