import { DEFAULTS } from '@/data/defaults'
import { calcTotales, calcIBC, calcProvisionBase, calcAllDeductions } from '@/lib/calc'
import type {
  FinanceDB, MonthData, DeductionConfig, ObligationKind, Settles,
} from '@/types'

/**
 * Obligations accrue in one period and are paid in another. This module answers the
 * two questions that gap creates:
 *   - SS: "which months have I accrued but not yet paid?" (paid one month in arrears)
 *   - Retención: "how much have I set aside against what I owe?" (paid once a year)
 *
 * Every figure here is COP. See the `Settles` doc in types for why accrual and cash
 * are kept as separate facts rather than reconciled into one.
 */

/** '2026-07' → '2026-08'. The month an accrual becomes payable. */
export function nextMonthKey(key: string): string {
  const [y, m] = key.split('-').map(Number)
  return m === 12 ? `${y + 1}-01` : `${y}-${String(m + 1).padStart(2, '0')}`
}

export function yearOf(key: string): string {
  return key.split('-')[0]
}

const monthKeys = (db: FinanceDB): string[] =>
  Object.keys(db).filter(k => k !== '_settings').sort()

/**
 * What a single month accrues, by obligation.
 *
 * Returns zeros for a month with no incomes ON PURPOSE: calcIBC floors the IBC at
 * the SMMLV even with nothing registered, so accruing off it unconditionally would
 * invent a debt for every empty month in the db and fill the pending strip with
 * obligations the user never incurred.
 */
export function accruedIn(
  month:      MonthData | undefined,
  monthNum:   number,
  deductions: DeductionConfig[],
  smmlv:      number,
): Record<ObligationKind, number> {
  const incomes = month?.incomes || []
  if (!month || incomes.length === 0) return { ss: 0, retencion: 0 }

  const trm      = month.trm || DEFAULTS.trm
  const { bruto } = calcTotales(incomes, trm)
  const ibc      = calcIBC(incomes, trm, smmlv)
  const provBase = calcProvisionBase(incomes, trm)
  // gast is irrelevant to the accruals we read back, so it's 0 here.
  const res = calcAllDeductions(bruto, ibc, monthNum, deductions, 0, trm, month.voluntarias, provBase, smmlv)

  return {
    ss:        res.ssTotal,
    retencion: res.provItems.find(i => i.id === 'retencion' && i.applies)?.amount ?? 0,
  }
}

/** Sum of movements marked as settling (or reserving toward) a given period. */
function sumMarked(
  db: FinanceDB,
  pick: (m: MonthData) => { amount: number; currency: 'USD' | 'COP'; mark?: Settles }[],
  kind: ObligationKind,
  period: string,
): number {
  let total = 0
  for (const key of monthKeys(db)) {
    const month = db[key] as MonthData
    if (!month) continue
    const trm = month.trm || DEFAULTS.trm
    for (const e of pick(month)) {
      if (e.mark?.kind !== kind || e.mark.period !== period) continue
      total += e.currency === 'USD' ? e.amount * trm : e.amount
    }
  }
  return total
}

/**
 * How much has been PAID against an obligation period. Scans every month, because
 * the settling movement lives in the month it was paid (August) while pointing at
 * the period it covers (July).
 */
export function settledFor(db: FinanceDB, kind: ObligationKind, period: string): number {
  return sumMarked(
    db,
    m => (m.egresos || []).map(e => ({ amount: e.amount, currency: e.currency, mark: e.settles })),
    kind, period,
  )
}

/** How much has been SET ASIDE toward an obligation period (marked transfers). */
export function reservedFor(db: FinanceDB, kind: ObligationKind, period: string): number {
  return sumMarked(
    db,
    m => (m.transfers || []).map(t => ({ amount: t.toAmount, currency: t.toCurrency, mark: t.reserves })),
    kind, period,
  )
}

export interface PendingObligation {
  kind:    ObligationKind
  period:  string   // the month that accrued it, 'YYYY-MM'
  dueKey:  string   // the month it became payable, 'YYYY-MM'
  accrued: number
  settled: number
  pending: number
}

/**
 * SS accrued but not yet paid, for every period already due as of `asOfKey`.
 * Oldest first — a skipped month must surface above the current one, not below it.
 */
export function pendingSS(
  db:         FinanceDB,
  deductions: DeductionConfig[],
  getSMMLV:   (year: number) => number,
  asOfKey:    string,
): PendingObligation[] {
  const out: PendingObligation[] = []

  for (const period of monthKeys(db)) {
    const dueKey = nextMonthKey(period)
    if (dueKey > asOfKey) continue          // not payable yet

    const [y, m]  = period.split('-').map(Number)
    const accrued = accruedIn(db[period] as MonthData, m, deductions, getSMMLV(y)).ss
    if (accrued <= 0) continue

    const settled = settledFor(db, 'ss', period)
    const pending = accrued - settled
    // A tolerance, not a nicety: PILA rounds, so a payment almost never equals the
    // accrual to the peso. Without it every paid month keeps a few pesos pending
    // and the strip never clears.
    if (pending <= 1000) continue

    out.push({ kind: 'ss', period, dueKey, accrued, settled, pending })
  }

  return out
}

export interface ReserveStatus {
  period:   string   // 'YYYY'
  accrued:  number   // owed so far this year
  reserved: number   // actually set aside
  gap:      number   // accrued − reserved, floored at 0 — the actionable number
  pct:      number   // 0–1, capped at 1
  settled:  number   // paid to the DIAN (closes the year)
}

/**
 * Retención for a year: what it has accrued against what is actually set aside.
 *
 * `reserved` counts MARKED transfers rather than the destination account's balance
 * on purpose — personal savings share that account, and a balance would quietly
 * report the user as covered when they aren't.
 */
export function retencionReserve(
  db:         FinanceDB,
  year:       number,
  deductions: DeductionConfig[],
  getSMMLV:   (year: number) => number,
): ReserveStatus {
  const period = String(year)
  const smmlv  = getSMMLV(year)

  let accrued = 0
  for (const key of monthKeys(db)) {
    if (yearOf(key) !== period) continue
    const m = Number(key.split('-')[1])
    accrued += accruedIn(db[key] as MonthData, m, deductions, smmlv).retencion
  }

  const reserved = reservedFor(db, 'retencion', period)
  const settled  = settledFor(db, 'retencion', period)
  const gap      = Math.max(accrued - reserved, 0)

  return {
    period, accrued, reserved, gap, settled,
    pct: accrued > 0 ? Math.min(reserved / accrued, 1) : 0,
  }
}
