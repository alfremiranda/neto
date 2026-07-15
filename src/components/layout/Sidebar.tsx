import { CalendarDays, LayoutDashboard, WalletCards, PiggyBank } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import {
  Sidebar,
  SidebarContent,
  useSidebar,
} from '@/components/ui/sidebar'
import { Tooltip, TooltipContent, TooltipTrigger } from '@/components/ui/tooltip'
import type { ViewType } from '@/types'

const NAV_ITEMS: Array<{ id: ViewType; label: string; mobileLabel: string; Icon: typeof CalendarDays }> = [
  { id: 'dashboard', label: 'Resumen',       mobileLabel: 'Resumen',       Icon: LayoutDashboard },
  { id: 'mes',     label: 'Mes',           mobileLabel: 'Mes',           Icon: CalendarDays },
  { id: 'cuentas', label: 'Cuentas',       mobileLabel: 'Cuentas',       Icon: WalletCards },
  { id: 'ahorros', label: 'Ahorros',       mobileLabel: 'Ahorros',       Icon: PiggyBank },
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
    <nav
      className="sm:hidden w-full flex shrink-0 bg-[var(--card)] border-t border-[var(--border)]"
      style={{ paddingBottom: 'env(safe-area-inset-bottom)' }}
    >
      {NAV_ITEMS.map(({ id, mobileLabel, Icon }) => {
        const active = view === id
        return (
          <button
            key={id}
            onClick={() => setView(id)}
            aria-label={mobileLabel}
            aria-current={active ? 'page' : undefined}
            className={cn(
              'flex-1 flex flex-col items-center justify-center gap-1 pt-3 pb-1',
              'border-none bg-transparent cursor-pointer font-[inherit] transition-colors',
              active
                ? 'text-[var(--sidebar-primary)]'
                : 'text-[var(--n-txt3)] hover:text-[var(--muted-foreground)]',
            )}
          >
            <Icon size={20} strokeWidth={active ? 2 : 1.75} />
            <span className="text-[9px] font-medium leading-[14px] tracking-[0] select-none">
              {mobileLabel}
            </span>
          </button>
        )
      })}
    </nav>
  )
}
