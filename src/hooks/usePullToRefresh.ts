import { useEffect, useRef, useState } from 'react'

export const PTR_THRESHOLD = 72  // dampened px needed to trigger refresh

export function usePullToRefresh(
  scrollRef: React.RefObject<HTMLElement | null>,
  onRefresh: () => Promise<void>,
  disabled = false,
) {
  const [pullY, setPullY]           = useState(0)
  const [refreshing, setRefreshing] = useState(false)
  const [isPulling, setIsPulling]   = useState(false)

  const startY  = useRef(0)
  const active  = useRef(false)
  const pullRef = useRef(0)

  useEffect(() => {
    const el = scrollRef.current
    if (!el || disabled) return

    function onTouchStart(e: TouchEvent) {
      if (el.scrollTop > 2) return
      startY.current = e.touches[0].clientY
      active.current = true
    }

    function onTouchMove(e: TouchEvent) {
      if (!active.current) return
      if (el.scrollTop > 2) { active.current = false; return }
      const dy = e.touches[0].clientY - startY.current
      if (dy <= 0) {
        active.current = false
        pullRef.current = 0
        setPullY(0)
        setIsPulling(false)
        return
      }
      // Rubber-band curve: aggressive damping so it never feels "heavy"
      const d = Math.min(Math.pow(dy, 0.65) * 3.2, PTR_THRESHOLD * 1.3)
      pullRef.current = d
      setPullY(d)
      setIsPulling(true)
    }

    function onTouchEnd() {
      if (!active.current) return
      active.current = false
      setIsPulling(false)
      if (pullRef.current >= PTR_THRESHOLD) {
        setRefreshing(true)
        setPullY(PTR_THRESHOLD * 0.6)
        pullRef.current = 0
        onRefresh().finally(() => {
          setRefreshing(false)
          setPullY(0)
        })
      } else {
        pullRef.current = 0
        setPullY(0)
      }
    }

    el.addEventListener('touchstart', onTouchStart, { passive: true })
    el.addEventListener('touchmove',  onTouchMove,  { passive: true })
    el.addEventListener('touchend',   onTouchEnd,   { passive: true })

    return () => {
      el.removeEventListener('touchstart', onTouchStart)
      el.removeEventListener('touchmove',  onTouchMove)
      el.removeEventListener('touchend',   onTouchEnd)
    }
  }, [disabled, onRefresh, scrollRef])

  return { pullY, refreshing, isPulling }
}
