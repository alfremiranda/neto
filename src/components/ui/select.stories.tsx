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
 * ## Criterios de aceptación
 *
 * - **Comparte ejes y alturas con `Input` a propósito**, para que los dos se alineen en una
 *   misma fila. Si uno cambia de alto, cambian los dos.
 * - **La altura sale del prop `size` o de `data-size="none"`, NUNCA de una clase `h-*`.**
 *   Una `h-*` pierde contra la especificidad del atributo de datos y no hace nada, en
 *   silencio — que es la peor manera de no funcionar.
 * - **El valor llena el ancho restante y trunca con elipsis; los iconos se ajustan y nunca
 *   encogen.** Un valor más largo que el campo no puede ensancharlo.
 * - Con `placeholder` el texto va en `fg/placeholder`, distinto de un valor real.
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

/** Sin valor: el placeholder se distingue de un valor real. */
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
 * **El caso que rompe**: un valor más largo que el campo trunca con elipsis y el campo no
 * se ensancha. El icono no encoge.
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

/** Deshabilitado y con tamaño `sm`, que es el que comparte con `Input` en barras de filtro. */
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
