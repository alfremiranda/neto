import type { Meta, StoryObj } from '@storybook/react-vite'
import { Separator } from './separator'

const meta = { title: 'Elements/Separator', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **A 1px rule on `border/default`**, in both orientations.
 * - **It only separates peers inside ONE container.** Between containers the gap does the
 *   work; a rule there reads as a border that failed.
 * - **The vertical one stretches with its row** (`self-stretch`); it carries no fixed
 *   height.
 * - It is decorative: it announces nothing to a screen reader.
 */
export const Orientations: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 24, maxWidth: 420 }}>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Horizontal — entre pares</span>
        <div className="mt-2 rounded-xl border border-[var(--border)] p-3">
          <div className="ts-body-base py-1">Salud (EPS)</div>
          <Separator />
          <div className="ts-body-base py-1">Pensión obligatoria</div>
          <Separator />
          <div className="ts-body-base py-1">ARL</div>
        </div>
      </div>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Vertical — dentro de una línea</span>
        <div className="mt-2 flex items-center gap-2">
          <span className="ts-detail-large text-muted-foreground">COP</span>
          <Separator orientation="vertical" className="h-3.5" />
          <span className="ts-detail-large text-muted-foreground">0205</span>
          <Separator orientation="vertical" className="h-3.5" />
          <span className="ts-detail-large text-muted-foreground">12% usado</span>
        </div>
      </div>
    </div>
  ),
}
