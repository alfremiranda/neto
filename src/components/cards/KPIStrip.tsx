import { useFinanceStore } from '@/store/financeStore'
import { useMonthData } from '@/hooks/useMonthData'
import { useSettingsStore } from '@/store/settingsStore'
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
}

function KPITooltipContent({ lines }: { lines: DetailLine[] }) {
  return (
    <div className="space-y-0.5">
      {lines.map((line, i) =>
        line.separator ? (
          <div key={i} className="border-t border-white/20 my-1.5" />
        ) : (
          <div key={i} className={cn('flex items-baseline justify-between gap-3', line.dim && 'opacity-50')}>
            <span className="text-[11px] text-background/60 truncate">{line.label}</span>
            <span className="text-[11px] font-mono font-medium tabular-nums shrink-0">{line.value}</span>
          </div>
        )
      )}
    </div>
  )
}

function KPICard({ label, value, sub, accentToken, accent, detail }: KPICardProps) {
  const inner = (
    <>
      <div className="text-[10px] font-semibold font-sans uppercase tracking-[1px] text-muted-foreground">
        {label}
      </div>
      <div
        className={cn('text-xl font-semibold font-heading leading-none tabular-nums', !accentToken && (accent ?? 'text-foreground'))}
        style={accentToken ? { color: `var(${accentToken})` } : undefined}
      >
        {value}
      </div>
      {sub && (
        <div className="text-[11px] text-muted-foreground">{sub}</div>
      )}
    </>
  )

  if (!detail || detail.length === 0) {
    return <Card className="p-[17px] flex flex-col gap-1.5">{inner}</Card>
  }

  return (
    <Tooltip delayDuration={200}>
      <TooltipTrigger asChild>
        <Card
          tabIndex={0}
          className="p-[17px] flex flex-col gap-1.5 cursor-help focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]"
        >
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

export function KPIStrip() {
  const { getSMMLV, curKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const month = useMonthData()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { bruto, totUSD } = calcTotales(month.incomes, month.trm)
  const ibc       = calcIBC(month.incomes, month.trm, smmlv)
  const gast      = calcGastos(month.egresos || [], month.trm, localToday())
  const provBase  = calcProvisionBase(month.incomes, month.trm, ibc)
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
    { label: '− Oblig. tributarias',  value: COP(obligTotal) },
    { label: '− Provisiones',         value: COP(provTotal) },
    { label: '− Egresos',             value: COP(gast) },
    { label: '', value: '', separator: true },
    { label: 'Neto libre',            value: COP(Math.max(res.netoLibre, 0)) },
  ] : []

  return (
    <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3 mb-5">
      <KPICard
        label="Ingreso bruto"
        value={COP(bruto)}
        sub={bruto > 0 ? USD(totUSD) : 'Sin ingresos este mes'}
        detail={ingresoDetail.length > 0 ? ingresoDetail : undefined}
      />
      <KPICard
        label="O. Tributarias"
        value={COP(obligTotal)}
        sub={pct(obligTotal)}
        accentToken="--color-tax-txt"
        detail={obligDetail.length > 0 ? obligDetail : undefined}
      />
      <KPICard
        label="Provisiones"
        value={COP(provTotal)}
        sub={pct(provTotal)}
        accentToken={provToken}
        detail={provDetail.length > 0 ? provDetail : undefined}
      />
      <KPICard
        label="Egresos"
        value={COP(gast)}
        sub={pct(gast)}
        accent="text-[var(--color-expense-txt)]"
        detail={egresoDetail.length > 0 ? egresoDetail : undefined}
      />
      <KPICard
        label="Neto libre"
        value={COP(Math.max(res.netoLibre, 0))}
        sub={pct(Math.max(res.netoLibre, 0))}
        accent={res.netoLibre > 0 ? 'text-[var(--color-net-txt)]' : 'text-[var(--color-danger-txt)]'}
        detail={netoDetail.length > 0 ? netoDetail : undefined}
      />
    </div>
  )
}
