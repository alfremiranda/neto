import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_DEDUCTIONS } from '@/data/deductions'
import type { DeductionConfig } from '@/types'

interface SettingsState {
  deductions: DeductionConfig[]

  setDeduction: (id: string, patch: Partial<DeductionConfig>) => void
  addDeduction:  (d: Omit<DeductionConfig, 'id'>) => void
  removeDeduction: (id: string) => void
  resetDeductions: () => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      deductions: DEFAULT_DEDUCTIONS,

      setDeduction: (id, patch) =>
        set(s => ({
          deductions: s.deductions.map(d => d.id === id ? { ...d, ...patch } : d),
        })),

      addDeduction: (d) =>
        set(s => ({
          deductions: [
            ...s.deductions,
            { ...d, id: `custom_${Date.now()}` },
          ],
        })),

      removeDeduction: (id) =>
        set(s => ({
          deductions: s.deductions.filter(d => d.id !== id || d.locked),
        })),

      resetDeductions: () => set({ deductions: DEFAULT_DEDUCTIONS }),
    }),
    {
      name: 'neto-settings',
      version: 1,
      // Merge stored deductions with any new defaults; migrate old frequency→months
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<SettingsState>
        if (!p?.deductions) return current
        const migrated = p.deductions.map((d: DeductionConfig & { frequency?: string }) => {
          if (d.months !== undefined) return d
          // migrate old frequency field
          const months =
            d.frequency === 'semiannual' ? [6, 12] :
            d.frequency === 'bimonthly'  ? [] :
            []
          const { frequency: _, ...rest } = d
          return { ...rest, months }
        })
        const storedIds = new Set(migrated.map((d: DeductionConfig) => d.id))
        const newDefaults = DEFAULT_DEDUCTIONS.filter(d => !storedIds.has(d.id))
        return { ...current, deductions: [...migrated, ...newDefaults] }
      },
    },
  ),
)
