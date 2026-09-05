import { useEffect } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { UpdatePrompt } from './UpdatePrompt'
import { useUIStore } from '@/store/uiStore'

const meta = { title: 'Feedback/UpdatePrompt', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **It exists because `registerType: 'prompt'` WAITS.** A new worker installs and stays
 *   in `waiting` until something tells it to take over — it does not apply on the next
 *   launch. Without an offer to accept, every build after the first was downloaded and
 *   never served, and no prompt appeared because none was wired.
 * - **It is not a `Toast`.** A toast confirms something that already happened, carries no
 *   action and leaves on its own. This asks for one and stays until answered.
 * - **Applying is a user gesture, on purpose.** The reload it triggers cannot land in the
 *   middle of an OAuth callback, which is what broke mobile login when the worker updated
 *   itself.
 * - **Hidden until a build is actually waiting** — it renders nothing without the flag.
 * - It sits above the mobile navigation, like the toast, so it is not covered.
 */
export const Waiting: Story = {
  render: () => {
    const setUpdateReady = useUIStore(s => s.setUpdateReady)
    useEffect(() => {
      setUpdateReady(() => window.alert('updateSW(true) — recarga con el build nuevo'))
    }, [setUpdateReady])
    return (
      <div style={{ height: 140 }}>
        <p className="ts-body-small text-muted-foreground">
          Anclado al borde inferior de la ventana, no de este bloque.
        </p>
        <UpdatePrompt />
      </div>
    )
  },
}

/** Nothing waiting: the component renders nothing at all. */
export const Idle: Story = {
  render: () => {
    const reset = useUIStore.setState
    useEffect(() => { reset({ updateReady: false, applyUpdate: null }) }, [reset])
    return (
      <div style={{ height: 80 }}>
        <p className="ts-body-small text-muted-foreground">Sin build esperando — no hay nada que mostrar.</p>
        <UpdatePrompt />
      </div>
    )
  },
}
