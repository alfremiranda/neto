import type { Meta, StoryObj } from '@storybook/react-vite'
import { Landmark, PiggyBank } from 'lucide-react'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from './empty'
import { Button } from './button'

const meta = { title: 'Feedback/Empty', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **Dos medias**: con icono o sin ninguna.
 * - **El borde punteado es deliberado**: dice "este contenedor es real pero no tiene
 *   nada dentro", que es distinto de un borde sólido, el cual se leería como una card.
 * - **Título y descripción son obligatorios**; la acción es opcional y solo va cuando hay
 *   algo que el usuario pueda hacer ahora mismo para llenarlo.
 * - Va DENTRO del contenedor que está vacío, no en su lugar: la lista sigue existiendo.
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

/** Sin acción: no hay nada que el usuario pueda hacer aquí, solo explicar por qué está vacío. */
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

/** Embebido: `border-0` cuando ya vive dentro de una card que tiene sus propios bordes. */
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
