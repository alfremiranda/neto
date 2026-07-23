import { useFinanceStore } from './financeStore'
import { DEFAULT_DEDUCTIONS } from '@/data/deductions'
import type { DeductionConfig, Settings } from '@/types'

// ─── settingsStore — a DERIVED view over financeStore.db._settings ────────────
// W2 / W-1: deductions + display prefs now live in the synced `_settings` blob, so
// this is no longer a persisted store with its own state. It READS db._settings and
// its actions WRITE back through financeStore (which stamps updatedAt / fieldUpdatedAt,
// tombstones deletes, and autoPushes). One persistence layer, one source of truth —
// no second copy to keep in sync, no echo to guard, no event order to reason about.
// The old `neto-settings` localStorage stays frozen as a consolidation source /
// rollback backup (see financeStore.consolidateSettings).
//
// The public API is unchanged, so the ~10 consumer components keep working as-is:
//   useSettingsStore(s => s.deductions)   and   const { addDeduction } = useSettingsStore()

interface SettingsState {
  deductions: DeductionConfig[]
  displayName: string
  primaryCurrency: 'COP' | 'USD'
  secondaryCurrency: 'COP' | 'USD' | null
  setDeduction: (id: string, patch: Partial<DeductionConfig>) => void
  setDeductionsEnabled: (enabled: boolean) => void
  addDeduction: (d: Omit<DeductionConfig, 'id'>) => void
  removeDeduction: (id: string) => void
  resetDeductions: () => void
  setDisplayName: (name: string) => void
  setDisplayCurrency: (primary: 'COP' | 'USD', secondary: 'COP' | 'USD' | null) => void
}

type SettingsActions = Omit<SettingsState, 'deductions' | 'displayName' | 'primaryCurrency' | 'secondaryCurrency'>

const fs = () => useFinanceStore.getState()
const curDeductions = (): DeductionConfig[] => fs().db._settings?.deductions ?? DEFAULT_DEDUCTIONS

// Stable, module-level action references — every write routes through financeStore.
const actions: SettingsActions = {
  setDeduction: (id, patch) =>
    fs().saveDeductionsConfig(curDeductions().map(d => (d.id === id ? { ...d, ...patch } : d))),
  setDeductionsEnabled: (enabled) =>
    fs().saveDeductionsConfig(curDeductions().map(d => (d.group === 'ss' || d.group === 'provision' ? { ...d, enabled } : d))),
  addDeduction: (d) =>
    fs().saveDeductionsConfig([...curDeductions(), { ...d, id: `custom_${Date.now()}` }]),
  removeDeduction: (id) =>
    fs().saveDeductionsConfig(curDeductions().filter(d => d.id !== id || d.locked)),
  resetDeductions: () => fs().saveDeductionsConfig(DEFAULT_DEDUCTIONS),
  setDisplayName: (name) => fs().setSettingsScalars({ displayName: name }),
  setDisplayCurrency: (primary, secondary) => fs().setSettingsScalars({ primaryCurrency: primary, secondaryCurrency: secondary }),
}

// Memoize the derived object by the `_settings` REFERENCE. financeStore updates are
// immutable, so `db._settings` keeps the same reference across unrelated changes
// (e.g. month edits) — the cache then returns a stable snapshot, which zustand v5 /
// useSyncExternalStore requires (a fresh object each call would loop / warn) and
// which avoids re-rendering settings consumers on every unrelated store change.
let cache: { src: Settings | undefined; state: SettingsState } | null = null
function derive(s: Settings | undefined): SettingsState {
  if (cache && cache.src === s) return cache.state
  const state: SettingsState = {
    deductions: s?.deductions ?? DEFAULT_DEDUCTIONS,
    displayName: s?.displayName ?? '',
    primaryCurrency: s?.primaryCurrency ?? 'COP',
    secondaryCurrency: s?.secondaryCurrency !== undefined ? s.secondaryCurrency : 'USD',
    ...actions,
  }
  cache = { src: s, state }
  return state
}

export function useSettingsStore(): SettingsState
export function useSettingsStore<T>(selector: (s: SettingsState) => T): T
export function useSettingsStore<T>(selector?: (s: SettingsState) => T): T | SettingsState {
  return useFinanceStore(f => {
    const s = derive(f.db._settings)
    return selector ? selector(s) : s
  })
}
