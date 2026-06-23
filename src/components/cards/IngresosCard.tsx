import { useState } from 'react'
import { Plus, Trash2, Pencil, Banknote, Receipt, MoreVertical } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useMonthData } from '@/hooks/useMonthData'
import { useUIStore } from '@/store/uiStore'
import { calcTotales } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { MetricCard } from '@/components/ui/MetricCard'
import { IncomeSheet } from '@/components/sheets/IncomeSheet'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
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

  // Primary = original currency; secondary = equivalent in the other currency
  const primaryAmt   = inc.currency === 'USD' ? USD(inc.amount) : COP(inc.amount)
  const secondaryAmt = inc.currency === 'USD' ? COP(inc.amount * trm) : USD(inc.amount / trm)

  const meta = (
    <div className="flex items-center gap-1 flex-wrap">
      <Badge variant={acctVariant}>{inc.account}</Badge>
      {inc.applyProvisions === false && (
        <>
          <span className="text-[11px] text-muted-foreground">·</span>
          <span className="text-[11px] text-muted-foreground">sin prov.</span>
        </>
      )}
      <span className="text-[11px] text-muted-foreground">·</span>
      <span className="text-[11px] text-muted-foreground">{inc.tipo}</span>
      {inc.date && (
        <>
          <span className="text-[11px] text-muted-foreground">·</span>
          <span className="text-[11px] text-muted-foreground">{fmtDate(inc.date)}</span>
        </>
      )}
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-3 py-[9px] border-b border-[var(--border)] last:border-0">
        <div className="flex-1 min-w-0 flex flex-col">
          <div className="text-sm font-medium leading-snug truncate">{inc.desc}</div>
          <div className="mt-0.5">{meta}</div>
        </div>
        <div className="flex flex-col items-end shrink-0">
          <span className="text-sm font-semibold tabular-nums font-mono leading-snug">{primaryAmt}</span>
          <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{secondaryAmt}</span>
        </div>
        <div className="flex items-center gap-0.5 shrink-0">
          <IconButton variant="ghost" size="md" onClick={onEdit} aria-label="Editar ingreso">
            <Pencil size={13} />
          </IconButton>
          {isPending ? (
            <Button variant="destructive" size="sm" onClick={onDeleteDesktop} aria-label="Confirmar eliminación">
              ¿Eliminar?
            </Button>
          ) : (
            <IconButton variant="ghost-danger" size="md" onClick={onDeleteDesktop} aria-label="Eliminar ingreso">
              <Trash2 size={13} />
            </IconButton>
          )}
        </div>
      </div>

      {/* Mobile */}
      <div className="sm:hidden flex items-start gap-2 py-2 border-b border-[var(--border)] last:border-0">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          <div className="flex items-end gap-2">
            <span className="text-base font-bold tabular-nums font-heading">{primaryAmt}</span>
            <span className="text-[11px] font-semibold tabular-nums font-mono text-muted-foreground">{secondaryAmt}</span>
          </div>
          <div className="text-sm font-medium leading-snug truncate">{inc.desc}</div>
          {meta}
        </div>
        <Button
          variant="ghost"
          size="icon-sm"
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
  const { removeIncome } = useFinanceStore()
  const { openSheet, setPendingDelete, showToast, setEditingIncome } = useUIStore()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const month = useMonthData()
  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
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
          <>
            <Button size="sm" onClick={handleAdd} className="hidden sm:flex">
              <Plus size={13} />Registrar
            </Button>
            <IconButton variant="filled" size="md" onClick={handleAdd} aria-label="Registrar ingreso" className="sm:hidden">
              <Plus />
            </IconButton>
          </>
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

            <div className="mt-3">
              <MetricCard
                label="Total bruto equiv. COP"
                value={COP(bruto)}
                sub={totUSD > 0 ? (
                  <span className="text-[0px]">
                    <span className="font-heading font-semibold text-[12px] leading-[18px] tabular-nums">
                      {USD(totUSD)}
                    </span>
                    <span className="font-sans font-normal text-[11px] leading-[17px]">
                      {` · TRM mes ${month.trm.toLocaleString('es-CO', { maximumFractionDigits: 2 })}`}
                    </span>
                  </span>
                ) : undefined}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <IncomeSheet />
    </>
  )
}
