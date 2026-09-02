import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './switch'

const meta = { title: 'Forms/Switch', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **Four states**: off, on, and each of them disabled.
 * - **Track 36×20, thumb 16.**
 * - **The off track is an alpha** (black 20% light, white 30% dark) so it reads on any
 *   surface — a solid grey disappears on a grey card.
 * - It is for a boolean setting that applies immediately. If it needs confirming, it is not
 *   a switch.
 * - It needs a label: the control alone does not say what is being turned on.
 */
export const States: Story = {
  render: () => {
    const [a, setA] = useState(false)
    const [b, setB] = useState(true)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
        {[
          { label: 'Apagado',                el: <Switch checked={a} onCheckedChange={setA} /> },
          { label: 'Encendido',              el: <Switch checked={b} onCheckedChange={setB} /> },
          { label: 'Apagado · deshabilitado',   el: <Switch checked={false} disabled /> },
          { label: 'Encendido · deshabilitado', el: <Switch checked disabled /> },
        ].map(r => (
          <div key={r.label} className="flex items-center justify-between">
            <span className="ts-body-base">{r.label}</span>
            {r.el}
          </div>
        ))}
      </div>
    )
  },
}

/** How it actually appears: with its label and an explanation of what changes. */
export const InAForm: Story = {
  render: () => {
    const [on, setOn] = useState(true)
    return (
      <div className="flex items-center justify-between py-1 gap-3" style={{ maxWidth: 420 }}>
        <div>
          <div className="ts-body-base-emphasis">Recurrente</div>
          <div className="ts-body-small text-muted-foreground">
            Se copiará al siguiente mes · si tiene fecha futura, no se suma al total hasta que llegue
          </div>
        </div>
        <Switch checked={on} onCheckedChange={setOn} />
      </div>
    )
  },
}
