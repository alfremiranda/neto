import type { Meta, StoryObj } from '@storybook/react-vite'
import { Skeleton } from './skeleton'

const meta = { title: 'Feedback/Skeleton', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **It takes the shape of what is coming**, never a generic spinner: if what is loading
 *   is a row with an avatar and two lines, the placeholder is that.
 * - It announces nothing on its own; the container communicates the loading state.
 *
 * **Open with Design (Q-2026-09-02):** the component specifies `bg/disabled`, which is
 * `#f1f5f9` — the same value as `bg/surface`, every card in the app. Built to spec and
 * measured, the placeholder vanished on any card, so the code stays on `bg-muted`: not the
 * right token, but the only visible one.
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
