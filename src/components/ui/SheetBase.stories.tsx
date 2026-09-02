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
 * ## Acceptance criteria
 *
 * - **It is the panel every form opens in.** On mobile it rises from the bottom with its
 *   handle and rounds its top corners; on desktop it slides in from the right and rounds
 *   its left ones.
 * - **The footer is optional**, and when it exists it stays put: the primary button does
 *   not scroll away with the content.
 * - **With unsaved work (`dirty`) only its close button closes it.** No swipe, no outside
 *   tap, no Escape. This is not a preference: on mobile the drag is not confined to the
 *   handle, so tapping a select and letting the finger slide dismissed the sheet and threw
 *   away everything typed. A gesture one pixel away from an ordinary tap cannot be allowed
 *   to destroy work.
 * - **An empty sheet DOES swipe away**, because there is nothing to lose.
 * - **It adapts to the keyboard on iOS PWA**, where `dvh`/`vh` lie: the height comes from
 *   `screen.height` and from `visualViewport`.
 */
export const Empty: Story = {
  render: () => <Demo dirty={false} label="Abrir vacío" />,
}

/** With content typed: the gesture can no longer close it. Type something, then tap outside. */
export const WithUnsavedWork: Story = {
  render: () => <Demo label="Abrir y escribir" />,
}
