import { useState, useEffect } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFormDirty } from '@/hooks/useFormDirty'
import { calcSSFromIBC } from '@/lib/calc'
import { COP, localToday } from '@/lib/format'
import { MONTHS } from '@/data/defaults'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { DatePicker } from '@/components/ui/DatePicker'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import type { Egreso } from '@/types'

/**
 * Recording a social security payment.
 *
 * Its own sheet rather than the gasto sheet in disguise. Paying SS is not spending: it
 * settles a period, it is measured against a base the user may have to correct, and what
 * matters is the relationship between three numbers — what the app suggested, on what
 * base, and what actually left the account. A form built around a category and an amount
 * cannot show that, and asking the user to reconstruct it from a Gastos row was asking
 * them to do the arithmetic the app exists to do.
 */
export function SSPaymentSheet() {
  const { addEgreso, updateEgreso, removeEgreso, getAccounts, getSMMLV, db, setCurKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { activeSheet, ssPayment, closeSheet, showToast } = useUIStore()

  const open = activeSheet === 'ss-payment'
  const accounts = getAccounts()

  const [ibcMode, setIbcMode] = useState<'suggested' | 'other'>('suggested')
  const [date, setDate] = useState(localToday())
  const [account, setAccount] = useState('')
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const paid = useMoneyInput({ decimals: 0 })
  const ibcAmt = useMoneyInput({ decimals: 0 })

  const period = ssPayment?.period ?? ''
  const [y, m] = period.split('-').map(Number)
  const monthName = m ? MONTHS[m - 1] : ''
  const editing = ssPayment?.editing

  useEffect(() => {
    if (!open || !ssPayment) return
    setConfirmingDelete(false)
    if (editing) {
      const src = (db[editing.monthKey] as { egresos?: Egreso[] } | undefined)
        ?.egresos?.find(e => e.id === editing.id)
      if (src) {
        setDate(src.date || localToday())
        setAccount(src.account ?? '')
        paid.setValue(src.amount)
        const declared = src.settles?.ibc
        setIbcMode(declared != null ? 'other' : 'suggested')
        ibcAmt.setValue(declared ?? ssPayment.suggestedIbc)
        return
      }
    }
    setDate(localToday())
    setAccount('')
    paid.setValue(0)
    setIbcMode('suggested')
    ibcAmt.setValue(ssPayment.suggestedIbc)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open, ssPayment])

  const usedIbc = ibcMode === 'other' ? ibcAmt.numericValue : (ssPayment?.suggestedIbc ?? 0)
  const ssOnUsedIbc = ssPayment
    ? calcSSFromIBC(usedIbc, deductions, getSMMLV(y || new Date().getFullYear()))
    : 0
  const difference = paid.numericValue - ssOnUsedIbc

  const dirty = useFormDirty(open, {
    ibcMode, date, account, paid: paid.numericValue, ibc: ibcAmt.numericValue,
  })

  function handleSave() {
    if (!ssPayment) return
    if (!paid.numericValue) { showToast('Ingresa el valor pagado'); return }

    const payload = {
      desc: `Seguridad social · ${monthName} ${y}`,
      category: 'impuestos',
      amount: paid.numericValue,
      currency: 'COP' as const,
      date,
      account: account || undefined,
      settles: {
        kind: 'ss' as const,
        period,
        // The obligation's FULL value on the base actually used — what "is this settled"
        // is measured against, frozen so a later TRM correction cannot reopen it.
        accrued: ssOnUsedIbc,
        ...(ibcMode === 'other' ? { ibc: ibcAmt.numericValue } : {}),
      },
    }

    if (editing) {
      // The date can move the payment to another month, and updateEgreso works on the
      // current one, so go there first.
      if (editing.monthKey !== useFinanceStore.getState().curKey) setCurKey(editing.monthKey)
      updateEgreso(editing.id, payload)
      showToast('Pago actualizado')
    } else {
      addEgreso(payload)
      showToast('Pago registrado')
    }
    closeSheet()
  }

  function handleDelete() {
    if (!editing) return
    if (editing.monthKey !== useFinanceStore.getState().curKey) setCurKey(editing.monthKey)
    removeEgreso(editing.id)
    showToast('Pago eliminado')
    closeSheet()
  }

  if (!ssPayment) return null

  return (
    <SheetBase
      id="ss-payment"
      title={editing ? 'Editar pago de SS' : 'Registrar pago de SS'}
      dirty={dirty}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSave}>
            {editing ? 'Guardar cambios' : 'Registrar pago'}
          </Button>
          {editing && !confirmingDelete && (
            <Button size="xl" variant="outline-danger" className="w-full" onClick={() => setConfirmingDelete(true)}>
              Eliminar pago
            </Button>
          )}
          {editing && confirmingDelete && (
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

        {/* The three numbers this act is about, in one place: what the app suggested, on
            what base, and what actually left the account. Reading them apart is what made
            the old flow feel like bookkeeping. */}
        <div className="rounded-xl bg-muted px-3 py-2.5 space-y-1.5">
          <div className="ts-label-micro uppercase text-muted-foreground/70">
            Seguridad social de {monthName} {y}
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="ts-body-small text-muted-foreground">
              IBC {ibcMode === 'other' ? 'facturado' : 'sugerido'}
            </span>
            <span className="ts-amount-small">{COP(usedIbc)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3">
            <span className="ts-body-small text-muted-foreground">SS sobre esa base</span>
            <span className="ts-amount-small">{COP(ssOnUsedIbc)}</span>
          </div>
          <div className="flex items-baseline justify-between gap-3 pt-1.5 border-t border-[var(--border)]">
            <span className="ts-body-base-emphasis">SS pagada</span>
            <span className="ts-amount-base">{COP(paid.numericValue)}</span>
          </div>
          {paid.numericValue > 0 && Math.abs(difference) > 1000 && (
            <div className={cn(
              'ts-body-small',
              difference < 0 ? 'text-[var(--color-tax-txt)]' : 'text-muted-foreground',
            )}>
              {difference < 0
                ? `Faltan ${COP(-difference)} para cubrir la base`
                : `${COP(difference)} por encima de la base`}
            </div>
          )}
        </div>

        {/* The IBC is a SUGGESTION: the base actually invoiced can differ — the rate on the
            day the money landed, cross-border and transaction costs, a correction on the
            planilla. A figure the user cannot contradict is one they stop trusting. */}
        <div className="space-y-2">
          <span className="field-label ts-label-base">IBC de este pago</span>
          <SegmentedControl
            ariaLabel="Base del pago"
            value={ibcMode}
            onChange={v => {
              setIbcMode(v)
              if (v === 'suggested') ibcAmt.setValue(ssPayment.suggestedIbc)
            }}
            options={[
              { value: 'suggested', label: 'El sugerido' },
              { value: 'other',     label: 'Otro' },
            ] as const}
          />
          {ibcMode === 'other' ? (
            <MoneyInput
              id="ssp-ibc"
              label="IBC facturado"
              currency="COP"
              value={ibcAmt.display}
              onChange={ibcAmt.handleChange}
            />
          ) : (
            <div className="ts-body-small text-muted-foreground">
              40% de los ingresos por servicios, o el piso SMMLV
            </div>
          )}
        </div>

        <div className="flex items-end gap-2">
          <MoneyInput
            id="ssp-paid"
            label="Valor pagado"
            currency="COP"
            value={paid.display}
            onChange={paid.handleChange}
            className="flex-1"
          />
          <Button
            size="sm"
            variant="outline"
            className="shrink-0 mb-0.5"
            onClick={() => paid.setValue(Math.round(ssOnUsedIbc))}
          >
            Usar {COP(ssOnUsedIbc)}
          </Button>
        </div>

        <div>
          <label htmlFor="ssp-date" className="field-label ts-label-base">Fecha del pago</label>
          <DatePicker id="ssp-date" value={date} onChange={setDate} />
        </div>

        <div>
          <label htmlFor="ssp-acc" className="field-label ts-label-base">
            Cuenta que paga <span className="ts-detail-large text-muted-foreground">(opcional)</span>
          </label>
          <Select value={account || '_none'} onValueChange={v => setAccount(v === '_none' ? '' : v)}>
            <SelectTrigger id="ssp-acc" className="w-full"><SelectValue /></SelectTrigger>
            <SelectContent>
              <SelectItem value="_none">Sin cuenta asociada</SelectItem>
              {accounts.map(a => (
                <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <p className="ts-body-small text-muted-foreground">
          Sale de la cuenta, pero no se suma a los gastos del mes — ya está contada como
          obligación del mes que la causó.
        </p>
      </div>
    </SheetBase>
  )
}
