import { describe, it, expect } from 'vitest'
import { calcSSFromIBC } from '@/lib/calc'
import { DEFAULT_DEDUCTIONS } from '@/data/deductions'

const SMMLV = 1_750_905

describe('calcSSFromIBC — the IBC is a suggestion, so SS has to follow whatever base is used', () => {
  it('sums the IBC-based rates plus FSS', () => {
    // salud 12.5 + pensión 16 + ARL 0.522 = 29.022%, and 8M is 4.57 SMMLV so FSS is 1%.
    expect(calcSSFromIBC(8_000_000, DEFAULT_DEDUCTIONS, SMMLV)).toBe(2_321_760 + 80_000)
  })

  it('leaves FSS out below its threshold', () => {
    // 3 SMMLV is under the 4-SMMLV floor the fund starts at.
    const ibc = SMMLV * 3
    expect(calcSSFromIBC(ibc, DEFAULT_DEDUCTIONS, SMMLV)).toBeCloseTo(ibc * 0.29022, 4)
  })

  it('moves FSS with the base, not with the suggestion', () => {
    // The whole point: a user who invoiced on a higher base pays a higher bracket too.
    const low  = calcSSFromIBC(SMMLV * 3.9, DEFAULT_DEDUCTIONS, SMMLV)
    const high = calcSSFromIBC(SMMLV * 4.1, DEFAULT_DEDUCTIONS, SMMLV)
    expect(high / (SMMLV * 4.1)).toBeGreaterThan(low / (SMMLV * 3.9))
  })

  it('ignores deductions that are not SS on the IBC', () => {
    const withProvisions = calcSSFromIBC(8_000_000, DEFAULT_DEDUCTIONS, SMMLV)
    const ssOnly = calcSSFromIBC(8_000_000, DEFAULT_DEDUCTIONS.filter(d => d.group === 'ss'), SMMLV)
    expect(withProvisions).toBe(ssOnly)
  })

  it('is zero on a zero base', () => {
    expect(calcSSFromIBC(0, DEFAULT_DEDUCTIONS, SMMLV)).toBe(0)
  })
})
