import { useState } from 'react'
import { SlidersHorizontal, Sliders } from 'lucide-react'
import { DeductionsPanel } from '@/components/settings/DeductionsPanel'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
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
            className="flex-1 border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-card text-foreground focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
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
    </div>
  )
}
