import { MONTHS } from '@/data/defaults'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { DEFAULTS } from '@/data/defaults'
import type { MonthData, DeductionConfig } from '@/types'

function q(v: string | number): string {
  const s = String(v)
  return s.includes(',') || s.includes('"') ? `"${s.replace(/"/g, '""')}"` : s
}

function cop(n: number): string {
  return n.toLocaleString('es-CO', { minimumFractionDigits: 0, maximumFractionDigits: 0 })
}

function pct(label: string, rate: number): string {
  return `${label} (${rate}%)`
}

export function exportAnnualCSV(
  db:          Record<string, MonthData>,
  year:        number,
  smmlvFn:     (y: number) => number,
  deductions:  DeductionConfig[],
): void {
  const enabled    = deductions.filter(d => d.enabled)
  const ssItems    = enabled.filter(d => d.group === 'ss')
  const provItems  = enabled.filter(d => d.group === 'provision')

  const rows: string[][] = []

  // ── Header block ──────────────────────────────────────────────
  rows.push(['Neto — Reporte financiero ' + year])
  rows.push([`Generado: ${new Date().toLocaleDateString('es-CO')}`])
  rows.push([])

  // ── Column headers ────────────────────────────────────────────
  const headers = [
    'Mes', 'Bruto COP', 'TRM',
    ...ssItems.map(d => pct(d.label, d.pct)),
    'Total SS',
    ...provItems.map(d => pct(d.label, d.pct)),
    'Ahorro voluntario',
    'Gastos',
    'Total deducciones',
    'Neto libre',
  ]
  rows.push(headers)

  // ── Month rows ────────────────────────────────────────────────
  const totals = new Array(headers.length).fill(0)

  for (let m = 0; m < 12; m++) {
    const k = `${year}-${String(m + 1).padStart(2, '0')}`
    const d = db[k]

    if (!d) {
      rows.push([MONTHS[m], ...new Array(headers.length - 1).fill('0')])
      continue
    }

    const trm     = d.trm || DEFAULTS.trm
    const incomes = d.incomes || []
    const { bruto } = calcTotales(incomes, trm)
    const ibc     = calcIBC(incomes, trm, smmlvFn(year))
    const gast    = calcGastos(d.egresos || [], trm)
    const provBase = calcProvisionBase(incomes, trm)
    const res     = calcAllDeductions(bruto, ibc, m + 1, deductions, gast, trm, d.voluntarias, provBase, smmlvFn(year))

    const ssAmts    = ssItems.map(s => res.ssItems.find(i => i.id === s.id)?.amount ?? 0)
    const provAmts  = provItems.map(s => res.provItems.find(i => i.id === s.id)?.amount ?? 0)
    const volTotal  = res.volItems.reduce((a, i) => a + i.amount, 0)

    const cols: (string | number)[] = [
      MONTHS[m], cop(bruto), trm,
      ...ssAmts.map(cop),
      cop(res.ssTotal),
      ...provAmts.map(cop),
      cop(volTotal),
      cop(gast),
      cop(res.total),
      cop(Math.max(res.netoLibre, 0)),
    ]

    // accumulate totals (skip Mes and TRM columns)
    cols.forEach((v, i) => {
      if (i === 0 || i === 2) return   // Mes, TRM
      const n = typeof v === 'string' ? parseFloat(v.replace(/\./g, '').replace(',', '.')) : v
      if (!isNaN(n)) totals[i] = (totals[i] as number) + n
    })

    rows.push(cols.map(c => q(String(c))))
  }

  // ── Totals row ────────────────────────────────────────────────
  const totalRow = totals.map((v, i) => {
    if (i === 0) return 'TOTAL'
    if (i === 2) return ''   // TRM has no total
    return q(cop(v as number))
  })
  rows.push(totalRow)

  // ── Build CSV string ─────────────────────────────────────────
  const csv = rows.map(r => r.join(',')).join('\n')
  const bom  = '﻿'  // UTF-8 BOM for Excel compatibility
  const blob = new Blob([bom + csv], { type: 'text/csv;charset=utf-8;' })
  const url  = URL.createObjectURL(blob)
  const a    = document.createElement('a')
  a.href     = url
  a.download = `neto-${year}.csv`
  a.click()
  URL.revokeObjectURL(url)
}
