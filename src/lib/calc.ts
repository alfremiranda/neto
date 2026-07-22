import { DEFAULTS } from '@/data/defaults'
import { localToday } from '@/lib/format'
import type {
  Income, Egreso, MonthData, Totales, SSResult, Distribucion, Flujo, AnnualRow,
  DeductionConfig, DeductionResult, AllDeductionsResult, VoluntariaItem,
  Account, FinanceDB,
} from '@/types'

export function calcTotales(incomes: Income[], trm: number): Totales {
  let totUSD = 0, totCOP = 0
  incomes.forEach(i => {
    if (i.currency === 'USD') totUSD += i.amount
    else totCOP += i.amount
  })
  return { totUSD, totCOP, bruto: totUSD * trm + totCOP }
}

export function calcIBC(incomes: Income[], trm: number, smmlv: number): number {
  const serviciosIncomes = incomes.filter(i => (i.tipo || 'servicios') === 'servicios')
  // By law, IBC is always at least SMMLV — even with no incomes registered yet
  if (serviciosIncomes.length === 0) return smmlv
  const totalServicios = serviciosIncomes
    .reduce((a, i) => a + (i.currency === 'USD' ? i.amount * trm : i.amount), 0)
  return Math.max(totalServicios * DEFAULTS.ibc_factor, smmlv)
}

// Backward-compat: without deductions uses DEFAULTS constants
export function calcSS(ibc: number, deductions?: DeductionConfig[]): SSResult {
  if (!deductions) {
    const salud = ibc * DEFAULTS.ss_salud
    const pens  = ibc * DEFAULTS.ss_pens
    const arl   = ibc * DEFAULTS.ss_arl
    return { salud, pens, arl, total: salud + pens + arl }
  }
  const ssEnabled = deductions.filter(d => d.enabled && d.group === 'ss' && d.base === 'ibc')
  let salud = 0, pens = 0, arl = 0
  ssEnabled.forEach(d => {
    const amt = ibc * (d.pct / 100)
    if (d.id === 'salud')    salud = amt
    else if (d.id === 'pension') pens = amt
    else if (d.id === 'arl')     arl  = amt
  })
  return { salud, pens, arl, total: salud + pens + arl }
}

// Base for primas/cesantías/vacaciones: the gross of incomes flagged with
// "aplicar provisiones" (8.33% of gross ≈ one salary / 12), NOT gross − IBC —
// those provisions are on the income itself, and subtracting the SMMLV-floored
// IBC wrongly zeroed the base for incomes at or below the minimum wage.
export function calcProvisionBase(incomes: Income[], trm: number): number {
  return incomes
    .filter(i => i.applyProvisions !== false)
    .reduce((a, i) => a + (i.currency === 'USD' ? i.amount * trm : i.amount), 0)
}

export function calcFSS(ibc: number, smmlv: number): { amount: number; pct: number } {
  const x = ibc / smmlv
  let pct = 0
  if      (x >= 20) pct = 2
  else if (x >= 19) pct = 1.8
  else if (x >= 18) pct = 1.6
  else if (x >= 17) pct = 1.4
  else if (x >= 16) pct = 1.2
  else if (x >= 4)  pct = 1
  return { amount: ibc * (pct / 100), pct }
}

/**
 * The egresos that actually count toward totals:
 *  - savings ('ahorro') are reallocations to your own accounts, not expenses;
 *  - future-dated ("programado") ones don't count until their date arrives.
 * The cutoff defaults to today so monthly and annual figures never diverge —
 * every aggregation must go through here.
 */
export function settledEgresos(egresos: Egreso[] = [], cutoffDate: string = localToday()): Egreso[] {
  return (egresos || [])
    .filter(e => e.category !== 'ahorro')
    .filter(e => !e.date || e.date <= cutoffDate)
}

export function calcGastos(egresos: Egreso[], trm: number, cutoffDate: string = localToday()): number {
  return settledEgresos(egresos, cutoffDate)
    .reduce((a, e) => a + (e.currency === 'USD' ? e.amount * (trm || DEFAULTS.trm) : e.amount), 0)
}

// Kept for backward compat in FlujoCard/TrendChart migration
export function calcDistribucion(bruto: number, ssTot: number, gast: number): Distribucion {
  const ret  = bruto * DEFAULTS.retencion
  const prim = bruto * DEFAULTS.primas
  const netoLibre = bruto - ssTot - gast - ret - prim
  return { ret, prim, netoLibre }
}

/**
 * Computes all enabled deductions for a given month.
 * @param monthNum  1–12 (parsed from the YYYY-MM key)
 * @param gast      Pre-computed egresos total in COP
 */
export function calcAllDeductions(
  bruto:          number,
  ibc:            number,
  monthNum:       number,
  deductions:     DeductionConfig[],
  gast:           number,
  trm:            number,
  _voluntarias?:  VoluntariaItem[],  // deprecated: savings are movimientos now, ignored
  provisionBase?: number,  // base for neto_ibc; computed from selected incomes by caller
  smmlv?:         number,  // when provided, FSS (Fondo de Solidaridad) is injected after pension
): AllDeductionsResult {
  const provBase = provisionBase ?? Math.max(bruto - ibc, 0)

  function applies(d: DeductionConfig): boolean {
    if (!d.months || d.months.length === 0) return true
    return d.months.includes(monthNum)
  }

  function amount(d: DeductionConfig): number {
    if (!applies(d)) return 0
    switch (d.base) {
      case 'ibc':       return ibc * (d.pct / 100)
      case 'bruto':     return bruto * (d.pct / 100)
      case 'neto_ibc':  return provBase * (d.pct / 100)
      case 'fixed_cop': return d.amount ?? 0
      case 'fixed_usd': return (d.amount ?? 0) * trm
      case 'base_usd':  return (d.amount ?? 0) * trm * (d.pct / 100)
      default:          return 0
    }
  }

  function toResult(d: DeductionConfig): DeductionResult {
    return {
      id:      d.id,
      label:   d.label,
      group:   d.group,
      amount:  amount(d),
      pct:     d.pct,
      base:    d.base,
      color:   d.color,
      applies: applies(d),
    }
  }

  const enabled = deductions.filter(d => d.enabled)
  const ssItems: DeductionResult[]  = enabled.filter(d => d.group === 'ss').map(toResult)

  // Inject FSS after pension when smmlv provided and IBC ≥ 4 SMMLV
  if (smmlv && smmlv > 0) {
    const fss = calcFSS(ibc, smmlv)
    if (fss.pct > 0) {
      const pensionIdx = ssItems.findIndex(i => i.id === 'pension')
      const fssItem: DeductionResult = {
        id: 'fss', label: 'Fondo de Solidaridad', group: 'ss',
        amount: fss.amount, pct: fss.pct, base: 'ibc',
        color: '--color-tax', applies: true,
      }
      if (pensionIdx >= 0) ssItems.splice(pensionIdx + 1, 0, fssItem)
      else ssItems.push(fssItem)
    }
  }

  const provItems = enabled.filter(d => d.group === 'provision').map(toResult)
  // Savings ('ahorros') are no longer deductions — they're movimientos to
  // savings/investment accounts and do not reduce neto libre. Kept empty for
  // backward compatibility with callers that still read volItems.
  const volItems: DeductionResult[] = []

  const ssTotal    = ssItems.reduce((a, i) => a + i.amount, 0)
  const provTotal  = provItems.reduce((a, i) => a + i.amount, 0)
  const nonSsTotal = provTotal
  const total      = ssTotal + nonSsTotal + gast
  const netoLibre  = bruto - total

  return { ssItems, ssTotal, provItems, volItems, nonSsTotal, total, netoLibre }
}

export function calcFlujo(ssTot: number, gast: number, ret: number, prim: number, trm: number, totUSD: number): Flujo {
  const aBancol  = (ssTot + gast) / trm
  const aARQ     = (ret + prim) / trm
  const netoU    = totUSD - aBancol - aARQ
  const interest = aARQ * (DEFAULTS.arq_savings_rate / 12)
  return { aBancol, aARQ, netoU, interest }
}

export function buildAnnualData(
  db: Record<string, MonthData>,
  year: number,
  smmlvFn: (y: number) => number,
  deductions?: DeductionConfig[],
): AnnualRow[] {
  const rows: AnnualRow[] = []
  const now = new Date()
  // For the current year, cap at the current month so future months don't appear
  const maxMonth = year === now.getFullYear() ? now.getMonth() + 1 : 12

  for (let m = 1; m <= maxMonth; m++) {
    const k = `${year}-${String(m).padStart(2, '0')}`
    const d = db[k]
    const incomes = d?.incomes || []
    const egresos = d?.egresos || []
    const transfers = d?.transfers || []
    const hasActivity = incomes.length > 0 || egresos.length > 0 || transfers.length > 0
    if (!d || !hasActivity) {
      rows.push({ m, hasData: false })
      continue
    }

    const trm     = d.trm || DEFAULTS.trm
    const { totUSD, totCOP, bruto } = calcTotales(incomes, trm)
    const ibc     = calcIBC(incomes, trm, smmlvFn(year))
    const gast    = calcGastos(egresos, trm)

    let ssTot: number, ret: number, prim: number, provTotal: number, netoLibre: number

    if (deductions) {
      const provBase = calcProvisionBase(incomes, trm)
      const res = calcAllDeductions(bruto, ibc, m, deductions, gast, trm, d.voluntarias, provBase, smmlvFn(year))
      ssTot     = res.ssTotal
      ret       = res.provItems.find(i => i.id === 'retencion')?.amount ?? 0
      prim      = res.provItems.find(i => i.id === 'primas')?.amount ?? 0
      provTotal = res.provItems.filter(i => i.id !== 'retencion').reduce((a, i) => a + i.amount, 0)
               + res.volItems.reduce((a, i) => a + i.amount, 0)
      netoLibre = res.netoLibre
    } else {
      const ss = calcSS(ibc)
      ssTot = ss.total
      const dist = calcDistribucion(bruto, ssTot, gast)
      ret       = dist.ret
      prim      = dist.prim
      provTotal = prim
      netoLibre = dist.netoLibre
    }

    rows.push({ m, hasData: true, bruto, totUSD, totCOP, ssTot, gast, ret, prim, provTotal, netoLibre })
  }

  return rows
}

// ─── Account ledger ──────────────────────────────────────────────────────────

export type LedgerEntryType = 'income' | 'egreso' | 'transfer_in' | 'transfer_out'

export interface LedgerEntry {
  id: string
  date: string
  monthKey: string
  type: LedgerEntryType
  desc: string
  counterpartId?: string  // for transfers: the other account ID
  amount: number          // absolute amount in original currency
  currency: 'USD' | 'COP'
  convertedAmount: number // signed, in account's own currency (+ = credit, - = debit)
  balance: number         // running balance after this entry
  scheduled?: boolean     // true if date > today — pending, not yet settled
}

/**
 * Builds a chronological ledger for a single account across all months in db.
 * Entries are sorted oldest-first; running balance accumulates from startingBalance.
 */
export function buildLedger(
  accountId: string,
  account: Account,
  db: FinanceDB,
): LedgerEntry[] {
  const entries: LedgerEntry[] = []

  const keys = Object.keys(db).filter(k => k !== '_settings').sort()

  for (const key of keys) {
    const month = db[key] as MonthData
    if (!month) continue
    const trm = month.trm || DEFAULTS.trm

    const toAccountCcy = (amount: number, ccy: 'USD' | 'COP'): number => {
      if (ccy === account.currency) return amount
      return ccy === 'USD' ? amount * trm : amount / trm
    }

    // Incomes
    for (const inc of (month.incomes || []) as Income[]) {
      if (inc.account !== accountId) continue
      entries.push({
        id: `inc-${inc.id}`,
        date: inc.date || `${key}-01`,
        monthKey: key,
        type: 'income',
        desc: inc.desc,
        amount: inc.amount,
        currency: inc.currency,
        convertedAmount: toAccountCcy(inc.amount, inc.currency),
        balance: 0,
      })
    }

    // Egresos
    const today = localToday()
    for (const egr of (month.egresos || []) as Egreso[]) {
      if (egr.account !== accountId) continue
      const scheduled = !!egr.date && egr.date > today
      entries.push({
        id: `egr-${egr.id}`,
        date: egr.date || `${key}-01`,
        monthKey: key,
        type: 'egreso',
        desc: egr.desc,
        amount: egr.amount,
        currency: egr.currency,
        convertedAmount: -toAccountCcy(egr.amount, egr.currency),
        balance: 0,
        scheduled,
      })
    }

    // Transfers
    for (const t of month.transfers || []) {
      if (t.from === accountId) {
        entries.push({
          id: `trf-out-${t.id}`,
          date: t.date,
          monthKey: key,
          type: 'transfer_out',
          desc: 'Transferencia saliente',
          counterpartId: t.to,
          amount: t.amount,
          currency: t.fromCurrency,
          convertedAmount: -t.amount,
          balance: 0,
        })
      }
      if (t.to === accountId) {
        entries.push({
          id: `trf-in-${t.id}`,
          date: t.date,
          monthKey: key,
          type: 'transfer_in',
          desc: 'Transferencia entrante',
          counterpartId: t.from,
          amount: t.toAmount,
          currency: t.toCurrency,
          convertedAmount: t.toAmount,
          balance: 0,
        })
      }
    }
  }

  // Stable sort: date first, then entry type order within same date
  entries.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))

  // Compute running balance
  let running = account.startingBalance ?? 0
  for (const e of entries) {
    // Scheduled (future-dated) egresos are shown but not yet settled, so they
    // don't move the running balance.
    if (!e.scheduled) running += e.convertedAmount
    e.balance = running
  }

  return entries
}

/**
 * Derived credit-card figures from a card's rolling balance.
 * A credit card's balance is ≤ 0 (it accumulates charges as debits and payments
 * as credits), so debt = −balance. Available = limit − debt.
 */
export function creditCardStats(account: Account, balance: number): {
  limit: number; debt: number; available: number; utilization: number
} {
  const limit = account.creditLimit ?? 0
  const debt  = Math.max(-balance, 0)
  const available = Math.max(limit - debt, 0)
  const utilization = limit > 0 ? debt / limit : 0
  return { limit, debt, available, utilization }
}

/**
 * Computes the rolling balance for an account up to (and including) upToKey.
 * Starting from account.startingBalance, it accumulates:
 *   + incomes credited to this account
 *   - egresos debited from this account
 *   ± transfers (from = debit, to = credit)
 */
export function computeAccountBalance(
  accountId: string,
  account: Account,
  db: FinanceDB,
  upToKey: string,
): number {
  let balance = account.startingBalance ?? 0

  const keys = Object.keys(db)
    .filter(k => k !== '_settings' && k <= upToKey)
    .sort()

  for (const key of keys) {
    const month = db[key] as MonthData
    if (!month) continue
    const trm = month.trm || DEFAULTS.trm

    // Incomes credited to this account
    for (const inc of (month.incomes || []) as Income[]) {
      if (inc.account !== accountId) continue
      if (inc.currency === account.currency) {
        balance += inc.amount
      } else if (inc.currency === 'USD') {
        balance += inc.amount * trm       // USD income → COP account
      } else {
        balance += inc.amount / trm       // COP income → USD account
      }
    }

    // Egresos debited from this account (skip future-scheduled ones)
    const today = localToday()
    for (const egr of (month.egresos || []) as Egreso[]) {
      if (egr.account !== accountId) continue
      if (egr.date && egr.date > today) continue   // scheduled — not yet settled
      if (egr.currency === account.currency) {
        balance -= egr.amount
      } else if (egr.currency === 'USD') {
        balance -= egr.amount * trm       // USD egreso from COP account
      } else {
        balance -= egr.amount / trm       // COP egreso from USD account
      }
    }

    // Transfers
    for (const t of (month.transfers || [])) {
      if (t.from === accountId) balance -= t.amount
      if (t.to === accountId)   balance += t.toAmount
    }
  }

  return balance
}
