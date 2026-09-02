import { describe, it, expect } from 'vitest'
import { availableRanges, rangeStart, hasDayLevelDates } from '@/lib/chartRange'
import type { Account, FinanceDB, MonthData, Income, Egreso } from '@/types'

const TODAY = '2026-09-01'

const account = (over: Partial<Account> = {}): Account =>
  ({ id: 'Bancolombia', label: 'Bancolombia', currency: 'COP', number: '', rate: 0, startingBalance: 0, ...over })

const month = (over: Partial<MonthData> = {}): MonthData =>
  ({ trm: 4000, incomes: [], egresos: [], transfers: [], ...over })

const egreso = (date: string, id = 1): Egreso =>
  ({ id, desc: 'Gasto', category: 'otro', amount: 1000, currency: 'COP', date, account: 'Bancolombia' })

const income = (date: string | undefined, id = 1): Income =>
  ({ id, desc: 'Ingreso', amount: 1000, currency: 'COP', account: 'Bancolombia', tipo: 'servicios', date })

const ids = (db: FinanceDB, acct = account()) => availableRanges(acct, db, TODAY).map(r => r.id)

describe('rangeStart', () => {
  it('walks back the right distance for each range', () => {
    expect(rangeStart('1D',  TODAY)).toBe('2026-08-31')
    expect(rangeStart('1S',  TODAY)).toBe('2026-08-25')
    expect(rangeStart('1M',  TODAY)).toBe('2026-08-01')
    expect(rangeStart('3M',  TODAY)).toBe('2026-06-01')
    expect(rangeStart('YTD', TODAY)).toBe('2026-01-01')
    expect(rangeStart('1A',  TODAY)).toBe('2025-09-01')
    expect(rangeStart('5A',  TODAY)).toBe('2021-09-01')
  })

  it('rolls over a year boundary', () => {
    expect(rangeStart('1M', '2026-01-15')).toBe('2025-12-15')
    expect(rangeStart('1S', '2026-01-03')).toBe('2025-12-27')
  })
})

describe('availableRanges', () => {
  it('offers nothing for an account with no movements', () => {
    expect(ids({ '2026-09': month() })).toEqual([])
  })

  it('keeps the range that shows everything, and drops the ones behind it', () => {
    // Oldest is mid-June. 3M reaches back past 1M's start, so it earns its pill and is
    // the window that shows the whole history. YTD, 1A and 5A would each redraw it.
    expect(ids({ '2026-06': month({ egresos: [egreso('2026-06-15')] }) }))
      .toEqual(['1D', '1S', '1M', '3M'])
  })

  it('does not strand history behind the widest pill', () => {
    // The bug this rule exists to prevent: with the literal "older than its own start"
    // reading, 3M vanished and 1M became the widest — showing August while June and July
    // sat unreachable.
    const db = { '2026-06': month({ egresos: [egreso('2026-06-01')] }) }
    const widest = availableRanges(account(), db, TODAY).at(-1)!
    expect(widest.start <= '2026-06-01').toBe(true)
  })

  it('grows the strip as the account gets older', () => {
    // Oldest Mar 2024: reaches past 1A's start (Sep 2025), so 5A earns its pill and is
    // the one that shows everything.
    expect(ids({ '2024-03': month({ egresos: [egreso('2024-03-10')] }) }))
      .toEqual(['1D', '1S', '1M', '3M', 'YTD', '1A', '5A'])
  })

  it('offers all seven once something is older than five years', () => {
    expect(ids({ '2020-01': month({ egresos: [egreso('2020-01-10')] }) }))
      .toEqual(['1D', '1S', '1M', '3M', 'YTD', '1A', '5A'])
  })

  it('stops one range past the data, never short of it', () => {
    // Oldest exactly a year ago: 1A reaches past YTD's start so it is offered and shows
    // everything; 5A behind it would only redraw the same line.
    const got = ids({ '2025-09': month({ egresos: [egreso('2025-09-01')] }) })
    expect(got).toContain('1A')
    expect(got).not.toContain('5A')
  })

  it('drops 1D and 1S when any income of the account carries no date', () => {
    const db: FinanceDB = {
      '2024-03': month({ egresos: [egreso('2024-03-10')] }),
      '2026-08': month({ incomes: [income(undefined, 7)] }),
    }
    expect(ids(db)).toEqual(['1M', '3M', 'YTD', '1A', '5A'])
  })

  it('keeps them when every income is dated', () => {
    const db: FinanceDB = {
      '2024-03': month({ egresos: [egreso('2024-03-10')] }),
      '2026-08': month({ incomes: [income('2026-08-14', 7)] }),
    }
    expect(ids(db)).toContain('1D')
  })

  it('ignores an undated income belonging to a DIFFERENT account', () => {
    const db: FinanceDB = {
      '2024-03': month({ egresos: [egreso('2024-03-10')] }),
      '2026-08': month({ incomes: [{ ...income(undefined, 7), account: 'Nequi' }] }),
    }
    expect(ids(db)).toContain('1D')
    expect(hasDayLevelDates('Bancolombia', db)).toBe(true)
    expect(hasDayLevelDates('Nequi', db)).toBe(false)
  })

  it('labels follow Figma', () => {
    const db: FinanceDB = { '2020-01': month({ egresos: [egreso('2020-01-10')] }) }
    expect(availableRanges(account(), db, TODAY).map(r => r.label))
      .toEqual(['1D', '1S', '1M', '3M', 'YTD', '1A', '5A'])
  })
})
