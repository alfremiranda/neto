/**
 * The demo persona — a full year of data for marketing captures.
 *
 * Separate from `devPreview.ts` on purpose. That fixture is one month, shaped to exercise
 * the views for visual QA, and it should stay that way. This one has to make the ANNUAL
 * surfaces render something worth photographing: the donut, the eight-month trend, the
 * category ranking, and an Obligaciones page where some months are paid and some are not.
 * One month of data turns every one of those into an empty state.
 *
 * Three rules it follows, and each one exists for a reason:
 *
 * 1. **It is not Alfredo.** A capture of the real app shows real figures — a real salary,
 *    real expenses, real balances — and those cannot go on a public marketing page. The
 *    persona is invented whole.
 * 2. **No third-party brands.** `TRANSFER_ACCOUNTS` ships with Bancolombia, Nequi and
 *    "ARQ (Observer Hub)" — real banks and a real client. Naming them in a screenshot
 *    reads as an integration or an endorsement that does not exist, and app stores reject
 *    marketing images that imply an affiliation. The accounts here describe their role.
 * 3. **It is deterministic.** Every figure derives from a seeded generator, so the same
 *    month always produces the same numbers. A capture that changes between runs cannot
 *    be re-taken after a UI change without re-photographing everything.
 *
 * Usage: `npm run dev` then http://localhost:5173/?preview=demo
 */
import { DEFAULT_DEDUCTIONS } from '@/data/deductions'
import type { Account, Egreso, FinanceDB, Income, MonthData, Transfer } from '@/types'

/** Deterministic per-month jitter. Not random: the same key always returns the same value. */
function wobble(key: string, spread: number): number {
  let h = 2166136261
  for (let i = 0; i < key.length; i++) {
    h ^= key.charCodeAt(i)
    h = Math.imul(h, 16777619)
  }
  return ((h >>> 0) / 4294967295) * 2 * spread - spread
}

const round = (n: number, to = 1000) => Math.round(n / to) * to

const ACCOUNTS: Account[] = [
  { id: 'usd', label: 'Cuenta en dólares', currency: 'USD', type: 'account', number: '4417',
    rate: 0, startingBalance: 1800, favorite: true, color: 'emerald' },
  { id: 'ahorros', label: 'Cuenta de ahorros', currency: 'COP', type: 'account', number: '8032',
    rate: 0, startingBalance: 3_200_000, favorite: true, color: 'blue' },
  // The id must be the app's own system cash account, 'Efectivo' (TRANSFER_ACCOUNTS). The store
  // backfills that locked account whenever it is missing, so a demo cash account under any other
  // id (it was the lowercase one) showed up as a second "Efectivo" at $0 beside this one.
  { id: 'Efectivo', label: 'Efectivo', currency: 'COP', type: 'cash', number: '',
    rate: 0, startingBalance: 240_000, locked: true, color: 'amber' },
  { id: 'tarjeta', label: 'Tarjeta de crédito', currency: 'COP', type: 'credit', number: '6621',
    rate: 0, startingBalance: 0, creditLimit: 4_500_000, cutoffDay: 15, dueDay: 5, color: 'rose' },
  { id: 'reserva', label: 'Reserva para la DIAN', currency: 'COP', type: 'savings',
    savingsKind: 'cuenta', number: '', rate: 11.5, startingBalance: 0, favorite: true, color: 'teal' },
  { id: 'cdt', label: 'CDT 12 meses', currency: 'COP', type: 'savings', savingsKind: 'cdt',
    number: '', rate: 10.75, startingBalance: 8_000_000, maturityDate: '2027-02-18', color: 'indigo' },
]

/** Recurring expenses, the ones that repeat every month with small variation. */
const FIXED: { desc: string; category: string; base: number; spread: number; account: string; recurring: boolean }[] = [
  { desc: 'Arriendo',            category: 'vivienda',        base: 2_100_000, spread: 0,       account: 'ahorros',  recurring: true },
  { desc: 'Servicios públicos',  category: 'vivienda',        base: 265_000,   spread: 55_000,  account: 'ahorros',  recurring: true },
  { desc: 'Mercado',             category: 'alimentacion',    base: 760_000,   spread: 130_000, account: 'tarjeta',  recurring: false },
  { desc: 'Salud prepagada',     category: 'salud',           base: 318_000,   spread: 0,       account: 'ahorros',  recurring: true },
  { desc: 'Internet y celular',  category: 'tecnologia',      base: 168_000,   spread: 0,       account: 'ahorros',  recurring: true },
  { desc: 'Transporte',          category: 'movilidad',       base: 275_000,   spread: 70_000,  account: 'Efectivo', recurring: false },
  { desc: 'Streaming',           category: 'entretenimiento', base: 58_000,    spread: 0,       account: 'tarjeta',  recurring: true },
]

/** One-off expenses, so the category ranking is not the same seven bars every month. */
const OCCASIONAL: Record<number, { desc: string; category: string; amount: number; account: string }[]> = {
  2:  [{ desc: 'Silla de escritorio', category: 'trabajo',  amount: 1_190_000, account: 'tarjeta' }],
  3:  [{ desc: 'Seguro de vida',      category: 'seguros',  amount: 486_000,   account: 'ahorros' }],
  5:  [{ desc: 'Viaje a Cartagena',   category: 'viajes',   amount: 1_840_000, account: 'tarjeta' }],
  6:  [{ desc: 'Regalo de grado',     category: 'familia',  amount: 420_000,   account: 'Efectivo' }],
  7:  [{ desc: 'Monitor y teclado',   category: 'trabajo',  amount: 2_240_000, account: 'tarjeta' }],
  8:  [{ desc: 'Curso de motion',     category: 'trabajo',  amount: 690_000,   account: 'ahorros' }],
}

/** Months where the variable project billed, and for how much. Not every month: a
 *  freelancer's income is lumpy, and a flat retainer every month is a fiction that makes
 *  the trend chart a straight line. */
const PROJECT_USD: Record<number, number> = { 1: 0, 2: 1_600, 3: 2_400, 4: 0, 5: 1_200, 6: 3_100, 7: 0, 8: 2_050, 9: 1_450 }

const RETAINER_USD = 4_200

export function demoDB(now = new Date()): FinanceDB {
  const year = now.getFullYear()
  const lastMonth = now.getMonth() + 1
  const db: FinanceDB = {}
  let entryId = 1000
  let cardSpendLastMonth = 0

  for (let m = 1; m <= lastMonth; m++) {
    const key = `${year}-${String(m).padStart(2, '0')}`
    const trm = round(3_950 + wobble(`trm${key}`, 180), 0.01)
    // September is the month the app opens on, and it excludes future-dated entries from
    // its totals — so nothing in the current month may be dated after today.
    const day = (d: number) => `${key}-${String(Math.min(d, m === lastMonth ? now.getDate() : 28)).padStart(2, '0')}`
    const ts = Date.parse(`${key}-01T12:00:00Z`)

    const incomes: Income[] = [
      { id: entryId++, desc: 'Lumen Studio — retainer mensual', amount: RETAINER_USD, currency: 'USD',
        account: 'usd', tipo: 'servicios', date: day(3), updatedAt: ts },
    ]
    if (PROJECT_USD[m]) {
      incomes.push({ id: entryId++, desc: `Proyecto Vela — hito ${Math.ceil(m / 2)}`, amount: PROJECT_USD[m],
        currency: 'USD', account: 'usd', tipo: 'servicios', date: day(18), updatedAt: ts })
    }
    if (m % 4 === 0) {
      incomes.push({ id: entryId++, desc: 'Taller de UX — cliente local', amount: 1_200_000, currency: 'COP',
        account: 'ahorros', tipo: 'otro', date: day(22), updatedAt: ts })
    }

    const egresos: Egreso[] = FIXED.map(f => ({
      id: entryId++,
      desc: f.desc,
      category: f.category,
      amount: round(f.base + wobble(`${f.desc}${key}`, f.spread)),
      currency: 'COP' as const,
      date: day(f.recurring ? 5 : 12),
      recurring: f.recurring,
      confirmed: true,
      account: f.account,
      updatedAt: ts,
    }))

    for (const o of OCCASIONAL[m] ?? []) {
      egresos.push({ id: entryId++, desc: o.desc, category: o.category, amount: o.amount,
        currency: 'COP', date: day(16), confirmed: true, account: o.account, updatedAt: ts })
    }

    // Social security is paid a month in arrears, so every month from February settles the
    // previous one. The current month has NOT been paid yet — that is the whole point of the
    // Obligaciones page, and a year where every month is green shows nothing.
    if (m > 1 && m < lastMonth) {
      const prev = `${year}-${String(m - 1).padStart(2, '0')}`
      const prevGross = (RETAINER_USD + (PROJECT_USD[m - 1] ?? 0)) * (3_950 + wobble(`trm${prev}`, 180))
      const ibc = Math.max(prevGross * 0.4, 1_750_905)
      const accrued = round(ibc * (0.125 + 0.16 + 0.00522), 100)
      egresos.push({
        id: entryId++, desc: `Seguridad social ${prev}`, category: 'impuestos',
        amount: accrued, currency: 'COP', date: day(9), confirmed: true, account: 'ahorros',
        settles: { kind: 'ss', period: prev, accrued, ibc: round(ibc, 100) }, updatedAt: ts,
      })
    }

    // Cash out of savings to cover what the month spends in cash, rounded up to the next 50.000.
    // Without it the cash account only ever paid — transport every month, a gift in June — and
    // closed the year at −$2.083.000, a negative wallet on the Cuentas capture.
    const cashSpend = egresos.filter(e => e.account === 'Efectivo').reduce((sum, e) => sum + e.amount, 0)
    const cashOut = Math.ceil((cashSpend + 20_000) / 50_000) * 50_000

    // The card is paid in full on its due day (the 5th) for what it charged the month before.
    // Without it every purchase stayed owed: the card closed September at −$12.927.000, 287% of
    // its $4.500.000 limit, on the account detail a landing capture shows.
    const cardPayment = cardSpendLastMonth
    cardSpendLastMonth = egresos.filter(e => e.account === 'tarjeta').reduce((sum, e) => sum + e.amount, 0)

    const transfers: Transfer[] = [
      { id: entryId++, date: day(4), from: 'ahorros', to: 'Efectivo', amount: cashOut,
        fromCurrency: 'COP', toCurrency: 'COP', trm: null, toAmount: cashOut, updatedAt: ts },
      ...(cardPayment > 0
        ? [{ id: entryId++, date: day(5), from: 'ahorros', to: 'tarjeta', amount: cardPayment,
            fromCurrency: 'COP' as const, toCurrency: 'COP' as const, trm: null, toAmount: cardPayment, updatedAt: ts }]
        : []),
      // Bringing dollars home. A PROPORTION of what came in that month, not a flat figure:
      // with a fixed 3.000 the surplus piled up and the account closed the year at USD
      // 24.400, which nobody leaves sitting in an operating account. The declared
      // `toAmount` is slightly under amount × trm, which is what makes the effective-TRM
      // readout show a real fee instead of zero.
      { id: entryId++, date: day(6), from: 'usd', to: 'ahorros',
        amount: round((RETAINER_USD + (PROJECT_USD[m] ?? 0)) * 0.86, 50),
        fromCurrency: 'USD', toCurrency: 'COP', trm,
        toAmount: round(round((RETAINER_USD + (PROJECT_USD[m] ?? 0)) * 0.86, 50) * trm * 0.988),
        updatedAt: ts },
      // The retención reserve — marked, not inferred from the account balance.
      { id: entryId++, date: day(10), from: 'ahorros', to: 'reserva',
        amount: round((RETAINER_USD + (PROJECT_USD[m] ?? 0)) * trm * 0.2, 10_000),
        fromCurrency: 'COP', toCurrency: 'COP', trm: null,
        toAmount: round((RETAINER_USD + (PROJECT_USD[m] ?? 0)) * trm * 0.2, 10_000),
        reserves: { kind: 'retencion', period: String(year) }, updatedAt: ts },
      // A monthly contribution to the CDT. Two reasons, and the second is the honest one:
      // it gives that account a ledger to photograph, and without it the savings balance
      // climbed past 86 M — every provision the app counts as set aside was still sitting
      // in the account, because provisioning on paper does not move money. True to life,
      // and an aspirational figure to put in front of somebody billing the same as her.
      { id: entryId++, date: day(11), from: 'ahorros', to: 'cdt', amount: 3_500_000,
        fromCurrency: 'COP', toCurrency: 'COP', trm: null, toAmount: 3_500_000, updatedAt: ts },
    ]

    db[key] = { trm, incomes, egresos, transfers } as MonthData
  }

  const ts = Date.parse(`${year}-01-01T12:00:00Z`)
  db._settings = {
    accounts: ACCOUNTS.map(a => ({ ...a, updatedAt: ts })),
    deductions: DEFAULT_DEDUCTIONS.map(d => ({ ...d, updatedAt: ts })),
    onboardingDone: true,
    displayName: 'Daniela',
    primaryCurrency: 'COP',
    secondaryCurrency: 'USD',
    privacyConsent: { version: 1, acceptedAt: ts },
    fieldUpdatedAt: { onboardingDone: ts, displayName: ts },
  }

  return db
}

/** Display-only, for the account menu. Same shape devPreview uses, different person. */
export function demoUser() {
  return {
    id: 'demo-user',
    email: 'daniela@ejemplo.co',
    user_metadata: { full_name: 'Daniela Restrepo', avatar_url: null },
  }
}
