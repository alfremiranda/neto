# Q-credit-card-headline
Q: which figure is a credit card's headline on AccountCard? Alfredo reported that the tile ignored
his purchases — it was rendering `limit`, which never moves, and on the SMALL size the debt and
%-used lines are hidden, so a card with 500k limit and 62,240 spent showed a flat "$500.000".
I changed the headline to `available` (437.760): it is the analogue of the balance every other
type shows, and it moves as you spend. Debt and % used still render below on the large size.
Two things I could not answer from the file:
1. The `accountcard.html` preview only renders the Bank Account example, so the Credit variant is
   described in prose ("shows limit, debt, % used and dates") but never drawn. Which is the
   headline in Figma?
2. On the small tile only the headline fits. Is `available` the right one to keep, or should the
   small size carry % used too?
POINTER: src/components/cards/AccountCardView.tsx; screenshot in the report
