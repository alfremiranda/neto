import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULTS, TRANSFER_ACCOUNTS, GASTOS_KEYS } from '@/data/defaults'
import { sbPush, sbPullAll } from '@/lib/supabase'
import type { FinanceDB, MonthData, Account, Settings, Income, Egreso, Transfer } from '@/types'

// ─── helpers ────────────────────────────────────────────────────────────────

export function monthKey(m: number, y: number): string {
  return `${y}-${String(m).padStart(2, '0')}`
}

function makeDefaultEgresos(): Egreso[] {
  const tipos = ['arriendo','servicios','internet','mercado','tarjetas','transporte','streaming','salud','pension_vol']
  let id = Date.now()
  return tipos.map(tipo => ({ id: id++, tipo, amount: 0, currency: 'COP' as const, date: '' }))
}

function emptyMonth(trm = DEFAULTS.trm): MonthData {
  return { trm, incomes: [], transfers: [], egresos: [] }
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
  removeIncome: (id: number) => void
  addEgreso: (egreso: Omit<Egreso, 'id'>) => void
  updateEgreso: (id: number, egreso: Partial<Egreso>) => void
  removeEgreso: (id: number) => void
  addTransfer: (transfer: Omit<Transfer, 'id'>) => void
  removeTransfer: (id: number) => void
  setBalance: (accountId: string, amount: number) => void
  setTRM: (trm: number) => void
  saveSMMLV: (year: string, value: number) => void
  saveAccountsConfig: (accounts: Account[]) => void

  // navigation
  prevMonth: () => void
  nextMonth: () => void

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
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          incomes: [...d.incomes, { ...income, id: Date.now() }],
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
        const d = db[curKey] ?? emptyMonth()
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
        const d = db[curKey] ?? emptyMonth()
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

      setBalance: (accountId, amount) => {
        const { curKey, db } = get()
        const d = db[curKey] ?? emptyMonth()
        const updated: MonthData = {
          ...d,
          balances: { ...(d.balances || {}), [accountId]: amount },
        }
        set(state => ({ db: { ...state.db, [curKey]: updated } }))
        get().pushCurrent()
      },

      setTRM: (trm) => {
        const { curKey } = get()
        get().updateMonth(curKey, { trm })
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
            },
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
            },
          }
        })
        sbPush('_settings', get().db._settings).catch(() => {})
      },

      // ── navigation ─────────────────────────────────────────────────────────

      prevMonth: () => {
        const { curKey, db } = get()
        const [y, m] = curKey.split('-').map(Number)
        if (m === 0) return
        const prevKey = monthKey(m - 1, y)
        if (!db[prevKey]) {
          const current = db[curKey] ?? emptyMonth()
          const newMonth: MonthData = {
            trm: current.trm,
            incomes: [],
            transfers: [],
            egresos: makeDefaultEgresos(),
            egresosSeeded: true,
          }
          set(state => ({ db: { ...state.db, [prevKey]: newMonth }, curKey: prevKey }))
        } else {
          set({ curKey: prevKey })
        }
      },

      nextMonth: () => {
        const { curKey, db } = get()
        const [y, m] = curKey.split('-').map(Number)
        if (m === 11) return
        const nextKey = monthKey(m + 1, y)
        if (!db[nextKey]) {
          const current = db[curKey] ?? emptyMonth()
          const newMonth: MonthData = {
            trm: current.trm,
            incomes: [],
            transfers: [],
            egresos: makeDefaultEgresos(),
            egresosSeeded: true,
          }
          set(state => ({ db: { ...state.db, [nextKey]: newMonth }, curKey: nextKey }))
        } else {
          set({ curKey: nextKey })
        }
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

        // Migrate old gastos object → egresos array
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
              if ((m.gastos![tipo] || 0) > 0)
                m.egresos!.push({ id: id++, amount: m.gastos![tipo], currency: 'COP', date: '', tipo })
            });
            (m.gastos.extras || []).forEach(e => {
              m.egresos!.push({ id: e.id ?? id++, amount: e.amount, currency: 'COP', date: '', tipo: 'otro' })
            })
          }
          if ((m.pv || 0) > 0)
            m.egresos!.push({ id: id++, amount: m.pv!, currency: 'COP', date: '', tipo: 'pension_vol' })
          changed = true
        })

        // Seed default egresos for empty un-seeded months
        Object.keys(newDb).filter(k => k !== '_settings').forEach(k => {
          const m = newDb[k] as MonthData | undefined
          if (!m || !Array.isArray(m.egresos) || m.egresos.length > 0 || m.egresosSeeded) return
          m.egresos = makeDefaultEgresos()
          m.egresosSeeded = true
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
            egresos: makeDefaultEgresos(),
            egresosSeeded: true,
          }
        }
      },
    },
  ),
)
