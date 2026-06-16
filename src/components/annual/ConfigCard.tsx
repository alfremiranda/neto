import { useState } from 'react'
import { Settings } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { parseCOP, copFormat } from '@/lib/format'
import { DEFAULTS } from '@/data/defaults'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'

export function ConfigCard() {
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
    <SectionCard icon={Settings} title={`Configuración ${y}`}>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="field-label">SMMLV {y} (COP)</label>
          <input
            type="text"
            inputMode="numeric"
            value={val}
            onChange={e => {
              const stripped = e.target.value.replace(/[^\d]/g, '')
              setVal(stripped ? parseInt(stripped).toLocaleString('es-CO') : '')
            }}
            className="field-input font-heading tabular-nums"
          />
        </div>
        <Button onClick={handleSave} className="shrink-0">
          Guardar
        </Button>
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Usado para calcular el IBC mínimo de seguridad social
      </p>
    </SectionCard>
  )
}
