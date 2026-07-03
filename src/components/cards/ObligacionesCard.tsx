import { useState } from 'react'
import { Landmark, Info, ExternalLink, X } from 'lucide-react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD, localToday } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SectionCard } from '@/components/ui/SectionCard'
import { IconButton } from '@/components/ui/icon-button'

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

  const MONTH_LONG = ['Enero','Febrero','Marzo','Abril','Mayo','Junio',
                       'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre']

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
              <h2 className="text-sm font-semibold">Fechas de pago — Seguridad Social</h2>
              <p className="text-xs text-muted-foreground mt-0.5">
                SS de {MONTH_LONG[(month - 1)]} se paga en {MONTH_LONG[(payMonth - 1)]} {payYear}
              </p>
            </div>
            <DialogPrimitive.Close className="rounded-sm text-muted-foreground hover:text-foreground transition-colors mt-0.5 focus-visible:outline-none focus-visible:ring-1 focus-visible:ring-ring">
              <X size={16} />
            </DialogPrimitive.Close>
          </div>

          {/* Table */}
          <div className="px-5 pb-2">
            <p className="text-[11px] text-muted-foreground mb-2">
              El plazo depende de los <span className="font-medium text-foreground">últimos 2 dígitos</span> de tu cédula o NIT.
            </p>
            <div className="rounded-lg border border-[var(--border)] overflow-hidden text-xs">
              <div className="grid grid-cols-3 bg-muted px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground">
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
                    <span className="font-mono text-foreground">{digits}</span>
                    <span className="text-center text-muted-foreground">{bizDay}°</span>
                    <span className="text-right text-muted-foreground">{fmtBizDate(d)}</span>
                  </div>
                )
              })}
            </div>
          </div>

          {/* Footer note */}
          <div className="px-5 py-4">
            <p className="text-[11px] text-muted-foreground/70">
              Las fechas son aproximadas — excluyen festivos colombianos. Consulta el calendario oficial en miplanilla.com para las fechas exactas.
            </p>
            <a
              href="https://empresas.miplanilla.com/PublicoEmpresas/Publico/FechasPago"
              target="_blank"
              rel="noopener noreferrer"
              className="mt-2 inline-flex items-center gap-1 text-[11px] font-medium text-[var(--primary)] hover:underline"
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
      <span className="flex-1 min-w-0 text-sm text-foreground">{label}</span>
      <span className="text-[10px] text-muted-foreground tabular-nums font-mono shrink-0">{badge}</span>
      <div className="w-[104px] shrink-0 flex flex-col items-end">
        <span className="text-sm font-semibold tabular-nums font-mono">{COP(amount)}</span>
        {showUSD && trm > 0 && (
          <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{USD(amount / trm)}</span>
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
      <div className="rounded-lg px-2 py-1 flex items-center gap-1.5" style={{ background: 'color-mix(in oklab, var(--muted-foreground) 8%, var(--muted))' }}>
        <span className="text-xs font-medium text-muted-foreground">FSS</span>
        <span className="text-[10px] text-muted-foreground">·</span>
        <span className="text-[10px] text-muted-foreground">Fondo de Solidaridad</span>
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
          <PopoverContent side="left" align="start" className="w-64 p-0 text-xs">
            <div className="px-3 pt-3 pb-2">
              <p className="font-semibold text-[11px]">Fondo de Solidaridad y Subsistencia</p>
              <p className="text-muted-foreground text-[10px] mt-0.5 leading-relaxed">
                Ley 100 de 1993, art. 25. Aplica cuando el IBC supera 4 SMMLV.
              </p>
            </div>
            <div className="border-t border-[var(--border)]">
              <div className="grid grid-cols-2 px-3 py-1.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground bg-muted">
                <span>IBC entre</span>
                <span className="text-right">Aporte</span>
              </div>
              {FSS_BRACKETS.map(b => (
                <div key={b.range} className="grid grid-cols-2 px-3 py-1.5 border-t border-[var(--border)]">
                  <span className="text-muted-foreground">{b.range}</span>
                  <span className="text-right font-mono">{b.pct}</span>
                </div>
              ))}
            </div>
          </PopoverContent>
        </Popover>
        <span className="text-[10px] text-muted-foreground tabular-nums font-mono shrink-0">{pct}%</span>
        <div className="flex-1 flex flex-col items-end">
          <span className="text-xs font-semibold tabular-nums font-mono text-muted-foreground">{COP(amount)}</span>
          {showUSD && trm > 0 && (
            <span className="text-[10px] tabular-nums font-mono text-muted-foreground/60">{USD(amount / trm)}</span>
          )}
        </div>
      </div>
    </div>
  )
}

function GroupBox({ label, children, action, trmNote, ibcRow }: { label: string; children: React.ReactNode; action?: React.ReactNode; trmNote?: string; ibcRow?: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted overflow-hidden">
      <div className="px-3 pt-2 pb-0.5 flex items-center gap-4">
        <div className="flex items-center gap-1">
          <span className="text-[10px] font-semibold uppercase tracking-[1px] text-muted-foreground/70">{label}</span>
          {action}
        </div>
        {trmNote && (
          <span className="ml-auto text-[10px] tabular-nums text-muted-foreground/50">{trmNote}</span>
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

// ─── Main card ────────────────────────────────────────────────────────────────

export function ObligacionesCard() {
  const { getCurrentMonth, getSMMLV, curKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { trm: liveTRM } = useLiveTRM()
  const month = getCurrentMonth()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc  = calcIBC(month.incomes, month.trm, smmlv)
  const gast = calcGastos(month.egresos || [], month.trm, localToday())
  const provBase = calcProvisionBase(month.incomes, month.trm, ibc)
  const res  = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase, smmlv)

  const ibcIsMin   = ibc <= smmlv * 1.001
  const showUSD    = totUSD > 0
  const retefuente = res.provItems.filter(i => i.id === 'retencion' && i.applies)
  const totalOblig = res.ssTotal + retefuente.reduce((a, i) => a + i.amount, 0)

  // For USD transfer amounts: prefer live TRM (actionable), fall back to month TRM (accounting)
  const transferTRM  = liveTRM ?? month.trm
  const trmNote      = liveTRM
    ? `TRM hoy · ${liveTRM.toLocaleString('es-CO', { maximumFractionDigits: 0 })}`
    : undefined

  // bruto === 0 but IBC is always at least SMMLV by law — still show SS obligations

  const totalAction = (
    <div className="text-right">
      <div className="text-base font-bold font-heading tabular-nums text-[var(--color-tax-txt)]">
        {COP(totalOblig)}
      </div>
      {showUSD && (
        <div className="text-[10px] text-muted-foreground tabular-nums">{USD(totalOblig / month.trm)}</div>
      )}
    </div>
  )

  return (
    <SectionCard icon={Landmark} title="Obligaciones tributarias" action={totalAction}>

      <div className="space-y-2">
        {/* SS group */}
        {res.ssItems.length > 0 && (
          <GroupBox
            label="Seguridad Social"
            action={<SSScheduleDialog year={y} month={m} />}
            trmNote={showUSD ? trmNote : undefined}
            ibcRow={
              <div className="border border-[var(--border)] rounded-lg px-2 py-1 flex items-center gap-1.5">
                <span className="text-xs font-medium text-muted-foreground">IBC</span>
                <span className="text-[10px] text-muted-foreground">·</span>
                <span className="text-[10px] text-muted-foreground">
                  {ibcIsMin ? 'mínimo SMMLV' : '40% servicios'}
                </span>
                <span className="flex-1 text-right text-xs font-semibold font-mono tabular-nums text-muted-foreground">
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
              <span className="flex-1 min-w-0 text-xs font-semibold text-foreground">Total SS</span>
              <div className="w-[104px] shrink-0 flex flex-col items-end">
                <span className="text-sm font-bold tabular-nums font-mono">{COP(res.ssTotal)}</span>
                {showUSD && transferTRM > 0 && (
                  <span className="text-[10px] tabular-nums font-mono text-muted-foreground">{USD(res.ssTotal / transferTRM)}</span>
                )}
              </div>
            </div>
          </GroupBox>
        )}

        {/* Retención group */}
        {retefuente.length > 0 && (
          <GroupBox
            label="Retenciones"
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
          </GroupBox>
        )}
      </div>

    </SectionCard>
  )
}
