import type { Meta, StoryObj } from '@storybook/react-vite'
import { Info } from 'lucide-react'
import { Tooltip, TooltipTrigger, TooltipContent, TooltipProvider } from './tooltip'
import { Button } from './button'

const meta = { title: 'Overlays/Tooltip', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const SIDES = ['top', 'right', 'bottom', 'left'] as const

/**
 * ## Criterios de aceptación
 *
 * - **Se invierte contra la página** — `bg/inverse` con `fg/on-inverse` — para que se lea
 *   como capa y nunca como parte del contenido de abajo.
 * - **`Side` es dónde se sitúa respecto al disparador, y también hacia dónde apunta la
 *   flecha.** Las dos cosas son el mismo hecho.
 * - **Tope de 320.** Si el contenido no cabe en 320, no es un tooltip.
 * - **`Content` es intercambiable**: la frase corta por defecto, o un `TooltipReadout` para
 *   datos. La burbuja posee la superficie, la flecha, la inversión y el tope; lo de dentro
 *   cambia. Bifurcar la burbuja habría dejado la inversión definida en dos sitios.
 * - **Solo escritorio: en táctil no hay hover.** Lo que un usuario móvil necesite saber
 *   tiene que verse sin él — para una gráfica eso significa que las cifras del punto
 *   seleccionado van también a los metrics de la card, no solo a esta burbuja.
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

/** Sobre un icono, que es el caso más común: el disparador no tiene texto propio. */
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

/** El tope de 320: un texto largo envuelve, no estira la burbuja. */
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
