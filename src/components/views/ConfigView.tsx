import { useState } from 'react'
import { SlidersHorizontal, Sliders, LogOut, CloudUpload, RefreshCw, Trash2 } from 'lucide-react'
import { DeductionsPanel } from '@/components/settings/DeductionsPanel'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { useAuthStore } from '@/store/authStore'
import { parseCOP, copFormat } from '@/lib/format'
import { DEFAULTS } from '@/data/defaults'
import { Button } from '@/components/ui/button'
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs'

function ParamsTab() {
  const { getSMMLV, saveSMMLV, curKey } = useFinanceStore()
  const { showToast } = useUIStore()
  const [y] = curKey.split('-').map(Number)
  const currentSmmlv = getSMMLV(y)
  const [val, setVal] = useState(copFormat(currentSmmlv))

  function handleSave() {
    const n = parseCOP(val) || DEFAULTS.smmlv
    saveSMMLV(String(y), n)
    setVal(copFormat(n))
    showToast(`SMMLV ${y} guardado`)
  }

  return (
    <div className="space-y-4">
      <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] p-4">
        <label className="block text-xs font-medium text-muted-foreground mb-1.5">
          SMMLV {y} (COP)
        </label>
        <div className="flex items-center gap-3">
          <input
            type="text"
            inputMode="numeric"
            value={val}
            onChange={e => {
              const stripped = e.target.value.replace(/[^\d]/g, '')
              setVal(stripped ? parseInt(stripped).toLocaleString('es-CO') : '')
            }}
            onBlur={handleSave}
            className="flex-1 border border-[var(--input)] rounded-lg px-[10px] py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--ring)]"
          />
          <Button onClick={handleSave}>Guardar</Button>
        </div>
        <p className="text-xs text-muted-foreground mt-2">
          Base mínima para calcular el IBC de seguridad social
        </p>
      </div>
    </div>
  )
}

export function ConfigView() {
  const { user, signOut } = useAuthStore()
  const { forcePushAll, syncFromCloud, nuclearResetCurrentMonth, deduplicateAllMonths, hardResetAllData } = useFinanceStore()
  const { showToast } = useUIStore()
  const [syncing, setSyncing] = useState<'push' | 'pull' | 'nuclear' | 'dedup' | 'hard' | null>(null)

  async function handleHardReset() {
    setSyncing('hard')
    try {
      await hardResetAllData()
      showToast('Reset total completado — todos los datos eliminados local y en la nube')
    } finally {
      setSyncing(null)
    }
  }

  async function handleDedup() {
    setSyncing('dedup')
    try {
      const removed = deduplicateAllMonths()
      const { errors } = await forcePushAll()
      showToast(errors > 0 ? `${removed} duplicados eliminados — ${errors} errores al subir` : `${removed} duplicados eliminados y subidos a la nube`)
    } finally {
      setSyncing(null)
    }
  }

  async function handleNuclearReset() {
    setSyncing('nuclear')
    try {
      nuclearResetCurrentMonth()
      const { errors } = await forcePushAll()
      showToast(errors > 0 ? `Reset completado — ${errors} errores` : 'Mes reiniciado: ingresos y movimientos borrados, 14 egresos restaurados')
    } finally {
      setSyncing(null)
    }
  }

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
          {/* Sync actions */}
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


          {/* Data recovery */}
          <div className="pt-2 border-t border-[var(--border)]">
            <div className="text-xs font-medium text-muted-foreground mb-1">Recuperación de datos</div>
            <div className="flex flex-col gap-2">
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Elimina TODOS los datos de todos los meses, tanto local como en la nube. Irreversible.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleHardReset}
                  disabled={syncing !== null}
                  className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  {syncing === 'hard'
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <Trash2 size={13} />}
                  Reset total (borrar todo)
                </Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Elimina entradas duplicadas en todos los meses (ingresos, egresos y movimientos) y sube los datos limpios a la nube.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleDedup}
                  disabled={syncing !== null}
                  className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  {syncing === 'dedup'
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <Trash2 size={13} />}
                  Deduplicar todos los meses
                </Button>
              </div>
              <div>
                <p className="text-xs text-muted-foreground mb-2">
                  Borra todos los ingresos y movimientos del mes actual. Restaura los 14 egresos conocidos de junio. Requiere re-ingresar ingresos manualmente.
                </p>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleNuclearReset}
                  disabled={syncing !== null}
                  className="text-destructive border-destructive/40 hover:bg-destructive/10 hover:text-destructive"
                >
                  {syncing === 'nuclear'
                    ? <RefreshCw size={13} className="animate-spin" />
                    : <Trash2 size={13} />}
                  Reiniciar mes actual (nuclear)
                </Button>
              </div>
            </div>
          </div>

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
