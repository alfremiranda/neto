import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatePicker } from './DatePicker'

const meta = { title: 'Forms/DatePicker', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **It has no Figma counterpart, and that is correct**: Design retired it from the file,
 *   so the code is the authority here. What IS from the system is the `calendar` it opens.
 * - **The trigger shows the date in prose** ("1 de septiembre 2026"), not an ISO format: a
 *   person reads this field, not a machine.
 * - **The value it emits IS ISO** (`YYYY-MM-DD`), which is what the model stores.
 * - **It shares the height of `Input` and `Select`** so it lines up in a form row.
 * - It is a `button`, not an `input[type=date]`: the native one opens a different calendar
 *   on every platform and none of them honour the tokens.
 */
export const Basic: Story = {
  render: () => {
    const [d, setD] = useState('2026-09-01')
    return (
      <div style={{ maxWidth: 260 }}>
        <label className="field-label ts-label-base" htmlFor="dp">Fecha</label>
        <DatePicker id="dp" value={d} onChange={setD} />
        <p className="ts-body-small text-muted-foreground mt-2">Valor emitido: <code>{d}</code></p>
      </div>
    )
  },
}

/** Empty — no date chosen yet. */
export const NoValue: Story = {
  render: () => {
    const [d, setD] = useState('')
    return (
      <div style={{ maxWidth: 260 }}>
        <DatePicker id="dp-empty" value={d} onChange={setD} />
      </div>
    )
  },
}
