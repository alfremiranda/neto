import { useState, useEffect } from 'react'
import { useFinanceStore } from '@/store/financeStore'

export function useHasHydrated() {
  const [hydrated, setHydrated] = useState(() => useFinanceStore.persist.hasHydrated())

  useEffect(() => {
    if (hydrated) return
    const unsub = useFinanceStore.persist.onFinishHydration(() => setHydrated(true))
    // Re-check in case it hydrated between useState init and useEffect
    if (useFinanceStore.persist.hasHydrated()) setHydrated(true)
    return unsub
  }, [hydrated])

  return hydrated
}
