import { useState } from 'react'
import { Plus, Trash2 } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { calcTotales } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { MetricCard } from '@/components/ui/MetricCard'
import { IncomeSheet } from '@/components/sheets/IncomeSheet'

export function IngresosCard() {
  const { getCurrentMonth, removeIncome } = useFinanceStore()
  const { openSheet, setPendingDelete, showToast } = useUIStore()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const month = getCurrentMonth()
  const { totUSD, totCOP, bruto } = calcTotales(month.incomes, month.trm)
  const hasIncomes = month.incomes.length > 0

  function handleDelete(id: number) {
    if (confirmId === id) {
      removeIncome(id)
      setConfirmId(null)
      setPendingDelete(null)
      showToast('Ingreso eliminado')
    } else {
      setConfirmId(id)
      setPendingDelete(id)
    }
  }

  return (
    <>
      <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[5px] text-[12px] font-medium text-[var(--n-txt2)]">
            <span>💵</span>
            <span>Ingresos del mes</span>
          </div>
          <button
            onClick={() => openSheet('income')}
            className="flex items-center gap-1 bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg px-3 py-[5px] text-[12px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity"
          >
            <Plus size={13} />
            Registrar
          </button>
        </div>

        {/* Income list */}
        {!hasIncomes ? (
          <div className="text-center py-5 text-[13px] text-[var(--n-txt3)]">
            Sin ingresos registrados
          </div>
        ) : (
          <div>
            {month.incomes.map(inc => {
              const isPending = confirmId === inc.id
              const accountLower = inc.account.toLowerCase()
              const acctVariant = accountLower.includes('arq') ? 'arq'
                : accountLower.includes('toptal') ? 'toptal'
                : accountLower.includes('bancol') ? 'bancol'
                : 'otro'

              return (
                <div key={inc.id} className="flex items-center gap-2 py-[9px] border-b border-[var(--n-border)] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[13px] font-medium truncate">{inc.desc}</div>
                    <div className="text-[11px] text-[var(--n-txt3)] mt-0.5 flex items-center gap-1">
                      <Badge variant={acctVariant}>{inc.account}</Badge>
                      <span>· {inc.tipo}</span>
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-[13px] font-medium">
                      {inc.currency === 'USD' ? USD(inc.amount) : COP(inc.amount)}
                    </div>
                    {inc.currency === 'USD' && (
                      <div className="text-[11px] text-[var(--n-txt3)]">
                        {COP(inc.amount * month.trm)}
                      </div>
                    )}
                  </div>
                  <button
                    onClick={() => handleDelete(inc.id)}
                    className={[
                      'border rounded-lg px-3 py-[6px] text-[12px] cursor-pointer transition-all',
                      isPending
                        ? 'border-[var(--n-danger)] text-[var(--n-danger)] bg-[var(--n-danger-bg)]'
                        : 'border-[var(--n-border2)] text-[var(--n-txt3)] bg-transparent hover:bg-[var(--n-bg2)]',
                    ].join(' ')}
                    title={isPending ? 'Confirmar eliminación' : 'Eliminar'}
                  >
                    {isPending ? '¿Eliminar?' : <Trash2 size={13} />}
                  </button>
                </div>
              )
            })}

            {/* Totals */}
            <div className="mt-3">
              <div className="h-px bg-[var(--n-border)] mb-3" />
              <div className="grid grid-cols-2 gap-2 mb-2">
                <MetricCard
                  label={<span>USD <Badge variant="usd">ARQ + Toptal</Badge></span>}
                  value={USD(totUSD)}
                />
                <MetricCard
                  label={<span>COP <Badge variant="cop">Bancolombia</Badge></span>}
                  value={COP(totCOP)}
                />
              </div>
              <MetricCard
                label="Total bruto equiv. COP"
                value={COP(bruto)}
                sub={totUSD > 0 ? `${USD(bruto / month.trm)} · TRM ${month.trm.toLocaleString('es-CO', { maximumFractionDigits: 2 })}` : undefined}
              />
            </div>
          </div>
        )}
      </div>

      <IncomeSheet />
    </>
  )
}
