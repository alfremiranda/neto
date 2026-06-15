import { useState, useCallback } from 'react'
import { parseMoney, formatMoney } from '@/lib/format'

interface UseMoneyInputOptions {
  decimals?: number
  initialValue?: number
}

export function useMoneyInput({ decimals = 0, initialValue = 0 }: UseMoneyInputOptions = {}) {
  const [display, setDisplay] = useState(() =>
    initialValue > 0 ? formatMoney(initialValue, decimals) : '',
  )

  const setValue = useCallback((n: number) => {
    setDisplay(n > 0 ? formatMoney(n, decimals) : '')
  }, [decimals])

  const handleChange = useCallback((raw: string) => {
    // Strip all non-numeric except comma/dot
    const stripped = raw.replace(/[^\d,]/g, '')
    if (!stripped) { setDisplay(''); return }

    const hasSeparator = stripped.includes(',')
    if (hasSeparator) {
      // Allow typing decimal part: preserve comma + up to `decimals` digits
      const [intPart, decPart = ''] = stripped.split(',')
      const formattedInt = parseInt(intPart || '0').toLocaleString('es-CO')
      if (decimals > 0) {
        setDisplay(formattedInt + ',' + decPart.slice(0, decimals))
      } else {
        setDisplay(formattedInt)
      }
    } else {
      const num = parseInt(stripped)
      if (isNaN(num)) { setDisplay(''); return }
      setDisplay(num.toLocaleString('es-CO'))
    }
  }, [decimals])

  const numericValue = parseMoney(display)

  return { display, setDisplay, setValue, handleChange, numericValue }
}
