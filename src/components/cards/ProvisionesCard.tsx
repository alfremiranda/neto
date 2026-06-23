import { useState } from 'react'
import { PiggyBank, Plus, Trash2, Pencil, Check, X, Calculator, Settings2, MoreVertical } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { RowActionsSheet } from '@/components/ui/RowActionsSheet'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useUIStore } from '@/store/uiStore'

const INPUT_CLS = 'h-7 text-xs border border-[var(--border)] rounded px-2 bg-[var(--background)] text-[var(--foreground)] focus:outline-none focus:ring-1 focus:ring-[var(--ring)]'

function AddVoluntariaForm({
  onAdd,
  onCancel,
  initial,
}: {
  onAdd: (label: string, amount: number, currency: 'COP' | 'USD') => void
  onCancel: () => void
  initial?: { label: string; amount: number; currency: 'COP' | 'USD' }
}) {
  const [label, setLabel]       = useState(initial?.label ?? '')
  const [amount, setAmount]     = useState(initial ? String(initial.amount) : '')
  const [currency, setCurrency] = useState<'COP' | 'USD'>(initial?.currency ?? 'COP')

  function handleSubmit() {
    const n = parseFloat(amount.replace(/\./g, '').replace(',', '.'))
    if (!label.trim() || isNaN(n) || n <= 0) return
    onAdd(label.trim(), n, currency)
  }

  return (
    <div className="flex items-center gap-1.5 py-1.5">
      <span className="w-1.5 h-1.5 rounded-full bg-[var(--color-provision)] shrink-0" />
      <input
        type="text"
        value={label}
        onChange={e => setLabel(e.target.value)}
        placeholder="Descripción"
        aria-label="Descripción del ahorro"
        className={`flex-1 min-w-0 ${INPUT_CLS}`}
        autoFocus
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <input
        type="number"
        min="0"
        value={amount}
        onChange={e => setAmount(e.target.value)}
        placeholder="0"
        aria-label="Monto"
        className={`w-24 font-mono text-right ${INPUT_CLS}`}
        onKeyDown={e => e.key === 'Enter' && handleSubmit()}
      />
      <Select value={currency} onValueChange={v => setCurrency(v as 'COP' | 'USD')}>
        <SelectTrigger className="w-auto" aria-label="Moneda">
          <SelectValue />
        </SelectTrigger>
        <SelectContent>
          <SelectItem value="COP">COP</SelectItem>
          <SelectItem value="USD">USD</SelectItem>
        </SelectContent>
      </Select>
      <button
        type="button"
        onClick={handleSubmit}
        disabled={!label.trim() || !amount}
        className="h-7 w-7 flex items-center justify-center rounded bg-[var(--primary)] text-primary-foreground disabled:opacity-40 disabled:cursor-not-allowed cursor-pointer transition-opacity shrink-0"
        aria-label="Confirmar"
      >
        <Check size={12} />
      </button>
      <button
        type="button"
        onClick={onCancel}
        className="h-7 w-7 flex items-center justify-center rounded hover:bg-muted text-muted-foreground cursor-pointer transition-colors shrink-0"
        aria-label="Cancelar"
      >
        <X size={12} />
      </button>
    </div>
  )
}

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
  const [sheetOpen, setSheetOpen] = useState(false)
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
        <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar">
          <Pencil size={12} />
        </Button>
        <Button
          variant="ghost" size="icon-sm" onClick={onDelete}
          className="hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]"
          aria-label="Eliminar"
        >
          <Trash2 size={12} />
        </Button>
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-start gap-2 py-2 border-b border-[var(--border)] last:border-0">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="text-base font-bold tabular-nums font-heading">{COP(amtCOP)}</span>
            {usdLabel && <span className="text-[11px] font-semibold tabular-nums font-mono text-muted-foreground">{usdLabel}</span>}
          </div>
          <span className="text-sm text-foreground">{v.label}</span>
        </div>
        <Button
          variant="ghost" size="icon-sm"
          className="shrink-0 mt-0.5"
          onClick={() => setSheetOpen(true)}
          aria-label="Opciones"
        >
          <MoreVertical size={20} />
        </Button>
      </div>

      <RowActionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={v.label}
        subtitle={COP(amtCOP)}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  )
}

export function ProvisionesCard() {
  const { getCurrentMonth, getSMMLV, curKey, addVoluntaria, updateVoluntaria, removeVoluntaria } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { trm: liveTRM } = useLiveTRM()
  const { setView } = useUIStore()
  const [showForm, setShowForm]     = useState(false)
  const [editingId, setEditingId]   = useState<number | null>(null)

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

  function handleAdd(label: string, amount: number, currency: 'COP' | 'USD') {
    addVoluntaria({ label, amount, currency })
    setShowForm(false)
  }

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

  if (provItems.length === 0 && voluntarias.length === 0 && !showForm) {
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
            <Button size="sm" variant="ghost" onClick={() => setShowForm(true)}>
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
              if (editingId === v.id) {
                return (
                  <AddVoluntariaForm
                    key={v.id}
                    initial={v}
                    onAdd={(label, amount, currency) => {
                      updateVoluntaria({ id: v.id, label, amount, currency })
                      setEditingId(null)
                    }}
                    onCancel={() => setEditingId(null)}
                  />
                )
              }
              const amtCOP = v.currency === 'USD' ? v.amount * month.trm : v.amount
              return (
                <VoluntariaRow
                  key={v.id}
                  v={v}
                  amtCOP={amtCOP}
                  showUSD={showUSD}
                  transferTRM={transferTRM}
                  onEdit={() => setEditingId(v.id)}
                  onDelete={() => removeVoluntaria(v.id)}
                />
              )
            })}

            {showForm && (
              <AddVoluntariaForm
                onAdd={handleAdd}
                onCancel={() => setShowForm(false)}
              />
            )}

            {!showForm && (
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setShowForm(true)}
                className="w-full justify-start text-muted-foreground hover:text-foreground gap-1.5 mt-0.5 mb-1"
              >
                <Plus size={12} />
                Agregar ahorro voluntario
              </Button>
            )}
          </div>
        </div>

      </div>
    </SectionCard>
  )
}
