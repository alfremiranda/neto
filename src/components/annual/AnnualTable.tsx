import { CalendarDays } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
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

  const dbAsMonthMap = Object.fromEntries(
    Object.entries(db).filter(([k]) => k !== '_settings')
  ) as Parameters<typeof buildAnnualData>[0]

  const rows = buildAnnualData(dbAsMonthMap, year, y => getSMMLV(y))
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
  const totGast  = filled.reduce((a, r) => a + (r.gast ?? 0), 0)
  const totNeto  = filled.reduce((a, r) => a + Math.max(r.netoLibre ?? 0, 0), 0)
  const totUSD   = filled.reduce((a, r) => a + (r.totUSD ?? 0), 0)
  const totCOP   = filled.reduce((a, r) => a + (r.totCOP ?? 0), 0)

  return (
    <div className="space-y-3">
      {/* Summary metrics */}
      <div className="grid grid-cols-2 gap-2">
        <MetricCard
          label="Bruto total año"
          value={<span className="text-[15px] font-heading tabular-nums">{COP(totBruto)}</span>}
          sub={`${USD(totUSD)} + ${COP(totCOP)}`}
        />
        <MetricCard
          label="SS pagado"
          value={<span className="text-[15px] font-heading tabular-nums text-[var(--n-blue)]">{COP(totSS)}</span>}
          sub={`${pct(totSS, totBruto)} del bruto`}
        />
        <MetricCard
          label="Egresos"
          value={<span className="text-[15px] font-heading tabular-nums text-[var(--n-green)]">{COP(totGast)}</span>}
          sub={`${pct(totGast, totBruto)} del bruto`}
        />
        <MetricCard
          label="Neto libre acum."
          value={<span className="text-[15px] font-heading tabular-nums text-[var(--n-lime)]">{COP(totNeto)}</span>}
          sub={`${pct(totNeto, totBruto)} del bruto`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-border">
              <th className="text-left py-[6px] px-[6px] text-muted-foreground font-medium">Mes</th>
              <th className="text-right py-[6px] px-[6px] text-muted-foreground font-medium">Bruto COP</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--n-blue)] font-medium">SS</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--n-green)] font-medium">Egresos</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--n-lime)] font-medium">Neto libre</th>
            </tr>
          </thead>
          <tbody>
            {rows.filter(r => r.hasData).map(r => {
              const key = monthKey(r.m, year)
              const isCurrent = key === curKey
              return (
                <tr
                  key={r.m}
                  onClick={() => setCurKey(key)}
                  className={[
                    'border-b border-border cursor-pointer hover:bg-muted transition-colors',
                    isCurrent ? 'bg-muted' : '',
                  ].join(' ')}
                >
                  <td className="py-[7px] px-[6px] text-muted-foreground font-medium">
                    {MONTHS[r.m - 1].slice(0, 3)}
                  </td>
                  <td className="py-[7px] px-[6px] text-right tabular-nums">{COP(r.bruto ?? 0)}</td>
                  <td className="py-[7px] px-[6px] text-right tabular-nums text-[var(--n-blue)]">{COP(r.ssTot ?? 0)}</td>
                  <td className="py-[7px] px-[6px] text-right tabular-nums text-[var(--n-green)]">{COP(r.gast ?? 0)}</td>
                  <td className="py-[7px] px-[6px] text-right tabular-nums font-semibold text-[var(--n-lime)]">
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
              <td className="py-[7px] px-[6px] text-right tabular-nums font-semibold text-[var(--n-blue)]">{COP(totSS)}</td>
              <td className="py-[7px] px-[6px] text-right tabular-nums font-semibold text-[var(--n-green)]">{COP(totGast)}</td>
              <td className="py-[7px] px-[6px] text-right tabular-nums font-bold text-[var(--n-lime)]">{COP(totNeto)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
