import type { Meta, StoryObj } from '@storybook/react-vite'
import { Landmark, TrendingUp, PiggyBank } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { Button } from './button'

const meta = { title: 'Containers/SectionCard', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const Rows = () => (
  <div className="space-y-1">
    {[['Salud (EPS)', '$1.000.000'], ['Pensión obligatoria', '$1.280.000'], ['ARL', '$41.760']].map(([l, v]) => (
      <div key={l} className="flex items-baseline justify-between py-1">
        <span className="ts-body-base">{l}</span>
        <span className="ts-amount-base">{v}</span>
      </div>
    ))}
  </div>
)

/**
 * ## Acceptance criteria
 *
 * - **The most used container in the product** — ten files import it. Any change here shows
 *   up across the whole app, which is why it takes no convenience variants.
 * - **One axis: `Action` or no action.** An icon + title header, with an optional action on
 *   the right.
 * - **The title uses the section heading style**, not a hand-picked size.
 * - **The action is ONE thing**, right-aligned: a total, a button, a control. Two actions
 *   competing there turn the header into a toolbar.
 * - Content goes in as-is; the card imposes no inner padding on its children beyond its own.
 */
export const WithAndWithoutAction: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
      <SectionCard icon={Landmark} title="Obligaciones tributarias">
        <Rows />
      </SectionCard>

      <SectionCard
        icon={Landmark}
        title="Obligaciones tributarias"
        action={
          <div className="text-right">
            <div className="ts-amount-large text-[var(--color-tax-txt)]">$2.321.760</div>
            <div className="ts-amount-micro text-muted-foreground">USD 583,12</div>
          </div>
        }
      >
        <Rows />
      </SectionCard>

      <SectionCard
        icon={PiggyBank}
        title="Retención 2026"
        action={<Button size="sm" variant="outline">Transferir</Button>}
      >
        <div className="ts-body-small text-muted-foreground">
          La acción también puede ser un control, no solo una cifra.
        </div>
      </SectionCard>
    </div>
  ),
}

/** A long title does not push the action out: the header shares the space, it does not overflow. */
export const LongTitle: Story = {
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <SectionCard
        icon={TrendingUp}
        title="Tendencia de los últimos ocho meses por categoría"
        action={<div className="ts-amount-large">$41.120.125</div>}
      >
        <Rows />
      </SectionCard>
    </div>
  ),
}
