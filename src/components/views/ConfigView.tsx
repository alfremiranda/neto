import { useState } from 'react'
import { SlidersHorizontal, Sliders, LogOut, CloudUpload, RefreshCw, Lock } from 'lucide-react'
import { DeductionsPanel } from '@/components/settings/DeductionsPanel'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { copFormat } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function ParamsTab() {
  const { getSMMLV, curKey } = useFinanceStore()
  const [y] = curKey.split('-').map(Number)
  const currentSmmlv = getSMMLV(y)

  return (
    <div className="space-y-4">
      <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          SMMLV {y} (COP)
        </label>
        <div className="flex items-center gap-2 border border-[var(--input)] rounded-lg px-[10px] py-2 bg-muted/50">
          <span className="flex-1 font-heading tabular-nums text-foreground">{copFormat(currentSmmlv)}</span>
          <Lock size={13} className="text-muted-foreground shrink-0" />
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Valor legal fijado por decreto. Base mínima para calcular el IBC de seguridad social.
        </p>
      </div>
    </div>
  )
}

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

      <Tabs defaultValue="parametros">
        <TabsList className="w-full rounded-none bg-transparent border-b border-[var(--border)] p-0 h-auto justify-start gap-0 mb-0">
          <TabsTrigger
            value="parametros"
            className="gap-1.5 rounded-none px-4 pb-3 pt-2 text-sm border-b-2 border-transparent -mb-px data-[state=active]:border-[var(--primary)] data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-foreground"
          >
            <SlidersHorizontal size={13} />
            Parámetros
          </TabsTrigger>
          <TabsTrigger
            value="deducciones"
            className="gap-1.5 rounded-none px-4 pb-3 pt-2 text-sm border-b-2 border-transparent -mb-px data-[state=active]:border-[var(--primary)] data-[state=active]:!bg-transparent data-[state=active]:!shadow-none data-[state=active]:text-foreground"
          >
            <Sliders size={13} />
            Deducciones
          </TabsTrigger>
        </TabsList>

        <TabsContent value="parametros" className="mt-4">
          <ParamsTab />
        </TabsContent>

        <TabsContent value="deducciones" className="mt-4">
          <DeductionsPanel />
        </TabsContent>
      </Tabs>

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
