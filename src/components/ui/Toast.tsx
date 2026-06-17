import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export function Toast() {
  const toastMsg = useUIStore(s => s.toastMsg)

  return (
    <div
      className={cn(
        'fixed left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--card)] px-5 py-[10px] rounded-[20px] text-[13px]',
        'opacity-0 pointer-events-none transition-opacity duration-300 z-[99]',
        // Mobile: above bottom nav
        'bottom-6 sm:bottom-6',
        '[.has-mobile-nav_&]:bottom-[calc(68px+env(safe-area-inset-bottom)+10px)]',
        toastMsg && 'opacity-100',
      )}
    >
      {toastMsg}
    </div>
  )
}
