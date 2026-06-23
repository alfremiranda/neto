import { Route } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useMonthData } from '@/hooks/useMonthData'
import { useSettingsStore } from '@/store/settingsStore'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { SectionCard } from '@/components/ui/SectionCard'
import { DEFAULTS } from '@/data/defaults'

export function FlujoCard() {
  const { getSMMLV, curKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const month = useMonthData()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc   = calcIBC(month.incomes, month.trm, smmlv)
  const gast  = calcGastos(month.egresos || [], month.trm)
  const provBase = calcProvisionBase(month.incomes, month.trm, ibc)
  const res   = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase)

  // COP obligations → Bancolombia (SS + egresos)
  const aBancolCOP = res.ssTotal + gast
  const aBancolUSD = aBancolCOP / month.trm

  // Savings/provisions → ARQ Savings (all non-SS deductions)
  const aARQCOP = res.nonSsTotal
  const aARQUSD = aARQCOP / month.trm

  // Net free
  const netoU   = totUSD - aBancolUSD - aARQUSD
  const interest = aARQUSD * (DEFAULTS.arq_savings_rate / 12)

  const steps = [
    {
      num: 1,
      title: <>Bancolombia <Badge variant="cop">COP</Badge></>,
      desc:  'SS + egresos del mes',
      amount: COP(aBancolCOP),
      sub:    USD(aBancolUSD),
    },
    {
      num: 2,
      title: <>ARQ Savings <Badge variant="usd">3.5% USD</Badge></>,
      desc:  'Provisiones (retención, primas…)',
      amount: USD(aARQUSD),
      sub:    COP(aARQCOP),
    },
    {
      num: 3,
      title: <>Neto libre <Badge variant="usd">USD</Badge></>,
      desc:  'Disponible ARQ principal',
      amount: USD(netoU),
      sub:    COP(netoU * month.trm),
    },
  ]

  return (
    <SectionCard icon={Route} title="Flujo recomendado">
      <div className="space-y-0">
        {steps.map(s => (
          <div key={s.num} className="flex gap-[10px] items-start py-[9px] border-b border-[var(--border)] last:border-0">
            <div className="w-5 h-5 rounded-full bg-[var(--color-income-bg)] text-[var(--color-income-txt)] text-xs font-semibold flex items-center justify-center shrink-0 mt-0.5">
              {s.num}
            </div>
            <div className="flex-1">
              <div className="text-sm font-medium flex items-center gap-1 flex-wrap">{s.title}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.desc}</div>
            </div>
            <div className="text-right shrink-0">
              <div className="text-sm font-semibold font-heading tabular-nums">{s.amount}</div>
              <div className="text-xs text-muted-foreground mt-0.5">{s.sub}</div>
            </div>
          </div>
        ))}
      </div>

      {interest > 0 && (
        <div className="mt-3 text-xs text-[var(--color-provision)] text-right tabular-nums">
          ≈ {USD(interest)}/mes interés ARQ Savings
        </div>
      )}
    </SectionCard>
  )
}
