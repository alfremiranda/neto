# Neto

**A personal financial planner for Colombian independents who invoice in USD and owe in COP.**
Live at [netofinanzas.app](https://netofinanzas.app).

An employee never has to ask this. Anyone working *por prestación de servicios* asks it every
month:

> **"Of what I invoiced, how much is actually mine?"**

Nobody withholds for you. You calculate, set aside and pay health, pension, ARL and withholding
tax yourself — and you provision what an employee simply receives: primas, cesantías, vacaciones.
On top of that you live in two currencies against a rate that moves daily. Neto does that
arithmetic and shows the number that survives it: **neto libre**.

## What it does

**The month is the unit of work.** Income, expenses, transfers, tax obligations and provisions —
the last two appear only if your work profile calls for them. Every entry files under its real
date, never the month you happen to be looking at.

**Four account types, each with its own logic.** Bank (estimated yield), cash, credit card
(limit, debt, % used, statement and payment dates), and savings/CDT with a countdown to maturity.
Each account gets its own page: identity, its headline figures, a balance chart with a date-range
strip, and a chronological ledger that crosses months.

**Transfers know about FX.** Move money USD → COP and record what you actually received: Neto
shows the effective rate against the official one, and the difference in both absolute and
percentage terms.

**Obligations are a configurable engine, not hardcoded math.** Health, pension and ARL over your
IBC; withholding over gross; the solidarity fund when the IBC crosses four minimum wages, with
the legal reference. It shows where the IBC came from — 40% of service income, or the legal SMMLV
floor — and the payment calendar keyed to the last two digits of your cédula. Every rule can be
toggled or adjusted, and you can add provisions of your own.

**Accrual and cash are kept apart.** An obligation is *caused* in one month and *paid* in
another: social security a month in arrears, withholding once a year out of a reserve. Recording
the payment marks which period it settles, so it debits the account without being counted twice —
and the months you still owe surface on the month you can actually pay them in.

**The overview.** Monthly KPIs with drill-through, an interactive annual donut, an eight-month
trend, spend by category against its average, and CSV export for your accountant.

**Offline-first, multi-device.** Installable as a PWA, fully operational with no connection.
Cloud is backup, not requirement. Edit on two devices and it merges per entry rather than
overwriting — deletions propagate through tombstones, so nothing resurrects.

## Built with

React 19 and TypeScript on Vite · Tailwind CSS 3 · Zustand for state · Supabase for auth and
private per-user backup · d3 for charts · Radix and vaul for primitives.

Tested with Vitest, plus two regression passes enforced in CI. Visual: 320 screenshots — every
story in light and dark at two widths — compared against committed baselines. Motion: a real
browser checks that navigation reverses direction when you go back, and that
`prefers-reduced-motion` removes displacement without removing the thing that says something is
happening. A separate validator rejects raw hex in components, literal durations and easing
curves, and dangling token references.

The component library is published at
[netofinanzas.app/storybook](https://netofinanzas.app/storybook/), where each component carries
its acceptance criteria beside it.

`design-system/` is **generated**, not maintained by hand. `_build/build.py` regenerates tokens,
foundations and components from two JSON files exported from Figma, and CI verifies the output is
still reproducible from that source. If a value is wrong, it is wrong in Figma.

530 commits, designed and built solo.

## Not yet

No OS-level push notifications — reminders are in-app. No full-text search in expenses; filtering
is by category, account and date. Month arrows don't cross a year boundary. Savings accounts are
created after onboarding, not during. Account deletion is by email; the self-service button comes
later.

## Docs

`neto.md` — product guide in user language · `PRODUCT.md` — business rules and technical context ·
`design.md` — the design system

Privacy policy: [netofinanzas.app/privacidad.html](https://netofinanzas.app/privacidad.html)
