import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountColorPicker } from './AccountColorPicker'
import { Field } from './Field'
import type { AccountColor } from '@/lib/accountColor'

const meta = { title: 'Accounts/AccountColorPicker', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * Two explicit rows of six spread across the container, never a wrapping grid: wrap packs
 * eight per row at 372px and changes shape with the width. No caption and no colour name —
 * choosing a colour is a preference, not a task with a right answer, and the check carries
 * the selection. The names survive as each swatch's accessible name.
 */
export const InsideAField: Story = {
  name: 'Inside a Field',
  render: () => {
    const [c, setC] = useState<AccountColor>('purple')
    return (
      <div style={{ maxWidth: 372 }}>
        <Field label="Color">{() => <AccountColorPicker value={c} onChange={setC} />}</Field>
      </div>
    )
  },
}

export const Disabled: Story = {
  render: () => (
    <div style={{ maxWidth: 372 }}>
      <AccountColorPicker value="teal" onChange={() => {}} disabled />
    </div>
  ),
}
