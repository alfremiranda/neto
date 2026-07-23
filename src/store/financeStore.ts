import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULTS, TRANSFER_ACCOUNTS, GASTOS_KEYS, EGRESO_TIPOS, EGRESO_CATEGORIAS, smmlvForYear } from '@/data/defaults'
import { sbPush, sbPullAll } from '@/lib/supabase'
import { mergeMonth, localHasExtra, mergeSettings, canonicalTieBreak } from './merge'
import type { FinanceDB, MonthData, Account, Settings, Income, Egreso, Transfer } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────

// Reliable per-key push (prod only). Stamps the key's local edit time, marks
// it dirty, pushes, and clears dirty on success. A failed push stays dirty and
// is retried by flushPending() (on focus / reconnect / next sync), so a change
// is never silently dropped.
let syncInFlight = false

function autoPush(key: string, data: unknown) {
  if (import.meta.env.DEV) return
  useFinanceStore.setState(s => ({
    updatedAt: { ...s.updatedAt, [key]: Date.now() },
    dirty: s.dirty.includes(key) ? s.dirty : [...s.dirty, key],
  }))
  sbPush(key, data)
    .then(() => useFinanceStore.setState(s => ({ dirty: s.dirty.filter(k => k !== key) })))
    .catch(() => { /* stays dirty; retried by flushPending */ })
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
const CURRENT_DB_VERSION = 6

// `settingsMs` is the last-known write time of the _settings blob for THIS side
// (local rehydrate: the local stamp; cloud merge: the merged ms). v6 uses it to
// seed a stable per-account updatedAt. It is data-shape only — deductions live in
// a separate local store and are consolidated in the settingsStore mirror, not here.
function applyDateMigration(db: Record<string, unknown>, settingsMs = 0): { db: Record<string, unknown>; changed: boolean } {
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

  // ── v4: fix off-by-one month on seeded recurring egresos ──────────────────────
  // shiftRecurring had a bug: it treated the 1-indexed month from monthKey as
  // 0-indexed and added +1, producing dates one month ahead (e.g. July egresos
  // were dated in August). Fix: for each month, find unconfirmed recurring egresos
  // whose date doesn't match the month key and correct the year/month.
  if (version < 4) {
    for (const key of Object.keys(current).filter(k => k !== '_settings')) {
      const m = current[key] as MonthData
      if (!(m.egresos?.length)) continue
      const [ky, km] = key.split('-').map(Number)
      const fixed = m.egresos.map(e => {
        if (!e.recurring || e.confirmed !== false) return e
        if (!e.date || e.date.slice(0, 7) === key) return e
        // Date belongs to wrong month — recompute with correct month
        const day     = parseInt(e.date.split('-')[2] ?? '1', 10)
        const lastDay = new Date(ky, km, 0).getDate()
        const d       = Math.min(day, lastDay)
        const correctedDate = `${ky}-${String(km).padStart(2, '0')}-${String(d).padStart(2, '0')}`
        return { ...e, date: correctedDate }
      })
      current[key] = { ...m, egresos: fixed }
    }
  }

  // ── v5: savings are movimientos, not egresos ────────────────────────────────
  // Convert each VoluntariaItem (and its linked 'ahorro' egreso) into a savings
  // account (created from the description, deduped by name) + a movimiento from
  // the paying account to that savings account. Removes the double-count where
  // savings reduced neto libre both as an egreso and as a voluntary deduction.
  if (version < 5) {
    const settingsObj = (current['_settings'] ?? {}) as Settings
    const accounts: Account[] = [...(settingsObj.accounts ?? [])]
    const savingsByLabel = new Map<string, string>()
    for (const a of accounts) {
      if (a.type === 'savings') savingsByLabel.set(a.label.trim().toLowerCase(), a.id)
    }
    let uid = Date.now()
    const fallbackOrigin =
      accounts.find(a => a.type === 'cash')?.id ?? accounts[0]?.id ?? 'Efectivo'

    const ensureSavings = (label: string, currency: 'USD' | 'COP'): string => {
      const norm = (label || 'Ahorro').trim()
      const key = norm.toLowerCase()
      const hit = savingsByLabel.get(key)
      if (hit) return hit
      const id = `acc_sav_${uid++}`
      accounts.push({ id, label: norm, currency, type: 'savings', number: '', rate: 0, startingBalance: 0 })
      savingsByLabel.set(key, id)
      return id
    }

    for (const key of Object.keys(current).filter(k => k !== '_settings')) {
      const m = current[key] as MonthData
      const voluntarias = m.voluntarias ?? []
      if (voluntarias.length === 0) continue

      const removeIds = new Set<number>()
      const transfers: Transfer[] = [...(m.transfers ?? [])]
      for (const v of voluntarias) {
        const dest   = ensureSavings(v.label, v.currency)
        const origin = v.account || fallbackOrigin
        if (v.egresoId != null) removeIds.add(v.egresoId)
        transfers.push({
          id: uid++,
          date: v.date || `${key}-01`,
          from: origin,
          to: dest,
          amount: v.amount,
          fromCurrency: v.currency,
          toCurrency: v.currency,
          trm: null,
          toAmount: v.amount,
        })
      }
      current[key] = {
        ...m,
        voluntarias: [],
        transfers,
        egresos: (m.egresos ?? []).filter(e => !removeIds.has(e.id)),
      }
    }

    current['_settings'] = { ...settingsObj, accounts } as unknown as MonthData
  }

  // ── v6: seed a stable per-account updatedAt so _settings merges per-entry ─────
  // Without a stamp, an unstamped account falls back to the settings blob's ms,
  // which is bumped by ANY settings write — so editing one account would make the
  // others look freshly edited and clobber another device's concurrent edits.
  // Seed the last-known settings ts (clamped ≥1 to dodge the ts=0 / default-
  // tombstone collision) as a stable baseline; real edits stamp Date.now() later.
  if (version < 6) {
    const st = current['_settings'] as (Settings & Record<string, unknown>) | undefined
    if (st?.accounts?.length) {
      const seedTs = settingsMs || 1
      const accounts = st.accounts.map(a => (a.updatedAt ? a : { ...a, updatedAt: seedTs }))
      current['_settings'] = { ...st, accounts } as unknown as MonthData
    }
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
  const [y, m] = newKey.split('-').map(Number) // m is 1-indexed (Jul=7)
  const base   = Date.now()
  return egresos
    .filter(e => e.recurring)
    .map((e, i) => {
      let date = ''
      if (e.date) {
        const day     = parseInt(e.date.split('-')[2] ?? '1', 10)
        // new Date(y, m, 0): JS months are 0-indexed so passing m (1-based) gives
        // the next month in 0-based, and day=0 yields the last day of month m. ✓
        const lastDay = new Date(y, m, 0).getDate()
        const d       = Math.min(day, lastDay)
        date = `${y}-${String(m).padStart(2, '0')}-${String(d).padStart(2, '0')}`
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
  addEgreso: (egreso: Omit<Egreso, 'id'>, targetKey?: string) => number
  updateEgreso: (id: number, egreso: Partial<Egreso>) => void
  removeEgreso: (id: number) => void
  confirmEgreso: (id: number) => void
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void
  updateTransfer: (id: number, transfer: Omit<Transfer, 'id'>) => void
  removeTransfer: (id: number) => void
  reorderEgresos: (orderedIds: number[]) => void
  setStartingBalance: (accountId: string, amount: number) => void
  setTRM: (trm: number) => void
  saveAccountsConfig: (accounts: Account[]) => void
  toggleAccountFavorite: (id: string) => void
  completeOnboarding: () => void

  // navigation
  prevMonth: () => void
  nextMonth: () => void
  deleteMonth: (key: string) => void

  // sync
  updatedAt: Record<string, number>   // per-key last local edit time (ms) for LWW merge
  dirty: string[]                     // keys with an unconfirmed push, retried on flush
  syncFromCloud: () => Promise<void>
  flushPending: () => Promise<void>
  forcePushAll: () => Promise<{ pushed: number; errors: number }>

  // migration (runs on load)
  migrate: () => void
}

// ─── store ───────────────────────────────────────────────────────────────────

export const useFinanceStore = create<FinanceState>()(
  persist(
    (set, get) => ({
      db: {},
      updatedAt: {},
      dirty: [],
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
          const seeded: MonthData = { ...initMonth(curKey, db), egresosSeeded: true }
          set(s => ({ db: { ...s.db, [curKey]: seeded } }))
        }
      },

      // SMMLV is a legal constant (see SMMLV_BY_YEAR); not user-editable.
      getSMMLV: (year) => smmlvForYear(year),

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
          incomes: [...d.incomes, { ...income, id: Date.now(), updatedAt: Date.now() }],
        }
        set(state => ({ db: { ...state.db, [key]: updated } }))
        autoPush(key, updated)
      },

      updateIncome: (id, patch) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          incomes: d.incomes.map(i => i.id === id ? { ...i, ...patch, updatedAt: Date.now() } : i),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      removeIncome: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          incomes: d.incomes.filter(i => i.id !== id),
          deleted: { ...(d.deleted ?? {}), [`income:${id}`]: Date.now() },
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      addEgreso: (egreso, targetKey) => {
        const { curKey, db } = get()
        const key = targetKey ?? (egreso.date ? keyForDate(egreso.date, curKey) : curKey)
        const d = db[key] ?? initMonth(key, db)
        const id = Date.now()
        const updated: MonthData = {
          ...d,
          egresos: [...(d.egresos || []), { ...egreso, id, confirmed: true, updatedAt: id }],
        }
        set(state => ({ db: { ...state.db, [key]: updated } }))
        autoPush(key, updated)
        return id
      },

      updateEgreso: (id, patch) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          egresos: (d.egresos || []).map(e => e.id === id ? { ...e, ...patch, confirmed: true, updatedAt: Date.now() } : e),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      confirmEgreso: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          egresos: (d.egresos || []).map(e => e.id === id ? { ...e, confirmed: true, updatedAt: Date.now() } : e),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      removeEgreso: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          egresos: (d.egresos || []).filter(e => e.id !== id),
          deleted: { ...(d.deleted ?? {}), [`egreso:${id}`]: Date.now() },
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      addTransfer: (transfer) => {
        const { curKey, db } = get()
        const key = transfer.date ? keyForDate(transfer.date, curKey) : curKey
        const d = db[key] ?? initMonth(key, db)
        const newTransfer: Transfer = { ...transfer, id: Date.now(), updatedAt: Date.now() }
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
          transfers: (d.transfers || []).map(t => t.id === id ? { ...transfer, id, updatedAt: Date.now() } : t),
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
          deleted: { ...(d.deleted ?? {}), [`transfer:${id}`]: Date.now() },
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


      setTRM: (trm) => {
        const { curKey, db } = get()
        const existing = db[curKey] ?? initMonth(curKey, db)
        const updated = { ...existing, trm }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        autoPush(curKey, updated)
      },

      saveAccountsConfig: (accounts) => {
        const now = Date.now()
        set(state => {
          const settings = (state.db._settings ?? {}) as Settings
          const prev = settings.accounts ?? []
          const prevById = new Map(prev.map(a => [a.id, a]))

          // Stamp ONLY accounts that actually changed, so editing one account does
          // not bump the others — otherwise a save would let this device's stale
          // copies win the per-entry merge over another device's real edits.
          const stamped = accounts.map(a => {
            const before = prevById.get(a.id)
            const same = before && canonicalTieBreak({ ...before, updatedAt: undefined }, { ...a, updatedAt: undefined }) === 0
            return same ? before! : { ...a, updatedAt: now }
          })

          // Tombstone removed non-locked accounts so deletes propagate (the union
          // merge would otherwise resurrect them from the other device); clear any
          // tombstone for an id that is present again (re-add / resurrection).
          const deleted: Record<string, number> = { ...(settings.deleted ?? {}) }
          const nextIds = new Set(accounts.map(a => a.id))
          for (const a of prev) if (!nextIds.has(a.id) && !a.locked) deleted[`account:${a.id}`] = now
          for (const id of nextIds) delete deleted[`account:${id}`]

          return {
            db: {
              ...state.db,
              _settings: {
                ...settings,
                accounts: stamped,
                deleted: Object.keys(deleted).length ? deleted : undefined,
              },
            } as FinanceDB,
          }
        })
        autoPush('_settings', get().db._settings)
      },

      toggleAccountFavorite: (id) => {
        const accounts = get().getAccounts().map(a => a.id === id ? { ...a, favorite: !a.favorite } : a)
        get().saveAccountsConfig(accounts)
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
        autoPush('_settings', get().db._settings)
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
        const existing = db[newKey]
        if (!existing) {
          const seeded: MonthData = { ...initMonth(newKey, db), egresosSeeded: true }
          set({ curKey: newKey, db: { ...db, [newKey]: seeded } })
        } else if (!existing.egresosSeeded) {
          // Month exists but recurring egresos may not have been seeded yet
          // (happens when the month was visited before egresos were marked recurring).
          // Merge in fresh recurring egresos, deduplicating by desc+amount.
          const prev = db[curKey] as MonthData | undefined
          const toSeed = prev ? shiftRecurring(prev.egresos || [], newKey) : []
          const existingKeys = new Set((existing.egresos || []).map(e => `${e.desc}|${e.amount}`))
          const fresh = toSeed.filter(e => !existingKeys.has(`${e.desc}|${e.amount}`))
          const updated: MonthData = {
            ...existing,
            egresos: [...(existing.egresos || []), ...fresh],
            egresosSeeded: true,
          }
          set({ curKey: newKey, db: { ...db, [newKey]: updated } })
        } else {
          set({ curKey: newKey })
        }
      },

      deleteMonth: (key) => {
        const { db, curKey } = get()
        if (key === '_settings') return
        const m = db[key] as MonthData | undefined
        if (!m) return
        // Tombstone every entry so the deletion propagates across devices (a plain
        // key delete would be re-added by the union merge from another device).
        const now = Date.now()
        const deleted: Record<string, number> = { ...(m.deleted ?? {}) }
        for (const e of m.incomes ?? [])    deleted[`income:${e.id}`]   = now
        for (const e of m.egresos ?? [])     deleted[`egreso:${e.id}`]   = now
        for (const e of m.transfers ?? [])   deleted[`transfer:${e.id}`] = now
        for (const e of m.voluntarias ?? []) deleted[`vol:${e.id}`]      = now
        const emptied: MonthData = { trm: m.trm, incomes: [], transfers: [], egresos: [], deleted }
        let newCurKey = curKey
        if (key === curKey) {
          const [y, mo] = key.split('-').map(Number)
          newCurKey = mo > 0 ? `${y}-${String(mo - 1).padStart(2, '0')}` : key
        }
        set({ db: { ...db, [key]: emptied }, curKey: newCurKey })
        autoPush(key, emptied)
      },






      forcePushAll: async () => {
        const { db } = get()
        let pushed = 0
        let errors = 0
        const now = Date.now()
        const ts: Record<string, number> = { ...get().updatedAt }
        for (const key of Object.keys(db)) {
          try {
            await sbPush(key, db[key])
            ts[key] = now
            pushed++
          } catch {
            errors++
          }
        }
        // Local is now the source of truth in the cloud: stamp + clear the queue.
        set({ updatedAt: ts, dirty: [] })
        return { pushed, errors }
      },

      // Retry any keys whose push never confirmed (offline, expired token, …).
      flushPending: async () => {
        if (import.meta.env.DEV) return
        const dirty = [...get().dirty]
        for (const key of dirty) {
          const db = get().db
          try {
            await sbPush(key, key in db ? db[key] : null)
            set(s => ({ dirty: s.dirty.filter(k => k !== key) }))
          } catch { /* keep dirty, retry next time */ }
        }
      },

      // Non-destructive two-way sync. Flush local changes first, then pull and
      // MERGE PER ENTRY: month lists are unioned by id (nothing is dropped),
      // newest edit wins per entry, tombstones remove deleted entries. Any month
      // where local holds extra is pushed back so the cloud (and other devices)
      // converge. `_settings` is whole-object LWW.
      syncFromCloud: async () => {
        if (syncInFlight) return
        syncInFlight = true
        try {
          await get().flushPending()
          const rows = await sbPullAll()
          if (!rows) return

          const cloudMap = new Map<string, { data: unknown; ms: number }>()
          for (const { key, data, updated_at } of rows) {
            cloudMap.set(key, { data, ms: updated_at ? Date.parse(updated_at) : 0 })
          }

          const { db: localDb, updatedAt: localTs } = get()
          const rawDb: Record<string, unknown> = { ...localDb }
          const newTs: Record<string, number> = { ...localTs }
          const pushBack = new Set<string>()

          for (const key of new Set<string>([...Object.keys(localDb), ...cloudMap.keys()])) {
            const cloud = cloudMap.get(key)
            const localMs = localTs[key] ?? 0
            const cloudMs = cloud?.ms ?? 0
            const localVal = localDb[key]

            if (key === '_settings') {
              // Per-entry (accounts/deductions) + per-field (scalars) merge, so
              // concurrent settings edits across devices no longer drop a side.
              const localS = localVal as Settings | undefined
              const cloudS = cloud?.data as Settings | undefined
              if (!cloudS) { if (localS !== undefined) pushBack.add(key); continue }  // local-only
              if (!localS) { rawDb[key] = cloudS; newTs[key] = cloudMs; continue }    // cloud-only

              // A locked entry is system: its own `locked` flag is the source of
              // truth (no defaults import needed). Union both sides.
              const lockedIds = <T extends { id: string; locked?: boolean }>(a?: T[], b?: T[]) =>
                new Set([...(a ?? []), ...(b ?? [])].filter(x => x.locked).map(x => x.id))
              const systemIds = {
                accounts:   lockedIds(localS.accounts,   cloudS.accounts),
                deductions: lockedIds(localS.deductions, cloudS.deductions),
              }

              const merged = mergeSettings(localS, cloudS, localMs, cloudMs, systemIds)
              rawDb[key] = merged
              newTs[key] = Math.max(localMs, cloudMs)
              // Push back only when the cloud isn't already at the merged state
              // (local contributed something). Canonical compare ignores key order.
              if (canonicalTieBreak(merged, cloudS) !== 0) pushBack.add(key)
              continue
            }

            const local = localVal as MonthData | undefined
            const cloudData = cloud?.data as MonthData | undefined
            if (!cloudData) { if (local) pushBack.add(key); continue }   // local-only month
            if (!local) { rawDb[key] = cloudData; newTs[key] = cloudMs; continue }  // cloud-only

            rawDb[key] = mergeMonth(local, cloudData, localMs, cloudMs)
            newTs[key] = Math.max(localMs, cloudMs)
            if (localHasExtra(local, cloudData, localMs, cloudMs)) pushBack.add(key)
          }

          // Cloud may be un-migrated if last written by an older client.
          const { db: migratedDb, changed } = applyDateMigration(rawDb, newTs['_settings'] ?? 0)
          set({ db: migratedDb as FinanceDB, updatedAt: newTs })

          const finalDb = get().db
          if (changed) Object.keys(finalDb).forEach(k => pushBack.add(k))
          pushBack.forEach(k => autoPush(k, finalDb[k]))
        } finally {
          syncInFlight = false
        }
      },

      // ── migration ──────────────────────────────────────────────────────────

      migrate: () => {
        const { db } = get()
        let changed = false
        const newDb: FinanceDB = { ...db }

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
              desc: tipoData?.label ?? tipo ?? 'Gasto',
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
      partialize: (state) => ({ db: state.db, updatedAt: state.updatedAt, dirty: state.dirty }),
      onRehydrateStorage: () => (state) => {
        state?.migrate()
        if (!state) return

        // ── One-time migration: move records to their date-based month key ──
        const { db: migratedDb, changed } = applyDateMigration(state.db as Record<string, unknown>, state.updatedAt?.['_settings'] ?? 0)
        if (changed) state.db = migratedDb as FinanceDB

        // ── Sync bookkeeping ──
        // First load after enabling per-key sync: stamp every existing key so
        // pulls can compare freshness. This is non-destructive — no push, no
        // dirty — so nothing in the cloud is overwritten; convergence happens
        // as each device edits (or via a manual "Subir todo").
        if (!state.updatedAt) state.updatedAt = {}
        if (!state.dirty) state.dirty = []
        if (Object.keys(state.updatedAt).length === 0) {
          const now = Date.now()
          const ts: Record<string, number> = {}
          Object.keys(state.db).forEach(k => { ts[k] = now })
          state.updatedAt = ts
        }

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
