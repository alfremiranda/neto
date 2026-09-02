import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'

const meta = { title: 'Feedback/Progress', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const Row = ({ label, value, tone, note }: {
  label: string; value: number; tone: 'provision' | 'expense'; note: string
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 420 }}>
    <div className="flex items-baseline justify-between">
      <span className="ts-body-small text-muted-foreground">{label}</span>
      <span className="ts-amount-small">{note}</span>
    </div>
    <Progress value={value} tone={tone} label={`${label}: ${note}`} />
  </div>
)

/**
 * ## Acceptance criteria
 *
 * - **Two tones, and only two.** `provision` for something being built up (the reserve);
 *   `expense` for a limit being consumed (the credit line). No neutral, warning or danger:
 *   a threshold ("turn red past 80%") is a product rule this piece must not own — the
 *   consumer picks the tone and the bar draws it.
 * - **It never appears without its number.** Length and colour are all it carries, so on
 *   its own it fails 1.4.1 and says nothing to anyone who cannot compare two lengths by
 *   eye. That is why `label` is required and both consumers print the figure beside it.
 * - **The track is distinguishable from the surface.** It uses `--progress-track`, not
 *   `bg/neutral-subtle`, which is the SAME value as `bg/surface` in light: on a card the
 *   bar disappeared, and at 0% there was nothing left to see at all.
 * - **The value is clamped to 0–1.** A consumer that overshoots draws a full bar, not a
 *   broken one.
 */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row label="Retención reservada" value={0.37} tone="provision" note="37%" />
      <Row label="Cupo usado"          value={0.12} tone="expense"   note="12%" />
    </div>
  ),
}

/**
 * The edges. **0% is the case that matters**: with no fill, the track IS the whole bar, and
 * if it cannot be told from the card there is nothing on screen. Past 1 it clamps.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row label="Sin nada apartado"  value={0}   tone="provision" note="0%" />
      <Row label="Justo al límite"    value={1}   tone="expense"   note="100%" />
      <Row label="Pasado (se recorta)" value={1.4} tone="expense"  note="140%" />
    </div>
  ),
}
