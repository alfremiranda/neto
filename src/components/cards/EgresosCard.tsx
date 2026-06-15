import { Pencil, Trash2, Plus } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { calcGastos } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { EGRESO_TIPOS } from '@/data/defaults'
import { EgresoSheet } from '@/components/sheets/EgresoSheet'

function egresoLabel(tipo: string): string {
  return EGRESO_TIPOS.find(t => t.id === tipo)?.label ?? tipo
}

export function EgresosCard() {
  const { getCurrentMonth, removeEgreso } = useFinanceStore()
  const { openSheet, showToast, setEditingEgreso } = useUIStore()

  const month = getCurrentMonth()
  const egresos = month.egresos || []
  const total = calcGastos(egresos, month.trm)

  function handleEdit(id: number) {
    setEditingEgreso(id)
    openSheet('egreso')
  }

  function handleDelete(id: number) {
    removeEgreso(id)
    showToast('Egreso eliminado')
  }

  function handleAdd() {
    setEditingEgreso(null)
    openSheet('egreso')
  }

  return (
    <>
      <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[5px] text-[12px] font-medium text-[var(--n-txt2)]">
            <span>🧾</span>
            <span>Egresos del mes</span>
          </div>
          <button
            onClick={handleAdd}
            className="flex items-center gap-1 bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg px-3 py-[5px] text-[12px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <Plus size={13} />
            Agregar
          </button>
        </div>

        {egresos.length === 0 ? (
          <div className="text-center py-5 text-[13px] text-[var(--n-txt3)]">
            Sin egresos registrados
          </div>
        ) : (
          <>
            {egresos.map(e => (
              <div key={e.id} className="flex items-center gap-2 py-[7px] border-b border-[var(--n-border)] last:border-0">
                <div className="flex-1 min-w-0">
                  <div className="text-[13px] font-medium">{egresoLabel(e.tipo)}</div>
                  {e.date && (
                    <div className="text-[11px] text-[var(--n-txt3)]">{e.date}</div>
                  )}
                </div>
                <div className="text-right shrink-0 text-[13px] font-medium">
                  {e.currency === 'USD' ? USD(e.amount) : COP(e.amount)}
                  {e.currency === 'USD' && (
                    <div className="text-[11px] text-[var(--n-txt3)]">{COP(e.amount * month.trm)}</div>
                  )}
                </div>
                <button
                  onClick={() => handleEdit(e.id)}
                  className="p-[6px] rounded-lg border border-[var(--n-border2)] bg-transparent text-[var(--n-txt3)] hover:bg-[var(--n-bg2)] cursor-pointer transition-colors"
                  title="Editar"
                >
                  <Pencil size={12} />
                </button>
                <button
                  onClick={() => handleDelete(e.id)}
                  className="p-[6px] rounded-lg border border-[var(--n-border2)] bg-transparent text-[var(--n-txt3)] hover:bg-[var(--n-danger-bg)] hover:text-[var(--n-danger)] hover:border-[var(--n-danger)] cursor-pointer transition-colors"
                  title="Eliminar"
                >
                  <Trash2 size={12} />
                </button>
              </div>
            ))}

            <div className="flex justify-between items-center mt-3 bg-[var(--n-bg2)] rounded-lg px-[14px] py-[10px]">
              <span className="text-[13px] text-[var(--n-txt2)]">Total egresos</span>
              <span className="text-[15px] font-semibold">{COP(total)}</span>
            </div>
          </>
        )}
      </div>

      <EgresoSheet />
    </>
  )
}
