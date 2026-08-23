import type { Meta, StoryObj } from '@storybook/react-vite'
import { Button } from './button'

const meta = {
  title: 'Elements/Button',
  parameters: { layout: 'padded' },
} satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Variants: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
      <Button>Guardar</Button>
      <Button variant="outline">Cancelar</Button>
      <Button variant="ghost">Omitir</Button>
      <Button variant="destructive">Eliminar</Button>
      <Button disabled>Deshabilitado</Button>
    </div>
  ),
}

export const Sizes: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, alignItems: 'center', flexWrap: 'wrap' }}>
      <Button size="sm">SM</Button>
      <Button size="default">Default</Button>
      <Button size="lg">LG</Button>
      <Button size="xl">XL</Button>
    </div>
  ),
}

/**
 * `23-onboarding-motion.md` calls this "the single most common way this goes wrong": the
 * label leaves, the spinner is narrower, the button collapses and the layout jumps under
 * the user's finger at the exact moment they are waiting to find out whether it worked.
 *
 * Both buttons carry the same label, so a visual diff shows any width change immediately.
 */
export const Busy: Story = {
  name: 'Busy — must not change width',
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, alignItems: 'flex-start' }}>
      <Button>Autorizar y continuar</Button>
      <Button busy>Autorizar y continuar</Button>
      <Button variant="outline">No acepto</Button>
      <Button variant="outline" busy>No acepto</Button>
    </div>
  ),
}
