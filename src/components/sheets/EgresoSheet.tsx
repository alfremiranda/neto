import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { localToday } from '@/lib/format'
import { DELETED_ACCOUNT_LABEL } from '@/lib/accountLabel'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { useSettingsStore } from '@/store/settingsStore'
import { pendingSS } from '@/lib/obligations'
import { MONTH_NAMES } from '@/data/deductions'
import type { Settles } from '@/types'
import { DatePicker } from '@/components/ui/DatePicker'

export function EgresoSheet() {
  const { addEgreso, updateEgreso, removeEgreso, getCurrentMonth, getAccounts, db, curKey, getSMMLV } = useFinanceStore()
  const deductions = useSettingsStore(st => st.deductions)
  const { closeSheet, showToast, editingEgresoId, setEditingEgreso, activeSheet } = useUIStore()

  const isEditing = editingEgresoId !== null
  const accounts  = getAccounts()

  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('vivienda')
  const [currency, setCurrency]   = useState<'USD' | 'COP'>('COP')
  const [date, setDate]           = useState(localToday())
  const [recurring, setRecurring] = useState(false)
  const [account, setAccount]     = useState('')
  const [settles, setSettles]     = useState<Settles | undefined>(undefined)
  const [confirmingDelete, setConfirmingDelete] = useState(false)

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
        setSettles(e.settles)
        amt.setValue(e.amount)
      }
    } else {
      setDesc('')
      setCategory('vivienda')
      setCurrency('COP')
      setSettles(undefined)
      setDate(localToday())
      setRecurring(false)
      setAccount('')
      amt.setValue(0)
    }
    setConfirmingDelete(false)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingEgresoId])

  function handleDelete() {
    if (editingEgresoId === null) return
    removeEgreso(editingEgresoId)
    showToast('Egreso eliminado')
    setEditingEgreso(null)
    closeSheet()
  }

  function handleSubmit() {
    if (!desc.trim()) { showToast('Escribe una descripción'); return }
    if (!amt.numericValue && !isEditing) { showToast('Ingresa el valor'); return }
    const payload = { desc: desc.trim(), category, amount: amt.numericValue, currency, date, recurring, account: account || undefined, settles }
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

  // What this payment could be settling: every SS month already due and unpaid, plus
  // this year's retención. An egreso being edited keeps its own mark selectable even
  // though paying it removed it from the pending list — otherwise re-saving would
  // silently drop the link (same reason the account select keeps an orphan entry).
  const settlesOptions = (() => {
    const opts = pendingSS(db, deductions, getSMMLV, curKey).map(p => {
      const [py, pm] = p.period.split('-').map(Number)
      return { value: `ss:${p.period}`, label: `Seguridad social · ${MONTH_NAMES[pm - 1]} ${py}` }
    })
    const year = curKey.split('-')[0]
    opts.push({ value: `retencion:${year}`, label: `Retención en la fuente · ${year}` })

    const current = settles && `${settles.kind}:${settles.period}`
    if (current && !opts.some(o => o.value === current)) {
      const [k, period] = current.split(':')
      const [py, pm] = period.split('-').map(Number)
      opts.unshift({
        value: current,
        label: k === 'ss'
          ? `Seguridad social · ${MONTH_NAMES[pm - 1]} ${py}`
          : `Retención en la fuente · ${period}`,
      })
    }
    return opts
  })()

  return (
    <SheetBase
      id="egreso"
      title={isEditing ? 'Editar gasto' : 'Agregar gasto'}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSubmit}>
            {isEditing ? 'Guardar cambios' : 'Agregar gasto'}
          </Button>
          {isEditing && !confirmingDelete && (
            <Button size="xl" variant="outline-danger" className="w-full" onClick={() => setConfirmingDelete(true)}>
              Eliminar gasto
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
          <label htmlFor="eg-desc" className="field-label ts-label-base">Descripción</label>
          <input
            id="eg-desc"
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Ej. Netflix, Rappi, Arriendo Laureles…"
            className="field-input"
          />
        </div>

        {/* Category select */}
        <div>
          <label htmlFor="eg-cat" className="field-label ts-label-base">Categoría</label>
          <Select value={category} onValueChange={setCategory}>
            <SelectTrigger id="eg-cat" className="w-full">
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
            <label htmlFor="eg-cur" className="field-label ts-label-base">Moneda</label>
            <Select value={currency} onValueChange={v => { setCurrency(v as 'USD' | 'COP'); amt.setValue(0) }}>
              <SelectTrigger id="eg-cur" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <MoneyInput
            id="eg-amt"
            label="Monto"
            currency={currency}
            value={amt.display}
            onChange={amt.handleChange}
          />
        </div>

        {/* Date */}
        <div>
          <label htmlFor="eg-date" className="field-label ts-label-base">Fecha</label>
          <DatePicker id="eg-date" value={date} onChange={setDate} />
        </div>

        {/* Account (optional) */}
        <div>
          <label htmlFor="eg-acc" className="field-label ts-label-base">Cuenta que paga <span className="ts-detail-large text-muted-foreground">(opcional)</span></label>
          <Select value={account || '_none'} onValueChange={v => setAccount(v === '_none' ? '' : v)}>
            <SelectTrigger id="eg-acc" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Sin cuenta asociada</SelectItem>
              {/* Orphan: this egreso points to a deleted account. Keep it selectable
                  and labelled so the value is not silently lost when re-saving. */}
              {account && !accounts.some(a => a.id === account) && (
                <SelectItem value={account}>{DELETED_ACCOUNT_LABEL}</SelectItem>
              )}
              {[...accounts]
                .sort((a, b) =>
                  (Number(!!b.favorite) - Number(!!a.favorite)) ||
                  ((a.currency === currency ? -1 : 1) - (b.currency === currency ? -1 : 1)))
                .map(a => (
                  <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>
                ))}
            </SelectContent>
          </Select>
        </div>

        {/* Settles an obligation.
            SS and retención are already counted the month they accrue, so paying them is
            not a new expense — it discharges a liability. Marking it here keeps the money
            leaving the account while stopping it from being added to the month a second
            time. See the Settles doc in types. */}
        <div>
          <label htmlFor="eg-settles" className="field-label ts-label-base">
            Liquida una obligación <span className="ts-detail-large text-muted-foreground">(opcional)</span>
          </label>
          <Select
            value={settles ? `${settles.kind}:${settles.period}` : '_none'}
            onValueChange={v => {
              if (v === '_none') { setSettles(undefined); return }
              const [kind, period] = v.split(':')
              setSettles({ kind: kind as Settles['kind'], period })
            }}
          >
            <SelectTrigger id="eg-settles" className="w-full">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">No — es un gasto del mes</SelectItem>
              {settlesOptions.map(o => (
                <SelectItem key={o.value} value={o.value}>{o.label}</SelectItem>
              ))}
            </SelectContent>
          </Select>
          {settles && (
            <p className="ts-body-small text-muted-foreground mt-1.5">
              Sale de la cuenta, pero no se suma a los gastos del mes — ya está contada como obligación.
            </p>
          )}
        </div>

        {/* Recurring toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="ts-body-base-emphasis">Recurrente</div>
            <div className="ts-body-small text-muted-foreground">Se copiará al siguiente mes · si tiene fecha futura, no se suma al total hasta que llegue</div>
          </div>
          <Switch checked={recurring} onCheckedChange={setRecurring} />
        </div>

      </div>
    </SheetBase>
  )
}
