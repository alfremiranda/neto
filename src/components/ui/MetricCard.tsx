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
    <div className={cn('bg-[var(--muted)] rounded-xl p-3', className)}>
      <div className="text-[11px] font-sans font-normal leading-[17px] text-muted-foreground">{label}</div>
      <div className="font-heading font-bold text-[17px] leading-[26px] tabular-nums text-foreground">{value}</div>
      {sub && <div className="text-muted-foreground">{sub}</div>}
    </div>
  )
}
