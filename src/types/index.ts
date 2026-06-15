export interface Income {
  id: number
  desc: string
  amount: number
  currency: 'USD' | 'COP'
  account: string
  tipo: 'servicios' | 'otro'
}

export interface Egreso {
  id: number
  tipo: string
  amount: number
  currency: 'USD' | 'COP'
  date: string
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
}

export interface MonthData {
  trm: number
  incomes: Income[]
  transfers: Transfer[]
  egresos: Egreso[]
  egresosSeeded?: boolean
  balances?: Record<string, number>
}

export interface Settings {
  smmlv?: Record<string, number>
  accounts?: Account[]
}

export type FinanceDB = { _settings?: Settings } & Record<string, MonthData>

export type ViewType = 'mes' | 'ano'

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
