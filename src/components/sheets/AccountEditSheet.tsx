import { useState, useEffect } from 'react'
import { Trash2, Landmark, Wallet, CreditCard, PiggyBank } from 'lucide-react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'

type AccountType = 'account' | 'cash' | 'credit' | 'savings'
type SavingsKind = 'cuenta' | 'cdt' | 'inversion'

const SAVINGS_KINDS: Array<{ value: SavingsKind; label: string }> = [
  { value: 'cuenta',    label: 'Cuenta' },
  { value: 'cdt',       label: 'CDT' },
  { value: 'inversion', label: 'Inversión' },
]

const TYPE_OPTIONS: Array<{ value: AccountType; label: string; icon: typeof Landmark }> = [
  { value: 'account', label: 'Cuenta',   icon: Landmark },
  { value: 'cash',    label: 'Efectivo', icon: Wallet },
  { value: 'credit',  label: 'Crédito',  icon: CreditCard },
  { value: 'savings', label: 'Ahorro',   icon: PiggyBank },
]

// Clamp a day-of-month string to 1–31, or '' if empty/invalid
function clampDay(s: string): number | undefined {
  const n = parseInt(s.replace(/[^\d]/g, ''), 10)
  if (!n) return undefined
  return Math.min(Math.max(n, 1), 31)
}

export function AccountEditSheet() {
  const { getAccounts, saveAccountsConfig } = useFinanceStore()
  const { closeSheet, showToast, editingAccountId, setEditingAccount, activeSheet, newAccountType } = useUIStore()

  const isEditing = editingAccountId !== null
  const editingAccount = isEditing ? getAccounts().find(a => a.id === editingAccountId) : undefined
  const isLocked = editingAccount?.locked ?? false

  const [label, setLabel]         = useState('')
  const [currency, setCurrency]   = useState<'USD' | 'COP'>('COP')
  const [type, setType]           = useState<AccountType>('account')
  const [number, setNumber]       = useState('')
  const [rate, setRate]           = useState('')
  const [cutoffDay, setCutoffDay] = useState('')
  const [dueDay, setDueDay]       = useState('')
  const [savingsKind, setSavingsKind] = useState<SavingsKind>('cuenta')
  const [maturity, setMaturity]       = useState('')

  const decimals = currency === 'USD' ? 2 : 0
  const balanceAmt = useMoneyInput({ decimals })  // startingBalance for account/cash
  const limitAmt   = useMoneyInput({ decimals })  // credit limit (cupo)
  const debtAmt    = useMoneyInput({ decimals })  // current debt for credit

  const isCash    = type === 'cash'
  const isCredit  = type === 'credit'
  const isSavings = type === 'savings'

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
        setCutoffDay(a.cutoffDay ? String(a.cutoffDay) : '')
        setDueDay(a.dueDay ? String(a.dueDay) : '')
        setSavingsKind(a.savingsKind ?? 'cuenta')
        setMaturity(a.maturityDate ?? '')
        balanceAmt.setValue(a.startingBalance ?? 0)
        limitAmt.setValue(a.creditLimit ?? 0)
        // Credit balance is stored as −debt; show the positive debt to the user
        debtAmt.setValue(Math.max(-(a.startingBalance ?? 0), 0))
      }
    } else {
      setLabel(''); setCurrency('COP'); setType(newAccountType ?? 'account'); setNumber(''); setRate('')
      setCutoffDay(''); setDueDay('')
      setSavingsKind('cuenta'); setMaturity('')
      balanceAmt.setValue(0); limitAmt.setValue(0); debtAmt.setValue(0)
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingAccountId])

  function handleSave() {
    if (!label.trim()) { showToast('Ingresa el nombre'); return }
    const accounts = getAccounts()
    const rateNum = isCash ? 0 : (parseFloat(rate.replace(',', '.')) || 0)

    const payload: Partial<Account> = isCredit
      ? {
          label: label.trim(), currency, type,
          number: number.trim(),
          rate: rateNum,
          creditLimit: limitAmt.numericValue,
          // Store debt as a negative balance so charges/payments roll forward naturally
          startingBalance: -debtAmt.numericValue,
          cutoffDay: clampDay(cutoffDay),
          dueDay: clampDay(dueDay),
        }
      : {
          label: label.trim(), currency, type,
          number: isCash ? '' : number.trim(),
          rate: rateNum,
          startingBalance: balanceAmt.numericValue,
          ...(isSavings ? {
            savingsKind,
            maturityDate: savingsKind === 'cdt' ? (maturity || undefined) : undefined,
          } : {}),
        }

    if (editingAccountId) {
      const idx = accounts.findIndex(a => a.id === editingAccountId)
      if (idx !== -1) accounts[idx] = { ...accounts[idx], ...payload }
      showToast(isCredit ? 'Tarjeta actualizada' : isCash ? 'Bolsillo actualizado' : isSavings ? 'Ahorro actualizado' : 'Cuenta actualizada')
    } else {
      accounts.push({ id: 'acc_' + Date.now(), ...payload } as Account)
      showToast(isCredit ? 'Tarjeta agregada' : isCash ? 'Bolsillo agregado' : isSavings ? 'Ahorro agregado' : 'Cuenta agregada')
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

  const saveLabel = isEditing
    ? 'Guardar cambios'
    : isCredit ? 'Agregar tarjeta' : isCash ? 'Agregar bolsillo' : isSavings ? 'Agregar ahorro' : 'Agregar cuenta'

  return (
    <SheetBase
      id="account-edit"
      title={isEditing ? 'Editar' : 'Nueva cuenta'}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSave}>
            {saveLabel}
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
            <label htmlFor="acc-type" className="field-label">Tipo</label>
            <Select value={type} onValueChange={v => setType(v as AccountType)}>
              <SelectTrigger id="acc-type" className="w-full">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {TYPE_OPTIONS.map(({ value, label: tLabel, icon: Icon }) => (
                  <SelectItem key={value} value={value}>
                    <span className="flex items-center gap-2">
                      <Icon size={14} className="text-muted-foreground" />
                      {tLabel}
                    </span>
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        )}

        <div>
          <label htmlFor="acc-name" className="field-label">Nombre</label>
          <input
            id="acc-name"
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            placeholder={isCredit ? 'Ej: Visa Bancolombia' : isCash ? 'Ej: Billetera, Menudo…' : isSavings ? 'Ej: CDT Bancolombia, Skandia…' : 'Ej: Bancolombia Ahorros'}
            className="field-input"
            disabled={isLocked}
          />
        </div>

        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="acc-cur" className="field-label">Moneda</label>
            <Select
              value={currency}
              onValueChange={v => { setCurrency(v as 'USD' | 'COP'); balanceAmt.setValue(0); limitAmt.setValue(0); debtAmt.setValue(0) }}
              disabled={isLocked}
            >
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
              <label htmlFor="acc-rate" className="field-label">
                {isCredit ? 'Tasa E.A. % (opcional)' : isSavings ? 'Rendimiento E.A. % (opcional)' : 'Tasa anual % (opcional)'}
              </label>
              <input
                id="acc-rate"
                type="text"
                inputMode="decimal"
                value={rate}
                onChange={e => setRate(e.target.value)}
                placeholder={isCredit ? '28' : '3.5'}
                className="field-input"
              />
            </div>
          )}
        </div>

        {/* ── Savings/investment fields ── */}
        {isSavings && (
          <>
            <div>
              <label className="field-label">Tipo de ahorro</label>
              <div className="grid grid-cols-3 rounded-lg border border-[var(--border)] p-0.5 gap-0.5">
                {SAVINGS_KINDS.map(({ value, label: kLabel }) => (
                  <button
                    key={value}
                    type="button"
                    onClick={() => setSavingsKind(value)}
                    aria-pressed={savingsKind === value}
                    className={cn(
                      'py-1.5 rounded-md text-xs font-medium transition-colors border-0',
                      savingsKind === value
                        ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                        : 'bg-transparent text-muted-foreground hover:text-foreground hover:bg-[var(--accent)]',
                    )}
                  >
                    {kLabel}
                  </button>
                ))}
              </div>
            </div>
            {savingsKind === 'cdt' && (
              <div>
                <label htmlFor="acc-maturity" className="field-label">Fecha de vencimiento</label>
                <DatePicker id="acc-maturity" value={maturity} onChange={setMaturity} />
              </div>
            )}
          </>
        )}

        {/* ── Credit-card fields ── */}
        {isCredit && (
          <>
            <MoneyInput
              label="Cupo total"
              currency={currency}
              value={limitAmt.display}
              onChange={limitAmt.handleChange}
              placeholder="0"
            />
            <MoneyInput
              label="Deuda actual"
              currency={currency}
              value={debtAmt.display}
              onChange={debtAmt.handleChange}
              placeholder="0"
            />
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label htmlFor="acc-cutoff" className="field-label">Día de corte</label>
                <input
                  id="acc-cutoff"
                  type="text"
                  inputMode="numeric"
                  value={cutoffDay}
                  onChange={e => setCutoffDay(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  placeholder="15"
                  className="field-input"
                />
              </div>
              <div>
                <label htmlFor="acc-due" className="field-label">Día de pago</label>
                <input
                  id="acc-due"
                  type="text"
                  inputMode="numeric"
                  value={dueDay}
                  onChange={e => setDueDay(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                  placeholder="5"
                  className="field-input"
                />
              </div>
            </div>
            <p className="text-xs text-muted-foreground">
              Las compras se registran como egresos a la tarjeta (suben la deuda) y los pagos como movimientos desde tu cuenta (la bajan).
            </p>
          </>
        )}

        {/* Account number — bank + credit */}
        {!isCash && (
          <div>
            <label htmlFor="acc-num" className="field-label">
              {isCredit ? 'Últimos 4 dígitos (opcional)' : 'Número de cuenta — últimos 4 dígitos (opcional)'}
            </label>
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

        {/* Starting balance — bank + cash only (credit uses debt above) */}
        {!isCredit && (
          <MoneyInput
            label="Saldo inicial"
            currency={currency}
            value={balanceAmt.display}
            onChange={balanceAmt.handleChange}
            placeholder="0"
          />
        )}

      </div>
    </SheetBase>
  )
}
