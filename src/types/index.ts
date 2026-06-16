export interface Income {
  id: number
  desc: string
  amount: number
  currency: 'USD' | 'COP'
  account: string
  tipo: 'servicios' | 'otro'
  date?: string
}

export interface Egreso {
  id: number
  desc: string
  category: string
  amount: number
  currency: 'USD' | 'COP'
  date: string
  recurring?: boolean
  account?: string  // account ID this egreso debits (optional)
}

export interface Transfer {
  id: number
  date: string
  from: string
  to: string
  amount: number
  fromCurrency: 'USD' | 'COP'
  toCurrency: 'USD' | 'COP'
  trm: number | null
  toAmount: number
}

export interface Account {
  id: string
  label: string
  currency: 'USD' | 'COP'
  number: string
  rate: number
  startingBalance?: number  // one-time base; balance rolls forward from here
}

export interface VoluntariaItem {
  id: number
  label: string
  amount: number
  currency: 'USD' | 'COP'
}

export interface MonthData {
  trm: number
  incomes: Income[]
  transfers: Transfer[]
  egresos: Egreso[]
  voluntarias?: VoluntariaItem[]
  egresosSeeded?: boolean
  balances?: Record<string, number>
}

export interface Settings {
  smmlv?: Record<string, number>
  accounts?: Account[]
  ssAccount?: string  // account ID that pays SS each month
}

export type FinanceDB = { _settings?: Settings } & Record<string, MonthData>

export type ViewType = 'mes' | 'ano' | 'cuentas' | 'config'

export type SheetId = 'income' | 'egreso' | 'transfer' | 'account-edit' | 'balance' | null

export interface TRMCache {
  trm: number
  source: string
  ts: number
}

export interface SSResult {
  salud: number
  pens: number
  arl: number
  total: number
}

export interface Totales {
  totUSD: number
  totCOP: number
  bruto: number
}

export interface Distribucion {
  ret: number
  prim: number
  netoLibre: number
}

export interface Flujo {
  aBancol: number
  aARQ: number
  netoU: number
  interest: number
}

export interface AnnualRow {
  m: number
  hasData: boolean
  bruto?: number
  totUSD?: number
  totCOP?: number
  ssTot?: number
  gast?: number
  ret?: number
  prim?: number
  netoLibre?: number
}

/* ─── Deductions system ─────────────────────────────────── */

export type DeductionBase  = 'ibc' | 'bruto' | 'fixed_cop' | 'fixed_usd'
export type DeductionGroup = 'ss' | 'provision' | 'voluntary'

export interface DeductionConfig {
  id:       string
  label:    string
  group:    DeductionGroup
  base:     DeductionBase
  pct:      number          // percentage 0–100
  amount?:  number          // for fixed_cop / fixed_usd
  months:   number[]        // 1–12; empty = every month
  enabled:  boolean
  color:    string          // CSS var token e.g. '--n-blue'
  locked?:  boolean         // system default — can't delete
}

export interface DeductionResult {
  id:      string
  label:   string
  group:   DeductionGroup
  amount:  number
  pct:     number
  base:    DeductionBase
  color:   string
  applies: boolean               // false if frequency excludes this month
}

export interface AllDeductionsResult {
  ssItems:    DeductionResult[]
  ssTotal:    number
  provItems:  DeductionResult[]
  volItems:   DeductionResult[]
  nonSsTotal: number
  total:      number             // ssTotal + nonSsTotal + gast
  netoLibre:  number
}
