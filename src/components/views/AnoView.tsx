import { useState } from 'react'
import { TrendChart } from '@/components/annual/TrendChart'
import { AnnualTable } from '@/components/annual/AnnualTable'
import { ConfigCard } from '@/components/annual/ConfigCard'
import { useFinanceStore } from '@/store/financeStore'

export function AnoView() {
  const { db } = useFinanceStore()
  const currentYear = new Date().getFullYear()

  const years = [...new Set([
    ...Object.keys(db).filter(k => k !== '_settings').map(k => k.split('-')[0]),
    String(currentYear),
  ])].sort().reverse()

  const [year, setYear] = useState(currentYear)

  return (
    <div className="space-y-[10px]">
      <TrendChart />

      <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
        <div className="flex items-center justify-between mb-3">
          <div className="text-[12px] font-medium text-[var(--n-txt2)] flex items-center gap-[5px]">
            <span>📅</span>
            <span>Resumen anual</span>
          </div>
          <select
            value={year}
            onChange={e => setYear(parseInt(e.target.value))}
            className="border border-[var(--n-border2)] rounded-lg px-2 py-1 bg-[var(--n-bg)] text-[var(--n-txt)] text-[13px] appearance-none"
          >
            {years.map(y => <option key={y} value={y}>{y}</option>)}
          </select>
        </div>
        <AnnualTable year={year} />
      </div>

      <ConfigCard />
    </div>
  )
}
