import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from './Toast'
import { Button } from './button'
import { useUIStore } from '@/store/uiStore'

const meta = { title: 'Feedback/Toast', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **A transient confirmation.** It inverts against the page with `bg/inverse` +
 *   `fg/on-inverse`, like `Tooltip`: it is an overlay, not content.
 * - **Centred at the bottom, above the mobile nav AND above any open sheet.** Confirming
 *   something that just happened inside a sheet is useless if the sheet covers it.
 * - **No actions and no close button.** It leaves on its own. A toast with a button is a
 *   dialog in the wrong clothes, and one that demands attention should be something else.
 * - **It carries no severity states.** It confirms what happened; an error needs to stay on
 *   screen and explain itself, which is exactly what a toast does not do.
 */
export const Visible: Story = {
  render: () => {
    const showToast = useUIStore(s => s.showToast)
    // The store clears it after ~2.2s, so keep re-arming it while the story is open.
    useEffect(() => {
      showToast('Egreso registrado')
      const t = setInterval(() => showToast('Egreso registrado'), 1800)
      return () => clearInterval(t)
    }, [showToast])
    return (
      <div style={{ height: 160 }}>
        <p className="ts-body-small text-muted-foreground">
          Anclado al borde inferior de la ventana, no de este bloque.
        </p>
        <Toast />
      </div>
    )
  },
}

/** Fired by hand, which is how it really appears: after an action. */
export const AfterAnAction: Story = {
  render: () => {
    const showToast = useUIStore(s => s.showToast)
    return (
      <div style={{ height: 160 }}>
        <div className="flex gap-2">
          <Button size="sm" onClick={() => showToast('Egreso registrado')}>Registrar gasto</Button>
          <Button size="sm" variant="outline" onClick={() => showToast('Pago registrado')}>Registrar pago</Button>
        </div>
        <Toast />
      </div>
    )
  },
}
