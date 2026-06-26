import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { localToday } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'

export function IncomeSheet() {
  const { addIncome, updateIncome, removeIncome, getCurrentMonth, getAccounts } = useFinanceStore()
  const { closeSheet, showToast, editingIncomeId } = useUIStore()

  const isEdit = editingIncomeId !== null
  const month  = getCurrentMonth()
  const editing = isEdit ? month.incomes.find(i => i.id === editingIncomeId) : undefined

  const [desc, setDesc]         = useState('')
  const [currency, setCurrency] = useState<'USD' | 'COP'>('USD')
  const [account, setAccount]   = useState('ARQ')
  const [tipo, setTipo]             = useState<'servicios' | 'otro'>('servicios')
  const [date, setDate]             = useState(localToday())
  const [applyProvisions, setApply] = useState(true)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const decimals = currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  const accounts = getAccounts()

  useEffect(() => {
    if (editing) {
      setDesc(editing.desc)
      setCurrency(editing.currency)
      setAccount(editing.account)
      setTipo(editing.tipo)
      setDate(editing.date ?? localToday())
      setApply(editing.applyProvisions ?? true)
      amt.setValue(editing.amount)
    } else {
      setDesc('')
      setCurrency('USD')
      setAccount('ARQ')
      setTipo('servicios')
      setDate(localToday())
      setApply(true)
      amt.setValue(0)
    }
    setConfirmingDelete(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [editingIncomeId])

  function handleDelete() {
    if (editingIncomeId === null) return
    removeIncome(editingIncomeId)
    showToast('Ingreso eliminado')
    closeSheet()
  }

  function handleSubmit() {
    if (!desc.trim() || !amt.numericValue) {
      showToast('Ingresa descripción y monto')
      return
    }
    const payload = { desc: desc.trim(), amount: amt.numericValue, currency, account, tipo, date, applyProvisions }
    if (isEdit && editingIncomeId !== null) {
      updateIncome(editingIncomeId, payload)
      showToast('Ingreso actualizado')
    } else {
      addIncome(payload)
      showToast('Ingreso registrado')
    }
    closeSheet()
  }

  return (
    <SheetBase
      id="income"
      title={isEdit ? 'Editar ingreso' : 'Registrar ingreso'}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSubmit}>
            {isEdit ? 'Guardar cambios' : 'Registrar ingreso'}
          </Button>
          {isEdit && !confirmingDelete && (
            <Button size="xl" variant="outline-danger" className="w-full" onClick={() => setConfirmingDelete(true)}>
              Eliminar ingreso
            </Button>
          )}
          {isEdit && confirmingDelete && (
            <div className="flex gap-2">
              <Button size="xl" variant="ghost" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </Button>
              <Button size="xl" variant="destructive" className="flex-1" onClick={handleDelete}>
                Confirmar
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-4">
        <div>
          <label htmlFor="inc-desc" className="field-label">Descripción</label>
          <input
            id="inc-desc"
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Ej: Observer Hub Jun"
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="inc-cur" className="field-label">Moneda</label>
            <Select value={currency} onValueChange={v => { setCurrency(v as 'USD' | 'COP'); amt.setValue(0) }}>
              <SelectTrigger id="inc-cur" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MoneyInput
            id="i-amt"
            label="Monto"
            currency={currency}
            value={amt.display}
            onChange={amt.handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="inc-acc" className="field-label">Cuenta</label>
            <Select value={account} onValueChange={v => {
              const selected = accounts.find(a => a.id === v)
              setAccount(v)
              if (selected && selected.currency !== currency) {
                setCurrency(selected.currency)
                amt.setValue(0)
              }
            }}>
              <SelectTrigger id="inc-acc" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="inc-tipo" className="field-label">Tipo</label>
            <Select value={tipo} onValueChange={v => setTipo(v as 'servicios' | 'otro')}>
              <SelectTrigger id="inc-tipo" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="servicios">Servicios</SelectItem>
                <SelectItem value="otro">Otro</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <label htmlFor="inc-date" className="field-label">Fecha de ingreso</label>
          <DatePicker id="inc-date" value={date} onChange={setDate} />
        </div>

        {tipo === 'servicios' && (
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="text-sm font-medium">Aplicar provisiones</div>
              <div className="text-xs text-muted-foreground">Incluir en el cálculo de primas y cesantías</div>
            </div>
            <Switch checked={applyProvisions} onCheckedChange={setApply} />
          </div>
        )}

      </div>
    </SheetBase>
  )
}
