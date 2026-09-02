import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'

const meta = { title: 'Overlays/Popover', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **288px wide.** It is not an elastic panel: if the content asks for more, it is
 *   something else.
 * - **Desktop only.** On mobile the same content opens in a `Sheet`, because a popover near
 *   the bottom of a phone ends up covered by the keyboard or by the navigation.
 * - **It is not a `Tooltip`.** That one inverts and explains; this is an anchored content
 *   surface with the popover background and its own border. Confusing them leaves the app
 *   with two languages for one object — it happened, and `TrendChart` was the one speaking
 *   the other.
 * - It opens on click, not on hover, and its content can take focus.
 */
export const Anchored: Story = {
  render: () => (
    <div className="py-6 flex justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">Ver desglose</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="ts-body-base-emphasis">Seguridad social</div>
          <div className="space-y-1">
            {[['Salud (EPS)', '$1.000.000'], ['Pensión', '$1.280.000'], ['ARL', '$41.760']].map(([l, v]) => (
              <div key={l} className="flex items-baseline justify-between">
                <span className="ts-body-small text-muted-foreground">{l}</span>
                <span className="ts-amount-small">{v}</span>
              </div>
            ))}
          </div>
        </PopoverContent>
      </Popover>
    </div>
  ),
}

/** With controls inside — unlike a tooltip, the content here takes focus. */
export const WithControls: Story = {
  render: () => (
    <div className="py-6 flex justify-center">
      <Popover>
        <PopoverTrigger asChild>
          <Button size="sm" variant="outline">Filtrar</Button>
        </PopoverTrigger>
        <PopoverContent>
          <div className="ts-body-base-emphasis">Ordenar por</div>
          {['Fecha (recientes)', 'Monto (mayor)', 'Nombre (A–Z)'].map(o => (
            <button key={o} type="button" className="text-left ts-body-base py-1 hover:text-foreground text-muted-foreground">
              {o}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  ),
}
