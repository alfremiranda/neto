import { useState, useEffect } from 'react'
import { getCachedLiveTRM, fetchLiveTRM } from '@/lib/trm'

interface TRMState {
  trm: number | null
  source: string | null
  fresh: boolean
}

export function useLiveTRM() {
  const [state, setState] = useState<TRMState>(() => {
    const cached = getCachedLiveTRM()
    return cached ? { trm: cached.trm, source: cached.source, fresh: false } : { trm: null, source: null, fresh: false }
  })

  useEffect(() => {
    fetchLiveTRM().then(result => {
      if (result) setState({ trm: result.trm, source: result.source, fresh: true })
    })
  }, [])

  return state
}
