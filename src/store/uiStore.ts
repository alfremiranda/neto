import { create } from 'zustand'
import type { SheetId, ViewType } from '@/types'

interface UIState {
  view: ViewType
  activeSheet: SheetId
  pendingDeleteId: number | null
  toastMsg: string | null
  editingEgresoId: number | null
  editingAccountId: string | null
  editingBalanceId: string | null

  setView: (v: ViewType) => void
  openSheet: (id: SheetId) => void
  closeSheet: () => void
  setPendingDelete: (id: number | null) => void
  showToast: (msg: string) => void
  setEditingEgreso: (id: number | null) => void
  setEditingAccount: (id: string | null) => void
  setEditingBalance: (id: string | null) => void
}

let toastTimer: ReturnType<typeof setTimeout> | null = null

export const useUIStore = create<UIState>()((set) => ({
  view: 'mes',
  activeSheet: null,
  pendingDeleteId: null,
  toastMsg: null,
  editingEgresoId: null,
  editingAccountId: null,
  editingBalanceId: null,

  setView: (view) => set({ view }),

  openSheet: (id) => set({ activeSheet: id }),

  closeSheet: () => set({
    activeSheet: null,
    editingEgresoId: null,
    editingAccountId: null,
    editingBalanceId: null,
  }),

  setPendingDelete: (id) => set({ pendingDeleteId: id }),

  showToast: (msg) => {
    if (toastTimer) clearTimeout(toastTimer)
    set({ toastMsg: msg })
    toastTimer = setTimeout(() => set({ toastMsg: null }), 2200)
  },

  setEditingEgreso: (id) => set({ editingEgresoId: id }),
  setEditingAccount: (id) => set({ editingAccountId: id }),
  setEditingBalance: (id) => set({ editingBalanceId: id }),
}))
