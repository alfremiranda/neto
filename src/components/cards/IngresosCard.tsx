import { useState } from 'react'
import { Plus, Trash2, Pencil, Banknote, Receipt, MoreVertical } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { calcTotales } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { MetricCard } from '@/components/ui/MetricCard'
import { IncomeSheet } from '@/components/sheets/IncomeSheet'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { RowActionsSheet } from '@/components/ui/RowActionsSheet'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import type { Income } from '@/types'

// ─── Income row ───────────────────────────────────────────────────────────────

function IncomeRow({
  inc, trm,
  onEdit, onDelete,
  isPending, onDeleteDesktop,
}: {
  inc: Income
  trm: number
  onEdit: () => void
  onDelete: () => void
  isPending: boolean
  onDeleteDesktop: () => void
}) {
  const [sheetOpen, setSheetOpen] = useState(false)

  const accountLower = inc.account.toLowerCase()
  const acctVariant = accountLower.includes('arq')    ? 'arq'
    : accountLower.includes('toptal') ? 'toptal'
    : accountLower.includes('bancol') ? 'bancol'
    : 'otro'

  return (
    <>
      <div className="flex items-center gap-2 min-h-[52px] py-1.5 border-b border-[var(--border)] last:border-0">
        {/* Description + meta */}
        <div className="flex-1 min-w-0">
          <div className="text-sm font-medium truncate">{inc.desc}</div>
          <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
            <Badge variant={acctVariant}>{inc.account}</Badge>
            <span>· {inc.tipo}</span>
            {inc.applyProvisions === false && (
              <span className="text-muted-foreground/50">· sin prov.</span>
            )}
            {inc.date && <><span>·</span><span>{fmtDate(inc.date)}</span></>}
          </div>
        </div>

        {/* Amount */}
        <div className="text-right shrink-0">
          <div className="text-sm font-semibold tabular-nums font-heading">
            {inc.currency === 'USD' ? USD(inc.amount) : COP(inc.amount)}
          </div>
          {inc.currency === 'USD' && (
            <div className="text-xs text-muted-foreground tabular-nums">
              {COP(inc.amount * trm)}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <Button variant="ghost" size="icon-sm" onClick={onEdit} aria-label="Editar ingreso">
            <Pencil size={13} />
          </Button>
          <Button
            variant={isPending ? 'destructive' : 'ghost'}
            size={isPending ? 'sm' : 'icon-sm'}
            onClick={onDeleteDesktop}
            aria-label={isPending ? 'Confirmar eliminación' : 'Eliminar ingreso'}
            className={!isPending ? 'hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]' : ''}
          >
            {isPending ? '¿Eliminar?' : <Trash2 size={13} />}
          </Button>
        </div>

        {/* Mobile action */}
        <Button
          variant="ghost"
          size="icon-sm"
          className="sm:hidden shrink-0"
          onClick={() => setSheetOpen(true)}
          aria-label="Opciones"
        >
          <MoreVertical size={16} />
        </Button>
      </div>

      <RowActionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={inc.desc}
        subtitle={`${inc.account} · ${inc.tipo}`}
        onEdit={onEdit}
        onDelete={onDelete}
      />
    </>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

export function IngresosCard() {
  const { getCurrentMonth, removeIncome } = useFinanceStore()
  const { openSheet, setPendingDelete, showToast, setEditingIncome } = useUIStore()
  const { trm: liveTRM } = useLiveTRM()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const month = getCurrentMonth()
  const { totUSD } = calcTotales(month.incomes, month.trm)
  const displayTRM = liveTRM ?? month.trm
  const { bruto }  = calcTotales(month.incomes, displayTRM)
  const hasIncomes = month.incomes.length > 0

  function handleEdit(id: number) {
    setEditingIncome(id)
    openSheet('income')
  }

  function handleDelete(id: number) {
    removeIncome(id)
    setConfirmId(null)
    setPendingDelete(null)
    showToast('Ingreso eliminado')
  }

  function handleDeleteDesktop(id: number) {
    if (confirmId === id) {
      handleDelete(id)
    } else {
      setConfirmId(id)
      setPendingDelete(id)
    }
  }

  function handleAdd() {
    setEditingIncome(null)
    openSheet('income')
  }

  return (
    <>
      <SectionCard
        icon={Banknote}
        title="Ingresos del mes"
        action={
          <Button size="sm" onClick={handleAdd}>
            <Plus size={13} />
            <span className="hidden xs:inline">Registrar</span>
          </Button>
        }
      >
        {!hasIncomes ? (
          <Empty className="border-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Receipt size={14} /></EmptyMedia>
              <EmptyTitle>Sin ingresos</EmptyTitle>
              <EmptyDescription>Registra el primer ingreso del mes</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={handleAdd}>
                <Plus size={13} />Registrar ingreso
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div>
            {[...month.incomes]
              .sort((a, b) => (b.date ?? '').localeCompare(a.date ?? ''))
              .map(inc => (
                <IncomeRow
                  key={inc.id}
                  inc={inc}
                  trm={month.trm}
                  onEdit={() => handleEdit(inc.id)}
                  onDelete={() => handleDelete(inc.id)}
                  isPending={confirmId === inc.id}
                  onDeleteDesktop={() => handleDeleteDesktop(inc.id)}
                />
              ))}

            <div className="mt-3 pt-3 border-t border-[var(--border)]">
              <MetricCard
                label="Total bruto equiv. COP"
                value={COP(bruto)}
                sub={totUSD > 0
                  ? `${USD(totUSD)} · ${liveTRM ? 'TRM hoy' : 'TRM mes'} ${displayTRM.toLocaleString('es-CO', { maximumFractionDigits: 2 })}`
                  : undefined}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <IncomeSheet />
    </>
  )
}
