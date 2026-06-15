import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { EGRESO_TIPOS } from '@/data/defaults'

export function EgresoSheet() {
  const { addEgreso, updateEgreso, getCurrentMonth } = useFinanceStore()
  const { closeSheet, showToast, editingEgresoId, setEditingEgreso, activeSheet } = useUIStore()

  const isEditing = editingEgresoId !== null

  const [tipo, setTipo]         = useState('arriendo')
  const [currency, setCurrency] = useState<'USD' | 'COP'>('COP')
  const [date, setDate]         = useState(new Date().toISOString().slice(0, 10))

  const decimals = currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  // Populate form when sheet opens for editing
  useEffect(() => {
    if (activeSheet !== 'egreso') return
    if (editingEgresoId !== null) {
      const e = getCurrentMonth().egresos?.find(eg => eg.id === editingEgresoId)
      if (e) {
        setTipo(e.tipo)
        setCurrency(e.currency)
        setDate(e.date || '')
        amt.setValue(e.amount)
      }
    } else {
      setTipo('arriendo')
      setCurrency('COP')
      setDate(new Date().toISOString().slice(0, 10))
      amt.setValue(0)
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingEgresoId])

  function handleSubmit() {
    if (!amt.numericValue && !isEditing) { showToast('Ingresa el valor'); return }
    const payload = { tipo, amount: amt.numericValue, currency, date }
    if (isEditing) {
      updateEgreso(editingEgresoId!, payload)
      showToast('Egreso actualizado')
    } else {
      addEgreso(payload)
      showToast('Egreso registrado')
    }
    amt.setValue(0)
    setEditingEgreso(null)
    closeSheet()
  }

  return (
    <SheetBase id="egreso" title={isEditing ? 'Editar egreso' : 'Agregar egreso'}>
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Tipo</label>
          <select
            value={tipo}
            onChange={e => setTipo(e.target.value)}
            className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] appearance-none"
          >
            {EGRESO_TIPOS.map(t => <option key={t.id} value={t.id}>{t.label}</option>)}
          </select>
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Moneda</label>
            <select
              value={currency}
              onChange={e => { setCurrency(e.target.value as 'USD' | 'COP'); amt.setValue(0) }}
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] appearance-none"
            >
              <option value="COP">COP</option>
              <option value="USD">USD</option>
            </select>
          </div>
          <MoneyInput
            label="Monto"
            currency={currency}
            value={amt.display}
            onChange={amt.handleChange}
          />
        </div>

        <div>
          <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Fecha</label>
          <input
            type="date"
            value={date}
            onChange={e => setDate(e.target.value)}
            className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
          />
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg py-2 px-4 text-[13px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity active:scale-[.97]"
        >
          {isEditing ? 'Guardar cambios' : 'Agregar egreso'}
        </button>
      </div>
    </SheetBase>
  )
}
