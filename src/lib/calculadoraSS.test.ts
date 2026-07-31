import { describe, it, expect } from 'vitest'
// ?raw keeps this a pure Vite import — no node:fs, so the test type-checks under
// the app's tsconfig (which has no node types).
import html from '../../public/calculadoras/seguridad-social-independientes/index.html?raw'
import { DEFAULTS, SMMLV_BY_YEAR } from '@/data/defaults'
import { calcFSS } from '@/lib/calc'

/**
 * The public SEO calculator (public/calculadoras/seguridad-social-independientes)
 * is a standalone static page — it deliberately does NOT load the app bundle, so
 * it carries its own copy of the legal constants in a JSON block. This test is
 * the seam that keeps that copy honest: if the app's SMMLV or rates change and
 * the page isn't updated (or vice versa), CI fails here instead of the page
 * silently publishing last year's numbers.
 *
 * Yearly update: edit the JSON block in that page + SMMLV_BY_YEAR, and bump
 * CURRENT_YEAR below.
 */
const CURRENT_YEAR = 2026

interface LegalConstants {
  year: number
  smmlv: number
  ibcFactor: number
  ibcCapSmmlv: number
  salud: number
  pension: number
  arl: { level: string; pct: number; desc: string }[]
  fss: { minSmmlv: number; pct: number }[]
}

function legalConstants(): LegalConstants {
  const match = html.match(
    /<script type="application\/json" id="legal-constants">([\s\S]*?)<\/script>/,
  )
  if (!match) throw new Error('legal-constants JSON block not found in the calculator page')
  return JSON.parse(match[1]) as LegalConstants
}

describe('calculadora SS — legal constants stay in sync with the app engine', () => {
  const L = legalConstants()

  it('targets the current year', () => {
    expect(L.year).toBe(CURRENT_YEAR)
  })

  it('uses the same SMMLV as the app', () => {
    expect(L.smmlv).toBe(SMMLV_BY_YEAR[CURRENT_YEAR])
  })

  it('uses the same IBC factor and contribution rates as the app', () => {
    expect(L.ibcFactor).toBe(DEFAULTS.ibc_factor)
    expect(L.salud / 100).toBeCloseTo(DEFAULTS.ss_salud, 10)
    expect(L.pension / 100).toBeCloseTo(DEFAULTS.ss_pens, 10)
    // Risk I is the app's default ARL rate
    expect(L.arl[0].level).toBe('I')
    expect(L.arl[0].pct / 100).toBeCloseTo(DEFAULTS.ss_arl, 10)
  })

  it('lists the five ARL risk levels in ascending order', () => {
    expect(L.arl.map(a => a.level)).toEqual(['I', 'II', 'III', 'IV', 'V'])
    const pcts = L.arl.map(a => a.pct)
    expect([...pcts].sort((a, b) => a - b)).toEqual(pcts)
  })
})

describe('calculadora SS — FSS tiers match calcFSS()', () => {
  const L = legalConstants()
  const smmlv = SMMLV_BY_YEAR[CURRENT_YEAR]

  /** Mirrors the page's fssPctFor(): first tier whose threshold the IBC reaches. */
  function pagePct(ibc: number): number {
    const ratio = ibc / L.smmlv
    return L.fss.find(t => ratio >= t.minSmmlv)?.pct ?? 0
  }

  it('agrees with the engine across the whole scale', () => {
    // Probe just below / at / just above every boundary, plus the no-FSS zone
    const probes = [0, 0.5, 1, 2, 3.9, 4, 4.1, 15.9, 16, 17, 18, 19, 20, 25, 30]
    for (const multiple of probes) {
      const ibc = smmlv * multiple
      expect({ multiple, pct: pagePct(ibc) })
        .toEqual({ multiple, pct: calcFSS(ibc, smmlv).pct })
    }
  })

  it('does not charge FSS below 4 SMMLV', () => {
    expect(pagePct(smmlv * 3.999)).toBe(0)
    expect(pagePct(smmlv * 4)).toBe(1)
  })
})

describe('calculadora SS — IBC follows the same rule as the app', () => {
  const L = legalConstants()

  /** Mirrors the page's compute(): 40% of income, floored at 1 SMMLV. */
  function pageIBC(income: number): number {
    return Math.max(income * L.ibcFactor, L.smmlv)
  }

  it('floors at the SMMLV for low incomes', () => {
    expect(pageIBC(0)).toBe(L.smmlv)
    expect(pageIBC(1_000_000)).toBe(L.smmlv)
  })

  it('uses 40% of income once it clears the floor', () => {
    expect(pageIBC(10_000_000)).toBe(4_000_000)
    expect(pageIBC(20_000_000)).toBe(8_000_000)
  })

  it('produces the documented minimum monthly contribution', () => {
    const ibc = pageIBC(0)
    const total =
      Math.round(ibc * L.salud / 100) +
      Math.round(ibc * L.pension / 100) +
      Math.round(ibc * L.arl[0].pct / 100)
    // Same figure quoted in the FAQ answer and its FAQPage schema
    expect(total.toLocaleString('es-CO')).toBe('508.148')
    expect(html).toContain('$508.148')
  })
})

describe('calculadora SS — page contract', () => {
  it('carries the mandatory disclaimer', () => {
    expect(html).toContain(
      'Herramienta de planeación, no constituye asesoría tributaria ni contable.',
    )
  })

  it('declares canonical URL, description and FAQPage schema', () => {
    expect(html).toContain(
      'href="https://netofinanzas.app/calculadoras/seguridad-social-independientes/"',
    )
    expect(html).toMatch(/<meta\s+name="description"/)
    expect(html).toContain('"@type": "FAQPage"')
  })

  it('does not pull in the app bundle or any third-party origin', () => {
    expect(html).not.toMatch(/src="\/src\//)
    expect(html).not.toMatch(/https?:\/\/(?!netofinanzas\.app|schema\.org)[a-z0-9.-]+\/[^"']*"/i)
  })
})
