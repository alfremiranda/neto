import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Landmark } from 'lucide-react'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from './select'
import { Input } from './input'

const meta = { title: 'Forms/Select', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const OPTIONS = [
  { v: 'vivienda', l: 'Vivienda' },
  { v: 'alimentacion', l: 'Alimentación' },
  { v: 'impuestos', l: 'Impuestos' },
]

/**
 * ## Acceptance criteria
 *
 * - **It shares axes and heights with `Input` on purpose**, so the two line up in the same
 *   row. If one changes height, both do.
 * - **Height comes from the `size` prop or from `data-size="none"`, NEVER from an `h-*`
 *   class.** An `h-*` loses to the data attribute's specificity and does nothing, silently
 *   — which is the worst way to not work.
 * - **The value fills the remaining width and truncates with an ellipsis; the icons hug and
 *   never shrink.** A value longer than the field must not widen it.
 * - With a `placeholder` the text uses `fg/placeholder`, distinct from a real value.
 */
export const AlignsWithInput: Story = {
  render: () => {
    const [v, setV] = useState('vivienda')
    return (
      <div className="grid grid-cols-2 gap-3" style={{ maxWidth: 460 }}>
        <div>
          <label className="field-label ts-label-base" htmlFor="sb-a">Categoría</label>
          <Select value={v} onValueChange={setV}>
            <SelectTrigger id="sb-a" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              {OPTIONS.map(o => <SelectItem key={o.v} value={o.v}>{o.l}</SelectItem>)}
            </SelectContent>
          </Select>
        </div>
        <div>
          <label className="field-label ts-label-base" htmlFor="sb-b">Descripción</label>
          <Input id="sb-b" defaultValue="Arriendo" />
        </div>
      </div>
    )
  },
}

/** No value: the placeholder is distinguishable from a real one. */
export const Placeholder: Story = {
  render: () => (
    <div style={{ maxWidth: 260 }}>
      <Select>
        <SelectTrigger className="w-full"><SelectValue placeholder="Sin cuenta asociada" /></SelectTrigger>
        <SelectContent>
          <SelectItem value="banco">Bancolombia</SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

/**
 * **The case that breaks it**: a value longer than the field truncates with an ellipsis and
 * the field does not widen. The icon does not shrink.
 */
export const LongValueTruncates: Story = {
  render: () => (
    <div style={{ maxWidth: 220 }}>
      <Select defaultValue="larga">
        <SelectTrigger className="w-full"><SelectValue /></SelectTrigger>
        <SelectContent>
          <SelectItem value="larga">
            <span className="flex items-center gap-2">
              <Landmark size={13} />
              Bancolombia Ahorros — cuenta principal de nómina
            </span>
          </SelectItem>
        </SelectContent>
      </Select>
    </div>
  ),
}

/** Disabled, and at `sm`, which is the size it shares with `Input` in filter bars. */
export const SizesAndDisabled: Story = {
  render: () => (
    <div className="flex items-end gap-3" style={{ maxWidth: 460 }}>
      <Select defaultValue="vivienda">
        <SelectTrigger size="sm"><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="vivienda">Vivienda</SelectItem></SelectContent>
      </Select>
      <Select defaultValue="vivienda">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="vivienda">Vivienda</SelectItem></SelectContent>
      </Select>
      <Select disabled defaultValue="vivienda">
        <SelectTrigger><SelectValue /></SelectTrigger>
        <SelectContent><SelectItem value="vivienda">Vivienda</SelectItem></SelectContent>
      </Select>
    </div>
  ),
}
