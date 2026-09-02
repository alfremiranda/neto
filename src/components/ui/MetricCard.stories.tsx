import type { Meta, StoryObj } from '@storybook/react-vite'
import { MetricCard } from './MetricCard'

const meta = { title: 'Containers/MetricCard', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **One figure with its label.** One axis: with `sub` or without.
 * - **It sits on `bg/subtle` and is EMBEDDED inside another card** — it does not stand
 *   alone. That is what separates it from `SectionCard`: that one is the container, this is
 *   a cell inside it.
 * - **The label goes above and the figure below**, not the other way round: you read "what
 *   it is" before "how much".
 * - `sub` is context for the figure (its equivalent in another currency, its percentage),
 *   never a second independent figure.
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

/** Alone, outside a card, to show why it does not stand up: its background is lost. */
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
