import { useState, useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD, parseMoney } from '@/lib/format'
import { useLiveTRM } from '@/hooks/useLiveTRM'

export function TransferSheet() {
  const { getAccounts, getCurrentMonth, addTransfer } = useFinanceStore()
  const { closeSheet, showToast } = useUIStore()
  const liveTRM = useLiveTRM()

  const accounts = getAccounts()
  const month = getCurrentMonth()

  const [fromId, setFromId] = useState(accounts[0]?.id || '')
  const [toId, setToId]     = useState(accounts[1]?.id || accounts[0]?.id || '')
  const [date, setDate]     = useState(new Date().toISOString().slice(0, 10))
  const [trmDisplay, setTrmDisplay] = useState('')

  const from = accounts.find(a => a.id === fromId)
  const to   = accounts.find(a => a.id === toId)
  const isCross = from && to && from.currency !== to.currency

  const amt = useMoneyInput({ decimals: from?.currency === 'USD' ? 2 : 0 })

  useEffect(() => {
    const trm = month.trm
    setTrmDisplay(trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  }, [month.trm])

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

    addTransfer({
      date: date || new Date().toISOString().slice(0, 10),
      from: fromId, to: toId,
      amount: amt.numericValue,
      fromCurrency: from.currency,
      toCurrency: to.currency,
      trm,
      toAmount,
    })
    showToast('Movimiento registrado')
    amt.setValue(0)
    closeSheet()
  }

  return (
    <SheetBase id="transfer" title="Nuevo movimiento">
      <div className="space-y-4">
        {/* TRM en vivo */}
        {liveTRM.trm && (
          <div className="flex justify-between items-center bg-[var(--n-bg2)] rounded-lg px-3 py-2">
            <span className="text-[11px] text-[var(--n-txt3)]">TRM en vivo</span>
            <div className="flex items-center gap-2">
              <span className="text-[13px] font-medium">
                {liveTRM.trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                className="text-[11px] text-[var(--n-blue)] border-none bg-transparent cursor-pointer"
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
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Desde</label>
            <select
              value={fromId}
              onChange={e => setFromId(e.target.value)}
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] appearance-none"
            >
              {accounts.map(a => <option key={a.id} value={a.id}>{a.label} ({a.currency})</option>)}
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Hacia</label>
            <select
              value={toId}
              onChange={e => setToId(e.target.value)}
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] appearance-none"
            >
              {accounts.map(a => <option key={a.id} value={a.id}>{a.label} ({a.currency})</option>)}
            </select>
          </div>
        </div>

        <MoneyInput
          label={`Monto${from ? ` (${from.currency})` : ''}`}
          value={amt.display}
          onChange={amt.handleChange}
        />

        {isCross && (
          <MoneyInput
            label="TRM usado"
            value={trmDisplay}
            onChange={setTrmDisplay}
          />
        )}

        {getResult() && (
          <div className="text-[13px] text-[var(--n-txt2)] bg-[var(--n-bg2)] rounded-lg px-3 py-2">
            {getResult()}
          </div>
        )}

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
          Registrar movimiento
        </button>
      </div>
    </SheetBase>
  )
}
