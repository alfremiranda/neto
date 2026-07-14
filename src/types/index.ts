export interface Income {
  id: number
  desc: string
  amount: number
  currency: 'USD' | 'COP'
  account: string
  tipo: 'servicios' | 'otro'
  date?: string
  applyProvisions?: boolean  // default true — include in provision base for primas/cesantías/vacaciones
}

export interface Egreso {
  id: number
  desc: string
  category: string
  amount: number
  currency: 'USD' | 'COP'
  date: string
  recurring?: boolean
  confirmed?: boolean  // false = seeded from prev month, needs amount verification
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
  type?: 'account' | 'cash' | 'credit' | 'savings'  // default 'account'; cash hides number/rate; credit is a liability; savings holds ahorros/inversiones
  number: string
  rate: number
  startingBalance?: number  // one-time base; balance rolls forward from here.
                            // For credit cards this is ≤ 0 and represents −debt (so balance stays negative = amount owed).
  locked?: boolean          // system accounts — cannot be deleted
  // ── Credit-card only ──
  creditLimit?: number      // cupo total (in the account's currency)
  cutoffDay?: number        // día de corte (1–31)
  dueDay?: number           // día límite de pago (1–31)
  // ── Savings/investment only (type === 'savings') ──
  savingsKind?: 'cuenta' | 'cdt' | 'inversion'  // vehicle kind; default 'cuenta'
  maturityDate?: string     // CDT: fecha de vencimiento (YYYY-MM-DD)
}

export interface VoluntariaItem {
  id: number
  label: string
  amount: number
  currency: 'USD' | 'COP'
  account?: string
  date?: string
  recurring?: boolean
  egresoId?: number
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
  accounts?: Account[]
  ssAccount?: string       // account ID that pays SS each month
  onboardingDone?: boolean // set to true after first-run wizard is completed
}

export type FinanceDB = { _settings?: Settings } & Record<string, MonthData>

export type ViewType = 'mes' | 'dashboard' | 'cuentas' | 'ahorros' | 'config' | 'profile'

export type SheetId = 'income' | 'egreso' | 'transfer' | 'account-edit' | 'balance' | 'account-detail' | null

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
  provTotal?: number
  netoLibre?: number
}

/* ─── Deductions system ─────────────────────────────────── */

export type DeductionBase  = 'ibc' | 'bruto' | 'neto_ibc' | 'fixed_cop' | 'fixed_usd' | 'base_usd'
export type DeductionGroup = 'ss' | 'provision' | 'voluntary'

export interface DeductionConfig {
  id:       string
  label:    string
  group:    DeductionGroup
  base:     DeductionBase
  pct:      number          // percentage 0–100
  amount?:  number          // for fixed_cop / fixed_usd / base_usd (the USD base income)
  months:   number[]        // 1–12; empty = every month
  enabled:  boolean
  color:    string          // CSS var token e.g. '--color-income'
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
