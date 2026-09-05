import { useState } from 'react'
import { Landmark, PiggyBank, ChevronDown } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD, fmtDate } from '@/lib/format'
import { MONTHS } from '@/data/defaults'
import { ssByMonth, retencionByYear } from '@/lib/obligationsYear'
import { settlementsFor } from '@/lib/obligations'
import { isOutstanding } from '@/components/cards/ObligacionesCard'
import { SectionCard } from '@/components/ui/SectionCard'
import { Badge } from '@/components/ui/Badge'
import { Progress } from '@/components/ui/Progress'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'
import { cn } from '@/lib/utils'

/**
 * The tax obligations, read down a year instead of across a month.
 *
 * The month view answers "what do I owe now". This answers "am I up to date", which is a
 * different question and cannot be read a month at a time — social security is paid in
 * arrears and retención accrues all year against a single payment, so following either one
 * means seeing the whole run.
 */
export function TributariasView() {
  const { db, getSMMLV, setCurKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { setView, openSSPayment } = useUIStore()

  const years = [...new Set(
    Object.keys(db).filter(k => k !== '_settings').map(k => k.slice(0, 4)),
  )].sort().reverse()
  const [year, setYear] = useState(years[0] ?? String(new Date().getFullYear()))
  const [expanded, setExpanded] = useState<string | null>(null)

  const ss  = ssByMonth(db, Number(year), deductions, getSMMLV)
  const ret = retencionByYear(db, Number(year), deductions, getSMMLV)

  const totalSuggested = ss.reduce((a, r) => a + (r.frozen ?? r.suggested), 0)
  const totalPaid      = ss.reduce((a, r) => a + r.paid, 0)

  function openMonth(period: string) {
    setCurKey(period)
    setView('mes')
  }

  /** Open one payment in its own sheet — the same one the month uses, so a payment is
   *  edited the same way wherever it is reached from. */
  function openPayment(row: { period: string; suggestedIbc: number; suggested: number },
                       monthKey: string, id: number) {
    openSSPayment({
      period: row.period,
      suggestedIbc: row.suggestedIbc,
      suggestedSS: row.suggested,
      editing: { id, monthKey },
    })
  }

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between gap-3">
        <h2 className="ts-heading-section">Obligaciones</h2>
        <Select value={year} onValueChange={setYear}>
          <SelectTrigger size="sm" aria-label="Año"><SelectValue /></SelectTrigger>
          <SelectContent>
            {years.map(y => <SelectItem key={y} value={y}>{y}</SelectItem>)}
          </SelectContent>
        </Select>
      </div>

      <SectionCard
        icon={Landmark}
        title="Seguridad social"
        action={
          <div className="text-right">
            <div className="ts-amount-large">{COP(totalPaid)}</div>
            <div className="ts-amount-micro text-muted-foreground">de {COP(totalSuggested)}</div>
          </div>
        }
      >
        {ss.length === 0 ? (
          <Empty className="border-0 py-2">
            <EmptyHeader>
              <EmptyMedia variant="icon"><Landmark size={14} /></EmptyMedia>
              <EmptyTitle>Sin obligaciones en {year}</EmptyTitle>
              <EmptyDescription>Registra ingresos por servicios y aparecerán aquí</EmptyDescription>
            </EmptyHeader>
          </Empty>
        ) : (
          <div>
            {ss.map(r => {
              const owed = r.frozen ?? r.suggested
              const open = r.due && isOutstanding(owed, r.paid)
              const monthName = MONTHS[Number(r.period.slice(5)) - 1]
              const payments = settlementsFor(db, 'ss', r.period)
              const isOpen = expanded === r.period
              return (
                <div key={r.period} className="border-b border-[var(--border)] last:border-0">
                  {/* The header discloses rather than navigating: the payments are the
                      answer to "what did I pay", and sending the user to the month first
                      made them hunt for it. The month is still one tap away, below. */}
                  <button
                    type="button"
                    aria-expanded={isOpen}
                    onClick={() => setExpanded(isOpen ? null : r.period)}
                    className="w-full text-left flex items-center gap-2 py-2 px-1 rounded-lg hover:bg-muted/50 transition-colors"
                  >
                    <ChevronDown
                      size={14}
                      aria-hidden
                      className={cn('shrink-0 text-muted-foreground transition-transform duration-fast',
                        isOpen && 'rotate-180', payments.length === 0 && 'opacity-0')}
                    />
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center gap-1.5 flex-wrap">
                        <span className="ts-body-base-emphasis">{monthName}</span>
                        {!r.due
                          ? <Badge tone="neutral">Aún no vence</Badge>
                          : open
                            ? <Badge tone="warning">Pendiente</Badge>
                            : <Badge tone="neutral">Pagado</Badge>}
                      </div>
                      {/* The base is shown only when the payment declared a different one:
                          saying "IBC $X" on every row would imply a choice was made where
                          the suggestion was simply accepted. */}
                      <div className="ts-body-small text-muted-foreground">
                        {r.paidIbc != null
                          ? `IBC facturado ${COP(r.paidIbc)}`
                          : `IBC sugerido ${COP(r.suggestedIbc)}`}
                        {payments.length > 1 && ` · ${payments.length} pagos`}
                      </div>
                    </div>
                    <div className="text-right shrink-0">
                      <div className="ts-amount-base">{COP(r.paid)}</div>
                      {owed !== r.paid && (
                        <div className="ts-amount-micro text-muted-foreground">
                          {open ? `faltan ${COP(owed - r.paid)}` : `causado ${COP(owed)}`}
                        </div>
                      )}
                    </div>
                  </button>

                  {isOpen && (
                    <div className="pl-6 pr-1 pb-2 space-y-1">
                      {payments.map(pay => (
                        <button
                          key={pay.id}
                          type="button"
                          onClick={() => openPayment(r, pay.monthKey, pay.id)}
                          className="w-full text-left flex items-baseline gap-2 py-1.5 rounded-lg hover:bg-muted/50 px-1 transition-colors"
                        >
                          <div className="flex-1 min-w-0">
                            <div className="ts-body-small truncate">{pay.desc}</div>
                            <div className="ts-body-small text-muted-foreground">
                              {fmtDate(pay.date)}
                              {pay.account && ` · ${pay.account}`}
                              {pay.ibc != null && ` · IBC ${COP(pay.ibc)}`}
                            </div>
                          </div>
                          <span className="ts-amount-small shrink-0">
                            {pay.currency === 'USD' ? USD(pay.rawAmount) : COP(pay.amount)}
                          </span>
                        </button>
                      ))}
                      <button
                        type="button"
                        onClick={() => openMonth(r.period)}
                        className="ts-body-small text-[var(--primary)] underline-offset-2 hover:underline px-1"
                      >
                        Ver {monthName} completo
                      </button>
                    </div>
                  )}
                </div>
              )
            })}
          </div>
        )}
      </SectionCard>

      <SectionCard
        icon={PiggyBank}
        title={`Retención ${year}`}
        action={<div className="ts-amount-large text-[var(--color-tax-txt)]">{COP(ret.gap)}</div>}
      >
        <div className="space-y-3">
          {/* Retención is not a monthly payment, so it gets a running total rather than a
              row per month with a state. What matters is whether the money is there when
              the DIAN asks once a year. */}
          <div className="flex items-baseline justify-between">
            <span className="ts-body-small text-muted-foreground">Causado en el año</span>
            <span className="ts-amount-small">{COP(ret.accrued)}</span>
          </div>
          <div className="flex items-baseline justify-between">
            <span className="ts-body-small text-muted-foreground">Reservado</span>
            <span className="ts-amount-small">{COP(ret.reserved)}</span>
          </div>
          {ret.settled > 0 && (
            <div className="flex items-baseline justify-between">
              <span className="ts-body-small text-muted-foreground">Pagado a la DIAN</span>
              <span className="ts-amount-small">{COP(ret.settled)}</span>
            </div>
          )}
          {ret.accrued > 0 && (
            <>
              <Progress
                value={ret.accrued > 0 ? ret.reserved / ret.accrued : 0}
                tone="provision"
                label={`${Math.round((ret.reserved / ret.accrued) * 100)}% de la retención del año reservado`}
              />
              <div className="ts-body-small text-muted-foreground">
                Faltante {COP(ret.gap)} · {Math.round((ret.reserved / ret.accrued) * 100)}% reservado
              </div>
            </>
          )}

          {ret.byMonth.length > 0 && (
            <div className="pt-1 border-t border-[var(--border)]">
              {ret.byMonth.map(m => (
                <div key={m.period} className="flex items-baseline justify-between py-1.5">
                  <span className="ts-body-small text-muted-foreground">
                    {MONTHS[Number(m.period.slice(5)) - 1]}
                  </span>
                  <span className="ts-amount-small">{COP(m.accrued)}</span>
                </div>
              ))}
            </div>
          )}
        </div>
      </SectionCard>
    </div>
  )
}
