import type { TRMCache } from '@/types'

const TRM_CACHE_KEY = 'neto-trm-live'
const TRM_CACHE_TTL = 8 * 3600 * 1000 // 8 horas

export function getCachedLiveTRM(): TRMCache | null {
  try {
    const c = JSON.parse(localStorage.getItem(TRM_CACHE_KEY) || 'null') as TRMCache | null
    if (c && (Date.now() - c.ts) < TRM_CACHE_TTL) return c
  } catch (_) { /* silent */ }
  return null
}

export function setCachedLiveTRM(trm: number, source: string): void {
  try {
    localStorage.setItem(TRM_CACHE_KEY, JSON.stringify({ trm, source, ts: Date.now() }))
  } catch (_) { /* silent */ }
}

function abortIn(ms: number): AbortSignal {
  const c = new AbortController()
  setTimeout(() => c.abort(), ms)
  return c.signal
}

export async function fetchLiveTRM(): Promise<{ trm: number; source: string } | null> {
  // Fuente primaria: TRM oficial Banco de la República
  try {
    const res = await fetch(
      'https://www.datos.gov.co/resource/mcec-87by.json?$limit=1&$order=vigenciadesde+DESC',
      { signal: abortIn(6000) },
    )
    if (res.ok) {
      const [row] = await res.json() as Array<{ valor?: string }>
      if (row?.valor) {
        const trm = parseFloat(row.valor)
        setCachedLiveTRM(trm, 'Banco de la República')
        return { trm, source: 'Banco de la República' }
      }
    }
  } catch (_) { /* fallback */ }

  // Fallback: open exchange rates
  try {
    const res = await fetch('https://open.er-api.com/v6/latest/USD', { signal: abortIn(6000) })
    if (res.ok) {
      const data = await res.json() as { rates?: { COP?: number } }
      if (data.rates?.COP) {
        const trm = Math.round(data.rates.COP * 100) / 100
        setCachedLiveTRM(trm, 'ExchangeRate')
        return { trm, source: 'ExchangeRate' }
      }
    }
  } catch (_) { /* silent */ }

  return null
}
