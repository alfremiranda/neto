import { accruedIn, settledFor, frozenAccrual, retencionReserve, nextMonthKey } from '@/lib/obligations'
import { localToday } from '@/lib/format'
import type { FinanceDB, MonthData, DeductionConfig, Settles } from '@/types'

/** One month's social security, as caused and as actually paid. */
export interface MonthlySS {
  period:  string   // 'YYYY-MM', the month that caused it
  dueKey:  string   // the month it is payable in
  /** What the app derives from that month's income and TRM. A suggestion. */
  suggested: number
  /** The IBC behind `suggested`. */
  suggestedIbc: number
  /** What the payment says it was worth, when one exists. */
  frozen:  number | null
  /** The IBC the payment declared, when it differed from the suggestion. */
  paidIbc: number | null
  paid:    number
  /** True once the period is payable — you cannot be late on a month not yet due. */
  due:     boolean
}

/** Reads the IBC a period's payments declared, latest wins. */
function declaredIbc(db: FinanceDB, period: string): number | null {
  let ibc: number | null = null
  for (const key of Object.keys(db).filter(k => k !== '_settings').sort()) {
    for (const e of (db[key] as MonthData | undefined)?.egresos || []) {
      const st = e.settles as Settles | undefined
      if (st?.kind !== 'ss' || st.period !== period) continue
      if (st.ibc != null) ibc = st.ibc
    }
  }
  return ibc
}

/**
 * The year's social security, month by month.
 *
 * Only months that actually accrued something appear: an empty month has no obligation,
 * and calcIBC floors at the SMMLV, so listing every month would invent twelve debts a
 * year for anyone who did not invoice.
 */
export function ssByMonth(
  db:         FinanceDB,
  year:       number,
  deductions: DeductionConfig[],
  getSMMLV:   (y: number) => number,
): MonthlySS[] {
  const today = localToday().slice(0, 7)
  const out: MonthlySS[] = []

  for (let m = 1; m <= 12; m++) {
    const period = `${year}-${String(m).padStart(2, '0')}`
    const derived = accruedIn(db[period] as MonthData | undefined, m, deductions, getSMMLV(year))
    const paid = settledFor(db, 'ss', period)
    if (derived.ss <= 0 && paid <= 0) continue

    out.push({
      period,
      dueKey: nextMonthKey(period),
      suggested: derived.ss,
      suggestedIbc: derived.ibc,
      frozen: frozenAccrual(db, 'ss', period),
      paidIbc: declaredIbc(db, period),
      paid,
      due: nextMonthKey(period) <= today,
    })
  }
  return out
}

export interface RetencionYear {
  accrued:  number
  reserved: number
  settled:  number
  gap:      number
  /** What each month contributed, for the same month-by-month reading as SS. */
  byMonth:  { period: string; accrued: number }[]
}

/**
 * Retención for a year. Unlike SS this is not paid monthly — it accrues all year and is
 * paid once, in arrears, so what the user tracks is the running total against what has
 * actually been set aside.
 */
export function retencionByYear(
  db:         FinanceDB,
  year:       number,
  deductions: DeductionConfig[],
  getSMMLV:   (y: number) => number,
): RetencionYear {
  const r = retencionReserve(db, year, deductions, getSMMLV)
  const byMonth: { period: string; accrued: number }[] = []

  for (let m = 1; m <= 12; m++) {
    const period = `${year}-${String(m).padStart(2, '0')}`
    const a = accruedIn(db[period] as MonthData | undefined, m, deductions, getSMMLV(year)).retencion
    if (a > 0) byMonth.push({ period, accrued: a })
  }

  return { accrued: r.accrued, reserved: r.reserved, settled: r.settled, gap: r.gap, byMonth }
}
