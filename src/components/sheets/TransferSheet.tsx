import { useState, useEffect } from 'react'
import { ArrowRight } from 'lucide-react'
import { SheetBase } from '@/components/ui/SheetBase'
import { MoneyInput } from '@/components/ui/MoneyInput'
import { useMoneyInput } from '@/hooks/useMoneyInput'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD, parseMoney, localToday } from '@/lib/format'
import { computeAccountBalance } from '@/lib/calc'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { DatePicker } from '@/components/ui/DatePicker'
import { cn } from '@/lib/utils'
import { Switch } from '@/components/ui/switch'
import type { Account, Settles } from '@/types'

// ─── Balance preview row ──────────────────────────────────────────────────────

function BalanceRow({
  account, current, after, showProjection,
}: { account: Account; current: number; after: number; showProjection: boolean }) {
  const fmt   = account.currency === 'USD' ? USD : COP
  const delta = after - current
  return (
    <div className="px-3 py-2.5">
      <div className="ts-label-base text-muted-foreground mb-1.5">
        {account.label} <span className="ts-detail-large opacity-60">({account.currency})</span>
      </div>
      <div className="flex items-center gap-2">
        <span className={cn(
          'ts-amount-base',
          showProjection ? 'text-muted-foreground' : 'ts-body-base-emphasis text-foreground',
        )}>
          {fmt(current)}
        </span>
        {showProjection && <>
          <ArrowRight size={12} className="text-muted-foreground/40 shrink-0" />
          <span className={cn(
            'ts-amount-base',
            after < 0 ? 'text-[var(--color-expense-txt)]' : 'text-foreground',
          )}>
            {fmt(after)}
          </span>
          <span className={cn(
            'ts-amount-small ml-auto',
            delta > 0 ? 'text-[var(--color-provision-txt)]' : 'text-[var(--color-expense-txt)]',
          )}>
            {delta > 0 ? '+' : ''}{fmt(delta)}
          </span>
        </>}
      </div>
    </div>
  )
}

export function TransferSheet() {
  const { getAccounts, getCurrentMonth, addTransfer, updateTransfer, removeTransfer, db, curKey } = useFinanceStore()
  const { closeSheet, showToast, activeSheet, editingTransferId } = useUIStore()
  const liveTRM = useLiveTRM()

  const accounts = getAccounts()
  const month    = getCurrentMonth()
  const isEditing = editingTransferId != null

  const [fromId,      setFromId]      = useState(accounts[0]?.id || '')
  const [toId,        setToId]        = useState(accounts[1]?.id || accounts[0]?.id || '')
  const [date,        setDate]        = useState(localToday())
  const [trmDisplay,  setTrmDisplay]  = useState('')
  const [trmManual,   setTrmManual]   = useState(false)
  const [confirmingDelete, setConfirmingDelete] = useState(false)
  const [reserves, setReserves] = useState<Settles | undefined>(undefined)

  const from = accounts.find(a => a.id === fromId)
  const to   = accounts.find(a => a.id === toId)
  // The year the reserve counts toward: the one the money was set aside in.
  const reserveYear = (date || localToday()).slice(0, 4)
  const isCross = !!(from && to && from.currency !== to.currency)

  const amt         = useMoneyInput({ decimals: from?.currency === 'USD' ? 2 : 0 })
  const amtReceived = useMoneyInput({ decimals: to?.currency === 'USD' ? 2 : 0 })

  // Month key for the selected date — used for balance preview
  const dateMK = date ? date.slice(0, 7) : curKey

  // When live TRM loads after the sheet is already open, adopt it (unless user typed manually or editing)
  useEffect(() => {
    if (trmManual || isEditing || !liveTRM.trm) return
    setTrmDisplay(liveTRM.trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [liveTRM.trm])

  // Effective TRM when both amounts are known
  const officialTRM = parseMoney(trmDisplay) || liveTRM.trm || month.trm
  const hasReceived = isCross && amtReceived.numericValue > 0 && amt.numericValue > 0
  const effectiveTRM = hasReceived
    ? (from?.currency === 'USD'
        ? amtReceived.numericValue / amt.numericValue          // COP/USD
        : amt.numericValue / amtReceived.numericValue)         // USD/COP
    : null
  const trmDelta  = effectiveTRM != null ? effectiveTRM - officialTRM : null
  const trmDeltaPct = trmDelta != null && officialTRM > 0 ? (trmDelta / officialTRM) * 100 : null

  // Load existing transfer when editing
  useEffect(() => {
    if (activeSheet !== 'transfer') return

    if (isEditing) {
      const t = (month.transfers || []).find(t => t.id === editingTransferId)
      if (t) {
        setFromId(t.from)
        setToId(t.to)
        setDate(t.date)
        amt.setValue(t.amount)
        amtReceived.setValue(t.toAmount !== t.amount ? t.toAmount : 0)
        // Show the BanRep TRM that was in effect when the transfer was saved
        setTrmDisplay(t.trm
          ? t.trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
          : month.trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
        setTrmManual(true)
        setReserves(t.reserves)
        return
      }
    }
    // Defaults for new transfer — use live BanRep TRM as the reference rate
    const defaultTRM = liveTRM.trm ?? month.trm
    setFromId(accounts[0]?.id || '')
    setToId(accounts[1]?.id || accounts[0]?.id || '')
    setDate(localToday())
    amt.setValue(0)
    amtReceived.setValue(0)
    setTrmDisplay(defaultTRM.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
    setTrmManual(false)
    setConfirmingDelete(false)
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [activeSheet, editingTransferId])

  // Balances up to and including the selected date's month
  const fromBalance = from ? computeAccountBalance(fromId, from, db, dateMK) : 0
  const toBalance   = to   ? computeAccountBalance(toId,   to,   db, dateMK) : 0

  function computeToAmount(): number {
    if (!from || !to || !amt.numericValue) return 0
    if (hasReceived) return amtReceived.numericValue
    const trm = officialTRM
    if (from.currency === 'USD' && to.currency === 'COP') return amt.numericValue * trm
    if (from.currency === 'COP' && to.currency === 'USD') return amt.numericValue / trm
    return amt.numericValue
  }

  function getResultLabel(): string {
    if (!from || !to || !amt.numericValue) return ''
    const toAmt = computeToAmount()
    if (hasReceived) return ''                                    // shown separately
    if (from.currency === 'USD' && to.currency === 'COP') return `→ ${COP(toAmt)}`
    if (from.currency === 'COP' && to.currency === 'USD') return `→ ${USD(toAmt)}`
    return from.currency === 'USD' ? `→ ${USD(toAmt)}` : `→ ${COP(toAmt)}`
  }

  function handleDelete() {
    if (editingTransferId == null) return
    removeTransfer(editingTransferId)
    showToast('Movimiento eliminado')
    closeSheet()
  }

  function handleSubmit() {
    if (!amt.numericValue) { showToast('Ingresa el monto'); return }
    if (fromId === toId)   { showToast('Las cuentas deben ser distintas'); return }
    if (!from || !to) return

    // Source account must have enough balance to cover the transfer.
    // Credit cards are exempt — they can go into (more) debt.
    if (from.type !== 'credit') {
      const existing = isEditing ? (month.transfers || []).find(t => t.id === editingTransferId) : undefined
      // fromBalance already reflects the existing transfer's deduction when editing; add it back
      const addBack   = existing && existing.from === fromId ? existing.amount : 0
      const available = fromBalance + addBack
      if (amt.numericValue > available) {
        const fmtCcy = from.currency === 'USD' ? USD : COP
        showToast(`Saldo insuficiente en ${from.label} · disponible ${fmtCcy(Math.max(available, 0))}`)
        return
      }
    }

    const toAmount = computeToAmount()
    const trm      = isCross
      ? (effectiveTRM ?? (parseMoney(trmDisplay) || month.trm))
      : null

    const payload = {
      date: date || localToday(),
      from: fromId, to: toId,
      amount: amt.numericValue,
      fromCurrency: from.currency,
      toCurrency:   to.currency,
      trm,
      toAmount,
      reserves,
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
    <SheetBase
      id="transfer"
      title={isEditing ? 'Editar movimiento' : 'Nuevo movimiento'}
      footer={
        <div className="space-y-4 sm:space-y-3">
          <Button size="xl" className="w-full" onClick={handleSubmit}>
            {isEditing ? 'Guardar cambios' : 'Registrar movimiento'}
          </Button>
          {isEditing && !confirmingDelete && (
            <Button size="xl" variant="outline-danger" className="w-full" onClick={() => setConfirmingDelete(true)}>
              Eliminar movimiento
            </Button>
          )}
          {isEditing && confirmingDelete && (
            <div className="flex gap-2">
              <Button size="xl" variant="ghost" className="flex-1" onClick={() => setConfirmingDelete(false)}>
                Cancelar
              </Button>
              <Button size="xl" variant="destructive" className="flex-1" onClick={handleDelete}>
                Confirmar
              </Button>
            </div>
          )}
        </div>
      }
    >
      <div className="space-y-4">

        {/* Live TRM banner */}
        {liveTRM.trm && (
          <div className="flex justify-between items-center bg-muted rounded-xl px-3 py-2">
            <span className="ts-body-small text-muted-foreground">TRM en vivo</span>
            <div className="flex items-center gap-2">
              <span className="ts-amount-base">
                {liveTRM.trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
              <button
                className="ts-body-small text-primary border-none bg-transparent cursor-pointer hover:underline"
                onClick={() => {
                  setTrmDisplay(liveTRM.trm!.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 }))
                  setTrmManual(true)
                }}
              >
                Usar →
              </button>
            </div>
          </div>
        )}

        {/* From / To accounts */}
        <div className="grid grid-cols-2 gap-3">
          <div>
            <label htmlFor="tr-from" className="field-label ts-label-base">Desde</label>
            <Select value={fromId} onValueChange={setFromId}>
              <SelectTrigger id="tr-from" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...accounts].sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite)).map(a => <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
          <div>
            <label htmlFor="tr-to" className="field-label ts-label-base">Hacia</label>
            <Select value={toId} onValueChange={setToId}>
              <SelectTrigger id="tr-to" className="w-full"><SelectValue /></SelectTrigger>
              <SelectContent>
                {[...accounts].sort((a, b) => Number(!!b.favorite) - Number(!!a.favorite)).map(a => <SelectItem key={a.id} value={a.id}>{a.label} ({a.currency})</SelectItem>)}
              </SelectContent>
            </Select>
          </div>
        </div>

        {/* Sent amount */}
        <div>
          <div className="flex items-center justify-between mb-0.5">
            <label htmlFor="tr-amt" className="field-label ts-label-base">Monto enviado{from ? ` (${from.currency})` : ''}</label>
            {!isEditing && fromBalance > 0 && (
              <button
                type="button"
                className="ts-body-small text-primary border-none bg-transparent cursor-pointer hover:underline"
                onClick={() => amt.setValue(fromBalance)}
              >
                Todo → {from?.currency === 'USD' ? USD(fromBalance) : COP(fromBalance)}
              </button>
            )}
          </div>
          <MoneyInput id="tr-amt" value={amt.display} onChange={amt.handleChange} />
        </div>

        {/* Received amount — only for cross-currency transfers */}
        {isCross && (
          <div>
            <div className="flex items-center justify-between mb-0.5">
              <label htmlFor="tr-recv" className="field-label ts-label-base">
                Monto recibido{to ? ` (${to.currency})` : ''}
                <span className="ml-1 ts-detail-large text-muted-foreground/60">— opcional</span>
              </label>
              {hasReceived && (
                <button
                  type="button"
                  className="ts-body-small text-muted-foreground border-none bg-transparent cursor-pointer hover:text-foreground"
                  onClick={() => amtReceived.setValue(0)}
                >
                  Limpiar
                </button>
              )}
            </div>
            <MoneyInput id="tr-recv"
              value={amtReceived.display}
              onChange={amtReceived.handleChange}
              placeholder={
                amt.numericValue && !hasReceived
                  ? (from?.currency === 'USD' && to?.currency === 'COP'
                      ? COP(amt.numericValue * officialTRM)
                      : from?.currency === 'COP' && to?.currency === 'USD'
                        ? USD(amt.numericValue / officialTRM)
                        : '')
                  : ''
              }
            />
          </div>
        )}

        {/* Date */}
        <div>
          <label htmlFor="tr-date" className="field-label ts-label-base">Fecha</label>
          <DatePicker id="tr-date" value={date} onChange={setDate} />
        </div>

        {/* TRM field — hidden when received amount overrides it */}
        {isCross && !hasReceived && (
          <MoneyInput
            label="TRM usado"
            value={trmDisplay}
            onChange={v => { setTrmDisplay(v); setTrmManual(true) }}
          />
        )}

        {/* Effective TRM info when received is specified */}
        {hasReceived && effectiveTRM != null && (
          <div className="rounded-xl border border-[var(--border)] px-3 py-2.5 space-y-1.5">
            <div className="flex justify-between items-center">
              <span className="ts-body-small text-muted-foreground">TRM efectiva</span>
              <span className="ts-amount-base">
                {effectiveTRM.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            <div className="flex justify-between items-center">
              <span className="ts-body-small text-muted-foreground">TRM BanRep</span>
              <span className="ts-amount-small text-muted-foreground">
                {officialTRM.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
              </span>
            </div>
            {trmDelta != null && trmDeltaPct != null && (
              <div className="flex justify-between items-center pt-0.5 border-t border-[var(--border)]">
                <span className="ts-body-small text-muted-foreground">Diferencia (fee implícito)</span>
                <span className={cn(
                  'ts-amount-small',
                  trmDelta >= 0 ? 'text-[var(--color-provision-txt)]' : 'text-[var(--color-expense-txt)]',
                )}>
                  {trmDelta >= 0 ? '+' : ''}{trmDelta.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}
                  {' '}({trmDeltaPct >= 0 ? '+' : ''}{trmDeltaPct.toFixed(2)}%)
                </span>
              </div>
            )}
          </div>
        )}

        {/* Calculated result (when not using received amount) */}
        {getResultLabel() && (
          <div className="ts-body-base text-muted-foreground bg-muted rounded-xl px-3 py-2">
            {getResultLabel()}
          </div>
        )}

        {/* Reserve toward retención.
            Only offered when the money lands in a savings account, because that is the
            only place a reserve makes sense. Marking the transfer — rather than reading
            the destination balance — is what keeps the figure honest when personal
            savings share the account. */}
        {to?.type === 'savings' && (
          <div className="flex items-center justify-between py-1">
            <div>
              <div className="ts-body-base-emphasis">Reserva para retención</div>
              <div className="ts-body-small text-muted-foreground">
                Cuenta para la retención de {reserveYear} · no es un pago a la DIAN
              </div>
            </div>
            <Switch
              checked={!!reserves}
              onCheckedChange={on => setReserves(on ? { kind: 'retencion', period: reserveYear } : undefined)}
            />
          </div>
        )}

        {/* Balance preview — always visible */}
        {from && to && (
          <div className="rounded-xl border border-[var(--border)] overflow-hidden">
            <div className="px-3 py-2 bg-muted/50 border-b border-[var(--border)]">
              <span className="ts-label-micro uppercase text-muted-foreground">
                {amt.numericValue > 0 ? 'Saldos después del movimiento' : 'Saldos disponibles'}
              </span>
            </div>
            <div className="divide-y divide-[var(--border)]">
              <BalanceRow
                account={from}
                current={fromBalance}
                after={fromBalance - amt.numericValue}
                showProjection={amt.numericValue > 0}
              />
              <BalanceRow
                account={to}
                current={toBalance}
                after={toBalance + computeToAmount()}
                showProjection={amt.numericValue > 0 || hasReceived}
              />
            </div>
          </div>
        )}

      </div>
    </SheetBase>
  )
}
