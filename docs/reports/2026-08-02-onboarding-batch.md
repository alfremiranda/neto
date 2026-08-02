# 2026-08-02 — OnboardingView: the last large surface

Screenshots: `2026-08-02-onboarding-{mobile,desktop}.png` (390 and 1280).

DID:
- **`?preview=onboarding`** — a second flag value that keeps the onboarding gate *closed* instead
  of skipping it, so the view can finally be reached. Plain `?preview` still lands on the app.
  Re-checked the production bundle: `DEV_PREVIEW_ONBOARDING`, `previewDB` and `pre-preview` are
  all 0 occurrences, same as before.
- Classified ~60 declarations. Step titles → `Heading/Section`, screen titles →
  `Heading/Display`, supporting prose → `Body/Base`, the uppercase tracked eyebrows →
  `Label/Micro` (the style built for exactly that), secondary text → `Body/Small`, field and row
  labels → `Body/Base-Emphasis`, currency chips → `Label/Badge`, the skip control →
  `Control/MD`.
- **`font-black` is gone from the codebase** — 0 occurrences. The "N" logomark now declares Bold,
  which is what it was already rendering: the variable axis stops at 800, so 900 was being
  clamped. Verified on the page at `30px w700`.
- Migrated the two genuine controls: the 28px remove button → `<IconButton size="md">` (it gains
  the focus ring it never had), and the skip link → `<Button variant="link">`.

DECISIONS — three things deliberately left as they are:

- **Two emoji and a logotype keep raw sizes.** `text-3xl` on a flag emoji and `text-xl` on
  another are glyph sizing, not typography; the "N" keeps `text-[30px]` as brand chrome, on the
  same reading Design applied to the wordmark. Binding any of them to a text style would make a
  logo follow body copy.
- **Five of the seven buttons are not `Button`s.** Two are segmented-control chips
  (`flex-1`, `px-2.5 py-1`) and three are option cards you tap to choose an account type or
  currency — the same pattern as `ProfileView`'s currency selector. They belong to the §1
  extraction list, not to a `Button` migration, so five raw `<button>` remain in the file by
  intent.

FOUND:
- Nothing new broke, and nothing contradicted the spec. This is the first batch where that is
  true, which I think is the system starting to hold rather than luck.

NEEDS:
- Nothing blocking. With this view done, `typography-3` has classified: auth screens, Header,
  the MesView default tab, and OnboardingView. Un-batched: `EgresosCard`, `ObligacionesCard`,
  `ProvisionesCard`, `MovimientosCard`, `AnnualTable` (partly done via the off-scale pass),
  `CuentasView`, `AhorrosView`, `ConfigView`, `ProfileView`, `DashboardView`.
- Off-scale text app-wide is now **only** the emoji and logotype above — no numeric size in the
  app sits off the scale any more.
