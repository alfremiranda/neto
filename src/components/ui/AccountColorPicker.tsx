import { Check } from 'lucide-react'
import { ACCOUNT_COLORS, ACCOUNT_COLOR_LABEL, accountColorVars, type AccountColor } from '@/lib/accountColor'
import { cn } from '@/lib/utils'

/**
 * The twelve account colours (`Components · Forms` → `AccountColorPicker`).
 *
 * **No caption and no colour name on screen.** Choosing an account colour is a preference,
 * not a task with a right answer, so nothing is lost when two hues are hard to tell apart —
 * and the selection is carried by a check mark rather than by colour, which satisfies
 * WCAG 1.4.1 without words. The names survive as each swatch's accessible name, because a
 * screen-reader user still has to hear something other than "button".
 *
 * **No "in use" marker.** Colours repeat across accounts by design; an unexplained dot on a
 * choice with no wrong answer reads as a restriction. (Approved and then reverted the same
 * day — the revert is the current rule.)
 *
 * **Two explicit rows, not a wrapping grid.** Wrap packs as many as fit and turns into
 * eight per row at this width; six per row is a decision, so it is written as one.
 *
 * Carries no label of its own — wrap it in `Field`.
 */
const ROWS = [ACCOUNT_COLORS.slice(0, 6), ACCOUNT_COLORS.slice(6)] as const

export function AccountColorPicker({ value, onChange, disabled }: {
  value: AccountColor
  onChange: (c: AccountColor) => void
  disabled?: boolean
}) {
  return (
    <div role="radiogroup" aria-label="Color de la cuenta" className="flex flex-col gap-1">
      {ROWS.map((row, i) => (
        <div key={i} className="flex justify-between">
          {row.map(c => (
            <button
              key={c}
              type="button"
              role="radio"
              aria-checked={c === value}
              aria-label={ACCOUNT_COLOR_LABEL[c]}
              disabled={disabled}
              onClick={() => onChange(c)}
              style={accountColorVars(c)}
              // 44px of hit area around a 36px disc: the target is the minimum touch
              // size, the disc is what you see.
              className={cn(
                'w-11 h-11 flex items-center justify-center rounded-full shrink-0',
                'cursor-pointer disabled:cursor-not-allowed disabled:opacity-50',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
              )}
            >
              <span
                aria-hidden="true"
                className={cn(
                  'w-9 h-9 rounded-full flex items-center justify-center bg-[var(--account-accent)]',
                  'border-2 transition-colors duration-fast ease-move',
                  c === value ? 'border-[var(--foreground)]' : 'border-transparent',
                )}
              >
                {c === value && (
                  <Check size={16} strokeWidth={3} className="text-[var(--account-surface)]" />
                )}
              </span>
            </button>
          ))}
        </div>
      ))}
    </div>
  )
}
