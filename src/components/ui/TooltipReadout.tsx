import { cn } from '@/lib/utils'

/**
 * The data readout that goes inside a Tooltip.
 *
 * The bubble is NOT forked for this. Tooltip owns the surface, the arrow, the inversion
 * and the 320 cap; only what sits inside it swaps — `TooltipText` for a sentence, this
 * for a table. Forking would have put the inversion in two places.
 */
export type SwatchTone =
  | 'tax' | 'expense' | 'net' | 'provision' | 'income' | 'balance' | 'debt'

export interface ReadoutRowData {
  label: string
  value: string
  /** Series colour. Named, never a raw value — see the note on the token below. */
  tone?: SwatchTone
  /** Draws the group boundary ABOVE this row. */
  divider?: boolean
  dim?: boolean
}

/**
 * `readout/swatch/*` is ONE value per series, identical in light and dark — not the
 * series' own two-mode pair.
 *
 * A chip that followed the mode would be painted against the surface it was NOT chosen
 * for: `bg/inverse` is slate/900 in light and WHITE in dark, so the light-mode series
 * colours land on white in dark mode. Design measured all five against it and every one
 * fails 3:1 in dark (tax at 1.44), income failing in light too. The chart's own line does
 * not change — that one lives on the card, not in the bubble.
 */
const SWATCH: Record<SwatchTone, string> = {
  tax:        'var(--readout-swatch-tax)',
  expense:    'var(--readout-swatch-expense)',
  net:        'var(--readout-swatch-net)',
  provision:  'var(--readout-swatch-provision)',
  income:     'var(--readout-swatch-income)',
  balance:    'var(--readout-swatch-balance)',
  debt:       'var(--readout-swatch-debt)',
}

export function ReadoutRow({ label, value, tone, divider, dim }: ReadoutRowData) {
  return (
    <div
      className={cn(
        'flex items-baseline gap-3',
        // The boundary belongs to the row that OPENS the group, drawn above it. Modelled
        // as a fake `{separator: true}` item it was an entry with no label and no value
        // sitting in a list of label/value pairs.
        divider && 'border-t border-[var(--border-on-inverse)] mt-1.5 pt-1.5',
        dim && 'opacity-50',
      )}
    >
      {tone && (
        <span
          className="w-2 h-2 rounded-[3px] shrink-0 self-center"
          style={{ background: SWATCH[tone] }}
        />
      )}
      <span className="ts-detail-large text-[var(--fg-on-inverse-subtle)] flex-1 truncate">
        {label}
      </span>
      <span className="ts-amount-small shrink-0">{value}</span>
    </div>
  )
}

export function TooltipReadout({ title, rows }: { title?: string; rows: ReadoutRowData[] }) {
  return (
    <div className="min-w-[168px]">
      {title && <div className="ts-body-small-emphasis mb-2">{title}</div>}
      <div className="space-y-0.5">
        {rows.map((r, i) => <ReadoutRow key={`${r.label}-${i}`} {...r} />)}
      </div>
    </div>
  )
}
