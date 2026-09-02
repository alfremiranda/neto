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
 * ## Acceptance criteria
 *
 * - **It is CONTENT, not a second bubble.** The surface, the arrow, the inversion and the
 *   320 cap belong to `Tooltip`; this only goes inside. Forking the bubble would have put
 *   the inversion in two places.
 * - **The chips use `readout/swatch/*`, not the series colour.** `bg/inverse` is slate/900
 *   in light and WHITE in dark, so a chip following the mode would be painted against the
 *   surface it was NOT chosen for: all five series fail 3:1 in dark (tax at 1.44). Each
 *   swatch is one value, identical in both modes.
 * - **The divider belongs to the row that OPENS the group**, drawn above it. There is no
 *   fake `{separator: true}` item sitting in a list of pairs.
 * - **It carries no minimum width.** A one-row readout hugs its content; multi-row ones
 *   line up because the widest row sizes the box.
 * - The title is optional; the rows are not.
 */
export const OneRow: Story = {
  render: () => (
    <Bubble>
      <TooltipReadout title="15 jul 2026" rows={[{ label: 'Saldo', value: '$8.450.000', tone: 'balance' }]} />
    </Bubble>
  ),
}

/** Several series: the widest row sizes the box and the rest line up with it. */
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
 * The group boundary sits on the row that opens it. Here "Neto libre" opens the result, and
 * the rule is drawn above it — there is no label-less, value-less entry in the middle.
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

/** No chip, and one dimmed row — the readout does not force every row to be a series. */
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
