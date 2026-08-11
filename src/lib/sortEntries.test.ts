import { describe, it, expect } from 'vitest'
import { byDateAsc, byDateDesc } from '@/lib/sortEntries'

const e = (id: number, date: string) => ({ id, date })

/**
 * The reported bug: several expenses registered on the same day rendered
 * oldest-first under "Fecha: más reciente". Same-day dates compare equal, so
 * Array.sort kept insertion order — and entries are appended, so insertion
 * order is oldest-first. The id is the Date.now() of creation and breaks it.
 */
describe('month list ordering', () => {
  const sameDay = [
    e(1_000, '2026-08-10'),  // registered first
    e(2_000, '2026-08-10'),  // that afternoon  — "Tarjeta de Crédito Davibank"
    e(3_000, '2026-08-10'),  // just now        — "Cuota TC – RappiCard"
  ]

  it('puts the most recently registered first when the day is the same', () => {
    expect([...sameDay].sort(byDateDesc).map(x => x.id)).toEqual([3_000, 2_000, 1_000])
  })

  it('is the exact mirror when ascending', () => {
    expect([...sameDay].sort(byDateAsc).map(x => x.id)).toEqual([1_000, 2_000, 3_000])
  })

  it('still sorts by date first, across days', () => {
    const acrossDays = [
      e(9_000, '2026-08-01'),  // newest id, oldest date
      e(1_000, '2026-08-20'),
    ]
    expect(acrossDays.sort(byDateDesc).map(x => x.date)).toEqual(['2026-08-20', '2026-08-01'])
  })

  it('does not crash on an entry with no date', () => {
    const withUndated = [e(1_000, '2026-08-10'), { id: 2_000 } as { id: number; date?: string }]
    expect(() => [...withUndated].sort(byDateDesc)).not.toThrow()
    expect([...withUndated].sort(byDateDesc)[0].id).toBe(1_000)  // dated entries lead
  })
})
