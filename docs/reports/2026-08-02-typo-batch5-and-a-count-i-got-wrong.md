# 2026-08-02 — typography-3 batch 5, and the remaining surface is bigger than I said

Screenshots: `2026-08-02-batch5-{cuentas,ahorros,resumen}.png`.

DID — 48 declarations classified across seven files:
`CuentasView` (12), `AccountCardView` (6), `AhorrosView` (9), `ProfileView` (10), `ConfigView`
(8), `DashboardView` (2), `AnnualTable` (1). Money to `Amount/*`, eyebrows to `Label/Micro`,
headings to `Heading/Section`, `Subsection` and `Card`, the rest to `Body/*`.

One emphasis-rule violation fixed on the way: `ConfigView`'s "Ambiente de desarrollo" was
`font-semibold` inside running text, which `07 §4` forbids — now `Body/Small-Emphasis` (Medium).

Verified by navigating Cuentas, Ahorros and Resumen in the browser; no page errors.

FOUND — **my "remaining views" list has been wrong every time I have written it.**

I have been reporting what is left as a list of *views*. Swept properly across `src/components`:
**38 files still carry 215 typography declarations.** The views were the visible part. What I
never counted:

| | declarations |
|---|---|
| `settings/DeductionsPanel` | 36 |
| `sheets/` (Transfer 27, RowActions 11, AccountEdit 9, Notifications 8, Egreso 3, Income 3) | 61 |
| `ui/` primitives (sidebar 12, empty 5, sheet 5, MoneyInput 4, …) | ~55 |
| `annual/` charts (EgresosBreakdown 8, CategoryChart 5, TrendChart 5) | 18 |
| the rest, scattered | ~45 |

The sheets alone are more than everything I classified today. I was counting the surfaces I
could see in a screenshot and calling that the remainder — the same error as the `<button>` regex,
where I counted what my instrument caught rather than what existed.

**This does not change any decision, but it changes the estimate.** typography-3 is roughly
half done, not nearly done, and the second half is mostly sheets and primitives rather than views.

DECISIONS:
- Kept classifying by view rather than switching to a mechanical sweep. The `Amount` vs `Body`
  call needs to know what the text *is*, and the sheets are where money and labels sit closest
  together — a bulk regex would get them wrong in exactly the places that matter.

NEEDS:
- **Orchestrator: worth knowing the ticket is about half done, not nearly done.** No change of
  direction implied; I would rather the estimate be corrected now than at the end.
- Next batches, in the order I would take them: `sheets/` (61, where the money is), then
  `settings/DeductionsPanel` (36, one file), then `annual/` charts (18), then the `ui/`
  primitives (which need care — several are already correct per `08-component-gap.md` §"What
  already matches").
