import { useFinanceStore } from '@/store/financeStore'
import { calcTotales, calcIBC, calcSS, calcGastos, calcDistribucion, calcFlujo } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'

export function FlujoCard() {
  const { getCurrentMonth, getSMMLV, curKey } = useFinanceStore()
  const month = getCurrentMonth()
  const [y] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc = calcIBC(month.incomes, month.trm, smmlv)
  const { total: ssTot } = calcSS(ibc)
  const gast = calcGastos(month.egresos || [], month.trm)
  const { ret, prim } = calcDistribucion(bruto, ssTot, gast)
  const { aBancol, aARQ, netoU, interest } = calcFlujo(ssTot, gast, ret, prim, month.trm, totUSD)

  const steps = [
    {
      num: 1,
      title: <>Bancolombia <Badge variant="cop">COP</Badge></>,
      desc: 'SS + egresos del mes',
      amount: COP(aBancol * month.trm),
      sub: USD(aBancol),
    },
    {
      num: 2,
      title: <>ARQ Savings <Badge variant="usd">3.5% USD</Badge></>,
      desc: 'Retención (año vencido) + primas',
      amount: USD(aARQ),
      sub: COP(aARQ * month.trm),
    },
    {
      num: 3,
      title: <>Neto libre <Badge variant="usd">USD</Badge></>,
      desc: 'Disponible ARQ principal',
      amount: USD(netoU),
      sub: COP(netoU * month.trm),
    },
  ]

  return (
    <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
      <div className="flex items-center gap-[5px] text-[12px] font-medium text-[var(--n-txt2)] mb-[10px]">
        <span>🔀</span>
        <span>Flujo recomendado</span>
      </div>

      <div className="space-y-0">
        {steps.map(s => (
          <div key={s.num} className="flex gap-[10px] items-start py-[9px] border-b border-[var(--n-border)] last:border-0">
            <div className="w-5 h-5 rounded-full bg-[var(--n-blue-bg)] text-[var(--n-blue-txt)] text-[11px] font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {s.num}
            </div>
            <div className="flex-1">
              <div className="text-[13px] font-medium flex items-center gap-1 flex-wrap">{s.title}</div>
              <div className="text-[11px] text-[var(--n-txt2)] mt-0.5">{s.desc}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-[13px] font-semibold">{s.amount}</div>
              <div className="text-[11px] text-[var(--n-txt3)] mt-0.5">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {interest > 0 && (
        <div className="mt-3 text-[11px] text-[var(--n-green)] text-right">
          ≈ {USD(interest)}/mes interés ARQ Savings
        </div>
      )}
    </div>
  )
}
