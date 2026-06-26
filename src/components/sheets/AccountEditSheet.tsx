import { useState, useEffect } from 'react'
import { Trash2, Landmark, Wallet } from 'lucide-react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'

type AccountType = 'account' | 'cash'

export function AccountEditSheet() {
  const { getAccounts, saveAccountsConfig } = useFinanceStore()
  const { closeSheet, showToast, editingAccountId, setEditingAccount, activeSheet } = useUIStore()

  const isEditing = editingAccountId !== null
  const editingAccount = isEditing ? getAccounts().find(a => a.id === editingAccountId) : undefined
  const isLocked = editingAccount?.locked ?? false

  const [label, setLabel]         = useState('')
  const [currency, setCurrency]   = useState<'USD' | 'COP'>('COP')
  const [type, setType]           = useState<AccountType>('account')
  const [number, setNumber]       = useState('')
  const [rate, setRate]           = useState('')

  const balanceAmt = useMoneyInput({ decimals: currency === 'USD' ? 2 : 0 })

  const isCash = type === 'cash'

  useEffect(() => {
    if (activeSheet !== 'account-edit') return
    if (editingAccountId) {
      const a = getAccounts().find(acc => acc.id === editingAccountId)
      if (a) {
        setLabel(a.label)
        setCurrency(a.currency)
        setType(a.type ?? 'account')
        setNumber(a.number || '')
        setRate(a.rate ? String(a.rate) : '')
        balanceAmt.setValue(a.startingBalance ?? 0)
      }
    } else {
      setLabel(''); setCurrency('COP'); setType('account'); setNumber(''); setRate('')
      balanceAmt.setValue(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingAccountId])

  function handleSave() {
    if (!label.trim()) { showToast('Ingresa el nombre'); return }
    const accounts = getAccounts()
    const rateNum = isCash ? 0 : (parseFloat(rate.replace(',', '.')) || 0)
    const startingBalance = balanceAmt.numericValue
    const payload: Partial<Account> = {
      label: label.trim(), currency, type,
      number: isCash ? '' : number.trim(),
      rate: rateNum, startingBalance,
    }
    if (editingAccountId) {
      const idx = accounts.findIndex(a => a.id === editingAccountId)
      if (idx !== -1) accounts[idx] = { ...accounts[idx], ...payload }
      showToast(isCash ? 'Bolsillo actualizado' : 'Cuenta actualizada')
    } else {
      accounts.push({ id: 'acc_' + Date.now(), ...payload } as Account)
      showToast(isCash ? 'Bolsillo agregado' : 'Cuenta agregada')
    }
    saveAccountsConfig(accounts)
    setEditingAccount(null)
    closeSheet()
  }

  function handleDelete() {
    if (!editingAccountId) return
    saveAccountsConfig(getAccounts().filter(a => a.id !== editingAccountId))
    showToast('Eliminado')
    setEditingAccount(null)
    closeSheet()
  }

  return (
    <SheetBase
      id="account-edit"
      title={isEditing ? 'Editar' : 'Nuevo bolsillo'}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSave}>
            {isEditing ? 'Guardar cambios' : (isCash ? 'Agregar bolsillo' : 'Agregar cuenta')}
          </Button>
          {isEditing && !isLocked && (
            <Button size="xl" variant="outline-danger" className="w-full" onClick={handleDelete}>
              <Trash2 size={14} />
              Eliminar
            </Button>
          )}
        </div>
      }
    >
      <div className="space-y-4">

        {isLocked && (
          <p className="text-xs text-muted-foreground bg-muted rounded-lg px-3 py-2">
            Bolsillo del sistema — el nombre y la moneda no se pueden cambiar.
          </p>
        )}

        {/* Type selector — only at creation time */}
        {!isLocked && !isEditing && (
          <div>
            <label className="field-label">Tipo</label>
            <div className="flex rounded-lg border border-[var(--border)] p-0.5 gap-0.5">
              {(['account', 'cash'] as AccountType[]).map(t => {
                const Icon = t === 'account' ? Landmark : Wallet
                const selected = type === t
                return (
                  <button
                    key={t}
                    type="button"
                    onClick={() => setType(t)}
                    aria-pressed={selected}
                    className={cn(
                      'flex-1 flex items-center justify-center gap-2 py-1.5 rounded-md text-sm font-medium transition-colors cursor-pointer border-0',
                      selected
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-[var(--accent)]',
                    )}
                  >
                    <Icon size={14} />
                    {t === 'account' ? 'Cuenta bancaria' : 'Efectivo'}
                  </button>
                )
              })}
            </div>
          </div>
        )}

        <div>
          <label htmlFor="acc-name" className="field-label">Nombre</label>
          <input
            id="acc-name"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder={isCash ? 'Ej: Billetera, Menudo…' : 'Ej: Bancolombia Ahorros'}
            className="field-input"
            disabled={isLocked}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="acc-cur" className="field-label">Moneda</label>
            <Select value={currency} onValueChange={v => { setCurrency(v as 'USD' | 'COP'); balanceAmt.setValue(0) }} disabled={isLocked}>
              <SelectTrigger id="acc-cur" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="COP">COP</SelectItem>
                <SelectItem value="USD">USD</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {!isCash && (
            <div>
              <label htmlFor="acc-rate" className="field-label">Tasa anual % (opcional)</label>
              <input
                id="acc-rate"
                type="text"
                inputMode="decimal"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder="3.5"
                className="field-input"
              />
            </div>
          )}
        </div>

        {!isCash && (
          <div>
            <label htmlFor="acc-num" className="field-label">Número de cuenta — últimos 4 dígitos (opcional)</label>
            <input
              id="acc-num"
              type="text"
              value={number}
              onChange={e => setNumber(e.target.value)}
              placeholder="1234"
              maxLength={20}
              className="field-input"
            />
          </div>
        )}

        <MoneyInput
          label="Saldo inicial"
          currency={currency}
          value={balanceAmt.display}
          onChange={balanceAmt.handleChange}
          placeholder="0"
        />

      </div>
    </SheetBase>
  )
}
