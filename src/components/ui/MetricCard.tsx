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
    <div className={cn('bg-[var(--n-bg2)] rounded-lg p-3', className)}>
      <div className="text-[11px] text-[var(--n-txt3)] mb-0.5">{label}</div>
      <div className="text-[17px] font-semibold leading-tight">{value}</div>
      {sub && <div className="text-[11px] text-[var(--n-txt3)] mt-0.5">{sub}</div>}
    </div>
  )
}
