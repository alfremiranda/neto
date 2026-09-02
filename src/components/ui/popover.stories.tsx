import type { Meta, StoryObj } from '@storybook/react-vite'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'

const meta = { title: 'Overlays/Popover', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **288px de ancho.** No es un panel elástico: si el contenido pide más, es otra cosa.
 * - **Solo escritorio.** En móvil el mismo contenido se abre en un `Sheet`, porque un
 *   popover cerca del borde inferior de un teléfono acaba tapado por el teclado o por la
 *   navegación.
 * - **No es un `Tooltip`.** Aquel se invierte y explica; éste es una superficie de contenido
 *   anclada, con el fondo del popover y su propio borde. Confundirlos deja la app con dos
 *   idiomas para el mismo objeto — pasó, y `TrendChart` era el que hablaba el otro.
 * - Se abre por clic, no por hover, y su contenido puede recibir foco.
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

/** Con controles dentro — a diferencia de un tooltip, aquí el contenido recibe foco. */
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
