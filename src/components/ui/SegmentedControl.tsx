import { cn } from '@/lib/utils'

/**
 * SegmentedControl (`Components · Forms` → `SegmentedControl` / `Segment`).
 *
 * Read off Figma rather than reconstructed: the container is `bg/chrome` with a
 * `border/subtle` hairline, `radius/full`, `spacing/4` padding and `spacing/2`
 * gap; each segment is `radius/full`, `spacing/10`×`spacing/12`, `spacing/8` gap
 * and `Control/SM` text.
 *
 * The selected segment is a **20% brand wash with a tinted border**, not a solid
 * fill. That difference matters: a solid brand segment needs white text and turns
 * the control into the loudest thing on the screen, which is wrong for a chooser
 * that sits inside a form.
 *
 * Figma models the count as an `Items` variant because a variant set needs a
 * fixed matrix. In code the count is just how many options were passed, so there
 * is nothing to model.
 */
export function SegmentedControl<T extends string>({ options, value, onChange, ariaLabel, className }: {
  options: ReadonlyArray<{ value: T; label: string; icon?: React.ReactNode }>
  value: T
  onChange: (v: T) => void
  ariaLabel: string
  className?: string
}) {
  return (
    <div
      role="radiogroup"
      aria-label={ariaLabel}
      // A grid, not a flex row: the page says "segments FILL the track, so every
      // option is the same width and the control reads as one object rather than
      // as buttons in a row". Flex only shares out *leftover* space, so a track
      // that hugs its content leaves each segment at its own text width — measured
      // 53 and 51 on the currency picker. Equal columns are equal by definition.
      style={{ gridTemplateColumns: `repeat(${options.length}, minmax(0, 1fr))` }}
      className={cn(
        'grid items-center gap-0.5 p-1 rounded-full',
        'bg-[var(--bg-chrome)] border border-[var(--border-subtle)]',
        className,
      )}
    >
      {options.map(o => {
        const selected = o.value === value
        return (
          <button
            key={o.value}
            type="button"
            role="radio"
            aria-checked={selected}
            onClick={() => onChange(o.value)}
            className={cn(
              'flex items-center justify-center gap-2 px-3 py-2.5 rounded-full ts-control-sm',
              'cursor-pointer transition-colors whitespace-nowrap',
              'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              // The border is always drawn, transparent when unselected: without it
              // the segment gains 1px on selection and every sibling shifts.
              'border',
              selected
                ? 'bg-[var(--bg-brand-alpha-20)] border-[var(--border-brand-alpha-50)] text-[var(--fg-on-subtle)]'
                : 'border-transparent text-[var(--fg-subtle)] hover:text-[var(--foreground)]',
            )}
          >
            {o.icon}
            {o.label}
          </button>
        )
      })}
    </div>
  )
}
