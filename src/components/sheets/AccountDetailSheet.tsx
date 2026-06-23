import { useState } from 'react'
import {
  ArrowDownLeft, ArrowUpRight, ShieldCheck,
  Pencil, Trash2, MoveRight, Landmark, Clock, Settings2, MoreVertical, ArrowLeftRight,
} from 'lucide-react'
import { SheetBase } from '@/components/ui/SheetBase'
import { RowActionsSheet } from '@/components/ui/RowActionsSheet'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { CurrencyBadge } from '@/components/ui/Badge'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { buildLedger, computeAccountBalance } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'
import type { LedgerEntry } from '@/lib/calc'

const MONTH_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']
function fmtMonth(key: string) {
  const [y, m0] = key.split('-').map(Number)
  return `${MONTH_SHORT[(m0 ?? 1) - 1] ?? ''} ${y}`
}

const ENTRY_ICONS = {
  income:       { Icon: ArrowDownLeft, color: 'text-[var(--color-provision)]',      bg: 'bg-[var(--color-provision-bg)]'      },
  egreso:       { Icon: ArrowUpRight,  color: 'text-[var(--color-danger)]',         bg: 'bg-[var(--color-danger-bg)]'         },
  transfer_in:  { Icon: ArrowDownLeft, color: 'text-[var(--color-income)]',         bg: 'bg-[var(--color-income-bg)]'         },
  transfer_out: { Icon: ArrowUpRight,  color: 'text-muted-foreground',              bg: 'bg-muted'                            },
  ss:           { Icon: ShieldCheck,   color: 'text-[var(--color-tax)]',            bg: 'bg-[var(--color-account-other-bg)]'  },
}

function LedgerRow({ entry, account, accounts }: { entry: LedgerEntry; account: Account; accounts: Account[] }) {
  const { removeIncome, removeEgreso, removeTransfer } = useFinanceStore()
  const { openSheet, setEditingIncome, setEditingEgreso, setEditingTransfer } = useUIStore()
  const [pendingDelete, setPendingDelete] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)
  const { Icon, color, bg } = ENTRY_ICONS[entry.type]
  const isCredit = entry.convertedAmount >= 0

  const counterpart = entry.counterpartId
    ? accounts.find(a => a.id === entry.counterpartId)?.label ?? entry.counterpartId
    : null
  const desc = counterpart
    ? entry.type === 'transfer_in' ? `Desde ${counterpart}` : `Hacia ${counterpart}`
    : entry.desc

  const numericId = Number(entry.id.split('-').at(-1))

  function handleEdit() {
    if (entry.type === 'income') {
      setEditingIncome(numericId); openSheet('income')
    } else if (entry.type === 'egreso') {
      setEditingEgreso(numericId); openSheet('egreso')
    } else {
      setEditingTransfer(numericId); openSheet('transfer')
    }
  }

  function handleDelete() {
    if (entry.type === 'income') removeIncome(numericId)
    else if (entry.type === 'egreso') removeEgreso(numericId)
    else removeTransfer(numericId)
  }

  function handleDeleteDesktop() {
    if (!pendingDelete) { setPendingDelete(true); return }
    handleDelete()
  }

  return (
    <>
      <div className={cn(
        'flex items-center gap-3 min-h-[52px] py-1.5 border-b border-[var(--border)] last:border-0',
        entry.scheduled && 'opacity-60',
      )}>
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', entry.scheduled ? 'bg-muted' : bg)}>
          {entry.scheduled
            ? <Clock size={14} className="text-muted-foreground" />
            : <Icon size={14} className={color} />}
        </div>

        <div className="flex-1 min-w-0">
          <div className="text-sm truncate">{desc}</div>
          <div className="text-xs text-muted-foreground">{fmtDate(entry.date)} · {fmtMonth(entry.monthKey)}</div>
        </div>

        <div className="text-right shrink-0">
          <div className={cn('text-sm font-semibold tabular-nums font-heading', isCredit ? 'text-[var(--color-provision)]' : 'text-foreground')}>
            {isCredit ? '+' : ''}{fmt(entry.convertedAmount)}
          </div>
          <div className="text-[10px] text-muted-foreground tabular-nums">{fmt(entry.balance)}</div>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <IconButton variant="ghost" size="md" onClick={handleEdit} aria-label="Editar">
            <Pencil size={12} />
          </IconButton>
          {pendingDelete ? (
            <Button variant="destructive" size="sm" onClick={handleDeleteDesktop} onBlur={() => setPendingDelete(false)}>
              ¿Eliminar?
            </Button>
          ) : (
            <IconButton variant="ghost-danger" size="md" onClick={handleDeleteDesktop} aria-label="Eliminar">
              <Trash2 size={12} />
            </IconButton>
          )}
        </div>

        {/* Mobile action */}
        <Button variant="ghost" size="icon-sm" className="sm:hidden shrink-0" onClick={() => setSheetOpen(true)} aria-label="Opciones">
          <MoreVertical size={16} />
        </Button>
      </div>

      <RowActionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={desc ?? '—'}
        subtitle={`${fmtDate(entry.date)} · ${fmtMonth(entry.monthKey)}`}
        onEdit={handleEdit}
        onDelete={handleDelete}
      />
    </>
  )
}

// ─── Sheet ────────────────────────────────────────────────────────────────────

export function AccountDetailSheet() {
  const { db, getAccounts } = useFinanceStore()
  const { editingBalanceId, openSheet } = useUIStore()

  const accounts = getAccounts()
  const account  = editingBalanceId ? accounts.find(a => a.id === editingBalanceId) : null

  const allKeys    = Object.keys(db).filter(k => k !== '_settings').sort()
  const latestKey  = allKeys[allKeys.length - 1] ?? ''
  const ledger     = account ? buildLedger(account.id, account, db) : []
  const ledgerDesc = [...ledger].reverse()

  const currentBalance = account ? computeAccountBalance(account.id, account, db, latestKey) : 0
  const fmt            = (n: number) => account?.currency === 'USD' ? USD(n) : COP(n)
  const totalCredits   = ledger.filter(e => e.convertedAmount > 0).reduce((s, e) => s + e.convertedAmount, 0)
  const totalDebits    = ledger.filter(e => e.convertedAmount < 0).reduce((s, e) => s + e.convertedAmount, 0)

  if (!account) return <SheetBase id="account-detail" title="Cuenta"><div /></SheetBase>

  const titleNode = (
    <span className="flex items-center gap-2">
      {account.label}
      <CurrencyBadge currency={account.currency} />
    </span>
  )

  return (
    <SheetBase
      id="account-detail"
      title={titleNode}
      footer={
        <Button className="w-full" onClick={() => openSheet('transfer')}>
          <ArrowLeftRight size={14} />
          Agregar movimiento
        </Button>
      }
    >
      {/* Stats bar */}
      <div className="flex items-center gap-4 justify-end pb-4 mb-1 border-b border-[var(--border)] -mt-2">
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Entradas</div>
          <div className="text-sm font-semibold tabular-nums text-[var(--color-provision)]">+{fmt(totalCredits)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Salidas</div>
          <div className="text-sm font-semibold tabular-nums">{fmt(totalDebits)}</div>
        </div>
        <div className="text-right">
          <div className="text-[10px] text-muted-foreground">Saldo actual</div>
          <div className="text-sm font-bold tabular-nums font-heading">{fmt(currentBalance)}</div>
        </div>
      </div>

      {/* Starting balance row */}
      {account.startingBalance != null && (
        <div className="flex items-center justify-between text-xs py-2.5 mb-1 border-b border-[var(--border)]">
          <span className="text-muted-foreground">Saldo inicial</span>
          <span className="font-mono tabular-nums font-medium">{fmt(account.startingBalance)}</span>
        </div>
      )}

      {/* Ledger */}
      {ledgerDesc.length === 0 ? (
        <Empty className="border-0 py-6">
          <EmptyHeader>
            <EmptyMedia variant="icon">
              {account.startingBalance != null ? <MoveRight size={14} /> : <Landmark size={14} />}
            </EmptyMedia>
            <EmptyTitle>
              {account.startingBalance != null ? 'Sin movimientos' : 'Cuenta sin configurar'}
            </EmptyTitle>
            <EmptyDescription>
              {account.startingBalance != null
                ? 'Los ingresos, egresos y transferencias vinculados a esta cuenta aparecerán aquí'
                : 'Configura el saldo inicial para activar el historial de esta cuenta'}
            </EmptyDescription>
          </EmptyHeader>
          {account.startingBalance == null && (
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={() => openSheet('balance')}>
                <Settings2 size={13} />Configurar saldo inicial
              </Button>
            </EmptyContent>
          )}
        </Empty>
      ) : (
        <div>
          {ledgerDesc.map(entry => (
            <LedgerRow key={entry.id} entry={entry} account={account} accounts={accounts} />
          ))}
        </div>
      )}
    </SheetBase>
  )
}
