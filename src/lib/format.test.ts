import { describe, it, expect } from 'vitest'
import { COP, USD } from './format'

describe('formato de moneda', () => {
  it('pone el signo fuera del símbolo', () => {
    // "$-45.311.067" reads as a corrupted amount, not a negative one.
    expect(COP(-45_311_067)).toBe('-$45.311.067')
    expect(USD(-1234.5)).toBe('-USD 1.234,50')
  })

  it('no cambia los positivos ni el cero', () => {
    expect(COP(45_311_067)).toBe('$45.311.067')
    expect(COP(0)).toBe('$0')
    expect(USD(1234.5)).toBe('USD 1.234,50')
    expect(USD(0)).toBe('USD 0,00')
  })

  it('no produce "-$0" al redondear un negativo diminuto', () => {
    // Math.round(-0.4) is -0 in JS, and -0 < 0 is false, so this stays "$0".
    expect(COP(-0.4)).toBe('$0')
    expect(USD(-0.001)).toBe('USD 0,00')
  })
})
