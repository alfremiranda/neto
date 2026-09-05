import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * The offer to take a new build.
 *
 * It exists because `registerType: 'prompt'` installs a new worker and then WAITS — it
 * does not apply on the next launch, which is what the registration used to claim. Without
 * something to accept, every build after the first was downloaded and never served.
 *
 * It is not a `Toast`: a toast confirms something that already happened, carries no action
 * and leaves on its own. This asks for one and has to stay until answered.
 *
 * Applying reloads the page, and that reload is the reason this is a button rather than
 * automatic — a user gesture cannot land in the middle of an OAuth callback, which is what
 * broke mobile login when the worker updated itself.
 */
export function UpdatePrompt() {
  const { updateReady, applyUpdate } = useUIStore()
  if (!updateReady || !applyUpdate) return null

  return (
    <div
      role="status"
      className={cn(
        'fixed left-1/2 -translate-x-1/2 z-[120] flex items-center gap-3',
        'bg-[var(--foreground)] text-[var(--card)] pl-5 pr-2 py-2 rounded-full shadow-lg',
        'bottom-6',
        '[.has-mobile-nav_&]:bottom-[calc(68px+env(safe-area-inset-bottom)+10px)]',
      )}
    >
      <span className="ts-body-small">Hay una versión nueva</span>
      <Button size="sm" onClick={applyUpdate}>Actualizar</Button>
    </div>
  )
}
