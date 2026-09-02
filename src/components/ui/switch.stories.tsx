import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Switch } from './switch'

const meta = { title: 'Forms/Switch', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **Cuatro estados**: apagado, encendido, y cada uno deshabilitado.
 * - **Pista 36×20, pulgar 16.**
 * - **La pista apagada es un alpha** (negro 20% en claro, blanco 30% en oscuro) para que
 *   se lea sobre cualquier superficie — un gris sólido desaparece sobre una card gris.
 * - Es para un ajuste booleano que se aplica al instante. Si hace falta confirmar, no es
 *   un switch.
 * - Necesita etiqueta: el control solo no dice qué se está encendiendo.
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

/** Cómo aparece de verdad: con su etiqueta y la explicación de lo que cambia. */
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
