import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { MONTHS } from '@/data/defaults'

export function MonthNav() {
  const { curKey, prevMonth, nextMonth } = useFinanceStore()
  const [y, m] = curKey.split('-').map(Number)

  return (
    <div className="flex items-center gap-[6px] justify-center">
      <button
        onClick={prevMonth}
        disabled={m === 0}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--n-border2)] bg-transparent text-[var(--n-txt)] hover:bg-[var(--n-bg2)] disabled:opacity-25 disabled:pointer-events-none transition-colors active:scale-95"
      >
        <ChevronLeft size={16} />
      </button>
      <span className="text-[17px] font-bold whitespace-nowrap min-w-[148px] sm:min-w-[148px] min-w-[120px] text-center">
        {MONTHS[m]} {y}
      </span>
      <button
        onClick={nextMonth}
        disabled={m === 11}
        className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--n-border2)] bg-transparent text-[var(--n-txt)] hover:bg-[var(--n-bg2)] disabled:opacity-25 disabled:pointer-events-none transition-colors active:scale-95"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
