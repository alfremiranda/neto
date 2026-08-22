import { Check } from 'lucide-react'
import { AccountAvatar } from '@/components/ui/AccountAvatar'
import { ACCOUNT_COLORS, ACCOUNT_COLOR_LABEL, accountColorVars, type AccountColor } from '@/lib/accountColor'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'

/**
 * The twelve-colour grid plus a live preview
 * (design-system/docs/25-account-color.md §5).
 *
 * The preview is the real avatar, not a swatch of the tint. Design tried the
 * tinted disc first and the render killed it: any tint pale enough to sit behind
 * a glyph measures 1.0–1.2:1 against the app canvas, so it is simply not there.
 * The chips therefore show the *accent*, and the pairing is shown by the avatar.
 *
 * The chosen colour is named in words. That is not a courtesy — twelve hues out
 * of the fourteen left over force 11° neighbours (orange/amber, emerald/teal,
 * pink/rose) that are not reliably distinguishable at this size, and WCAG 1.4.1
 * forbids colour as the sole carrier of information.
 */
export function AccountColorPicker({ account, value, onChange, disabled }: {
  account: Pick<Account, 'id' | 'type'>
  value: AccountColor
  onChange: (c: AccountColor) => void
  disabled?: boolean
}) {
  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center gap-2">
        <span id="acc-color-label" className="field-label ts-label-base">Color</span>
        <span className="ts-body-small text-muted-foreground">·&nbsp;{ACCOUNT_COLOR_LABEL[value]}</span>
      </div>

      <div className="flex items-center gap-3">
        <AccountAvatar account={{ ...account, color: value }} size="lg" />

        {/* A fixed six-column grid, not wrapping: 12 chips wrapping against a flexible
            width break 9+3 at this size, and the row length would change with the
            drawer. Two rows of six is the same shape at every width. */}
        <div role="group" aria-labelledby="acc-color-label" className="grid grid-cols-6 gap-1.5">
          {ACCOUNT_COLORS.map(c => (
            <button
              key={c}
              type="button"
              disabled={disabled}
              onClick={() => onChange(c)}
              // The name carries the identity; aria-pressed carries the state.
              aria-label={ACCOUNT_COLOR_LABEL[c]}
              aria-pressed={c === value}
              style={accountColorVars(c)}
              className={cn(
                'w-7 h-7 rounded-full flex items-center justify-center transition-transform',
                'bg-[var(--account-accent)] cursor-pointer border-2',
                'focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
                'disabled:cursor-not-allowed disabled:opacity-50',
                // Selection is a ring drawn outside the chip, never a size change:
                // a grid where the chosen chip grows shifts every other chip and
                // the eye follows the movement instead of the choice.
                c === value
                  ? 'border-[var(--foreground)]'
                  : 'border-transparent hover:border-[var(--border)]',
              )}
            >
              {c === value && (
                <Check size={13} strokeWidth={3} className="text-[var(--account-surface)]" />
              )}
            </button>
          ))}
        </div>
      </div>
    </div>
  )
}
