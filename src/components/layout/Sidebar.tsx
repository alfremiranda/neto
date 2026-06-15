import { CalendarDays, BarChart2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import type { ViewType } from '@/types'

const NAV_ITEMS: Array<{ id: ViewType; label: string; Icon: typeof CalendarDays }> = [
  { id: 'mes', label: 'Mes',  Icon: CalendarDays },
  { id: 'ano', label: 'Año',  Icon: BarChart2 },
]

export function Sidebar() {
  const { view, setView } = useUIStore()

  return (
    <nav
      className={cn(
        // Desktop: vertical sidebar
        'hidden sm:flex sm:flex-col sm:gap-1 sm:w-[68px] sm:shrink-0 sm:sticky sm:top-3 sm:py-0.5',
        // Mobile: fixed bottom nav
        'fixed bottom-0 left-0 right-0 w-full flex flex-row justify-around',
        'px-4 pb-[env(safe-area-inset-bottom)] pt-2',
        'bg-[var(--n-bg)] border-t border-[var(--n-border)] z-50',
        'sm:bg-transparent sm:border-0 sm:pb-0 sm:pt-0',
      )}
    >
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={cn(
            'flex flex-col items-center gap-[3px] rounded-lg',
            'border-none bg-transparent text-[var(--n-txt3)] cursor-pointer font-[inherit]',
            'transition-[background,color] duration-150',
            'hover:bg-[var(--n-bg2)] hover:text-[var(--n-txt2)]',
            // Desktop sizing
            'sm:w-full sm:px-1 sm:py-[10px]',
            // Mobile sizing
            'px-7 py-2',
            view === id && 'bg-[var(--n-bg2)] !text-[var(--n-txt)]',
          )}
        >
          <Icon size={22} />
          <span className="text-[10px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
