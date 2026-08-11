import { describe, it, expect } from 'vitest'
import { creditCardStats } from '@/lib/calc'
import type { Account } from '@/types'

const card = (creditLimit?: number): Account =>
  ({ id: 'cmr', label: 'CMR Falabella', currency: 'COP', type: 'credit',
     number: '0205', rate: 0, creditLimit } as Account)

/**
 * The reported bug: a card with a 500k limit and 62,240 of purchases rendered
 * "$500.000" on its tile — the limit, which never moves. Nothing here was
 * wrong; the tile was reading the wrong field. These lock the contract the
 * tile depends on, since it had no coverage at all.
 */
describe('creditCardStats', () => {
  it('reports debt, available and utilization from a negative balance', () => {
    // three purchases: 13.240 + 26.800 + 22.200
    const s = creditCardStats(card(500_000), -62_240)
    expect(s).toEqual({
      limit: 500_000,
      debt: 62_240,
      available: 437_760,
      utilization: 62_240 / 500_000,
    })
    expect(Math.round(s.utilization * 100)).toBe(12)  // the "12% usado" on screen
  })

  it('is all-limit and zero-debt before any movement', () => {
    const s = creditCardStats(card(500_000), 0)
    expect(s).toMatchObject({ debt: 0, available: 500_000, utilization: 0 })
  })

  it('never reports negative available or debt', () => {
    // overspent past the limit
    expect(creditCardStats(card(100_000), -150_000).available).toBe(0)
    // a credit balance (overpaid) is not negative debt
    expect(creditCardStats(card(100_000), 25_000).debt).toBe(0)
  })

  it('treats a card with no limit as zero rather than dividing by it', () => {
    const s = creditCardStats(card(undefined), -50_000)
    expect(s).toMatchObject({ limit: 0, debt: 50_000, available: 0, utilization: 0 })
  })
})
