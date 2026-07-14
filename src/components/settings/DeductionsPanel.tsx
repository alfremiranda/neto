import { useState, useEffect } from 'react'
import { Plus, Trash2, RotateCcw, Pencil, X } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DrawerClose } from '@/components/ui/drawer'
import { BASE_LABELS, MONTH_ABBR, monthsLabel } from '@/data/deductions'

const MONTH_FULL = ['Enero','Febrero','Marzo','Abril','Mayo','Junio','Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']
import type { DeductionBase, DeductionConfig, DeductionGroup } from '@/types'

const DISPLAY_SECTIONS: {
  label: string
  filter: (d: DeductionConfig) => boolean
  canAdd: boolean
  addGroup: DeductionGroup
}[] = [
  {
    label:    'Obligaciones tributarias',
    filter:   d => d.group === 'ss' || d.id === 'retencion',
    canAdd:   false,
    addGroup: 'ss',
  },
  {
    label:    'Provisiones voluntarias',
    filter:   d => d.group === 'provision' && d.id !== 'retencion',
    canAdd:   true,
    addGroup: 'provision',
  },
]

const BASE_OPTIONS: { value: DeductionBase; label: string; desc: string }[] = [
  { value: 'neto_ibc',  label: 'Bruto − IBC', desc: 'Sobre el ingreso bruto menos el IBC (base para primas, cesantías, vacaciones)' },
  { value: 'bruto',     label: '% Bruto',      desc: 'Porcentaje sobre el total de ingresos del mes' },
  { value: 'base_usd',  label: 'Base USD',     desc: 'Porcentaje sobre un ingreso fijo en USD × TRM' },
  { value: 'fixed_cop', label: 'Fijo COP',     desc: 'Monto fijo mensual en pesos' },
  { value: 'fixed_usd', label: 'Fijo USD',     desc: 'Monto fijo mensual en dólares' },
]

// ─── Month picker ─────────────────────────────────────────────────────────────

function MonthPicker({ months, onChange }: { months: number[]; onChange: (m: number[]) => void }) {
  function toggle(monthNum: number) {
    onChange(
      months.includes(monthNum)
        ? months.filter(x => x !== monthNum)
        : [...months, monthNum].sort((a, b) => a - b)
    )
  }

  return (
    <div className="space-y-2">
      <div className="flex gap-1.5 flex-wrap">
        {MONTH_ABBR.map((abbr, i) => {
          const monthNum = i + 1
          const active = months.length === 0 || months.includes(monthNum)
          return (
            <button
              key={monthNum}
              type="button"
              onClick={() => toggle(monthNum)}
              aria-label={`${MONTH_FULL[i]}${active ? ' (activo)' : ''}`}
              aria-pressed={active}
              className={[
                'w-10 h-10 rounded-md text-[11px] font-mono font-semibold border cursor-pointer transition-colors',
                active
                  ? 'bg-[var(--primary)] text-primary-foreground border-[var(--primary)]'
                  : 'bg-transparent text-muted-foreground border-[var(--border)] hover:border-[var(--primary)] hover:text-[var(--primary)]',
              ].join(' ')}
            >
              {abbr}
            </button>
          )
        })}
      </div>
      <p className="text-xs text-muted-foreground">
        {months.length === 0
          ? 'Aplica todos los meses. Toca un mes para restringir.'
          : monthsLabel(months)}
      </p>
    </div>
  )
}

// ─── Deduction drawer (create + edit) ────────────────────────────────────────

interface DrawerState {
  open: boolean
  mode: 'create' | 'edit'
  group: DeductionGroup
  deduction: DeductionConfig | null
}

const EMPTY_DRAWER: DrawerState = { open: false, mode: 'create', group: 'provision', deduction: null }

function DeductionDrawer({
  state,
  onClose,
}: {
  state: DrawerState
  onClose: () => void
}) {
  const { addDeduction, setDeduction } = useSettingsStore()
  // Select the stable action, then call it — selecting getAccounts() directly returns
  // a fresh array each render and triggers an infinite re-render loop in zustand v5.
  const accounts = useFinanceStore(s => s.getAccounts)()

  const d = state.deduction
  const isEdit = state.mode === 'edit' && d != null
  const locked = d?.locked ?? false
  // Reserve destination applies to provisions (retención, primas, cesantías, vacaciones)
  const isProvision = state.group === 'provision'
  const destOptions = accounts.filter(a => a.type !== 'credit')

  const [label,  setLabel]  = useState(d?.label  ?? '')
  const [base,   setBase]   = useState<DeductionBase>(d?.base ?? 'bruto')
  const [pct,    setPct]    = useState(d?.pct    ?? 0)
  const [amount, setAmount] = useState(d?.amount ?? 0)
  const [months, setMonths] = useState<number[]>(d?.months ?? [])
  const [destAccount, setDestAccount] = useState(d?.destAccount ?? '')
  const color = d?.color ?? '--color-provision'

  const isFixed   = base === 'fixed_cop' || base === 'fixed_usd'
  const isBaseUsd = base === 'base_usd'

  function handleSave() {
    if (!label.trim()) return
    const savePct    = isFixed ? 0 : pct
    const saveAmount = (isFixed || isBaseUsd) ? amount : undefined
    const saveDest   = isProvision ? (destAccount || undefined) : undefined
    if (isEdit && d) {
      setDeduction(d.id, { label: label.trim(), base, pct: savePct, amount: saveAmount, months, color, destAccount: saveDest })
    } else {
      addDeduction({ label: label.trim(), group: state.group, base, pct: savePct, amount: saveAmount, months, enabled: true, color, destAccount: saveDest })
    }
    onClose()
  }

  const [isMobile, setIsMobile] = useState(() => window.innerWidth < 640)
  useEffect(() => {
    const mq = window.matchMedia('(max-width: 639px)')
    const handler = (e: MediaQueryListEvent) => setIsMobile(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  const direction = isMobile ? 'bottom' : 'right'

  return (
    <Drawer open={state.open} onOpenChange={open => { if (!open) onClose() }} direction={direction}>
      <DrawerContent className={isMobile
        ? 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl border-t border-[var(--border)]'
        : 'inset-y-0 right-0 w-full max-w-sm rounded-l-2xl border-l border-[var(--border)]'
      }>
        <DrawerHeader>
          <DrawerTitle>{isEdit ? 'Editar deducción' : 'Nueva deducción'}</DrawerTitle>
          <DrawerClose asChild>
            <IconButton variant="ghost" size="md" aria-label="Cerrar">
              <X size={16} />
            </IconButton>
          </DrawerClose>
        </DrawerHeader>

        <DrawerBody className="space-y-5">
          {/* Label */}
          <div className="space-y-1.5">
            <label className="field-label">Nombre</label>
            {locked ? (
              <p className="text-sm font-medium">{label}</p>
            ) : (
              <Input
                value={label}
                onChange={e => setLabel(e.target.value)}
                placeholder="Ej. Seguro de vida"
                autoFocus
              />
            )}
          </div>

          {/* Base type */}
          <div className="space-y-1.5">
            <label className="field-label">Tipo de cálculo</label>
            {locked || d?.base === 'ibc' ? (
              <p className="text-sm font-medium">{BASE_LABELS[base]}</p>
            ) : (
              <>
                <Select value={base} onValueChange={v => setBase(v as DeductionBase)}>
                  <SelectTrigger className="w-full">
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {BASE_OPTIONS.map(o => (
                      <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <p className="text-[11px] text-muted-foreground">
                  {BASE_OPTIONS.find(o => o.value === base)?.desc}
                </p>
              </>
            )}
          </div>

          {/* Value fields — depend on base type */}
          {isBaseUsd ? (
            <>
              <div className="space-y-1.5">
                <label className="field-label">Ingreso base (USD)</label>
                <div className="flex items-center gap-2">
                  <span className="text-sm text-muted-foreground shrink-0">U$</span>
                  <Input
                    type="number" min="0" step="100"
                    value={amount}
                    onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                    className="font-mono text-right"
                    placeholder="8800"
                  />
                </div>
                <p className="text-[11px] text-muted-foreground">
                  Solo este ingreso USD se usa como base de cálculo
                </p>
              </div>
              <div className="space-y-1.5">
                <label className="field-label">Porcentaje (%)</label>
                <div className="flex items-center gap-2">
                  <Input
                    type="number" min="0" max="100" step="0.001"
                    value={pct}
                    onChange={e => setPct(parseFloat(e.target.value) || 0)}
                    className="font-mono text-right"
                  />
                  <span className="text-sm text-muted-foreground shrink-0">%</span>
                </div>
              </div>
            </>
          ) : !isFixed ? (
            <div className="space-y-1.5">
              <label className="field-label">Porcentaje (%)</label>
              <div className="flex items-center gap-2">
                <Input
                  type="number" min="0" max="100" step="0.001"
                  value={pct}
                  onChange={e => setPct(parseFloat(e.target.value) || 0)}
                  className="font-mono text-right"
                  disabled={locked}
                />
                <span className="text-sm text-muted-foreground shrink-0">%</span>
              </div>
            </div>
          ) : (
            <div className="space-y-1.5">
              <label className="field-label">Valor fijo ({base === 'fixed_cop' ? 'COP' : 'USD'})</label>
              <div className="flex items-center gap-2">
                <span className="text-sm text-muted-foreground shrink-0">{base === 'fixed_cop' ? '$' : 'U$'}</span>
                <Input
                  type="number" min="0" step={base === 'fixed_cop' ? 1000 : 1}
                  value={amount}
                  onChange={e => setAmount(parseFloat(e.target.value) || 0)}
                  className="font-mono text-right"
                />
              </div>
            </div>
          )}

          {/* Months */}
          <div className="space-y-1.5">
            <label className="field-label">Meses en que aplica</label>
            <MonthPicker months={months} onChange={setMonths} />
          </div>

          {/* Reserve destination — provisions only */}
          {isProvision && (
            <div className="space-y-1.5">
              <label className="field-label">Cuenta de reserva (opcional)</label>
              <Select value={destAccount || '_none'} onValueChange={v => setDestAccount(v === '_none' ? '' : v)}>
                <SelectTrigger className="w-full">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="_none">Sin cuenta de reserva</SelectItem>
                  {destOptions.map(a => (
                    <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>
                  ))}
                </SelectContent>
              </Select>
              <p className="text-[11px] text-muted-foreground">
                Dónde apartas esta provisión (ej. Retención → ARQ Savings). Verás la reserva acumulada y podrás registrar aportes.
              </p>
            </div>
          )}

          {/* Actions */}
          <div className="flex gap-2 pt-2">
            <Button variant="outline" className="flex-1" onClick={onClose}>Cancelar</Button>
            <Button className="flex-1" onClick={handleSave} disabled={!label.trim()}>
              {isEdit ? 'Guardar cambios' : 'Agregar'}
            </Button>
          </div>
        </DrawerBody>
      </DrawerContent>
    </Drawer>
  )
}

// ─── Deduction row ────────────────────────────────────────────────────────────

function DeductionRow({
  d,
  onEdit,
}: {
  d: DeductionConfig
  onEdit: () => void
}) {
  const { setDeduction, removeDeduction } = useSettingsStore()
  const [confirmDelete, setConfirmDelete] = useState(false)

  function handleDelete() {
    if (confirmDelete) {
      removeDeduction(d.id)
    } else {
      setConfirmDelete(true)
      setTimeout(() => setConfirmDelete(false), 3000)
    }
  }

  return (
    <div className={['py-3 border-b border-[var(--border)] last:border-0 flex items-center gap-2.5', !d.enabled ? 'opacity-50' : ''].join(' ')}>
      {/* Label + base badge */}
      <div className="flex-1 min-w-0 flex items-center gap-2 flex-wrap">
        <span className="text-sm font-medium leading-none truncate">{d.label}</span>
        <span className="text-[10px] bg-muted text-muted-foreground px-1.5 py-0.5 rounded font-mono select-none shrink-0">
          {BASE_LABELS[d.base]}
        </span>
      </div>

      {/* Months summary */}
      <span className="text-[10px] text-muted-foreground shrink-0 hidden sm:block">
        {monthsLabel(d.months)}
      </span>

      {/* Value display */}
      <span className="text-xs font-mono tabular-nums text-right shrink-0 w-20">
        {d.base === 'fixed_cop' ? `$${(d.amount ?? 0).toLocaleString('es-CO')}` :
         d.base === 'fixed_usd' ? `U$${d.amount ?? 0}` :
         d.base === 'base_usd'  ? `${d.pct}% U$${d.amount ?? 0}` :
         `${d.pct}%`}
      </span>

      {/* Switch */}
      <Switch
        checked={d.enabled}
        onCheckedChange={v => setDeduction(d.id, { enabled: v })}
      />

      {/* Edit */}
      <IconButton variant="ghost" size="md" onClick={onEdit} aria-label={`Editar ${d.label}`}>
        <Pencil size={13} />
      </IconButton>

      {/* Delete */}
      {!d.locked ? (
        confirmDelete ? (
          <Button variant="destructive" size="sm" onClick={handleDelete} aria-label={`Confirmar eliminación de ${d.label}`}>
            ¿Eliminar?
          </Button>
        ) : (
          <IconButton variant="ghost-danger" size="md" onClick={handleDelete} aria-label={`Eliminar ${d.label}`}>
            <Trash2 size={13} />
          </IconButton>
        )
      ) : (
        <div className="w-7" />
      )}
    </div>
  )
}

// ─── Panel ────────────────────────────────────────────────────────────────────

export function DeductionsPanel() {
  const { deductions, resetDeductions } = useSettingsStore()
  const { showToast } = useUIStore()
  const [drawer, setDrawer] = useState<DrawerState>(EMPTY_DRAWER)

  function openCreate(group: DeductionGroup) {
    setDrawer({ open: true, mode: 'create', group, deduction: null })
  }

  function openEdit(d: DeductionConfig) {
    setDrawer({ open: true, mode: 'edit', group: d.group, deduction: d })
  }

  function handleReset() {
    resetDeductions()
    showToast('Deducciones restablecidas')
  }

  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-3">
        <p className="text-xs text-muted-foreground">
          Activa deducciones y ajusta el tipo de cálculo, meses y monto desde el formulario de edición.
        </p>
        <IconButton
          variant="ghost"
          size="md"
          onClick={handleReset}
          aria-label="Restablecer deducciones"
          title="Restablecer valores por defecto"
        >
          <RotateCcw size={13} />
        </IconButton>
      </div>

      {DISPLAY_SECTIONS.map(section => {
        const items = deductions.filter(section.filter)
        return (
          <div key={section.label}>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              {section.label}
            </div>
            <div className="bg-[var(--background)] rounded-lg border border-[var(--border)] px-3">
              {items.map(d => (
                <DeductionRow key={d.id} d={d} onEdit={() => openEdit(d)} />
              ))}
              {items.length === 0 && (
                <p className="text-xs text-muted-foreground text-center py-4">
                  Sin deducciones en este grupo
                </p>
              )}
            </div>
            {section.canAdd && (
              <Button
                variant="outline"
                size="sm"
                onClick={() => openCreate(section.addGroup)}
                className="mt-2 w-full"
              >
                <Plus size={13} />
                Agregar deducción
              </Button>
            )}
          </div>
        )
      })}

      <p className="text-[11px] text-muted-foreground pt-1">
        <span className="font-mono bg-muted px-1 rounded">IBC</span> = max(40% × ingresos por servicios, SMMLV)
      </p>

      <DeductionDrawer
        key={drawer.deduction?.id ?? 'new'}
        state={drawer}
        onClose={() => setDrawer(EMPTY_DRAWER)}
      />
    </div>
  )
}
