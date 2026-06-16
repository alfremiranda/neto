import { create } from 'zustand'
import type { SheetId, ViewType } from '@/types'

interface UIState {
  view: ViewType
  activeSheet: SheetId
  pendingDeleteId: number | null
  toastMsg: string | null
  editingEgresoId: number | null
  editingIncomeId: number | null
  editingAccountId: string | null
  editingBalanceId: string | null
  editingTransferId: number | null
  sidebarCollapsed: boolean

  setView: (v: ViewType) => void
  openSheet: (id: SheetId) => void
  closeSheet: () => void
  setPendingDelete: (id: number | null) => void
  showToast: (msg: string) => void
  setEditingEgreso: (id: number | null) => void
  setEditingIncome: (id: number | null) => void
  setEditingAccount: (id: string | null) => void
  setEditingBalance: (id: string | null) => void
  setEditingTransfer: (id: number | null) => void
  toggleSidebar: () => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useUIStore = create<UIState>()((set) => ({
  view: 'mes',
  activeSheet: null,
  pendingDeleteId: null,
  toastMsg: null,
  editingEgresoId: null,
  editingIncomeId: null,
  editingAccountId: null,
  editingBalanceId: null,
  editingTransferId: null,
  sidebarCollapsed: false,

  setView: (view) => set({ view }),

  openSheet: (id) => set({ activeSheet: id }),

  closeSheet: () => set({
    activeSheet: null,
    editingEgresoId: null,
    editingIncomeId: null,
    editingAccountId: null,
    editingBalanceId: null,
    editingTransferId: null,
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
  setEditingBalance: (id) => set({ editingBalanceId: id }),
  setEditingTransfer: (id) => set({ editingTransferId: id }),
  toggleSidebar: () => set(s => ({ sidebarCollapsed: !s.sidebarCollapsed })),
}))
