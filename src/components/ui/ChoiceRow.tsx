import { Check } from 'lucide-react'
import { cn } from '@/lib/utils'

/**
 * One choice among options (design-system/docs/19-choice-rows.md).
 *
 * The control **trails** and the row states a choice. That is what separates it
 * from `AccountRow`, whose control leads and which states a fact. Forcing both
 * into one component would need a `Control = Leading | Trailing` axis and a
 * trailing slot meaning two different things.
 *
 * Structure is composition, not variants: media and description are simply
 * present or absent. That is what keeps this at two states instead of eight.
 */
export function ChoiceRow({ label, description, media, selected, onSelect, disabled, className }: {
  label: string
  description?: string
  /** Leading icon tile. Absent = no tile, not an empty one. */
  media?: React.ReactNode
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
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl text-left transition-colors duration-fast ease-move',
        'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
        'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        // Selection is a wash plus a border, never a size change: a list where the
        // chosen row grows moves every other row and the eye follows the movement
        // instead of the selection.
        selected
          ? 'bg-[var(--bg-brand-alpha-10)] border border-[var(--primary)]'
          : 'bg-[var(--card)] border border-[var(--border)] hover:border-[var(--border-strong)]',
        className,
      )}
    >
      {media && (
        <span className={cn(
          'w-9 h-9 rounded-xl flex items-center justify-center shrink-0 transition-colors duration-fast ease-move',
          selected ? 'bg-[var(--primary)] text-[var(--primary-foreground)]' : 'bg-muted text-muted-foreground',
        )}>
          {media}
        </span>
      )}

      <span className="flex-1 min-w-0">
        <span className="block ts-body-base-emphasis">{label}</span>
        {description && (
          <span className="block ts-body-small text-muted-foreground leading-snug mt-0.5">{description}</span>
        )}
      </span>

      {/* Trailing radio. Decorative — aria-checked on the row carries the state. */}
      <span
        aria-hidden="true"
        className={cn(
          'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors duration-fast ease-move',
          selected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]',
        )}
      >
        {selected && <Check size={10} strokeWidth={3} className="text-[var(--primary-foreground)]" />}
      </span>
    </button>
  )
}
