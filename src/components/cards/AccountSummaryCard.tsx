import { useState, Fragment } from 'react'
import { Pencil, CalendarDays, Star } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { computeAccountBalance, creditCardStats } from '@/lib/calc'
import { COP, USD, fmtDate, localToday } from '@/lib/format'
import { AccountAvatar } from '@/components/ui/AccountAvatar'
import { CurrencyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { AccountChart, hasChartSpan } from '@/components/cards/AccountChart'
import { ChartRange } from '@/components/ui/ChartRange'
import { availableRanges, type RangeId } from '@/lib/chartRange'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'
import type { ReactNode } from 'react'

const KIND_LABEL: Record<string, string> = { cuenta: 'Cta Ahorros', cdt: 'CDT', inversion: 'Inversión' }

/**
 * The header of an account page: identity, the meta line, at most two figures, and the
 * chart with its range strip.
 *
 * It does NOT replace AccountCardView. That one is the compact tile in the grid — a
 * control you press to choose an account. This is the detail of the account you are
 * already inside, so it has no selected state and it carries the actions the tile hides.
 */
export function AccountSummaryCard({ account, chart }: { account: Account; chart?: ReactNode }) {
  const { db, toggleAccountFavorite } = useFinanceStore()
  const { openSheet, setEditingAccount } = useUIStore()

  const allKeys   = Object.keys(db).filter(k => k !== '_settings').sort()
  const latestKey = allKeys[allKeys.length - 1] ?? ''
  const balance   = computeAccountBalance(account.id, account, db, latestKey)
  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)

  const isCredit  = account.type === 'credit'
  const isSavings = account.type === 'savings'
  const isCash    = account.type === 'cash'
  const cc = isCredit ? creditCardStats(account, balance) : null
  const monthlyYield = account.rate > 0 ? balance * (account.rate / 100) / 12 : 0

  const ranges = availableRanges(account, db, localToday())
  const [range, setRange] = useState<RangeId | null>(null)
  // Default to the widest window the account can offer: opening on the shortest would
  // show a near-empty chart for an account with years of history.
  const active = range && ranges.some(r => r.id === range) ? range : ranges[ranges.length - 1]?.id
  const from   = ranges.find(r => r.id === active)?.start
  const hasChart = !!chart || hasChartSpan(account, db, from)

  const [picked, setPicked] = useState<{ date: string; value: number } | null>(null)

  /**
   * The meta line is a list of FIELDS, not a string. Each one is its own node named after
   * the Account field it comes from, and a field with no value simply is not in the list —
   * so nothing has to be parsed apart and no orphan separator is left behind.
   */
  const facts: ReactNode[] = [<CurrencyBadge key="currency" currency={account.currency} />]
  if (!isCash && account.number) facts.push(<span key="number">{account.number}</span>)
  if (isCredit && account.creditLimit != null) {
    facts.push(<span key="utilization">{Math.round(cc!.utilization * 100)}% usado</span>)
  }
  if (isSavings) facts.push(<span key="kind">{KIND_LABEL[account.savingsKind ?? 'cuenta']}</span>)
  if (!isCash && account.rate > 0) {
    facts.push(<span key="rate">{account.rate}% {isSavings ? 'E.A.' : 'a.a.'}</span>)
    facts.push(<span key="yield">≈ {fmt(monthlyYield)}/mes</span>)
  }

  /**
   * One rule decides which group a field goes in: does it name a DATE you have to act on?
   * If so it belongs in the chip; if not, in the flat run. Bank accounts and cash get no
   * chip at all — an empty chip is not a quieter chip, it is a border around nothing.
   */
  const schedule: string[] = []
  if (isCredit) {
    if (account.cutoffDay) schedule.push(`Corte ${account.cutoffDay}`)
    if (account.dueDay)    schedule.push(`Pago ${account.dueDay}`)
  }
  if (isSavings && account.savingsKind === 'cdt' && account.maturityDate) {
    schedule.push(`Vence ${fmtDate(account.maturityDate)}`)
  }

  // At most two, and the rightmost is the headline. A bank account and cash have one:
  // there is no second quantity to show, and a padded slot would invent one.
  const secondary = isCredit
    ? { label: 'Deuda', value: `-${fmt(cc!.debt)}`, tone: 'debt' as const }
    : isSavings && account.rate > 0
      ? { label: 'Intereses', value: `≈+${fmt(monthlyYield)}`, tone: 'yield' as const }
      : null
  const primary = picked
    ? { label: fmtDate(picked.date), value: fmt(isCredit ? Math.max(-picked.value, 0) : picked.value) }
    : isCredit
      ? { label: 'Cupo', value: fmt(account.creditLimit ?? 0) }
      : { label: 'Saldo actual', value: fmt(balance) }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex flex-col gap-4">

      {/* top — identity beside the figures on desktop, above them on mobile */}
      <div className="flex flex-col sm:flex-row sm:items-start gap-3">

        <div className="flex-1 min-w-0 flex flex-col gap-2">
          {/* title-row · identity */}
          <div className="flex items-center gap-2 min-w-0">
            <AccountAvatar account={account} size="sm" />
            <span className="ts-body-base-emphasis truncate">{account.label}</span>
            <button
              type="button"
              onClick={() => toggleAccountFavorite(account.id)}
              aria-label={account.favorite ? 'Quitar de favoritos' : 'Marcar como favorito'}
              aria-pressed={!!account.favorite}
              className="shrink-0 -m-1 p-1 rounded-full hover:bg-muted transition-colors"
            >
              <Star
                size={14}
                className={cn(account.favorite ? 'text-[var(--color-fav-selected-txt)]' : 'text-muted-foreground/60')}
                fill={account.favorite ? 'currentColor' : 'none'}
              />
            </button>
          </div>

          {/* meta-row. One `flex-wrap` declaration, not one per variant: Figma has to
              decide wrapping state by state because it draws one at a time, but CSS wraps
              only when it overflows, so all four behaviours fall out on their own. What
              drops to the next line is the whole chip, which is what you want — a squeezed
              or clipped chip would be worse than one on its own line. */}
          <div className="flex flex-wrap items-center gap-x-2 gap-y-1.5 min-w-0">
            {facts.map((f, i) => (
              <Fragment key={i}>
                {i > 0 && <Separator orientation="vertical" className="h-3.5" />}
                <span className="ts-detail-large text-muted-foreground">{f}</span>
              </Fragment>
            ))}
            {schedule.length > 0 && (
              <>
                <Separator orientation="vertical" className="h-3.5" />
                <span
                  className="inline-flex items-center gap-1.5 py-0.5 px-1.5 rounded-2xl bg-[var(--bg-surface)]"
                  style={{ border: '1px solid var(--account-summary-card-meta-chip-border)' }}
                >
                  <CalendarDays size={12} className="text-[var(--fg-subtle)] shrink-0" />
                  {schedule.map((sch, i) => (
                    <Fragment key={sch}>
                      {i > 0 && <Separator orientation="vertical" className="h-3" />}
                      <span className="ts-detail-large text-[var(--fg-subtle)]">{sch}</span>
                    </Fragment>
                  ))}
                </span>
              </>
            )}
          </div>

          <Button
            variant="outline"
            size="sm"
            className="self-start"
            onClick={() => { setEditingAccount(account.id); openSheet('account-edit') }}
          >
            <Pencil size={13} /> Editar
          </Button>
        </div>

        {/* metrics — right-aligned beside the identity on desktop; their own row, spread
            across the width, on mobile. */}
        <div className="flex items-end justify-between sm:justify-end gap-6 shrink-0">
          {secondary && (
            <div className="text-right">
              <div className="ts-detail-base text-muted-foreground">{secondary.label}</div>
              <div className={cn(
                'ts-amount-base',
                secondary.tone === 'debt'  && 'text-[var(--color-expense-txt)]',
                secondary.tone === 'yield' && 'text-[var(--color-provision)]',
              )}>
                {secondary.value}
              </div>
            </div>
          )}
          <div className="text-right">
            <div className="ts-detail-base text-muted-foreground">{primary.label}</div>
            <div className="ts-amount-large">{primary.value}</div>
          </div>
        </div>
      </div>

      {/* divider · chart · range. A separator only exists to separate something, so it
          arrives with the chart — and the chart is absent until the account has movements
          on more than one day. */}
      {hasChart && (
        <>
          <Separator />
          {chart ?? <AccountChart account={account} from={from} onSelect={setPicked} />}
          <ChartRange ranges={ranges} value={active as RangeId} onChange={setRange} />
        </>
      )}
    </div>
  )
}
