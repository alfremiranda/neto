import type { Meta, StoryObj } from '@storybook/react-vite'
import { Landmark, PiggyBank } from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from './empty'
import { Button } from './button'

const meta = { title: 'Feedback/Empty', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **Two medias**: with an icon, or none.
 * - **The dashed border is deliberate**: it says "this container is real but has nothing in
 *   it", which is different from a solid border, and a solid one would read as a card.
 * - **Title and description are required**; the action is optional and only belongs when
 *   there is something the user can do right now to fill it.
 * - It goes INSIDE the container that is empty, not in its place: the list still exists.
 */
export const WithIcon: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><Landmark size={14} /></EmptyMedia>
          <EmptyTitle>Sin cuentas</EmptyTitle>
          <EmptyDescription>Crea una cuenta para registrar saldos y movimientos</EmptyDescription>
        </EmptyHeader>
        <EmptyContent>
          <Button size="sm">Nueva cuenta</Button>
        </EmptyContent>
      </Empty>
    </div>
  ),
}

/** No action: there is nothing the user can do here, only an explanation of why it is empty. */
export const WithoutAction: Story = {
  render: () => (
    <div style={{ maxWidth: 460 }}>
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><PiggyBank size={14} /></EmptyMedia>
          <EmptyTitle>Sin movimientos</EmptyTitle>
          <EmptyDescription>
            Los ingresos, gastos y transferencias vinculados a esta cuenta aparecerán aquí
          </EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
}

/** Embedded: `border-0` once it lives inside a card that already has its own edges. */
export const InsideACard: Story = {
  render: () => (
    <div className="rounded-xl border border-[var(--border)] bg-[var(--card)] p-4" style={{ maxWidth: 460 }}>
      <div className="ts-heading-group mb-2">Provisiones</div>
      <Empty className="border-0 py-2">
        <EmptyHeader>
          <EmptyMedia variant="icon"><PiggyBank size={14} /></EmptyMedia>
          <EmptyTitle>Sin provisiones este mes</EmptyTitle>
          <EmptyDescription>Ningún ingreso de este mes tiene "Aplicar provisiones" activado</EmptyDescription>
        </EmptyHeader>
      </Empty>
    </div>
  ),
}
