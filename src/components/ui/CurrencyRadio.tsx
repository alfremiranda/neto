import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * Currency choice card (docs/inbox/dev/FYI-2026-08-19-currencyradio.md).
 *
 * The component does not know about currencies: it knows there is a short code,
 * a long name and a mark. That is why the flag arrives as a prop.
 *
 * The flag is not decoration. In an app that shows two currencies at once it is
 * what gets recognised before anything is read, and it carries the recognition
 * while a three-letter code still means nothing to someone who just arrived.
 *
 * `focused` and `selected` are separate on purpose: you can be focused without
 * having chosen, and the ring does not stand in for the selection. In code that
 * means `:focus-visible` and `aria-checked` are different things and both have to
 * be visible at once.
 */
export function CurrencyRadio({ code, description, flag, selected, onSelect, disabled, className }: {
  code: string
  description: string
  /** The national mark. Never tokenised — a flag's colours belong to a state, not to us. */
  flag: React.ReactNode
  selected: boolean
  onSelect: () => void
  disabled?: boolean
  className?: string
}) {
  return (
    <button
      type="button"
      role="radio"
      aria-checked={selected}
      disabled={disabled}
      onClick={onSelect}
      className={cn(
        'flex-1 flex flex-col items-center gap-2 py-5 px-3 rounded-xl transition-colors',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        selected
          ? 'bg-[var(--bg-brand-alpha-10)] border-2 border-[var(--primary)]'
          : 'bg-[var(--card)] border-2 border-[var(--border)] hover:border-[var(--border-strong)]',
        className,
      )}
    >
      <span className="text-3xl leading-none select-none" aria-hidden="true">{flag}</span>
      <span className="text-center">
        <span className="block ts-body-base-emphasis">{code}</span>
        <span className="block ts-body-small text-muted-foreground">{description}</span>
      </span>
      <span
        aria-hidden="true"
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
          selected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]',
        )}
      >
        {selected && <Check size={10} strokeWidth={3} className="text-[var(--primary-foreground)]" />}
      </span>
    </button>
  )
}
