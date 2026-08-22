import { cn } from '@/lib/utils'

/**
 * Spinner (`Components · Feedback` → `Spinner`).
 *
 * Figma's recipe is a solid head over a 20% track, at 16px (S) or 24px (M). That
 * part is reproduced exactly.
 *
 * Where this departs: Figma models the colour as a `Color = Light | Dark` variant
 * bound to `spinner/{track,head}/on-{light,dark}`. In code the default is
 * `currentColor`, because `TASK-2026-08-19-consentimiento` asks for the spinner
 * inside a pressed button to inherit its label's colour — and inheriting cannot
 * disagree with the label, while a two-option variant can: an outline danger
 * button has a red label and neither named tone is red.
 *
 * The named tones stay available for a spinner that sits on its own, with no
 * label to take a colour from. Reported in Q-2026-08-22.
 */
const SIZE = { sm: 'w-4 h-4 border-2', md: 'w-6 h-6 border-[3px]' } as const

export function Spinner({ size = 'sm', tone = 'inherit', className, label }: {
  size?: keyof typeof SIZE
  /** `inherit` takes the colour of the surrounding text. */
  tone?: 'inherit' | 'on-light' | 'on-dark'
  className?: string
  /** Announce it. Omit inside a button that already says what it is doing. */
  label?: string
}) {
  const tones = {
    inherit: 'border-current/20 border-t-current',
    'on-light': 'border-[var(--spinner-track-on-light)] border-t-[var(--spinner-head-on-light)]',
    'on-dark': 'border-[var(--spinner-track-on-dark)] border-t-[var(--spinner-head-on-dark)]',
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
