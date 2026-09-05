import { useState } from 'react'
import { Landmark, Info, ExternalLink, X, Clock, Check } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD, localToday, fmtDate } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SectionCard } from '@/components/ui/SectionCard'
import { IconButton } from '@/components/ui/icon-button'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/Badge'
import { useUIStore } from '@/store/uiStore'
import { settledFor, settlementsFor, retencionReserve, pendingSS,
         type PendingObligation, type SettlementRecord } from '@/lib/obligations'
import type { Settles, FinanceDB, MonthData } from '@/types'

const MONTH_LONG = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                    'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

// ─── SS Payment schedule data ─────────────────────────────────────────────────

const SS_SCHEDULE = [
  { digits: '00–07', bizDay: 2  },
  { digits: '08–14', bizDay: 3  },
  { digits: '15–21', bizDay: 4  },
  { digits: '22–28', bizDay: 5  },
  { digits: '29–35', bizDay: 6  },
  { digits: '36–42', bizDay: 7  },
  { digits: '43–49', bizDay: 8  },
  { digits: '50–56', bizDay: 9  },
  { digits: '57–63', bizDay: 10 },
  { digits: '64–69', bizDay: 11 },
  { digits: '70–75', bizDay: 12 },
  { digits: '76–81', bizDay: 13 },
  { digits: '82–87', bizDay: 14 },
  { digits: '88–93', bizDay: 15 },
  { digits: '94–99', bizDay: 16 },
]

// Returns the Nth business day (Mon–Fri) of a given year/month (1-indexed)
function nthBusinessDay(year: number, month: number, n: number): Date {
  const d = new Date(year, month - 1, 1)
  let count = 0
  while (true) {
    const dow = d.getDay()
    if (dow !== 0 && dow !== 6) count++
    if (count === n) return new Date(d)
    d.setDate(d.getDate() + 1)
  }
}

const DAY_ES = ['dom', 'lun', 'mar', 'mié', 'jue', 'vie', 'sáb']
const MONTH_SHORT = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function fmtBizDate(d: Date): string {
  return `${DAY_ES[d.getDay()]} ${d.getDate()} ${MONTH_SHORT[d.getMonth()]}`
}

// ─── SS Payment schedule dialog ───────────────────────────────────────────────

function SSScheduleDialog({ year, month }: { year: number; month: number }) {
  const [open, setOpen] = useState(false)

  // Compute approximate dates for the given month (calendar month of the period being paid)
  // SS for month M is paid in month M+1
  const payYear  = month === 12 ? year + 1 : year
  const payMonth = month === 12 ? 1 : month + 1

  return (
    <DialogPrimitive.Root open={open} onOpenChange={setOpen}>
      <DialogPrimitive.Trigger asChild>
        <IconButton
          variant="ghost"
          size="sm"
          aria-label="Ver fechas de pago de seguridad social"
          className="ml-1 opacity-50 hover:opacity-100"
        >
          <Info size={12} />
        </IconButton>
      </DialogPrimitive.Trigger>

      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0" />
        <DialogPrimitive.Content className="fixed left-1/2 top-1/2 z-50 -translate-x-1/2 -translate-y-1/2 w-full max-w-sm max-h-[85vh] overflow-y-auto rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg data-[state=open]:animate-in data-[state=closed]:animate-out data-[state=closed]:fade-out-0 data-[state=open]:fade-in-0 data-[state=closed]:zoom-out-95 data-[state=open]:zoom-in-95 data-[state=closed]:slide-out-to-left-1/2 data-[state=closed]:slide-out-to-top-[48%] data-[state=open]:slide-in-from-left-1/2 data-[state=open]:slide-in-from-top-[48%]">

          {/* Header */}
          <div className="flex items-start justify-between gap-3 px-5 pt-5 pb-3">
            <div>
              <h2 className="ts-heading-group">Fechas de pago — Seguridad Social</h2>
              <p className="ts-body-small text-muted-foreground mt-0.5">
                SS de {MONTH_LONG[(month - 1)]} se paga en {MONTH_LONG[(payMonth - 1)]} {payYear}
              </p>
            </div>
            <DialogPrimitive.Close className="rounded-lg text-muted-foreground hover:text-foreground transition-colors mt-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <X size={16} />
            </DialogPrimitive.Close>
          </div>

          {/* Table */}
          <div className="px-5 pb-2">
            <p className="ts-detail-large text-muted-foreground mb-2">
              El plazo depende de los <span className="ts-body-base-emphasis text-foreground">últimos 2 dígitos</span> de tu cédula o NIT.
            </p>
            <div className="rounded-xl border border-[var(--border)] overflow-hidden">
              <div className="grid grid-cols-3 bg-muted px-3 py-1.5 ts-label-micro uppercase text-muted-foreground">
                <span>Dígitos</span>
                <span className="text-center">Día hábil</span>
                <span className="text-right">Aprox. {MONTH_SHORT[payMonth - 1]}</span>
              </div>
              {SS_SCHEDULE.map(({ digits, bizDay }) => {
                const d = nthBusinessDay(payYear, payMonth, bizDay)
                return (
                  <div
                    key={digits}
                    className="grid grid-cols-3 px-3 py-1.5 border-t border-[var(--border)] tabular-nums"
                  >
                    <span className="ts-amount-small text-foreground">{digits}</span>
                    <span className="text-center text-muted-foreground">{bizDay}°</span>
                    <span className="text-right text-muted-foreground">{fmtBizDate(d)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-5 py-4">
            <p className="ts-detail-large text-muted-foreground/70">
              Las fechas son aproximadas — excluyen festivos colombianos. Consulta el calendario oficial en miplanilla.com para las fechas exactas.
            </p>
            <a
              href="https://empresas.miplanilla.com/PublicoEmpresas/Publico/FechasPago"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 ts-label-base text-[var(--primary)] hover:underline"
            >
              Ver calendario oficial
              <ExternalLink size={10} />
            </a>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}

// ─── Sub-components ───────────────────────────────────────────────────────────

interface ItemRowProps {
  label: string
  amount: number
  badge: string
  trm: number
  showUSD: boolean
  dim?: boolean
  noBorder?: boolean
}

function ItemRow({ label, amount, badge, trm, showUSD, dim, noBorder }: ItemRowProps) {
  return (
    <div className={cn(
      'flex items-center gap-2 py-[9px] border-b border-[var(--border)] last:border-0',
      dim && 'opacity-35',
      noBorder && 'border-b-0',
    )}>
      <span className="flex-1 min-w-0 ts-body-base text-foreground">{label}</span>
      <span className="ts-amount-micro text-muted-foreground shrink-0">{badge}</span>
      <div className="w-[104px] shrink-0 flex flex-col items-end">
        <span className="ts-amount-base">{COP(amount)}</span>
        {showUSD && trm > 0 && (
          <span className="ts-amount-micro text-muted-foreground">{USD(amount / trm)}</span>
        )}
      </div>
    </div>
  )
}

const FSS_BRACKETS = [
  { range: '4 y 16 SMMLV',    pct: '1%'   },
  { range: '16 y 17 SMMLV',   pct: '1.2%' },
  { range: '17 y 18 SMMLV',   pct: '1.4%' },
  { range: '18 y 19 SMMLV',   pct: '1.6%' },
  { range: '19 y 20 SMMLV',   pct: '1.8%' },
  { range: 'Más de 20 SMMLV', pct: '2%'   },
]

function FSSRow({ amount, pct, trm, showUSD }: { amount: number; pct: number; trm: number; showUSD: boolean }) {
  return (
    <div className="pt-0 pb-2 border-b border-[var(--border)] last:border-0">
      <div className="rounded-xl px-2 py-1 flex items-center gap-1.5" style={{ background: 'color-mix(in oklab, var(--muted-foreground) 8%, var(--muted))' }}>
        <span className="ts-body-small-emphasis text-muted-foreground">FSS</span>
        <span className="ts-detail-base text-muted-foreground">·</span>
        <span className="ts-detail-base text-muted-foreground">Fondo de Solidaridad</span>
        <Popover>
          <PopoverTrigger asChild>
            <button
              type="button"
              className="p-0.5 rounded text-muted-foreground/40 hover:text-muted-foreground transition-colors shrink-0"
              aria-label="Ver tabla Fondo de Solidaridad y Subsistencia"
            >
              <Info size={10} />
            </button>
          </PopoverTrigger>
          <PopoverContent side="left" align="start" className="w-64 p-0">
            <div className="px-3 pt-3 pb-2">
              <p className="ts-label-base">Fondo de Solidaridad y Subsistencia</p>
              <p className="text-muted-foreground ts-detail-base mt-0.5">
                Ley 100 de 1993, art. 25. Aplica cuando el IBC supera 4 SMMLV.
              </p>
            </div>
            <div className="border-t border-[var(--border)]">
              <div className="grid grid-cols-2 px-3 py-1.5 ts-label-micro uppercase text-muted-foreground bg-muted">
                <span>IBC entre</span>
                <span className="text-right">Aporte</span>
              </div>
              {FSS_BRACKETS.map(b => (
                <div key={b.range} className="grid grid-cols-2 px-3 py-1.5 border-t border-[var(--border)]">
                  <span className="text-muted-foreground">{b.range}</span>
                  <span className="ts-amount-small text-right">{b.pct}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <span className="ts-amount-micro text-muted-foreground shrink-0">{pct}%</span>
        <div className="flex-1 flex flex-col items-end">
          <span className="ts-amount-small text-muted-foreground">{COP(amount)}</span>
          {showUSD && trm > 0 && (
            <span className="ts-amount-micro text-muted-foreground/60">{USD(amount / trm)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function GroupBox({ label, children, action, badge, trmNote, ibcRow }: { label: string; children: React.ReactNode; action?: React.ReactNode; badge?: React.ReactNode; trmNote?: string; ibcRow?: React.ReactNode }) {
  return (
    <div className="rounded-xl bg-muted overflow-hidden">
      <div className="px-3 pt-2 pb-0.5 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="ts-label-micro uppercase text-muted-foreground/70">{label}</span>
          {action}
          {badge}
        </div>
        {trmNote && (
          <span className="ml-auto ts-amount-micro text-muted-foreground/50">{trmNote}</span>
        )}
      </div>
      {ibcRow && (
        <div className="px-3 pt-2 pb-[13px] border-b border-[var(--border)]">
          {ibcRow}
        </div>
      )}
      <div className="px-3">
        {children}
      </div>
    </div>
  )
}

/**
 * The action that settles an obligation lives here, not in the ordinary "add expense"
 * flow: it happens once a month, and the card is the only place that knows what is
 * owed and for which period. It hands the sheet the fields it can fill (description,
 * category, currency, the period) and leaves the amount, date and paying account to
 * the user — the accrual is a reference, since the PILA rounds.
 */

/**
 * The settling movement for a period, wherever month it was filed in — a payment for July
 * lives in August. Returns the most recent one when a period was paid more than once.
 */
function findSettlement(db: FinanceDB, kind: 'ss' | 'retencion', period: string):
  { id: number; monthKey: string } | null {
  let found: { id: number; monthKey: string } | null = null
  for (const key of Object.keys(db).filter(k => k !== '_settings').sort()) {
    const month = db[key] as MonthData | undefined
    for (const e of month?.egresos || []) {
      if (e.settles?.kind === kind && e.settles.period === period) found = { id: e.id, monthKey: key }
    }
  }
  return found
}

/**
 * SS accrued in earlier months and still unpaid.
 *
 * It is a ROW, not a chip. The whole action-chip family means "narrow this list" — a chip
 * selects, it does not act — and this carries money and an action.
 *
 * When there are several they stack inside ONE bordered block with a heading, oldest
 * first. Three loose strips read as three alerts; one block with three rows reads as a
 * debt in three parts, which is what it is.
 *
 * Why it exists at all: the payment action sits on the month you are looking at, but SS
 * is paid in arrears, so paying July from August would otherwise mean navigating back a
 * month. This is what makes "mes vencido" workable without the user holding it in memory.
 */
function OverdueBlock({ pending, trm, showUSD }: {
  pending: PendingObligation[]; trm: number; showUSD: boolean
}) {
  const openSettlement = useUIStore(s => s.openSettlement)
  if (pending.length === 0) return null

  return (
    <div className="rounded-xl border border-[var(--border-brand-alpha-50)] bg-[var(--color-tax-bg)] overflow-hidden">
      <div className="px-3 pt-2 pb-0.5 flex items-center gap-1.5">
        <Clock size={12} className="text-[var(--color-tax-txt)] shrink-0" />
        <span className="ts-label-micro uppercase text-[var(--color-tax-txt)]">
          {pending.length === 1 ? 'Pago pendiente' : `${pending.length} pagos pendientes`}
        </span>
      </div>
      <div className="px-3">
        {pending.map(p => {
          const [py, pm] = p.period.split('-').map(Number)
          const label = `Seguridad social · ${MONTH_LONG[pm - 1]} ${py}`
          return (
            <div
              key={p.period}
              className="flex items-center gap-2 py-2 border-b border-[var(--border)] last:border-0"
            >
              <div className="flex-1 min-w-0">
                <div className="ts-body-base text-foreground truncate">{MONTH_LONG[pm - 1]} {py}</div>
                {/* Present tense on purpose. The block lists the month that is due NOW
                    alongside ones that were missed, and a past tense would tell the
                    first of those it is late when it is merely payable. */}
                <div className="ts-body-small text-muted-foreground">
                  Se paga en {MONTH_LONG[Number(p.dueKey.split('-')[1]) - 1]}
                </div>
              </div>
              <div className="w-[104px] shrink-0 flex flex-col items-end">
                <span className="ts-amount-base">{COP(p.pending)}</span>
                {showUSD && trm > 0 && (
                  <span className="ts-amount-micro text-muted-foreground">{USD(p.pending / trm)}</span>
                )}
              </div>
              <Button
                size="sm"
                variant="outline"
                className="shrink-0"
                onClick={() => openSettlement({
                  desc: label, category: 'impuestos', currency: 'COP',
                  settles: { kind: 'ss', period: p.period },
                  accrued: p.pending,
                  fullAccrued: p.accrued,
                  suggestedIbc: p.ibc,
                })}
              >
                Pagar
              </Button>
            </div>
          )
        })}
      </div>
    </div>
  )
}

/** A payment almost never equals the accrual to the peso — the PILA rounds. */
export function isOutstanding(accrued: number, paid: number): boolean {
  return accrued - paid > 1000
}

/**
 * The obligation's settlement state, on the GROUP.
 *
 * `Pagado` is NEUTRAL, not success. `badge/success/*` resolves to the same green as
 * `fg/provision`, so a green badge sitting beside money reads as an amount set aside
 * rather than as a state. That green is already spent on one meaning in this app.
 */
/**
 * A payment, as a row.
 *
 * The month showed only a "Pagado" badge, so a payment that had been recorded was a state
 * with no object: nothing to look at, correct or remove without leaving for the account
 * ledger — and only if an account had been chosen, which is optional. A row is the shape
 * the rest of the app uses for a movement, and it opens the payment's own sheet.
 *
 * It reads in the provision green with a check: this is the one row in the card that says
 * something is DONE, and every other figure around it is something still owed.
 */
function PaymentRow({ payment, period, suggestedIbc, suggestedSS }: {
  payment: SettlementRecord
  period: string
  suggestedIbc: number
  suggestedSS: number
}) {
  const openSSPayment = useUIStore(s => s.openSSPayment)
  return (
    <button
      type="button"
      onClick={() => openSSPayment({
        period, suggestedIbc, suggestedSS,
        editing: { id: payment.id, monthKey: payment.monthKey },
      })}
      className="w-full text-left flex items-center gap-2 py-2 border-t border-[var(--border)] rounded-lg px-1 hover:bg-muted/50 transition-colors"
    >
      <div className="w-8 h-8 rounded-full bg-[var(--color-provision-bg)] flex items-center justify-center shrink-0">
        <Check size={16} className="text-[var(--color-provision)]" />
      </div>
      <div className="flex-1 min-w-0">
        <div className="ts-body-base-emphasis text-[var(--color-provision)]">SS pagada</div>
        <div className="ts-body-small text-muted-foreground truncate">
          {fmtDate(payment.date)}
          {payment.account && ` · ${payment.account}`}
          {payment.ibc != null && ` · IBC ${COP(payment.ibc)}`}
        </div>
      </div>
      <span className="ts-amount-base shrink-0 text-[var(--color-provision)]">{COP(payment.amount)}</span>
    </button>
  )
}

function StateBadge({ accrued, paid, onOpen }: {
  accrued: number; paid: number; onOpen?: () => void
}) {
  if (accrued <= 0) return null
  if (isOutstanding(accrued, paid)) return <Badge tone="warning">Pendiente</Badge>

  // Paid is a way IN, not just a label. Until now a settled payment was reachable only
  // through the account ledger, and only if an account had been chosen — which is
  // optional, so a payment recorded without one existed nowhere the user could see it.
  return onOpen
    ? (
      <button type="button" onClick={onOpen} className="rounded-full focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)]">
        <Badge tone="neutral">Pagado · ver</Badge>
      </button>
    )
    : <Badge tone="neutral">Pagado</Badge>
}

function SettleRow({ label, settles, accrued, paid, suggestedIbc }: {
  label: string; settles: Settles; accrued: number; paid: number; suggestedIbc?: number
}) {
  const openSettlement = useUIStore(s => s.openSettlement)
  // Settled groups show no row at all: the header's badge already says so, and a row
  // whose only content is "Al día" is a line of furniture.
  if (!isOutstanding(accrued, paid)) return null

  return (
    <div className="flex items-center gap-2 py-2 border-t border-[var(--border)]">
      <Button
        size="sm"
        variant="outline"
        className="w-full"
        onClick={() => openSettlement({
          desc: label, category: 'impuestos', currency: 'COP', settles,
          accrued: accrued - paid,
          fullAccrued: accrued,
          suggestedIbc: settles.kind === 'ss' ? suggestedIbc : undefined,
        })}
      >
        Registrar pago
      </Button>
    </div>
  )
}

// ─── Main card ────────────────────────────────────────────────────────────────

export function ObligacionesCard() {
  const { getCurrentMonth, getSMMLV, curKey, db, setCurKey } = useFinanceStore()
  const { openSheet, setEditingEgreso, openSSPayment } = useUIStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { trm: liveTRM } = useLiveTRM()
  const month = getCurrentMonth()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc  = calcIBC(month.incomes, month.trm, smmlv)
  const gast = calcGastos(month.egresos || [], month.trm, localToday())
  const provBase = calcProvisionBase(month.incomes, month.trm)
  const res  = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase, smmlv)

  const ibcIsMin   = ibc <= smmlv * 1.001
  const showUSD    = totUSD > 0
  const retefuente = res.provItems.filter(i => i.id === 'retencion' && i.applies)
  // The DIAN is paid once a year, so what's owed is the year's accrual — not this
  // month's slice, which is only the row above it.
  const retencionYearAccrued = retencionReserve(db, y, deductions, getSMMLV).accrued
  // Earlier months, oldest first — a skipped month has to surface ABOVE the recent one.
  const overdue = pendingSS(db, deductions, getSMMLV, curKey).filter(p => p.period !== curKey)
  /**
   * Open the payment that settled a period, in the month it was filed in — which is not
   * the month being looked at. Moving there first is what makes the edit sheet find it.
   */
  function openPayment(kind: 'ss' | 'retencion', period: string) {
    const hit = findSettlement(db, kind, period)
    if (!hit) return
    if (hit.monthKey !== curKey) setCurKey(hit.monthKey)
    setEditingEgreso(hit.id)
    openSheet('egreso')
  }

  const ssPaid        = settledFor(db, 'ss', curKey)
  const ssPayments    = settlementsFor(db, 'ss', curKey)
  const retencionPaid = settledFor(db, 'retencion', String(y))
  const totalOblig = res.ssTotal + retefuente.reduce((a, i) => a + i.amount, 0)

  // For USD transfer amounts: prefer live TRM (actionable), fall back to month TRM (accounting)
  const transferTRM  = liveTRM ?? month.trm
  const trmNote      = liveTRM
    ? `TRM hoy · ${liveTRM.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
    : undefined

  // bruto === 0 but IBC is always at least SMMLV by law — still show SS obligations

  const totalAction = (
    <div className="text-right">
      <div className="ts-amount-large text-[var(--color-tax-txt)]">
        {COP(totalOblig)}
      </div>
      {showUSD && (
        <div className="ts-amount-micro text-muted-foreground">{USD(totalOblig / month.trm)}</div>
      )}
    </div>
  )

  return (
    <SectionCard icon={Landmark} title="Obligaciones tributarias" action={totalAction}>

      <div className="space-y-2">

        {/* Overdue first: the debt you can act on today, above the month's own accrual. */}
        <OverdueBlock pending={overdue} trm={transferTRM} showUSD={showUSD} />

        {/* SS group */}
        {res.ssItems.length > 0 && (
          <GroupBox
            label="Seguridad Social"
            action={<SSScheduleDialog year={y} month={m} />}
            badge={<StateBadge accrued={res.ssTotal} paid={ssPaid} onOpen={() => openPayment('ss', curKey)} />}
            trmNote={showUSD ? trmNote : undefined}
            ibcRow={
              <div className="border border-[var(--border)] rounded-xl px-2 py-1 flex items-center gap-1.5">
                <span className="ts-body-small-emphasis text-muted-foreground">IBC</span>
                <span className="ts-detail-base text-muted-foreground">·</span>
                <span className="ts-detail-base text-muted-foreground">
                  {ibcIsMin ? 'mínimo SMMLV' : '40% servicios'}
                </span>
                <span className="flex-1 text-right ts-amount-small text-muted-foreground">
                  {COP(ibc)}
                </span>
              </div>
            }
          >
            {res.ssItems.map((item, idx) => (
              item.id === 'fss'
                ? <FSSRow key="fss" amount={item.amount} pct={item.pct} trm={transferTRM} showUSD={showUSD} />
                : <ItemRow
                    key={item.id}
                    label={item.label}
                    amount={item.amount}
                    badge={`${item.pct}%`}
                    trm={transferTRM}
                    showUSD={showUSD}
                    noBorder={res.ssItems[idx + 1]?.id === 'fss'}
                  />
            ))}
            <div className="flex items-center gap-2 py-[9px]">
              <span className="flex-1 min-w-0 ts-body-small-emphasis text-foreground">Total SS</span>
              <div className="w-[104px] shrink-0 flex flex-col items-end">
                <span className="ts-amount-base">{COP(res.ssTotal)}</span>
                {showUSD && transferTRM > 0 && (
                  <span className="ts-amount-micro text-muted-foreground">{USD(res.ssTotal / transferTRM)}</span>
                )}
              </div>
            </div>
            {ssPayments.map(pay => (
              <PaymentRow
                key={pay.id}
                payment={pay}
                period={curKey}
                suggestedIbc={ibc}
                suggestedSS={res.ssTotal}
              />
            ))}
            {isOutstanding(res.ssTotal, ssPaid) && (
              <div className="flex items-center gap-2 py-2 border-t border-[var(--border)]">
                <Button
                  size="sm"
                  variant="outline"
                  className="w-full"
                  onClick={() => openSSPayment({
                    period: curKey, suggestedIbc: ibc, suggestedSS: res.ssTotal,
                  })}
                >
                  {ssPaid > 0 ? 'Registrar otro pago' : 'Registrar pago'}
                </Button>
              </div>
            )}
          </GroupBox>
        )}

        {/* Retención group */}
        {retefuente.length > 0 && (
          <GroupBox
            label="Retenciones"
            badge={<StateBadge accrued={retencionYearAccrued} paid={retencionPaid} onOpen={() => openPayment('retencion', String(y))} />}
            trmNote={showUSD ? trmNote : undefined}
          >
            {retefuente.map(item => (
              <ItemRow
                key={item.id}
                label={item.label}
                amount={item.amount}
                badge={`${item.pct}%`}
                trm={transferTRM}
                showUSD={showUSD}
              />
            ))}
            {/* Retención is paid to the DIAN once a year, so the period is the year —
                not this month. The reserve that funds it lives in Ahorros. */}
            <SettleRow
              label={`Retención en la fuente · ${y}`}
              settles={{ kind: 'retencion', period: String(y) }}
              accrued={retencionYearAccrued}
              paid={retencionPaid}
            />
          </GroupBox>
        )}
      </div>

    </SectionCard>
  )
}
