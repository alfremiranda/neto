import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { RowActionsSheet } from './RowActionsSheet'
import { Button } from './button'

const meta = { title: 'Overlays/RowActionsSheet', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **It is a row's action menu ON MOBILE.** On desktop the row edits and deletes in place;
 *   here both live behind one button, because at 390 they do not fit.
 * - **Two states: default and confirming.** The confirmation is the same piece stepping up
 *   in weight — outline → filled — in the same position. It is not a new state or a
 *   separate dialog: moving the button would make the second tap land where nothing was.
 * - **Every row is a `Button` at `Size=XL`** (44), the WCAG 2.5.5 touch target.
 * - **`onDelete` is optional and its absence HIDES the action** rather than leaving it as a
 *   no-op. An account's opening balance is a field on the record, not an entry: there is
 *   nothing for a delete to point at.
 * - The title says which row is being acted on; without it the menu is anonymous.
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
 * No delete: the action is absent. This is the opening-balance case — the pencil opens the
 * account sheet and the bin would have nothing to point at.
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
