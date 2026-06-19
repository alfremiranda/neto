import { CalendarDays } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { monthKey } from '@/store/financeStore'
import { buildAnnualData } from '@/lib/calc'
import { COP, USD, pct } from '@/lib/format'
import { MetricCard } from '@/components/ui/MetricCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { MONTHS } from '@/data/defaults'

interface AnnualTableProps {
  year: number
}

export function AnnualTable({ year }: AnnualTableProps) {
  const { db, curKey, getSMMLV, setCurKey } = useFinanceStore()
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
          <EmptyDescription>Navega a un mes y agrega ingresos o egresos para ver el resumen anual</EmptyDescription>
        </EmptyHeader>
      </Empty>
    )
  }

  const totBruto = filled.reduce((a, r) => a + (r.bruto ?? 0), 0)
  const totSS    = filled.reduce((a, r) => a + (r.ssTot ?? 0), 0)
  const totRet   = filled.reduce((a, r) => a + (r.ret ?? 0), 0)
  const totOblig = totSS + totRet
  const totProv  = filled.reduce((a, r) => a + (r.prim ?? 0), 0)
  const totGast  = filled.reduce((a, r) => a + (r.gast ?? 0), 0)
  const totNeto  = filled.reduce((a, r) => a + Math.max(r.netoLibre ?? 0, 0), 0)
  const totUSD   = filled.reduce((a, r) => a + (r.totUSD ?? 0), 0)
  const totCOP   = filled.reduce((a, r) => a + (r.totCOP ?? 0), 0)

  // Colors
  const obligColor = '--color-tax-txt'
  const provColor  = deductions.find(d => d.group === 'provision' && d.id !== 'retencion' && d.enabled)?.color ?? '--color-provision'

  return (
    <div className="space-y-3">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 sm:grid-cols-3 gap-2">
        <MetricCard
          label="Bruto total año"
          value={<span className="text-[15px] font-heading tabular-nums">{COP(totBruto)}</span>}
          sub={`${USD(totUSD)} + ${COP(totCOP)}`}
        />
        <MetricCard
          label="Obligaciones tributarias"
          value={<span className="text-[15px] font-heading tabular-nums" style={{ color: `var(${obligColor})` }}>{COP(totOblig)}</span>}
          sub={`${pct(totOblig, totBruto)} del bruto`}
        />
        <MetricCard
          label="Provisiones"
          value={<span className="text-[15px] font-heading tabular-nums" style={{ color: `var(${provColor})` }}>{COP(totProv)}</span>}
          sub={`${pct(totProv, totBruto)} del bruto`}
        />
        <MetricCard
          label="Egresos"
          value={<span className="text-[15px] font-heading tabular-nums text-[var(--color-expense)]">{COP(totGast)}</span>}
          sub={`${pct(totGast, totBruto)} del bruto`}
        />
        <MetricCard
          label="Neto libre acum."
          value={<span className="text-[15px] font-heading tabular-nums text-[var(--color-net-txt)]">{COP(totNeto)}</span>}
          sub={`${pct(totNeto, totBruto)} del bruto`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-[6px] px-[6px] text-muted-foreground font-medium">Mes</th>
              <th className="text-right py-[6px] px-[6px] text-muted-foreground font-medium">Bruto</th>
              <th className="hidden sm:table-cell text-right py-[6px] px-[6px] font-medium" style={{ color: `var(${obligColor})` }}>Oblig.</th>
              <th className="hidden sm:table-cell text-right py-[6px] px-[6px] font-medium" style={{ color: `var(${provColor})` }}>Prov.</th>
              <th className="hidden xs:table-cell text-right py-[6px] px-[6px] text-[var(--color-expense)] font-medium">Egresos</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--color-net-txt)] font-medium">Neto</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.hasData).map(r => {
              const key = monthKey(r.m, year)
              const isCurrent = key === curKey
              const oblig = (r.ssTot ?? 0) + (r.ret ?? 0)
              return (
                <tr
                  key={r.m}
                  onClick={() => setCurKey(key)}
                  onKeyDown={e => (e.key === 'Enter' || e.key === ' ') && setCurKey(key)}
                  role="button"
                  tabIndex={0}
                  aria-pressed={isCurrent}
                  className={[
                    'border-b border-border cursor-pointer hover:bg-muted transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] focus-visible:ring-inset',
                    isCurrent ? 'bg-muted' : '',
                  ].join(' ')}
                >
                  <td className="py-[7px] px-[6px] text-muted-foreground font-medium">
                    {MONTHS[r.m - 1].slice(0, 3)}
                  </td>
                  <td className="py-[7px] px-[6px] text-right tabular-nums">{COP(r.bruto ?? 0)}</td>
                  <td className="hidden sm:table-cell py-[7px] px-[6px] text-right tabular-nums" style={{ color: `var(${obligColor})` }}>{COP(oblig)}</td>
                  <td className="hidden sm:table-cell py-[7px] px-[6px] text-right tabular-nums" style={{ color: `var(${provColor})` }}>{COP(r.prim ?? 0)}</td>
                  <td className="hidden xs:table-cell py-[7px] px-[6px] text-right tabular-nums text-[var(--color-expense)]">{COP(r.gast ?? 0)}</td>
                  <td className="py-[7px] px-[6px] text-right tabular-nums font-semibold text-[var(--color-net-txt)]">
                    {COP(Math.max(r.netoLibre ?? 0, 0))}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t-2 border-border">
              <td className="py-[7px] px-[6px] text-muted-foreground text-[11px] font-medium tracking-wider">TOTAL</td>
              <td className="py-[7px] px-[6px] text-right tabular-nums font-semibold">{COP(totBruto)}</td>
              <td className="hidden sm:table-cell py-[7px] px-[6px] text-right tabular-nums font-semibold" style={{ color: `var(${obligColor})` }}>{COP(totOblig)}</td>
              <td className="hidden sm:table-cell py-[7px] px-[6px] text-right tabular-nums font-semibold" style={{ color: `var(${provColor})` }}>{COP(totProv)}</td>
              <td className="hidden xs:table-cell py-[7px] px-[6px] text-right tabular-nums font-semibold text-[var(--color-expense)]">{COP(totGast)}</td>
              <td className="py-[7px] px-[6px] text-right tabular-nums font-bold text-[var(--color-net-txt)]">{COP(totNeto)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
