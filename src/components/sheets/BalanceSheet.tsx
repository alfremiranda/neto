import { useEffect } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'

export function BalanceSheet() {
  const { getAccounts, setStartingBalance } = useFinanceStore()
  const { closeSheet, showToast, editingBalanceId, activeSheet } = useUIStore()

  const account = editingBalanceId ? getAccounts().find(a => a.id === editingBalanceId) : null
  const decimals = account?.currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  useEffect(() => {
    if (activeSheet !== 'balance' || !editingBalanceId) return
    amt.setValue(account?.startingBalance ?? 0)
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingBalanceId])

  function handleSave() {
    if (!editingBalanceId) return
    setStartingBalance(editingBalanceId, amt.numericValue)
    showToast('Saldo inicial actualizado')
    closeSheet()
  }

  return (
    <SheetBase
      id="balance"
      title="Saldo inicial de cuenta"
      footer={
        <Button className="w-full" onClick={handleSave}>
          Guardar saldo inicial
        </Button>
      }
    >
      <div className="space-y-4">
        {account && (
          <div className="text-sm text-muted-foreground">
            {account.label} · <span className="font-medium text-foreground">{account.currency}</span>
          </div>
        )}
        <p className="text-xs text-muted-foreground leading-relaxed">
          Ingresa el saldo que tenía esta cuenta antes de empezar a registrar movimientos en la app.
          El balance actual se calculará automáticamente a partir de aquí.
        </p>
        <MoneyInput
          label="Saldo inicial"
          currency={account?.currency}
          value={amt.display}
          onChange={amt.handleChange}
        />
      </div>
    </SheetBase>
  )
}
