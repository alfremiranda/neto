/* ─── Obligations: accrual vs. cash ──────────────────────────
 * SS and retención are ACCRUED as formulas on a month's income, and PAID later —
 * SS one month in arrears (July's SS is paid in August), retención once a year out
 * of a reserve. Both facts matter and they differ: the accrual is the estimate you
 * reserve against, the payment is what actually left the account (PILA rounds, the
 * IBC gets adjusted). The bug was adding them together — a payment registered as a
 * plain Gasto landed in the month's total on top of that month's own accrual.
 *
 * `settles` marks a movement as discharging an obligation already counted, so it
 * debits the account but never counts as an expense — same reasoning that already
 * excludes `category === 'ahorro'` in settledEgresos.
 */
export type ObligationKind = 'ss' | 'retencion'

export interface Settles {
  kind: ObligationKind
  /** Period being settled: 'YYYY-MM' for SS (monthly, in arrears), 'YYYY' for
   *  retención (annual). Recording WHICH period a payment covers is what makes
   *  "mes vencido" a fact the app knows instead of one the user remembers. */
  period: string
}

export interface Income {
  id: number
  desc: string
  amount: number
  currency: 'USD' | 'COP'
  account: string
  tipo: 'servicios' | 'otro'
  date?: string
  applyProvisions?: boolean  // default true — include in provision base for primas/cesantías/vacaciones
  updatedAt?: number  // ms of last local edit — per-entry LWW for cross-device merge
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
  settles?: Settles  // discharges an already-accrued obligation → debits the account, never counts as a Gasto
  updatedAt?: number  // ms of last local edit — per-entry LWW for cross-device merge
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
  // Setting money aside toward a future obligation is NOT settling it — the DIAN
  // hasn't been paid — so it gets its own field. Marking the transfer (rather than
  // reading the destination account's balance) is what keeps the reserve figure
  // honest when personal savings share that account.
  reserves?: Settles
  updatedAt?: number  // ms of last local edit — per-entry LWW for cross-device merge
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
  favorite?: boolean        // pinned to the dashboard as a compact card
  // ── Credit-card only ──
  creditLimit?: number      // cupo total (in the account's currency)
  cutoffDay?: number        // día de corte (1–31)
  dueDay?: number           // día límite de pago (1–31)
  // ── Savings/investment only (type === 'savings') ──
  savingsKind?: 'cuenta' | 'cdt' | 'inversion'  // vehicle kind; default 'cuenta'
  maturityDate?: string     // CDT: fecha de vencimiento (YYYY-MM-DD)
  // ── Identity colour ──
  // Optional on purpose: absent means derived from the id, present means the user
  // chose it. Writing it on first open would erase that distinction and make every
  // account look deliberately coloured. See src/lib/accountColor.ts.
  color?: import('@/lib/accountColor').AccountColor
  updatedAt?: number  // ms of last local edit — per-entry LWW for cross-device settings merge
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
  updatedAt?: number  // ms of last local edit — per-entry LWW for cross-device merge
}

export interface MonthData {
  trm: number
  incomes: Income[]
  transfers: Transfer[]
  egresos: Egreso[]
  voluntarias?: VoluntariaItem[]
  egresosSeeded?: boolean
  // Tombstones for deleted entries: "<type>:<id>" → deletion time (ms). Lets a
  // delete on one device win over a stale copy on another (propagates deletes).
  deleted?: Record<string, number>
}

export interface Settings {
  // ── per-entry merge groups (id string, + updatedAt, tombstones in `deleted`) ──
  accounts?:   Account[]
  deductions?: DeductionConfig[]
  // ── scalars (per-field LWW via `fieldUpdatedAt`) ──
  onboardingDone?:    boolean         // monotonic OR — once true never regresses (a future
                                      // "redo onboarding" must be a LOCAL, non-synced action)
  displayName?:       string
  primaryCurrency?:   'COP' | 'USD'
  secondaryCurrency?: 'COP' | 'USD' | null   // null = "no secondary" (distinct from absent)
  // ── privacy consent (Ley 1581) ──
  // { version, acceptedAt } — NOT a boolean: the version records WHICH policy the
  // user accepted, so a policy change can re-prompt. Merged MONOTONICALLY by
  // version (higher wins; equal → earlier acceptedAt), so a stale device can never
  // roll a consent back. Same spirit as onboardingDone, comparing versions.
  privacyConsent?:     { version: number; acceptedAt: number }
  // ── merge metadata ──
  fieldUpdatedAt?:     Record<string, number>  // ms per scalar field (per-field LWW)
  deleted?:            Record<string, number>  // tombstones "account:<id>" / "deduction:<id>"
  dbMigrationVersion?: number                  // monotonic — merged by max
}

export type FinanceDB = { _settings?: Settings } & Record<string, MonthData>

// 'cuenta' is the detail of ONE account, a screen of its own rather than a panel under
// the index. Which account it shows lives in uiStore.detailAccountId — there is no router
// here, and a view plus an id is the whole of what a route would have carried.
// No 'ahorros': savings and CDTs are accounts like any other and live on the accounts
// page. A separate page for one account type made the type the organising idea, when the
// account is.
export type ViewType = 'mes' | 'dashboard' | 'cuentas' | 'cuenta' | 'config' | 'profile'

export type SheetId = 'income' | 'egreso' | 'transfer' | 'account-edit' | 'notifications' | null

export interface TRMCache {
  trm: number
  source: string
  ts: number
}

export interface Totales {
  totUSD: number
  totCOP: number
  bruto: number
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
  destAccount?: string      // provisions: account where the reserve is set aside (e.g. retención → ARQ Savings)
  updatedAt?: number  // ms of last local edit — per-entry LWW for cross-device settings merge
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
