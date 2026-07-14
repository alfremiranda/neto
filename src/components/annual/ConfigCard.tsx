import { Settings, Lock } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { copFormat } from '@/lib/format'
import { SectionCard } from '@/components/ui/SectionCard'

export function ConfigCard() {
  const { getSMMLV, curKey } = useFinanceStore()
  const [y] = curKey.split('-').map(Number)
  const currentSmmlv = getSMMLV(y)

  return (
    <SectionCard icon={Settings} title={`Configuración ${y}`}>
      <label className="field-label">SMMLV {y} (COP)</label>
      <div className="flex items-center gap-2 field-input bg-muted/50">
        <span className="flex-1 font-heading tabular-nums">{copFormat(currentSmmlv)}</span>
        <Lock size={13} className="text-muted-foreground shrink-0" />
      </div>
      <p className="text-xs text-muted-foreground mt-2">
        Valor legal fijado por decreto. Base del IBC mínimo de seguridad social.
      </p>
    </SectionCard>
  )
}
