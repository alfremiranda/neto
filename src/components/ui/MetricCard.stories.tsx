import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricCard } from './MetricCard'

const meta = { title: 'Containers/MetricCard', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **Una cifra con su etiqueta.** Un eje: con `sub` o sin él.
 * - **Vive sobre `bg/subtle`, y va EMBEBIDA dentro de otra card** — no se sostiene sola.
 *   Eso es lo que la separa de `SectionCard`: aquella es el contenedor, ésta es una celda
 *   dentro de él.
 * - **La etiqueta va arriba y la cifra debajo**, no al revés: se lee "qué es" antes que
 *   "cuánto".
 * - `sub` es contexto de la cifra (su equivalente en otra moneda, su porcentaje), nunca
 *   una segunda cifra independiente.
 */
export const WithAndWithoutSub: Story = {
  render: () => (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4" style={{ maxWidth: 520 }}>
      <div className="ts-heading-group mb-3">Resumen anual</div>
      <div className="grid grid-cols-2 gap-3">
        <MetricCard label="Bruto total año" value="$41.120.125" sub={<span className="ts-amount-micro">USD 10.250,00</span>} />
        <MetricCard label="Neto libre acum." value="$14.688.933" />
        <MetricCard label="Obligaciones" value="$13.123.630" sub={<span className="ts-amount-micro">32% del bruto</span>} />
        <MetricCard label="Gastos" value="$4.742.240" sub={<span className="ts-amount-micro">12% del bruto</span>} />
      </div>
    </div>
  ),
}

/** Sola, fuera de una card, para dejar ver por qué no se sostiene: su fondo se pierde. */
export const StandingAlone: Story = {
  render: () => (
    <div style={{ maxWidth: 260 }}>
      <MetricCard label="Saldo actual" value="$3.708.000" />
      <p className="ts-body-small text-muted-foreground mt-2">
        Sobre el fondo de la página el `bg/subtle` casi no se distingue — está pensada para ir
        dentro de una card, no en su lugar.
      </p>
    </div>
  ),
}
