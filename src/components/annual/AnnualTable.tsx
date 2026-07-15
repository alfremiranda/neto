import { CalendarDays } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { buildAnnualData } from '@/lib/calc'
import { COP, USD, pct } from '@/lib/format'
import { MetricCard } from '@/components/ui/MetricCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { deductionGroupFlags } from '@/hooks/useDeductionGroups'
import { cn } from '@/lib/utils'

interface AnnualTableProps {
  year: number
}

interface DonutSeg { key: string; label: string; amount: number; color: string }

// Donut of the gross composition (the KPI breakdown): obligations + provisions
// + expenses + free net all sum to the gross, shown in the center.
function AnnualDonut({ segments, total, centerValue }: { segments: DonutSeg[]; total: number; centerValue: string }) {
  const vb = 148, stroke = 14
  const r = (vb - stroke) / 2
  const c = vb / 2
  const circ = 2 * Math.PI * r
  let acc = 0

  return (
    <div className="flex flex-col items-center gap-4 w-full">
      <div className="relative w-full max-w-[220px] aspect-square">
        <svg viewBox={`0 0 ${vb} ${vb}`} className="w-full h-full -rotate-90">
          <circle cx={c} cy={c} r={r} fill="none" stroke="var(--muted)" strokeWidth={stroke} />
          {segments.map(s => {
            const len = total > 0 ? (s.amount / total) * circ : 0
            const seg = (
              <circle
                key={s.key} cx={c} cy={c} r={r} fill="none"
                stroke={`var(${s.color})`} strokeWidth={stroke}
                strokeDasharray={`${len} ${circ - len}`} strokeDashoffset={-acc}
              />
            )
            acc += len
            return seg
          })}
        </svg>
        <div className="absolute inset-0 flex flex-col items-center justify-center px-4 text-center">
          <div className="text-[15px] font-bold font-heading tabular-nums leading-tight">{centerValue}</div>
          <div className="text-[11px] text-muted-foreground">Bruto</div>
        </div>
      </div>

      <div className="flex flex-col gap-1.5">
        {segments.map(s => (
          <div key={s.key} className="flex items-center gap-2 text-xs">
            <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `var(${s.color})` }} />
            <span className="text-muted-foreground">{s.label}</span>
          </div>
        ))}
      </div>
    </div>
  )
}

export function AnnualTable({ year }: AnnualTableProps) {
  const { db, getSMMLV } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)

  const dbAsMonthMap = Object.fromEntries(
    Object.entries(db).filter(([k]) => k !== '_settings')
  ) as Parameters<typeof buildAnnualData>[0]

  const rows = buildAnnualData(dbAsMonthMap, year, y => getSMMLV(y), deductions)
  const filled = rows.filter(r => r.hasData)

  if (!filled.length) {
    return (
      <Empty>
        <EmptyHeader>
          <EmptyMedia variant="icon"><CalendarDays size={14} /></EmptyMedia>
          <EmptyTitle>Sin registros en {year}</EmptyTitle>
          <EmptyDescription>Navega a un mes y agrega ingresos o gastos para ver el resumen anual</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const totBruto = filled.reduce((a, r) => a + (r.bruto ?? 0), 0)
  const totSS    = filled.reduce((a, r) => a + (r.ssTot ?? 0), 0)
  const totRet   = filled.reduce((a, r) => a + (r.ret ?? 0), 0)
  const totOblig = totSS + totRet
  const totProv  = filled.reduce((a, r) => a + (r.provTotal ?? r.prim ?? 0), 0)
  const totGast  = filled.reduce((a, r) => a + (r.gast ?? 0), 0)
  const totNeto  = filled.reduce((a, r) => a + Math.max(r.netoLibre ?? 0, 0), 0)
  const totUSD   = filled.reduce((a, r) => a + (r.totUSD ?? 0), 0)
  const totCOP   = filled.reduce((a, r) => a + (r.totCOP ?? 0), 0)

  // Column visibility — show if the group is enabled OR there is historical
  // data, so switching to an employee profile never hides prior real numbers.
  const { ssEnabled, retencionEnabled, provisionesEnabled } = deductionGroupFlags(deductions)
  const showOblig = ssEnabled || retencionEnabled || totOblig > 0
  const showProv  = provisionesEnabled || totProv > 0

  // Colors
  const obligColor = '--color-tax-txt'
  const provColor  = deductions.find(d => d.group === 'provision' && d.id !== 'retencion' && d.enabled)?.color ?? '--color-provision'

  // Donut segments — the gross composition, mirroring the KPI cards
  const donutSegments: DonutSeg[] = []
  if (showOblig && totOblig > 0) donutSegments.push({ key: 'oblig', label: 'Obligaciones', amount: totOblig, color: '--color-tax' })
  if (showProv  && totProv  > 0) donutSegments.push({ key: 'prov',  label: 'Provisiones',  amount: totProv,  color: provColor })
  if (totGast > 0) donutSegments.push({ key: 'gast', label: 'Gastos',      amount: totGast, color: '--color-expense' })
  if (totNeto > 0) donutSegments.push({ key: 'neto', label: 'Neto libre',  amount: totNeto, color: '--color-net' })
  const donutTotal = donutSegments.reduce((s, x) => s + x.amount, 0)
  const showDonut = donutTotal > 0 && donutSegments.length > 1

  return (
    <div className={cn('space-y-4', showDonut && 'lg:grid lg:grid-cols-[1fr_2fr] lg:gap-5 lg:space-y-0 lg:items-start')}>
      {/* Donut — on top on mobile, left column on desktop */}
      {showDonut && (
        <div className="flex flex-col justify-center lg:col-start-1 lg:row-start-1 lg:self-stretch">
          <AnnualDonut segments={donutSegments} total={donutTotal} centerValue={COP(totBruto)} />
        </div>
      )}

      {/* KPI cards */}
      <div className={cn('grid grid-cols-2 sm:grid-cols-3 gap-2', showDonut && 'lg:col-start-2 lg:row-start-1')}>
        <MetricCard
          label="Bruto total año"
          value={<span className="text-[15px] font-heading tabular-nums">{COP(totBruto)}</span>}
          sub={`${USD(totUSD)} + ${COP(totCOP)}`}
        />
        {showOblig && (
          <MetricCard
            label="Obligaciones tributarias"
            value={<span className="text-[15px] font-heading tabular-nums" style={{ color: `var(${obligColor})` }}>{COP(totOblig)}</span>}
            sub={`${pct(totOblig, totBruto)} del bruto`}
          />
        )}
        {showProv && (
          <MetricCard
            label="Provisiones"
            value={<span className="text-[15px] font-heading tabular-nums" style={{ color: `var(${provColor})` }}>{COP(totProv)}</span>}
            sub={`${pct(totProv, totBruto)} del bruto`}
          />
        )}
        <MetricCard
          label="Gastos"
          value={<span className="text-[15px] font-heading tabular-nums text-[var(--color-expense)]">{COP(totGast)}</span>}
          sub={`${pct(totGast, totBruto)} del bruto`}
        />
        <MetricCard
          label="Neto libre acum."
          value={<span className="text-[15px] font-heading tabular-nums text-[var(--color-net-txt)]">{COP(totNeto)}</span>}
          sub={`${pct(totNeto, totBruto)} del bruto`}
        />
      </div>

    </div>
  )
}
