import { useSettingsStore } from '@/store/settingsStore'

export function useDisplayCurrency() {
  const primaryCurrency   = useSettingsStore(s => s.primaryCurrency)
  const secondaryCurrency = useSettingsStore(s => s.secondaryCurrency)
  return { primaryCurrency, secondaryCurrency }
}
