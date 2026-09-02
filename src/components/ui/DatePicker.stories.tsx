import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { DatePicker } from './DatePicker'

const meta = { title: 'Forms/DatePicker', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **No tiene contraparte en Figma y eso es correcto**: Diseño lo retiró del archivo, así
 *   que aquí manda el código. Lo que sí es del sistema es el `calendar` que abre dentro.
 * - **El disparador muestra la fecha en prosa** ("1 de septiembre 2026"), no un formato
 *   ISO: el campo lo lee una persona, no una máquina.
 * - **El valor que emite sí es ISO** (`YYYY-MM-DD`), que es lo que guarda el modelo.
 * - **Comparte la altura de `Input` y `Select`** para alinearse en una fila de formulario.
 * - Es un `button`, no un `input[type=date]`: el nativo abre calendarios distintos en cada
 *   plataforma y ninguno respeta los tokens.
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

/** Vacío — sin fecha elegida todavía. */
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
