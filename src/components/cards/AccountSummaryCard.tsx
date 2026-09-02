import { useState } from 'react'
import { Pencil } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { buildLedger, computeAccountBalance, creditCardStats } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { AccountAvatar } from '@/components/ui/AccountAvatar'
import { CurrencyBadge } from '@/components/ui/Badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ACCOUNT_TYPE_LABEL } from '@/data/defaults'
import { AccountChart } from '@/components/cards/AccountChart'
import { ChartRange } from '@/components/ui/ChartRange'
import { Progress } from '@/components/ui/Progress'
import { availableRanges, type RangeId } from '@/lib/chartRange'
import { localToday } from '@/lib/format'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'
import type { ReactNode } from 'react'

const KIND_LABEL: Record<string, string> = { cuenta: 'Cta Ahorros', cdt: 'CDT', inversion: 'Inversión' }

/**
 * The header of an account page: identity, the headline figures, and (later) the chart.
 *
 * It does NOT replace AccountCardView. That one is the compact selectable tile in the
 * grid — a control you press to choose an account. This is the detail of the account you
 * are already inside, so it has no selected state and it carries the actions and figures
 * the tile deliberately hides at `size="sm"`.
 *
 * Those figures are why this exists now: the ledger used to carry a header holding the
 * account's name, its edit action, its detail line and its current balance, and Design
 * removed that header on the grounds that this card already owns them. It did in Figma;
 * it did not in code.
 *
 * The detail line is broken into discrete metrics rather than one run-on string
 * (`≈ $37,92/mes · 3.5% a.a.`). A string cannot align, wrap or be read out as pairs, and
 * the anatomy Design named — metrics / metric — says pairs.
 */
export function AccountSummaryCard({ account, chart }: { account: Account; chart?: ReactNode }) {
  const db = useFinanceStore(s => s.db)
  const { openSheet, setEditingAccount } = useUIStore()
  const ranges = availableRanges(account, db, localToday())
  // Default to the widest window the account can actually offer: opening on the shortest
  // would show a near-empty chart for an account with years of history.
  const [range, setRange] = useState<RangeId | null>(null)
  // The chart's selected point. It is read out in the metrics rather than only in a
  // floating bubble: there is no hover on touch, so a tooltip-only readout tells a phone
  // nothing. Hover and tap do the same thing — move this — and the card says it.
  const [picked, setPicked] = useState<{ date: string; value: number } | null>(null)
  const active = range && ranges.some(r => r.id === range) ? range : ranges[ranges.length - 1]?.id
  const from   = ranges.find(r => r.id === active)?.start

  // Whether there is a chart at all: movements on at least two distinct days. Asked here
  // as well as inside AccountChart so the divider does not survive an empty chart.
  const hasChart = !!chart || new Set(
    buildLedger(account.id, account, db).map(e => e.date),
  ).size >= 2

  const allKeys   = Object.keys(db).filter(k => k !== '_settings').sort()
  const latestKey = allKeys[allKeys.length - 1] ?? ''
  const balance   = computeAccountBalance(account.id, account, db, latestKey)

  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)

  const isCredit  = account.type === 'credit'
  const isSavings = account.type === 'savings'
  const isCash    = account.type === 'cash'

  const metaParts = [
    isSavings ? KIND_LABEL[account.savingsKind ?? 'cuenta'] : ACCOUNT_TYPE_LABEL[account.type ?? 'account'],
    ...(!isCash && account.number ? [account.number] : []),
  ]

  // Each type answers a different question, which is why this is a list built per type
  // rather than a fixed set of slots: a cash account has no rate to report and a credit
  // card's headline figure is a debt, not a balance.
  const metrics: { label: string; value: string; tone?: 'debt' | 'yield' }[] = []
  if (isCredit) {
    const s = creditCardStats(account, balance)
    metrics.push(picked
      ? { label: fmtDate(picked.date), value: fmt(Math.max(-picked.value, 0)), tone: 'debt' }
      : { label: 'Deuda actual', value: fmt(s.debt), tone: 'debt' })
    if (account.creditLimit != null) {
      metrics.push({ label: 'Cupo disponible', value: fmt(s.available) })
      metrics.push({ label: 'Usado', value: `${Math.round(s.utilization * 100)}%` })
    }
    if (account.cutoffDay) metrics.push({ label: 'Corte', value: `Día ${account.cutoffDay}` })
    if (account.dueDay)    metrics.push({ label: 'Pago', value: `Día ${account.dueDay}` })
  } else {
    metrics.push(picked
      ? { label: fmtDate(picked.date), value: fmt(picked.value) }
      : { label: 'Saldo actual', value: fmt(balance) })
    if (account.rate > 0 && !isCash) {
      metrics.push({ label: 'Rendimiento', value: `≈ ${fmt(balance * (account.rate / 100) / 12)}/mes`, tone: 'yield' })
      metrics.push({ label: 'Tasa', value: `${account.rate}% ${isSavings ? 'E.A.' : 'a.a.'}` })
    }
    if (isSavings && account.maturityDate) {
      metrics.push({ label: 'Vence', value: fmtDate(account.maturityDate) })
    }
  }

  return (
    <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] p-4 flex flex-col gap-4">

      {/* top · account-info */}
      <div className="flex items-start gap-3">
        <div className="flex-1 min-w-0 flex flex-col gap-1">
          {/* title-row · identity */}
          <div className="flex items-center gap-2 min-w-0">
            <AccountAvatar account={account} size="sm" />
            <span className="ts-body-base-emphasis truncate">{account.label}</span>
          </div>
          {/* account-meta */}
          <div className="flex items-center gap-1.5 min-w-0">
            <CurrencyBadge currency={account.currency} />
            {metaParts.map((p, i) => (
              <span key={i} className="flex items-center gap-1.5 min-w-0">
                <span className="text-[11px] text-muted-foreground/50">|</span>
                <span className="ts-amount-small text-muted-foreground truncate">{p}</span>
              </span>
            ))}
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          className="shrink-0"
          onClick={() => { setEditingAccount(account.id); openSheet('account-edit') }}
        >
          <Pencil size={13} /> Editar
        </Button>
      </div>

      {/* metrics */}
      <div className="flex flex-wrap gap-x-6 gap-y-3">
        {metrics.map(m => (
          <div key={m.label} className="min-w-0">
            <div className="ts-detail-base text-muted-foreground">{m.label}</div>
            <div className={cn(
              'ts-amount-base',
              m.tone === 'debt'  && 'text-[var(--color-expense-txt)]',
              m.tone === 'yield' && 'text-[var(--color-provision)]',
            )}>
              {m.value}
            </div>
          </div>
        ))}
      </div>

      {/* divider · chart — the divider only exists to separate something, so it appears
          with the chart and not before it (TASK-2026-08-24e §2.3/2.4). */}
      {/* Credit utilisation — the bar's other consumer. It was computed in calc.ts and
          printed as bare text ("12% usado") with nothing to see. */}
      {isCredit && account.creditLimit != null && (
        <Progress
          value={creditCardStats(account, balance).utilization}
          tone="expense"
          label={`${Math.round(creditCardStats(account, balance).utilization * 100)}% del cupo usado`}
        />
      )}

      {/* divider · chart · range.
          A separator only exists to separate something: it appears with the chart, and
          the chart itself is absent until the account has movements on more than one
          day. The strip renders itself away when the account cannot offer two windows. */}
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
