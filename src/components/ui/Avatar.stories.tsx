import type { Meta, StoryObj } from '@storybook/react-vite'
import { Avatar } from './Avatar'

const meta = { title: 'Elements/Avatar', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * Sizes are 32 · 40 · 48 · 56 and the initials are sized per rung (12 · 14 · 16 · 18),
 * which is why they cannot be one text style. Before this component the same fallback was
 * written in three places at three sizes, and the header shipped 10px where SM says 12.
 */
export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['sm', 'md', 'lg', 'xl'] as const).map(s => (
        <Avatar key={s} size={s} name="Alfredo Miranda" initials="AM" />
      ))}
    </div>
  ),
}

export const Borderless: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      <Avatar size="lg" name="Con borde" initials="CB" />
      <Avatar size="lg" name="Sin borde" initials="SB" bordered={false} />
    </div>
  ),
}
