import { useFinanceStore } from '@/store/financeStore'
import { monthKey } from '@/store/financeStore'
import { buildAnnualData } from '@/lib/calc'
import { COP, USD, pct } from '@/lib/format'
import { MetricCard } from '@/components/ui/MetricCard'
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
    return <div className="text-center py-6 text-[13px] text-[var(--n-txt3)]">Sin meses registrados en {year}</div>
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
          value={<span className="text-[15px]">{COP(totBruto)}</span>}
          sub={`${USD(totUSD)} + ${COP(totCOP)}`}
        />
        <MetricCard
          label="SS pagado"
          value={<span className="text-[15px] text-[#378ADD]">{COP(totSS)}</span>}
          sub={`${pct(totSS, totBruto)} del bruto`}
        />
        <MetricCard
          label="Manutención"
          value={<span className="text-[15px] text-[#1D9E75]">{COP(totGast)}</span>}
          sub={`${pct(totGast, totBruto)} del bruto`}
        />
        <MetricCard
          label="Neto libre acum."
          value={<span className="text-[15px] text-[#639922]">{COP(totNeto)}</span>}
          sub={`${pct(totNeto, totBruto)} del bruto`}
        />
      </div>

      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full border-collapse text-[12px]">
          <thead>
            <tr className="border-b border-[var(--n-border2)]">
              <th className="text-left py-[6px] px-[6px] text-[var(--n-txt3)] font-medium">Mes</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--n-txt3)] font-medium">Bruto COP</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--n-txt3)] font-medium">SS</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--n-txt3)] font-medium">Manut.</th>
              <th className="text-right py-[6px] px-[6px] text-[var(--n-txt3)] font-medium">Neto libre</th>
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
                    'border-b border-[var(--n-border)] cursor-pointer hover:bg-[var(--n-bg2)] transition-colors',
                    isCurrent ? 'bg-[var(--n-bg2)]' : '',
                  ].join(' ')}
                >
                  <td className="py-[7px] px-[6px] text-[var(--n-txt2)] font-medium">
                    {MONTHS[r.m].slice(0, 3)}
                  </td>
                  <td className="py-[7px] px-[6px] text-right">{COP(r.bruto ?? 0)}</td>
                  <td className="py-[7px] px-[6px] text-right text-[#378ADD]">{COP(r.ssTot ?? 0)}</td>
                  <td className="py-[7px] px-[6px] text-right text-[#1D9E75]">{COP(r.gast ?? 0)}</td>
                  <td className="py-[7px] px-[6px] text-right font-semibold text-[#639922]">
                    {COP(Math.max(r.netoLibre ?? 0, 0))}
                  </td>
                </tr>
              )
            })}
          </tbody>
          <tfoot>
            <tr className="border-t border-[var(--n-border2)]">
              <td className="py-[7px] px-[6px] text-[var(--n-txt3)] text-[11px]">TOTAL</td>
              <td className="py-[7px] px-[6px] text-right font-semibold">{COP(totBruto)}</td>
              <td className="py-[7px] px-[6px] text-right font-semibold text-[#378ADD]">{COP(totSS)}</td>
              <td className="py-[7px] px-[6px] text-right font-semibold text-[#1D9E75]">{COP(totGast)}</td>
              <td className="py-[7px] px-[6px] text-right font-bold text-[#639922]">{COP(totNeto)}</td>
            </tr>
          </tfoot>
        </table>
      </div>
    </div>
  )
}
