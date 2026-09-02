import { useRef, useEffect, useState, useMemo } from 'react'
import * as d3 from 'd3'
import { buildLedger } from '@/lib/calc'
import { localToday } from '@/lib/format'
import { useFinanceStore } from '@/store/financeStore'
import { useTheme } from '@/hooks/useTheme'
import type { Account } from '@/types'

function cssVar(v: string) {
  return getComputedStyle(document.documentElement).getPropertyValue(v).trim()
}

interface Point { date: Date; value: number }

/**
 * Balance over time for one account.
 *
 * It has no fixed "Últimos 30 días" label: the range is stated by the pill strip beside
 * it and the axis already prints the dates, so a fixed label would contradict both the
 * moment anyone picked a different range.
 *
 * NO TOOLTIP YET. The chart tooltip's semantics are open with Design
 * (Q-2026-09-02): whether a multi-row data readout is a Tooltip variant, whether the
 * series colours survive the inverted surface, and what a phone gets when there is no
 * hover. Drawing one now would be inventing an answer to all three. The series, the axis
 * and the range are useful without it, so they ship first.
 */
export function AccountChart({ account, from }: { account: Account; from?: string }) {
  const db = useFinanceStore(s => s.db)
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const svgRef = useRef<SVGSVGElement>(null)
  const containerRef = useRef<HTMLDivElement>(null)
  const [containerW, setContainerW] = useState(0)

  // A credit card's balance is ≤ 0 (−debt), so plotting it as-is already draws what is
  // owed growing downward, which is what the Dual series is for. Dual proper — a second
  // quantity beside it — is not built: Design names it visually but never says which
  // number it is, and guessing at a figure on a debt chart is not a thing to guess at.
  const points = useMemo<Point[]>(() => {
    const entries = buildLedger(account.id, account, db)
    if (entries.length === 0) return []

    // No range picked — or none offerable, which is the common case for a young account:
    // show everything. The chart is not conditional on the strip; only the strip is
    // conditional on the data.
    const start = from ?? entries[0].date

    // The balance the account carried INTO the window: the last entry before it, or the
    // opening balance. Without it a range that starts mid-history begins at zero and the
    // chart tells a story the account never lived.
    const before = entries.filter(e => e.date < start)
    const opening = before.length > 0
      ? before[before.length - 1].balance
      : (account.startingBalance ?? 0)

    // One point per DAY, carrying that day's CLOSING balance. Plotting every entry puts
    // several points on the same instant, which draws as a vertical drop at that date —
    // the balance did not fall through a range of values, it ended the day at one.
    //
    // And nothing past today: a scheduled movement does not move the balance, so
    // including its date stretched a flat line into the future as if the account had
    // simply gone quiet.
    const today = localToday()
    const byDay = new Map<string, number>()
    for (const e of entries) {
      if (e.date < start || e.date > today) continue
      byDay.set(e.date, e.balance)      // entries are chronological, so the last wins
    }

    const pts: Point[] = [{ date: new Date(`${start}T00:00:00`), value: opening }]
    for (const [date, value] of [...byDay].sort(([a], [b]) => a.localeCompare(b))) {
      pts.push({ date: new Date(`${date}T00:00:00`), value })
    }
    // Carry the last balance to today so the line reaches the right edge instead of
    // stopping at whenever the account last moved.
    const lastDay = pts[pts.length - 1]
    if (lastDay.date < new Date(`${today}T00:00:00`)) {
      pts.push({ date: new Date(`${today}T00:00:00`), value: lastDay.value })
    }
    return pts
  }, [account, db, from])

  // At least two DISTINCT days: the balance has to have moved through time, not just
  // through amounts.
  const hasSpan = useMemo(
    () => new Set(points.map(p => p.date.getTime())).size >= 2,
    [points],
  )

  useEffect(() => {
    if (!svgRef.current || !containerRef.current || !hasSpan) return

    const W = containerRef.current.clientWidth
    const H = 180
    // The horizontal margins hold the first and last axis LABELS, which are centred on
    // ticks sitting at x=0 and x=w — at 8px they were sliced in half ("1/06", "01/0").
    const mg = { top: 10, right: 22, bottom: 22, left: 22 }
    const w = W - mg.left - mg.right
    const h = H - mg.top - mg.bottom

    const svg = d3.select(svgRef.current)
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()
    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`)

    const x = d3.scaleTime()
      .domain(d3.extent(points, p => p.date) as [Date, Date])
      .range([0, w])

    const vals = points.map(p => p.value)
    const lo = Math.min(...vals), hi = Math.max(...vals)
    // A flat series has no extent, so give it one rather than dividing by zero.
    const pad = (hi - lo) * 0.12 || Math.abs(hi || 1) * 0.12
    const y = d3.scaleLinear().domain([lo - pad, hi + pad]).range([h, 0])

    const isDebt  = account.type === 'credit'
    const which   = isDebt ? 'debt' : 'balance'
    const stroke  = cssVar(`--account-chart-series-${which}-stroke`)
    const fillFrom = cssVar(`--account-chart-series-${which}-fill-from`)
    // fill-to is the same hue at 0 alpha, never white — a white stop turns the fill
    // milky over a dark canvas.
    const fillTo   = cssVar(`--account-chart-series-${which}-fill-to`)

    const gradId = `acct-grad-${which}-${dark ? 'd' : 'l'}`
    const grad = svg.append('defs').append('linearGradient')
      .attr('id', gradId).attr('x1', '0').attr('y1', '0').attr('x2', '0').attr('y2', '1')
    grad.append('stop').attr('offset', '0%').attr('stop-color', fillFrom)
    grad.append('stop').attr('offset', '100%').attr('stop-color', fillTo)

    const area = d3.area<Point>()
      .x(p => x(p.date))
      .y0(h)
      .y1(p => y(p.value))
      .curve(d3.curveMonotoneX)

    const line = d3.line<Point>()
      .x(p => x(p.date))
      .y(p => y(p.value))
      .curve(d3.curveMonotoneX)

    g.append('path').datum(points).attr('fill', `url(#${gradId})`).attr('d', area)
    g.append('path').datum(points)
      .attr('fill', 'none').attr('stroke', stroke).attr('stroke-width', 2)
      .attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round')
      .attr('d', line)

    // X axis — dates, no domain line. The range strip says which window this is.
    const ticks = Math.max(2, Math.min(5, points.length))
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(d3.axisBottom(x).ticks(ticks).tickSize(0).tickPadding(8)
        .tickFormat(d => d3.timeFormat('%d/%m')(d as Date)))
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .attr('fill', cssVar('--account-chart-axis-foreground'))
        .attr('font-size', '10px'))
  }, [points, hasSpan, dark, containerW, account.type])

  useEffect(() => {
    if (!containerRef.current) return
    const ro = new ResizeObserver(e => setContainerW(e[0].contentRect.width))
    ro.observe(containerRef.current)
    return () => ro.disconnect()
  }, [])

  // Nothing to draw over: every movement lands on one day, so the time domain has no
  // width. A vertical spike over a single instant is not a chart of anything — it just
  // looks like one, which is worse than an absence.
  if (!hasSpan) return null

  return (
    <div ref={containerRef} className="w-full">
      <svg ref={svgRef} className="w-full block" />
    </div>
  )
}
