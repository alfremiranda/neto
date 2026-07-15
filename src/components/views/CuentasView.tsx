import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ShieldCheck, Pencil, Plus, Landmark, MoveRight, Trash2, Clock, MoreVertical } from 'lucide-react'
import { RowActionsSheet } from '@/components/ui/RowActionsSheet'
import { AccountCardView } from '@/components/cards/AccountCardView'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { buildLedger, computeAccountBalance } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import type { Account } from '@/types'
import type { LedgerEntry } from '@/lib/calc'

// ─── helpers ─────────────────────────────────────────────────────────────────

const MONTH_SHORT = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

function fmtMonth(key: string): string {
  const [y, m0] = key.split('-').map(Number)
  return `${MONTH_SHORT[(m0 ?? 1) - 1] ?? ''} ${y}`
}

// ─── Ledger entry row ─────────────────────────────────────────────────────────

const ENTRY_ICONS = {
  income:       { Icon: ArrowDownLeft,  color: 'text-[var(--color-provision)]',   bg: 'bg-[var(--color-provision-bg)]'  },
  egreso:       { Icon: ArrowUpRight,   color: 'text-[var(--color-danger)]',  bg: 'bg-[var(--color-danger-bg)]' },
  transfer_in:  { Icon: ArrowDownLeft,  color: 'text-[var(--color-income)]',    bg: 'bg-[var(--color-income-bg)]'   },
  transfer_out: { Icon: ArrowUpRight,   color: 'text-muted-foreground',   bg: 'bg-muted'                 },
  ss:           { Icon: ShieldCheck,    color: 'text-[var(--color-tax)]',   bg: 'bg-[var(--color-account-other-bg)]'   },
}

function LedgerRow({ entry, account, accounts }: { entry: LedgerEntry; account: Account; accounts: Account[] }) {
  const { removeIncome, removeEgreso, removeTransfer } = useFinanceStore()
  const { openSheet, setEditingIncome, setEditingEgreso, setEditingTransfer } = useUIStore()
  const [pendingDelete, setPendingDelete] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)
  const { Icon, color, bg } = ENTRY_ICONS[entry.type]
  const isCredit = entry.convertedAmount >= 0
  // On a credit-card account the running balance is ≤ 0 (−debt); show it as positive debt
  const acctIsCredit = account.type === 'credit'
  const runningBalance = acctIsCredit ? Math.max(-entry.balance, 0) : entry.balance

  const counterpart = entry.counterpartId
    ? accounts.find(a => a.id === entry.counterpartId)?.label ?? entry.counterpartId
    : null

  const desc = counterpart
    ? entry.type === 'transfer_in'
      ? `Desde ${counterpart}`
      : `Hacia ${counterpart}`
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

  function handleDeleteDirect() {
    if (entry.type === 'income') removeIncome(numericId)
    else if (entry.type === 'egreso') removeEgreso(numericId)
    else removeTransfer(numericId)
  }

  function handleDeleteDesktop() {
    if (!pendingDelete) { setPendingDelete(true); return }
    handleDeleteDirect()
  }

  return (
    <>
      <div className={cn('flex items-center gap-3 min-h-[52px] py-1.5 border-b border-[var(--border)] last:border-0', entry.scheduled && 'opacity-60')}>
        {/* Icon bubble */}
        <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', entry.scheduled ? 'bg-muted' : bg)}>
          {entry.scheduled ? <Clock size={14} className="text-muted-foreground" /> : <Icon size={14} className={color} />}
        </div>

        {/* Description + date */}
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-1.5 min-w-0">
            <span className="text-sm truncate">{desc}</span>
            {entry.scheduled && (
              <span className="shrink-0 text-[10px] font-medium text-[var(--color-tax-txt)] bg-[var(--color-tax)]/10 px-1.5 py-0.5 rounded-full">
                Programado
              </span>
            )}
          </div>
          <div className="text-xs text-muted-foreground">{fmtDate(entry.date)} · {fmtMonth(entry.monthKey)}</div>
        </div>

        {/* Amount + running balance */}
        <div className="text-right shrink-0">
          <div className={cn('text-sm font-semibold tabular-nums font-heading', isCredit ? 'text-[var(--color-provision)]' : 'text-foreground')}>
            {isCredit ? '+' : ''}{fmt(entry.convertedAmount)}
          </div>
          <div className="text-[10px] text-muted-foreground tabular-nums">{fmt(runningBalance)}</div>
        </div>

        {/* Desktop actions */}
        <div className="hidden sm:flex items-center gap-1 shrink-0">
          <IconButton variant="ghost" size="md" onClick={handleEdit} aria-label="Editar">
            <Pencil size={12} />
          </IconButton>
          {pendingDelete ? (
            <Button
              variant="destructive"
              size="sm"
              onClick={handleDeleteDesktop}
              onBlur={() => setPendingDelete(false)}
              aria-label="Confirmar eliminación"
            >
              ¿Eliminar?
            </Button>
          ) : (
            <IconButton
              variant="ghost-danger"
              size="md"
              onClick={handleDeleteDesktop}
              aria-label="Eliminar"
            >
              <Trash2 size={12} />
            </IconButton>
          )}
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
        title={desc ?? '—'}
        subtitle={`${fmtDate(entry.date)} · ${fmtMonth(entry.monthKey)}`}
        onEdit={handleEdit}
        onDelete={handleDeleteDirect}
      />
    </>
  )
}

// ─── View ─────────────────────────────────────────────────────────────────────

export function CuentasView() {
  const { db, getAccounts } = useFinanceStore()
  const { openSheet, setEditingAccount } = useUIStore()
  const accounts = getAccounts()
  // Favorites first, preserving the configured order otherwise.
  const sortedAccounts = [...accounts].sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite))

  const [selectedId, setSelectedId] = useState<string>(sortedAccounts[0]?.id ?? '')

  const selectedAccount = accounts.find(a => a.id === selectedId)

  // Most recent month key in the db (for "current" balance)
  const allKeys = Object.keys(db).filter(k => k !== '_settings').sort()
  const latestKey = allKeys[allKeys.length - 1] ?? ''

  const ledger = selectedAccount
    ? buildLedger(selectedAccount.id, selectedAccount, db)
    : []

  // Show newest first
  const ledgerDesc = [...ledger].reverse()

  const currentBalance = selectedAccount
    ? computeAccountBalance(selectedAccount.id, selectedAccount, db, latestKey)
    : 0

  const fmt = (n: number) => selectedAccount?.currency === 'USD' ? USD(n) : COP(n)
  const totalCredits = ledger.filter(e => e.convertedAmount > 0).reduce((s, e) => s + e.convertedAmount, 0)
  const totalDebits  = ledger.filter(e => e.convertedAmount < 0).reduce((s, e) => s + e.convertedAmount, 0)
  const selIsCredit  = selectedAccount?.type === 'credit'

  return (
    <div className="space-y-5">
      {/* Accounts header + grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cuentas</h2>
          <div className="flex items-center gap-2">
            <Button size="sm" variant="outline" onClick={() => openSheet('transfer')}>
              <ArrowLeftRight />
              <span className="hidden xs:inline">Movimiento</span>
            </Button>
            <Button size="sm" onClick={() => { setEditingAccount(null); openSheet('account-edit') }}>
              <Plus />
              Nueva cuenta
            </Button>
          </div>
        </div>

        {accounts.length === 0 ? (
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon"><Landmark size={14} /></EmptyMedia>
              <EmptyTitle>Sin cuentas</EmptyTitle>
              <EmptyDescription>Crea una cuenta para registrar saldos y movimientos</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" onClick={() => { setEditingAccount(null); openSheet('account-edit') }}>
                <Plus size={13} />Nueva cuenta
              </Button>
            </EmptyContent>
          </Empty>
        ) : (
          <div className="flex gap-3 overflow-x-auto overscroll-x-contain scrollbar-none -mx-4 px-4 sm:mx-0 sm:px-0 sm:overflow-visible sm:grid sm:grid-cols-3 lg:grid-cols-4">
            {sortedAccounts.map(a => (
              <div key={a.id} className="grid shrink-0 w-[46%] min-w-[150px] sm:w-auto sm:min-w-0">
                <AccountCardView
                  account={a}
                  size="lg"
                  selected={selectedId === a.id}
                  onClick={() => setSelectedId(a.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Ledger */}
      {selectedAccount && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex flex-wrap items-center gap-3">
            <div className="flex-1 min-w-0">
              <div className="text-sm font-semibold">{selectedAccount.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {ledger.length} movimiento{ledger.length !== 1 ? 's' : ''}
              </div>
            </div>
            {/* Stats — hidden on very small screens, visible on sm+ */}
            <div className="hidden sm:flex items-center gap-4 text-right">
              <div>
                <div className="text-[10px] text-muted-foreground">Entradas</div>
                <div className="text-sm font-semibold tabular-nums text-[var(--color-provision)]">+{fmt(totalCredits)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Salidas</div>
                <div className="text-sm font-semibold tabular-nums">{fmt(totalDebits)}</div>
              </div>
            </div>
            {/* Saldo + action — always visible */}
            <div className="flex items-center gap-3 shrink-0">
              <div className="text-right">
                <div className="text-[10px] text-muted-foreground">{selIsCredit ? 'Deuda actual' : 'Saldo actual'}</div>
                <div className={cn('text-sm font-bold tabular-nums font-heading', selIsCredit && 'text-[var(--color-expense-txt)]')}>
                  {fmt(selIsCredit ? Math.max(-currentBalance, 0) : currentBalance)}
                </div>
              </div>
              <Button size="sm" variant="outline" onClick={() => openSheet('transfer')}>
                <ArrowLeftRight size={13} />
                <span className="hidden xs:inline">Movimiento</span>
              </Button>
            </div>
          </div>

          {/* Starting balance row */}
          {selectedAccount.startingBalance != null && (
            <div className="px-4 py-2 flex items-center justify-between bg-muted/50 border-b border-[var(--border)]">
              <span className="text-xs text-muted-foreground">{selIsCredit ? 'Deuda inicial' : 'Saldo inicial'}</span>
              <span className="text-xs font-mono tabular-nums font-medium">
                {fmt(selIsCredit ? Math.max(-selectedAccount.startingBalance, 0) : selectedAccount.startingBalance)}
              </span>
            </div>
          )}

          {/* Transactions */}
          <div className="px-4">
            {ledgerDesc.length === 0 ? (
              <Empty className="border-0 py-6">
                <EmptyHeader>
                  <EmptyMedia variant="icon">
                    {selectedAccount.startingBalance != null ? <MoveRight size={14} /> : <Landmark size={14} />}
                  </EmptyMedia>
                  <EmptyTitle>
                    {selectedAccount.startingBalance != null ? 'Sin movimientos' : 'Cuenta sin configurar'}
                  </EmptyTitle>
                  <EmptyDescription>
                    {selectedAccount.startingBalance != null
                      ? 'Los ingresos, gastos y transferencias vinculados a esta cuenta aparecerán aquí'
                      : 'Configura el saldo inicial en la tarjeta de la cuenta para activar el historial'}
                  </EmptyDescription>
                </EmptyHeader>
              </Empty>
            ) : (
              ledgerDesc.map(entry => (
                <LedgerRow key={entry.id} entry={entry} account={selectedAccount} accounts={accounts} />
              ))
            )}
          </div>
        </div>
      )}
    </div>
  )
}
