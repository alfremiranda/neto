import { Segment } from '@/components/ui/SegmentedControl'
import type { ChartRange as Range, RangeId } from '@/lib/chartRange'

/**
 * The date range under an account chart — the strip of pills every stocks app uses.
 *
 * It composes `Segment` rather than minting a pill of its own, so "selected" means here
 * what it means in every other control in the system.
 *
 * Its length is data, not design: `availableRanges` decides which pills exist, and the
 * caller passes only those. A strip with fewer than two pills is not rendered at all —
 * one option is not a choice.
 *
 * Unlike SegmentedControl it hugs instead of filling a track: the count varies per
 * account, and equal columns over a variable count would make the same control a
 * different width on every page.
 */
export function ChartRange({ ranges, value, onChange }: {
  ranges:   Range[]
  value:    RangeId
  onChange: (id: RangeId) => void
}) {
  if (ranges.length < 2) return null

  return (
    // Scrolls rather than wraps: seven pills at 390px overflow, and a strip that breaks
    // into two rows stops reading as one control.
    <div
      role="radiogroup"
      aria-label="Rango de fechas"
      className="flex items-center gap-1 overflow-x-auto scrollbar-none -mx-1 px-1"
    >
      {ranges.map(r => (
        <Segment
          key={r.id}
          selected={r.id === value}
          label={r.label}
          onClick={() => onChange(r.id)}
        />
      ))}
    </div>
  )
}
