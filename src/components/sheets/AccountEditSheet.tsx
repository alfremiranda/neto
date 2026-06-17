import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AccountEditSheet() {
  const { getAccounts, saveAccountsConfig } = useFinanceStore()
  const { closeSheet, showToast, editingAccountId, setEditingAccount, activeSheet } = useUIStore()

  const isEditing = editingAccountId !== null

  const [label, setLabel]       = useState('')
  const [currency, setCurrency] = useState<'USD' | 'COP'>('COP')
  const [number, setNumber]     = useState('')
  const [rate, setRate]         = useState('')
  const [hasBalance, setHasBalance] = useState(false)

  const balanceAmt = useMoneyInput({ decimals: currency === 'USD' ? 2 : 0 })

  useEffect(() => {
    if (activeSheet !== 'account-edit') return
    if (editingAccountId) {
      const a = getAccounts().find(acc => acc.id === editingAccountId)
      if (a) {
        setLabel(a.label)
        setCurrency(a.currency)
        setNumber(a.number || '')
        setRate(a.rate ? String(a.rate) : '')
        setHasBalance(a.startingBalance != null)
        balanceAmt.setValue(a.startingBalance ?? 0)
      }
    } else {
      setLabel(''); setCurrency('COP'); setNumber(''); setRate('')
      setHasBalance(false); balanceAmt.setValue(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingAccountId])

  function handleSave() {
    if (!label.trim()) { showToast('Ingresa el nombre de la cuenta'); return }
    const accounts = getAccounts()
    const rateNum = parseFloat(rate.replace(',', '.')) || 0
    const startingBalance = hasBalance ? balanceAmt.numericValue : undefined
    if (editingAccountId) {
      const idx = accounts.findIndex(a => a.id === editingAccountId)
      if (idx !== -1) accounts[idx] = { ...accounts[idx], label: label.trim(), currency, number: number.trim(), rate: rateNum, startingBalance }
      showToast('Cuenta actualizada')
    } else {
      accounts.push({ id: 'acc_' + Date.now(), label: label.trim(), currency, number: number.trim(), rate: rateNum, startingBalance })
      showToast('Cuenta agregada')
    }
    saveAccountsConfig(accounts)
    setEditingAccount(null)
    closeSheet()
  }

  function handleDelete() {
    if (!editingAccountId) return
    saveAccountsConfig(getAccounts().filter(a => a.id !== editingAccountId))
    showToast('Cuenta eliminada')
    setEditingAccount(null)
    closeSheet()
  }

  return (
    <SheetBase id="account-edit" title={isEditing ? 'Editar cuenta' : 'Agregar cuenta'}>
      <div className="space-y-4">
        <div>
          <label className="field-label">Nombre</label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ej: ARQ Principal"
            className="field-input"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="field-label">Moneda</label>
            <Select value={currency} onValueChange={v => setCurrency(v as 'USD' | 'COP')}>
              <SelectTrigger className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="USD">USD</SelectItem>
                <SelectItem value="COP">COP</SelectItem>
              </SelectContent>
            </Select>
          </div>
          <div>
            <label className="field-label">Tasa anual % (opcional)</label>
            <input
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={e => setRate(e.target.value)}
              placeholder="3.5"
              className="field-input"
            />
          </div>
        </div>

        <div>
          <label className="field-label">Número de cuenta — últimos 4 dígitos (opcional)</label>
          <input
            type="text"
            value={number}
            onChange={e => setNumber(e.target.value)}
            placeholder="1234"
            maxLength={20}
            className="field-input"
          />
        </div>

        {/* Starting balance */}
        <div>
          <div className="flex items-center justify-between mb-1.5">
            <label className="field-label mb-0">Saldo inicial</label>
            <button
              type="button"
              className="text-xs text-primary border-none bg-transparent cursor-pointer hover:underline"
              onClick={() => { setHasBalance(v => !v); if (hasBalance) balanceAmt.setValue(0) }}
            >
              {hasBalance ? 'Quitar' : 'Agregar'}
            </button>
          </div>
          {hasBalance && (
            <MoneyInput
              currency={currency}
              value={balanceAmt.display}
              onChange={balanceAmt.handleChange}
              placeholder="0"
            />
          )}
          {!hasBalance && (
            <p className="text-xs text-muted-foreground">
              Saldo antes de empezar a registrar movimientos en la app.
            </p>
          )}
        </div>

        <Button className="w-full" onClick={handleSave}>
          {isEditing ? 'Guardar cambios' : 'Agregar cuenta'}
        </Button>

        {isEditing && (
          <Button
            variant="outline"
            className="w-full text-destructive border-destructive hover:bg-[var(--color-danger-bg)] hover:text-destructive"
            onClick={handleDelete}
          >
            <Trash2 size={14} />
            Eliminar cuenta
          </Button>
        )}
      </div>
    </SheetBase>
  )
}
