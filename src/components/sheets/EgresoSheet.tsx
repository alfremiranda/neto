import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { localToday, COP } from '@/lib/format'
import { useFormDirty } from '@/hooks/useFormDirty'
import { calcSSFromIBC } from '@/lib/calc'
import { useSettingsStore } from '@/store/settingsStore'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { DELETED_ACCOUNT_LABEL } from '@/lib/accountLabel'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import type { Settles } from '@/types'
import { DatePicker } from '@/components/ui/DatePicker'

export function EgresoSheet() {
  const { addEgreso, updateEgreso, removeEgreso, getCurrentMonth, getAccounts } = useFinanceStore()
  const { closeSheet, showToast, editingEgresoId, setEditingEgreso, activeSheet, egresoPrefill } = useUIStore()
  const deductions = useSettingsStore(st => st.deductions)
  const { getSMMLV } = useFinanceStore()

  const isEditing = editingEgresoId !== null
  const accounts  = getAccounts()

  const [desc, setDesc]           = useState('')
  const [category, setCategory]   = useState('vivienda')
  const [currency, setCurrency]   = useState<'USD' | 'COP'>('COP')
  const [date, setDate]           = useState(localToday())
  const [recurring, setRecurring] = useState(false)
  const [account, setAccount]     = useState('')
  const [settles, setSettles]     = useState<Settles | undefined>(undefined)
  // Which base this payment was computed on. The derived IBC is a suggestion; the base
  // actually invoiced can differ, and the user is the one who knows.
  const [ibcMode, setIbcMode]     = useState<'suggested' | 'other'>('suggested')
  const isSettlement = !!settles
  const [confirmingDelete, setConfirmingDelete] = useState(false)

  const decimals = currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })
  const ibcAmt = useMoneyInput({ decimals: 0 })

  const suggestedIbc = egresoPrefill?.suggestedIbc
  // Only SS is computed off an IBC; retención is a percentage of gross.
  const asksForIbc = isSettlement && settles?.kind === 'ss' && suggestedIbc != null
  // What the payment would be on the base the user chose. Recomputed live so the figure
  // and the base can never disagree on screen.
  const ssOnChosenIbc = asksForIbc
    ? calcSSFromIBC(
        ibcMode === 'other' ? ibcAmt.numericValue : suggestedIbc,
        deductions,
        getSMMLV(Number((settles!.period || '').slice(0, 4)) || new Date().getFullYear()),
      )
    : 0

  // Unsaved work: what is on screen differs from what the sheet opened with.
  const dirty = useFormDirty(activeSheet === 'egreso', {
    desc, category, currency, date, recurring, account, settles, amount: amt.numericValue,
  })

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
    } else if (egresoPrefill) {
      // Opened from the Obligaciones card to settle a period. The card fills in what
      // it already knows and leaves the amount blank on purpose — the accrual is a
      // reference, not the figure that left the account.
      setDesc(egresoPrefill.desc)
      setCategory(egresoPrefill.category)
      setCurrency(egresoPrefill.currency)
      // Freeze what the obligation stood at, so a later TRM or income correction cannot
      // reopen the period this payment closes.
      setSettles({ ...egresoPrefill.settles, accrued: egresoPrefill.accrued })
      setIbcMode('suggested')
      ibcAmt.setValue(egresoPrefill.suggestedIbc ?? 0)
      setDate(localToday())
      setRecurring(false)
      setAccount('')
      amt.setValue(0)
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
  }, [activeSheet, editingEgresoId, egresoPrefill])

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
    const payload = { desc: desc.trim(), category, amount: amt.numericValue, currency, date, recurring, account: account || undefined,
      settles: settles && ibcMode === 'other' && suggestedIbc != null
        ? { ...settles, ibc: ibcAmt.numericValue, accrued: ssOnChosenIbc }
        : settles }
    if (isEditing) {
      updateEgreso(editingEgresoId!, payload)
      showToast('Egreso actualizado')
    } else {
      addEgreso(payload)
      showToast(settles ? 'Pago registrado' : 'Egreso registrado')
    }
    amt.setValue(0)
    setEditingEgreso(null)
    closeSheet()
  }

  return (
    <SheetBase
      id="egreso"
      dirty={dirty}
      title={isEditing ? 'Editar gasto' : settles ? 'Registrar pago' : 'Agregar gasto'}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSubmit}>
            {isEditing ? 'Guardar cambios' : settles ? 'Registrar pago' : 'Agregar gasto'}
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

        {/* What this payment settles. Read-only: the card decided it, and letting the
            sheet re-pick it would put a once-a-month decision back in the common flow. */}
        {settles && !isEditing && (
          <div className="rounded-xl bg-muted px-3 py-2.5">
            <div className="ts-label-micro uppercase text-muted-foreground/70">Liquida una obligación</div>
            {egresoPrefill?.accrued != null && (
              <div className="ts-body-base-emphasis mt-1">
                Causado {COP(egresoPrefill.accrued)}
                <span className="ts-body-small text-muted-foreground"> · confirma el valor que pagaste</span>
              </div>
            )}
            <div className="ts-body-small text-muted-foreground mt-1">
              Sale de la cuenta, pero no se suma a los gastos del mes.
            </div>
          </div>
        )}

        {/* Which base the payment was computed on.
            The IBC the app derives is a SUGGESTION: the base actually invoiced can differ
            — the rate on the day the money landed, cross-border and transaction costs, a
            correction on the planilla. A figure the user cannot contradict is one they
            stop trusting, so this asks instead of asserting, and records the answer. */}
        {asksForIbc && (
          <div className="space-y-2">
            <span className="field-label ts-label-base">IBC de este pago</span>
            <SegmentedControl
              ariaLabel="Base del pago"
              value={ibcMode}
              onChange={v => {
                setIbcMode(v)
                if (v === 'suggested') ibcAmt.setValue(suggestedIbc!)
              }}
              options={[
                { value: 'suggested', label: 'El sugerido' },
                { value: 'other',     label: 'Otro' },
              ] as const}
            />
            {ibcMode === 'other' ? (
              <MoneyInput
                id="eg-ibc"
                label="IBC facturado"
                currency="COP"
                value={ibcAmt.display}
                onChange={ibcAmt.handleChange}
              />
            ) : (
              <div className="ts-body-small text-muted-foreground">
                {COP(suggestedIbc!)} · 40% de los ingresos por servicios, o el piso SMMLV
              </div>
            )}
            <button
              type="button"
              onClick={() => amt.setValue(Math.round(ssOnChosenIbc))}
              className="ts-body-small text-[var(--primary)] underline-offset-2 hover:underline text-left"
            >
              Sobre esa base la SS da {COP(ssOnChosenIbc)} — usar este valor
            </button>
          </div>
        )}

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

        {/* Category select.
            Hidden for a settlement: it is offered nowhere it would mean anything —
            settlements are excluded from the Gastos list, the category chart, the
            annual breakdown and the KPI tooltip, and the account ledger renders no
            category. Offering thirteen choices that all do the same nothing is worse
            than not asking. The prefill still sets it, so the stored shape is intact. */}
        {!isSettlement && (
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
        )}

        {/* Amount + Currency.
            The currency picker is hidden for a settlement: the PILA and the DIAN are
            paid in pesos, so COP is a fact of the obligation, not a choice. Paying from
            a USD account still works — the ledger converts at the month's TRM. */}
        {isSettlement ? (
          <MoneyInput
            id="eg-amt"
            label="Monto"
            currency={currency}
            value={amt.display}
            onChange={amt.handleChange}
          />
        ) : (
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
        )}

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

        {/* Recurring toggle */}
        <div className="flex items-center justify-between py-1">
          <div>
            <div className="ts-body-base-emphasis">Recurrente</div>
            <div className="ts-body-small text-muted-foreground">
              {settles
                ? 'Se copiará al siguiente mes, avanzando el período que liquida'
                : 'Se copiará al siguiente mes · si tiene fecha futura, no se suma al total hasta que llegue'}
            </div>
          </div>
          <Switch checked={recurring} onCheckedChange={setRecurring} />
        </div>

      </div>
    </SheetBase>
  )
}
