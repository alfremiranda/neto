import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

export function Toast() {
  const toastMsg = useUIStore(s => s.toastMsg)

  return (
    <div
      className={cn(
        'fixed left-1/2 -translate-x-1/2 bg-[var(--foreground)] text-[var(--card)] px-5 py-[10px] rounded-[20px] text-[13px]',
        // z above the drawer (overlay z-100 / content z-101) so toasts stay visible over an open sheet
        'opacity-0 translate-y-2 pointer-events-none transition-[opacity,transform] duration-300 z-[110]',
        // Mobile: above bottom nav
        'bottom-6 sm:bottom-6',
        '[.has-mobile-nav_&]:bottom-[calc(68px+env(safe-area-inset-bottom)+10px)]',
        toastMsg && 'opacity-100 translate-y-0',
      )}
    >
      {toastMsg}
    </div>
  )
}
