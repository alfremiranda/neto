import { Trash2, ArrowLeftRight, Pencil } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD, fmtDate } from '@/lib/format'
import { computeAccountBalance } from '@/lib/calc'
import { CurrencyBadge } from '@/components/ui/Badge'
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
  const fromAcc = accounts.find(a => a.id === t.from)
  const toAcc   = accounts.find(a => a.id === t.to)
  const title   = `${fromAcc?.label ?? t.from} → ${toAcc?.label ?? t.to}`

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

export function MovimientosCard() {
  const { db, getCurrentMonth, getAccounts, removeTransfer, curKey } = useFinanceStore()
  const { openSheet, showToast, setEditingBalance, setEditingTransfer } = useUIStore()
  const month    = getCurrentMonth()
  const accounts = getAccounts()
  const [y, m] = curKey.split('-').map(Number)

  function openDetail(id: string) { setEditingBalance(id); openSheet('account-detail') }

  return (
    <SectionCard
      icon={ArrowLeftRight}
      title="Movimientos entre cuentas"
    >
      {/* Account Scorecards */}
      <div className="grid gap-2 mb-[10px]"
        style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))' }}>
        {accounts.map(a => {
          const balance = computeAccountBalance(a.id, a, db, curKey)
          const hasStarting = a.startingBalance != null
          const hasActivity = Object.keys(db).some(k => {
            if (k === '_settings') return false
            const mo = db[k] as import('@/types').MonthData
            return (mo?.incomes || []).some(i => i.account === a.id)
              || (mo?.egresos || []).some(e => e.account === a.id)
              || (mo?.transfers || []).some(t => t.from === a.id || t.to === a.id)
          })
          const showBalance = hasStarting || hasActivity
          const monthlyInt = showBalance && a.rate > 0 ? balance * (a.rate / 100) / 12 : 0
          const numStr = a.number ? `•••• ${String(a.number).slice(-4)}` : null
          const fmt = (n: number) => a.currency === 'USD' ? USD(n) : COP(n)

          return (
            <div
              key={a.id}
              onClick={() => openDetail(a.id)}
              className="bg-muted rounded-xl p-3 cursor-pointer hover:bg-[var(--accent)] transition-colors min-w-0"
            >
              <div className="flex items-center gap-1 mb-0.5">
                <span className="text-[12px] font-medium leading-[18px] text-muted-foreground truncate flex-1 min-w-0">{a.label}</span>
                <CurrencyBadge currency={a.currency} />
              </div>
              {numStr && <div className="text-[10px] font-normal leading-[15px] text-muted-foreground font-mono mb-1">{numStr}</div>}
              <div className="text-[16px] font-bold leading-[24px] font-mono mt-0.5">
                {showBalance
                  ? fmt(balance)
                  : <span className="text-sm font-normal text-muted-foreground">Tocar para configurar</span>}
              </div>
              {monthlyInt > 0 && (
                <div className="text-[10px] font-normal leading-[15px] text-[var(--color-provision)] mt-[3px]">
                  ≈ {fmt(monthlyInt)}/mes · {a.rate}% a.a.
                </div>
              )}
            </div>
          )
        })}
      </div>

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
