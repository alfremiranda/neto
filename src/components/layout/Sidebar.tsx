import { CalendarDays, PieChart, Settings2, WalletCards } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ViewType } from '@/types'

const NAV_ITEMS: Array<{ id: ViewType; label: string; Icon: typeof CalendarDays }> = [
  { id: 'mes',     label: 'Mes actual',    Icon: CalendarDays },
  { id: 'ano',     label: 'Resumen anual', Icon: PieChart },
  { id: 'cuentas', label: 'Cuentas',       Icon: WalletCards },
  { id: 'config',  label: 'Configuración', Icon: Settings2 },
]

function NavButton({ id, label, Icon }: { id: ViewType; label: string; Icon: typeof CalendarDays }) {
  const { view, setView } = useUIStore()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'
  const active = view === id

  const btn = (
    <button
      onClick={() => setView(id)}
      className={cn(
        'flex w-full items-center h-10 rounded-[12px] overflow-hidden transition-colors cursor-pointer border-0 bg-transparent font-[inherit]',
        collapsed ? 'p-[12px] gap-0 justify-start' : 'px-3 py-2 gap-2',
        active
          ? 'bg-[var(--sidebar-primary)] text-[var(--sidebar-primary-foreground)] hover:bg-[var(--sidebar-primary)] hover:text-[var(--sidebar-primary-foreground)]'
          : 'text-[var(--sidebar-foreground)] hover:bg-[var(--sidebar-accent)] hover:text-[var(--sidebar-accent-foreground)]',
      )}
    >
      <Icon size={16} className="shrink-0" />
      {!collapsed && <span className="text-sm font-medium truncate">{label}</span>}
    </button>
  )

  if (!collapsed) return btn

  return (
    <Tooltip>
      <TooltipTrigger asChild>{btn}</TooltipTrigger>
      <TooltipContent side="right">{label}</TooltipContent>
    </Tooltip>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-3">
        <div className="flex flex-col gap-2 px-3">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <NavButton key={id} id={id} label={label} Icon={Icon} />
          ))}
        </div>
      </SidebarContent>
    </Sidebar>
  )
}

export function Sidebar_MobileNav() {
  const { view, setView } = useUIStore()

  return (
    <nav className={cn(
      'sm:hidden fixed bottom-0 left-0 right-0 z-50',
      'flex flex-row justify-around',
      'px-2 pt-1.5 pb-[env(safe-area-inset-bottom)]',
      'bg-[var(--card)] border-t border-[var(--border)]',
    )}>
      {NAV_ITEMS.map(({ id, label, Icon }) => {
        const active = view === id
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              'relative flex flex-col items-center gap-[3px] px-4 py-2 rounded-lg',
              'border-none bg-transparent cursor-pointer font-[inherit]',
              'transition-colors min-w-[44px] min-h-[44px]',
              active
                ? 'text-[var(--primary)]'
                : 'text-[var(--muted-foreground)] hover:text-[var(--foreground)]',
            )}
          >
            {active && (
              <span className="absolute top-0 left-1/2 -translate-x-1/2 w-4 h-[2px] rounded-full bg-[var(--primary)]" />
            )}
            <Icon size={20} />
            <span className="text-[9px] font-medium">{label}</span>
          </button>
        )
      })}
    </nav>
  )
}
