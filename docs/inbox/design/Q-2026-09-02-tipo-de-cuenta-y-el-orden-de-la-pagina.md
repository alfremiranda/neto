# Q-2026-09-02 — dónde va el tipo, y un orden que TASK-…e no puede tener

Started on `TASK-2026-08-24e`. `2.5` and `2.2` are in; `2.1` is blocked on `2.3`, and one
placement is ambiguous.

## Q1. The type text — your prose and your preview disagree

`10-account-page.md` §10 and `accountcard.html` say "the header now opens with an AccountAvatar
(size=SM) … **paired with the account type as PLAIN TEXT in fg/account**", and `TASK-…e §2.5`
says "junto al avatar". But the rendered preview inside `accountcard.html` puts it in the META
line under the amount — `Cuenta de ahorros · 4,5% E.A.` — with the header holding only avatar,
name and star.

I implemented the META line, for three reasons, and I'll move it if you say the prose wins:
- the code already puts the savings KIND there (`Cta Ahorros`, `CDT`, `Inversión`), so type and
  kind read as one vocabulary in one place rather than two;
- the header at `size="sm"` is 46% of a 390 viewport holding avatar + name + star. A fourth
  item there truncates the name, which is the one thing the card exists to say;
- the preview is the artifact I can actually measure.

I reused the app's existing Spanish labels — Cuenta · Efectivo · Crédito · Ahorro — from the
edit sheet rather than inventing wording, and hoisted them so the two cannot drift.

Note the real win is not visual: the type lived **only** in the avatar glyph, which is
`aria-hidden`, so a screen reader was told nothing about what kind of account it is.

## Q2. `2.1` cannot ship before `2.3`, so I did not do it

You say four of the ledger header's six items "ya están en la tarjeta de arriba". They are in
the Figma `AccountSummaryCard` — but `CuentasView` renders `AccountCardView size="sm"`, and at
`sm` that component hides the Editar button, the rate line and the credit cutoff/payment line
(`!sm &&` guards, five of them). So deleting the header today removes:

- the only way to edit the selected account from this view,
- the detail line (`≈ USD 37,92/mes · 3.5% a.a.` / `16% usado · Corte 4 · Pago 20`),
- Saldo/Deuda actual.

Not a disagreement — an ordering constraint. `AccountSummaryCard` has to carry them first. I
plan to build its identity+figures half next and remove the header in the same change, leaving
the chart and `chart-range` for after §5's tooltip decision and Alfredo's copy call.

## Q3. The delete on the opening row — I chose, tell me if wrong

You left it open ("o la papelera no va, o significa borrar el saldo inicial"). **No papelera.**
The pencil opens the account sheet. A trash that silently means "clear a field" is the kind of
control someone hits once and regrets; the sheet already offers the same edit with its label
visible. `RowActionsSheet.onDelete` is now optional and hides the action rather than no-op it.

## UPDATE — `2.3` (identity half) and `2.1` are in

Q2 is resolved by building, not by asking. `AccountSummaryCard` exists in code now with its
identity and figures; the ledger header is gone in the same change.

Two calls inside it worth your eye:

- **The detail line became discrete metrics.** The header carried one run-on string
  (`≈ $37,92/mes · 3.5% a.a.`, `12% usado · Corte 19 · Pago 5`). Your rename gives the anatomy
  as `metrics / metric` — pairs — so it is pairs: Deuda actual · Cupo disponible · Usado ·
  Corte · Pago for a card, Saldo actual · Rendimiento · Tasa · Vence for the rest. A string
  cannot align across a row or be read out as label+value.
- **The divider appears with the chart, not before it.** A separator with nothing on its far
  side is a line, not a division. It arrives when `2.4` does; the card takes the chart as a
  slot and is ready for it.

Still not built, and waiting on you and on Alfredo: `AccountChart` and `chart-range` (§5's
tooltip decision — Figma draws `surface/inverse`, `TrendChart.tsx:269` draws `--popover` — and
the `1S`/`7D`, `YTD`/`Año` copy).

## Done in this pass

- `2.5` type as text (see Q1).
- `2.2` opening balance is the ledger's last row: wallet mark on the neutral tint, normal row
  structure, no date, no running balance, pencil only. It reuses `LedgerRow` in an `opening`
  mode rather than a lookalike, so the responsive shape you spent three passes settling cannot
  drift between the two.

POINTER: src/components/views/CuentasView.tsx, src/components/cards/AccountCardView.tsx,
src/data/defaults.ts (ACCOUNT_TYPE_LABEL).
