import { useState } from 'react'
import { LogOut, CloudUpload, RefreshCw } from 'lucide-react'
import { DeductionsPanel } from '@/components/settings/DeductionsPanel'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { Button } from '@/components/ui/button'

export function ConfigView() {
  const { user, signOut } = useAuthStore()
  const { forcePushAll, syncFromCloud } = useFinanceStore()
  const { showToast } = useUIStore()
  const [syncing, setSyncing] = useState<'push' | 'pull' | null>(null)

  async function handleForcePush() {
    setSyncing('push')
    try {
      const { pushed, errors } = await forcePushAll()
      showToast(errors > 0 ? `Subidos ${pushed} — ${errors} errores` : `${pushed} registros subidos a la nube`)
    } finally {
      setSyncing(null)
    }
  }

  async function handlePull() {
    setSyncing('pull')
    try {
      await syncFromCloud()
      showToast('Datos actualizados desde la nube')
    } finally {
      setSyncing(null)
    }
  }

  return (
    <div className="max-w-xl mx-auto">
      <h1 className="text-lg font-semibold mb-4">Configuración</h1>

      <DeductionsPanel />

      {/* Sync + account section */}
      {user && (
        <div className="mt-8 pt-6 border-t border-[var(--border)] space-y-4">
          {/* Dev environment warning */}
          {import.meta.env.DEV && (
            <div className="rounded-lg border border-amber-500/40 bg-amber-500/10 px-3 py-2.5 text-xs text-amber-600 dark:text-amber-400">
              <span className="font-semibold">Ambiente de desarrollo</span> — la nube apunta a Supabase dev (vacío).
              No uses "Jalar desde la nube" o perderás los datos locales.
            </div>
          )}
          {/* Sync actions — dev only; pull-to-refresh handles sync in prod */}
          {import.meta.env.DEV && (
            <div>
              <div className="text-xs font-medium text-muted-foreground mb-2">Sincronización</div>
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleForcePush}
                  disabled={syncing !== null}
                  className="flex-1"
                >
                  {syncing === 'push'
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <CloudUpload size={13} />}
                  Subir todo a la nube
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handlePull}
                  disabled={syncing !== null}
                  className="flex-1"
                >
                  {syncing === 'pull'
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <RefreshCw size={13} />}
                  Jalar desde la nube
                </Button>
              </div>
            </div>
          )}

          {/* Account */}
          <div className="flex items-center justify-between pt-2 border-t border-[var(--border)]">
            <div className="min-w-0">
              <div className="text-xs font-medium text-muted-foreground">Cuenta</div>
              <div className="text-sm truncate mt-0.5">{user.email ?? user.user_metadata?.user_name ?? 'Usuario'}</div>
            </div>
            <Button variant="ghost" size="sm" onClick={signOut} className="shrink-0 text-muted-foreground hover:text-foreground">
              <LogOut size={14} />
              Cerrar sesión
            </Button>
          </div>
        </div>
      )}
    </div>
  )
}
