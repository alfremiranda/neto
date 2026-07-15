import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { ShoppingBag } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { MONTHS, DEFAULTS, EGRESO_CATEGORIAS } from '@/data/defaults'
import { COP } from '@/lib/format'
import { useTheme } from '@/hooks/useTheme'
import { SectionCard } from '@/components/ui/SectionCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

interface EgresosTrendChartProps {
  year: number
}

const M = 1_000_000

interface MonthDatum {
  label: string
  monthKey: string
  total: number
  [catId: string]: number | string
}

interface Tooltip {
  x: number
  y: number
  label: string
  total: number
  cats: { label: string; amount: number; color: string }[]
}

function getCSSVar(v: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
}

export function EgresosTrendChart({ year }: EgresosTrendChartProps) {
  const { db, curKey, setCurKey } = useFinanceStore()
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  const data = useMemo<MonthDatum[]>(() =>
    MONTHS.map((name, idx) => {
      const m    = idx + 1
      const key  = `${year}-${String(m).padStart(2, '0')}`
      const d    = db[key]
      const egresos  = d?.egresos  || []
      const trm      = d?.trm || DEFAULTS.trm

      const datum: MonthDatum = { label: name.slice(0, 3), monthKey: key, total: 0 }
      EGRESO_CATEGORIAS.forEach(cat => {
        const sum = egresos
          .filter(e => (e.category || 'otro') === cat.id)
          .reduce((a, e) => a + (e.currency === 'USD' ? e.amount * trm : e.amount), 0)
        datum[cat.id] = sum / M
        datum.total  += sum
      })
      datum.total /= M
      return datum
    }),
  [db, year])

  const hasData = data.some(d => d.total > 0)

  // Only include categories that have at least one month with a value
  const activeCats = EGRESO_CATEGORIAS.filter(cat =>
    data.some(d => (d[cat.id] as number) > 0)
  )

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(e => setContainerW(e[0].contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !hasData) return

    const W  = containerRef.current.clientWidth
    const H  = 220
    const mg = { top: 8, right: 12, bottom: 56, left: 46 }
    const w  = W - mg.left - mg.right
    const h  = H - mg.top - mg.bottom

    const tickColor  = getCSSVar('--muted-foreground')
    const gridColor  = dark ? 'oklch(1 0 0 / 8%)' : 'oklch(0 0 0 / 5%)'
    const hlColor    = dark ? 'oklch(1 0 0 / 5%)' : 'oklch(0 0 0 / 3%)'

    const svg = d3.select(svgRef.current)
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`)

    const keys = activeCats.map(c => c.id)
    const stacked = d3.stack<MonthDatum>().keys(keys)(data)

    const maxVal = d3.max(data, d => d.total) ?? 1

    const xScale = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, w])
      .padding(0.28)

    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.15])
      .range([h, 0])
      .nice()

    // Grid lines
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(-w).ticks(4).tickFormat(() => ''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line')
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', '3,3'))

    // Y axis labels
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(v => `$${(v as number).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', tickColor).attr('font-size', '10.5px'))

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', gridColor))
      .call(ax => ax.selectAll('text').attr('fill', tickColor).attr('font-size', '10.5px').attr('dy', '1.2em'))

    // Current month highlight
    const curMonth = curKey.startsWith(`${year}-`)
      ? data.find(d => d.monthKey === curKey)
      : null
    if (curMonth) {
      g.append('rect')
        .attr('x', (xScale(curMonth.label) ?? 0) - 3)
        .attr('y', 0)
        .attr('width', xScale.bandwidth() + 6)
        .attr('height', h)
        .attr('fill', hlColor)
        .attr('rx', 4)
    }

    // Stacked layers
    const groups = g.selectAll<SVGGElement, d3.Series<MonthDatum, string>>('.layer')
      .data(stacked)
      .join('g')
      .attr('class', 'layer')
      .style('fill', (_, i) => `var(${activeCats[i].color})`)

    groups.selectAll<SVGRectElement, d3.SeriesPoint<MonthDatum>>('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => xScale(d.data.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('rx', 2)
      .attr('y', h)
      .attr('height', 0)
      .style('cursor', d => d.data.total > 0 ? 'pointer' : 'default')
      .on('mouseenter', function(event: MouseEvent, d) {
        if (d.data.total === 0) return
        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip({
          x:     event.clientX - rect.left,
          y:     event.clientY - rect.top,
          label: d.data.label,
          total: d.data.total * M,
          cats:  activeCats
            .map(cat => ({ label: cat.label, amount: (d.data[cat.id] as number) * M, color: cat.color }))
            .filter(c => c.amount > 0),
        })
        d3.select(this.parentElement).raise()
      })
      .on('mousemove', function(event: MouseEvent) {
        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip(t => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
      })
      .on('mouseleave', () => setTooltip(null))
      .on('click', (_: MouseEvent, d) => {
        if (d.data.total > 0) setCurKey(d.data.monthKey)
      })
      .transition().duration(420).ease(d3.easeCubicOut)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])))

    // Legend
    const legendG = svg.append('g').attr('transform', `translate(${mg.left},${H - 14})`)
    const itemW = w / activeCats.length

    activeCats.forEach((cat, i) => {
      const lg = legendG.append('g').attr('transform', `translate(${i * itemW},0)`)
      lg.append('rect')
        .attr('width', 8).attr('height', 8).attr('rx', 2)
        .style('fill', `var(${cat.color})`).attr('y', -4)
      lg.append('text')
        .attr('x', 12).attr('fill', tickColor)
        .attr('font-size', '10px').attr('dominant-baseline', 'middle')
        .text(cat.label)
    })
  }, [data, dark, curKey, containerW, activeCats, hasData, setCurKey, year])

  if (!hasData) {
    return (
      <SectionCard icon={ShoppingBag} title="Tendencia de gastos">
        <Empty className="border-0 py-4">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ShoppingBag size={14} /></EmptyMedia>
            <EmptyTitle>Sin gastos en {year}</EmptyTitle>
            <EmptyDescription>Registra gastos del mes para ver la tendencia anual</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SectionCard>
    )
  }

  return (
    <SectionCard icon={ShoppingBag} title="Tendencia de gastos">
      <div ref={containerRef} className="relative select-none">
        <svg ref={svgRef} className="w-full block" />
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-lg px-3 py-2.5 text-[11px] min-w-[160px]"
            style={{
              left: tooltip.x + 14,
              top:  tooltip.y - 100,
              transform: tooltip.x > (containerRef.current?.clientWidth ?? 400) * 0.6
                ? 'translateX(calc(-100% - 28px))'
                : 'none',
            }}
          >
            <div className="font-heading font-semibold text-[12px] text-[var(--popover-foreground)] mb-2">
              {tooltip.label} — {COP(tooltip.total)}
            </div>
            {tooltip.cats.map(c => (
              <div key={c.label} className="flex items-center gap-1.5 py-[1px]">
                <span className="w-2 h-2 rounded-[3px] shrink-0" style={{ background: `var(${c.color})` }} />
                <span className="text-[var(--muted-foreground)] flex-1">{c.label}</span>
                <span className="font-heading tabular-nums text-[var(--popover-foreground)] pl-3">{COP(c.amount)}</span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}
