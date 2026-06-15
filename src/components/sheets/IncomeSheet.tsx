import { useState } from 'react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { TRANSFER_ACCOUNTS } from '@/data/defaults'

const ACCOUNT_IDS = TRANSFER_ACCOUNTS.map(a => a.id)

export function IncomeSheet() {
  const { addIncome, getAccounts } = useFinanceStore()
  const { closeSheet, showToast } = useUIStore()

  const [desc, setDesc]       = useState('')
  const [currency, setCurrency] = useState<'USD' | 'COP'>('USD')
  const [account, setAccount]  = useState('ARQ')
  const [tipo, setTipo]        = useState<'servicios' | 'otro'>('servicios')
  const decimals = currency === 'USD' ? 2 : 0
  const amt = useMoneyInput({ decimals })

  const accounts = getAccounts()

  function handleSubmit() {
    if (!desc.trim() || !amt.numericValue) { showToast('Ingresa descripción y monto'); return }
    addIncome({ desc: desc.trim(), amount: amt.numericValue, currency, account, tipo })
    showToast('Ingreso agregado')
    setDesc('')
    amt.setValue(0)
    closeSheet()
  }

  return (
    <SheetBase id="income" title="Registrar ingreso">
      <div className="space-y-4">
        <div>
          <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Descripción</label>
          <input
            type="text"
            value={desc}
            onChange={e => setDesc(e.target.value)}
            placeholder="Ej: Observer Hub Feb"
            className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Moneda</label>
            <select
              value={currency}
              onChange={e => { setCurrency(e.target.value as 'USD' | 'COP'); amt.setValue(0) }}
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] appearance-none"
            >
              <option value="USD">USD</option>
              <option value="COP">COP</option>
            </select>
          </div>
          <MoneyInput
            id="i-amt"
            label="Monto"
            currency={currency}
            value={amt.display}
            onChange={amt.handleChange}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Cuenta</label>
            <input
              type="text"
              list="account-list"
              value={account}
              onChange={e => setAccount(e.target.value)}
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
            />
            <datalist id="account-list">
              {accounts.map(a => <option key={a.id} value={a.id}>{a.label}</option>)}
              {!ACCOUNT_IDS.includes(account) && <option value="Otro" />}
            </datalist>
          </div>
          <div>
            <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">Tipo</label>
            <select
              value={tipo}
              onChange={e => setTipo(e.target.value as 'servicios' | 'otro')}
              className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] appearance-none"
            >
              <option value="servicios">Servicios</option>
              <option value="otro">Otro</option>
            </select>
          </div>
        </div>

        <button
          onClick={handleSubmit}
          className="w-full bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg py-2 px-4 text-[13px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity active:scale-[.97]"
        >
          Registrar ingreso
        </button>
      </div>
    </SheetBase>
  )
}
