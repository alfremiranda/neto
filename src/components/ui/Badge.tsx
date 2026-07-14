import { cn } from '@/lib/utils'

const variantClasses: Record<string, string> = {
  usd:      'bg-[var(--color-income-bg)] text-[var(--color-income-txt)]',
  cop:      'bg-[var(--color-provision-bg)] text-[var(--color-provision-txt)]',
  arq:      'bg-[var(--color-income-bg)] text-[var(--color-income-txt)]',
  toptal:   'bg-[var(--color-account-toptal-bg)] text-[var(--color-account-toptal-txt)]',
  bancol:   'bg-[var(--color-provision-bg)] text-[var(--color-provision-txt)]',
  otro:     'bg-[var(--color-account-other-bg)] text-[var(--color-account-other-txt)]',
  ss:       'bg-[var(--color-income-bg)] text-[var(--color-income-txt)]',
  default:  'bg-[var(--color-account-other-bg)] text-[var(--color-account-other-txt)]',
}

interface BadgeProps {
  variant?: string
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'text-[10px] leading-[10px] h-5 px-2 rounded-[20px] font-medium whitespace-nowrap inline-flex items-center',
      variantClasses[variant] ?? variantClasses.default,
      className,
    )}>
      {children}
    </span>
  )
}

export function CurrencyBadge({ currency }: { currency: 'USD' | 'COP' }) {
  return <Badge variant={currency.toLowerCase()} className="shrink-0">{currency}</Badge>
}
