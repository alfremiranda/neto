import type { Meta, StoryObj } from '@storybook/react-vite'
import { Field } from './Field'
import { Input } from './input'

const meta = { title: 'Forms/Field', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * The label is not optional and never a variant. Before Field, `Input`, `Select` and
 * `DatePicker` let the placeholder carry the field's name — it disappears the moment the
 * user types, and at #94a3b8 it measures 2.56:1 where a real label measures 10.35:1.
 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 360 }}>
      <Field label="No message">
        {id => <Input id={id} placeholder="Ej: Bancolombia Ahorros" />}
      </Field>
      <Field label="With a hint" state="hint" message="Last 4 digits only">
        {id => <Input id={id} placeholder="1234" />}
      </Field>
      <Field label="With an error" state="error" message="Enter an amount above zero">
        {id => <Input id={id} defaultValue="0" aria-invalid />}
      </Field>
    </div>
  ),
}
