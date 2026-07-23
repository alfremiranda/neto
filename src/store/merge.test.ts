import { describe, it, expect } from 'vitest'
import { mergeList, mergeMonth, localHasExtra, type Stamped } from './merge'
import type { MonthData, Income } from '@/types'

// ─── Characterization tests ───────────────────────────────────────────────────
// These FREEZE the current behaviour of the sync merge engine as it shipped —
// they are the safety net that was referenced but never committed. They assert
// what the code does today so later refactors (string ids, per-field settings)
// can prove they change nothing here. Timestamp-TIE behaviour is deliberately
// left un-asserted: it has two pre-existing convergence quirks (documented in
// the branch discussion) that must be decided on purpose, not frozen by accident.

// Minimal stamped entry for the generic mergeList (extra fields are ignored).
type Entry = Stamped & { v?: string }
const e = (id: number, updatedAt?: number, v?: string): Entry => ({ id, updatedAt, v })

const income = (id: number, updatedAt?: number, desc = ''): Income => ({
  id, desc, amount: 0, currency: 'COP', account: 'x', tipo: 'otro', updatedAt,
})

const month = (m: Partial<MonthData> = {}): MonthData => ({
  trm: 3000, incomes: [], transfers: [], egresos: [], ...m,
})

describe('mergeList — characterization', () => {
  it('unions entries by id across local and cloud', () => {
    const out = mergeList('income', [e(1, 100)], [e(2, 100)], {}, 0, 0)
    expect(out.map(x => x.id)).toEqual([1, 2])
  })

  it('newest updatedAt wins per entry (cloud strictly newer)', () => {
    const out = mergeList('income', [e(1, 100, 'old')], [e(1, 200, 'new')], {}, 0, 0)
    expect(out).toEqual([e(1, 200, 'new')])
  })

  it('newest updatedAt wins per entry (local strictly newer)', () => {
    const out = mergeList('income', [e(1, 300, 'new')], [e(1, 200, 'old')], {}, 0, 0)
    expect(out).toEqual([e(1, 300, 'new')])
  })

  it('falls back to the month-level ms when an entry has no updatedAt', () => {
    // local entry unstamped → ts = localMs (500); cloud stamped at 200 → local wins.
    const out = mergeList('income', [e(1, undefined, 'local')], [e(1, 200, 'cloud')], {}, 500, 0)
    expect(out).toEqual([e(1, undefined, 'local')])
  })

  it('a tombstone whose time ≥ the entry ts removes it (delete propagates)', () => {
    const out = mergeList('income', [e(1, 100)], [], { 'income:1': 100 }, 0, 0)
    expect(out).toEqual([])
  })

  it('an edit newer than the tombstone survives (resurrection)', () => {
    const out = mergeList('income', [e(1, 200, 'edited-after-delete')], [], { 'income:1': 100 }, 0, 0)
    expect(out).toEqual([e(1, 200, 'edited-after-delete')])
  })

  it('output is sorted by id regardless of input order (deterministic)', () => {
    // Real entries always carry a non-zero ts; an effective ts of 0 collides with
    // the default-0 tombstone check (`(del ?? 0) >= ts`) and is treated as deleted.
    const out = mergeList('income', [e(30, 100), e(10, 100), e(20, 100)], [e(5, 100), e(25, 100)], {}, 0, 0)
    expect(out.map(x => x.id)).toEqual([5, 10, 20, 25, 30])
  })
})

describe('mergeList — string ids (accounts/deductions) sort by code point, not locale', () => {
  const s = (id: string, updatedAt = 100) => ({ id, updatedAt })

  it('orders string ids by code point regardless of runtime locale', () => {
    // Ids chosen so locale collation (e.g. es-CO) would disagree with code-point
    // order: locales sort "a" before "A" and cluster "á" with "a"; code point puts
    // all uppercase before all lowercase and "á" (U+00E1) after ASCII letters.
    const ids = ['b', 'A', 'Z', 'a', '10', '2', 'á']
    const out = mergeList('acct', ids.map(id => s(id)), [], {}, 0, 0).map(x => x.id)

    const codePoint = [...ids].sort((x, y) => (x < y ? -1 : x > y ? 1 : 0))
    expect(out).toEqual(codePoint)
    // Explicit invariants a localeCompare implementation would break:
    expect(out.indexOf('10')).toBeLessThan(out.indexOf('2'))  // '1' < '2' by code point
    expect(out.indexOf('A')).toBeLessThan(out.indexOf('a'))   // uppercase before lowercase
    expect(out.indexOf('Z')).toBeLessThan(out.indexOf('a'))   // all ASCII upper before lower
  })

  it('unions, newest-wins and tombstones work identically with string ids', () => {
    const out = mergeList(
      'acct',
      [s('efectivo', 100), s('arq', 300)],
      [s('efectivo', 200), s('bancol', 100)],
      { 'acct:arq': 400 },                       // tombstone newer than arq's edit → removed
      0, 0,
    )
    expect(out.map(x => x.id)).toEqual(['bancol', 'efectivo'])  // arq deleted, sorted
    expect(out.find(x => x.id === 'efectivo')?.updatedAt).toBe(200)  // cloud newer wins
  })
})

describe('mergeMonth — characterization', () => {
  it('merges incomes, egresos and transfers independently', () => {
    const local = month({ incomes: [income(1, 100)], egresos: [] })
    const cloud = month({ incomes: [income(2, 100)], egresos: [] })
    const out = mergeMonth(local, cloud, 0, 0)
    expect(out.incomes.map(i => i.id)).toEqual([1, 2])
  })

  it('propagates a delete carried as a cloud tombstone', () => {
    const local = month({ incomes: [income(1, 100)] })
    const cloud = month({ incomes: [], deleted: { 'income:1': 200 } })
    const out = mergeMonth(local, cloud, 0, 0)
    expect(out.incomes).toEqual([])
    expect(out.deleted).toEqual({ 'income:1': 200 })
  })

  it('leaves `deleted` undefined when there are no tombstones', () => {
    const out = mergeMonth(month({ incomes: [income(1, 100)] }), month(), 0, 0)
    expect(out.deleted).toBeUndefined()
  })

  it('scalars come from the side with the newer month ms', () => {
    const local = month({ trm: 3000 })
    const cloud = month({ trm: 3100 })
    expect(mergeMonth(local, cloud, 100, 200).trm).toBe(3100) // cloud newer
    expect(mergeMonth(local, cloud, 200, 100).trm).toBe(3000) // local newer
  })

  it('only adds voluntarias when either side has them', () => {
    expect(mergeMonth(month(), month(), 0, 0).voluntarias).toBeUndefined()
    const withVol = mergeMonth(month({ voluntarias: [] }), month(), 0, 0)
    expect(withVol.voluntarias).toEqual([])
  })
})

describe('localHasExtra — characterization', () => {
  it('true when the local month ms is newer', () => {
    expect(localHasExtra(month(), month(), 200, 100)).toBe(true)
  })

  it('true when local has an entry the cloud lacks', () => {
    const local = month({ incomes: [income(1, 100)] })
    expect(localHasExtra(local, month(), 0, 0)).toBe(true)
  })

  it('true when a shared entry is newer locally', () => {
    const local = month({ incomes: [income(1, 200)] })
    const cloud = month({ incomes: [income(1, 100)] })
    expect(localHasExtra(local, cloud, 0, 0)).toBe(true)
  })

  it('true when local holds a newer tombstone', () => {
    const local = month({ deleted: { 'income:1': 200 } })
    const cloud = month({ deleted: { 'income:1': 100 } })
    expect(localHasExtra(local, cloud, 0, 0)).toBe(true)
  })

  it('false when local is an older subset of cloud', () => {
    const local = month({ incomes: [income(1, 100)] })
    const cloud = month({ incomes: [income(1, 100), income(2, 100)] })
    expect(localHasExtra(local, cloud, 100, 200)).toBe(false)
  })
})

describe('convergence — two devices reach the same state (distinct month ms)', () => {
  it('mergeMonth is order-independent when the month ms differ', () => {
    const A = month({ trm: 3000, incomes: [income(1, 100, 'A-old'), income(2, 200, 'A-only')] })
    const B = month({ trm: 3100, incomes: [income(1, 150, 'B-new'), income(3, 300, 'B-only')] })

    // Device X: local A, pulled cloud B.  Device Y: local B, pulled cloud A.
    const x = mergeMonth(A, B, 1000, 2000)
    const y = mergeMonth(B, A, 2000, 1000)

    expect(x).toEqual(y)
    expect(x.incomes.map(i => i.id)).toEqual([1, 2, 3])
    expect(x.incomes.find(i => i.id === 1)?.desc).toBe('B-new') // 150 > 100
    expect(x.trm).toBe(3100)                                    // newer month ms side
  })
})
