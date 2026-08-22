import { cva, type VariantProps } from 'class-variance-authority'
import { cn } from '@/lib/utils'

/**
 * Generic label chip (`Components · Badges` → `Badge`).
 *
 * **Colour here is decorative.** The moment a badge carries meaning — an account, a
 * category, a currency — it needs its own component, so the semantic token layer stays
 * the source of that meaning rather than a `tone` prop chosen at the call site.
 *
 * `outline` is the entry-state treatment (scheduled, unconfirmed, overdue); `filled` is
 * a plain label. They are one component because they are a treatment, not two things:
 * same geometry, same six token families.
 *
 * What this replaces: a variant per account — `arq`, `toptal`, `bancol`, `ss` — picked by
 * substring-matching the account's name at the call site. That hard-coded four of
 * Alfredo's own accounts into a design-system component, and an account's colour is data
 * on the account (see AccountAvatar), never a variant here.
 */
const badgeVariants = cva(
  'ts-label-badge h-[var(--badge-size)] px-2 rounded-full whitespace-nowrap inline-flex items-center border',
  {
    variants: {
      tone: {
        accent:  '',
        success: '',
        info:    '',
        warning: '',
        danger:  '',
        neutral: '',
      },
      variant: { filled: '', outline: '' },
    },
    defaultVariants: { tone: 'neutral', variant: 'filled' },
  },
)

// Kept as a lookup rather than as cva compound variants: Tailwind only emits classes it
// can see as literal text, so a class name assembled from a variable at runtime would
// compile to nothing at all.
//
// The example is described rather than written out, and that is not fussiness: writing it
// literally put a scannable class in this file, Tailwind emitted a rule containing the
// interpolation braces, and lightningcss failed to parse its own stylesheet. A comment
// about a Tailwind trap is still text Tailwind reads.
const TONE: Record<string, { filled: string; outline: string }> = {
  accent: {
    filled:  'bg-[var(--badge-accent-background)] text-[var(--badge-accent-foreground)] border-transparent',
    outline: 'bg-transparent text-[var(--badge-accent-foreground)] border-[var(--badge-accent-border)]',
  },
  success: {
    filled:  'bg-[var(--badge-success-background)] text-[var(--badge-success-foreground)] border-transparent',
    outline: 'bg-transparent text-[var(--badge-success-foreground)] border-[var(--badge-success-border)]',
  },
  info: {
    filled:  'bg-[var(--badge-info-background)] text-[var(--badge-info-foreground)] border-transparent',
    outline: 'bg-transparent text-[var(--badge-info-foreground)] border-[var(--badge-info-border)]',
  },
  warning: {
    filled:  'bg-[var(--badge-warning-background)] text-[var(--badge-warning-foreground)] border-transparent',
    outline: 'bg-transparent text-[var(--badge-warning-foreground)] border-[var(--badge-warning-border)]',
  },
  danger: {
    filled:  'bg-[var(--badge-danger-background)] text-[var(--badge-danger-foreground)] border-transparent',
    outline: 'bg-transparent text-[var(--badge-danger-foreground)] border-[var(--badge-danger-border)]',
  },
  neutral: {
    filled:  'bg-[var(--badge-neutral-background)] text-[var(--badge-neutral-foreground)] border-transparent',
    outline: 'bg-transparent text-[var(--badge-neutral-foreground)] border-[var(--badge-neutral-border)]',
  },
}

type BadgeProps = React.ComponentProps<'span'> & VariantProps<typeof badgeVariants>

export function Badge({ tone = 'neutral', variant = 'filled', className, ...props }: BadgeProps) {
  return (
    <span
      className={cn(
        badgeVariants({ tone, variant }),
        TONE[tone ?? 'neutral'][variant ?? 'filled'],
        className,
      )}
      {...props}
    />
  )
}

/**
 * Currency is meaning, not decoration, so it gets its own component and its own tokens
 * rather than borrowing a decorative tone. `--color-currency-*` existed and had no
 * consumer; the old version painted USD with the income colours and COP with the
 * provision ones, which made a currency look like a financial category.
 */
export function CurrencyBadge({ currency }: { currency: 'USD' | 'COP' }) {
  const c = currency === 'USD' ? 'usd' : 'cop'
  return (
    <span className={cn(
      'ts-label-badge h-[var(--badge-size)] px-2 rounded-full whitespace-nowrap inline-flex items-center shrink-0',
      c === 'usd'
        ? 'bg-[var(--color-currency-usd-bg)] text-[var(--color-currency-usd-txt)]'
        : 'bg-[var(--color-currency-cop-bg)] text-[var(--color-currency-cop-txt)]',
    )}>
      {currency}
    </span>
  )
}
