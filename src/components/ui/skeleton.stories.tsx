import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './skeleton'

const meta = { title: 'Feedback/Skeleton', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **Usa `bg/disabled`**, el mismo token que un control deshabilitado, porque los dos
 *   significan "está aquí pero todavía no se puede usar".
 * - **Toma la forma de lo que viene**, nunca un spinner genérico: si lo que carga es una
 *   fila con avatar y dos líneas, el placeholder es eso.
 * - No anuncia nada por sí mismo; el estado de carga lo comunica el contenedor.
 */
export const ShapeOfWhatIsComing: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Fila de movimiento</span>
        <div className="mt-2 flex items-center gap-3">
          <Skeleton className="w-8 h-8 rounded-full shrink-0" />
          <div className="flex-1 space-y-1.5">
            <Skeleton className="h-4 w-2/3" />
            <Skeleton className="h-3 w-1/3" />
          </div>
          <Skeleton className="h-5 w-20" />
        </div>
      </div>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Tarjeta de cuenta</span>
        <div className="mt-2 rounded-xl border border-[var(--border)] p-4 space-y-2">
          <Skeleton className="h-4 w-1/2" />
          <Skeleton className="h-3 w-1/3" />
          <Skeleton className="h-7 w-2/3" />
        </div>
      </div>
    </div>
  ),
}
