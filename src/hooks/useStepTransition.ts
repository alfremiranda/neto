import { useEffect, useRef, useState } from 'react'

/**
 * Cross-fade between onboarding steps (design-system/docs/23-onboarding-motion.md).
 *
 *   outgoing   opacity 1 → 0, translateY 0 → -8px   fast (150ms)  exit
 *   incoming   opacity 0 → 1, translateY 8px → 0    slow (300ms)  enter
 *   incoming starts 40ms after the outgoing begins
 *
 * Going back mirrors the Y: outgoing leaves downward, incoming arrives from above.
 * The direction of travel is the only thing that tells you whether you advanced or
 * retreated, so it is not decoration.
 *
 * Only the content column moves. The rail and the header are the frame the content
 * moves inside, and moving them makes the whole app feel unmoored.
 *
 * First paint does not animate: arriving at the flow shows the first screen already
 * in place. That is why `phase` starts as 'in' rather than 'enter'.
 */
export type Phase = 'in' | 'leaving' | 'entering'

const OUT_MS = 150
const OVERLAP_MS = 40

export function useStepTransition(step: number) {
  const [shown, setShown] = useState(step)
  const [phase, setPhase] = useState<Phase>('in')
  // Direction survives the whole transition, so the incoming half knows which way
  // it should arrive from even after `step` has already settled.
  const [back, setBack] = useState(false)
  const prev = useRef(step)
  const timers = useRef<number[]>([])

  useEffect(() => {
    if (step === prev.current) return
    const goingBack = step < prev.current
    prev.current = step
    setBack(goingBack)
    setPhase('leaving')

    timers.current.forEach(clearTimeout)
    timers.current = [
      // The incoming content starts before the outgoing has finished — the overlap is
      // what makes it read as one movement instead of two.
      window.setTimeout(() => { setShown(step); setPhase('entering') }, OVERLAP_MS),
      window.setTimeout(() => setPhase('in'), OUT_MS + OVERLAP_MS),
    ]
    return () => timers.current.forEach(clearTimeout)
  }, [step])

  /** Classes for the content column.

      `transition-[…]` is not only a property list: Tailwind's transition utilities also
      set a default duration (150ms) and timing function. Wrapping it in `motion-safe:`
      emits it *after* `duration-slow ease-enter` in the stylesheet, so the variant won
      the cascade and the transition silently ran at 150ms on the default curve —
      classes present, values ignored. Measured, not guessed.

      So the property list stays unprefixed (Tailwind emits duration and easing after
      it, which is the order we want) and reduced motion is expressed by dropping the
      transform instead of by swapping the property list. Reduced motion means no
      movement, not no feedback: the opacity change survives, at `instant`. */
  const base = 'transition-[opacity,transform] motion-reduce:transform-none motion-reduce:duration-instant'
  const className =
    phase === 'leaving'
      ? (back
          ? `${base} opacity-0 duration-fast ease-exit translate-y-2`
          : `${base} opacity-0 duration-fast ease-exit -translate-y-2`)
      : phase === 'entering'
        ? (back
            ? 'opacity-0 duration-0 -translate-y-2 motion-reduce:transform-none'
            : 'opacity-0 duration-0 translate-y-2 motion-reduce:transform-none')
        : `${base} opacity-100 translate-y-0 duration-slow ease-enter`

  return { shown, className }
}
