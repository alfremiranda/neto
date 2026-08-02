import { describe, it, expect } from 'vitest'
// ?raw so the test never evaluates the module: devPreview reads window.location at
// import time and would fail under the node environment.
import source from './devPreview.ts?raw'
import { EGRESO_CATEGORIAS } from '@/data/defaults'

/**
 * The ?preview fixture invents its own entries, so nothing stops it referencing a
 * category the app cannot resolve. When that happened, three expense rows rendered
 * with no icon and ragged indentation — which read as a product bug in a screenshot
 * rather than as bad test data. Cheaper to catch here.
 */
describe('devPreview fixture', () => {
  const valid = new Set(EGRESO_CATEGORIAS.map(c => c.id))

  it('only uses category ids the app defines', () => {
    const used = [...source.matchAll(/category:\s*'([^']+)'/g)].map(m => m[1])
    expect(used.length).toBeGreaterThan(0)
    expect(used.filter(c => !valid.has(c))).toEqual([])
  })

  it('only uses account ids the fixture itself seeds', () => {
    // accounts come from TRANSFER_ACCOUNTS, so any `account:` must be one of those ids
    const used = [...source.matchAll(/account:\s*'([^']+)'/g)].map(m => m[1])
    const seeded = new Set(['ARQ', 'Toptal', 'Bancolombia', 'NU', 'Nequi', 'Efectivo'])
    expect(used.filter(a => !seeded.has(a))).toEqual([])
  })
})
