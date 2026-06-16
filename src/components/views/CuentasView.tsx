import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ShieldCheck, Pencil, Plus, Landmark, MoveRight } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { buildLedger, computeAccountBalance } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { CurrencyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import type { Account } from '@/types'
import type { LedgerEntry } from '@/lib/calc'

// ─── helpers ─────────────────────────────────────────────────────────────────

const MONTH_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function fmtDate(iso: string): string {
  const [, mm, dd] = iso.split('-')
  const m = parseInt(mm ?? '0', 10) - 1
  const d = parseInt(dd ?? '0', 10)
  return `${d} ${MONTH_SHORT[m] ?? ''}`
}

function fmtMonth(key: string): string {
  const [y, m0] = key.split('-').map(Number)
  return `${MONTH_SHORT[m0] ?? ''} ${y}`
}

// ─── Account card ─────────────────────────────────────────────────────────────

function AccountCard({
  account, balance, selected, onClick,
}: {
  account: Account
  balance: number
  selected: boolean
  onClick: () => void
}) {
  const { setEditingAccount, openSheet } = useUIStore()
  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)
  const hasConfig = account.startingBalance != null

  return (
    <div
      onClick={onClick}
      className={cn(
        'rounded-xl p-4 cursor-pointer transition-all border-2 flex flex-col gap-2',
        selected
          ? 'border-[var(--primary)] bg-[var(--n-blue-bg)]'
          : 'border-[var(--border)] bg-card hover:bg-[var(--n-bg)] hover:border-[var(--n-border2)]',
      )}
    >
      {/* Header row */}
      <div className="flex items-center justify-between gap-1">
        <span className="text-xs text-muted-foreground font-medium truncate flex-1 min-w-0">
          {account.label}
        </span>
        <CurrencyBadge currency={account.currency} />
      </div>

      {/* Balance */}
      <div className="text-lg font-bold tabular-nums font-heading leading-tight">
        {hasConfig ? fmt(balance) : <span className="text-sm font-normal text-muted-foreground">Sin configurar</span>}
      </div>

      {account.rate > 0 && hasConfig && (
        <div className="text-2xs text-[var(--n-green)] tabular-nums -mt-1">
          ≈ {fmt(balance * (account.rate / 100) / 12)}/mes · {account.rate}% a.a.
        </div>
      )}

      {/* Edit button — always visible at bottom */}
      <button
        onClick={e => { e.stopPropagation(); setEditingAccount(account.id); openSheet('account-edit') }}
        className={cn(
          'mt-auto self-start flex items-center gap-1 text-[11px] font-medium px-2 py-1 rounded-md border-none cursor-pointer transition-colors',
          selected
            ? 'bg-[var(--primary)]/10 text-[var(--primary)] hover:bg-[var(--primary)]/20'
            : 'bg-muted text-muted-foreground hover:text-foreground hover:bg-[var(--n-hover)]',
        )}
      >
        <Pencil size={10} strokeWidth={2.5} />
        Editar
      </button>
    </div>
  )
}

// ─── Ledger entry row ─────────────────────────────────────────────────────────

const ENTRY_ICONS = {
  income:       { Icon: ArrowDownLeft,  color: 'text-[var(--n-green)]',   bg: 'bg-[var(--n-green-bg)]'  },
  egreso:       { Icon: ArrowUpRight,   color: 'text-[var(--n-danger)]',  bg: 'bg-[var(--n-danger-bg)]' },
  transfer_in:  { Icon: ArrowDownLeft,  color: 'text-[var(--n-blue)]',    bg: 'bg-[var(--n-blue-bg)]'   },
  transfer_out: { Icon: ArrowUpRight,   color: 'text-muted-foreground',   bg: 'bg-muted'                 },
  ss:           { Icon: ShieldCheck,    color: 'text-[var(--n-amber)]',   bg: 'bg-[var(--n-gray-bg)]'   },
}

function LedgerRow({ entry, account, accounts }: { entry: LedgerEntry; account: Account; accounts: Account[] }) {
  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)
  const { Icon, color, bg } = ENTRY_ICONS[entry.type]
  const isCredit = entry.convertedAmount >= 0

  const counterpart = entry.counterpartId
    ? accounts.find(a => a.id === entry.counterpartId)?.label ?? entry.counterpartId
    : null

  const desc = counterpart
    ? entry.type === 'transfer_in'
      ? `Desde ${counterpart}`
      : `Hacia ${counterpart}`
    : entry.desc

  return (
    <div className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
      {/* Icon bubble */}
      <div className={cn('w-8 h-8 rounded-full flex items-center justify-center shrink-0', bg)}>
        <Icon size={14} className={color} />
      </div>

      {/* Description + date */}
      <div className="flex-1 min-w-0">
        <div className="text-sm truncate">{desc}</div>
        <div className="text-xs text-muted-foreground">{fmtDate(entry.date)} · {fmtMonth(entry.monthKey)}</div>
      </div>

      {/* Amount + running balance */}
      <div className="text-right shrink-0">
        <div className={cn('text-sm font-semibold tabular-nums font-heading', isCredit ? 'text-[var(--n-green)]' : 'text-foreground')}>
          {isCredit ? '+' : ''}{fmt(entry.convertedAmount)}
        </div>
        <div className="text-[10px] text-muted-foreground tabular-nums">{fmt(entry.balance)}</div>
      </div>
    </div>
  )
}

// ─── View ─────────────────────────────────────────────────────────────────────

export function CuentasView() {
  const { db, getAccounts } = useFinanceStore()
  const { openSheet, setEditingAccount } = useUIStore()
  const accounts = getAccounts()

  const [selectedId, setSelectedId] = useState<string>(accounts[0]?.id ?? '')

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

  return (
    <div className="space-y-5">
      {/* Accounts header + grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Cuentas</h2>
          <Button size="sm" onClick={() => { setEditingAccount(null); openSheet('account-edit') }}>
            <Plus size={13} />
            Nueva cuenta
          </Button>
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
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {accounts.map(a => (
              <AccountCard
                key={a.id}
                account={a}
                balance={computeAccountBalance(a.id, a, db, latestKey)}
                selected={selectedId === a.id}
                onClick={() => setSelectedId(a.id)}
              />
            ))}
          </div>
        )}
      </div>


      {/* Ledger */}
      {selectedAccount && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
          {/* Header */}
          <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-4">
            <div>
              <div className="text-sm font-semibold">{selectedAccount.label}</div>
              <div className="text-xs text-muted-foreground mt-0.5">
                {ledger.length} movimiento{ledger.length !== 1 ? 's' : ''}
              </div>
            </div>
            {/* Mini summary + action */}
            <div className="flex items-center gap-4 text-right shrink-0">
              <Button size="sm" variant="outline" onClick={() => openSheet('transfer')}>
                <ArrowLeftRight size={13} />
                Movimiento
              </Button>
              <div>
                <div className="text-[10px] text-muted-foreground">Entradas</div>
                <div className="text-sm font-semibold tabular-nums text-[var(--n-green)]">+{fmt(totalCredits)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Salidas</div>
                <div className="text-sm font-semibold tabular-nums">{fmt(totalDebits)}</div>
              </div>
              <div>
                <div className="text-[10px] text-muted-foreground">Saldo actual</div>
                <div className="text-sm font-bold tabular-nums font-heading">{fmt(currentBalance)}</div>
              </div>
            </div>
          </div>

          {/* Starting balance row */}
          {selectedAccount.startingBalance != null && (
            <div className="px-4 py-2 flex items-center justify-between bg-muted/50 border-b border-[var(--border)]">
              <span className="text-xs text-muted-foreground">Saldo inicial</span>
              <span className="text-xs font-mono tabular-nums font-medium">{fmt(selectedAccount.startingBalance)}</span>
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
                      ? 'Los ingresos, egresos y transferencias vinculados a esta cuenta aparecerán aquí'
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
