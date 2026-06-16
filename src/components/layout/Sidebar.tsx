import { CalendarDays, BarChart2, Settings, Landmark, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import type { ViewType } from '@/types'

const NAV_ITEMS: Array<{ id: ViewType; label: string; Icon: typeof CalendarDays }> = [
  { id: 'mes',     label: 'Mes actual',    Icon: CalendarDays },
  { id: 'ano',     label: 'Resumen anual', Icon: BarChart2 },
  { id: 'cuentas', label: 'Cuentas',       Icon: Landmark },
  { id: 'config',  label: 'Configuración', Icon: Settings },
]

export function Sidebar() {
  const { view, setView, sidebarCollapsed, toggleSidebar } = useUIStore()

  return (
    <>
      {/* Desktop sidebar */}
      <nav
        className={cn(
          'hidden sm:flex flex-col h-full shrink-0 overflow-hidden',
          'bg-[var(--n-bg)] border-r border-[var(--n-border)]',
          'transition-[width] duration-200 ease-in-out',
          sidebarCollapsed ? 'w-14' : 'w-[200px]',
        )}
      >
        {/* Nav items */}
        <div className="flex flex-col gap-1 p-2 flex-1 overflow-hidden">
          {NAV_ITEMS.map(({ id, label, Icon }) => (
            <button
              key={id}
              onClick={() => setView(id)}
              title={sidebarCollapsed ? label : undefined}
              className={cn(
                'flex items-center gap-3 w-full rounded-lg border-none cursor-pointer font-[inherit]',
                'transition-[background,color] duration-150 px-3 py-2.5 bg-transparent',
                'text-[var(--n-txt3)] hover:bg-[var(--n-bg2)] hover:text-[var(--n-txt2)]',
                view === id && 'bg-[var(--n-bg2)] !text-[var(--n-txt)]',
              )}
            >
              <Icon size={17} className="shrink-0" />
              <span
                className={cn(
                  'text-[13px] font-medium whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200',
                  sidebarCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[160px]',
                )}
              >
                {label}
              </span>
            </button>
          ))}
        </div>

        {/* Collapse toggle */}
        <div className="p-2 border-t border-[var(--n-border)] shrink-0">
          <button
            onClick={toggleSidebar}
            title={sidebarCollapsed ? 'Expandir menú' : 'Colapsar menú'}
            className={cn(
              'flex items-center gap-3 w-full rounded-lg border-none cursor-pointer font-[inherit]',
              'px-3 py-2.5 bg-transparent transition-colors duration-150',
              'text-[var(--n-txt3)] hover:bg-[var(--n-bg2)] hover:text-[var(--n-txt2)]',
            )}
          >
            {sidebarCollapsed
              ? <PanelLeftOpen size={17} className="shrink-0" />
              : <PanelLeftClose size={17} className="shrink-0" />
            }
            <span
              className={cn(
                'text-[13px] font-medium whitespace-nowrap overflow-hidden transition-[opacity,max-width] duration-200',
                sidebarCollapsed ? 'opacity-0 max-w-0' : 'opacity-100 max-w-[160px]',
              )}
            >
              Colapsar
            </span>
          </button>
        </div>
      </nav>

      {/* Mobile bottom nav */}
      <nav className={cn(
        'sm:hidden fixed bottom-0 left-0 right-0 z-50',
        'flex flex-row justify-around',
        'px-4 pt-2 pb-[env(safe-area-inset-bottom)]',
        'bg-[var(--n-bg)] border-t border-[var(--n-border)]',
      )}>
        {NAV_ITEMS.map(({ id, label, Icon }) => (
          <button
            key={id}
            onClick={() => setView(id)}
            className={cn(
              'flex flex-col items-center gap-[3px] px-4 py-2 rounded-lg',
              'border-none bg-transparent cursor-pointer font-[inherit]',
              'transition-colors text-[var(--n-txt3)]',
              view === id && '!text-[var(--n-txt)]',
            )}
          >
            <Icon size={20} />
            <span className="text-[9px] font-medium">{label}</span>
          </button>
        ))}
      </nav>
    </>
  )
}
