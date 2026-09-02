import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Toast } from './Toast'
import { Button } from './button'
import { useUIStore } from '@/store/uiStore'

const meta = { title: 'Feedback/Toast', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **Confirmación transitoria.** Se invierte contra la página con `bg/inverse` +
 *   `fg/on-inverse`, igual que `Tooltip`: es una capa, no contenido.
 * - **Centrado abajo, por encima de la navegación móvil Y de cualquier sheet abierto.**
 *   Confirmar algo que acaba de pasar dentro de un sheet no sirve si el sheet lo tapa.
 * - **Sin acciones y sin botón de cerrar.** Se va solo. Un toast con un botón es un
 *   diálogo mal vestido, y uno que exige atención debería ser otra cosa.
 * - **No lleva estados de severidad.** Confirma lo que ocurrió; un error necesita quedarse
 *   en pantalla y explicarse, que es justo lo que un toast no hace.
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

/** Disparado a mano, que es como aparece de verdad: después de una acción. */
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
