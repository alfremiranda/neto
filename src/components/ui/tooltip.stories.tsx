import type { Meta, StoryObj } from '@storybook/react-vite'
import { Info } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
import { Button } from './button'

const meta = { title: 'Overlays/Tooltip', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const SIDES = ['top', 'right', 'bottom', 'left'] as const

/**
 * ## Acceptance criteria
 *
 * - **It inverts against the page** — `bg/inverse` with `fg/on-inverse` — so it reads as an
 *   overlay and never as part of the content underneath.
 * - **`Side` is where it sits relative to the trigger, and also where the arrow points.**
 *   Those are the same fact.
 * - **Capped at 320.** If the content does not fit in 320, it is not a tooltip.
 * - **`Content` is swappable**: the short sentence by default, or a `TooltipReadout` for
 *   data. The bubble owns the surface, the arrow, the inversion and the cap; what goes
 *   inside changes. Forking the bubble would have put the inversion in two places.
 * - **Desktop only: there is no hover on touch.** Anything a mobile user needs to know must
 *   be visible without it — for a chart that means the selected point's figures go to the
 *   card's metrics too, not only into this bubble.
 */
export const Sides: Story = {
  render: () => (
    <TooltipProvider>
      <div className="grid grid-cols-2 gap-8 place-items-center py-16" style={{ maxWidth: 420 }}>
        {SIDES.map(side => (
          <Tooltip key={side}>
            <TooltipTrigger asChild>
              <Button size="sm" variant="outline">{side}</Button>
            </TooltipTrigger>
            <TooltipContent side={side}>Se paga el mes siguiente</TooltipContent>
          </Tooltip>
        ))}
      </div>
    </TooltipProvider>
  ),
}

/** On an icon, the most common case: the trigger has no text of its own. */
export const OnAnIcon: Story = {
  render: () => (
    <TooltipProvider>
      <div className="py-10 flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <button type="button" aria-label="Qué es el IBC" className="text-muted-foreground">
              <Info size={16} />
            </button>
          </TooltipTrigger>
          <TooltipContent side="top">
            El IBC es el 40% de los ingresos por servicios, con piso en el SMMLV
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
}

/** The 320 cap: a long text wraps rather than stretching the bubble. */
export const MaxWidth: Story = {
  render: () => (
    <TooltipProvider>
      <div className="py-16 flex justify-center">
        <Tooltip>
          <TooltipTrigger asChild>
            <Button size="sm" variant="outline">Texto largo</Button>
          </TooltipTrigger>
          <TooltipContent side="bottom">
            Un pago marcado sale de la cuenta pero no se suma a los gastos del mes, porque ya
            está contado como obligación del mes que la causó.
          </TooltipContent>
        </Tooltip>
      </div>
    </TooltipProvider>
  ),
}
