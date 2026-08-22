import type { Meta, StoryObj } from '@storybook/react-vite'
import { Spinner } from './Spinner'
import { Button } from './button'

const meta = { title: 'Feedback/Spinner', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Tonos: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 24, alignItems: 'center' }}>
      <Spinner size="sm" /><Spinner size="md" />
      <Spinner tone="default" size="md" />
      <span style={{ background: 'var(--primary)', padding: 12, borderRadius: 8 }}>
        <Spinner tone="on-solid" size="md" />
      </span>
    </div>
  ),
}

/**
 * `inherit` takes the colour of the surrounding text, which is why it cannot disagree
 * with the label the way a two-option variant can — an outline danger button has a red
 * label and neither named tone is red.
 */
export const HeredaElColorDeSuEtiqueta: Story = {
  name: 'Hereda el color de su etiqueta',
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button busy>Filled</Button>
      <Button variant="outline" busy>Outline</Button>
      <Button variant="destructive" busy>Destructive</Button>
      <Button variant="ghost" busy className="text-[var(--color-expense-txt)]">Ghost rojo</Button>
    </div>
  ),
}
