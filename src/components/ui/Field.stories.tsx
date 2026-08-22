import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from './Field'
import { Input } from './input'

const meta = { title: 'Formularios/Field', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * The label is not optional and never a variant. Before Field, `Input`, `Select` and
 * `DatePicker` let the placeholder carry the field's name — it disappears the moment the
 * user types, and at #94a3b8 it measures 2.56:1 where a real label measures 10.35:1.
 */
export const Estados: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Field label="Sin mensaje">
        {id => <Input id={id} placeholder="Ej: Bancolombia Ahorros" />}
      </Field>
      <Field label="Con pista" state="hint" message="Solo los últimos 4 dígitos">
        {id => <Input id={id} placeholder="1234" />}
      </Field>
      <Field label="Con error" state="error" message="Ingresa un monto mayor que cero">
        {id => <Input id={id} defaultValue="0" aria-invalid />}
      </Field>
    </div>
  ),
}
