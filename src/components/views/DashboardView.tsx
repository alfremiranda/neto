import { useState, useMemo } from 'react'
import { WalletCards, Landmark, Wallet, CreditCard, CalendarRange, Download, Plus, ChevronDown, TrendingUp, TrendingDown, ArrowLeftRight, PiggyBank } from 'lucide-react'
import type { MonthData } from '@/types'
import { TrendChart } from '@/components/annual/TrendChart'
import { EgresosCategoryChart } from '@/components/annual/EgresosCategoryChart'
import { EgresosBreakdown } from '@/components/annual/EgresosBreakdown'
import { AnnualTable } from '@/components/annual/AnnualTable'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useAuthStore } from '@/store/authStore'
import { useUIStore } from '@/store/uiStore'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'
import { CurrencyBadge } from '@/components/ui/Badge'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { computeAccountBalance } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { exportAnnualCSV } from '@/lib/export'
import { cn } from '@/lib/utils'

// ─── Greeting + desktop add button ───────────────────────────────────────────

function greeting() {
  const h = new Date().getHours()
  return h < 12 ? 'Buenos días' : h < 18 ? 'Buenas tardes' : 'Buenas noches'
}

function DashboardHeader() {
  const user = useAuthStore(s => s.user)
  const displayName = useSettingsStore(s => s.displayName)
  const { openSheet, setEditingIncome, setEditingEgreso, setEditingTransfer, setEditingVoluntaria } = useUIStore()
  const [open, setOpen] = useState(false)

  const oauthName = (user?.user_metadata?.full_name ?? user?.user_metadata?.user_name ?? '') as string
  const firstName = (displayName.trim() || oauthName).split(' ')[0]

  const actions = [
    { label: 'Ingreso',           Icon: TrendingUp,      onClick: () => { setEditingIncome(null);     openSheet('income')     } },
    { label: 'Egreso',            Icon: TrendingDown,    onClick: () => { setEditingEgreso(null);     openSheet('egreso')     } },
    { label: 'Movimiento',        Icon: ArrowLeftRight,  onClick: () => { setEditingTransfer(null);   openSheet('transfer')   } },
    { label: 'Ahorro voluntario', Icon: PiggyBank,       onClick: () => { setEditingVoluntaria(null); openSheet('voluntaria') } },
  ]

  return (
    <div className="flex items-center justify-between gap-4 pb-1">
      <div>
        <h1 className="text-xl font-bold font-heading leading-tight">
          {greeting()}{firstName ? `, ${firstName}` : ''}
        </h1>
      </div>

      {/* Desktop-only add button — FAB covers mobile */}
      <Popover open={open} onOpenChange={setOpen}>
        <PopoverTrigger asChild>
          <Button size="sm" className="hidden sm:inline-flex gap-1.5 shrink-0">
            <Plus size={13} />
            Agregar
            <ChevronDown size={11} className={cn('transition-transform duration-150', open && 'rotate-180')} />
          </Button>
        </PopoverTrigger>
        <PopoverContent align="end" className="w-44 p-1">
          {actions.map(({ label, Icon, onClick }) => (
            <button
              key={label}
              type="button"
              onClick={() => { setOpen(false); setTimeout(onClick, 50) }}
              className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-[var(--muted)] transition-colors text-left"
            >
              <Icon size={13} className="text-[var(--primary)] shrink-0" />
              {label}
            </button>
          ))}
        </PopoverContent>
      </Popover>
    </div>
  )
}

// ─── Accounts overview ────────────────────────────────────────────────────────

function AccountsOverview() {
  const { db, getAccounts } = useFinanceStore()
  const { setView, openSheet, setEditingAccount } = useUIStore()
  const accounts = getAccounts()
  const userAccounts = accounts.filter(a => !a.locked)

  function handleAddAccount() {
    setEditingAccount(null)
    openSheet('account-edit')
  }

  if (userAccounts.length === 0) {
    return (
      <SectionCard icon={WalletCards} title="Cuentas">
        <Empty className="border-0 py-2">
          <EmptyHeader>
            <EmptyMedia variant="icon"><WalletCards size={14} /></EmptyMedia>
            <EmptyTitle>Sin cuentas configuradas</EmptyTitle>
            <EmptyDescription>Agrega tus cuentas bancarias para ver sus saldos aquí</EmptyDescription>
          </EmptyHeader>
          <EmptyContent>
            <Button size="sm" onClick={handleAddAccount}>
              Agregar cuenta
            </Button>
            <Button size="sm" variant="ghost" onClick={() => setView('cuentas')}>
              Ir a Cuentas
            </Button>
          </EmptyContent>
        </Empty>
      </SectionCard>
    )
  }

  const latestKey = Object.keys(db).filter(k => k !== '_settings').sort().at(-1) ?? ''

  return (
    <SectionCard
      icon={WalletCards}
      title="Cuentas"
      action={
        <Button size="sm" variant="outline" onClick={() => setView('cuentas')}>
          Ver todo
        </Button>
      }
    >
      <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-3">
        {accounts.map(a => {
          const balance    = computeAccountBalance(a.id, a, db, latestKey)
          const isCredit   = a.type === 'credit'
          const hasBalance = isCredit ? a.creditLimit != null : a.startingBalance != null
          const fmt        = a.currency === 'USD' ? USD : COP
          const TypeIcon   = isCredit ? CreditCard : a.type === 'cash' ? Wallet : Landmark
          const debt       = isCredit ? Math.max(-balance, 0) : 0

          return (
            <button
              key={a.id}
              type="button"
              onClick={() => { setEditingAccount(a.id); openSheet('account-edit') }}
              className={cn(
                'text-left rounded-xl border border-[var(--border)] bg-card p-3.5 flex flex-col gap-2',
                'hover:border-[var(--primary)]/40 hover:bg-[var(--primary)]/3 transition-colors',
              )}
            >
              <div className="flex items-center gap-1.5 min-w-0">
                <TypeIcon size={11} className="text-muted-foreground shrink-0" />
                <span className="text-xs text-muted-foreground font-medium truncate flex-1 min-w-0">{a.label}</span>
                <CurrencyBadge currency={a.currency} />
              </div>
              <div className={cn(
                'text-base font-bold tabular-nums font-heading leading-tight',
                !hasBalance && 'text-sm font-normal text-muted-foreground',
                hasBalance && isCredit && 'text-[var(--color-expense-txt)]',
              )}>
                {!hasBalance ? '—' : isCredit ? fmt(debt) : fmt(balance)}
              </div>
              {isCredit && hasBalance ? (
                <div className="text-[10px] text-muted-foreground tabular-nums -mt-1">
                  {fmt(Math.max((a.creditLimit ?? 0) - debt, 0))} disponible
                </div>
              ) : !a.locked && a.rate > 0 && hasBalance && (
                <div className="text-[10px] text-[var(--color-provision)] tabular-nums -mt-1">
                  {fmt(balance * (a.rate / 100) / 12)}/mes · {a.rate}% a.a.
                </div>
              )}
            </button>
          )
        })}
      </div>
    </SectionCard>
  )
}

// ─── Dashboard ────────────────────────────────────────────────────────────────

export function DashboardView() {
  const { db, getSMMLV } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { showToast } = useUIStore()
  const now = new Date()
  const currentYear = now.getFullYear()
  const todayKey = `${currentYear}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const monthKeys = useMemo(
    () => Object.keys(db).filter(k => k !== '_settings' && k <= todayKey),
    // eslint-disable-next-line react-hooks/exhaustive-deps
    [db],
  )

  const years = useMemo(() => [...new Set([
    ...monthKeys.map(k => k.split('-')[0]),
    String(currentYear),
  ])].sort().reverse(), [monthKeys, currentYear])

  const [year,      setYear]      = useState(currentYear)
  const [exporting, setExporting] = useState(false)

  const yearMonthKeys = useMemo(
    () => monthKeys.filter(k => k.startsWith(String(year))),
    [monthKeys, year],
  )

  const hasYearData = useMemo(
    () => yearMonthKeys.some(k => {
      const m = db[k] as MonthData
      return (m.incomes?.length ?? 0) > 0 || (m.egresos?.length ?? 0) > 0
    }),
    [yearMonthKeys, db],
  )

  const hasYearEgresos = useMemo(
    () => yearMonthKeys.some(k => ((db[k] as MonthData).egresos?.length ?? 0) > 0),
    [yearMonthKeys, db],
  )

  const hasTrendData = useMemo(
    () => monthKeys.some(k => ((db[k] as MonthData).incomes?.length ?? 0) > 0),
    [monthKeys, db],
  )

  function handleExport() {
    setExporting(true)
    try {
      exportAnnualCSV(db as Record<string, MonthData>, year, getSMMLV, deductions)
      showToast(`CSV ${year} descargado`)
    } catch {
      showToast('Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">

      <DashboardHeader />
      <AccountsOverview />

      {hasYearData && (
        <SectionCard
          icon={CalendarRange}
          title="Resumen anual"
          action={
            <div className="flex items-center gap-2">
              <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
                <SelectTrigger size="sm" className="w-auto">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
                </SelectContent>
              </Select>
              <Button
                size="sm"
                variant="outline"
                onClick={handleExport}
                disabled={exporting}
                title={`Exportar ${year} como CSV`}
              >
                <Download size={12} />
                CSV
              </Button>
            </div>
          }
        >
          <AnnualTable year={year} />
        </SectionCard>
      )}

      {hasTrendData && <TrendChart />}
      {hasYearEgresos && <EgresosBreakdown year={year} />}
      {hasYearEgresos && <EgresosCategoryChart year={year} />}

    </div>
  )
}
