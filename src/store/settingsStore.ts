import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { DEFAULT_DEDUCTIONS } from '@/data/deductions'
import type { DeductionConfig } from '@/types'

interface SettingsState {
  deductions: DeductionConfig[]
  displayName: string
  primaryCurrency: 'COP' | 'USD'
  secondaryCurrency: 'COP' | 'USD' | null

  setDeduction: (id: string, patch: Partial<DeductionConfig>) => void
  // Bulk enable/disable all SS + provision deductions (used by the onboarding
  // profile: employees turn them off, independents leave them on).
  setDeductionsEnabled: (enabled: boolean) => void
  addDeduction:  (d: Omit<DeductionConfig, 'id'>) => void
  removeDeduction: (id: string) => void
  resetDeductions: () => void
  setDisplayName: (name: string) => void
  setDisplayCurrency: (primary: 'COP' | 'USD', secondary: 'COP' | 'USD' | null) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      deductions: DEFAULT_DEDUCTIONS,
      displayName: '',
      primaryCurrency: 'COP' as const,
      secondaryCurrency: 'USD' as const,

      setDisplayName: (name) => set({ displayName: name }),
      setDisplayCurrency: (primary, secondary) => set({ primaryCurrency: primary, secondaryCurrency: secondary }),

      setDeduction: (id, patch) =>
        set(s => ({
          deductions: s.deductions.map(d => d.id === id ? { ...d, ...patch } : d),
        })),

      setDeductionsEnabled: (enabled) =>
        set(s => ({
          deductions: s.deductions.map(d =>
            d.group === 'ss' || d.group === 'provision' ? { ...d, enabled } : d),
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
      version: 5,
      // Always pass stored state through on version mismatch instead of discarding
      migrate: (s: unknown) => s as SettingsState,
      // Merge stored deductions with any new defaults; run schema migrations inline
      merge: (persisted: unknown, current) => {
        const p = persisted as Partial<SettingsState>
        if (!p?.deductions) return current

        // Provision ids that should use neto_ibc instead of bruto
        const NETO_IBC_IDS = new Set(['primas', 'cesantias', 'vacaciones'])

        const migrated = p.deductions.map((d: DeductionConfig & { frequency?: string }) => {
          let result: DeductionConfig = d

          // v1→v2: migrate old frequency field → months[]
          if (result.months === undefined) {
            const months =
              (result as DeductionConfig & { frequency?: string }).frequency === 'semiannual' ? [6, 12] :
              []
            const { frequency: _, ...rest } = result as DeductionConfig & { frequency?: string }
            result = { ...rest, months }
          }

          // v1→v2: migrate provision base bruto → neto_ibc
          if (NETO_IBC_IDS.has(result.id) && result.base === 'bruto') {
            result = { ...result, base: 'neto_ibc' }
          }

          // v2→v3: all provision items (primas/cesantías/vacaciones) → green (pre-token-rename)
          const OLD_PROVISION_COLORS = new Set(['--n-lime', '--n-purple-txt', '--n-pink'])
          if (NETO_IBC_IDS.has(result.id) && OLD_PROVISION_COLORS.has(result.color ?? '')) {
            result = { ...result, color: '--n-green' }
          }

          // v3→v4: primas → provisión mensual (months: [] = todos los meses)
          if (result.id === 'primas' && result.months?.length > 0) {
            result = { ...result, months: [] }
          }

          // v4→v5: rename --n-* color tokens → --color-{semantic}
          const TOKEN_MAP: Record<string, string> = {
            '--n-blue':      '--color-income',
            '--n-green':     '--color-provision',
            '--n-amber':     '--color-tax',
            '--n-pink':      '--color-expense',
            '--n-lime':      '--color-net',
          }
          if (result.color && TOKEN_MAP[result.color]) {
            result = { ...result, color: TOKEN_MAP[result.color] }
          }

          return result
        })

        const storedIds = new Set(migrated.map((d: DeductionConfig) => d.id))
        const newDefaults = DEFAULT_DEDUCTIONS.filter(d => !storedIds.has(d.id))
        return {
          ...current,
          deductions: [...migrated, ...newDefaults],
          // Preserve user preferences stored in previous sessions
          displayName: p.displayName ?? current.displayName,
          primaryCurrency: p.primaryCurrency ?? current.primaryCurrency,
          secondaryCurrency: p.secondaryCurrency !== undefined ? p.secondaryCurrency : current.secondaryCurrency,
        }
      },
    },
  ),
)
