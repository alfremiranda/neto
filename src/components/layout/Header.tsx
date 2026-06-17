import { Sun, Moon, CalendarDays } from 'lucide-react'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { useTheme } from '@/hooks/useTheme'

const DAYS  = ['Dom', 'Lun', 'Mar', 'Mié', 'Jue', 'Vie', 'Sáb']
const MONTHS = ['ene', 'feb', 'mar', 'abr', 'may', 'jun', 'jul', 'ago', 'sep', 'oct', 'nov', 'dic']

function todayLabel() {
  const d = new Date()
  return `${DAYS[d.getDay()]} ${d.getDate()} ${MONTHS[d.getMonth()]}`
}

export function Header() {
  const { trm, fresh } = useLiveTRM()
  const { theme, toggle } = useTheme()

  const trmFormatted = trm
    ? trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

  return (
    <header className="flex items-center justify-between gap-2 px-4 sm:px-5 h-14 shrink-0 bg-[var(--card)] border-b border-[var(--border)]">
      <span className="text-base font-bold font-heading tracking-tight text-[var(--foreground)] select-none">Neto</span>

      <div className="flex items-center gap-2">
        {/* Date chip */}
        <div className="hidden sm:flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--muted)] text-[11px] font-medium text-[var(--muted-foreground)] whitespace-nowrap select-none">
          <CalendarDays size={11} className="text-[var(--n-txt3)] shrink-0" />
          <span>{todayLabel()}</span>
        </div>

        {/* TRM chip */}
        {trm && (
          <div
            title={fresh ? 'TRM en vivo (Banco República)' : 'TRM desde caché (< 8h)'}
            className="flex items-center gap-1.5 px-2.5 py-1.5 rounded-lg bg-[var(--muted)] text-[11px] font-medium whitespace-nowrap select-none"
          >
            {/* Live pulse badge */}
            <span className="relative flex h-[7px] w-[7px] shrink-0">
              {fresh && (
                <span className="absolute inline-flex h-full w-full rounded-full bg-[var(--color-provision)] opacity-75 animate-ping" />
              )}
              <span
                className="relative inline-flex h-[7px] w-[7px] rounded-full"
                style={{ background: fresh ? 'var(--color-provision)' : 'var(--color-tax)' }}
              />
            </span>
            <span className="text-[var(--n-txt3)]">TRM</span>
            <span className="text-[var(--muted-foreground)]">{trmFormatted}</span>
          </div>
        )}

        {/* Theme toggle */}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-1.5 rounded-lg text-[var(--n-txt3)] hover:text-[var(--foreground)] hover:bg-[var(--muted)] transition-colors border-0 bg-transparent cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}
