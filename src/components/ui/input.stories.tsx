import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'
import { Switch } from './switch'
import { IconButton } from './icon-button'
import { Pencil, Trash2, Star } from 'lucide-react'

const meta = { title: 'Forms/Controls', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Inputs: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
      <Input placeholder="Empty" aria-label="Empty" />
      <Input defaultValue="With a value" aria-label="With a value" />
      <Input defaultValue="With an error" aria-invalid aria-label="With an error" />
      <Input defaultValue="Disabled" disabled aria-label="Disabled" />
    </div>
  ),
}

export const Switches: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Switch aria-label="Off" />
      <Switch defaultChecked aria-label="On" />
      <Switch disabled aria-label="Disabled" />
      <Switch defaultChecked disabled aria-label="On and disabled" />
    </div>
  ),
}

export const IconButtons: Story = {
  name: 'Icon buttons',
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map(s => (
        <IconButton key={s} size={s} aria-label={`Edit ${s}`}><Pencil size={14} /></IconButton>
      ))}
      <IconButton variant="ghost" aria-label="Favourite"><Star size={14} /></IconButton>
      <IconButton variant="ghost" aria-label="Delete" className="text-[var(--color-expense-txt)]"><Trash2 size={14} /></IconButton>
      <IconButton disabled aria-label="Disabled"><Pencil size={14} /></IconButton>
    </div>
  ),
}
