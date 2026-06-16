import { useState } from 'react'
import { ChevronLeft, ChevronRight, Trash2 } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { MONTHS } from '@/data/defaults'
import { ConfirmModal } from '@/components/ui/ConfirmModal'

export function MonthNav() {
  const { curKey, prevMonth, nextMonth, deleteMonth, db } = useFinanceStore()
  const [confirmOpen, setConfirmOpen] = useState(false)
  const [y, m] = curKey.split('-').map(Number)

  const monthData = db[curKey]
  const hasRecords = monthData && (
    (monthData.incomes?.length ?? 0) > 0 ||
    (monthData.egresos?.length ?? 0) > 0 ||
    (monthData.transfers?.length ?? 0) > 0
  )

  function handleDeleteConfirm() {
    deleteMonth(curKey)
  }

  return (
    <>
      <div className="flex items-center gap-2">
        <button
          onClick={prevMonth}
          disabled={m === 0}
          aria-label="Mes anterior"
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--n-border2)] bg-transparent text-[var(--n-txt)] hover:bg-[var(--n-bg2)] disabled:opacity-25 disabled:pointer-events-none transition-colors active:scale-95"
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
          className="w-8 h-8 flex items-center justify-center rounded-lg border border-[var(--n-border2)] bg-transparent text-[var(--n-txt)] hover:bg-[var(--n-bg2)] disabled:opacity-25 disabled:pointer-events-none transition-colors active:scale-95"
        >
          <ChevronRight size={16} />
        </button>

        {monthData && (
          <button
            onClick={() => setConfirmOpen(true)}
            aria-label="Eliminar mes"
            className="w-7 h-7 flex items-center justify-center rounded-lg border border-[var(--n-border2)] bg-transparent text-muted-foreground hover:bg-[var(--n-danger-bg)] hover:text-[var(--n-danger)] hover:border-[var(--n-danger)] transition-colors active:scale-95"
          >
            <Trash2 size={13} />
          </button>
        )}
      </div>

      <ConfirmModal
        open={confirmOpen}
        onOpenChange={setConfirmOpen}
        title={`Eliminar ${MONTHS[m]} ${y}`}
        description={
          hasRecords
            ? `Este mes tiene registros. Al eliminarlo se perderán todos los ingresos, egresos y movimientos de ${MONTHS[m]} ${y}. Esta acción no se puede deshacer.`
            : `Se eliminará el mes de ${MONTHS[m]} ${y} y no se podrá deshacer.`
        }
        confirmLabel="Eliminar mes"
        onConfirm={handleDeleteConfirm}
        destructive
      />
    </>
  )
}
