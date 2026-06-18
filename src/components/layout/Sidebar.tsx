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
  SidebarRail,
  useSidebar,
} from '@/components/ui/sidebar'
import type { ViewType } from '@/types'

const NAV_ITEMS: Array<{ id: ViewType; label: string; Icon: typeof CalendarDays }> = [
  { id: 'mes',     label: 'Mes actual',    Icon: CalendarDays },
  { id: 'ano',     label: 'Resumen anual', Icon: BarChart2 },
  { id: 'cuentas', label: 'Cuentas',       Icon: Landmark },
  { id: 'config',  label: 'Configuración', Icon: Settings },
]

// Wrap each nav button inside useSidebar context so tooltip is only active when collapsed
function NavButton({ id, label, Icon }: { id: ViewType; label: string; Icon: typeof CalendarDays }) {
  const { view, setView } = useUIStore()
  const { state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <SidebarMenuButton
      isActive={view === id}
      tooltip={collapsed ? label : undefined}
      onClick={() => setView(id)}
      className="h-10 text-sm"
    >
      <Icon />
      <span>{label}</span>
    </SidebarMenuButton>
  )
}

function CollapseButton() {
  const { toggleSidebar, state } = useSidebar()
  const collapsed = state === 'collapsed'

  return (
    <SidebarMenuButton
      tooltip={collapsed ? 'Expandir' : undefined}
      onClick={toggleSidebar}
      className="h-10 text-sm"
    >
      {collapsed ? <PanelLeftOpen /> : <PanelLeftClose />}
      <span>{collapsed ? 'Expandir' : 'Colapsar'}</span>
    </SidebarMenuButton>
  )
}

export function AppSidebar() {
  return (
    <Sidebar collapsible="icon">
      <SidebarContent className="pt-3">
        <SidebarMenu className="gap-0.5 px-2">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <SidebarMenuItem key={id}>
              <NavButton id={id} label={label} Icon={Icon} />
            </SidebarMenuItem>
          ))}
        </SidebarMenu>
      </SidebarContent>

      <SidebarFooter className="pb-3">
        <SidebarMenu className="px-2">
          <SidebarMenuItem>
            <CollapseButton />
          </SidebarMenuItem>
        </SidebarMenu>
      </SidebarFooter>

      <SidebarRail />
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
