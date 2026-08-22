import { cn } from '@/lib/utils'

/**
 * Spinner (`Components · Feedback` → `Spinner`).
 *
 * Figma's recipe is a solid head over a 20% track, at 16px (S) or 24px (M). That
 * part is reproduced exactly.
 *
 * The colour departs from the variant model, and Design ratified the departure
 * (A-2026-08-22): `inherit` uses `currentColor`, because a two-option variant *can*
 * disagree with the label and inheriting cannot — an outline danger button has a red
 * label and neither named tone is red.
 *
 * The named tones stay for a spinner with no label to take a colour from.
 */
const SIZE = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-[3px]' } as const

export function Spinner({ size = 'sm', tone = 'inherit', className, label }: {
  size?: keyof typeof SIZE
  /** `inherit` takes the colour of the surrounding text. */
  tone?: 'inherit' | 'default' | 'on-solid'
  className?: string
  /** Announce it. Omit inside a button that already says what it is doing. */
  label?: string
}) {
  const tones = {
    inherit: 'border-current/20 border-t-current',
    // Renamed by Design after I flagged that on-light/on-dark inverted between modes:
    // they described the button, not the surface. `on-solid` is inside a brand button,
    // `default` is a spinner standing on its own.
    default: 'border-[var(--spinner-track-default)] border-t-[var(--spinner-head-default)]',
    'on-solid': 'border-[var(--spinner-track-on-solid)] border-t-[var(--spinner-head-on-solid)]',
  }
  return (
    <span
      role={label ? 'status' : undefined}
      aria-label={label}
      aria-hidden={label ? undefined : 'true'}
      // motion-safe: prefers-reduced-motion removes motion, not feedback — the
      // spinner is the only sign that something is still running, so it keeps
      // turning. Slower, not stopped. (23-onboarding-motion.md)
      className={cn('inline-block rounded-full animate-spin', SIZE[size], tones[tone], className)}
    />
  )
}
