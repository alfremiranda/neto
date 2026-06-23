import { useFinanceStore, monthKey } from '@/store/financeStore'
import { useLiveTRM } from './useLiveTRM'

/**
 * Returns the current month data with the effective TRM resolved:
 * - Current month: live TRM (falls back to stored if unavailable)
 * - Past months: stored month.trm
 */
export function useMonthData() {
  const { getCurrentMonth, curKey } = useFinanceStore()
  const { trm: liveTRM } = useLiveTRM()
  const month = getCurrentMonth()

  const now = new Date()
  const todayKey = monthKey(now.getMonth(), now.getFullYear())
  const isCurrentMonth = curKey === todayKey

  const trm = isCurrentMonth && liveTRM ? liveTRM : month.trm

  return { ...month, trm }
}
