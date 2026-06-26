import { PiggyBank, Plus, Trash2, Pencil, Calculator, Settings2 } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { useUIStore } from '@/store/uiStore'

// ─── Voluntary savings row (desktop + mobile) ─────────────────────────────────

function VoluntariaRow({
  v, amtCOP, showUSD, transferTRM,
  onEdit, onDelete,
}: {
  v: { id: number; label: string; amount: number; currency: string }
  amtCOP: number
  showUSD: boolean
  transferTRM: number
  onEdit: () => void
  onDelete: () => void
}) {
  const usdLabel = showUSD && transferTRM > 0 ? USD(amtCOP / transferTRM) : null

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-2 py-[9px] border-b border-[var(--border)] last:border-0">
        <span className="flex-1 min-w-0 text-sm text-foreground truncate">{v.label}</span>
        <div className="w-[104px] shrink-0 flex flex-col items-end">
          <span className="text-sm font-semibold tabular-nums font-mono">{COP(amtCOP)}</span>
          {usdLabel && <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{usdLabel}</span>}
        </div>
        <IconButton variant="ghost" size="md" onClick={onEdit} aria-label="Editar">
          <Pencil size={12} />
        </IconButton>
        <IconButton variant="ghost-danger" size="md" onClick={onDelete} aria-label="Eliminar">
          <Trash2 size={12} />
        </IconButton>
      </div>

      {/* Mobile — tappable row opens edit sheet directly */}
      <button
        className="sm:hidden w-full text-left flex items-start gap-2 py-2 border-b border-[var(--border)] last:border-0 active:bg-muted/50 transition-colors"
        onClick={onEdit}
      >
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="text-base font-bold tabular-nums font-heading">{COP(amtCOP)}</span>
            {usdLabel && <span className="text-[11px] font-semibold tabular-nums font-mono text-muted-foreground">{usdLabel}</span>}
          </div>
          <span className="text-sm text-foreground">{v.label}</span>
        </div>
      </button>
    </>
  )
}

export function ProvisionesCard() {
  const { getCurrentMonth, getSMMLV, curKey, removeVoluntaria } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { trm: liveTRM } = useLiveTRM()
  const { setView, openSheet, setEditingVoluntaria } = useUIStore()

  const month = getCurrentMonth()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc  = calcIBC(month.incomes, month.trm, smmlv)
  const gast = calcGastos(month.egresos || [], month.trm)
  const provBase = calcProvisionBase(month.incomes, month.trm, ibc)
  const res  = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase)

  const showUSD      = totUSD > 0
  const transferTRM  = liveTRM ?? month.trm
  const trmNote      = liveTRM
    ? `TRM hoy · ${liveTRM.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
    : undefined
  const provItems = res.provItems.filter(i => i.id !== 'retencion' && i.applies && i.amount > 0)
  const volItems  = res.volItems
  const voluntarias = month.voluntarias ?? []

  const provTotal  = res.provItems.filter(i => i.id !== 'retencion').reduce((a, i) => a + i.amount, 0)
  const volTotal   = volItems.reduce((a, i) => a + i.amount, 0)
  const grandTotal = provTotal + volTotal

  const provColor = res.provItems.find(i => i.id !== 'retencion' && i.applies)?.color ?? '--color-tax'

  function openAdd() { setEditingVoluntaria(null); openSheet('voluntaria') }
  function openEdit(id: number) { setEditingVoluntaria(id); openSheet('voluntaria') }

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

  if (provItems.length === 0 && voluntarias.length === 0) {
    return (
      <SectionCard icon={PiggyBank} title="Provisiones">
        <Empty className="border-0 py-2">
          <EmptyHeader>
            <EmptyMedia variant="icon"><Calculator size={14} /></EmptyMedia>
            <EmptyTitle>Sin provisiones activas</EmptyTitle>
            <EmptyDescription>Activa primas, cesantías o vacaciones en Configuración, o agrega un ahorro voluntario</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" variant="outline" onClick={() => setView('config')}>
              <Settings2 size={13} /> Configuración
            </Button>
            <Button size="sm" variant="ghost" onClick={openAdd}>
              <Plus size={13} /> Ahorro voluntario
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
                  <div key={item.id} className="flex items-center gap-2 py-[9px] border-b border-[var(--border)] last:border-0">
                    <span className="flex-1 min-w-0 text-sm text-foreground">{item.label}</span>
                    <span className="text-[10px] text-muted-foreground tabular-nums font-mono shrink-0">{badge}</span>
                    <div className="w-[104px] shrink-0 flex flex-col items-end">
                      <span className="text-sm font-semibold tabular-nums font-mono">{COP(item.amount)}</span>
                      {showUSD && transferTRM > 0 && (
                        <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{USD(item.amount / transferTRM)}</span>
                      )}
                    </div>
                  </div>
                )
              })}
            </div>
          </div>
        )}

        {/* Voluntary savings group */}
        <div className="rounded-lg bg-muted overflow-hidden">
          <div className="px-3 pt-2 pb-0.5 flex items-center gap-1">
            <span className="text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">Ahorros voluntarios</span>
            {showUSD && trmNote && (
              <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/50">{trmNote}</span>
            )}
          </div>
          <div className="px-3">
            {voluntarias.map(v => {
              const amtCOP = v.currency === 'USD' ? v.amount * month.trm : v.amount
              return (
                <VoluntariaRow
                  key={v.id}
                  v={v}
                  amtCOP={amtCOP}
                  showUSD={showUSD}
                  transferTRM={transferTRM}
                  onEdit={() => openEdit(v.id)}
                  onDelete={() => removeVoluntaria(v.id)}
                />
              )
            })}

            <Button
              variant="ghost"
              onClick={openAdd}
              className="w-full justify-center text-muted-foreground hover:text-foreground gap-2 my-2"
            >
              <Plus size={16} />
              Agregar ahorro voluntario
            </Button>
          </div>
        </div>

      </div>
    </SectionCard>
  )
}
