import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { ShoppingBag } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { MONTHS, DEFAULTS, EGRESO_CATEGORIAS } from '@/data/defaults'
import { settledEgresos } from '@/lib/calc'
import { COP } from '@/lib/format'
import { useTheme } from '@/hooks/useTheme'
import { SectionCard } from '@/components/ui/SectionCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

interface EgresosCategoryChartProps {
  year: number
}

interface CatAmount {
  id: string
  label: string
  color: string
  amount: number
}

interface Datum {
  label: string
  monthKey: string
  total: number
  hasData: boolean
  cats: CatAmount[]
}

interface Tooltip {
  x: number
  y: number
  datum: Datum
  avg: number
}

function getCSSVar(v: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
}

export function EgresosCategoryChart({ year }: EgresosCategoryChartProps) {
  const { db, curKey, setCurKey } = useFinanceStore()
  const { theme } = useTheme()
  const dark = theme === 'dark'

  const svgRef       = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)
  const [tooltip, setTooltip]       = useState<Tooltip | null>(null)

  const data = useMemo<Datum[]>(() =>
    MONTHS.map((name, idx) => {
      const m   = idx + 1
      const key = `${year}-${String(m).padStart(2, '0')}`
      const d   = db[key]
      const trm = d?.trm || DEFAULTS.trm
      const egresos = settledEgresos(d?.egresos)
      const total = egresos.reduce(
        (a, e) => a + (e.currency === 'USD' ? e.amount * trm : e.amount), 0
      )
      const cats: CatAmount[] = EGRESO_CATEGORIAS
        .map(cat => ({
          id: cat.id,
          label: cat.label,
          color: cat.color,
          amount: egresos
            .filter(e => (e.category || 'otro') === cat.id)
            .reduce((a, e) => a + (e.currency === 'USD' ? e.amount * trm : e.amount), 0),
        }))
        .filter(c => c.amount > 0)
        .sort((a, b) => b.amount - a.amount)
      return { label: name.slice(0, 3), monthKey: key, total, hasData: total > 0, cats }
    }),
  [db, year])

  const hasData = data.some(d => d.hasData)

  // Only render months that have egreso data
  const visibleData = useMemo(() => data.filter(d => d.hasData), [data])

  const avg = useMemo(() => {
    return visibleData.length > 0
      ? visibleData.reduce((a, d) => a + d.total, 0) / visibleData.length
      : 0
  }, [visibleData])

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
    const mg = { top: 8, right: 12, bottom: 40, left: 52 }
    const w  = W - mg.left - mg.right
    const h  = H - mg.top - mg.bottom

    const tickColor  = getCSSVar('--muted-foreground')
    const gridColor  = dark ? 'oklch(1 0 0 / 8%)' : 'oklch(0 0 0 / 5%)'
    const hlColor    = dark ? 'oklch(1 0 0 / 5%)' : 'oklch(0 0 0 / 3%)'
    const emptyColor = dark ? 'oklch(1 0 0 / 6%)' : 'oklch(0 0 0 / 4%)'
    const avgColor   = dark ? 'oklch(1 0 0 / 30%)' : 'oklch(0 0 0 / 25%)'

    const svg = d3.select(svgRef.current)
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`)

    const maxVal = d3.max(visibleData, d => d.total) ?? 1

    const xScale = d3.scaleBand<string>()
      .domain(visibleData.map(d => d.label))
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

    // Y axis — divide by 1M for readable labels
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(v => {
        const m = (v as number) / 1_000_000
        return `$${m.toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`
      }))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', tickColor).attr('font-size', '10.5px'))

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', gridColor))
      .call(ax => ax.selectAll('text').attr('fill', tickColor).attr('font-size', '10.5px').attr('dy', '1.2em'))

    // Current month highlight column
    const curDatum = visibleData.find(d => d.monthKey === curKey)
    if (curDatum) {
      g.append('rect')
        .attr('x', (xScale(curDatum.label) ?? 0) - 3)
        .attr('y', 0)
        .attr('width', xScale.bandwidth() + 6)
        .attr('height', h)
        .attr('fill', hlColor)
        .attr('rx', 4)
    }

    // Average line
    if (avg > 0) {
      const ay = yScale(avg)
      g.append('line')
        .attr('x1', 0).attr('x2', w)
        .attr('y1', ay).attr('y2', ay)
        .attr('stroke', avgColor)
        .attr('stroke-dasharray', '4,4')
        .attr('stroke-width', 1.5)
      g.append('text')
        .attr('x', 2).attr('y', ay - 4)
        .attr('font-size', '9px').attr('fill', tickColor).attr('opacity', 0.7)
        .text('promedio')
    }

    // Stacked bars by category
    visibleData.forEach(d => {
      const x = xScale(d.label) ?? 0
      const bw = xScale.bandwidth()

      if (!d.hasData) {
        g.append('rect')
          .attr('x', x).attr('width', bw).attr('rx', 3)
          .attr('y', h - 4).attr('height', 4)
          .attr('fill', emptyColor)
        return
      }

      let yOffset = 0
      d.cats.forEach((cat, i) => {
        const barH = Math.max(1, h - yScale(cat.amount) - (h - yScale(d.total - yOffset)))
        const catH = Math.max(1, yScale(yOffset) - yScale(yOffset + cat.amount))
        const catY = yScale(yOffset + cat.amount)
        const isFirst = i === 0
        const isLast  = i === d.cats.length - 1

        g.append('rect')
          .attr('x', x).attr('width', bw)
          .attr('y', catY).attr('height', Math.max(1, catH))
          .attr('fill', `var(${cat.color})`)
          // round top corners on topmost segment, bottom on last
          .attr('rx', isFirst || isLast ? 3 : 0)

        void barH
        yOffset += cat.amount
      })
    })

    // Invisible hover targets
    g.selectAll<SVGRectElement, Datum>('.hover-target')
      .data(visibleData)
      .join('rect')
      .attr('class', 'hover-target')
      .attr('x', d => xScale(d.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('y', 0).attr('height', h)
      .attr('fill', 'transparent')
      .style('cursor', d => d.hasData ? 'pointer' : 'default')
      .on('mouseenter', function(event: MouseEvent, d) {
        if (!d.hasData) return
        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip({ x: event.clientX - rect.left, y: event.clientY - rect.top, datum: d, avg })
      })
      .on('mousemove', function(event: MouseEvent) {
        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip(t => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
      })
      .on('mouseleave', () => setTooltip(null))
      .on('click', (_: MouseEvent, d) => { if (d.hasData) setCurKey(d.monthKey) })

  }, [visibleData, dark, curKey, containerW, hasData, avg, setCurKey, year])

  if (!hasData) {
    return (
      <SectionCard icon={ShoppingBag} title="Gastos mensuales">
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
    <SectionCard icon={ShoppingBag} title="Gastos mensuales">
      <div ref={containerRef} className="relative select-none">
        <svg ref={svgRef} className="w-full block" />
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-lg px-3 py-2.5 text-[11px] min-w-[180px]"
            style={{
              left: tooltip.x + 14,
              top:  tooltip.y - 100,
              transform: tooltip.x > (containerRef.current?.clientWidth ?? 400) * 0.6
                ? 'translateX(calc(-100% - 28px))'
                : 'none',
            }}
          >
            <div className="font-heading font-semibold text-[12px] mb-2">
              {tooltip.datum.label} — {COP(tooltip.datum.total)}
            </div>
            <div className="space-y-1">
              {tooltip.datum.cats.map(cat => (
                <div key={cat.id} className="flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full shrink-0" style={{ background: `var(${cat.color})` }} />
                  <span className="text-muted-foreground flex-1">{cat.label}</span>
                  <span className="font-mono tabular-nums">{COP(cat.amount)}</span>
                </div>
              ))}
            </div>
            <div className="text-muted-foreground mt-2 pt-2 border-t border-[var(--border)]">
              Promedio: {COP(tooltip.avg)}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
