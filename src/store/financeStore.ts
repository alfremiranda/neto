import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULTS, TRANSFER_ACCOUNTS, GASTOS_KEYS, EGRESO_TIPOS, EGRESO_CATEGORIAS } from '@/data/defaults'
import { sbPush, sbPullAll, sbDeleteAll } from '@/lib/supabase'
import type { FinanceDB, MonthData, Account, Settings, Income, Egreso, Transfer, VoluntariaItem } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────

// In prod, push the month to Supabase after every local mutation so changes
// made on one device are available on others without a manual sync.
function autoPush(key: string, data: unknown) {
  if (!import.meta.env.DEV) {
    sbPush(key, data).catch(() => {})
  }
}

export function monthKey(m: number, y: number): string {
  return `${y}-${String(m).padStart(2, '0')}`
}

// Derive month key from an ISO date string (e.g. "2026-06-08" → "2026-06")
function keyForDate(date: string, fallback: string): string {
  // Parse YYYY-MM directly — new Date('YYYY-MM-DD') is UTC midnight which shifts to
  // the previous month in UTC-5 (Colombia), causing transfers to land in the wrong month.
  const parts = date.split('-')
  const y = parseInt(parts[0]), m = parseInt(parts[1])
  if (!y || !m || isNaN(y) || isNaN(m)) return fallback
  return monthKey(m, y)
}

// Apply all pending migrations. Safe to run on any db object (local or cloud).
// Returns a new db and a `changed` flag so callers know whether to push the result.
// Bump CURRENT_DB_VERSION when adding a new migration step.
const CURRENT_DB_VERSION = 3

function applyDateMigration(db: Record<string, unknown>): { db: Record<string, unknown>; changed: boolean } {
  const settings = (db['_settings'] ?? {}) as Settings & { dbMigrationVersion?: number }
  const version = settings.dbMigrationVersion ?? 0
  if (version >= CURRENT_DB_VERSION) return { db, changed: false }

  let current = { ...db }

  // ── v1: move records to the month key matching their date field ─────────────
  if (version < 1) {
    const newDb: Record<string, MonthData> = {}
    for (const key of Object.keys(current)) {
      if (key === '_settings') continue
      const m = current[key] as MonthData
      newDb[key] = { ...m, incomes: [], transfers: [], egresos: [] }
    }
    for (const key of Object.keys(current)) {
      if (key === '_settings') continue
      const m = current[key] as MonthData
      for (const income of (m.incomes ?? [])) {
        const dest = income.date ? keyForDate(income.date, key) : key
        newDb[dest] ??= { trm: (current[dest] as MonthData | undefined)?.trm ?? m.trm, incomes: [], transfers: [], egresos: [] }
        newDb[dest].incomes.push(income)
      }
      for (const egreso of (m.egresos ?? [])) {
        const dest = egreso.date ? keyForDate(egreso.date, key) : key
        newDb[dest] ??= { trm: (current[dest] as MonthData | undefined)?.trm ?? m.trm, incomes: [], transfers: [], egresos: [] }
        newDb[dest].egresos.push(egreso)
      }
      for (const transfer of (m.transfers ?? [])) {
        const dest = transfer.date ? keyForDate(transfer.date, key) : key
        newDb[dest] ??= { trm: (current[dest] as MonthData | undefined)?.trm ?? m.trm, incomes: [], transfers: [], egresos: [] }
        newDb[dest].transfers.push(transfer)
      }
    }
    current = { ...current, ...newDb }
  }

  // ── v2: move orphaned voluntarias to the next calendar month ────────────────
  // Voluntarias have no date field, so v1 left them in place. If a month ends
  // up with only voluntarias (no incomes/egresos/transfers) it's an orphan from
  // the old curKey display bug — move them forward one month.
  if (version < 2) {
    for (const key of Object.keys(current).filter(k => k !== '_settings').sort()) {
      const m = current[key] as MonthData
      if (
        m.incomes.length === 0 &&
        m.egresos.length === 0 &&
        m.transfers.length === 0 &&
        (m.voluntarias?.length ?? 0) > 0
      ) {
        const [ky, km] = key.split('-').map(Number)
        const nextKey = km === 12 ? monthKey(1, ky + 1) : monthKey(km + 1, ky)
        const next = (current[nextKey] as MonthData | undefined) ?? { trm: m.trm, incomes: [], transfers: [], egresos: [] }
        current[nextKey] = {
          ...next,
          voluntarias: [...(next.voluntarias ?? []), ...(m.voluntarias ?? [])],
        }
        current[key] = { ...m, voluntarias: [] }
      }
    }
  }

  // ── v3: re-run date-based relocation to fix timezone bug in keyForDate ────────
  // keyForDate used new Date('YYYY-MM-DD') which parses as UTC midnight, shifting
  // dates to the previous month in UTC-5 (Colombia). Items added after v1 ran were
  // stored in the wrong month. Re-running the same relocation (now with the fixed
  // keyForDate) moves them to the correct month.
  if (version < 3) {
    const newDb: Record<string, MonthData> = {}
    for (const key of Object.keys(current)) {
      if (key === '_settings') continue
      const m = current[key] as MonthData
      newDb[key] = { ...m, incomes: [], transfers: [], egresos: [] }
    }
    for (const key of Object.keys(current)) {
      if (key === '_settings') continue
      const m = current[key] as MonthData
      for (const income of (m.incomes ?? [])) {
        const dest = income.date ? keyForDate(income.date, key) : key
        newDb[dest] ??= { trm: (current[dest] as MonthData | undefined)?.trm ?? m.trm, incomes: [], transfers: [], egresos: [] }
        newDb[dest].incomes.push(income)
      }
      for (const egreso of (m.egresos ?? [])) {
        const dest = egreso.date ? keyForDate(egreso.date, key) : key
        newDb[dest] ??= { trm: (current[dest] as MonthData | undefined)?.trm ?? m.trm, incomes: [], transfers: [], egresos: [] }
        newDb[dest].egresos.push(egreso)
      }
      for (const transfer of (m.transfers ?? [])) {
        const dest = transfer.date ? keyForDate(transfer.date, key) : key
        newDb[dest] ??= { trm: (current[dest] as MonthData | undefined)?.trm ?? m.trm, incomes: [], transfers: [], egresos: [] }
        newDb[dest].transfers.push(transfer)
      }
    }
    current = { ...current, ...newDb }
  }

  current['_settings'] = { ...(current['_settings'] ?? {}), dbMigrationVersion: CURRENT_DB_VERSION } as unknown as MonthData
  return { db: current, changed: true }
}

function emptyMonth(trm = DEFAULTS.trm): MonthData {
  return { trm, incomes: [], transfers: [], egresos: [] }
}

// Initialize a month on first write: inherit TRM + seed recurring egresos from the previous month.
function initMonth(key: string, db: FinanceDB): MonthData {
  const [y, m] = key.split('-').map(Number)
  const prevKey = m > 1 ? monthKey(m - 1, y) : monthKey(12, y - 1)
  const prev = db[prevKey] as MonthData | undefined
  return {
    trm: prev?.trm ?? DEFAULTS.trm,
    incomes: [],
    transfers: [],
    egresos: prev ? shiftRecurring(prev.egresos || [], key) : [],
  }
}

// Copy recurring egresos into a new month key, adjusting the date's month/year.
function shiftRecurring(egresos: Egreso[], newKey: string): Egreso[] {
  const [y, m0] = newKey.split('-').map(Number) // m0 is 0-indexed
  const isoM = m0 + 1                           // convert to 1-indexed for ISO dates
  const base  = Date.now()
  return egresos
    .filter(e => e.recurring)
    .map((e, i) => {
      let date = ''
      if (e.date) {
        const day     = parseInt(e.date.split('-')[2] ?? '1', 10)
        const lastDay = new Date(y, isoM, 0).getDate()
        const d       = Math.min(day, lastDay)
        date = `${y}-${String(isoM).padStart(2, '0')}-${String(d).padStart(2, '0')}`
      }
      return { ...e, id: base + i, date, confirmed: false }
    })
}


// ─── store interface ─────────────────────────────────────────────────────────

interface FinanceState {
  db: FinanceDB
  curKey: string

  // selectors
  getMonth: (key: string) => MonthData
  getCurrentMonth: () => MonthData
  getSMMLV: (year: number) => number
  seedCurrentMonth: () => void
  getAccounts: () => Account[]
  isOnboardingDone: () => boolean

  // mutations
  setCurKey: (key: string) => void
  updateMonth: (key: string, data: Partial<MonthData>) => void
  setMonthFull: (key: string, data: MonthData) => void
  addIncome: (income: Omit<Income, 'id'>) => void
  updateIncome: (id: number, patch: Partial<Omit<Income, 'id'>>) => void
  removeIncome: (id: number) => void
  addEgreso: (egreso: Omit<Egreso, 'id'>) => void
  updateEgreso: (id: number, egreso: Partial<Egreso>) => void
  removeEgreso: (id: number) => void
  confirmEgreso: (id: number) => void
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void
  updateTransfer: (id: number, transfer: Omit<Transfer, 'id'>) => void
  removeTransfer: (id: number) => void
  addVoluntaria: (item: Omit<VoluntariaItem, 'id'>) => void
  updateVoluntaria: (item: VoluntariaItem) => void
  removeVoluntaria: (id: number) => void
  reorderEgresos: (orderedIds: number[]) => void
  setStartingBalance: (accountId: string, amount: number) => void
  setSsAccount: (accountId: string | null) => void
  setTRM: (trm: number) => void
  saveSMMLV: (year: string, value: number) => void
  saveAccountsConfig: (accounts: Account[]) => void
  completeOnboarding: () => void

  // navigation
  prevMonth: () => void
  nextMonth: () => void
  deleteMonth: (key: string) => void
  clearNonJuneEgresos: () => number
  restoreJuneEgresos: () => void
  nuclearResetCurrentMonth: () => void
  deduplicateAllMonths: () => number
  hardResetAllData: () => Promise<void>
  wipeCloudAndPush: () => Promise<void>

  // sync
  syncFromCloud: () => Promise<void>
  pushCurrent: () => void
  forcePushAll: () => Promise<{ pushed: number; errors: number }>

  // migration (runs on load)
  migrate: () => void
}

// ─── store ───────────────────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      db: {},
      curKey: (() => {
        const now = new Date()
        return monthKey(now.getMonth() + 1, now.getFullYear())
      })(),

      // ── selectors ──────────────────────────────────────────────────────────

      getMonth: (key) => {
        const d = get().db[key]
        return d ?? emptyMonth()
      },

      getCurrentMonth: () => get().getMonth(get().curKey),

      // Seed the current month from the previous one if it hasn't been written yet.
      // Call once on mount so recurring egresos appear without needing a first write.
      seedCurrentMonth: () => {
        const { curKey, db } = get()
        if (!db[curKey]) {
          const seeded = initMonth(curKey, db)
          set(s => ({ db: { ...s.db, [curKey]: seeded } }))
        }
      },

      getSMMLV: (year) => {
        const s = get().db._settings as Settings | undefined
        return s?.smmlv?.[String(year)] ?? DEFAULTS.smmlv
      },

      isOnboardingDone: () => {
        const s = get().db._settings as Settings | undefined
        // Existing users who have accounts already configured bypass the wizard.
        return s?.onboardingDone === true || (s?.accounts != null && s.accounts.length > 0)
      },

      getAccounts: () => {
        const s = get().db._settings as Settings | undefined
        // New users start with only Efectivo; onboarding lets them add more.
        const base: Account[] = s?.accounts && s.accounts.length > 0
          ? s.accounts
          : TRANSFER_ACCOUNTS.filter(a => a.locked)
        const lockedDefaults = TRANSFER_ACCOUNTS.filter(a => a.locked)
        const storedIds = new Set(base.map(a => a.id))
        const missing = lockedDefaults.filter(a => !storedIds.has(a.id))
        // Backfill type/locked on existing accounts that predate those fields
        const patched = base.map(a => {
          const def = lockedDefaults.find(d => d.id === a.id)
          if (!def) return a
          return { ...a, type: a.type ?? def.type, locked: true }
        })
        return missing.length ? [...patched, ...missing] : patched
      },

      // ── mutations ──────────────────────────────────────────────────────────

      setCurKey: (key) => set({ curKey: key }),

      updateMonth: (key, data) =>
        set(state => {
          const existing = state.db[key] ?? emptyMonth()
          return { db: { ...state.db, [key]: { ...existing, ...data } } }
        }),

      setMonthFull: (key, data) =>
        set(state => ({ db: { ...state.db, [key]: data } })),

      addIncome: (income) => {
        const { curKey, db } = get()
        const key = income.date ? keyForDate(income.date, curKey) : curKey
        const d = db[key] ?? initMonth(key, db)
        const updated: MonthData = {
          ...d,
          incomes: [...d.incomes, { ...income, id: Date.now() }],
        }
        set(state => ({ db: { ...state.db, [key]: updated } }))
        autoPush(key, updated)
      },

      updateIncome: (id, patch) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          incomes: d.incomes.map(i => i.id === id ? { ...i, ...patch } : i),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      removeIncome: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = { ...d, incomes: d.incomes.filter(i => i.id !== id) }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      addEgreso: (egreso) => {
        const { curKey, db } = get()
        const key = egreso.date ? keyForDate(egreso.date, curKey) : curKey
        const d = db[key] ?? initMonth(key, db)
        const updated: MonthData = {
          ...d,
          egresos: [...(d.egresos || []), { ...egreso, id: Date.now(), confirmed: true }],
        }
        set(state => ({ db: { ...state.db, [key]: updated } }))
        autoPush(key, updated)
      },

      updateEgreso: (id, patch) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          egresos: (d.egresos || []).map(e => e.id === id ? { ...e, ...patch, confirmed: true } : e),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      confirmEgreso: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          egresos: (d.egresos || []).map(e => e.id === id ? { ...e, confirmed: true } : e),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      removeEgreso: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = { ...d, egresos: (d.egresos || []).filter(e => e.id !== id) }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      addTransfer: (transfer) => {
        const { curKey, db } = get()
        const key = transfer.date ? keyForDate(transfer.date, curKey) : curKey
        const d = db[key] ?? initMonth(key, db)
        const newTransfer: Transfer = { ...transfer, id: Date.now() }
        const updated: MonthData = {
          ...d,
          transfers: [...(d.transfers || []), newTransfer],
          trm: transfer.trm ?? d.trm,
        }
        set(state => ({ db: { ...state.db, [key]: updated } }))
        autoPush(key, updated)
      },

      updateTransfer: (id, transfer) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          transfers: (d.transfers || []).map(t => t.id === id ? { ...transfer, id } : t),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      removeTransfer: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          transfers: (d.transfers || []).filter(t => t.id !== id),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      addVoluntaria: (item) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? initMonth(curKey, db)
        const updated: MonthData = {
          ...d,
          voluntarias: [...(d.voluntarias ?? []), { ...item, id: Date.now() }],
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      updateVoluntaria: (item) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          voluntarias: (d.voluntarias ?? []).map(v => v.id === item.id ? item : v),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      removeVoluntaria: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          voluntarias: (d.voluntarias ?? []).filter(v => v.id !== id),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      reorderEgresos: (orderedIds) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const byId = new Map((d.egresos ?? []).map(e => [e.id, e]))
        const updated: MonthData = {
          ...d,
          egresos: orderedIds.map(id => byId.get(id)!).filter(Boolean),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      setStartingBalance: (accountId, amount) => {
        const accounts = get().getAccounts().map(a =>
          a.id === accountId ? { ...a, startingBalance: amount } : a
        )
        get().saveAccountsConfig(accounts)
      },

      setSsAccount: (accountId) => {
        set(state => {
          const settings = (state.db._settings ?? {}) as Settings
          return {
            db: {
              ...state.db,
              _settings: { ...settings, ssAccount: accountId ?? undefined },
            } as FinanceDB,
          }
        })
        sbPush('_settings', get().db._settings).catch(() => {})
      },

      setTRM: (trm) => {
        const { curKey, db } = get()
        const existing = db[curKey] ?? initMonth(curKey, db)
        const updated = { ...existing, trm }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      saveSMMLV: (year, value) => {
        set(state => {
          const settings = (state.db._settings ?? {}) as Settings
          return {
            db: {
              ...state.db,
              _settings: {
                ...settings,
                smmlv: { ...(settings.smmlv ?? {}), [year]: value },
              },
            } as FinanceDB,
          }
        })
        sbPush('_settings', get().db._settings).catch(() => {})
      },

      saveAccountsConfig: (accounts) => {
        set(state => {
          const settings = (state.db._settings ?? {}) as Settings
          return {
            db: {
              ...state.db,
              _settings: { ...settings, accounts },
            } as FinanceDB,
          }
        })
        sbPush('_settings', get().db._settings).catch(() => {})
      },

      completeOnboarding: () => {
        set(state => {
          const settings = (state.db._settings ?? {}) as Settings
          return {
            db: {
              ...state.db,
              _settings: { ...settings, onboardingDone: true },
            } as FinanceDB,
          }
        })
        sbPush('_settings', get().db._settings).catch(() => {})
      },

      // ── navigation ─────────────────────────────────────────────────────────

      prevMonth: () => {
        const { curKey } = get()
        const [y, m] = curKey.split('-').map(Number)
        if (m === 1) return
        set({ curKey: monthKey(m - 1, y) })
      },

      nextMonth: () => {
        const { curKey, db } = get()
        const [y, m] = curKey.split('-').map(Number)
        if (m === 12) return
        const newKey = monthKey(m + 1, y)
        if (!db[newKey]) {
          const seeded = initMonth(newKey, db)
          set({ curKey: newKey, db: { ...db, [newKey]: seeded } })
        } else {
          set({ curKey: newKey })
        }
      },

      deleteMonth: (key) => {
        const { db, curKey } = get()
        if (key === '_settings') return
        const newDb = { ...db }
        delete newDb[key]
        // If deleting the current month, move to adjacent
        let newCurKey = curKey
        if (key === curKey) {
          const [y, mo] = key.split('-').map(Number)
          newCurKey = mo > 0 ? `${y}-${String(mo - 1).padStart(2, '0')}` : key
        }
        set({ db: newDb, curKey: newCurKey })
        sbPush(key, null).catch(() => {})
      },

      restoreJuneEgresos: () => {
        const { db } = get()
        const now = new Date()
        const todayKey = monthKey(now.getMonth() + 1, now.getFullYear())
        const base = Date.now()
        const egresos: Egreso[] = [
          { id: base+1,  desc: 'Poliza de Salud SURA',          amount: 1550000, currency: 'COP', date: '2026-06-30', category: 'salud',           account: 'Bancolombia',   recurring: true,  confirmed: false },
          { id: base+2,  desc: 'Cuota Prestamo Vehicular BBVA', amount: 2880000, currency: 'COP', date: '2026-06-28', category: 'bancario',         account: 'Bancolombia',   recurring: true,  confirmed: false },
          { id: base+3,  desc: 'Claude Max',                    amount: 100,     currency: 'USD', date: '2026-06-17', category: 'entretenimiento',  account: 'ARQ Prepaid',   recurring: true,  confirmed: true  },
          { id: base+4,  desc: 'Pago Herme',                    amount: 130000,  currency: 'COP', date: '2026-06-17', category: 'vivienda',         account: 'Efectivo',      recurring: false, confirmed: true  },
          { id: base+5,  desc: 'Pago Delcy',                    amount: 70000,   currency: 'COP', date: '2026-06-17', category: 'vivienda',         account: 'Efectivo',      recurring: false, confirmed: true  },
          { id: base+6,  desc: 'Servicio Público - Triple A',   amount: 380643,  currency: 'COP', date: '2026-06-16', category: 'vivienda',         account: 'Bancolombia',   recurring: true,  confirmed: true  },
          { id: base+7,  desc: 'Movistar Celular',              amount: 44990,   currency: 'COP', date: '2026-06-16', category: 'entretenimiento',  account: 'Bancolombia',   recurring: false, confirmed: true  },
          { id: base+8,  desc: 'Copago Cita Pediatrica Felipe', amount: 50900,   currency: 'COP', date: '2026-06-16', category: 'vivienda',         account: 'Bancolombia',   recurring: false, confirmed: true  },
          { id: base+9,  desc: 'Arriendo Intermobiliaria Junio',amount: 1750000, currency: 'COP', date: '2026-06-15', category: 'vivienda',         account: 'Bancolombia',   recurring: true,  confirmed: true  },
          { id: base+10, desc: 'Apoyo Mamá',                    amount: 700000,  currency: 'COP', date: '2026-06-15', category: 'familia',          account: 'Bancolombia',   recurring: true,  confirmed: true  },
          { id: base+11, desc: 'Compra Amazon',                 amount: 198.84,  currency: 'USD', date: '2026-06-13', category: 'otro',             account: 'ARQ Prepaid',   recurring: false, confirmed: true  },
          { id: base+12, desc: 'Claro Hogar',                   amount: 130000,  currency: 'COP', date: '2026-06-10', category: 'entretenimiento',  account: 'Bancolombia',   recurring: false, confirmed: true  },
          { id: base+13, desc: 'Tarjeta de Crédito Davibank',   amount: 650000,  currency: 'COP', date: '2026-06-09', category: 'bancario',         account: 'Bancolombia',   recurring: true,  confirmed: true  },
          { id: base+14, desc: 'Prestamo LuloBank',             amount: 805000,  currency: 'COP', date: '2026-06-06', category: 'bancario',         account: 'Bancolombia',   recurring: true,  confirmed: true  },
        ]
        const month = (db[todayKey] ?? {}) as MonthData
        const newDb: FinanceDB = { ...db, [todayKey]: { ...month, egresos } }
        set({ db: newDb })
      },

      nuclearResetCurrentMonth: () => {
        const { db } = get()
        const now = new Date()
        const todayKey = monthKey(now.getMonth() + 1, now.getFullYear())
        const existing = (db[todayKey] ?? {}) as MonthData
        const base = Date.now()
        const egresos: Egreso[] = [
          { id: base+1,  desc: 'Poliza de Salud SURA',          amount: 1550000, currency: 'COP', date: '2026-06-30', category: 'salud',          account: 'Bancolombia',  recurring: true,  confirmed: false },
          { id: base+2,  desc: 'Cuota Prestamo Vehicular BBVA', amount: 2880000, currency: 'COP', date: '2026-06-28', category: 'bancario',        account: 'Bancolombia',  recurring: true,  confirmed: false },
          { id: base+3,  desc: 'Claude Max',                    amount: 100,     currency: 'USD', date: '2026-06-17', category: 'entretenimiento', account: 'ARQ Prepaid',  recurring: true,  confirmed: true  },
          { id: base+4,  desc: 'Pago Herme',                    amount: 130000,  currency: 'COP', date: '2026-06-17', category: 'vivienda',        account: 'Efectivo',     recurring: false, confirmed: true  },
          { id: base+5,  desc: 'Pago Delcy',                    amount: 70000,   currency: 'COP', date: '2026-06-17', category: 'vivienda',        account: 'Efectivo',     recurring: false, confirmed: true  },
          { id: base+6,  desc: 'Servicio Público - Triple A',   amount: 380643,  currency: 'COP', date: '2026-06-16', category: 'vivienda',        account: 'Bancolombia',  recurring: true,  confirmed: true  },
          { id: base+7,  desc: 'Movistar Celular',              amount: 44990,   currency: 'COP', date: '2026-06-16', category: 'entretenimiento', account: 'Bancolombia',  recurring: false, confirmed: true  },
          { id: base+8,  desc: 'Copago Cita Pediatrica Felipe', amount: 50900,   currency: 'COP', date: '2026-06-16', category: 'vivienda',        account: 'Bancolombia',  recurring: false, confirmed: true  },
          { id: base+9,  desc: 'Arriendo Intermobiliaria Junio',amount: 1750000, currency: 'COP', date: '2026-06-15', category: 'vivienda',        account: 'Bancolombia',  recurring: true,  confirmed: true  },
          { id: base+10, desc: 'Apoyo Mamá',                    amount: 700000,  currency: 'COP', date: '2026-06-15', category: 'familia',         account: 'Bancolombia',  recurring: true,  confirmed: true  },
          { id: base+11, desc: 'Compra Amazon',                 amount: 198.84,  currency: 'USD', date: '2026-06-13', category: 'otro',            account: 'ARQ Prepaid',  recurring: false, confirmed: true  },
          { id: base+12, desc: 'Claro Hogar',                   amount: 130000,  currency: 'COP', date: '2026-06-10', category: 'entretenimiento', account: 'Bancolombia',  recurring: false, confirmed: true  },
          { id: base+13, desc: 'Tarjeta de Crédito Davibank',   amount: 650000,  currency: 'COP', date: '2026-06-09', category: 'bancario',        account: 'Bancolombia',  recurring: true,  confirmed: true  },
          { id: base+14, desc: 'Prestamo LuloBank',             amount: 805000,  currency: 'COP', date: '2026-06-06', category: 'bancario',        account: 'Bancolombia',  recurring: true,  confirmed: true  },
        ]
        const newDb: FinanceDB = {
          ...db,
          [todayKey]: {
            trm: existing.trm,
            incomes: [],
            egresos,
            transfers: [],
            voluntarias: existing.voluntarias ?? [],
          } as MonthData,
        }
        set({ db: newDb })
      },

      deduplicateAllMonths: () => {
        const { db } = get()
        const newDb = { ...db }
        let removed = 0
        for (const key of Object.keys(newDb)) {
          if (key === '_settings') continue
          const month = newDb[key] as MonthData
          const seen = <T extends object>(arr: T[], sig: (x: T) => string): T[] => {
            const s = new Set<string>()
            return arr.filter(x => { const k = sig(x); if (s.has(k)) { removed++; return false } s.add(k); return true })
          }
          newDb[key] = {
            ...month,
            incomes:   seen(month.incomes   || [], i => `${(i as Income).amount}|${(i as Income).currency}|${(i as Income).account}|${(i as Income).desc}|${(i as Income).date ?? ''}`),
            egresos:   seen(month.egresos   || [], e => `${(e as Egreso).amount}|${(e as Egreso).currency}|${(e as Egreso).desc}|${(e as Egreso).category}|${(e as Egreso).date}`),
            transfers: seen(month.transfers || [], t => `${(t as Transfer).amount}|${(t as Transfer).from}|${(t as Transfer).to}|${(t as Transfer).date}`),
          } as MonthData
        }
        set({ db: newDb as FinanceDB })
        return removed
      },

      clearNonJuneEgresos: () => {
        const { db } = get()
        const now = new Date()
        const todayKey = monthKey(now.getMonth() + 1, now.getFullYear())
        const newDb = { ...db }
        let count = 0
        Object.keys(newDb).forEach(key => {
          if (key === '_settings' || key === todayKey) return
          const month = newDb[key] as MonthData
          if (month?.egresos?.length) {
            count += month.egresos.length
            newDb[key] = { ...month, egresos: [] }
          }
        })
        set({ db: newDb })
        return count
      },

      hardResetAllData: async () => {
        set({ db: {} as FinanceDB })
        await sbDeleteAll()
      },

      wipeCloudAndPush: async () => {
        await sbDeleteAll()
        const { db } = get()
        await Promise.all(
          Object.keys(db).map(k => sbPush(k, db[k]).catch(() => {}))
        )
      },

      // ── sync ───────────────────────────────────────────────────────────────

      pushCurrent: () => {
        const { curKey, db } = get()
        sbPush(curKey, db[curKey]).catch(() => {})
      },

      forcePushAll: async () => {
        const { db } = get()
        let pushed = 0
        let errors = 0
        for (const key of Object.keys(db)) {
          try {
            await sbPush(key, db[key])
            pushed++
          } catch {
            errors++
          }
        }
        return { pushed, errors }
      },

      syncFromCloud: async () => {
        const rows = await sbPullAll()
        if (!rows || rows.length === 0) return

        // Cloud is authoritative: replace local with cloud data entirely.
        // Merging by ID caused duplicates when IDs changed across sessions.
        const rawDb: Record<string, unknown> = {}
        for (const { key, data } of rows) {
          rawDb[key] = data
        }

        // Apply date-based migration to cloud data — cloud may be un-migrated
        // if it was last written by an older client.
        const { db: migratedDb, changed } = applyDateMigration(rawDb)
        set({ db: migratedDb as FinanceDB })

        // Push migrated data back so the cloud is also up to date.
        if (changed) {
          const finalDb = get().db
          await Promise.all(Object.keys(finalDb).map(k => sbPush(k, finalDb[k]).catch(() => {})))
        }
      },

      // ── migration ──────────────────────────────────────────────────────────

      migrate: () => {
        const { db } = get()
        let changed = false
        const newDb: FinanceDB = { ...db }

        // Migrate SMMLV from per-month to _settings
        if (!newDb._settings || !(newDb._settings as Settings).smmlv) {
          const byYear: Record<string, number> = {}
          Object.keys(newDb).filter(k => k !== '_settings').forEach(k => {
            const m = newDb[k] as (MonthData & { smmlv?: number }) | undefined
            if (m?.smmlv) { const y = k.split('-')[0]; if (!byYear[y]) byYear[y] = m.smmlv }
          })
          if (Object.keys(byYear).length) {
            const settings = (newDb._settings ?? {}) as Settings
            newDb._settings = { ...settings, smmlv: byYear }
            changed = true
          }
        }

        // Migrate old gastos object → egresos array (legacy format)
        Object.keys(newDb).filter(k => k !== '_settings').forEach(k => {
          const m = newDb[k] as (MonthData & {
            gastos?: Record<string, number> & { extras?: Array<{id?:number;amount:number}> }
            pv?: number
          }) | undefined
          if (!m || m.egresos) return
          m.egresos = []
          let id = Date.now()
          if (m.gastos) {
            GASTOS_KEYS.forEach(tipo => {
              if ((m.gastos![tipo] || 0) > 0) {
                const tipoData = EGRESO_TIPOS.find(t => t.id === tipo)
                m.egresos!.push({
                  id: id++, amount: m.gastos![tipo], currency: 'COP', date: '',
                  desc: tipoData?.label ?? tipo, category: tipoData?.category ?? 'otro',
                })
              }
            });
            (m.gastos.extras || []).forEach(e => {
              m.egresos!.push({ id: e.id ?? id++, amount: e.amount, currency: 'COP', date: '', desc: 'Otro', category: 'otro' })
            })
          }
          if ((m.pv || 0) > 0)
            m.egresos!.push({ id: id++, amount: m.pv!, currency: 'COP', date: '', desc: 'Pensión voluntaria', category: 'otro' })
          changed = true
        })

        // Migrate tipo-based egresos → desc + category
        Object.keys(newDb).filter(k => k !== '_settings').forEach(k => {
          const m = newDb[k] as MonthData | undefined
          if (!m?.egresos?.length) return
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          const needsMigration = m.egresos.some((e: any) => !e.desc)
          if (!needsMigration) return
          // eslint-disable-next-line @typescript-eslint/no-explicit-any
          m.egresos = m.egresos.map((e: any) => {
            if (e.desc) return e
            const tipo = e.tipo ?? ''
            const tipoData = EGRESO_TIPOS.find(t => t.id === tipo)
            const catId = e.category
              ?? tipoData?.category
              ?? EGRESO_CATEGORIAS.find(c => c.tipos.includes(tipo))?.id
              ?? 'otro'
            return {
              id: e.id,
              desc: tipoData?.label ?? tipo ?? 'Egreso',
              category: catId,
              amount: e.amount,
              currency: e.currency,
              date: e.date ?? '',
            }
          })
          changed = true
        })

        // Restore ARQ Savings account if referenced in transfers but missing from accounts
        const settings = (newDb._settings ?? {}) as Settings
        const accounts: Account[] = settings.accounts ?? []
        const ARQ_SAVINGS_ID = 'acc_1781573823915'
        if (!accounts.find(a => a.id === ARQ_SAVINGS_ID)) {
          const referencedInTransfers = Object.keys(newDb)
            .filter(k => k !== '_settings')
            .some(k => {
              const m = newDb[k] as MonthData | undefined
              return (m?.transfers ?? []).some(t => t.from === ARQ_SAVINGS_ID || t.to === ARQ_SAVINGS_ID)
            })
          if (referencedInTransfers) {
            settings.accounts = [...accounts, { id: ARQ_SAVINGS_ID, label: 'ARQ Savings', currency: 'USD', number: '', rate: 3.5, startingBalance: 0 }]
            newDb._settings = settings as FinanceDB['_settings']
            changed = true
          }
        }

        // Set startingBalance: 0 on any account that has it undefined/null
        const settingsForBalance = (newDb._settings ?? {}) as Settings
        if (settingsForBalance.accounts?.some((a: Account) => a.startingBalance == null)) {
          settingsForBalance.accounts = settingsForBalance.accounts.map((a: Account) =>
            a.startingBalance == null ? { ...a, startingBalance: 0 } : a
          )
          newDb._settings = settingsForBalance as FinanceDB['_settings']
          changed = true
        }

        if (changed) set({ db: newDb })
      },
    }),
    {
      name: 'amd-finance', // mismo localStorage key — datos existentes sobreviven
      partialize: (state) => ({ db: state.db }),
      onRehydrateStorage: () => (state) => {
        state?.migrate()
        if (!state) return

        // ── One-time migration: move records to their date-based month key ──
        const { db: migratedDb, changed } = applyDateMigration(state.db as Record<string, unknown>)
        if (changed) state.db = migratedDb as FinanceDB

        // Always reset curKey to actual current month on load
        const now = new Date()
        const key = monthKey(now.getMonth() + 1, now.getFullYear())
        state.curKey = key
        // Ensure current month record exists
        if (!state.db[key]) {
          const existingKeys = Object.keys(state.db).filter(k => k !== '_settings').sort()
          const prev = existingKeys.length > 0
            ? (state.db[existingKeys[existingKeys.length - 1]] as MonthData)
            : null
          state.db[key] = {
            trm: prev?.trm ?? DEFAULTS.trm,
            incomes: [],
            transfers: [],
            egresos: [],
          }
        }
      },
    },
  ),
)
