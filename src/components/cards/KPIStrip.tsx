import type { KeyboardEvent } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import { useMonthData } from '@/hooks/useMonthData'
import { useSettingsStore } from '@/store/settingsStore'
import { useDeductionGroups } from '@/hooks/useDeductionGroups'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD, localToday } from '@/lib/format'
import { cn } from '@/lib/utils'
import { Card } from '@/components/ui/card'
import { Tooltip, TooltipTrigger, TooltipContent } from '@/components/ui/tooltip'
import { EGRESO_CATEGORIAS } from '@/data/defaults'

type DetailLine = { label: string; value: string; dim?: boolean; separator?: boolean }

interface KPICardProps {
  label: string
  value: string
  sub?: string
  accentToken?: string
  accent?: string
  detail?: DetailLine[]
  onClick?: () => void   // jump to the matching Mes tab
}

function KPITooltipContent({ lines }: { lines: DetailLine[] }) {
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) =>
        line.separator ? (
          <div key={i} className="border-t border-white/20 my-1.5" />
        ) : (
          <div key={i} className={cn('flex items-baseline justify-between gap-3', line.dim && 'opacity-50')}>
            <span className="ts-detail-large text-background/60 truncate">{line.label}</span>
            <span className="ts-amount-small shrink-0">{line.value}</span>
          </div>
        )
      )}
    </div>
  )
}

function KPICard({ label, value, sub, accentToken, accent, detail, onClick }: KPICardProps) {
  const clickable = !!onClick
  const clickProps = clickable
    ? {
        role: 'button' as const,
        tabIndex: 0,
        onClick,
        onKeyDown: (e: KeyboardEvent) => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); onClick!() } },
      }
    : {}
  const cardCls = cn(
    'p-[17px] flex flex-col gap-1.5 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]',
    clickable ? 'cursor-pointer hover:border-[var(--primary)]/40 transition-colors' : detail ? 'cursor-help' : '',
  )
  const inner = (
    <>
      <div className="ts-label-micro uppercase text-muted-foreground">
        {label}
      </div>
      <div
        className={cn('ts-amount-hero', !accentToken && (accent ?? 'text-foreground'))}
        style={accentToken ? { color: `var(${accentToken})` } : undefined}
      >
        {value}
      </div>
      {sub && (
        <div className="ts-detail-large text-muted-foreground">{sub}</div>
      )}
    </>
  )

  if (!detail || detail.length === 0) {
    return <Card className={cardCls} {...clickProps}>{inner}</Card>
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Card className={cardCls} {...(clickable ? clickProps : { tabIndex: 0 })}>
          {inner}
        </Card>
      </TooltipTrigger>
      <TooltipContent side="bottom">
        <KPITooltipContent lines={detail} />
      </TooltipContent>
    </Tooltip>
  )
}

function egresoCategory(category: string) {
  return EGRESO_CATEGORIAS.find(c => c.id === category)?.label ?? 'Otros'
}

const GRID_BY_COUNT: Record<number, string> = {
  3: 'grid-cols-1 sm:grid-cols-3 lg:grid-cols-3',
  4: 'grid-cols-2 sm:grid-cols-2 lg:grid-cols-4',
  5: 'grid-cols-2 sm:grid-cols-3 lg:grid-cols-5',
}

export function KPIStrip({ onNavigate }: { onNavigate?: (tab: string) => void } = {}) {
  const { getSMMLV, curKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { showObligaciones, showProvisiones } = useDeductionGroups()
  const month = useMonthData()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { bruto, totUSD } = calcTotales(month.incomes, month.trm)
  const ibc       = calcIBC(month.incomes, month.trm, smmlv)
  const gast      = calcGastos(month.egresos || [], month.trm, localToday())
  const provBase  = calcProvisionBase(month.incomes, month.trm)
  const res       = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase, smmlv)

  const pct = (n: number) => bruto > 0 ? `${Math.round(n / bruto * 100)}% del bruto` : undefined

  const retencionItems = res.provItems.filter(i => i.id === 'retencion')
  const retencionTotal = retencionItems.reduce((a, i) => a + i.amount, 0)
  const provItems      = res.provItems.filter(i => i.id !== 'retencion')
  const provTotal      = provItems.reduce((a, i) => a + i.amount, 0)
                       + res.volItems.reduce((a, i) => a + i.amount, 0)
  const obligTotal     = res.ssTotal + retencionTotal

  const TO_TXT: Record<string, string> = {
    '--color-provision': '--color-provision-txt',
    '--color-expense':   '--color-expense-txt',
    '--color-tax':       '--color-tax-txt',
    '--color-net':       '--color-net-txt',
    '--color-income':    '--color-income-txt',
    '--color-danger':    '--color-danger-txt',
  }
  const toTxt = (t: string) => TO_TXT[t] ?? t

  const provToken = toTxt(provItems.find(i => i.applies)?.color ?? '--color-provision')

  // --- Breakdown details ---

  const ingresoDetail: DetailLine[] = month.incomes.length > 0
    ? month.incomes.map(inc => ({
        label: inc.desc || inc.account,
        value: inc.currency === 'USD' ? USD(inc.amount) : COP(inc.amount),
      }))
    : []

  const obligDetail: DetailLine[] = [
    ...res.ssItems.map(i => ({ label: `${i.label} (${i.pct}%)`, value: COP(i.amount) })),
    ...(res.ssItems.length > 0 && retencionItems.length > 0
      ? [{ label: '', value: '', separator: true } as DetailLine]
      : []),
    ...retencionItems.map(i => ({ label: `Retención en la fuente (${i.pct}%)`, value: COP(i.amount) })),
  ]

  const provDetail: DetailLine[] = [
    ...provItems.filter(i => i.applies && i.amount > 0).map(i => ({
      label: i.label,
      value: COP(i.amount),
    })),
    ...(provItems.filter(i => i.applies && i.amount > 0).length > 0 && res.volItems.filter(i => i.applies && i.amount > 0).length > 0
      ? [{ label: '', value: '', separator: true } as DetailLine]
      : []),
    ...res.volItems.filter(i => i.applies && i.amount > 0).map(i => ({
      label: i.label,
      value: COP(i.amount),
    })),
  ]

  // Group egresos by category
  const egresosByCategory = (month.egresos || []).reduce<Record<string, number>>((acc, e) => {
    const amtCOP = e.currency === 'USD' ? e.amount * month.trm : e.amount
    if (amtCOP === 0) return acc
    const cat = egresoCategory(e.category)
    acc[cat] = (acc[cat] ?? 0) + amtCOP
    return acc
  }, {})
  const egresoDetail: DetailLine[] = Object.entries(egresosByCategory)
    .sort(([, a], [, b]) => b - a)
    .map(([cat, amt]) => ({ label: cat, value: COP(amt) }))

  const netoDetail: DetailLine[] = bruto > 0 ? [
    { label: 'Ingreso bruto',         value: COP(bruto) },
    ...(showObligaciones && obligTotal > 0 ? [{ label: '− Oblig. tributarias', value: COP(obligTotal) }] : []),
    ...(showProvisiones && provTotal > 0  ? [{ label: '− Provisiones',        value: COP(provTotal) }] : []),
    { label: '− Gastos',              value: COP(gast) },
    { label: '', value: '', separator: true },
    { label: 'Neto libre',            value: COP(Math.max(res.netoLibre, 0)) },
    ...(res.netoLibre < 0
      ? [{ label: 'Salió de otro saldo', value: COP(-res.netoLibre) }]
      : []),
  ] : []

  // "Neto libre" answers how much of THIS month's income is still free, so when the month
  // overspends the honest answer to that question really is zero — none of what came in is
  // left. What you spent beyond it came from somewhere else (a previous balance, savings,
  // a card), which is a different fact and gets its own line.
  //
  // Showing a big negative instead would claim something untrue: that you are in the red
  // overall, when it may only have been an expensive month lived off what was already
  // there. It also cannot sit in the distribution bar, which splits the gross into four
  // parts that add up to it.
  const overspend = res.netoLibre < 0 ? -res.netoLibre : 0

  const kpis = [
    <KPICard
      key="bruto"
      label="Ingreso bruto"
      value={COP(bruto)}
      sub={bruto > 0 ? USD(totUSD) : 'Sin ingresos este mes'}
      detail={ingresoDetail.length > 0 ? ingresoDetail : undefined}
      onClick={onNavigate ? () => onNavigate('ingresos') : undefined}
    />,
    showObligaciones && (
      <KPICard
        key="oblig"
        label="O. Tributarias"
        value={COP(obligTotal)}
        sub={pct(obligTotal)}
        accentToken="--color-tax-txt"
        detail={obligDetail.length > 0 ? obligDetail : undefined}
        onClick={onNavigate ? () => onNavigate('tributarias') : undefined}
      />
    ),
    showProvisiones && (
      <KPICard
        key="prov"
        label="Provisiones"
        value={COP(provTotal)}
        sub={pct(provTotal)}
        accentToken={provToken}
        detail={provDetail.length > 0 ? provDetail : undefined}
        onClick={onNavigate ? () => onNavigate('provisiones') : undefined}
      />
    ),
    <KPICard
      key="egresos"
      label="Gastos"
      value={COP(gast)}
      sub={pct(gast)}
      accent="text-[var(--color-expense-txt)]"
      detail={egresoDetail.length > 0 ? egresoDetail : undefined}
      onClick={onNavigate ? () => onNavigate('gastos') : undefined}
    />,
    <KPICard
      key="neto"
      label="Neto libre"
      value={COP(Math.max(res.netoLibre, 0))}
      sub={overspend > 0 ? `Gastaste ${COP(overspend)} más de lo que entró` : pct(Math.max(res.netoLibre, 0))}
      // A negative net takes the expense colour, not danger: the sign carries the
      // meaning, and danger is for something going wrong rather than for a number
      // that came out below zero (token-migration.json, behaviourChanges).
      accent={res.netoLibre > 0 ? 'text-[var(--color-net-txt)]' : 'text-[var(--color-expense-txt)]'}
      detail={netoDetail.length > 0 ? netoDetail : undefined}
    />,
  ].filter(Boolean)

  return (
    <div className={cn('grid gap-3 mb-5', GRID_BY_COUNT[kpis.length] ?? GRID_BY_COUNT[5])}>
      {kpis}
    </div>
  )
}
