import { DEFAULTS } from '@/data/defaults'
import type { Income, Egreso, MonthData, Totales, SSResult, Distribucion, Flujo, AnnualRow } from '@/types'

export function calcTotales(incomes: Income[], trm: number): Totales {
  let totUSD = 0, totCOP = 0
  incomes.forEach(i => {
    if (i.currency === 'USD') totUSD += i.amount
    else totCOP += i.amount
  })
  return { totUSD, totCOP, bruto: totUSD * trm + totCOP }
}

export function calcIBC(incomes: Income[], trm: number, smmlv: number): number {
  const totalServicios = incomes
    .filter(i => (i.tipo || 'servicios') === 'servicios')
    .reduce((a, i) => a + (i.currency === 'USD' ? i.amount * trm : i.amount), 0)
  return Math.max(totalServicios * DEFAULTS.ibc_factor, smmlv)
}

export function calcSS(ibc: number): SSResult {
  const salud = ibc * DEFAULTS.ss_salud
  const pens  = ibc * DEFAULTS.ss_pens
  const arl   = ibc * DEFAULTS.ss_arl
  return { salud, pens, arl, total: salud + pens + arl }
}

export function calcGastos(egresos: Egreso[], trm: number): number {
  return (egresos || [])
    .reduce((a, e) => a + (e.currency === 'USD' ? e.amount * (trm || DEFAULTS.trm) : e.amount), 0)
}

export function calcDistribucion(bruto: number, ssTot: number, gast: number): Distribucion {
  const ret  = bruto * DEFAULTS.retencion
  const prim = bruto * DEFAULTS.primas
  const netoLibre = bruto - ssTot - gast - ret - prim
  return { ret, prim, netoLibre }
}

export function calcFlujo(ssTot: number, gast: number, ret: number, prim: number, trm: number, totUSD: number): Flujo {
  const aBancol  = (ssTot + gast) / trm
  const aARQ     = (ret + prim) / trm
  const netoU    = totUSD - aBancol - aARQ
  const interest = aARQ * (DEFAULTS.arq_savings_rate / 12)
  return { aBancol, aARQ, netoU, interest }
}

export function buildAnnualData(
  db: Record<string, MonthData>,
  year: number,
  smmlvFn: (y: number) => number,
): AnnualRow[] {
  const rows: AnnualRow[] = []

  for (let m = 0; m < 12; m++) {
    const k = `${year}-${String(m).padStart(2, '0')}`
    const d = db[k]
    if (!d) {
      rows.push({ m, hasData: false })
      continue
    }

    const trm     = d.trm || DEFAULTS.trm
    const incomes = d.incomes || []
    const { totUSD, totCOP, bruto } = calcTotales(incomes, trm)
    const ibc     = calcIBC(incomes, trm, smmlvFn(year))
    const ss      = calcSS(ibc)
    const gast    = calcGastos(d.egresos || [], trm)
    const { ret, prim, netoLibre } = calcDistribucion(bruto, ss.total, gast)

    rows.push({ m, hasData: true, bruto, totUSD, totCOP, ssTot: ss.total, gast, ret, prim, netoLibre })
  }

  return rows
}
