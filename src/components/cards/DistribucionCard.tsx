import { useState } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import { useMonthData } from '@/hooks/useMonthData'
import { useSettingsStore } from '@/store/settingsStore'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP } from '@/lib/format'
import { cn } from '@/lib/utils'

interface Segment {
  id: string
  label: string
  color: string
  amount: number
  pct: number
}

export function DistribucionCard() {
  const { getSMMLV, curKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const [hovered, setHovered] = useState<string | null>(null)

  const month = useMonthData()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { bruto } = calcTotales(month.incomes, month.trm)
  const ibc  = calcIBC(month.incomes, month.trm, smmlv)
  const gast = calcGastos(month.egresos || [], month.trm)
  const provBase = calcProvisionBase(month.incomes, month.trm, ibc)
  const res  = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase)

  const retencionTotal = res.provItems.filter(i => i.id === 'retencion').reduce((a, i) => a + i.amount, 0)
  const otherProvItems = res.provItems.filter(i => i.id !== 'retencion')
  const provTotal      = otherProvItems.reduce((a, i) => a + i.amount, 0)
                       + res.volItems.reduce((a, i) => a + i.amount, 0)
  const obligTotal     = res.ssTotal + retencionTotal
  const netoLibre      = Math.max(res.netoLibre, 0)

  const provColor = otherProvItems.find(i => i.applies)?.color ?? '--color-provision'

  const raw: Omit<Segment, 'pct'>[] = [
    { id: 'oblig',   label: 'Obligaciones', color: '--color-tax', amount: obligTotal },
    { id: 'prov',    label: 'Provisiones',  color: provColor,   amount: provTotal  },
    { id: 'egresos', label: 'Egresos',      color: '--color-expense',  amount: gast       },
    { id: 'neto',    label: 'Neto libre',   color: '--color-net',  amount: netoLibre  },
  ]

  if (bruto === 0) return null

  const segments: Segment[] = raw
    .filter(s => s.amount > 0)
    .map(s => ({ ...s, pct: s.amount / bruto * 100 }))

  // Anything not accounted for (e.g. negative neto)
  const allocated = segments.reduce((a, s) => a + s.pct, 0)
  if (allocated < 99.5) {
    segments.push({ id: 'other', label: 'Otro', color: '--border', amount: bruto * (1 - allocated / 100), pct: 100 - allocated })
  }

  const hovSeg = hovered ? segments.find(s => s.id === hovered) : null

  return (
    <div className="mb-5">
      {/* Bar */}
      <div role="img" aria-label={`Distribución: ${segments.map(s => `${s.label} ${Math.round(s.pct)}%`).join(', ')}`} className="flex h-4 rounded-full overflow-hidden gap-px">
        {segments.map(seg => (
          <button
            key={seg.id}
            type="button"
            aria-label={`${seg.label}: ${Math.round(seg.pct)}% — ${COP(seg.amount)}`}
            className={cn(
              'transition-opacity duration-150 focus-visible:outline-none focus-visible:brightness-125',
              hovered && hovered !== seg.id ? 'opacity-40' : 'opacity-100',
            )}
            style={{ width: `${seg.pct}%`, background: `var(${seg.color})` }}
            onMouseEnter={() => setHovered(seg.id)}
            onMouseLeave={() => setHovered(null)}
            onFocus={() => setHovered(seg.id)}
            onBlur={() => setHovered(null)}
          />
        ))}
      </div>

      {/* Legend + active value */}
      <div className="mt-2.5 flex flex-wrap items-center justify-between gap-y-1.5">
        <div className="flex flex-wrap gap-x-4 gap-y-1.5">
          {segments.filter(s => s.id !== 'other').map(seg => (
            <button
              key={seg.id}
              type="button"
              aria-label={`${seg.label}: ${Math.round(seg.pct)}% del bruto — ${COP(seg.amount)}`}
              className={cn(
                'flex items-center gap-1.5 bg-transparent border-none p-0 cursor-default transition-opacity focus-visible:outline-none focus-visible:underline',
                hovered && hovered !== seg.id ? 'opacity-40' : 'opacity-100',
              )}
              onMouseEnter={() => setHovered(seg.id)}
              onMouseLeave={() => setHovered(null)}
              onFocus={() => setHovered(seg.id)}
              onBlur={() => setHovered(null)}
            >
              <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `var(${seg.color})` }} />
              <span className="text-xs text-muted-foreground">{seg.label}</span>
              <span className="text-xs font-mono font-semibold tabular-nums">
                {Math.round(seg.pct)}%
              </span>
            </button>
          ))}
        </div>

        {/* Hovered/focused segment detail */}
        <span aria-live="polite" aria-atomic="true" className="text-xs font-mono font-semibold tabular-nums text-foreground ml-auto min-h-[1em]">
          {hovSeg ? COP(hovSeg.amount) : ''}
        </span>
      </div>
    </div>
  )
}
