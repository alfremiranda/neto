import { useEffect, useState, useMemo } from 'react'
import { scaleBand, scaleLinear } from 'd3-scale'
import { axisBottom, axisLeft } from 'd3-axis'
import { select } from 'd3-selection'
import { max } from 'd3-array'
import { stack, type Series, type SeriesPoint } from 'd3-shape'
import { easeCubicOut } from 'd3-ease'
// Side-effect import: `.transition()` is a method d3-transition patches onto selections,
// so it has to be loaded even though nothing here references it by name.
import 'd3-transition'
import { TrendingUp } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP } from '@/lib/format'
import { MONTHS, DEFAULTS } from '@/data/defaults'
import { useTheme } from '@/hooks/useTheme'
import { deductionGroupFlags } from '@/hooks/useDeductionGroups'
import { SectionCard } from '@/components/ui/SectionCard'
import { cssVar, useChartRefs, useChartWidth } from '@/lib/chart'
import { TOOLTIP_SURFACE } from '@/components/ui/tooltip'
import { TooltipReadout, type SwatchTone } from '@/components/ui/TooltipReadout'
import { cn } from '@/lib/utils'

const M = 1_000_000

const SERIES_KEYS = ['oblig', 'prov', 'egres', 'neto'] as const

const SERIES_TONE: Record<'oblig' | 'prov' | 'egres' | 'neto', SwatchTone> = {
  oblig: 'tax', prov: 'provision', egres: 'expense', neto: 'net',
}
type SeriesKey = typeof SERIES_KEYS[number]

interface BarDatum {
  label: string
  monthKey: string
  oblig: number
  prov: number
  egres: number
  neto: number
}

interface Tooltip {
  x: number
  y: number
  label: string
  values: { label: string; value: number; tone: SwatchTone }[]
}

export function TrendChart() {
  const { db, curKey, getSMMLV, setCurKey } = useFinanceStore()
  const { containerRef, svgRef } = useChartRefs()
  const containerW = useChartWidth(containerRef)
  const deductions = useSettingsStore(s => s.deductions)
  const { theme } = useTheme()
  const dark = theme === 'dark'
      const [tooltip, setTooltip] = useState<Tooltip | null>(null)

  // Derive colors from current month's calcAllDeductions — same source as DistribucionCard/KPIStrip
  const allSeries = useMemo(() => {
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
    const provBase = calcProvisionBase(incomes, trm)
    const res = calcAllDeductions(bruto, ibc, mNum, deductions, gast, trm, d?.voluntarias, provBase, smmlv)

    const provColor = res.provItems.filter(i => i.id !== 'retencion').find(i => i.applies)?.color
                   ?? res.provItems.filter(i => i.id !== 'retencion')[0]?.color
                   ?? '--color-provision'

    return [
      { key: 'oblig' as SeriesKey, label: 'Obligaciones', token: '--color-tax' },
      { key: 'prov'  as SeriesKey, label: 'Provisiones',  token: provColor   },
      { key: 'egres' as SeriesKey, label: 'Gastos',       token: '--color-expense'  },
      { key: 'neto'  as SeriesKey, label: 'Neto libre',   token: '--color-net'  },
    ]
  }, [db, curKey, deductions, getSMMLV])

  const now = new Date()
  const todayKey = `${now.getFullYear()}-${String(now.getMonth() + 1).padStart(2, '0')}`

  const allKeys = [...new Set([
    ...Object.keys(db).filter(k => {
      if (k === '_settings') return false
      if (k > todayKey) return false  // exclude future months
      const m = db[k]
      return (m?.incomes?.length ?? 0) > 0 || (m?.egresos?.length ?? 0) > 0
    }).sort(),
    curKey <= todayKey ? curKey : todayKey,
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
    if (bruto === 0 && gast === 0) return { label, monthKey: k, oblig: 0, prov: 0, egres: 0, neto: 0 }
    const smmlv   = getSMMLV(parseInt(y))
    const ibc     = calcIBC(incomes, trm, smmlv)
    const provBase = calcProvisionBase(incomes, trm)
    const res     = calcAllDeductions(bruto, ibc, monthNum, deductions, gast, trm, d?.voluntarias, provBase, smmlv)
    const retAmt  = res.provItems.find(i => i.id === 'retencion')?.amount ?? 0
    return {
      label,
      monthKey: k,
      oblig: (res.ssTotal + retAmt) / M,
      prov:  Math.max(res.nonSsTotal - retAmt, 0) / M,
      egres: gast / M,
      neto:  Math.max(res.netoLibre, 0) / M,
    }
  }), [db, curKey, deductions])  // eslint-disable-line react-hooks/exhaustive-deps

  // Hide obligation/provision series for employee profiles, but keep them when
  // there is historical data so a profile switch never drops real bars.
  const { ssEnabled, retencionEnabled, provisionesEnabled } = deductionGroupFlags(deductions)
  const showOblig = ssEnabled || retencionEnabled || data.some(d => d.oblig > 0)
  const showProv  = provisionesEnabled || data.some(d => d.prov > 0)
  const series = useMemo(
    () => allSeries.filter(s => (s.key !== 'oblig' || showOblig) && (s.key !== 'prov' || showProv)),
    [allSeries, showOblig, showProv],
  )


  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !data.length) return

    const W = containerRef.current.clientWidth
    const H = 252
    const mg = { top: 8, right: 12, bottom: 64, left: 46 }
    const w = W - mg.left - mg.right
    const h = H - mg.top - mg.bottom

    const colorVars = series.map(s => `var(${s.token})`)
    const tickColor = cssVar('--muted-foreground')
    const gridColor = dark ? 'oklch(1 0 0 / 8%)' : 'oklch(0 0 0 / 5%)'
    const hlColor   = dark ? 'oklch(1 0 0 / 5%)' : 'oklch(0 0 0 / 3%)'

    const svg = select(svgRef.current)
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()

    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`)

    const keys: SeriesKey[] = series.map(s => s.key)
    const stacked = stack<BarDatum>().keys(keys)(data)

    const maxVal = max(data, d => keys.reduce((sum, k) => sum + (d[k] as number), 0)) ?? 1

    const xScale = scaleBand<string>()
      .domain(data.map(d => d.label))
      .range([0, w])
      .padding(0.32)

    const yScale = scaleLinear()
      .domain([0, maxVal * 1.12])
      .range([h, 0])
      .nice()

    // Grid
    g.append('g')
      .call(axisLeft(yScale).tickSize(-w).ticks(4).tickFormat(() => ''))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line')
        .attr('stroke', gridColor)
        .attr('stroke-dasharray', '3,3'))

    // Y axis ticks
    g.append('g')
      .call(axisLeft(yScale).ticks(4).tickFormat(v => `$${(v as number).toLocaleString('es-CO', { maximumFractionDigits: 1 })}M`))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('.tick line').remove())
      .call(ax => ax.selectAll('text').attr('fill', tickColor).attr('font-size', '10.5px'))

    // X axis
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(axisBottom(xScale).tickSize(0))
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
    const groups = g.selectAll<SVGGElement, Series<BarDatum, string>>('.layer')
      .data(stacked)
      .join('g')
      .attr('class', 'layer')
      .style('fill', (_, i) => colorVars[i])

    groups.selectAll<SVGRectElement, SeriesPoint<BarDatum>>('rect')
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
          values: series.map(s => ({
            label: s.label,
            value: (d.data[s.key] as number) * M,
            // By meaning, not by the chart's own token: readout/swatch/* is a separate
            // rung chosen to clear 3:1 on the inverted surface, where the chart's
            // colours do not (tax measures 1.44 there).
            tone: SERIES_TONE[s.key],
          })),
        })
        select(this.parentElement).raise()
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
      .transition().duration(450).ease(easeCubicOut)
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
            className={cn('absolute z-10 pointer-events-none shadow-lg', TOOLTIP_SURFACE)}
            style={{
              left: tooltip.x + 14,
              top:  tooltip.y - 110,
              transform: tooltip.x > (containerRef.current?.clientWidth ?? 400) * 0.6
                ? 'translateX(calc(-100% - 28px))'
                : 'none',
            }}
          >
            <TooltipReadout
              title={tooltip.label}
              rows={tooltip.values.map(v => ({ label: v.label, value: COP(v.value), tone: v.tone }))}
            />
          </div>
        )}
      </div>
    </SectionCard>
  )
}
