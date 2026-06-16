import { useState, useEffect } from 'react'
import { Pencil, Trash2, Plus, Receipt, GripVertical, RefreshCw } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { calcGastos } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { EgresoSheet } from '@/components/sheets/EgresoSheet'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import type { Egreso, Account } from '@/types'

// ─── Category icon bubble ─────────────────────────────────────────────────────

function CategoryIcon({ category }: { category: string }) {
  const cat = EGRESO_CATEGORIAS.find(c => c.id === category)
  if (!cat) return null
  const Icon = cat.icon
  return (
    <span
      className="w-7 h-7 rounded-lg flex items-center justify-center shrink-0"
      style={{ background: `var(${cat.bgColor})`, color: `var(${cat.color})` }}
    >
      <Icon size={13} strokeWidth={2} />
    </span>
  )
}

// ─── Category segmented bar ───────────────────────────────────────────────────

function EgresosBar({ egresos, trm }: { egresos: Egreso[]; trm: number }) {
  const [hovered, setHovered] = useState<string | null>(null)

  const total = egresos.reduce(
    (sum, e) => sum + (e.currency === 'USD' ? e.amount * trm : e.amount), 0
  )
  if (total === 0) return null

  const segments = EGRESO_CATEGORIAS
    .map(cat => {
      const amount = egresos
        .filter(e => e.category === cat.id)
        .reduce((sum, e) => sum + (e.currency === 'USD' ? e.amount * trm : e.amount), 0)
      return { id: cat.id, label: cat.label, color: cat.color, amount, pct: (amount / total) * 100 }
    })
    .filter(s => s.amount > 0)

  return (
    <div className="mt-3 pt-3 border-t border-[var(--border)]">
      {/* Bar */}
      <div className="flex h-2 rounded-full overflow-hidden gap-px">
        {segments.map(seg => (
          <div
            key={seg.id}
            className={cn(
              'transition-opacity duration-150 cursor-default',
              hovered && hovered !== seg.id ? 'opacity-30' : 'opacity-100',
            )}
            style={{ width: `${seg.pct}%`, background: `var(${seg.color})` }}
            onMouseEnter={() => setHovered(seg.id)}
            onMouseLeave={() => setHovered(null)}
          />
        ))}
      </div>

      {/* Legend */}
      <div className="mt-2 flex flex-wrap gap-x-3 gap-y-1 items-center justify-between">
        <div className="flex flex-wrap gap-x-3 gap-y-1">
          {segments.map(seg => (
            <button
              key={seg.id}
              type="button"
              className={cn(
                'flex items-center gap-1.5 bg-transparent border-none p-0 cursor-default transition-opacity',
                hovered && hovered !== seg.id ? 'opacity-30' : 'opacity-100',
              )}
              onMouseEnter={() => setHovered(seg.id)}
              onMouseLeave={() => setHovered(null)}
            >
              <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `var(${seg.color})` }} />
              <span className="text-xs text-muted-foreground">{seg.label}</span>
              <span className="text-xs font-mono font-semibold tabular-nums">{Math.round(seg.pct)}%</span>
            </button>
          ))}
        </div>
        {hovered && (
          <span className="text-xs font-mono font-semibold tabular-nums ml-auto">
            {COP(segments.find(s => s.id === hovered)?.amount ?? 0)}
          </span>
        )}
      </div>
    </div>
  )
}

// ─── Egreso row ───────────────────────────────────────────────────────────────

const MONTH_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(iso: string): string {
  const parts = iso.split('-')
  const m = parseInt(parts[1] ?? '0', 10) - 1
  const d = parseInt(parts[2] ?? '0', 10)
  if (!d) return ''
  return `${d} ${MONTH_SHORT[m] ?? ''}`
}

function EgresoRow({
  egreso, trm, accounts,
  onEdit, onDelete,
  onDragStart, onDragOver, onDrop, onDragEnd,
  isOver, isPendingDelete,
}: {
  egreso: Egreso
  trm: number
  accounts: Account[]
  onEdit: () => void
  onDelete: () => void
  onDragStart: () => void
  onDragOver: (e: React.DragEvent) => void
  onDrop: () => void
  onDragEnd: () => void
  isOver: boolean
  isPendingDelete: boolean
}) {
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  const desc     = egreso.desc || (egreso as any).tipo || '—'
  const category = egreso.category || 'otro'
  const amtCOP   = egreso.currency === 'USD' ? egreso.amount * trm : egreso.amount
  const dateStr  = egreso.date ? fmtDate(egreso.date) : ''
  const acctLabel = egreso.account ? (accounts.find(a => a.id === egreso.account)?.label ?? egreso.account) : null
  const acctVariant = egreso.account
    ? egreso.account.toLowerCase().includes('arq') ? 'arq'
      : egreso.account.toLowerCase().includes('toptal') ? 'toptal'
      : egreso.account.toLowerCase().includes('bancol') ? 'bancol'
      : 'otro'
    : 'otro'

  return (
    <div
      draggable
      onDragStart={onDragStart}
      onDragOver={onDragOver}
      onDrop={onDrop}
      onDragEnd={onDragEnd}
      className={cn(
        'flex items-center gap-2 py-2 border-b border-[var(--border)] last:border-0 group',
        isOver && 'border-t-2 border-t-[var(--primary)] border-b-0',
      )}
    >
      {/* Drag handle */}
      <GripVertical
        size={14}
        className="shrink-0 text-muted-foreground/30 cursor-grab active:cursor-grabbing group-hover:text-muted-foreground/60 transition-colors"
      />

      {/* Category icon bubble */}
      <CategoryIcon category={category} />

      {/* Two-line content block */}
      <div className="flex-1 min-w-0">
        {/* Line 1: description */}
        <span className="block text-sm truncate">{desc}</span>

        {/* Line 2: account + date */}
        <div className="flex items-center gap-1.5 mt-0.5">
          {acctLabel && (
            <Badge variant={acctVariant}>{acctLabel}</Badge>
          )}
          {dateStr && (
            <span className="text-xs text-muted-foreground/60 tabular-nums">{dateStr}</span>
          )}
        </div>
      </div>

      {/* Amount + recurring icon — vertically centered with whole row */}
      <div className="shrink-0 flex items-center gap-1.5 text-right">
        {egreso.recurring && (
          <RefreshCw size={12} className="text-muted-foreground shrink-0" />
        )}
        <div>
          <div className="text-sm font-semibold tabular-nums font-heading">
            {egreso.currency === 'USD' ? USD(egreso.amount) : COP(amtCOP)}
          </div>
          {egreso.currency === 'USD' && (
            <div className="text-[10px] text-muted-foreground tabular-nums">{COP(amtCOP)}</div>
          )}
        </div>
      </div>

      {/* Action buttons — vertically centered with whole row, visible on hover */}
      <div className={cn('flex items-center shrink-0 transition-opacity', isPendingDelete ? 'opacity-100' : 'opacity-0 group-hover:opacity-100')}>
        <Button variant="ghost" size="icon-sm" onClick={onEdit} title="Editar">
          <Pencil size={12} />
        </Button>
        <Button
          data-egreso-confirm={isPendingDelete ? 'true' : undefined}
          variant={isPendingDelete ? 'destructive' : 'ghost'}
          size={isPendingDelete ? 'sm' : 'icon-sm'}
          onClick={onDelete}
          title={isPendingDelete ? 'Confirmar eliminación' : 'Eliminar'}
          className={!isPendingDelete ? 'hover:bg-[var(--n-danger-bg)] hover:text-[var(--n-danger)]' : ''}
        >
          {isPendingDelete ? '¿Eliminar?' : <Trash2 size={12} />}
        </Button>
      </div>
    </div>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function EgresosCard() {
  const { getCurrentMonth, removeEgreso, reorderEgresos, getAccounts } = useFinanceStore()
  const { openSheet, showToast, setEditingEgreso } = useUIStore()
  const [dragIdx, setDragIdx]     = useState<number | null>(null)
  const [overIdx, setOverIdx]     = useState<number | null>(null)
  const [confirmId, setConfirmId] = useState<number | null>(null)

  // Dismiss confirm state when clicking anywhere outside the confirm button
  useEffect(() => {
    if (confirmId === null) return
    const dismiss = (e: MouseEvent) => {
      if (!(e.target as Element).closest('[data-egreso-confirm]')) {
        setConfirmId(null)
      }
    }
    document.addEventListener('mousedown', dismiss)
    return () => document.removeEventListener('mousedown', dismiss)
  }, [confirmId])

  const month    = getCurrentMonth()
  const egresos  = month.egresos || []
  const total    = calcGastos(egresos, month.trm)
  const accounts = getAccounts()

  function handleEdit(id: number) {
    setEditingEgreso(id)
    openSheet('egreso')
  }

  function handleDelete(id: number) {
    if (confirmId === id) {
      removeEgreso(id)
      setConfirmId(null)
      showToast('Egreso eliminado')
    } else {
      setConfirmId(id)
    }
  }

  function handleAdd() {
    setEditingEgreso(null)
    openSheet('egreso')
  }

  function handleDrop(toIdx: number) {
    if (dragIdx === null || dragIdx === toIdx) { setDragIdx(null); setOverIdx(null); return }
    const reordered = [...egresos]
    const [item] = reordered.splice(dragIdx, 1)
    reordered.splice(toIdx, 0, item)
    reorderEgresos(reordered.map(e => e.id))
    setDragIdx(null)
    setOverIdx(null)
  }

  return (
    <>
      <SectionCard
        icon={Receipt}
        title="Egresos del mes"
        action={
          <Button size="sm" onClick={handleAdd}>
            <Plus size={13} />
            Agregar
          </Button>
        }
      >
        {egresos.length === 0 ? (
          <Empty className="border-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Receipt size={14} /></EmptyMedia>
              <EmptyTitle>Sin egresos</EmptyTitle>
              <EmptyDescription>No hay gastos registrados este mes</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={handleAdd}><Plus size={13} />Agregar egreso</Button>
            </EmptyContent>
          </Empty>
        ) : (
          <>
            {egresos.map((e, idx) => (
              <EgresoRow
                key={e.id}
                egreso={e}
                trm={month.trm}
                accounts={accounts}
                onEdit={() => handleEdit(e.id)}
                onDelete={() => handleDelete(e.id)}
                onDragStart={() => setDragIdx(idx)}
                onDragOver={ev => { ev.preventDefault(); setOverIdx(idx) }}
                onDrop={() => handleDrop(idx)}
                onDragEnd={() => { setDragIdx(null); setOverIdx(null) }}
                isOver={overIdx === idx && dragIdx !== idx}
                isPendingDelete={confirmId === e.id}
              />
            ))}

            {/* Total row */}
            <div className="flex justify-between items-center mt-3 bg-muted rounded-lg px-[14px] py-[10px]">
              <span className="text-sm text-muted-foreground">Total egresos</span>
              <span className="text-base font-semibold font-heading tabular-nums">{COP(total)}</span>
            </div>

            {/* Category distribution bar */}
            <EgresosBar egresos={egresos} trm={month.trm} />
          </>
        )}
      </SectionCard>

      <EgresoSheet />
    </>
  )
}
