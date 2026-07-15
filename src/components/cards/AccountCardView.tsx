import { Landmark, Coins, CreditCard, PiggyBank, Pencil, Star, CalendarClock } from 'lucide-react'
import { Fragment } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { computeAccountBalance, creditCardStats } from '@/lib/calc'
import { COP, fmtDate } from '@/lib/format'
import { CurrencyBadge } from '@/components/ui/Badge'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'

const KIND_LABEL: Record<string, string> = { cuenta: 'Cta Ahorros', cdt: 'CDT', inversion: 'Inversión' }

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
 * Account card (Figma design): header (type icon · name · favorite star),
 * a meta line (currency badge | kind | account number), the amount on its own
 * line, type-specific info, and an Editar action. `sm` is the compact
 * dashboard variant (meta + amount only).
 */
export function AccountCardView({ account, size = 'lg', selected = false, onClick }: AccountCardViewProps) {
  const { db, toggleAccountFavorite } = useFinanceStore()
  const { setEditingAccount, openSheet } = useUIStore()

  const latestKey = Object.keys(db).filter(k => k !== '_settings').sort().at(-1) ?? ''
  const balance = computeAccountBalance(account.id, account, db, latestKey)
  // The card already carries a currency badge, so amounts use "$" for both
  // currencies (USD keeps 2 decimals) instead of the redundant "USD " prefix.
  const fmt = (n: number) =>
    account.currency === 'USD'
      ? '$' + (Math.round(n * 100) / 100).toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
      : COP(n)

  const isCredit  = account.type === 'credit'
  const isSavings = account.type === 'savings'
  const isCash    = account.type === 'cash'
  const TypeIcon  = isCredit ? CreditCard : isSavings ? PiggyBank : isCash ? Coins : Landmark
  const cc        = isCredit ? creditCardStats(account, balance) : null
  const hasConfig = isCredit ? account.creditLimit != null : account.startingBalance != null
  const sm        = size === 'sm'

  const monthlyYield = account.rate > 0 ? balance * (account.rate / 100) / 12 : 0
  const maturityDays = isSavings && account.maturityDate ? daysUntil(account.maturityDate) : null
  const amountStr    = !hasConfig ? null : isCredit ? fmt(cc!.limit) : fmt(balance)

  // Meta line parts after the currency badge (pipe-separated)
  const metaParts: string[] = []
  if (isSavings) metaParts.push(KIND_LABEL[account.savingsKind ?? 'cuenta'])
  if (!isCash && account.number) metaParts.push(account.number)

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
        selected
          ? 'border-2 border-[var(--primary)] bg-[var(--color-income-bg)]'
          : 'border border-[var(--border)] bg-card hover:border-[var(--primary)]/40',
      )}
    >
      {/* Header: icon · name · favorite (gap 6) */}
      <div className="flex items-center gap-1.5 w-full">
        <TypeIcon size={13} className="text-muted-foreground shrink-0" />
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

      {/* Info block — meta · amount · primary sub-lines, tight (gap 0) */}
      <div className="flex flex-col">
        {/* Meta: currency badge | kind | number */}
        <div className="flex items-center gap-1.5 min-w-0">
          <CurrencyBadge currency={account.currency} />
          {metaParts.map((p, i) => (
            <Fragment key={i}>
              <span className="text-[11px] text-muted-foreground/50">|</span>
              <span className="text-[11px] font-mono tabular-nums text-muted-foreground truncate">{p}</span>
            </Fragment>
          ))}
        </div>

        {/* Amount */}
        {amountStr
          ? <div className="text-xl font-bold font-heading tabular-nums leading-snug text-foreground">{amountStr}</div>
          : <div className="text-sm font-normal text-muted-foreground">Sin configurar</div>}

        {/* Primary sub-lines (large only) */}
        {!sm && hasConfig && account.type === 'account' && account.rate > 0 && (
          <div className="text-[11px] tabular-nums text-[var(--color-provision)]">
            ≈ {fmt(monthlyYield)}/mes · {account.rate}% a.a.
          </div>
        )}
        {!sm && hasConfig && isCredit && (
          <>
            <div className="text-xs font-mono tabular-nums text-[var(--color-danger-txt)]">
              −{fmt(cc!.debt)} deuda
            </div>
            <div className="text-[11px] tabular-nums text-muted-foreground">
              {Math.round(cc!.utilization * 100)}% usado
            </div>
          </>
        )}
        {!sm && hasConfig && isSavings && account.rate > 0 && (
          <div className="text-[11px] tabular-nums text-[var(--color-provision)]">
            ≈ {fmt(monthlyYield)}/mes · {account.rate}% E.A.
          </div>
        )}
      </div>

      {/* Secondary block — separated by the card gap (8px) */}
      {!sm && hasConfig && isCredit && (account.cutoffDay || account.dueDay) && (
        <div className="text-[11px] tabular-nums text-muted-foreground">
          {account.cutoffDay ? `Corte ${account.cutoffDay}` : ''}
          {account.cutoffDay && account.dueDay ? ' · ' : ''}
          {account.dueDay ? `Pago ${account.dueDay}` : ''}
        </div>
      )}
      {!sm && hasConfig && isSavings && maturityDays != null && (
        <div className="text-[11px] tabular-nums text-muted-foreground flex items-center gap-1">
          <CalendarClock size={10} className="shrink-0" />
          {maturityDays >= 0 ? `Vence en ${maturityDays} d` : 'Vencido'} · {fmtDate(account.maturityDate!)}
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
