import { cn } from '@/lib/utils'

/**
 * One quantity against one limit. Track in `bg/neutral-subtle`, fill in the tone, 8 high,
 * both ends fully rounded.
 *
 * It is NOT DistribucionCard. That one is a breakdown — four fixed segments of one whole,
 * always the same four — and its job is composition. This is one number against a bound.
 * They look alike and mean different things, which is why they are two components.
 *
 * Two tones and only two, because there are two consumers:
 *   · provision — progress toward something you are building up (the retención reserve)
 *   · expense   — a limit being consumed (credit utilisation)
 *
 * Neutral, warning and danger are deliberately not minted. A threshold ("turn red past
 * 80%") is a product rule this component should not own: the consumer picks the tone and
 * the bar draws it. Warning would not work as drawn anyway — bg/tax is amber/400 and
 * measures 1.52:1 against the track in light, where a bar carrying meaning by its
 * boundary needs 3:1.
 *
 * IT NEVER APPEARS WITHOUT ITS NUMBER. Length and colour are all it carries, so alone it
 * fails 1.4.1 and says nothing to anyone who cannot compare two lengths by eye. Both
 * consumers already print the figure, and that is a requirement rather than a
 * coincidence — hence the required `label`, which callers render beside it.
 */
export function Progress({ value, tone, label, className }: {
  /** 0–1. Clamped, so a caller that overshoots draws a full bar rather than a broken one. */
  value: number
  tone: 'provision' | 'expense'
  /** What the bar says in words. Required on purpose — see above. */
  label: string
  className?: string
}) {
  const pct = Math.max(0, Math.min(1, value)) * 100

  return (
    <div
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={Math.round(pct)}
      aria-label={label}
      // INTERIM, flagged to Design: `bg/neutral-subtle` (#f1f5f9) is the SAME value as
      // `bg/surface` in light, which is every card in this app — so the track is invisible
      // on the two surfaces that consume it, and at 0% the whole bar disappears. The spec
      // measured fill-against-track and never track-against-card. The hairline uses
      // `border/subtle`, whose job is exactly a boundary on a surface, so nothing is
      // minted; remove it the moment Design settles the track.
      className={cn('h-2 w-full rounded-full bg-[var(--bg-neutral-subtle)] border border-[var(--border-subtle)] overflow-hidden', className)}
    >
      <div
        className={cn(
          'h-full rounded-full transition-[width] duration-fast ease-move',
          tone === 'provision'
            ? 'bg-[var(--color-provision)]'
            : 'bg-[var(--color-expense)]',
        )}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
