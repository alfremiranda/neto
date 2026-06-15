import { useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'

export function BalanceSheet() {
  const { getCurrentMonth, getAccounts, setBalance } = useFinanceStore()
  const { closeSheet, showToast, editingBalanceId, activeSheet } = useUIStore()

  const account = editingBalanceId ? getAccounts().find(a => a.id === editingBalanceId) : null
  const decimals = account?.currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  useEffect(() => {
    if (activeSheet !== 'balance' || !editingBalanceId) return
    const bal = (getCurrentMonth().balances || {})[editingBalanceId] || 0
    amt.setValue(bal)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingBalanceId])

  function handleSave() {
    if (!editingBalanceId) return
    setBalance(editingBalanceId, amt.numericValue)
    showToast('Saldo actualizado')
    closeSheet()
  }

  return (
    <SheetBase id="balance" title="Saldo de cuenta">
      <div className="space-y-4">
        {account && (
          <div className="text-[13px] text-[var(--n-txt2)]">
            {account.label} · <span className="font-medium">{account.currency}</span>
          </div>
        )}
        <MoneyInput
          label="Saldo actual"
          currency={account?.currency}
          value={amt.display}
          onChange={amt.handleChange}
        />
        <button
          onClick={handleSave}
          className="w-full bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg py-2 px-4 text-[13px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity active:scale-[.97]"
        >
          Guardar saldo
        </button>
      </div>
    </SheetBase>
  )
}
