import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SheetId, ViewType, Settles } from '@/types'

export interface SSPaymentTarget {
  /** 'YYYY-MM' — the month whose social security this settles. */
  period:       string
  /** The IBC the app derives for that period, offered as the suggestion. */
  suggestedIbc: number
  /** Social security on that suggested base. */
  suggestedSS:  number
  /** Present when editing: the movement's id and the month it is filed in. */
  editing?: { id: number; monthKey: string }
}

export interface EgresoPrefill {
  desc:      string
  category:  string
  currency:  'USD' | 'COP'
  settles:   Settles
  /** What is left to pay, shown as a reference — NOT filled into the amount. The PILA
   *  rounds and the IBC gets adjusted, so what is owed is a starting point, not the
   *  number that left the account. */
  accrued?:  number
  /**
   * The obligation's FULL value, which is what the payment freezes.
   *
   * Not the same as `accrued` once a period is paid in parts: the second payment sees a
   * smaller remainder, and freezing that made the month read "paid 4.899.605 of 2.899.605"
   * — the total measured against the last instalment instead of against the debt.
   */
  fullAccrued?: number
  /** The IBC the accrual was derived from, so the sheet can offer it as the suggestion
   *  and recompute if the user says a different base was invoiced. SS only. */
  suggestedIbc?: number
}

interface UIState {
  view: ViewType
  prevView: ViewType | null
  activeSheet: SheetId
  pendingDeleteId: number | null
  toastMsg: string | null
  editingEgresoId: number | null
  editingIncomeId: number | null
  editingAccountId: string | null
  editingTransferId: number | null
  newAccountType: 'savings' | null   // preset type when creating a new account from a specific chapter
  // Opening the gasto sheet to settle an obligation. Carries the fields the card
  // already knows (description, category, currency, which period is being paid) so
  // the sheet only asks for what it can't: amount, date and the account that pays.
  // Kept out of the ordinary "add expense" path — settling is a once-a-month action
  // and does not belong in the common flow.
  egresoPrefill: EgresoPrefill | null
  /** Which account the 'cuenta' detail view is showing. */
  detailAccountId: string | null
  /**
   * A new build is installed and waiting. With `registerType: 'prompt'` the new worker
   * never takes over on its own — something has to tell it to — so this is what turns a
   * waiting worker into an offer the user can accept.
   */
  /** What the SS payment sheet is working on: a new payment for a period, or an existing
   *  one being edited. */
  ssPayment: SSPaymentTarget | null
  updateReady: boolean
  applyUpdate: (() => void) | null
  sidebarCollapsed: boolean

  setView: (v: ViewType) => void
  goBack: () => void
  openSheet: (id: SheetId) => void
  closeSheet: () => void
  setPendingDelete: (id: number | null) => void
  showToast: (msg: string) => void
  setEditingEgreso: (id: number | null) => void
  setEditingIncome: (id: number | null) => void
  setEditingAccount: (id: string | null) => void
  setEditingTransfer: (id: number | null) => void
  setNewAccountType: (t: 'savings' | null) => void
  openSettlement: (p: EgresoPrefill) => void
  openAccount: (id: string) => void
  setUpdateReady: (apply: () => void) => void
  openSSPayment: (t: SSPaymentTarget) => void
  toggleSidebar: () => void
}

/**
 * Whether a nav item is the section the user is in.
 *
 * The account detail is its own view but it is not its own destination — nobody navigates
 * TO it from the nav, they arrive from the index. Without this, opening an account
 * un-highlights Cuentas and the nav claims you are nowhere.
 */
export function isSectionActive(view: ViewType, id: ViewType): boolean {
  if (view === id) return true
  return id === 'cuentas' && view === 'cuenta'
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useUIStore = create<UIState>()(persist((set) => ({
  view: 'mes',
  prevView: null,
  activeSheet: null,
  pendingDeleteId: null,
  toastMsg: null,
  editingEgresoId: null,
  editingIncomeId: null,
  editingAccountId: null,
  editingTransferId: null,
  newAccountType: null,
  egresoPrefill: null,
  detailAccountId: null,
  ssPayment: null,
  updateReady: false,
  applyUpdate: null,
  sidebarCollapsed: false,

  setView: (view) => set(s => ({ prevView: s.view, view })),
  goBack: () => set(s => ({ view: s.prevView ?? 'mes', prevView: null })),

  openSheet: (id) => set({ activeSheet: id }),

  closeSheet: () => set({
    activeSheet: null,
    editingEgresoId: null,
    editingIncomeId: null,
    editingAccountId: null,
    editingTransferId: null,
    newAccountType: null,
    egresoPrefill: null,
    ssPayment: null,
  }),

  setPendingDelete: (id) => set({ pendingDeleteId: id }),

  showToast: (msg) => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ toastMsg: msg })
    toastTimer = setTimeout(() => set({ toastMsg: null }), 2200)
  },

  setEditingEgreso: (id) => set({ editingEgresoId: id }),
  setEditingIncome: (id) => set({ editingIncomeId: id }),
  setEditingAccount: (id) => set({ editingAccountId: id }),
  setEditingTransfer: (id) => set({ editingTransferId: id }),
  setNewAccountType: (t) => set({ newAccountType: t }),

  openSettlement: (p) => set({ egresoPrefill: p, editingEgresoId: null, activeSheet: 'egreso' }),

  openAccount: (id) => set(s => ({ detailAccountId: id, prevView: s.view, view: 'cuenta' })),

  setUpdateReady: (apply) => set({ updateReady: true, applyUpdate: apply }),

  openSSPayment: (t) => set({ ssPayment: t, activeSheet: 'ss-payment' }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}), {
  name: 'neto-ui',
  // Two views never persist as themselves. 'cuenta' because detailAccountId is session
  // state, so a cold start would restore a detail screen with no account to show. And a
  // stored 'ahorros' from before that page was retired would restore a route that no
  // longer renders anything — a blank main area for anyone whose last visit was there.
  partialize: (s) => ({
    view: s.view === 'cuenta' ? 'cuentas' : s.view,
    sidebarCollapsed: s.sidebarCollapsed,
  }),
  merge: (persisted, current) => {
    const p = persisted as Partial<UIState> | undefined
    const view = p?.view === ('ahorros' as ViewType) ? 'cuentas' : p?.view
    return { ...current, ...p, ...(view ? { view } : {}) }
  },
}))
