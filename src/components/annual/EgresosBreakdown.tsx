import { useMemo } from 'react'
import { LayoutList } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { DEFAULTS, EGRESO_CATEGORIAS } from '@/data/defaults'
import { COP } from '@/lib/format'
import { SectionCard } from '@/components/ui/SectionCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

interface EgresosBreakdownProps {
  year: number
}

export function EgresosBreakdown({ year }: EgresosBreakdownProps) {
  const { db } = useFinanceStore()

  const categories = useMemo(() => {
    const totals: Record<string, number> = {}

    for (let m = 1; m <= 12; m++) {
      const key = `${year}-${String(m).padStart(2, '0')}`
      const d   = db[key]
      if (!d) continue
      const trm = d.trm || DEFAULTS.trm
      for (const e of d.egresos || []) {
        const cat = e.category || 'otro'
        const amt = e.currency === 'USD' ? e.amount * trm : e.amount
        totals[cat] = (totals[cat] ?? 0) + amt
      }
    }

    const total = Object.values(totals).reduce((a, v) => a + v, 0)
    if (total === 0) return []

    return EGRESO_CATEGORIAS
      .map(cat => ({
        id:      cat.id,
        label:   cat.label,
        color:   cat.color,
        bgColor: cat.bgColor,
        Icon:    cat.icon,
        total:   totals[cat.id] ?? 0,
        pct:     ((totals[cat.id] ?? 0) / total) * 100,
      }))
      .filter(c => c.total > 0)
      .sort((a, b) => b.total - a.total)
  }, [db, year])

  if (categories.length === 0) {
    return (
      <SectionCard icon={LayoutList} title="Egresos por categoría">
        <Empty className="border-0 py-4">
          <EmptyHeader>
            <EmptyMedia variant="icon"><LayoutList size={14} /></EmptyMedia>
            <EmptyTitle>Sin egresos en {year}</EmptyTitle>
            <EmptyDescription>Registra gastos del mes para ver el desglose por categoría</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SectionCard>
    )
  }

  const grandTotal = categories.reduce((a, c) => a + c.total, 0)
  const maxPct     = categories[0].pct

  return (
    <SectionCard
      icon={LayoutList}
      title="Egresos por categoría"
      action={
        <span className="text-sm font-semibold font-heading tabular-nums text-[var(--color-expense)]">
          {COP(grandTotal)}
        </span>
      }
    >
      <div className="space-y-3">
        {categories.map(cat => (
          <div key={cat.id} className="flex items-center gap-3">
            <div
              className="shrink-0 w-6 h-6 rounded-md flex items-center justify-center"
              style={{ background: `var(${cat.bgColor})`, color: `var(${cat.color})` }}
            >
              <cat.Icon size={12} strokeWidth={2.5} />
            </div>

            <span className="text-xs text-muted-foreground w-20 shrink-0 truncate">
              {cat.label}
            </span>

            <div className="flex-1 h-2 bg-muted rounded-full overflow-hidden">
              <div
                className="h-full rounded-full transition-all duration-500"
                style={{
                  width:      `${(cat.pct / maxPct) * 100}%`,
                  background: `var(${cat.color})`,
                }}
              />
            </div>

            <div className="shrink-0 text-right w-36">
              <span className="text-xs font-mono font-semibold tabular-nums">{COP(cat.total)}</span>
              <span className="text-[10px] text-muted-foreground ml-1.5">{Math.round(cat.pct)}%</span>
            </div>
          </div>
        ))}
      </div>
    </SectionCard>
  )
}
