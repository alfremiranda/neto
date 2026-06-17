import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { ShoppingBag } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { MONTHS, DEFAULTS } from '@/data/defaults'
import { COP } from '@/lib/format'
import { useTheme } from '@/hooks/useTheme'
import { SectionCard } from '@/components/ui/SectionCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

interface EgresosCategoryChartProps {
  year: number
}


interface Datum {
  label: string
  monthKey: string
  total: number
  hasData: boolean
}

interface Tooltip {
  x: number
  y: number
  label: string
  total: number
  delta: number | null
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
      const total = (d?.egresos || []).reduce(
        (a, e) => a + (e.currency === 'USD' ? e.amount * trm : e.amount), 0
      )
      return { label: name.slice(0, 3), monthKey: key, total, hasData: total > 0 }
    }),
  [db, year])

  const hasData = data.some(d => d.hasData)

  const avg = useMemo(() => {
    const filled = data.filter(d => d.hasData)
    return filled.length > 0 ? filled.reduce((a, d) => a + d.total, 0) / filled.length : 0
  }, [data])

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
    const mg = { top: 8, right: 12, bottom: 40, left: 46 }
    const w  = W - mg.left - mg.right
    const h  = H - mg.top - mg.bottom

    const tickColor  = getCSSVar('--muted-foreground')
    const gridColor  = dark ? 'oklch(1 0 0 / 8%)' : 'oklch(0 0 0 / 5%)'
    const hlColor    = dark ? 'oklch(1 0 0 / 5%)' : 'oklch(0 0 0 / 3%)'
    const barColor   = getCSSVar('--color-expense')
    const emptyColor = dark ? 'oklch(1 0 0 / 6%)' : 'oklch(0 0 0 / 4%)'
    const avgColor   = dark ? 'oklch(1 0 0 / 30%)' : 'oklch(0 0 0 / 25%)'

    const svg = d3.select(svgRef.current)
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`)

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

    // Y axis
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(
        v => `$${(v as number).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`
      ))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', tickColor).attr('font-size', '10.5px'))

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(xScale).tickSize(0))
      .call(ax => ax.select('.domain').attr('stroke', gridColor))
      .call(ax => ax.selectAll('text').attr('fill', tickColor).attr('font-size', '10.5px').attr('dy', '1.2em'))

    // Current month highlight column (same pattern as TrendChart)
    const curDatum = data.find(d => d.monthKey === curKey)
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

    // Bars — no transition to avoid replay bugs
    g.selectAll<SVGRectElement, Datum>('.bar')
      .data(data)
      .join('rect')
      .attr('class', 'bar')
      .attr('x', d => xScale(d.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('rx', 3)
      .attr('y', d => d.hasData ? yScale(d.total) : h - 4)
      .attr('height', d => d.hasData ? Math.max(1, h - yScale(d.total)) : 4)
      .attr('fill', d => d.hasData ? barColor : emptyColor)

    // Invisible hover targets (full column height) — avoids .raise() bug
    g.selectAll<SVGRectElement, Datum>('.hover-target')
      .data(data)
      .join('rect')
      .attr('class', 'hover-target')
      .attr('x', d => xScale(d.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('y', 0)
      .attr('height', h)
      .attr('fill', 'transparent')
      .style('cursor', d => d.hasData ? 'pointer' : 'default')
      .on('mouseenter', function(event: MouseEvent, d) {
        if (!d.hasData) return
        const rect = containerRef.current!.getBoundingClientRect()
        const idx  = data.indexOf(d)
        const prev = data.slice(0, idx).reverse().find(m => m.hasData)
        setTooltip({
          x: event.clientX - rect.left,
          y: event.clientY - rect.top,
          label: d.label,
          total: d.total,
          delta: prev ? d.total - prev.total : null,
        })
      })
      .on('mousemove', function(event: MouseEvent) {
        const rect = containerRef.current!.getBoundingClientRect()
        setTooltip(t => t ? { ...t, x: event.clientX - rect.left, y: event.clientY - rect.top } : null)
      })
      .on('mouseleave', () => setTooltip(null))
      .on('click', (_: MouseEvent, d) => { if (d.hasData) setCurKey(d.monthKey) })

  }, [data, dark, curKey, containerW, hasData, avg, setCurKey, year])

  if (!hasData) {
    return (
      <SectionCard icon={ShoppingBag} title="Egresos mensuales">
        <Empty className="border-0 py-4">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ShoppingBag size={14} /></EmptyMedia>
            <EmptyTitle>Sin egresos en {year}</EmptyTitle>
            <EmptyDescription>Registra gastos del mes para ver la tendencia anual</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SectionCard>
    )
  }

  const isCurYear = curKey.startsWith(`${year}-`)

  return (
    <SectionCard
      icon={ShoppingBag}
      title="Egresos mensuales"
      action={
        isCurYear ? (
          <span className="text-[11px] text-muted-foreground flex items-center gap-1.5">
            <span
              className="inline-block w-2.5 h-2.5 rounded-sm"
              style={{ background: `var(--color-provision)` }}
            />
            mes actual
          </span>
        ) : undefined
      }
    >
      <div ref={containerRef} className="relative select-none">
        <svg ref={svgRef} className="w-full block" />
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-lg px-3 py-2.5 text-[11px] min-w-[150px]"
            style={{
              left: tooltip.x + 14,
              top:  tooltip.y - 80,
              transform: tooltip.x > (containerRef.current?.clientWidth ?? 400) * 0.6
                ? 'translateX(calc(-100% - 28px))'
                : 'none',
            }}
          >
            <div className="font-heading font-semibold text-[12px] mb-1.5">
              {tooltip.label} — {COP(tooltip.total)}
            </div>
            {tooltip.delta !== null && (
              <div className={tooltip.delta > 0 ? 'text-[var(--color-danger)]' : 'text-[var(--color-provision)]'}>
                {tooltip.delta > 0 ? '▲' : '▼'}
                {' '}{COP(Math.abs(tooltip.delta))} vs mes anterior
              </div>
            )}
            {tooltip.delta === null && (
              <div className="text-muted-foreground">primer mes registrado</div>
            )}
            <div className="text-muted-foreground mt-1">
              Promedio: {COP(avg)}
            </div>
          </div>
        )}
      </div>
    </SectionCard>
  )
}
