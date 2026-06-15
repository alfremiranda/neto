import { useFinanceStore } from '@/store/financeStore'
import { calcTotales, calcIBC, calcSS, calcGastos, calcDistribucion } from '@/lib/calc'
import { COP } from '@/lib/format'
import { ProgressBar } from '@/components/ui/ProgressBar'

export function DistribucionCard() {
  const { getCurrentMonth, getSMMLV, curKey } = useFinanceStore()
  const month = getCurrentMonth()
  const [y] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { bruto } = calcTotales(month.incomes, month.trm)
  const ibc = calcIBC(month.incomes, month.trm, smmlv)
  const { total: ssTot } = calcSS(ibc)
  const gast = calcGastos(month.egresos || [], month.trm)
  const { ret, prim, netoLibre } = calcDistribucion(bruto, ssTot, gast)

  const p = (v: number) => bruto > 0 ? Math.round(v / bruto * 100) : 0

  const bars = [
    { label: 'Obligaciones SS',  value: ssTot,     color: '#378ADD', pct: p(ssTot) },
    { label: 'Egresos',          value: gast,      color: '#1D9E75', pct: p(gast) },
    { label: 'Prov. retención',  value: ret,       color: '#EF9F27', pct: p(ret) },
    { label: 'Prov. primas',     value: prim,      color: '#D4537E', pct: p(prim) },
    { label: 'Neto libre',       value: netoLibre, color: '#639922', pct: p(netoLibre) },
  ]

  return (
    <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
      <div className="flex items-center gap-[5px] text-[12px] font-medium text-[var(--n-txt2)] mb-[10px]">
        <span>📊</span>
        <span>Distribución del ingreso</span>
      </div>
      <div className="space-y-3">
        {bars.map((b, i) => (
          <ProgressBar
            key={b.label}
            label={b.label}
            value={COP(b.value)}
            pct={b.pct}
            color={b.color}
            className={i === bars.length - 1 ? '' : undefined}
          />
        ))}
      </div>
    </div>
  )
}
