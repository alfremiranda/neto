import { Sun, Moon, CalendarDays, LogOut, PanelLeftClose, PanelLeftOpen, UserRound, Bell, X, Settings2 } from 'lucide-react'
import { useState, useRef, useEffect } from 'react'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { useTheme } from '@/hooks/useTheme'
import { useNotifications } from '@/hooks/useNotifications'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { useSidebar } from '@/components/ui/sidebar'
import { Button } from '@/components/ui/button'
import { Avatar } from '@/components/ui/Avatar'
import { IconButton } from '@/components/ui/icon-button'
import { Drawer, DrawerContent, DrawerHeader, DrawerTitle, DrawerBody } from '@/components/ui/drawer'

function NotificationBell() {
  const { count } = useNotifications()
  const openSheet = useUIStore(s => s.openSheet)
  return (
    <div className="relative">
      <IconButton variant="ghost" size="lg" onClick={() => openSheet('notifications')} aria-label={count > 0 ? `Notificaciones (${count})` : 'Notificaciones'}>
        <Bell size={16} />
      </IconButton>
      {count > 0 && (
        <span className="absolute top-0.5 right-0.5 min-w-[15px] h-[15px] px-1 rounded-full bg-[var(--primary)] text-[var(--primary-foreground)] ts-label-badge flex items-center justify-center pointer-events-none">
          {count > 9 ? '9+' : count}
        </span>
      )}
    </div>
  )
}

const DAYS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function todayLabel() {
  const d = new Date()
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

function UserAvatar() {
  const { user, signOut } = useAuthStore()
  const displayName = useSettingsStore(s => s.displayName)
  const { setView } = useUIStore()
  const [open, setOpen] = useState(false)
  const ref = useRef<HTMLDivElement>(null)
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches
  )

  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])

  // Desktop dropdown: close on outside click
  useEffect(() => {
    if (!open || !isDesktop) return
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false)
    }
    document.addEventListener('mousedown', onClickOutside)
    return () => document.removeEventListener('mousedown', onClickOutside)
  }, [open, isDesktop])

  if (!user) return null

  const avatarUrl  = user.user_metadata?.avatar_url as string | undefined
  const oauthName  = (user.user_metadata?.full_name ?? user.user_metadata?.user_name ?? user.email ?? '') as string
  const name       = displayName.trim() || oauthName
  const initials   = name.split(' ').map((w: string) => w[0]).join('').slice(0, 2).toUpperCase()

  const goProfile = () => { setOpen(false); setView('profile') }
  const goConfig  = () => { setOpen(false); setView('config') }
  const doSignOut = () => { setOpen(false); signOut() }

  const trigger = (
    <IconButton
      variant="ghost"
      size="lg"
      onClick={() => setOpen(v => !v)}
      aria-label="Cuenta"
      aria-haspopup="menu"
      aria-expanded={open}
      className="p-0 hover:opacity-80"
    >
      <Avatar size="sm" src={avatarUrl} name={name} initials={initials} />
    </IconButton>
  )

  // Mobile: bottom sheet (matches the app sheet pattern + native focus trap/a11y from vaul)
  if (!isDesktop) {
    return (
      <>
        {trigger}
        <Drawer open={open} onOpenChange={setOpen} direction="bottom" noBodyStyles>
          <DrawerContent className="inset-x-0 bottom-0 rounded-t-2xl">
            <div data-vaul-handle className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-[var(--border)] shrink-0" />
            <DrawerHeader>
              <DrawerTitle>Cuenta</DrawerTitle>
              <IconButton
                variant="ghost"
                size="lg"
                onClick={() => setOpen(false)}
                aria-label="Cerrar"
              >
                <X size={16} />
              </IconButton>
            </DrawerHeader>
            <DrawerBody className="pb-[max(1.5rem,env(safe-area-inset-bottom))]">
              <div className="flex items-center gap-3 pb-4 mb-2 border-b border-[var(--border)]">
                {/* 44px is off the 32·40·48·56 scale. Held at 44 until Design
                    picks the rung — see Q-2026-08-17-avatar-off-scale. */}
                <Avatar size="md" src={avatarUrl} name={name} initials={initials}
                        className="w-11 h-11 text-[length:var(--avatar-font-size-md)]" />
                <div className="min-w-0">
                  <div className="ts-body-base-emphasis truncate">{name}</div>
                  <div className="ts-body-small text-muted-foreground truncate">{user.email}</div>
                </div>
              </div>
              <Button variant="ghost" onClick={goProfile} className="w-full justify-start gap-3 px-2 py-3 h-auto rounded-xl">
                <UserRound size={16} className="text-muted-foreground shrink-0" />
                Mi perfil
              </Button>
              <Button variant="ghost" onClick={goConfig} className="w-full justify-start gap-3 px-2 py-3 h-auto rounded-xl">
                <Settings2 size={16} className="text-muted-foreground shrink-0" />
                Configuración
              </Button>
              <Button variant="ghost-danger" onClick={doSignOut} className="w-full justify-start gap-3 px-2 py-3 h-auto rounded-xl">
                <LogOut size={16} className="shrink-0" />
                Cerrar sesión
              </Button>
            </DrawerBody>
          </DrawerContent>
        </Drawer>
      </>
    )
  }

  // Desktop dropdown
  return (
    <div ref={ref} className="relative">
      {trigger}

      {open && (
        <div role="menu" className="absolute right-0 top-10 w-52 rounded-xl border border-[var(--border)] bg-[var(--card)] shadow-lg z-50 overflow-hidden">
          <div className="px-3 py-2.5 border-b border-[var(--border)]">
            <div className="ts-body-small-emphasis truncate">{name}</div>
            <div className="ts-detail-large text-muted-foreground truncate">{user.email}</div>
          </div>
          <Button
            variant="ghost"
            onClick={goProfile}
            className="w-full justify-start gap-2 px-3 py-2.5 h-auto rounded-none"
          >
            <UserRound size={14} className="text-muted-foreground" />
            Mi perfil
          </Button>
          <Button
            variant="ghost"
            onClick={goConfig}
            className="w-full justify-start gap-2 px-3 py-2.5 h-auto rounded-none"
          >
            <Settings2 size={14} className="text-muted-foreground" />
            Configuración
          </Button>
          <Button
            variant="ghost"
            onClick={doSignOut}
            className="w-full justify-start gap-2 px-3 py-2.5 h-auto rounded-none text-btn-danger-fg hover:bg-btn-danger-hover"
          >
            <LogOut size={14} />
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
    <IconButton
      variant="ghost"
      size="lg"
      onClick={toggleSidebar}
      aria-label={collapsed ? 'Expandir barra lateral' : 'Colapsar barra lateral'}
      className="hidden sm:flex"
    >
      {collapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
    </IconButton>
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
        <span className="text-base font-bold font-sans tracking-[-0.4px] text-[var(--foreground)] select-none">Neto</span>
        {import.meta.env.DEV && (
          <span className="ts-label-badge px-1.5 py-0.5 rounded-lg bg-amber-500/15 text-amber-500 select-none">
            dev
          </span>
        )}
      </div>

      {/* Right: chips + actions */}
      <div className="flex items-center gap-2">
        {/* Date chip — desktop only */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-[5px] rounded-xl border border-[var(--border)] text-[11px] text-[var(--muted-foreground)] whitespace-nowrap select-none">
          <CalendarDays size={11} className="shrink-0" />
          <span>{todayLabel()}</span>
        </div>

        {/* TRM chip */}
        {trm && (
          <div
            title={fresh ? 'TRM en vivo (Banco República)' : 'TRM desde caché (< 8h)'}
            className="flex items-center gap-1 px-2 py-1 rounded-xl bg-[var(--muted)] text-[11px] whitespace-nowrap select-none"
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

        {/* Notifications */}
        <NotificationBell />

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
