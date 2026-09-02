import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { SheetBase } from './SheetBase'
import { Button } from './button'
import { Input } from './input'
import { useUIStore } from '@/store/uiStore'

const meta = { title: 'Overlays/SheetBase', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

function Demo({ dirty, label }: { dirty?: boolean; label: string }) {
  const { openSheet, closeSheet, activeSheet } = useUIStore()
  const [text, setText] = useState('')
  const isDirty = dirty ?? text.length > 0
  return (
    <div style={{ maxWidth: 420 }}>
      <Button size="sm" variant="outline" onClick={() => openSheet('egreso')}>{label}</Button>
      {activeSheet === 'egreso' && (
        <SheetBase
          id="egreso"
          title="Agregar gasto"
          dirty={isDirty}
          footer={<Button size="xl" className="w-full" onClick={closeSheet}>Agregar gasto</Button>}
        >
          <div className="space-y-4">
            <div>
              <label className="field-label ts-label-base" htmlFor="sb-desc">Descripción</label>
              <Input id="sb-desc" value={text} onChange={e => setText(e.target.value)} />
            </div>
            <p className="ts-body-small text-muted-foreground">
              {isDirty
                ? 'Con contenido: solo cierra el botón de cerrar.'
                : 'Vacío: se puede descartar tocando fuera o deslizando.'}
            </p>
          </div>
        </SheetBase>
      )}
    </div>
  )
}

/**
 * ## Criterios de aceptación
 *
 * - **Es el panel en el que se abre todo formulario.** En móvil sube desde abajo con su
 *   asa y redondea arriba; en escritorio entra desde la derecha y redondea a la izquierda.
 * - **El pie es opcional**, y cuando existe se queda fijo: el botón principal no se va
 *   scrolleando con el contenido.
 * - **Con trabajo sin guardar (`dirty`) solo cierra su botón de cerrar.** Ni deslizar, ni
 *   tocar fuera, ni Escape. Esto no es una preferencia: en móvil el arrastre no está
 *   confinado al asa, así que tocar un select y resbalar el dedo descartaba el sheet y
 *   tiraba todo lo escrito. Un gesto a un píxel de un toque normal no puede destruir
 *   trabajo.
 * - **Vacío sí se descarta deslizando**, porque no hay nada que perder.
 * - **Se ajusta al teclado en iOS PWA**, donde `dvh`/`vh` mienten: la altura sale de
 *   `screen.height` y del `visualViewport`.
 */
export const Empty: Story = {
  render: () => <Demo dirty={false} label="Abrir vacío" />,
}

/** Con contenido escrito: el gesto ya no lo puede cerrar. Escribe algo y prueba a tocar fuera. */
export const WithUnsavedWork: Story = {
  render: () => <Demo label="Abrir y escribir" />,
}
