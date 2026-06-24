import { useFinanceStore } from '@/store/financeStore'

/**
 * Returns the current month data with the stored TRM.
 * Live TRM is informational only (header display) — calculations always use
 * the manually-set stored TRM so monthly and annual views stay consistent.
 */
export function useMonthData() {
  const { getCurrentMonth } = useFinanceStore()
  return getCurrentMonth()
}
