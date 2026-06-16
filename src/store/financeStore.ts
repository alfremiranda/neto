import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULTS, TRANSFER_ACCOUNTS, GASTOS_KEYS, EGRESO_TIPOS, EGRESO_CATEGORIAS } from '@/data/defaults'
import { sbPush, sbPullAll } from '@/lib/supabase'
import type { FinanceDB, MonthData, Account, Settings, Income, Egreso, Transfer, VoluntariaItem } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────

export function monthKey(m: number, y: number): string {
  return `${y}-${String(m).padStart(2, '0')}`
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
      return { ...e, id: base + i, date }
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
  getAccounts: () => Account[]

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
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void
  updateTransfer: (id: number, transfer: Omit<Transfer, 'id'>) => void
  removeTransfer: (id: number) => void
  addVoluntaria: (item: Omit<VoluntariaItem, 'id'>) => void
  removeVoluntaria: (id: number) => void
  reorderEgresos: (orderedIds: number[]) => void
  setStartingBalance: (accountId: string, amount: number) => void
  setSsAccount: (accountId: string | null) => void
  setTRM: (trm: number) => void
  saveSMMLV: (year: string, value: number) => void
  saveAccountsConfig: (accounts: Account[]) => void

  // navigation
  prevMonth: () => void
  nextMonth: () => void
  deleteMonth: (key: string) => void

  // sync
  syncFromCloud: () => Promise<void>
  pushCurrent: () => void

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
        return monthKey(now.getMonth(), now.getFullYear())
      })(),

      // ── selectors ──────────────────────────────────────────────────────────

      getMonth: (key) => {
        const d = get().db[key]
        return d ?? emptyMonth()
      },

      getCurrentMonth: () => get().getMonth(get().curKey),

      getSMMLV: (year) => {
        const s = get().db._settings as Settings | undefined
        return s?.smmlv?.[String(year)] ?? DEFAULTS.smmlv
      },

      getAccounts: () => {
        const s = get().db._settings as Settings | undefined
        if (s?.accounts && s.accounts.length > 0) return s.accounts
        return TRANSFER_ACCOUNTS.map(a => ({
          ...a,
          number: '',
          rate: a.id === 'ARQ' ? 3.5 : 0,
        }))
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
        const d = db[curKey] ?? initMonth(curKey, db)
        const updated: MonthData = {
          ...d,
          incomes: [...d.incomes, { ...income, id: Date.now() }],
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      updateIncome: (id, patch) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          incomes: d.incomes.map(i => i.id === id ? { ...i, ...patch } : i),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      removeIncome: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = { ...d, incomes: d.incomes.filter(i => i.id !== id) }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      addEgreso: (egreso) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? initMonth(curKey, db)
        const updated: MonthData = {
          ...d,
          egresos: [...(d.egresos || []), { ...egreso, id: Date.now() }],
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      updateEgreso: (id, patch) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          egresos: (d.egresos || []).map(e => e.id === id ? { ...e, ...patch } : e),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      removeEgreso: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = { ...d, egresos: (d.egresos || []).filter(e => e.id !== id) }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      addTransfer: (transfer) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? initMonth(curKey, db)
        const newTransfer: Transfer = { ...transfer, id: Date.now() }
        const updated: MonthData = {
          ...d,
          transfers: [...(d.transfers || []), newTransfer],
          // update TRM if cross-currency
          trm: transfer.trm ?? d.trm,
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      updateTransfer: (id, transfer) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          transfers: (d.transfers || []).map(t => t.id === id ? { ...transfer, id } : t),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      removeTransfer: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          transfers: (d.transfers || []).filter(t => t.id !== id),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      addVoluntaria: (item) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? initMonth(curKey, db)
        const updated: MonthData = {
          ...d,
          voluntarias: [...(d.voluntarias ?? []), { ...item, id: Date.now() }],
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      removeVoluntaria: (id) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          voluntarias: (d.voluntarias ?? []).filter(v => v.id !== id),
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
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
        get().pushCurrent()
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
        set(state => ({ db: { ...state.db, [curKey]: { ...existing, trm } } }))
        get().pushCurrent()
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

      // ── navigation ─────────────────────────────────────────────────────────

      prevMonth: () => {
        const { curKey } = get()
        const [y, m] = curKey.split('-').map(Number)
        if (m === 1) return
        set({ curKey: monthKey(m - 1, y) })
      },

      nextMonth: () => {
        const { curKey } = get()
        const [y, m] = curKey.split('-').map(Number)
        if (m === 12) return
        set({ curKey: monthKey(m + 1, y) })
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

      // ── sync ───────────────────────────────────────────────────────────────

      pushCurrent: () => {
        const { curKey, db } = get()
        sbPush(curKey, db[curKey]).catch(() => {})
      },

      syncFromCloud: async () => {
        const rows = await sbPullAll()
        if (!rows) return

        const { db } = get()
        const newDb: FinanceDB = { ...db }
        const cloudKeys = new Set(rows.map(r => r.key))
        const needsCloudUpdate = new Set<string>()

        rows.forEach(({ key, data }) => {
          if (key === '_settings') {
            const cloudSettings = data as Settings
            const localSettings = (newDb._settings ?? {}) as Settings
            if (!newDb._settings) {
              newDb._settings = cloudSettings
            } else {
              if (cloudSettings?.smmlv) {
                localSettings.smmlv = { ...(localSettings.smmlv ?? {}), ...cloudSettings.smmlv }
              }
              if (cloudSettings?.accounts && !localSettings.accounts) {
                localSettings.accounts = cloudSettings.accounts
              }
              newDb._settings = localSettings
            }
          } else {
            const cloudData = data as MonthData
            const local = newDb[key]
            const localHasEgresos = local?.egresosSeeded &&
              Array.isArray(local.egresos) && local.egresos.length > 0
            const cloudLacksEgresos = !cloudData?.egresos || cloudData.egresos.length === 0
            if (localHasEgresos && cloudLacksEgresos) {
              cloudData.egresos = local!.egresos
              cloudData.egresosSeeded = true
              needsCloudUpdate.add(key)
            }
            newDb[key] = cloudData
          }
        })

        // Push local keys missing from cloud
        for (const key of Object.keys(newDb)) {
          if (!cloudKeys.has(key)) await sbPush(key, newDb[key]).catch(() => {})
        }

        set({ db: newDb })

        // Push back months that were fixed
        for (const key of needsCloudUpdate) {
          await sbPush(key, newDb[key]).catch(() => {})
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

        if (changed) set({ db: newDb })
      },
    }),
    {
      name: 'amd-finance', // mismo localStorage key — datos existentes sobreviven
      partialize: (state) => ({ db: state.db, curKey: state.curKey }),
      onRehydrateStorage: () => (state) => {
        state?.migrate()
        // Ensure current month exists
        const key = state?.curKey
        if (key && state && !state.db[key]) {
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
