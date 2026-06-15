import { Trash2, Settings2, CirclePlus, Plus } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD } from '@/lib/format'
import { CurrencyBadge } from '@/components/ui/Badge'
import { AccountEditSheet } from '@/components/sheets/AccountEditSheet'
import { BalanceSheet } from '@/components/sheets/BalanceSheet'
import { TransferSheet } from '@/components/sheets/TransferSheet'
import { MONTHS } from '@/data/defaults'

export function MovimientosCard() {
  const { getCurrentMonth, getAccounts, removeTransfer, curKey } = useFinanceStore()
  const { openSheet, showToast, setEditingAccount, setEditingBalance } = useUIStore()
  const month = getCurrentMonth()
  const accounts = getAccounts()
  const [y, m] = curKey.split('-').map(Number)

  function openAddAccount() { setEditingAccount(null); openSheet('account-edit') }
  function openEditAccount(id: string) { setEditingAccount(id); openSheet('account-edit') }
  function openBalance(id: string) { setEditingBalance(id); openSheet('balance') }

  return (
    <>
      <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-[10px]">
          <div className="flex items-center gap-[5px] text-[12px] font-medium text-[var(--n-txt2)]">
            <span>🔄</span>
            <span>Movimientos entre cuentas</span>
          </div>
          <div className="flex gap-[6px] items-center">
            <button
              onClick={openAddAccount}
              className="border border-[var(--n-border2)] rounded-lg p-[5px] bg-transparent text-[var(--n-txt)] hover:bg-[var(--n-bg2)] cursor-pointer transition-colors"
              title="Agregar cuenta"
            >
              <CirclePlus size={14} />
            </button>
            <button
              onClick={() => openSheet('transfer')}
              className="flex items-center gap-1 bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg px-3 py-[5px] text-[12px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity"
            >
              <Plus size={13} />
              Movimiento
            </button>
          </div>
        </div>

        {/* Account Scorecards */}
        <div className="grid gap-2 mb-[10px]"
          style={{ gridTemplateColumns: 'repeat(auto-fill, minmax(148px, 1fr))' }}>
          {accounts.map(a => {
            const bal = month.balances?.[a.id]
            const hasBal = bal != null
            const monthlyInt = hasBal && a.rate > 0 ? bal * (a.rate / 100) / 12 : 0
            const numStr = a.number ? `•••• ${String(a.number).slice(-4)}` : null

            return (
              <div
                key={a.id}
                onClick={() => openBalance(a.id)}
                className="bg-[var(--n-bg2)] rounded-lg p-3 cursor-pointer hover:bg-[var(--n-bg3)] transition-colors min-w-0"
              >
                <div className="flex justify-between items-start gap-1 mb-0.5">
                  <span className="text-[11px] text-[var(--n-txt2)] font-medium truncate flex-1 min-w-0">{a.label}</span>
                  <div className="flex items-center gap-0.5 shrink-0">
                    <CurrencyBadge currency={a.currency} />
                    <button
                      onClick={e => { e.stopPropagation(); openEditAccount(a.id) }}
                      className="border-none bg-transparent p-[3px] opacity-50 hover:opacity-100 rounded cursor-pointer text-[var(--n-txt)] transition-opacity"
                      title="Configurar cuenta"
                    >
                      <Settings2 size={11} />
                    </button>
                  </div>
                </div>
                {numStr && <div className="text-[10px] text-[var(--n-txt3)] font-mono mb-1">{numStr}</div>}
                <div className="text-[15px] font-semibold leading-tight mt-0.5">
                  {hasBal
                    ? (a.currency === 'USD' ? USD(bal!) : COP(bal!))
                    : <span className="text-[13px] font-normal text-[var(--n-txt3)]">Tocar para ingresar</span>}
                </div>
                {monthlyInt > 0 && (
                  <div className="text-[10px] text-[var(--n-green)] mt-[3px]">
                    ≈ {a.currency === 'USD' ? USD(monthlyInt) : COP(monthlyInt)}/mes · {a.rate}% a.a.
                  </div>
                )}
              </div>
            )
          })}
        </div>

        {/* Transfers list */}
        {(month.transfers || []).length === 0 ? (
          <div className="text-center py-4 text-[13px] text-[var(--n-txt3)]">
            Sin movimientos en {MONTHS[m]} {y}
          </div>
        ) : (
          <div>
            {(month.transfers || []).map(t => {
              const fromAcc = accounts.find(a => a.id === t.from)
              const toAcc   = accounts.find(a => a.id === t.to)
              return (
                <div key={t.id} className="flex items-center gap-2 py-2 border-b border-[var(--n-border)] last:border-0">
                  <div className="flex-1 min-w-0">
                    <div className="text-[12px] font-medium flex justify-between items-center">
                      <span>{fromAcc?.label ?? t.from} → {toAcc?.label ?? t.to}</span>
                      <span className="text-[11px] font-normal text-[var(--n-txt3)]">{t.date}</span>
                    </div>
                    <div className="text-[11px] text-[var(--n-txt3)] mt-0.5">
                      {t.fromCurrency === 'USD' ? USD(t.amount) : COP(t.amount)}
                      {t.trm ? ` · TRM ${t.trm.toLocaleString('es-CO', { maximumFractionDigits: 2 })}` : ''}
                    </div>
                  </div>
                  <button
                    onClick={() => { removeTransfer(t.id); showToast('Movimiento eliminado') }}
                    className="p-[6px] rounded-lg border border-[var(--n-border2)] bg-transparent text-[var(--n-txt3)] hover:bg-[var(--n-danger-bg)] hover:text-[var(--n-danger)] hover:border-[var(--n-danger)] cursor-pointer transition-colors"
                  >
                    <Trash2 size={12} />
                  </button>
                </div>
              )
            })}
          </div>
        )}
      </div>

      <AccountEditSheet />
      <BalanceSheet />
      <TransferSheet />
    </>
  )
}
