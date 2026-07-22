import { PiggyBank, Calculator, Settings2 } from 'lucide-react'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD, localToday } from '@/lib/format'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { useUIStore } from '@/store/uiStore'

function ProvisionesCardSkeleton() {
  return (
    <SectionCard icon={PiggyBank} title="Provisiones">
      <div className="rounded-lg bg-muted overflow-hidden">
        <div className="px-3 pt-2 pb-0.5">
          <Skeleton className="h-2.5 w-32" />
        </div>
        <div className="px-3">
          {[0, 1, 2].map(i => (
            <div key={i} className="flex items-center gap-2 py-[9px] border-b border-[var(--border)] last:border-0">
              <Skeleton className="h-3.5 flex-1" />
              <Skeleton className="h-3 w-8" />
              <Skeleton className="h-3.5 w-24" />
            </div>
          ))}
        </div>
      </div>
    </SectionCard>
  )
}

export function ProvisionesCard() {
  const hydrated = useHasHydrated()
  if (!hydrated) return <ProvisionesCardSkeleton />
  return <ProvisionesCardContent />
}

function ProvisionesCardContent() {
  const { getCurrentMonth, getSMMLV, curKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { trm: liveTRM } = useLiveTRM()
  const { setView } = useUIStore()

  const month = getCurrentMonth()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc  = calcIBC(month.incomes, month.trm, smmlv)
  const gast = calcGastos(month.egresos || [], month.trm, localToday())
  const provBase = calcProvisionBase(month.incomes, month.trm)
  const res  = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase, smmlv)

  const showUSD      = totUSD > 0
  const transferTRM  = liveTRM ?? month.trm
  const trmNote      = liveTRM
    ? `TRM hoy · ${liveTRM.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
    : undefined
  const provItems = res.provItems.filter(i => i.id !== 'retencion' && i.applies && i.amount > 0)

  const provTotal  = res.provItems.filter(i => i.id !== 'retencion').reduce((a, i) => a + i.amount, 0)
  const grandTotal = provTotal

  const provColor = res.provItems.find(i => i.id !== 'retencion' && i.applies)?.color ?? '--color-tax'

  const totalAction = grandTotal > 0 ? (
    <div className="text-right">
      <div className="text-base font-bold font-heading tabular-nums" style={{ color: `var(${provColor})` }}>
        {COP(grandTotal)}
      </div>
      {showUSD && (
        <div className="text-[10px] text-muted-foreground tabular-nums">{USD(grandTotal / month.trm)}</div>
      )}
    </div>
  ) : undefined

  if (bruto === 0) {
    return (
      <SectionCard icon={PiggyBank} title="Provisiones">
        <Empty className="border-0 py-2">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Calculator size={14} /></EmptyMedia>
            <EmptyTitle>Sin provisiones</EmptyTitle>
            <EmptyDescription>Registra ingresos para calcular primas y cesantías</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SectionCard>
    )
  }

  if (provItems.length === 0) {
    const provEnabled = deductions.some(d => d.group === 'provision' && d.id !== 'retencion' && d.enabled)
    // Enabled but base is 0 → the month's incomes don't opt into provisions.
    if (provEnabled) {
      return (
        <SectionCard icon={PiggyBank} title="Provisiones">
          <Empty className="border-0 py-2">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Calculator size={14} /></EmptyMedia>
              <EmptyTitle>Sin provisiones este mes</EmptyTitle>
              <EmptyDescription>Ningún ingreso de este mes tiene "Aplicar provisiones" activado</EmptyDescription>
            </EmptyHeader>
          </Empty>
        </SectionCard>
      )
    }
    return (
      <SectionCard icon={PiggyBank} title="Provisiones">
        <Empty className="border-0 py-2">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Calculator size={14} /></EmptyMedia>
            <EmptyTitle>Sin provisiones activas</EmptyTitle>
            <EmptyDescription>Activa primas, cesantías o vacaciones en Configuración</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline" onClick={() => setView('config')}>
              <Settings2 size={13} /> Configuración
            </Button>
          </EmptyContent>
        </Empty>
      </SectionCard>
    )
  }

  return (
    <SectionCard icon={PiggyBank} title="Provisiones" action={totalAction}>
      <div className="space-y-2">

        {/* Legal provisions group */}
        {provItems.length > 0 && (
          <div className="rounded-lg bg-muted overflow-hidden">
            <div className="px-3 pt-2 pb-0.5 flex items-center gap-1">
              <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Provisiones legales</span>
              {showUSD && trmNote && (
                <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/50">{trmNote}</span>
              )}
            </div>
            <div className="px-3">
              {provItems.map(item => {
                const badge = item.base === 'fixed_cop' ? 'fijo'
                  : item.base === 'fixed_usd' ? 'fijo USD'
                  : item.base === 'base_usd'  ? `${item.pct}% s/U$${item.amount ?? 0}`
                  : `${item.pct}%`
                return (
                  <div key={item.id} className="py-[9px] border-b border-[var(--border)] last:border-0">
                    <div className="flex items-center gap-2">
                      <span className="flex-1 min-w-0 text-sm text-foreground">{item.label}</span>
                      <span className="text-[10px] text-muted-foreground tabular-nums font-mono shrink-0">{badge}</span>
                      <div className="w-[104px] shrink-0 flex flex-col items-end">
                        <span className="text-sm font-semibold tabular-nums font-mono">{COP(item.amount)}</span>
                        {showUSD && transferTRM > 0 && (
                          <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{USD(item.amount / transferTRM)}</span>
                        )}
                      </div>
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

      </div>
    </SectionCard>
  )
}
