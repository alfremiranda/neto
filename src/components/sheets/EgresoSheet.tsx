import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { localToday } from '@/lib/format'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'

export function EgresoSheet() {
  const { addEgreso, updateEgreso, getCurrentMonth, getAccounts } = useFinanceStore()
  const { closeSheet, showToast, editingEgresoId, setEditingEgreso, activeSheet } = useUIStore()

  const isEditing = editingEgresoId !== null
  const accounts  = getAccounts()

  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('vivienda')
  const [currency, setCurrency]   = useState<'USD' | 'COP'>('COP')
  const [date, setDate]           = useState(localToday())
  const [recurring, setRecurring] = useState(false)
  const [account, setAccount]     = useState('')

  const decimals = currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  useEffect(() => {
    if (activeSheet !== 'egreso') return
    if (editingEgresoId !== null) {
      const e = getCurrentMonth().egresos?.find(eg => eg.id === editingEgresoId)
      if (e) {
        setDesc(e.desc)
        setCategory(e.category)
        setCurrency(e.currency)
        setDate(e.date || '')
        setRecurring(e.recurring ?? false)
        setAccount(e.account ?? '')
        amt.setValue(e.amount)
      }
    } else {
      setDesc('')
      setCategory('vivienda')
      setCurrency('COP')
      setDate(localToday())
      setRecurring(false)
      setAccount('')
      amt.setValue(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingEgresoId])

  function handleSubmit() {
    if (!desc.trim()) { showToast('Escribe una descripción'); return }
    if (!amt.numericValue && !isEditing) { showToast('Ingresa el valor'); return }
    const payload = { desc: desc.trim(), category, amount: amt.numericValue, currency, date, recurring, account: account || undefined }
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
    <SheetBase
      id="egreso"
      title={isEditing ? 'Editar egreso' : 'Agregar egreso'}
      footer={
        <Button className="w-full" onClick={handleSubmit}>
          {isEditing ? 'Guardar cambios' : 'Agregar egreso'}
        </Button>
      }
    >
      <div className="space-y-5">

        {/* Description */}
        <div>
          <label className="field-label">Descripción</label>
          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Ej. Netflix, Rappi, Arriendo Laureles…"
            className="field-input"
            autoFocus
          />
        </div>

        {/* Category select */}
        <div>
          <label className="field-label">Categoría</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {EGRESO_CATEGORIAS.map(cat => {
                const Icon = cat.icon
                return (
                  <SelectItem key={cat.id} value={cat.id}>
                    <span className="flex items-center gap-2">
                      <Icon size={13} style={{ color: `var(${cat.color})` }} />
                      {cat.label}
                    </span>
                  </SelectItem>
                )
              })}
            </SelectContent>
          </Select>
        </div>

        {/* Amount + Currency */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Moneda</label>
            <Select value={currency} onValueChange={v => { setCurrency(v as 'USD' | 'COP'); amt.setValue(0) }}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MoneyInput
            label="Monto"
            currency={currency}
            value={amt.display}
            onChange={amt.handleChange}
          />
        </div>

        {/* Date */}
        <div>
          <label className="field-label">Fecha</label>
          <DatePicker value={date} onChange={setDate} />
        </div>

        {/* Account (optional) */}
        <div>
          <label className="field-label">Cuenta que paga <span className="text-muted-foreground font-normal">(opcional)</span></label>
          <Select value={account || '_none'} onValueChange={v => setAccount(v === '_none' ? '' : v)}>
            <SelectTrigger className="w-full">
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
