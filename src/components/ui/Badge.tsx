import { cn } from '@/lib/utils'

const variantClasses: Record<string, string> = {
  usd:      'bg-[var(--n-blue-bg)] text-[var(--n-blue-txt)]',
  cop:      'bg-[var(--n-green-bg)] text-[var(--n-green-txt)]',
  arq:      'bg-[var(--n-blue-bg)] text-[var(--n-blue-txt)]',
  toptal:   'bg-[var(--n-purple-bg)] text-[var(--n-purple-txt)]',
  bancol:   'bg-[var(--n-green-bg)] text-[var(--n-green-txt)]',
  otro:     'bg-[var(--n-gray-bg)] text-[var(--n-gray-txt)]',
  ss:       'bg-[var(--n-blue-bg)] text-[var(--n-blue-txt)]',
  default:  'bg-[var(--n-gray-bg)] text-[var(--n-gray-txt)]',
}

interface BadgeProps {
  variant?: string
  children: React.ReactNode
  className?: string
}

export function Badge({ variant = 'default', children, className }: BadgeProps) {
  return (
    <span className={cn(
      'text-[10px] px-[7px] py-[2px] rounded-[20px] font-medium whitespace-nowrap inline-block',
      variantClasses[variant] ?? variantClasses.default,
      className,
    )}>
      {children}
    </span>
  )
}

export function CurrencyBadge({ currency }: { currency: 'USD' | 'COP' }) {
  return <Badge variant={currency.toLowerCase()}>{currency}</Badge>
}
