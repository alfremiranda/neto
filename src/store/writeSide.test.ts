import { describe, it, expect, beforeEach, vi } from 'vitest'
import type { Account, DeductionConfig, Settings } from '@/types'

/**
 * The settings write-side: `saveAccountsConfig`, `saveDeductionsConfig`,
 * `setSettingsScalars`, `acceptPrivacyPolicy`.
 *
 * `merge.test.ts` covers the half that decides who wins between devices. This covers the
 * half that decides what gets written in the first place, which had no unit test at all —
 * flagged as known debt in NORTH_STAR since July, its only verification a manual two-device
 * smoke on dev.
 *
 * Its invariants are not cosmetic. Stamping an account that did not change is enough to let
 * this device's stale copy beat another device's real edit in the per-entry merge, and it
 * would show up days later on the other phone as an edit that silently reverted.
 *
 * `autoPush` is a no-op under `import.meta.env.DEV`, which vitest sets, so nothing here
 * touches the network. The store is a zustand `persist` store and the node environment has
 * no localStorage, so it is stubbed before the module loads.
 */
// financeStore imports src/lib/supabase, which reads window.location at module scope, so
// the browser globals have to exist before the dynamic import below — not because these
// tests touch the network (autoPush is a DEV no-op) but because importing the module
// evaluates that file.
const mem = new Map<string, string>()
const store = {
  getItem: (k: string) => mem.get(k) ?? null,
  setItem: (k: string, v: string) => void mem.set(k, v),
  removeItem: (k: string) => void mem.delete(k),
  clear: () => mem.clear(),
}
// Both spellings: zustand's persist reaches for window.localStorage, and financeStore's
// own backup reader uses the bare global.
vi.stubGlobal('localStorage', store)
vi.stubGlobal('window', { location: { origin: 'http://localhost' }, localStorage: store })

const { useFinanceStore } = await import('./financeStore')

const acc = (id: string, extra: Partial<Account> = {}): Account =>
  ({ id, label: id, currency: 'COP', number: '', rate: 0, ...extra }) as Account
const ded = (id: string, extra: Partial<DeductionConfig> = {}): DeductionConfig =>
  ({ id, label: id, group: 'provision', base: 'bruto', pct: 1, enabled: true, ...extra }) as DeductionConfig

const settings = () => useFinanceStore.getState().db._settings as Settings
const seed = (s: Partial<Settings>) =>
  useFinanceStore.setState({ db: { _settings: s as Settings }, dirty: [], updatedAt: {} } as never)

beforeEach(() => { mem.clear(); seed({}) })

describe('saveAccountsConfig', () => {
  it('stamps only the account that changed', () => {
    const old = 1_000
    seed({ accounts: [acc('a', { updatedAt: old }), acc('b', { updatedAt: old })] })

    useFinanceStore.getState().saveAccountsConfig([
      acc('a', { updatedAt: old, label: 'renombrada' }),
      acc('b', { updatedAt: old }),
    ])

    const [a, b] = settings().accounts!
    // The whole point: bumping the untouched one would let this device's stale copy of
    // `b` outrank a real edit made on another device.
    expect(b.updatedAt).toBe(old)
    expect(a.updatedAt).toBeGreaterThan(old)
  })

  it('keeps the previous object identity for an unchanged account', () => {
    const before = acc('a', { updatedAt: 1_000 })
    seed({ accounts: [before] })
    useFinanceStore.getState().saveAccountsConfig([acc('a', { updatedAt: 99 })])
    // Even with a different incoming stamp: the comparison ignores updatedAt, so an
    // account whose content matches is left exactly as it was.
    expect(settings().accounts![0]).toBe(before)
  })

  it('tombstones a removed account so the union merge cannot resurrect it', () => {
    seed({ accounts: [acc('a'), acc('b')] })
    useFinanceStore.getState().saveAccountsConfig([acc('a')])
    expect(settings().deleted).toHaveProperty('account:b')
  })

  it('does not tombstone a locked account', () => {
    // Locked accounts are system-owned and cannot be deleted, so a tombstone for one
    // would be a delete instruction nobody can have issued.
    seed({ accounts: [acc('a'), acc('efectivo', { locked: true })] })
    useFinanceStore.getState().saveAccountsConfig([acc('a')])
    expect(settings().deleted ?? {}).not.toHaveProperty('account:efectivo')
  })

  it('clears the tombstone when an id comes back', () => {
    seed({ accounts: [acc('a'), acc('b')] })
    useFinanceStore.getState().saveAccountsConfig([acc('a')])
    expect(settings().deleted).toHaveProperty('account:b')
    useFinanceStore.getState().saveAccountsConfig([acc('a'), acc('b')])
    expect(settings().deleted ?? {}).not.toHaveProperty('account:b')
  })

  it('leaves `deleted` undefined rather than an empty object', () => {
    // An empty object is a value the merge has to reason about; absent is not.
    seed({ accounts: [acc('a')] })
    useFinanceStore.getState().saveAccountsConfig([acc('a'), acc('b')])
    expect(settings().deleted).toBeUndefined()
  })
})

describe('saveDeductionsConfig', () => {
  it('stamps only the deduction that changed', () => {
    const old = 1_000
    seed({ deductions: [ded('salud', { updatedAt: old }), ded('pension', { updatedAt: old })] })
    useFinanceStore.getState().saveDeductionsConfig([
      ded('salud', { updatedAt: old, pct: 12.5 }),
      ded('pension', { updatedAt: old }),
    ])
    const [s, p] = settings().deductions!
    expect(p.updatedAt).toBe(old)
    expect(s.updatedAt).toBeGreaterThan(old)
  })

  it('tombstones a removed deduction and spares a locked one', () => {
    seed({ deductions: [ded('custom'), ded('salud', { locked: true })] })
    useFinanceStore.getState().saveDeductionsConfig([])
    expect(settings().deleted).toHaveProperty('deduction:custom')
    expect(settings().deleted).not.toHaveProperty('deduction:salud')
  })

  it('keeps account and deduction tombstones in the same map without collision', () => {
    // Both write into `settings.deleted`; the type prefix is what keeps an account and a
    // deduction that share an id apart.
    seed({ accounts: [acc('x')], deductions: [ded('x')] })
    useFinanceStore.getState().saveAccountsConfig([])
    useFinanceStore.getState().saveDeductionsConfig([])
    expect(Object.keys(settings().deleted!).sort()).toEqual(['account:x', 'deduction:x'])
  })
})

describe('setSettingsScalars', () => {
  it('stamps every field it writes, and only those', () => {
    seed({ fieldUpdatedAt: { displayName: 1_000 } })
    useFinanceStore.getState().setSettingsScalars({ primaryCurrency: 'USD' })
    const s = settings()
    expect(s.primaryCurrency).toBe('USD')
    expect(s.fieldUpdatedAt!.primaryCurrency).toBeGreaterThan(1_000)
    // An untouched field keeps its old stamp — per-field LWW needs evidence of a real
    // edit, and refreshing an unedited field would fabricate it.
    expect(s.fieldUpdatedAt!.displayName).toBe(1_000)
  })

  it('writes a null secondary currency rather than dropping the field', () => {
    // null is a real answer ("no mostrar"), distinct from never having chosen.
    useFinanceStore.getState().setSettingsScalars({ secondaryCurrency: null })
    expect(settings()).toHaveProperty('secondaryCurrency', null)
  })
})

describe('acceptPrivacyPolicy', () => {
  it('records version and time', () => {
    useFinanceStore.getState().acceptPrivacyPolicy(2)
    expect(settings().privacyConsent!.version).toBe(2)
    expect(settings().privacyConsent!.acceptedAt).toBeGreaterThan(0)
  })

  it('carries no field stamp', () => {
    // Consent is merged monotonically by version, never by per-field LWW. A stamp here
    // would invite the merge to treat an older-but-newer-stamped consent as the winner.
    useFinanceStore.getState().acceptPrivacyPolicy(2)
    expect(settings().fieldUpdatedAt ?? {}).not.toHaveProperty('privacyConsent')
  })
})
