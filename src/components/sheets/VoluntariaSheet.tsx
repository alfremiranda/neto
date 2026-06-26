import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { MoneyInput } from '@/components/ui/MoneyInput'

import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function VoluntariaSheet() {
  const { addVoluntaria, updateVoluntaria, removeVoluntaria, getCurrentMonth } = useFinanceStore()
  const { closeSheet, showToast, activeSheet, editingVoluntariaId, setEditingVoluntaria } = useUIStore()

  const isEditing = editingVoluntariaId !== null

  const [label, setLabel]       = useState('')
  const [currency, setCurrency] = useState<'COP' | 'USD'>('COP')

  const decimals = currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  useEffect(() => {
    if (activeSheet !== 'voluntaria') return
    if (editingVoluntariaId !== null) {
      const v = getCurrentMonth().voluntarias?.find(x => x.id === editingVoluntariaId)
      if (v) {
        setLabel(v.label)
        setCurrency(v.currency)
        amt.setValue(v.amount)
      }
    } else {
      setLabel('')
      setCurrency('COP')
      amt.setValue(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingVoluntariaId])

  function handleDelete() {
    if (editingVoluntariaId === null) return
    removeVoluntaria(editingVoluntariaId)
    showToast('Ahorro eliminado')
    setEditingVoluntaria(null)
    closeSheet()
  }

  function handleSubmit() {
    if (!label.trim()) { showToast('Escribe una descripción'); return }
    if (!amt.numericValue) { showToast('Ingresa el monto'); return }
    const payload = { label: label.trim(), amount: amt.numericValue, currency }
    if (isEditing) {
      updateVoluntaria({ id: editingVoluntariaId!, ...payload })
      showToast('Ahorro actualizado')
    } else {
      addVoluntaria(payload)
      showToast('Ahorro registrado')
    }
    setEditingVoluntaria(null)
    closeSheet()
  }

  return (
    <SheetBase
      id="voluntaria"
      title={isEditing ? 'Editar ahorro voluntario' : 'Agregar ahorro voluntario'}
      footer={
        <div className="space-y-2">
          <Button size="xl" className="w-full" onClick={handleSubmit}>
            {isEditing ? 'Guardar cambios' : 'Agregar ahorro'}
          </Button>
          {isEditing && (
            <Button size="xl" variant="outline-danger" className="w-full" onClick={handleDelete}>
              Eliminar ahorro
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-5">

        {/* Label */}
        <div>
          <label htmlFor="vol-label" className="field-label">Descripción</label>
          <input
            id="vol-label"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ej. Pensión voluntaria, Fondo de emergencia…"
            className="field-input"
            autoFocus
          />
        </div>

        {/* Amount + currency */}
        <div>
          <label htmlFor="vol-amount" className="field-label">Monto</label>
          <div className="flex gap-2">
            <MoneyInput
              id="vol-amount"
              value={amt.display}
              onChange={amt.handleChange}
              currency={currency}
              className="flex-1"
            />
            <Select value={currency} onValueChange={v => { setCurrency(v as 'COP' | 'USD'); amt.setValue(0) }}>
              <SelectTrigger className="w-[90px]" aria-label="Moneda">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

      </div>
    </SheetBase>
  )
}
