import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD, parseMoney } from '@/lib/format'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'

export function TransferSheet() {
  const { getAccounts, getCurrentMonth, addTransfer, updateTransfer } = useFinanceStore()
  const { closeSheet, showToast, activeSheet, editingTransferId } = useUIStore()
  const liveTRM = useLiveTRM()

  const accounts = getAccounts()
  const month = getCurrentMonth()
  const isEditing = editingTransferId != null

  const [fromId, setFromId] = useState(accounts[0]?.id || '')
  const [toId, setToId]     = useState(accounts[1]?.id || accounts[0]?.id || '')
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10))
  const [trmDisplay, setTrmDisplay] = useState('')

  const from = accounts.find(a => a.id === fromId)
  const to   = accounts.find(a => a.id === toId)
  const isCross = from && to && from.currency !== to.currency

  const amt = useMoneyInput({ decimals: from?.currency === 'USD' ? 2 : 0 })

  // Load existing transfer data when editing
  useEffect(() => {
    if (activeSheet !== 'transfer') return
    const trm = month.trm
    const trmStr = trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })

    if (isEditing) {
      const t = (month.transfers || []).find(t => t.id === editingTransferId)
      if (t) {
        setFromId(t.from)
        setToId(t.to)
        setDate(t.date)
        amt.setValue(t.amount)
        setTrmDisplay(t.trm
          ? t.trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : trmStr)
        return
      }
    }
    // New transfer defaults
    setFromId(accounts[0]?.id || '')
    setToId(accounts[1]?.id || accounts[0]?.id || '')
    setDate(new Date().toISOString().slice(0, 10))
    amt.setValue(0)
    setTrmDisplay(trmStr)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingTransferId])

  // Effective balance for "Todo →" shortcut (only for new transfers)
  const transfers = month.transfers || []
  const fromDelta = transfers.reduce((acc, t) => {
    if (t.from === fromId) return acc - t.amount
    if (t.to === fromId)   return acc + t.toAmount
    return acc
  }, 0)
  const fromBase = month.balances?.[fromId]
  const fromEffective = fromBase != null
    ? fromBase + fromDelta
    : fromDelta !== 0 ? fromDelta : null

  function getResult(): string {
    if (!from || !to || !amt.numericValue) return ''
    const trm = parseMoney(trmDisplay) || month.trm
    if (from.currency === 'USD' && to.currency === 'COP') return '→ ' + COP(amt.numericValue * trm)
    if (from.currency === 'COP' && to.currency === 'USD') return '→ ' + USD(amt.numericValue / trm)
    return from.currency === 'USD' ? '→ ' + USD(amt.numericValue) : '→ ' + COP(amt.numericValue)
  }

  function handleSubmit() {
    if (!amt.numericValue) { showToast('Ingresa el monto'); return }
    if (fromId === toId) { showToast('Las cuentas deben ser distintas'); return }
    if (!from || !to) return
    const trm = isCross ? (parseMoney(trmDisplay) || month.trm) : null
    let toAmount = amt.numericValue
    if (from.currency === 'USD' && to.currency === 'COP') toAmount = amt.numericValue * (trm ?? month.trm)
    else if (from.currency === 'COP' && to.currency === 'USD') toAmount = amt.numericValue / (trm ?? month.trm)

    const payload = {
      date: date || new Date().toISOString().slice(0, 10),
      from: fromId, to: toId,
      amount: amt.numericValue,
      fromCurrency: from.currency,
      toCurrency: to.currency,
      trm,
      toAmount,
    }

    if (isEditing && editingTransferId != null) {
      updateTransfer(editingTransferId, payload)
      showToast('Movimiento actualizado')
    } else {
      addTransfer(payload)
      showToast('Movimiento registrado')
    }
    closeSheet()
  }

  return (
    <SheetBase id="transfer" title={isEditing ? 'Editar movimiento' : 'Nuevo movimiento'}>
      <div className="space-y-4">
        {liveTRM.trm && (
          <div className="flex justify-between items-center bg-muted rounded-lg px-3 py-2">
            <span className="text-xs text-muted-foreground">TRM en vivo</span>
            <div className="flex items-center gap-2">
              <span className="text-sm font-medium tabular-nums">
                {liveTRM.trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                className="text-xs text-primary border-none bg-transparent cursor-pointer hover:underline"
                onClick={() => setTrmDisplay(
                  liveTRM.trm!.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
                )}
              >
                Usar →
              </button>
            </div>
          </div>
        )}

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Desde</label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="field-label">Hacia</label>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {accounts.map(a => <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label className="field-label">Monto{from ? ` (${from.currency})` : ''}</label>
            {!isEditing && fromEffective != null && fromEffective > 0 && (
              <button
                type="button"
                className="text-xs text-primary border-none bg-transparent cursor-pointer hover:underline"
                onClick={() => amt.setValue(fromEffective)}
              >
                Todo → {from?.currency === 'USD' ? USD(fromEffective) : COP(fromEffective)}
              </button>
            )}
          </div>
          <MoneyInput value={amt.display} onChange={amt.handleChange} />
        </div>

        {isCross && (
          <MoneyInput
            label="TRM usado"
            value={trmDisplay}
            onChange={setTrmDisplay}
          />
        )}

        {getResult() && (
          <div className="text-sm text-muted-foreground bg-muted rounded-lg px-3 py-2">
            {getResult()}
          </div>
        )}

        <div>
          <label className="field-label">Fecha</label>
          <DatePicker value={date} onChange={setDate} />
        </div>

        <Button className="w-full" onClick={handleSubmit}>
          {isEditing ? 'Guardar cambios' : 'Registrar movimiento'}
        </Button>
      </div>
    </SheetBase>
  )
}
