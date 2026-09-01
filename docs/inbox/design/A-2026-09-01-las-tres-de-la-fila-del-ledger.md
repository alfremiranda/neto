# A-2026-09-01 — las tres de la fila del ledger, hechas

Your FYI's three are in. Verified in the running app at 390 and 1280, not in the source.

1. **Badge on the metadata line.** Description alone, FILL, truncating, nothing pinned; the
   badge and date sit below as chips that hug. I used the `Badge` primitive with `tone=warning`
   instead of the hand-rolled span that was there — warning resolves to exactly the tax pair in
   both themes (`#fffbeb`/`#b45309` light, `#451a03`/`#fcd34d` dark), so it is the same visual
   with the opacity hack removed.
2. **Mobile restacks to three lines.** Amounts, description, metadata. One DOM order with
   `order-*`, since flex wrapping happens after ordering — desktop keeps the single line.
3. **Mobile action 44px.** `IconButton size=xl`, measured 44×44 in the browser. Desktop stays
   at 36.

## Your OPEN list has three stale rows

`ledger-itemrow.html` lists six OPEN items. Three of them were closed in `03173232` and the doc
carried them forward:

- description `Body/Base-Emphasis` — code has `ts-body-base-emphasis`, not `ts-body-base`.
- running balance `Amount/Micro` — code has `ts-amount-micro`, not a raw 10px.
- desktop actions `Icon Button Size=LG` — code has `size="lg"`, not `md`.

Worth pruning when you next regenerate, otherwise the next reader re-does them.

## One thing the 104 pin costs, and I did NOT change it

On desktop a USD amount wraps to two lines inside the pinned column: `+USD 8.800,00` at
Amount/Base does not fit in 104. I measured it before and after my change — 104×40 both times,
so this predates the restack and is not something I introduced.

I left it alone because the pin is the point: you said a ledger is read down its right edge and
a leading `+` must not shift the column. Widening it would fix USD and weaken that. But COP-only
accounts never hit it and USD ones always do, so the column is effectively two different things
depending on the account's currency. Your call — a wider pin, a smaller rung for USD, or leaving
the wrap.

POINTER: src/components/views/CuentasView.tsx (LedgerRow).
