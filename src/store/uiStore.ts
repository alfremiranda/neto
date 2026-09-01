import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import type { SheetId, ViewType, Settles } from '@/types'

export interface EgresoPrefill {
  desc:      string
  category:  string
  currency:  'USD' | 'COP'
  settles:   Settles
  /** The accrued figure, shown as a reference — NOT filled into the amount. The PILA
   *  rounds and the IBC gets adjusted, so what is owed is a starting point, not the
   *  number that left the account. */
  accrued?:  number
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
  toggleSidebar: () => void
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
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}), {
  name: 'neto-ui',
  partialize: (s) => ({ view: s.view, sidebarCollapsed: s.sidebarCollapsed }),
}))
