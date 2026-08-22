import { describe, it, expect } from 'vitest'
import {
  ACCOUNT_COLORS, ACCOUNT_COLOR_LABEL, derivedColor, accountColor, accountColorVars,
} from './accountColor'

describe('account colour', () => {
  it('publishes exactly the twelve the design system does', () => {
    expect(ACCOUNT_COLORS).toHaveLength(12)
    expect(new Set(ACCOUNT_COLORS).size).toBe(12)
  })

  it('names every colour — WCAG 1.4.1, colour is never the sole carrier', () => {
    for (const c of ACCOUNT_COLORS) {
      expect(ACCOUNT_COLOR_LABEL[c], `${c} has no Spanish name`).toBeTruthy()
    }
    expect(new Set(Object.values(ACCOUNT_COLOR_LABEL)).size).toBe(12)
  })

  it('gives the same account the same colour every time', () => {
    // This is the whole reason §4 derives instead of rolling: two devices must
    // agree with no sync round trip.
    const id = 'acc_onboarding_1755463200000_2'
    expect(derivedColor(id)).toBe(derivedColor(id))
    expect(derivedColor(id)).toBe(derivedColor(id))
  })

  it('always lands inside the palette, for any id shape the app produces', () => {
    const ids = ['ARQ', 'Bancolombia', 'Efectivo', 'Nequi', 'CMR', '', 'x',
                 'acc_onboarding_1755463200000_0', '💳 tarjeta', 'a'.repeat(500)]
    for (const id of ids) {
      expect(ACCOUNT_COLORS, `id ${JSON.stringify(id)} fell outside`).toContain(derivedColor(id))
    }
  })

  it('spreads real account ids over more than one colour', () => {
    // A hash that maps every id to the same rung would pass every test above and
    // be useless, so this asserts the property that actually matters.
    const ids = Array.from({ length: 40 }, (_, i) => `acc_onboarding_17554632000${i}_0`)
    expect(new Set(ids.map(derivedColor)).size).toBeGreaterThan(4)
  })

  it('prefers a chosen colour over the derived one', () => {
    expect(accountColor({ id: 'ARQ', color: 'teal' })).toBe('teal')
    expect(accountColor({ id: 'ARQ' })).toBe(derivedColor('ARQ'))
  })

  it('never writes the derived colour back onto the account', () => {
    // Absent means derived, present means chosen. accountColor reads; it must not
    // mutate, or the distinction disappears on first render.
    const account = { id: 'ARQ' } as { id: string; color?: never }
    accountColor(account)
    expect('color' in account).toBe(false)
  })

  it('points the avatar variables at the published tokens', () => {
    expect(accountColorVars('indigo')).toEqual({
      '--account-accent': 'var(--account-indigo-accent)',
      '--account-surface': 'var(--account-indigo-surface)',
    })
  })
})
