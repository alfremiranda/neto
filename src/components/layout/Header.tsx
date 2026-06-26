import { Sun, Moon, CalendarDays, LogOut, PanelLeftClose, PanelLeftOpen } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { useTheme } from '@/hooks/useTheme'
import { useAuthStore } from '@/store/authStore'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { IconButton } from '@/components/ui/icon-button'

const DAYS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function todayLabel() {
  const d = new Date()
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function UserAvatar() {
  const { user, signOut } = useAuthStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)

  useEffect(() => {
    if (!open) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open])

  if (!user) return null

  const avatarUrl = user.user_metadata?.avatar_url as string | undefined
  const name = (user.user_metadata?.full_name ?? user.user_metadata?.user_name ?? user.email ?? '') as string
  const initials = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(v => !v)}
        aria-label="Cuenta"
        className="w-8 h-8 rounded-full overflow-hidden border-2 border-[var(--border)] hover:border-[var(--primary)] transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[var(--ring)] cursor-pointer"
      >
        {avatarUrl
          ? <img src={avatarUrl} alt={name} className="w-full h-full object-cover" />
          : <span className="w-full h-full flex items-center justify-center bg-[var(--muted)] text-[10px] font-bold">{initials}</span>
        }
      </button>

      {open && (
        <div className="absolute right-0 top-10 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[var(--border)]">
            <div className="text-xs font-medium truncate">{name}</div>
            <div className="text-[11px] text-muted-foreground truncate">{user.email}</div>
          </div>
          <Button
            variant="ghost"
            onClick={() => { setOpen(false); signOut() }}
            className="w-full justify-start gap-2 px-3 py-2.5 h-auto text-sm rounded-none"
          >
            <LogOut size={14} className="text-muted-foreground" />
            Cerrar sesión
          </Button>
        </div>
      )}
    </div>
  )
}

function SidebarToggle() {
  const { toggleSidebar, state } = useSidebar()
  const collapsed = state === 'collapsed'
  return (
    <button
      onClick={toggleSidebar}
      aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
      className="hidden sm:flex p-[9px] rounded-lg text-[var(--muted-foreground)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors border-0 bg-transparent cursor-pointer shrink-0"
    >
      {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
    </button>
  )
}

export function Header() {
  const { trm, fresh } = useLiveTRM()
  const { theme, toggle } = useTheme()

  const trmFormatted = trm
    ? trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

  return (
    <header
      className="flex items-center justify-between gap-2 px-4 shrink-0 bg-[var(--card)] border-b border-[var(--border)]"
      style={{ paddingTop: 'env(safe-area-inset-top)', height: 'calc(54px + env(safe-area-inset-top))' }}
    >
      {/* Left: sidebar toggle (desktop) + logo */}
      <div className="flex items-center gap-3">
        <SidebarToggle />
        <span className="text-base font-bold font-heading tracking-tight text-[var(--foreground)] select-none">Neto</span>
        <span className={
          import.meta.env.DEV
            ? 'text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-amber-500/15 text-amber-500 select-none'
            : 'text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-[var(--color-income)]/15 text-[var(--color-income-txt)] select-none'
        }>
          {import.meta.env.DEV ? 'dev' : 'prod'}
        </span>
      </div>

      {/* Right: chips + actions */}
      <div className="flex items-center gap-2">
        {/* Date chip — desktop only */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-[5px] rounded-lg border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] whitespace-nowrap select-none">
          <CalendarDays size={11} className="shrink-0" />
          <span>{todayLabel()}</span>
        </div>

        {/* TRM chip */}
        {trm && (
          <div
            title={fresh ? 'TRM en vivo (Banco República)' : 'TRM desde caché (< 8h)'}
            className="flex items-center gap-1 px-2 py-1 rounded-lg bg-[var(--muted)] text-[11px] whitespace-nowrap select-none"
          >
            <span className="relative flex h-[7px] w-[7px] shrink-0">
              {fresh && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-provision)] opacity-75 animate-ping" />
              )}
              <span
                className="relative inline-flex h-[7px] w-[7px] rounded-full"
                style={{ background: fresh ? 'var(--color-provision)' : 'var(--color-tax)' }}
              />
            </span>
            <span className="text-[var(--muted-foreground)] opacity-70">TRM</span>
            <span className="text-[var(--muted-foreground)]">{trmFormatted}</span>
          </div>
        )}

        {/* Divider */}
        <span className="block w-px h-5 bg-[var(--border)]" />

        {/* Theme toggle */}
        <IconButton
          variant="ghost"
          size="lg"
          onClick={toggle}
          aria-label={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
        >
          {theme === 'dark' ? <Sun size={16} /> : <Moon size={16} />}
        </IconButton>

        <UserAvatar />
      </div>
    </header>
  )
}
