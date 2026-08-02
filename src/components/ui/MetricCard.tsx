import { cn } from '@/lib/utils'
import type { ReactNode } from 'react'

interface MetricCardProps {
  label: ReactNode
  value: ReactNode
  sub?: ReactNode
  className?: string
}

export function MetricCard({ label, value, sub, className }: MetricCardProps) {
  return (
    <div className={cn('bg-[var(--muted)] rounded-xl p-4', className)}>
      <div className="ts-detail-base text-muted-foreground">{label}</div>
      <div className="ts-amount-large text-foreground">{value}</div>
      {sub && <div className="text-muted-foreground">{sub}</div>}
    </div>
  )
}
