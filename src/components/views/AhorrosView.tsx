import { useState } from 'react'
import { PiggyBank, Plus, ArrowLeftRight, TrendingUp, CalendarClock, Landmark } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { buildLedger, computeAccountBalance } from '@/lib/calc'
import { COP, USD, fmtDate } from '@/lib/format'
import { DEFAULTS } from '@/data/defaults'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'
import { CurrencyBadge } from '@/components/ui/Badge'
import { SectionCard } from '@/components/ui/SectionCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import type { Account } from '@/types'

const KIND_LABEL: Record<string, string> = { cuenta: 'Cuenta', cdt: 'CDT', inversion: 'Inversión' }

function daysUntil(dateStr: string): number {
  const now = new Date()
  const target = new Date(dateStr + 'T00:00:00')
  return Math.ceil((target.getTime() - now.getTime()) / 86_400_000)
}

// ─── Savings account card ──────────────────────────────────────────────────────

function SavingsCard({ account, balance, selected, onClick }: {
  account: Account; balance: number; selected: boolean; onClick: () => void
}) {
  const { setEditingAccount, openSheet } = useUIStore()
  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)
  const kind = account.savingsKind ?? 'cuenta'
  const monthlyYield = account.rate > 0 ? balance * (account.rate / 100) / 12 : 0
  const maturityDays = account.maturityDate ? daysUntil(account.maturityDate) : null

  return (
    <div
      role="button"
      tabIndex={0}
      aria-pressed={selected}
      onClick={onClick}
      onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && onClick()}
      className={cn(
        'rounded-xl p-4 cursor-pointer transition-all border-2 flex flex-col gap-2 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
        selected
          ? 'border-[var(--primary)] bg-[var(--color-income-bg)]'
          : 'border-[var(--border)] bg-card hover:border-[rgba(0,0,0,0.18)]',
      )}
    >
      <div className="flex items-center justify-between gap-1">
        <div className="flex items-center gap-1.5 min-w-0 flex-1">
          <PiggyBank size={12} className="text-[var(--n-txt3)] shrink-0" />
          <span className="text-xs text-muted-foreground font-medium truncate min-w-0">{account.label}</span>
        </div>
        <CurrencyBadge currency={account.currency} />
      </div>

      <div>
        <div className="text-lg font-bold tabular-nums font-heading leading-tight text-[var(--color-net-txt)]">
          {fmt(balance)}
        </div>
        <div className="text-[10px] font-medium text-muted-foreground uppercase tracking-wide mt-0.5">{KIND_LABEL[kind]}</div>
      </div>

      {account.rate > 0 && (
        <div className="text-2xs text-[var(--color-provision)] tabular-nums -mt-1">
          ≈ {fmt(monthlyYield)}/mes · {account.rate}% E.A.
        </div>
      )}
      {maturityDays != null && (
        <div className="text-2xs text-muted-foreground tabular-nums flex items-center gap-1">
          <CalendarClock size={10} className="shrink-0" />
          {maturityDays >= 0 ? `Vence en ${maturityDays} d` : 'Vencido'} · {fmtDate(account.maturityDate!)}
        </div>
      )}

      <Button
        size="xs"
        variant="ghost"
        onClick={e => { e.stopPropagation(); setEditingAccount(account.id); openSheet('account-edit') }}
        className={cn('mt-auto self-start gap-1 font-medium', selected ? 'bg-primary/10 text-primary hover:bg-primary/20' : 'bg-muted text-muted-foreground hover:text-foreground')}
      >
        Editar
      </Button>
    </div>
  )
}

// ─── View ────────────────────────────────────────────────────────────────────

export function AhorrosView() {
  const { db, getAccounts } = useFinanceStore()
  const primaryCurrency = useSettingsStore(s => s.primaryCurrency)
  const { openSheet, setEditingAccount, setEditingTransfer, setNewAccountType } = useUIStore()

  const accounts = getAccounts()
  const savings  = accounts.filter(a => a.type === 'savings')

  const allKeys  = Object.keys(db).filter(k => k !== '_settings').sort()
  const latestKey = allKeys[allKeys.length - 1] ?? ''
  const trm = (db[latestKey] as { trm?: number } | undefined)?.trm || DEFAULTS.trm

  const [selectedId, setSelectedId] = useState<string>(savings[0]?.id ?? '')
  const selected = savings.find(a => a.id === selectedId) ?? savings[0]

  // Total saved, converted to the user's primary currency
  const totalPrimary = savings.reduce((sum, a) => {
    const bal = computeAccountBalance(a.id, a, db, latestKey)
    if (a.currency === primaryCurrency) return sum + bal
    return sum + (primaryCurrency === 'COP' ? bal * trm : bal / trm)
  }, 0)
  const fmtPrimary = (n: number) => primaryCurrency === 'USD' ? USD(n) : COP(n)

  function newSavings() {
    setNewAccountType('savings'); setEditingAccount(null); openSheet('account-edit')
  }

  const ledger = selected ? [...buildLedger(selected.id, selected, db)].reverse() : []
  const fmtSel = (n: number) => selected?.currency === 'USD' ? USD(n) : COP(n)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-2">
        <h2 className="text-sm font-semibold text-muted-foreground uppercase tracking-wide">Ahorros e inversiones</h2>
        <div className="flex items-center gap-2">
          <Button size="sm" variant="outline" onClick={() => { setEditingTransfer(null); openSheet('transfer') }}>
            <ArrowLeftRight />
            <span className="hidden xs:inline">Aporte</span>
          </Button>
          <Button size="sm" onClick={newSavings}>
            <Plus />
            <span className="hidden xs:inline">Nueva cuenta</span>
          </Button>
        </div>
      </div>

      {savings.length === 0 ? (
        <Empty>
          <EmptyHeader>
            <EmptyMedia variant="icon"><PiggyBank size={14} /></EmptyMedia>
            <EmptyTitle>Sin ahorros ni inversiones</EmptyTitle>
            <EmptyDescription>Crea una cuenta de ahorro, CDT o inversión y registra aportes con movimientos desde tus cuentas</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={newSavings}><Plus size={13} />Nueva cuenta de ahorro</Button>
          </EmptyContent>
        </Empty>
      ) : (
        <>
          {/* Total saved */}
          <SectionCard icon={TrendingUp} title="Total ahorrado">
            <div className="text-2xl font-bold font-heading tabular-nums text-[var(--color-net-txt)]">
              {fmtPrimary(totalPrimary)}
            </div>
            <div className="text-xs text-muted-foreground mt-0.5">
              {savings.length} {savings.length === 1 ? 'cuenta' : 'cuentas'} · equivalente en {primaryCurrency}
            </div>
          </SectionCard>

          {/* Savings account cards */}
          <div className="grid gap-3" style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(160px, 1fr))' }}>
            {savings.map(a => (
              <SavingsCard
                key={a.id}
                account={a}
                balance={computeAccountBalance(a.id, a, db, latestKey)}
                selected={selected?.id === a.id}
                onClick={() => setSelectedId(a.id)}
              />
            ))}
          </div>

          {/* Selected account contributions */}
          {selected && (
            <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="px-4 py-3 border-b border-[var(--border)] flex items-center justify-between gap-3">
                <div className="min-w-0">
                  <div className="text-sm font-semibold truncate">{selected.label}</div>
                  <div className="text-xs text-muted-foreground mt-0.5">{ledger.length} movimiento{ledger.length !== 1 ? 's' : ''}</div>
                </div>
                <div className="text-right shrink-0">
                  <div className="text-[10px] text-muted-foreground">Saldo</div>
                  <div className="text-sm font-bold tabular-nums font-heading text-[var(--color-net-txt)]">
                    {fmtSel(computeAccountBalance(selected.id, selected, db, latestKey))}
                  </div>
                </div>
              </div>
              <div className="px-4">
                {ledger.length === 0 ? (
                  <Empty className="border-0 py-6">
                    <EmptyHeader>
                      <EmptyMedia variant="icon"><Landmark size={14} /></EmptyMedia>
                      <EmptyTitle>Sin aportes</EmptyTitle>
                      <EmptyDescription>Registra un aporte con un movimiento hacia esta cuenta</EmptyDescription>
                    </EmptyHeader>
                  </Empty>
                ) : (
                  ledger.map(e => {
                    const inflow = e.convertedAmount >= 0
                    return (
                      <div key={e.id} className="flex items-center gap-3 py-2.5 border-b border-[var(--border)] last:border-0">
                        <div className="flex-1 min-w-0">
                          <div className="text-sm truncate">{e.desc}</div>
                          <div className="text-xs text-muted-foreground">{fmtDate(e.date)}</div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className={cn('text-sm font-semibold tabular-nums font-heading', inflow ? 'text-[var(--color-provision)]' : 'text-foreground')}>
                            {inflow ? '+' : ''}{fmtSel(e.convertedAmount)}
                          </div>
                          <div className="text-[10px] text-muted-foreground tabular-nums">{fmtSel(e.balance)}</div>
                        </div>
                      </div>
                    )
                  })
                )}
              </div>
            </div>
          )}
        </>
      )}
    </div>
  )
}
