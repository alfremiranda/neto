import { Landmark, Wallet, CreditCard, PiggyBank, Pencil, Star, CalendarClock } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { computeAccountBalance, creditCardStats } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { CurrencyBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'

const KIND_LABEL: Record<string, string> = { cuenta: 'Cuenta', cdt: 'CDT', inversion: 'Inversión' }

function daysUntil(dateStr: string): number {
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target.getTime() - new Date().getTime()) / 86_400_000)
}

interface AccountCardViewProps {
  account: Account
  size?: 'lg' | 'sm'
  selected?: boolean
  onClick?: () => void
}

/**
 * Account card matching the Figma design: header (type icon · name · favorite
 * star), account number, currency badge inline with the amount, type-specific
 * info lines, and an Editar action. `sm` is the compact dashboard variant.
 */
export function AccountCardView({ account, size = 'lg', selected = false, onClick }: AccountCardViewProps) {
  const { db, getAccounts, toggleAccountFavorite } = useFinanceStore()
  const { setEditingAccount, openSheet } = useUIStore()

  void getAccounts // keep subscription stable
  const latestKey = Object.keys(db).filter(k => k !== '_settings').sort().at(-1) ?? ''
  const balance = computeAccountBalance(account.id, account, db, latestKey)
  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)

  const isCredit  = account.type === 'credit'
  const isSavings = account.type === 'savings'
  const isCash    = account.type === 'cash'
  const TypeIcon  = isCredit ? CreditCard : isSavings ? PiggyBank : isCash ? Wallet : Landmark
  const cc        = isCredit ? creditCardStats(account, balance) : null
  const hasConfig = isCredit ? account.creditLimit != null : account.startingBalance != null
  const sm        = size === 'sm'

  const monthlyYield = account.rate > 0 ? balance * (account.rate / 100) / 12 : 0
  const maturityDays = isSavings && account.maturityDate ? daysUntil(account.maturityDate) : null

  // Main amount: credit shows cupo total; others show balance
  const amountStr = !hasConfig ? null : isCredit ? fmt(cc!.limit) : fmt(balance)

  function openEdit() { setEditingAccount(account.id); openSheet('account-edit') }
  const handleClick = onClick ?? openEdit

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={handleClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && handleClick()}
      className={cn(
        'text-left rounded-xl p-4 flex flex-col gap-2 transition-all cursor-pointer focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        sm ? 'gap-1.5' : '',
        selected
          ? 'border-2 border-[var(--primary)] bg-[var(--color-income-bg)]'
          : 'border border-[var(--border)] bg-card hover:border-[var(--primary)]/40',
      )}
    >
      {/* Header: icon · name · favorite */}
      <div className="flex items-center gap-1.5 w-full">
        <TypeIcon size={12} className="text-muted-foreground shrink-0" />
        <span className="flex-1 min-w-0 text-xs font-medium text-muted-foreground truncate">{account.label}</span>
        <button
          type="button"
          onClick={e => { e.stopPropagation(); toggleAccountFavorite(account.id) }}
          aria-label={account.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
          aria-pressed={!!account.favorite}
          className="shrink-0 -m-1 p-1 rounded-full hover:bg-muted transition-colors"
        >
          <Star
            size={14}
            className={cn(account.favorite ? 'text-[var(--color-tax-txt)]' : 'text-muted-foreground/60')}
            fill={account.favorite ? 'currentColor' : 'none'}
          />
        </button>
      </div>

      {/* Account number */}
      {!isCash && account.number && (
        <div className="text-[10px] font-mono tabular-nums text-muted-foreground -mt-0.5">•••• {account.number}</div>
      )}

      {/* Currency badge + amount */}
      <div className="flex items-center gap-1.5">
        <CurrencyBadge currency={account.currency} />
        {amountStr
          ? <span className="text-lg font-bold font-heading tabular-nums leading-tight text-foreground">{amountStr}</span>
          : <span className="text-sm font-normal text-muted-foreground">Sin configurar</span>}
      </div>

      {/* Type-specific info (large only) */}
      {!sm && hasConfig && (
        <div className="flex flex-col gap-0.5">
          {/* Bank account rate */}
          {account.type === 'account' && account.rate > 0 && (
            <div className="text-[10px] tabular-nums text-[var(--color-provision)]">
              ≈ {fmt(monthlyYield)}/mes · {account.rate}% a.a.
            </div>
          )}
          {/* Credit card */}
          {isCredit && (
            <>
              <div className="text-[10px] tabular-nums text-[var(--color-expense-txt)]">
                −{fmt(cc!.debt)} deuda · {Math.round(cc!.utilization * 100)}% usado
              </div>
              {(account.cutoffDay || account.dueDay) && (
                <div className="text-[10px] tabular-nums text-muted-foreground">
                  {account.cutoffDay ? `Corte ${account.cutoffDay}` : ''}
                  {account.cutoffDay && account.dueDay ? ' · ' : ''}
                  {account.dueDay ? `Pago ${account.dueDay}` : ''}
                </div>
              )}
            </>
          )}
          {/* Savings */}
          {isSavings && (
            <>
              <div className="text-[10px] font-medium uppercase tracking-wide text-muted-foreground">
                {KIND_LABEL[account.savingsKind ?? 'cuenta']}
              </div>
              {account.rate > 0 && (
                <div className="text-[10px] tabular-nums text-[var(--color-provision)]">
                  ≈ {fmt(monthlyYield)}/mes · {account.rate}% E.A.
                </div>
              )}
              {maturityDays != null && (
                <div className="text-[10px] tabular-nums text-muted-foreground flex items-center gap-1">
                  <CalendarClock size={10} className="shrink-0" />
                  {maturityDays >= 0 ? `Vence en ${maturityDays} d` : 'Vencido'} · {fmtDate(account.maturityDate!)}
                </div>
              )}
            </>
          )}
        </div>
      )}

      {/* Editar (large only) */}
      {!sm && (
        <button
          type="button"
          onClick={e => { e.stopPropagation(); openEdit() }}
          className="mt-auto self-start inline-flex items-center gap-1 rounded-lg border border-[var(--border)] px-2 py-1 text-[11px] font-medium text-muted-foreground hover:text-foreground hover:bg-muted transition-colors"
        >
          <Pencil size={11} />
          Editar
        </button>
      )}
    </div>
  )
}
