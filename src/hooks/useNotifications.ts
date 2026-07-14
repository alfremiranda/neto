import { useFinanceStore } from '@/store/financeStore'
import { localToday } from '@/lib/format'
import type { Egreso } from '@/types'

export type NotificationBucket = 'overdue' | 'today' | 'upcoming'

export interface NotificationItem {
  egresoId: number
  monthKey: string
  desc: string
  category: string
  amount: number
  currency: 'USD' | 'COP'
  account?: string
  date: string
  bucket: NotificationBucket
  days: number // signed days from today (negative = overdue)
}

const UPCOMING_WINDOW = 7 // days ahead to surface as "próximos"

function diffDays(from: string, to: string): number {
  const a = new Date(from + 'T00:00:00').getTime()
  const b = new Date(to + 'T00:00:00').getTime()
  return Math.round((a - b) / 86_400_000)
}

/**
 * Derives payment notifications from scheduled egresos (unconfirmed, dated).
 * Buckets by urgency; the badge count is the actionable set (overdue + today).
 */
export function useNotifications(): { items: NotificationItem[]; count: number } {
  const db = useFinanceStore(s => s.db)
  const today = localToday()

  const items: NotificationItem[] = []
  for (const key of Object.keys(db)) {
    if (key === '_settings') continue
    const month = db[key]
    for (const e of (month?.egresos ?? []) as Egreso[]) {
      // Only scheduled payments still pending confirmation
      if (!e.date || e.confirmed !== false) continue
      const d = diffDays(e.date, today)
      let bucket: NotificationBucket | null = null
      if (d < 0) bucket = 'overdue'
      else if (d === 0) bucket = 'today'
      else if (d <= UPCOMING_WINDOW) bucket = 'upcoming'
      if (!bucket) continue
      items.push({
        egresoId: e.id, monthKey: key, desc: e.desc, category: e.category,
        amount: e.amount, currency: e.currency, account: e.account, date: e.date, bucket, days: d,
      })
    }
  }

  const order: Record<NotificationBucket, number> = { overdue: 0, today: 1, upcoming: 2 }
  items.sort((a, b) => order[a.bucket] - order[b.bucket] || a.days - b.days)

  const count = items.filter(i => i.bucket !== 'upcoming').length
  return { items, count }
}
