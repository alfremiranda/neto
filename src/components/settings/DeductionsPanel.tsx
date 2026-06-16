import { useState } from 'react'
import { Plus, Trash2, RotateCcw, Pencil, X } from 'lucide-react'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody, DrawerClose } from '@/components/ui/drawer'
import { BASE_LABELS, GROUP_LABELS, MONTH_ABBR, monthsLabel } from '@/data/deductions'
import type { DeductionBase, DeductionConfig, DeductionGroup } from '@/types'

const GROUP_ORDER: DeductionGroup[] = ['ss', 'provision']

const BASE_OPTIONS: { value: DeductionBase; label: string }[] = [
  { value: 'bruto',     label: '% Bruto'   },
  { value: 'fixed_cop', label: 'Fijo COP'  },
  { value: 'fixed_usd', label: 'Fijo USD'  },
]

const PALETTE_OPTIONS = [
  { token: '--n-blue',       label: 'Azul'   },
  { token: '--n-green',      label: 'Verde'  },
  { token: '--n-amber',      label: 'Ámbar'  },
  { token: '--n-pink',       label: 'Rosa'   },
  { token: '--n-lime',       label: 'Lima'   },
  { token: '--n-purple-txt', label: 'Morado' },
]

function getSwatchColor(token: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(token).trim()
}

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
              className={[
                'w-8 h-8 rounded-md text-[11px] font-mono font-semibold border cursor-pointer transition-colors',
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

  const d = state.deduction
  const isEdit = state.mode === 'edit' && d != null
  const locked = d?.locked ?? false

  const [label,  setLabel]  = useState(d?.label  ?? '')
  const [base,   setBase]   = useState<DeductionBase>(d?.base ?? 'bruto')
  const [pct,    setPct]    = useState(d?.pct    ?? 0)
  const [amount, setAmount] = useState(d?.amount ?? 0)
  const [months, setMonths] = useState<number[]>(d?.months ?? [])
  const [color,  setColor]  = useState(d?.color  ?? '--n-green')

  const isFixed = base === 'fixed_cop' || base === 'fixed_usd'

  function handleSave() {
    if (!label.trim()) return
    if (isEdit && d) {
      setDeduction(d.id, {
        label: label.trim(), base,
        pct: isFixed ? 0 : pct,
        amount: isFixed ? amount : undefined,
        months, color,
      })
    } else {
      addDeduction({
        label: label.trim(), group: state.group, base,
        pct: isFixed ? 0 : pct,
        amount: isFixed ? amount : undefined,
        months, enabled: true, color,
      })
    }
    onClose()
  }

  return (
    <Drawer open={state.open} onOpenChange={open => { if (!open) onClose() }} direction="right">
      <DrawerContent className="inset-y-0 right-0 w-full max-w-sm rounded-l-2xl border-l border-[var(--border)]">
        <DrawerHeader>
          <DrawerTitle>{isEdit ? 'Editar deducción' : 'Nueva deducción'}</DrawerTitle>
          <DrawerClose asChild>
            <button className="p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border-none bg-transparent cursor-pointer transition-colors">
              <X size={16} />
            </button>
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
            )}
          </div>

          {/* Value */}
          {!isFixed ? (
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

          {/* Color */}
          {!locked && (
            <div className="space-y-1.5">
              <label className="field-label">Color</label>
              <div className="flex gap-2.5 flex-wrap">
                {PALETTE_OPTIONS.map(p => (
                  <button
                    key={p.token}
                    title={p.label}
                    type="button"
                    onClick={() => setColor(p.token)}
                    className={[
                      'w-7 h-7 rounded-full border-2 cursor-pointer transition-transform hover:scale-110',
                      color === p.token ? 'border-foreground scale-110' : 'border-transparent',
                    ].join(' ')}
                    style={{ background: getSwatchColor(p.token) }}
                  />
                ))}
              </div>
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
      {/* Color swatch */}
      <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `var(${d.color})` }} />

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
      <span className="text-xs font-mono tabular-nums text-right shrink-0 w-14">
        {d.base === 'fixed_cop' ? `$${(d.amount ?? 0).toLocaleString('es-CO')}` :
         d.base === 'fixed_usd' ? `U$${d.amount ?? 0}` :
         `${d.pct}%`}
      </span>

      {/* Switch */}
      <Switch
        checked={d.enabled}
        onCheckedChange={v => setDeduction(d.id, { enabled: v })}
      />

      {/* Edit */}
      <button
        type="button"
        onClick={onEdit}
        className="p-1 rounded-md text-muted-foreground hover:text-foreground hover:bg-muted border-none bg-transparent cursor-pointer transition-colors shrink-0"
        aria-label={`Editar ${d.label}`}
      >
        <Pencil size={13} />
      </button>

      {/* Delete */}
      {!d.locked ? (
        <button
          type="button"
          onClick={handleDelete}
          className={[
            'shrink-0 px-1.5 py-1 rounded-md text-xs border-none bg-transparent cursor-pointer transition-colors',
            confirmDelete
              ? 'bg-destructive text-destructive-foreground font-medium'
              : 'text-muted-foreground hover:text-destructive hover:bg-[var(--n-danger-bg)]',
          ].join(' ')}
          aria-label={`Eliminar ${d.label}`}
        >
          {confirmDelete ? '¿Eliminar?' : <Trash2 size={13} />}
        </button>
      ) : (
        <div className="w-[22px]" />
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
        <button
          type="button"
          onClick={handleReset}
          title="Restablecer valores por defecto"
          className="shrink-0 p-1.5 rounded-lg text-muted-foreground hover:text-foreground hover:bg-muted border-none bg-transparent cursor-pointer transition-colors"
          aria-label="Restablecer deducciones"
        >
          <RotateCcw size={13} />
        </button>
      </div>

      {GROUP_ORDER.map(group => {
        const items = deductions.filter(d => d.group === group)
        return (
          <div key={group}>
            <div className="text-[11px] font-semibold uppercase tracking-widest text-muted-foreground mb-1.5">
              {GROUP_LABELS[group]}
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

            {group !== 'ss' && (
              <button
                type="button"
                onClick={() => openCreate(group)}
                className="mt-2 flex items-center gap-1.5 text-xs text-muted-foreground hover:text-foreground border-none bg-transparent cursor-pointer transition-colors px-1"
              >
                <Plus size={12} />
                Agregar deducción
              </button>
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
