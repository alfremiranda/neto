# Q-obligaciones-pagadas-y-reserva

CONTEXT: the app accrues SS and retención as formulas, but the user pays them as real
movements — SS one month later (July's SS is paid in August), retención once a year out of a
reserve. Today the payment is registered as a Gasto, so it lands in the month's total a second
time and understates neto libre. I'm adding the data link that separates "caused" from "paid";
three UI pieces have no antecedent in the DS and I don't want to invent their semantics.

Q1. State on an obligation. The "Total SS" row in ObligacionesCard needs to read Pendiente
(with the month it falls due) and later Pagado (with the date). `badge.html` exists but has no
paid/pending pair, and this is a settlement state, not a category or an account. New Badge
variants, or something else? Note it marks the GROUP, not each row — PILA is one payment
covering salud + pensión + ARL + FSS.

Q2. Pending strip. In August the user must be able to pay July without navigating back a month.
I'm putting a strip above Obligaciones: icon + "SS de julio · $1.234.567" + an action that opens
the gasto sheet prefilled. It only exists while a debt is unpaid, and it lists more than one
month when several are overdue (oldest first). Closest antecedent is `action-chip.html`, but
this is a full-width row carrying an amount and an action. Is it a chip, a variant of
`obligation-itemrow`, or its own element? And what does it look like when there are three?

Q3. Reserve card (retención). Goes in Ahorros beside "Total ahorrado": caused in the year,
reserved in ARQ Savings, and the gap between them — the gap is the number that matters, with a
progress bar. `savingscard.html` is the neighbour but shows a balance, not a target-vs-actual.
Does the DS want a progress/target variant of it, or a separate element?

Q4. Where a settlement surfaces. I took it OUT of the Gastos list — a row sitting there
without adding to the total reads as a bug — so it now shows only in the account ledger, where
the money actually moved. Verified in dev: total unchanged, row present in the ledger. Is the
ledger enough, or does the month view owe the user a trace of it? (Q1's Pagado badge would be
that trace, which is why I'm asking the two together.)

Q5. Minor: the gasto sheet still asks for a Categoría when the gasto is a settlement, where it
means nothing — settlements are out of every category aggregation. Hide the field in that
state, or leave it harmless?

UPDATE (same day): the user moved the entry point. Settling is a once-a-month action, so it no
longer sits in the ordinary "add expense" flow — the Obligaciones card now carries a Registrar
pago action per group, and the sheet opens prefilled (description, category, currency, period)
with the accrual shown as a reference. I built that with existing pieces: Button
size=sm/variant=outline on a bordered row, and a muted "Pagado $X" beside it. That row is
provisional and overlaps Q1 — it is the paid/pending state, just written in plain type because
the DS has no vocabulary for it yet. Q2's pending strip is still unbuilt and still the piece
that stops the user having to navigate back a month.

POINTER: src/components/cards/ObligacionesCard.tsx (Total SS at L334, GroupBox at L234),
src/components/views/AhorrosView.tsx, design-system/components/{badge,action-chip,savingscard,
obligation-itemrow}.html. The data side does not depend on these answers — I'm building it now
and will wire the visuals when you answer.
