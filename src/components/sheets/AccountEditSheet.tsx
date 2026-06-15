import { useState, useEffect } from 'react'
import { Trash2 } from 'lucide-react'
import { SheetBase } from '@/components/ui/SheetBase'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'

export function AccountEditSheet() {
  const { getAccounts, saveAccountsConfig } = useFinanceStore()
  const { closeSheet, showToast, editingAccountId, setEditingAccount, activeSheet } = useUIStore()

  const isEditing = editingAccountId !== null

  const [label, setLabel]       = useState('')
  const [currency, setCurrency] = useState<'USD' | 'COP'>('COP')
  const [number, setNumber]     = useState('')
  const [rate, setRate]         = useState('')

  useEffect(() => {
    if (activeSheet !== 'account-edit') return
    if (editingAccountId) {
      const a = getAccounts().find(acc => acc.id === editingAccountId)
      if (a) { setLabel(a.label); setCurrency(a.currency); setNumber(a.number || ''); setRate(a.rate ? String(a.rate) : '') }
    } else {
      setLabel(''); setCurrency('COP'); setNumber(''); setRate('')
    }
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingAccountId])

  function handleSave() {
    if (!label.trim()) { showToast('Ingresa el nombre de la cuenta'); return }
    const accounts = getAccounts()
    const rateNum = parseFloat(rate.replace(',', '.')) || 0
    if (editingAccountId) {
      const idx = accounts.findIndex(a => a.id === editingAccountId)
      if (idx !== -1) accounts[idx] = { ...accounts[idx], label: label.trim(), currency, number: number.trim(), rate: rateNum }
      showToast('Cuenta actualizada')
    } else {
      accounts.push({ id: 'acc_' + Date.now(), label: label.trim(), currency, number: number.trim(), rate: rateNum })
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
          <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Nombre</label>
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder="Ej: ARQ Principal"
            className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Moneda</label>
            <select
              value={currency}
              onChange={e => setCurrency(e.target.value as 'USD' | 'COP')}
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] appearance-none"
            >
              <option value="USD">USD</option>
              <option value="COP">COP</option>
            </select>
          </div>
          <div>
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Tasa anual % (opcional)</label>
            <input
              type="text"
              inputMode="decimal"
              value={rate}
              onChange={e => setRate(e.target.value)}
              placeholder="Ej: 3.5"
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
            />
          </div>
        </div>

        <div>
          <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Número de cuenta (opcional, últimos 4 dígitos)</label>
          <input
            type="text"
            value={number}
            onChange={e => setNumber(e.target.value)}
            placeholder="1234"
            maxLength={20}
            className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
          />
        </div>

        <button
          onClick={handleSave}
          className="w-full bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg py-2 px-4 text-[13px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity active:scale-[.97]"
        >
          {isEditing ? 'Guardar cambios' : 'Agregar cuenta'}
        </button>

        {isEditing && (
          <button
            onClick={handleDelete}
            className="w-full border border-[var(--n-danger)] text-[var(--n-danger)] rounded-lg py-2 px-4 text-[13px] font-medium bg-transparent cursor-pointer hover:bg-[var(--n-danger-bg)] transition-colors flex items-center justify-center gap-2"
          >
            <Trash2 size={14} />
            Eliminar cuenta
          </button>
        )}
      </div>
    </SheetBase>
  )
}
