import { useState } from 'react'
import { ArrowDownLeft, ArrowUpRight, ArrowLeftRight, ShieldCheck, Pencil, Plus, Landmark, MoveRight, Trash2, Clock, MoreVertical, Wallet } from 'lucide-react'
import { RowActionsSheet } from '@/components/ui/RowActionsSheet'
import { AccountCardView } from '@/components/cards/AccountCardView'
import { AccountSummaryCard } from '@/components/cards/AccountSummaryCard'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { buildLedger } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'
import { Badge } from '@/components/ui/Badge'
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
  // --color-tax is amber/400 and measures 1.61:1 on its own surface. A filled glyph is a
  // graphic object, so WCAG 1.4.11 asks for 3:1 — this one was effectively invisible.
  // --color-tax-txt is amber/700: 4.84:1. Dark was already fine at 10.39 and does not move.
  ss:           { Icon: ShieldCheck,    color: 'text-[var(--color-tax-txt)]',   bg: 'bg-[var(--color-tax-bg)]'         },
  opening:      { Icon: Wallet,         color: 'text-muted-foreground',   bg: 'bg-muted'                 },
}

/**
 * `opening` renders the account's starting balance as the ledger's last row rather than
 * as a strip above the list. It reuses this component instead of a lookalike so the
 * responsive shape — badge on the metadata line, the mobile restack, the 44px target —
 * cannot drift between the two: that shape took Design three passes to settle.
 *
 * It carries no date and no running balance, because in the opening the amount IS the
 * balance. Its actions differ too: the starting balance is a field on the Account
 * (`startingBalance`), not an entry, so editing means opening the account sheet and
 * there is nothing for a delete to point at. See the note to Design.
 */
function LedgerRow({ entry, account, accounts, opening }: { entry: LedgerEntry; account: Account; accounts: Account[]; opening?: boolean }) {
  const { removeIncome, removeEgreso, removeTransfer } = useFinanceStore()
  const { openSheet, setEditingIncome, setEditingEgreso, setEditingTransfer, setEditingAccount } = useUIStore()
  const [pendingDelete, setPendingDelete] = useState(false)
  const [sheetOpen, setSheetOpen] = useState(false)

  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)
  const { Icon, color, bg } = ENTRY_ICONS[opening ? 'opening' : entry.type]
  // Credit vs debit by entry TYPE, not amount sign — a scheduled egreso has a
  // 0-balance impact but is still an expense, so it must not read as a "+" credit.
  const isCredit = entry.type === 'income' || entry.type === 'transfer_in'
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
    if (opening) {
      setEditingAccount(account.id); openSheet('account-edit'); return
    }
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
      {/* Mobile restacks into three lines — amounts, description, metadata — because at
          the account page's 346px a single row cannot hold a description, a date, the
          104 amount column, the mark and an action without truncating something.
          Stacking gives the text the full width. Desktop keeps one line, where the
          amount column stays pinned to 104 so a leading "+" never shifts it between
          neighbouring rows: a ledger is read down its right edge.
          Flex wrapping happens after ordering, so `order` drives both layouts. */}
      <div className={cn('flex flex-wrap sm:flex-nowrap items-center gap-x-3 gap-y-1 min-h-[62px] py-1.5 border-b border-[var(--border)] last:border-0', entry.scheduled && 'opacity-60')}>
        {/* Icon bubble */}
        <div className={cn('order-1 w-8 h-8 rounded-full flex items-center justify-center shrink-0', entry.scheduled ? 'bg-muted' : bg)}>
          {entry.scheduled ? <Clock size={16} className="text-muted-foreground" /> : <Icon size={16} className={color} />}
        </div>

        {/* Amount + running balance */}
        <div className="order-2 sm:order-3 ml-auto sm:ml-0 sm:w-[104px] text-right shrink-0">
          <div className={cn('ts-amount-base', !opening && isCredit ? 'text-[var(--color-provision)]' : 'text-foreground')}>
            {!opening && isCredit ? '+' : ''}{fmt(entry.convertedAmount)}
          </div>
          {!opening && <div className="ts-amount-micro text-muted-foreground">{fmt(runningBalance)}</div>}
        </div>

        {/* Description + metadata.
            The badge sits on the metadata line, not beside the description. It used to
            sit alongside, which forced a width cap on the description so the badge could
            never be squeezed — and a cap authored for one width truncates at another.
            Description alone, filling and truncating with nothing pinned; badge and date
            below as chips that hug their content, so it adapts to any width. */}
        <div className="order-4 sm:order-2 w-full sm:w-auto sm:flex-1 min-w-0">
          <div className="ts-body-base-emphasis truncate">{desc}</div>
          {!opening && (
            <div className="flex items-center gap-1.5 flex-wrap">
              <span className="ts-body-small text-muted-foreground">{fmtDate(entry.date)} · {fmtMonth(entry.monthKey)}</span>
              {entry.scheduled && <Badge tone="warning">Programado</Badge>}
            </div>
          )}
        </div>

        {/* Desktop actions */}
        <div className="order-3 sm:order-4 hidden sm:flex items-center gap-1 shrink-0">
          <IconButton variant="ghost" size="lg" onClick={handleEdit} aria-label={opening ? 'Editar saldo inicial' : 'Editar'}>
            <Pencil size={12} />
          </IconButton>
          {opening ? null : pendingDelete ? (
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
              size="lg"
              onClick={handleDeleteDesktop}
              aria-label="Eliminar"
            >
              <Trash2 size={12} />
            </IconButton>
          )}
        </div>

        {/* Mobile action — 44px (WCAG 2.5.5 touch target), matching the sibling rows.
            Desktop stays at 36, where there is a pointer. */}
        <IconButton
          variant="ghost"
          size="xl"
          className="order-3 sm:order-4 sm:hidden shrink-0"
          onClick={() => setSheetOpen(true)}
          aria-label="Opciones"
        >
          <MoreVertical size={20} />
        </IconButton>
      </div>

      <RowActionsSheet
        open={sheetOpen}
        onOpenChange={setSheetOpen}
        title={desc ?? '—'}
        subtitle={`${fmtDate(entry.date)} · ${fmtMonth(entry.monthKey)}`}
        onEdit={handleEdit}
        onDelete={opening ? undefined : handleDeleteDirect}
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

  const ledger = selectedAccount
    ? buildLedger(selectedAccount.id, selectedAccount, db)
    : []

  // Show newest first
  const ledgerDesc = [...ledger].reverse()


  const selIsCredit  = selectedAccount?.type === 'credit'

  // A synthetic entry, not a real one: the opening balance is a field on the Account, so
  // it never enters buildLedger — putting it there would double-count it against the very
  // running balance it seeds. It exists only to render.
  const openingEntry: LedgerEntry | null = selectedAccount?.startingBalance != null
    ? {
        id: 'opening',
        date: '',
        monthKey: '',
        type: 'egreso',   // unused: `opening` overrides the mark, the sign and the actions
        desc: selIsCredit ? 'Deuda inicial' : 'Saldo inicial',
        amount: selectedAccount.startingBalance,
        currency: selectedAccount.currency,
        convertedAmount: selIsCredit
          ? Math.max(-selectedAccount.startingBalance, 0)
          : selectedAccount.startingBalance,
        balance: selectedAccount.startingBalance,
      }
    : null

  return (
    <div className="space-y-5">
      {/* Accounts header + grid */}
      <div>
        <div className="flex items-center justify-between mb-3">
          <h2 className="ts-heading-section">Cuentas</h2>
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
              <div key={a.id} className="grid shrink-0 w-[46%] min-w-[150px] [&>*]:min-w-0 sm:w-auto sm:min-w-0">
                <AccountCardView
                  account={a}
                  size="sm"
                  selected={selectedId === a.id}
                  onClick={() => setSelectedId(a.id)}
                />
              </div>
            ))}
          </div>
        )}
      </div>


      {/* Account page: the summary card carries identity, the edit action and the headline
          figures; the container below is the movements and nothing else. */}
      {selectedAccount && <AccountSummaryCard account={selectedAccount} />}

      {/* LedgerContainer — no header. Four of the six things its header showed are in the
          card above; the movement count was noise over a list you can see, and
          Entradas/Salidas summed the WHOLE history (buildLedger walks every month) while
          sitting under a chart labelled "últimos 30 días" — two time scales, neither
          written down. When they return they bring their period with them. */}
      {selectedAccount && (
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
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
            {/* The opening balance closes the list, oldest-last like everything above it.
                It used to sit as a tinted strip between the header and the movements,
                which read as a section label rather than as the first thing the account
                did. */}
            {openingEntry && (
              <LedgerRow
                key="opening"
                entry={openingEntry}
                account={selectedAccount}
                accounts={accounts}
                opening
              />
            )}
          </div>
        </div>
      )}
    </div>
  )
}
