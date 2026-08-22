import type { Meta, StoryObj } from '@storybook/react-vite'
import { Input } from './input'
import { Switch } from './switch'
import { IconButton } from './icon-button'
import { Pencil, Trash2, Star } from 'lucide-react'

const meta = { title: 'Formularios/Controles', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Inputs: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10, maxWidth: 360 }}>
      <Input placeholder="Vacío" aria-label="Vacío" />
      <Input defaultValue="Con valor" aria-label="Con valor" />
      <Input defaultValue="Con error" aria-invalid aria-label="Con error" />
      <Input defaultValue="Deshabilitado" disabled aria-label="Deshabilitado" />
    </div>
  ),
}

export const Switches: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      <Switch aria-label="Apagado" />
      <Switch defaultChecked aria-label="Encendido" />
      <Switch disabled aria-label="Deshabilitado" />
      <Switch defaultChecked disabled aria-label="Encendido y deshabilitado" />
    </div>
  ),
}

export const BotonesDeIcono: Story = {
  name: 'Botones de ícono',
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
      {(['sm', 'md', 'lg'] as const).map(s => (
        <IconButton key={s} size={s} aria-label={`Editar ${s}`}><Pencil size={14} /></IconButton>
      ))}
      <IconButton variant="ghost" aria-label="Favorito"><Star size={14} /></IconButton>
      <IconButton variant="ghost" aria-label="Eliminar" className="text-[var(--color-expense-txt)]"><Trash2 size={14} /></IconButton>
      <IconButton disabled aria-label="Deshabilitado"><Pencil size={14} /></IconButton>
    </div>
  ),
}
