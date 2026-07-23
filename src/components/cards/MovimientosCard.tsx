import { Trash2, ArrowLeftRight, Pencil } from 'lucide-react'
import { useHasHydrated } from '@/hooks/useHasHydrated'
import { Skeleton } from '@/components/ui/skeleton'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD, fmtDate } from '@/lib/format'
import { accountLabel } from '@/lib/accountLabel'
import { MONTHS } from '@/data/defaults'
import { SectionCard } from '@/components/ui/SectionCard'
import { IconButton } from '@/components/ui/icon-button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import type { Transfer, Account } from '@/types'

// ─── Transfer row ─────────────────────────────────────────────────────────────

function TransferRow({
  t, accounts,
  onEdit, onDelete,
}: {
  t: Transfer
  accounts: Account[]
  onEdit: () => void
  onDelete: () => void
}) {
  const title   = `${accountLabel(t.from, accounts)} → ${accountLabel(t.to, accounts)}`

  const primaryAmt   = t.fromCurrency === 'USD' ? USD(t.amount) : COP(t.amount)
  const secondaryCOP = t.fromCurrency === 'USD' && t.trm ? COP(t.amount * t.trm) : null
  const dateStr      = t.date ? fmtDate(t.date) : null

  const content = (
    <div className="flex-1 min-w-0 flex flex-col">
      <span className="text-xs font-medium leading-snug truncate">{title}</span>
      <div className="flex items-center gap-1 mt-0.5 flex-wrap">
        <span className="text-sm font-semibold tabular-nums font-mono">{primaryAmt}</span>
        {secondaryCOP && (
          <>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-muted-foreground tabular-nums">{secondaryCOP}</span>
          </>
        )}
        {dateStr && (
          <>
            <span className="text-[11px] text-muted-foreground">·</span>
            <span className="text-[11px] text-muted-foreground">{dateStr}</span>
          </>
        )}
      </div>
    </div>
  )

  return (
    <>
      {/* Desktop */}
      <div className="hidden sm:flex items-center gap-2 py-[9px] border-b border-[var(--border)] last:border-0">
        {content}
        <div className="flex items-center gap-0.5 shrink-0">
          <IconButton variant="ghost" size="md" onClick={onEdit} aria-label="Editar movimiento">
            <Pencil size={12} />
          </IconButton>
          <IconButton variant="ghost-danger" size="md" onClick={onDelete} aria-label="Eliminar movimiento">
            <Trash2 size={12} />
          </IconButton>
        </div>
      </div>

      {/* Mobile — tappable row opens edit sheet directly */}
      <button
        className="sm:hidden w-full text-left flex items-center gap-2 py-[9px] border-b border-[var(--border)] last:border-0 active:bg-muted/50 transition-colors"
        onClick={onEdit}
      >
        {content}
      </button>
    </>
  )
}

// ─── Card ─────────────────────────────────────────────────────────────────────

function MovimientosCardSkeleton() {
  return (
    <SectionCard icon={ArrowLeftRight} title="Movimientos entre cuentas">
      <div className="space-y-0">
        {[0, 1, 2].map(i => (
          <div key={i} className="flex items-center gap-2 py-2.5 border-b border-[var(--border)] last:border-0">
            <div className="flex-1 space-y-1.5">
              <Skeleton className="h-3.5 w-40" />
              <Skeleton className="h-3 w-24" />
            </div>
            <Skeleton className="h-3.5 w-20" />
          </div>
        ))}
      </div>
    </SectionCard>
  )
}

export function MovimientosCard() {
  const hydrated = useHasHydrated()
  if (!hydrated) return <MovimientosCardSkeleton />
  return <MovimientosCardContent />
}

function MovimientosCardContent() {
  const { getCurrentMonth, getAccounts, removeTransfer, curKey } = useFinanceStore()
  const { openSheet, showToast, setEditingTransfer } = useUIStore()
  const month    = getCurrentMonth()
  const accounts = getAccounts()
  const [y, m] = curKey.split('-').map(Number)

  return (
    <SectionCard
      icon={ArrowLeftRight}
      title="Movimientos entre cuentas"
    >
      {/* Transfers list */}
      {(month.transfers || []).length === 0 ? (
        <Empty className="border-0 py-3">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ArrowLeftRight size={14} /></EmptyMedia>
            <EmptyTitle>Sin movimientos</EmptyTitle>
            <EmptyDescription>No hay transferencias en {MONTHS[m - 1]} {y}</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div>
          {[...(month.transfers || [])].sort((a, b) => (b.date ?? '').localeCompare(a.date ?? '')).map(t => (
            <TransferRow
              key={t.id}
              t={t}
              accounts={accounts}
              onEdit={() => { setEditingTransfer(t.id); openSheet('transfer') }}
              onDelete={() => { removeTransfer(t.id); showToast('Movimiento eliminado') }}
            />
          ))}
        </div>
      )}
    </SectionCard>
  )
}
