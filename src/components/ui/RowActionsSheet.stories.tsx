import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RowActionsSheet } from './RowActionsSheet'
import { Button } from './button'

const meta = { title: 'Overlays/RowActionsSheet', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **Es el menú de acciones de una fila EN MÓVIL.** En escritorio la fila edita y borra en
 *   sitio; aquí las dos viven detrás de un botón, porque a 390 no caben.
 * - **Dos estados: por defecto y confirmando.** La confirmación es la misma pieza subiendo
 *   de peso —outline → filled— en la misma posición. No es un estado nuevo ni un diálogo
 *   aparte: mover el botón haría que el segundo toque cayera donde antes no había nada.
 * - **Cada fila es un `Button` a `Size=XL`** (44), el objetivo táctil de WCAG 2.5.5.
 * - **`onDelete` es opcional y su ausencia OCULTA la acción**, no la deja como un no-op. El
 *   saldo inicial de una cuenta es un campo del registro, no un asiento: no hay nada a lo
 *   que un borrado pueda apuntar.
 * - El título dice sobre qué fila se está actuando; sin él el menú es anónimo.
 */
export const Default: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ maxWidth: 420 }}>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Abrir acciones</Button>
        <RowActionsSheet
          open={open}
          onOpenChange={setOpen}
          title="Arriendo"
          subtitle="Sep 1 · Sep 2026"
          onEdit={() => setOpen(false)}
          onDelete={() => setOpen(false)}
        />
      </div>
    )
  },
}

/**
 * Sin borrado: la acción no aparece. Es el caso del saldo inicial — el lápiz abre la hoja de
 * la cuenta y la papelera no tendría a qué apuntar.
 */
export const WithoutDelete: Story = {
  render: () => {
    const [open, setOpen] = useState(false)
    return (
      <div style={{ maxWidth: 420 }}>
        <Button size="sm" variant="outline" onClick={() => setOpen(true)}>Abrir (saldo inicial)</Button>
        <RowActionsSheet
          open={open}
          onOpenChange={setOpen}
          title="Saldo inicial"
          onEdit={() => setOpen(false)}
        />
      </div>
    )
  },
}
