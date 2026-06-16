import { useState } from 'react'
import { Plus, Trash2, Pencil, Banknote, Receipt } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { calcTotales } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { Badge } from '@/components/ui/Badge'
import { MetricCard } from '@/components/ui/MetricCard'
import { IncomeSheet } from '@/components/sheets/IncomeSheet'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription, EmptyContent } from '@/components/ui/empty'

const MONTHS_SHORT = ['ene','feb','mar','abr','may','jun','jul','ago','sep','oct','nov','dic']

function formatIncomeDate(iso: string): string {
  const [, m, d] = iso.split('-').map(Number)
  return `${d} ${MONTHS_SHORT[m - 1]}`
}

export function IngresosCard() {
  const { getCurrentMonth, removeIncome } = useFinanceStore()
  const { openSheet, setPendingDelete, showToast, setEditingIncome } = useUIStore()
  const [confirmId, setConfirmId] = useState<number | null>(null)

  const month = getCurrentMonth()
  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const hasIncomes = month.incomes.length > 0

  function handleEdit(id: number) {
    setEditingIncome(id)
    openSheet('income')
  }

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

  function handleAdd() {
    setEditingIncome(null)
    openSheet('income')
  }

  return (
    <>
      <SectionCard
        icon={Banknote}
        title="Ingresos del mes"
        action={
          <Button size="sm" onClick={handleAdd}>
            <Plus size={13} />
            Registrar
          </Button>
        }
      >
        {!hasIncomes ? (
            <Empty className="border-0 py-4">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Receipt size={14} /></EmptyMedia>
              <EmptyTitle>Sin ingresos</EmptyTitle>
              <EmptyDescription>Registra el primer ingreso del mes</EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <Button size="sm" variant="outline" onClick={handleAdd}><Plus size={13} />Registrar ingreso</Button>
            </EmptyContent>
          </Empty>
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
                <div key={inc.id} className="flex items-center gap-2 py-[9px]">
                  <div className="flex-1 min-w-0">
                    <div className="text-sm font-medium truncate">{inc.desc}</div>
                    <div className="text-xs text-muted-foreground mt-0.5 flex items-center gap-1 flex-wrap">
                      <Badge variant={acctVariant}>{inc.account}</Badge>
                      <span>· {inc.tipo}</span>
                      {inc.date && (
                        <>
                          <span>·</span>
                          <span>{formatIncomeDate(inc.date)}</span>
                        </>
                      )}
                    </div>
                  </div>
                  <div className="text-right shrink-0">
                    <div className="text-sm font-medium">
                      {inc.currency === 'USD' ? USD(inc.amount) : COP(inc.amount)}
                    </div>
                    {inc.currency === 'USD' && (
                      <div className="text-xs text-muted-foreground">
                        {COP(inc.amount * month.trm)}
                      </div>
                    )}
                  </div>
                  <Button
                    variant="ghost"
                    size="icon-sm"
                    onClick={() => handleEdit(inc.id)}
                    title="Editar"
                  >
                    <Pencil size={13} />
                  </Button>
                  <Button
                    variant={isPending ? "destructive" : "ghost"}
                    size={isPending ? "sm" : "icon-sm"}
                    onClick={() => handleDelete(inc.id)}
                    title={isPending ? 'Confirmar eliminación' : 'Eliminar'}
                  >
                    {isPending ? '¿Eliminar?' : <Trash2 size={13} />}
                  </Button>
                </div>
              )
            })}

            <div className="mt-3 pt-3 border-t border-[var(--n-border)]">
              <MetricCard
                label="Total bruto equiv. COP"
                value={COP(bruto)}
                sub={totUSD > 0 ? `${USD(totUSD)} · TRM ${month.trm.toLocaleString('es-CO', { maximumFractionDigits: 2 })}` : undefined}
              />
            </div>
          </div>
        )}
      </SectionCard>

      <IncomeSheet />
    </>
  )
}
