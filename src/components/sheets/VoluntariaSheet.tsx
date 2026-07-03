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

export function VoluntariaSheet() {
  const {
    addVoluntaria, updateVoluntaria, removeVoluntaria,
    addEgreso, updateEgreso, removeEgreso,
    getCurrentMonth, getAccounts, curKey,
  } = useFinanceStore()
  const { closeSheet, showToast, activeSheet, editingVoluntariaId, setEditingVoluntaria } = useUIStore()

  const isEditing = editingVoluntariaId !== null
  const accounts  = getAccounts()

  const [label, setLabel]         = useState('')
  const [currency, setCurrency]   = useState<'COP' | 'USD'>('COP')
  const [date, setDate]           = useState(localToday())
  const [account, setAccount]     = useState('')
  const [recurring, setRecurring] = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const decimals = currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  useEffect(() => {
    if (activeSheet !== 'voluntaria') return
    if (editingVoluntariaId !== null) {
      const v = getCurrentMonth().voluntarias?.find(x => x.id === editingVoluntariaId)
      if (v) {
        setLabel(v.label)
        setCurrency(v.currency)
        setDate(v.date || localToday())
        setAccount(v.account || '')
        setRecurring(v.recurring ?? false)
        amt.setValue(v.amount)
      }
    } else {
      setLabel('')
      setCurrency('COP')
      setDate(localToday())
      setAccount('')
      setRecurring(false)
      amt.setValue(0)
    }
    setConfirmingDelete(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingVoluntariaId])

  function handleDelete() {
    if (editingVoluntariaId === null) return
    const v = getCurrentMonth().voluntarias?.find(x => x.id === editingVoluntariaId)
    if (v?.egresoId) removeEgreso(v.egresoId)
    removeVoluntaria(editingVoluntariaId)
    showToast('Ahorro eliminado')
    setEditingVoluntaria(null)
    closeSheet()
  }

  function handleSubmit() {
    if (!label.trim()) { showToast('Escribe una descripción'); return }
    if (!amt.numericValue) { showToast('Ingresa el monto'); return }

    const egresoPayload = {
      desc:     label.trim(),
      category: 'ahorro',
      amount:   amt.numericValue,
      currency,
      date,
      account:   account || undefined,
      recurring,
    }

    if (isEditing) {
      const v = getCurrentMonth().voluntarias?.find(x => x.id === editingVoluntariaId)
      const existingEgresoId = v?.egresoId
      const egresoId = existingEgresoId
        ? (updateEgreso(existingEgresoId, egresoPayload), existingEgresoId)
        : addEgreso(egresoPayload, curKey)
      updateVoluntaria({
        id: editingVoluntariaId!,
        label: label.trim(),
        amount: amt.numericValue,
        currency,
        date,
        account: account || undefined,
        recurring,
        egresoId,
      })
      showToast('Ahorro actualizado')
    } else {
      const egresoId = addEgreso(egresoPayload, curKey)
      addVoluntaria({ label: label.trim(), amount: amt.numericValue, currency, date, account: account || undefined, recurring, egresoId })
      showToast('Ahorro registrado')
    }
    setEditingVoluntaria(null)
    closeSheet()
  }

  return (
    <SheetBase
      id="voluntaria"
      title={isEditing ? 'Editar ahorro / inversión' : 'Agregar ahorro / inversión'}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSubmit}>
            {isEditing ? 'Guardar cambios' : 'Agregar'}
          </Button>
          {isEditing && !confirmingDelete && (
            <Button size="xl" variant="outline-danger" className="w-full" onClick={() => setConfirmingDelete(true)}>
              Eliminar
            </Button>
          )}
          {isEditing && confirmingDelete && (
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
      <div className="space-y-5">

        {/* Description */}
        <div>
          <label htmlFor="vol-label" className="field-label">Descripción</label>
          <input
            id="vol-label"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ej. Skandia, Fondo de emergencia, ETF…"
            className="field-input"
            autoFocus
          />
        </div>

        {/* Amount + Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="vol-cur" className="field-label">Moneda</label>
            <Select value={currency} onValueChange={v => { setCurrency(v as 'COP' | 'USD'); amt.setValue(0) }}>
              <SelectTrigger id="vol-cur" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MoneyInput
            id="vol-amount"
            label="Monto"
            currency={currency}
            value={amt.display}
            onChange={amt.handleChange}
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="vol-date" className="field-label">Fecha</label>
          <DatePicker id="vol-date" value={date} onChange={setDate} />
        </div>

        {/* Account (optional) */}
        <div>
          <label htmlFor="vol-acc" className="field-label">
            Cuenta que paga <span className="text-muted-foreground font-normal">(opcional)</span>
          </label>
          <Select value={account || '_none'} onValueChange={v => setAccount(v === '_none' ? '' : v)}>
            <SelectTrigger id="vol-acc" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Sin cuenta asociada</SelectItem>
              {accounts
                .sort((a, b) => (a.currency === currency ? -1 : 1) - (b.currency === currency ? -1 : 1))
                .map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="text-sm font-medium">Recurrente</div>
            <div className="text-xs text-muted-foreground">Se copiará automáticamente al siguiente mes</div>
          </div>
          <Switch checked={recurring} onCheckedChange={setRecurring} />
        </div>

      </div>
    </SheetBase>
  )
}
