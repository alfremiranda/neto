import { CalendarDays, BarChart2, Settings, Landmark, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from '@/components/ui/sidebar'
import type { ViewType } from '@/types'

const NAV_ITEMS: Array<{ id: ViewType; label: string; Icon: typeof CalendarDays }> = [
  { id: 'mes',     label: 'Mes actual',    Icon: CalendarDays },
  { id: 'ano',     label: 'Resumen anual', Icon: BarChart2 },
  { id: 'cuentas', label: 'Cuentas',       Icon: Landmark },
  { id: 'config',  label: 'Configuración', Icon: Settings },
]

function CollapseButton() {
  const { toggleSidebar, open } = useSidebar()
  return (
    <SidebarMenuButton tooltip={open ? 'Colapsar' : 'Expandir'} onClick={toggleSidebar}>
      {open ? <PanelLeftClose /> : <PanelLeftOpen />}
      <span>{open ? 'Colapsar' : 'Expandir'}</span>
    </SidebarMenuButton>
  )
}

export function AppSidebar() {
  const { view, setView } = useUIStore()

  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-2">
        <SidebarMenu>
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <SidebarMenuItem key={id}>
              <SidebarMenuButton
                isActive={view === id}
                tooltip={label}
                onClick={() => setView(id)}
              >
                <Icon />
                <span>{label}</span>
              </SidebarMenuButton>
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter>
        <SidebarMenu>
          <SidebarMenuItem>
            <CollapseButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>
    </Sidebar>
  )
}

export function Sidebar_MobileNav() {
  const { view, setView } = useUIStore()

  return (
    <nav className={cn(
      'sm:hidden fixed bottom-0 left-0 right-0 z-50',
      'flex flex-row justify-around',
      'px-4 pt-2 pb-[env(safe-area-inset-bottom)]',
      'bg-[var(--card)] border-t border-[var(--border)]',
    )}>
      {NAV_ITEMS.map(({ id, label, Icon }) => (
        <button
          key={id}
          onClick={() => setView(id)}
          className={cn(
            'flex flex-col items-center gap-[3px] px-4 py-2 rounded-lg',
            'border-none bg-transparent cursor-pointer font-[inherit]',
            'transition-colors text-[var(--n-txt3)]',
            view === id && '!text-[var(--foreground)]',
          )}
        >
          <Icon size={20} />
          <span className="text-[9px] font-medium">{label}</span>
        </button>
      ))}
    </nav>
  )
}
