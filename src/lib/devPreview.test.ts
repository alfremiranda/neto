import { describe, it, expect } from 'vitest'
// ?raw so the test never evaluates the module: devPreview reads window.location at
// import time and would fail under the node environment.
import source from './devPreview.ts?raw'
import { EGRESO_CATEGORIAS, TRANSFER_ACCOUNTS } from '@/data/defaults'

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
    // Derived, not hardcoded: the first cut listed the ids by hand and failed the
    // moment a credit card was added to the fixture, which is a maintenance
    // failure rather than the bug this guards against.
    const seeded = new Set([
      ...TRANSFER_ACCOUNTS.map(a => a.id),
      ...[...source.matchAll(/\{\s*id:\s*'([^']+)',\s*label:/g)].map(m => m[1]),
    ])
    const used = [...source.matchAll(/account:\s*'([^']+)'/g)].map(m => m[1])
    expect(used.filter(a => !seeded.has(a))).toEqual([])
  })
})
