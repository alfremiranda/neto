import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { MoneyInput } from './MoneyInput'
import { DatePicker } from './DatePicker'
import { Select, SelectTrigger, SelectValue, SelectContent, SelectItem } from './select'
import { Field } from './Field'

const meta = { title: 'Forms/Fields', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * MoneyInput's label used to be a variant, which doubled its matrix for something that is
 * not a state. Worse, its `id` was optional while it emitted `htmlFor={id}` — so every call
 * site that omitted it produced a label pointing at nothing AND a field with no accessible
 * name. It falls back to useId() now; the last story here is that case.
 */
export const Money: Story = {
  render: () => {
    const [a, setA] = useState('8.800')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 340 }}>
        <MoneyInput label="Cupo total" currency="COP" value={a} onChange={setA} />
        <MoneyInput label="With a hint" currency="USD" value="1.450" onChange={() => {}} hint="≈ $5.771.725" />
        <MoneyInput label="With an error" currency="COP" value="0" onChange={() => {}} error="Must be above zero" />
        <MoneyInput label="No explicit id" currency="COP" value="120.000" onChange={() => {}} />
      </div>
    )
  },
}

export const DateAndSelect: Story = {
  name: 'Date and select',
  render: () => {
    const [d, setD] = useState('2026-08-19')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 14, maxWidth: 340 }}>
        <Field label="Fecha de ingreso">{id => <DatePicker id={id} value={d} onChange={setD} />}</Field>
        <Field label="No date">{id => <DatePicker id={id} value="" onChange={() => {}} />}</Field>
        <Field label="Cuenta">
          {id => (
            <Select defaultValue="arq">
              <SelectTrigger id={id} className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                <SelectItem value="arq">ARQ (Observer Hub)</SelectItem>
                <SelectItem value="banco">Bancolombia</SelectItem>
              </SelectContent>
            </Select>
          )}
        </Field>
      </div>
    )
  },
}
