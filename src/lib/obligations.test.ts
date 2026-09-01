import { describe, it, expect } from 'vitest'
import {
  nextMonthKey, accruedIn, settledFor, reservedFor, pendingSS, retencionReserve,
} from '@/lib/obligations'
import { calcGastos, calcAllDeductions, calcTotales, calcIBC, calcProvisionBase } from '@/lib/calc'
import { DEFAULT_DEDUCTIONS } from '@/data/deductions'
import type { FinanceDB, MonthData, Egreso, Transfer, Income } from '@/types'

const SMMLV = 1_750_905
const smmlvFn = () => SMMLV
const TRM = 4000

const income = (amount: number, over: Partial<Income> = {}): Income =>
  ({ id: 1, desc: 'Contrato', amount, currency: 'COP', account: 'Bancolombia', tipo: 'servicios', ...over })

const egreso = (over: Partial<Egreso> = {}): Egreso =>
  ({ id: 1, desc: 'Gasto', category: 'otro', amount: 100_000, currency: 'COP', date: '2026-08-05', ...over })

const month = (over: Partial<MonthData> = {}): MonthData =>
  ({ trm: TRM, incomes: [], egresos: [], transfers: [], ...over })

describe('nextMonthKey', () => {
  it('advances within a year and rolls over December', () => {
    expect(nextMonthKey('2026-07')).toBe('2026-08')
    expect(nextMonthKey('2026-12')).toBe('2027-01')
    expect(nextMonthKey('2026-09')).toBe('2026-10')  // pads the month
  })
})

describe('accruedIn', () => {
  it('accrues SS off the month income', () => {
    const m = month({ incomes: [income(20_000_000)] })
    const { ss } = accruedIn(m, 7, DEFAULT_DEDUCTIONS, SMMLV)
    // IBC = 40% of 20M = 8M. Salud 12.5% + pensión 16% + ARL 0.522% = 2_321_760,
    // plus FSS at 1% (IBC is 4.57 SMMLV, over the 4-SMMLV threshold) = 80_000.
    expect(ss).toBe(2_321_760 + 80_000)
  })

  it('accrues NOTHING for a month with no incomes', () => {
    // calcIBC floors at the SMMLV even with nothing registered, so an unguarded
    // accrual would invent a debt for every empty month in the db.
    expect(accruedIn(month(), 7, DEFAULT_DEDUCTIONS, SMMLV)).toEqual({ ss: 0, retencion: 0 })
    expect(accruedIn(undefined, 7, DEFAULT_DEDUCTIONS, SMMLV)).toEqual({ ss: 0, retencion: 0 })
  })
})

describe('a settlement is not an expense', () => {
  it('excludes the marked egreso from the month total but keeps plain ones', () => {
    const egresos = [
      egreso({ id: 1, amount: 500_000 }),
      egreso({ id: 2, amount: 2_000_000, settles: { kind: 'ss', period: '2026-07' } }),
    ]
    expect(calcGastos(egresos, TRM, '2026-08-31')).toBe(500_000)
  })

  it('THE BUG: SS is no longer counted twice in a steady-state month', () => {
    // August accrues its own SS and pays July's. Before `settles`, the payment
    // landed in gast on top of August's accrual and understated neto libre.
    const incomes = [income(20_000_000)]
    const julySS  = 2_401_760
    const egresos = [egreso({ id: 9, amount: julySS, settles: { kind: 'ss', period: '2026-07' } })]

    const gast     = calcGastos(egresos, TRM, '2026-08-31')
    const bruto    = calcTotales(incomes, TRM).bruto
    const ibc      = calcIBC(incomes, TRM, SMMLV)
    const provBase = calcProvisionBase(incomes, TRM)
    const res      = calcAllDeductions(bruto, ibc, 8, DEFAULT_DEDUCTIONS, gast, TRM, [], provBase, SMMLV)

    expect(gast).toBe(0)
    expect(res.total).toBe(res.ssTotal + res.nonSsTotal)   // July's payment is absent
    expect(res.netoLibre).toBe(bruto - res.ssTotal - res.nonSsTotal)
  })
})

describe('settledFor / reservedFor', () => {
  const db: FinanceDB = {
    '2026-08': month({
      egresos: [
        egreso({ id: 1, amount: 2_000_000, settles: { kind: 'ss', period: '2026-07' } }),
        egreso({ id: 2, amount: 999_999, settles: { kind: 'ss', period: '2026-06' } }),
        egreso({ id: 3, amount: 500_000 }),
      ],
    }),
  }

  it('finds a payment filed in a later month than the period it covers', () => {
    expect(settledFor(db, 'ss', '2026-07')).toBe(2_000_000)
    expect(settledFor(db, 'ss', '2026-06')).toBe(999_999)
    expect(settledFor(db, 'ss', '2026-05')).toBe(0)
  })

  it('converts a USD settlement at the month TRM', () => {
    const usd: FinanceDB = {
      '2026-08': month({
        egresos: [egreso({ id: 1, amount: 500, currency: 'USD', settles: { kind: 'ss', period: '2026-07' } })],
      }),
    }
    expect(settledFor(usd, 'ss', '2026-07')).toBe(500 * TRM)
  })

  it('does not confuse a reserve with a payment', () => {
    const transfer: Transfer = {
      id: 1, date: '2026-08-10', from: 'ARQ', to: 'ARQSavings',
      amount: 1000, fromCurrency: 'USD', toCurrency: 'USD', trm: TRM, toAmount: 1000,
      reserves: { kind: 'retencion', period: '2026' },
    }
    const withReserve: FinanceDB = { '2026-08': month({ transfers: [transfer] }) }
    expect(reservedFor(withReserve, 'retencion', '2026')).toBe(1000 * TRM)
    expect(settledFor(withReserve, 'retencion', '2026')).toBe(0)
  })
})

describe('pendingSS', () => {
  const withIncome = () => month({ incomes: [income(20_000_000)] })

  it('lists an accrued month once it is due, and not before', () => {
    const db: FinanceDB = { '2026-07': withIncome() }
    expect(pendingSS(db, DEFAULT_DEDUCTIONS, smmlvFn, '2026-07')).toEqual([])  // not payable yet
    const due = pendingSS(db, DEFAULT_DEDUCTIONS, smmlvFn, '2026-08')
    expect(due).toHaveLength(1)
    expect(due[0]).toMatchObject({ kind: 'ss', period: '2026-07', dueKey: '2026-08' })
    expect(due[0].pending).toBeGreaterThan(0)
  })

  it('clears the month once it is paid', () => {
    const accrued = accruedIn(withIncome(), 7, DEFAULT_DEDUCTIONS, SMMLV).ss
    const db: FinanceDB = {
      '2026-07': withIncome(),
      '2026-08': month({ egresos: [egreso({ amount: accrued, settles: { kind: 'ss', period: '2026-07' } })] }),
    }
    expect(pendingSS(db, DEFAULT_DEDUCTIONS, smmlvFn, '2026-08')).toEqual([])
  })

  it('still clears when PILA rounding makes the payment differ by a few pesos', () => {
    const accrued = accruedIn(withIncome(), 7, DEFAULT_DEDUCTIONS, SMMLV).ss
    const db: FinanceDB = {
      '2026-07': withIncome(),
      '2026-08': month({ egresos: [egreso({ amount: accrued - 700, settles: { kind: 'ss', period: '2026-07' } })] }),
    }
    expect(pendingSS(db, DEFAULT_DEDUCTIONS, smmlvFn, '2026-08')).toEqual([])
  })

  it('surfaces a skipped month ABOVE the recent one', () => {
    const db: FinanceDB = {
      '2026-06': withIncome(),
      '2026-07': withIncome(),
    }
    const pending = pendingSS(db, DEFAULT_DEDUCTIONS, smmlvFn, '2026-08')
    expect(pending.map(p => p.period)).toEqual(['2026-06', '2026-07'])  // oldest first
  })

  it('ignores empty months instead of inventing a minimum-wage debt', () => {
    const db: FinanceDB = { '2026-05': month(), '2026-06': month(), '2026-07': withIncome() }
    expect(pendingSS(db, DEFAULT_DEDUCTIONS, smmlvFn, '2026-08').map(p => p.period)).toEqual(['2026-07'])
  })

  it('reports a partial payment as the remainder', () => {
    const accrued = accruedIn(withIncome(), 7, DEFAULT_DEDUCTIONS, SMMLV).ss
    const db: FinanceDB = {
      '2026-07': withIncome(),
      '2026-08': month({ egresos: [egreso({ amount: 1_000_000, settles: { kind: 'ss', period: '2026-07' } })] }),
    }
    const [p] = pendingSS(db, DEFAULT_DEDUCTIONS, smmlvFn, '2026-08')
    expect(p.pending).toBeCloseTo(accrued - 1_000_000, 0)
  })
})

describe('retencionReserve', () => {
  const m = () => month({ incomes: [income(20_000_000)] })

  it('accumulates the year and measures the gap against marked transfers', () => {
    const reserve = (id: number, toAmount: number): Transfer => ({
      id, date: '2026-08-10', from: 'ARQ', to: 'ARQSavings',
      amount: toAmount, fromCurrency: 'COP', toCurrency: 'COP', trm: TRM, toAmount,
      reserves: { kind: 'retencion', period: '2026' },
    })
    const db: FinanceDB = {
      '2026-07': m(),
      '2026-08': month({ incomes: [income(20_000_000)], transfers: [reserve(1, 3_000_000)] }),
    }
    const r = retencionReserve(db, 2026, DEFAULT_DEDUCTIONS, smmlvFn)
    expect(r.accrued).toBe(20_000_000 * 0.2 * 2)   // 20% of gross, two months
    expect(r.reserved).toBe(3_000_000)
    expect(r.gap).toBe(8_000_000 - 3_000_000)
    expect(r.pct).toBeCloseTo(3 / 8, 4)
  })

  it('floors the gap at zero when over-reserved, and caps pct at 1', () => {
    const over: Transfer = {
      id: 1, date: '2026-08-10', from: 'ARQ', to: 'ARQSavings',
      amount: 99_000_000, fromCurrency: 'COP', toCurrency: 'COP', trm: TRM, toAmount: 99_000_000,
      reserves: { kind: 'retencion', period: '2026' },
    }
    const db: FinanceDB = { '2026-07': month({ incomes: [income(20_000_000)], transfers: [over] }) }
    const r = retencionReserve(db, 2026, DEFAULT_DEDUCTIONS, smmlvFn)
    expect(r.gap).toBe(0)
    expect(r.pct).toBe(1)
  })

  it('does not count another year, and reports no gap with nothing accrued', () => {
    const db: FinanceDB = { '2026-07': m() }
    const r = retencionReserve(db, 2025, DEFAULT_DEDUCTIONS, smmlvFn)
    expect(r).toMatchObject({ accrued: 0, reserved: 0, gap: 0, pct: 0 })
  })
})
