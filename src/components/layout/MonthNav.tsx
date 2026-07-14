import { useState } from 'react'
import { ChevronLeft, ChevronRight, Plus, ChevronDown, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { MONTHS } from '@/data/defaults'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

export function MonthNav() {
  const { curKey, prevMonth, nextMonth } = useFinanceStore()
  const { openSheet, setEditingIncome, setEditingEgreso, setEditingTransfer } = useUIStore()
  const [y, m] = curKey.split('-').map(Number)
  const [open, setOpen] = useState(false)

  const actions = [
    { label: 'Ingreso',    Icon: TrendingUp,     onClick: () => { setEditingIncome(null);   openSheet('income')   } },
    { label: 'Egreso',     Icon: TrendingDown,   onClick: () => { setEditingEgreso(null);   openSheet('egreso')   } },
    { label: 'Movimiento', Icon: ArrowLeftRight, onClick: () => { setEditingTransfer(null); openSheet('transfer') } },
  ]

  return (
    <div className="flex items-center">
      <div className="flex-1" />

      <div className="flex items-center gap-2">
        <button
          onClick={prevMonth}
          disabled={m === 1}
          aria-label="Mes anterior"
          className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-25 disabled:pointer-events-none transition-all duration-100 active:scale-95"
        >
          <ChevronLeft size={16} />
        </button>
        <h1 className="text-[17px] font-bold font-heading whitespace-nowrap min-w-[148px] text-center">
          {MONTHS[m - 1]} {y}
        </h1>
        <button
          onClick={nextMonth}
          disabled={m === 12}
          aria-label="Mes siguiente"
          className="w-11 h-11 sm:w-8 sm:h-8 flex items-center justify-center rounded-lg border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--muted)] disabled:opacity-25 disabled:pointer-events-none transition-all duration-100 active:scale-95"
        >
          <ChevronRight size={16} />
        </button>
      </div>

      <div className="flex-1 flex justify-end">
        <Popover open={open} onOpenChange={setOpen}>
          <PopoverTrigger asChild>
            <Button size="sm" className="hidden sm:inline-flex gap-1.5">
              <Plus size={13} />
              Agregar
              <ChevronDown size={11} className={cn('transition-transform duration-150', open && 'rotate-180')} />
            </Button>
          </PopoverTrigger>
          <PopoverContent align="end" className="w-44 p-1">
            {actions.map(({ label, Icon, onClick }) => (
              <button
                key={label}
                type="button"
                onClick={() => { setOpen(false); setTimeout(onClick, 50) }}
                className="w-full flex items-center gap-2.5 px-3 py-2 rounded-md text-sm hover:bg-[var(--muted)] transition-colors text-left"
              >
                <Icon size={13} className="text-[var(--primary)] shrink-0" />
                {label}
              </button>
            ))}
          </PopoverContent>
        </Popover>
      </div>
    </div>
  )
}
