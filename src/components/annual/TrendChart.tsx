import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { TrendingUp } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions } from '@/lib/calc'
import { COP } from '@/lib/format'
import { MONTHS, DEFAULTS } from '@/data/defaults'
import { useTheme } from '@/hooks/useTheme'
import { SectionCard } from '@/components/ui/SectionCard'

const M = 1_000_000

const SERIES_KEYS = ['ss', 'ret', 'prov', 'egres', 'neto'] as const
type SeriesKey = typeof SERIES_KEYS[number]

interface BarDatum {
  label: string
  monthKey: string
  ss: number
  ret: number
  prov: number
  egres: number
  neto: number
}

interface Tooltip {
  x: number
  y: number
  label: string
  values: { label: string; value: number; color: string }[]
}

function get(v: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
}

export function TrendChart() {
  const { db, curKey, getSMMLV, setCurKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  // Derive colors from current month's calcAllDeductions — same source as DistribucionCard/KPIStrip
  const series = useMemo(() => {
    const d = db[curKey]
    const [y, mStr] = curKey.split('-')
    const mNum = parseInt(mStr)
    const trm = d?.trm || DEFAULTS.trm
    const incomes = d?.incomes || []
    const egresos = d?.egresos || []
    const smmlv = getSMMLV(parseInt(y))
    const { bruto } = calcTotales(incomes, trm)
    const ibc = calcIBC(incomes, trm, smmlv)
    const gast = calcGastos(egresos, trm)
    const res = calcAllDeductions(bruto, ibc, mNum, deductions, gast, trm, d?.voluntarias)

    const ssColor  = res.ssItems[0]?.color ?? '--n-blue'
    const retColor = res.provItems.find(i => i.id === 'retencion')?.color ?? '--n-amber'
    const provColor = res.provItems.filter(i => i.id !== 'retencion').find(i => i.applies)?.color
                   ?? res.provItems.filter(i => i.id !== 'retencion')[0]?.color
                   ?? '--n-pink'

    return [
      { key: 'ss'    as SeriesKey, label: 'SS',          token: ssColor    },
      { key: 'ret'   as SeriesKey, label: 'Retención',   token: retColor   },
      { key: 'prov'  as SeriesKey, label: 'Provisiones', token: provColor  },
      { key: 'egres' as SeriesKey, label: 'Egresos',     token: '--n-green' },
      { key: 'neto'  as SeriesKey, label: 'Neto libre',  token: '--n-lime'  },
    ]
  }, [db, curKey, deductions, getSMMLV])

  const allKeys = [...new Set([
    ...Object.keys(db).filter(k => k !== '_settings').sort(),
    curKey,
  ])]
  const monthKeys = allKeys.slice(-8)

  const data = useMemo<BarDatum[]>(() => monthKeys.map(k => {
    const [y, mStr] = k.split('-')
    const monthNum = parseInt(mStr)
    const label = MONTHS[monthNum - 1].slice(0, 3) + ' \'' + y.slice(2)
    const d = db[k]
    const trm     = d?.trm || DEFAULTS.trm
    const incomes = d?.incomes || []
    const egresos = d?.egresos || []
    const { bruto } = calcTotales(incomes, trm)
    const gast    = calcGastos(egresos, trm)
    if (bruto === 0 && gast === 0) return { label, monthKey: k, ss: 0, ret: 0, prov: 0, egres: 0, neto: 0 }
    const smmlv   = getSMMLV(parseInt(y))
    const ibc     = calcIBC(incomes, trm, smmlv)
    const res     = calcAllDeductions(bruto, ibc, monthNum, deductions, gast, trm, d?.voluntarias)
    const retAmt  = res.provItems.find(i => i.id === 'retencion')?.amount ?? 0
    return {
      label,
      monthKey: k,
      ss:    res.ssTotal / M,
      ret:   retAmt / M,
      prov:  Math.max(res.nonSsTotal - retAmt, 0) / M,
      egres: gast / M,
      neto:  Math.max(res.netoLibre, 0) / M,
    }
  }), [db, curKey, deductions])  // eslint-disable-line react-hooks/exhaustive-deps

  const [containerW, setContainerW] = useState(0)
  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(entries => {
      setContainerW(entries[0].contentRect.width)
    })
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.length) return

    const W = containerRef.current.clientWidth
    const H = 252
    const mg = { top: 8, right: 12, bottom: 64, left: 46 }
    const w = W - mg.left - mg.right
    const h = H - mg.top - mg.bottom

    const colorVars = series.map(s => `var(${s.token})`)
    const tickColor = get('--muted-foreground')
    const gridColor = dark ? 'oklch(1 0 0 / 8%)' : 'oklch(0 0 0 / 5%)'
    const hlColor   = dark ? 'oklch(1 0 0 / 5%)' : 'oklch(0 0 0 / 3%)'

    const svg = d3.select(svgRef.current)
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`)

    const keys: SeriesKey[] = ['ss', 'ret', 'prov', 'egres', 'neto']
    const stacked = d3.stack<BarDatum>().keys(keys)(data)

    const maxVal = d3.max(data, d => d.ss + d.ret + d.prov + d.egres + d.neto) ?? 1

    const xScale = d3.scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, w])
      .padding(0.32)

    const yScale = d3.scaleLinear()
      .domain([0, maxVal * 1.12])
      .range([h, 0])
      .nice()

    // Grid
    g.append('g')
      .call(d3.axisLeft(yScale).tickSize(-w).ticks(4).tickFormat(() => ''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line')
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', '3,3'))

    // Y axis ticks
    g.append('g')
      .call(d3.axisLeft(yScale).ticks(4).tickFormat(v => `$${v}M`))
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

    // Stacked bar groups
    const groups = g.selectAll<SVGGElement, d3.Series<BarDatum, string>>('.layer')
      .data(stacked)
      .join('g')
      .attr('class', 'layer')
      .style('fill', (_, i) => colorVars[i])

    groups.selectAll<SVGRectElement, d3.SeriesPoint<BarDatum>>('rect')
      .data(d => d)
      .join('rect')
      .attr('x', d => xScale(d.data.label) ?? 0)
      .attr('width', xScale.bandwidth())
      .attr('rx', 2)
      .attr('y', h)
      .attr('height', 0)
      .style('cursor', 'pointer')
      .on('mouseenter', function(event: MouseEvent, d) {
        const containerRect = containerRef.current!.getBoundingClientRect()
        setTooltip({
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
          label: d.data.label,
          values: series.map((s, i) => ({
            label: s.label,
            value: (d.data[s.key] as number) * M,
            color: colorVars[i],
          })),
        })
        d3.select(this.parentElement).raise()
      })
      .on('mousemove', function(event: MouseEvent) {
        const containerRect = containerRef.current!.getBoundingClientRect()
        setTooltip(t => t ? {
          ...t,
          x: event.clientX - containerRect.left,
          y: event.clientY - containerRect.top,
        } : null)
      })
      .on('mouseleave', () => setTooltip(null))
      .on('click', (_: MouseEvent, d) => setCurKey(d.data.monthKey))
      .transition().duration(450).ease(d3.easeCubicOut)
      .attr('y', d => yScale(d[1]))
      .attr('height', d => Math.max(0, yScale(d[0]) - yScale(d[1])))

    // Legend — 5 items, split 3+2 on narrow widths
    const legendG = svg.append('g').attr('transform', `translate(${mg.left},${H - 18})`)
    const itemW = w / series.length

    series.forEach((s, i) => {
      const lg = legendG.append('g').attr('transform', `translate(${i * itemW},0)`)
      lg.append('rect')
        .attr('width', 8).attr('height', 8).attr('rx', 2)
        .style('fill', colorVars[i]).attr('y', -4)
      lg.append('text')
        .attr('x', 12).attr('fill', tickColor)
        .attr('font-size', '10px').attr('dominant-baseline', 'middle')
        .text(s.label)
    })
  }, [data, dark, curKey, setCurKey, containerW, series])

  return (
    <SectionCard icon={TrendingUp} title="Tendencia (últimos 8 meses)">
      <div ref={containerRef} className="relative select-none">
        <svg ref={svgRef} className="w-full block" />
        {tooltip && (
          <div
            className="absolute z-10 pointer-events-none rounded-lg border border-[var(--border)] bg-[var(--popover)] shadow-lg px-3 py-2.5 text-[11px] min-w-[160px]"
            style={{
              left: tooltip.x + 14,
              top:  tooltip.y - 110,
              transform: tooltip.x > (containerRef.current?.clientWidth ?? 400) * 0.6
                ? 'translateX(calc(-100% - 28px))'
                : 'none',
            }}
          >
            <div className="font-heading font-semibold text-[12px] text-[var(--popover-foreground)] mb-2">
              {tooltip.label}
            </div>
            {tooltip.values.map(v => (
              <div key={v.label} className="flex items-center gap-1.5 py-[1px]">
                <span className="w-2 h-2 rounded-[3px] shrink-0" style={{ background: v.color }} />
                <span className="text-[var(--muted-foreground)] flex-1">{v.label}</span>
                <span className="font-heading tabular-nums text-[var(--popover-foreground)] pl-3">
                  {COP(v.value)}
                </span>
              </div>
            ))}
          </div>
        )}
      </div>
    </SectionCard>
  )
}
