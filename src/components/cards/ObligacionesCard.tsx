import { useFinanceStore } from '@/store/financeStore'
import { calcTotales, calcIBC, calcSS } from '@/lib/calc'
import { COP, USD } from '@/lib/format'

export function ObligacionesCard() {
  const { getCurrentMonth, getSMMLV, curKey } = useFinanceStore()
  const month = getCurrentMonth()
  const [y] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc = calcIBC(month.incomes, month.trm, smmlv)
  const ss = calcSS(ibc)
  const ibcIsMin = ibc <= smmlv * 1.001

  return (
    <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
      <div className="flex items-center gap-[5px] text-[12px] font-medium text-[var(--n-txt2)] mb-[10px]">
        <span>🏛️</span>
        <span>Obligaciones fiscales</span>
      </div>

      {/* IBC */}
      <div className="bg-[var(--n-bg2)] rounded-lg px-[10px] py-2 mb-[6px] flex justify-between items-center">
        <div>
          <span className="text-[13px] text-[var(--n-txt2)]">IBC </span>
          <span className="text-[10px] text-[var(--n-txt3)]">
            {ibcIsMin ? '(mínimo SMMLV)' : '(40% servicios)'}
          </span>
        </div>
        <span className="text-[13px] font-medium">{COP(ibc)}</span>
      </div>

      {[
        { label: 'Salud (EPS)', value: ss.salud, usd: totUSD > 0 ? USD(ss.salud / month.trm) : undefined },
        { label: 'Pensión obligatoria', value: ss.pens, usd: totUSD > 0 ? USD(ss.pens / month.trm) : undefined },
        { label: 'ARL riesgo I', value: ss.arl, usd: totUSD > 0 ? USD(ss.arl / month.trm) : undefined },
      ].map(row => (
        <div key={row.label} className="flex justify-between items-center py-2 border-b border-[var(--n-border)]">
          <span className="text-[13px] text-[var(--n-txt2)]">{row.label}</span>
          <span className="text-right">
            <span className="text-[13px] font-medium">{COP(row.value)}</span>
            {row.usd && <span className="text-[11px] text-[var(--n-txt3)] ml-1">{row.usd}</span>}
          </span>
        </div>
      ))}

      <div className="flex justify-between items-center mt-3 bg-[var(--n-bg2)] rounded-lg px-[14px] py-[10px]">
        <span className="text-[13px] text-[var(--n-txt2)]">Total SS</span>
        <span className="text-[15px] font-semibold">{COP(ss.total)}</span>
      </div>

      {bruto === 0 && (
        <div className="text-center mt-3 text-[12px] text-[var(--n-txt3)]">
          Registra ingresos para calcular
        </div>
      )}
    </div>
  )
}
