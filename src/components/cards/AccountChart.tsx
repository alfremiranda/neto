import { useEffect, useState, useMemo, useRef } from 'react'
import { scaleLinear, scaleTime } from 'd3-scale'
import { axisBottom } from 'd3-axis'
import { select, pointer } from 'd3-selection'
import { extent } from 'd3-array'
// Aliased: the component already names its own generators `area` and `line`.
import { area as d3Area, line as d3Line, curveMonotoneX } from 'd3-shape'
import { timeFormat } from 'd3-time-format'
import { buildLedger } from '@/lib/calc'
import { localToday, fmtDate, COP, USD } from '@/lib/format'
import { cssVar, useChartRefs, useChartWidth } from '@/lib/chart'
import { TOOLTIP_SURFACE } from '@/components/ui/tooltip'
import { TooltipReadout } from '@/components/ui/TooltipReadout'
import { cn } from '@/lib/utils'
import { useFinanceStore } from '@/store/financeStore'
import { useTheme } from '@/hooks/useTheme'
import type { Account, FinanceDB } from '@/types'

interface Point { date: Date; value: number }

/**
 * The balance series for an account, one point per DAY carrying that day's closing
 * balance.
 *
 * Exported because the card that mounts the chart has to answer the same question — is
 * there a chart at all — and asking it a second way is how the two disagree. It did:
 * the card counted ledger-entry dates while the series also carries the opening balance
 * and the carry-to-today, so an account with one movement had a drawable two-day series
 * and a card that refused to mount it.
 */
export function accountSeries(account: Account, db: FinanceDB, from?: string): Point[] {
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
}

/**
 * At least two DISTINCT days: the balance has to have moved through time, not just
 * through amounts. A vertical spike over a single instant is not a chart of anything —
 * it only looks like one, which is worse than an absence.
 */
export function hasChartSpan(account: Account, db: FinanceDB, from?: string): boolean {
  return new Set(accountSeries(account, db, from).map(p => p.date.getTime())).size >= 2
}

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
export function AccountChart({ account, from, onSelect }: {
  account: Account
  from?: string
  /** The point under the cursor (desktop) or the finger (mobile), or null on release.
   *  Hover and tap do the SAME thing — move the selection — and the card reads it out.
   *  A floating bubble is desktop sugar on top of a readout that is always visible;
   *  there is no hover on touch, so it cannot be the only place the figures live. */
  onSelect?: (p: { date: string; value: number } | null) => void
}) {
  const db = useFinanceStore(s => s.db)
  const { containerRef, svgRef } = useChartRefs()
  const containerW = useChartWidth(containerRef)
  const { theme } = useTheme()
  const dark = theme === 'dark'
  const fmt = (n: number) => account.currency === 'USD' ? USD(n) : COP(n)
      // The floating readout. It follows the pointer whether that pointer is a mouse or a
  // finger: Design's note called it desktop sugar, but their own mobile frame draws it,
  // and it costs nothing on touch now that the marker already tracks a drag. The metrics
  // still carry the figures too — the bubble is an addition, not the only answer, which
  // was the whole point of that rule.
  const [tip, setTip] = useState<{ x: number; y: number; date: string; value: number } | null>(null)
  // Set by the draw effect, called by the dismissal effect: the marker only exists inside
  // the d3 closure, so clearing has to go through a handle rather than duplicate the reset.
  const clearRef = useRef<(() => void) | null>(null)

  // A credit card's balance is ≤ 0 (−debt), so plotting it as-is already draws what is
  // owed growing downward, which is what the Dual series is for. Dual proper — a second
  // quantity beside it — is not built: Design names it visually but never says which
  // number it is, and guessing at a figure on a debt chart is not a thing to guess at.
  const points = useMemo(() => accountSeries(account, db, from), [account, db, from])

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

    const svg = select(svgRef.current)
    svg.attr('width', W).attr('height', H)
    svg.selectAll('*').remove()
    const g = svg.append('g').attr('transform', `translate(${mg.left},${mg.top})`)

    const x = scaleTime()
      .domain(extent(points, p => p.date) as [Date, Date])
      .range([0, w])

    const vals = points.map(p => p.value)
    const lo = Math.min(...vals), hi = Math.max(...vals)
    // A flat series has no extent, so give it one rather than dividing by zero.
    const pad = (hi - lo) * 0.12 || Math.abs(hi || 1) * 0.12
    const y = scaleLinear().domain([lo - pad, hi + pad]).range([h, 0])

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

    const area = d3Area<Point>()
      .x(p => x(p.date))
      .y0(h)
      .y1(p => y(p.value))
      .curve(curveMonotoneX)

    const line = d3Line<Point>()
      .x(p => x(p.date))
      .y(p => y(p.value))
      .curve(curveMonotoneX)

    g.append('path').datum(points).attr('fill', `url(#${gradId})`).attr('d', area)
    g.append('path').datum(points)
      .attr('fill', 'none').attr('stroke', stroke).attr('stroke-width', 2)
      .attr('stroke-linecap', 'round').attr('stroke-linejoin', 'round')
      .attr('d', line)

    // X axis — dates, no domain line. The range strip says which window this is.
    // Ticks on whole DAYS, capped at one per distinct day in the window. Asking for a
    // fixed count over a two-day domain made d3 place three and the formatter printed
    // "31/08" twice — an axis that repeats a date is telling you the series has a shape
    // it does not have.
    const fmtTick = timeFormat('%d/%m')
    const days = new Set(points.map(p => fmtTick(p.date))).size
    const ticks = Math.max(2, Math.min(5, days))
    g.append('g')
      .attr('transform', `translate(0,${h})`)
      .call(axisBottom(x).ticks(ticks).tickSize(0).tickPadding(8)
        .tickFormat(d => fmtTick(d as Date)))
      .call(ax => {
        // d3 can still land two ticks inside one day on a short domain; drop the repeat
        // rather than draw it.
        const seen = new Set<string>()
        ax.selectAll<SVGTextElement, unknown>('text').each(function () {
          const label = this.textContent ?? ''
          if (seen.has(label)) this.remove()
          else seen.add(label)
        })
      })
      .call(ax => ax.select('.domain').remove())
      .call(ax => ax.selectAll('text')
        .attr('fill', cssVar('--account-chart-axis-foreground'))
        .attr('font-size', '10px'))

    // Selection. Pointer events, not mouse events: the chart has to answer a finger too,
    // and pointerdown/pointermove cover both devices through one API.
    const marker = g.append('line')
      .attr('y1', 0).attr('y2', h)
      .attr('stroke', cssVar('--account-chart-marker-line'))
      .attr('stroke-width', 1)
      .attr('opacity', 0)

    const nearest = (px: number): Point => {
      const t = x.invert(px).getTime()
      return points.reduce((best, p) =>
        Math.abs(p.date.getTime() - t) < Math.abs(best.date.getTime() - t) ? p : best)
    }

    clearRef.current = () => {
      marker.attr('opacity', 0)
      onSelect?.(null)
      setTip(null)
    }
    const clear = () => clearRef.current?.()

    const move = (event: PointerEvent) => {
      const [px] = pointer(event, g.node())
      const p = nearest(Math.max(0, Math.min(w, px)))
      marker.attr('x1', x(p.date)).attr('x2', x(p.date)).attr('opacity', 1)
      const iso = p.date.toISOString().slice(0, 10)
      onSelect?.({ date: iso, value: p.value })
      setTip({ x: mg.left + x(p.date), y: mg.top + y(p.value), date: iso, value: p.value })
    }

    svg
      .style('touch-action', 'pan-y')   // let the page still scroll under a vertical drag
      .on('pointerdown', move)
      .on('pointermove', function (event: PointerEvent) {
        if (event.pointerType === 'mouse' || event.buttons > 0) move(event)
      })
      // Only a MOUSE clears on release. On touch the tap IS the selection and the card's
      // metrics are the only place those figures appear — clearing on pointerup would show
      // the value for as long as the finger was down and then take it away, which is the
      // same as not answering at all. A touch selection is dismissed by touching somewhere
      // else instead; see the effect below.
      .on('pointerup pointerleave pointercancel', function (event: PointerEvent) {
        if (event.pointerType !== 'mouse') return
        clear()
      })
  }, [points, hasSpan, dark, containerW, account.type, onSelect])


  /**
   * A touch selection is dismissed by touching somewhere else.
   *
   * Keeping it after the finger lifts is what makes the figures readable at all on a phone
   * — but without a way out it stops being a selection and becomes a mode the user cannot
   * leave. Reported from use: the marker stayed put and no tap anywhere would clear it.
   *
   * Listens in the CAPTURE phase so it runs before the chart's own handler and cannot be
   * swallowed by whatever was tapped, and ignores taps inside the chart, which are a new
   * selection rather than a dismissal.
   */
  useEffect(() => {
    if (!tip) return
    const onDown = (e: PointerEvent) => {
      if (e.pointerType === 'mouse') return
      if (containerRef.current?.contains(e.target as Node)) return
      clearRef.current?.()
    }
    document.addEventListener('pointerdown', onDown, true)
    return () => document.removeEventListener('pointerdown', onDown, true)
  }, [tip, containerRef])

  // Nothing to draw over: every movement lands on one day, so the time domain has no
  // width. A vertical spike over a single instant is not a chart of anything — it just
  // looks like one, which is worse than an absence.
  if (!hasSpan) return null

  const isDebt = account.type === 'credit'

  return (
    <div ref={containerRef} className="relative w-full">
      <svg ref={svgRef} className="w-full block" />
      {tip && (
        <div
          className={cn('absolute z-10 pointer-events-none shadow-lg', TOOLTIP_SURFACE)}
          style={{
            left: tip.x,
            top: Math.max(0, tip.y - 64),
            // Flip past the midpoint so the bubble never runs off the right edge, and
            // centre it on the marker otherwise.
            transform: tip.x > (containerRef.current?.clientWidth ?? 320) * 0.6
              ? 'translateX(calc(-100% - 12px))'
              : 'translateX(-50%)',
          }}
        >
          <TooltipReadout
            title={fmtDate(tip.date)}
            rows={[{
              label: isDebt ? 'Deuda' : 'Saldo',
              value: fmt(isDebt ? Math.max(-tip.value, 0) : tip.value),
              tone: isDebt ? 'debt' : 'balance',
            }]}
          />
        </div>
      )}
    </div>
  )
}
