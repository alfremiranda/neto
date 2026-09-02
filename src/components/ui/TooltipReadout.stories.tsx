import type { Meta, StoryObj } from '@storybook/react-vite'
import { TooltipReadout } from './TooltipReadout'
import { TOOLTIP_SURFACE } from './tooltip'
import { cn } from '@/lib/utils'

const meta = { title: 'Overlays/TooltipReadout', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const Bubble = ({ children }: { children: React.ReactNode }) => (
  <div className={cn('shadow-lg', TOOLTIP_SURFACE)}>{children}</div>
)

/**
 * ## Criterios de aceptación
 *
 * - **Es CONTENIDO, no otra burbuja.** La superficie, la flecha, la inversión y el tope de
 *   320 los posee `Tooltip`; esto solo va dentro. Bifurcar la burbuja habría dejado la
 *   inversión definida en dos sitios.
 * - **Los chips usan `readout/swatch/*`, no el color de la serie.** `bg/inverse` es
 *   slate/900 en claro y BLANCO en oscuro, así que un chip que siguiera el modo se pintaría
 *   contra la superficie para la que NO fue elegido: las cinco series fallan 3:1 en oscuro
 *   (tax en 1.44). Cada swatch tiene un solo valor, idéntico en ambos modos.
 * - **El divisor pertenece a la fila que ABRE el grupo**, dibujado encima de ella. No
 *   existe un ítem falso `{separator: true}` en la lista de pares.
 * - **No lleva ancho mínimo.** Un readout de una fila se ajusta a su contenido; los de
 *   varias filas se alinean porque la fila más ancha define la caja.
 * - El título es opcional; las filas no.
 */
export const OneRow: Story = {
  render: () => (
    <Bubble>
      <TooltipReadout title="15 jul 2026" rows={[{ label: 'Saldo', value: '$8.450.000', tone: 'balance' }]} />
    </Bubble>
  ),
}

/** Varias series: la fila más ancha define la caja y las demás se alinean con ella. */
export const Series: Story = {
  render: () => (
    <Bubble>
      <TooltipReadout
        title="Sep '26"
        rows={[
          { label: 'Obligaciones', value: '$13.123.630', tone: 'tax' },
          { label: 'Provisiones',  value: '$8.565.322',  tone: 'provision' },
          { label: 'Gastos',       value: '$4.742.240',  tone: 'expense' },
          { label: 'Neto libre',   value: '$14.688.933', tone: 'net' },
        ]}
      />
    </Bubble>
  ),
}

/**
 * El límite de grupo va en la fila que lo abre. Aquí "Neto libre" abre el resultado, y la
 * regla se dibuja encima de ella — no hay una entrada sin etiqueta ni valor en medio.
 */
export const GroupBoundary: Story = {
  render: () => (
    <Bubble>
      <TooltipReadout
        rows={[
          { label: 'Ingreso bruto',         value: '$41.120.125' },
          { label: '− Oblig. tributarias',  value: '$13.123.630' },
          { label: '− Provisiones',         value: '$8.565.322' },
          { label: '− Gastos',              value: '$4.742.240' },
          { label: 'Neto libre',            value: '$14.688.933', divider: true },
        ]}
      />
    </Bubble>
  ),
}

/** Sin chip y con una fila atenuada — el readout no obliga a que toda fila sea una serie. */
export const PlainAndDim: Story = {
  render: () => (
    <Bubble>
      <TooltipReadout
        title="Agosto 2026"
        rows={[
          { label: 'Salud (EPS)',    value: '$1.000.000' },
          { label: 'Pensión',        value: '$1.280.000' },
          { label: 'No aplica',      value: '$0', dim: true },
        ]}
      />
    </Bubble>
  ),
}
