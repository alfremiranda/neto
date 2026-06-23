import { ChevronLeft, ChevronRight } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { MONTHS } from '@/data/defaults'

export function MonthNav() {
  const { curKey, prevMonth, nextMonth } = useFinanceStore()
  const [y, m] = curKey.split('-').map(Number)

  return (
    <div className="flex items-center gap-2 mx-auto w-fit">
      <button
        onClick={prevMonth}
        disabled={m === 0}
        aria-label="Mes anterior"
        className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-25 disabled:pointer-events-none transition-colors active:scale-95"
      >
        <ChevronLeft size={16} />
      </button>
      <h1 className="text-[17px] font-bold font-heading whitespace-nowrap min-w-[148px] text-center">
        {MONTHS[m]} {y}
      </h1>
      <button
        onClick={nextMonth}
        disabled={m === 11}
        aria-label="Mes siguiente"
        className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-25 disabled:pointer-events-none transition-colors active:scale-95"
      >
        <ChevronRight size={16} />
      </button>
    </div>
  )
}
