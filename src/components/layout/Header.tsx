import { Sun, Moon } from 'lucide-react'
import { MonthNav } from './MonthNav'
import { useLiveTRM } from '@/hooks/useLiveTRM'
import { useTheme } from '@/hooks/useTheme'

export function Header() {
  const { trm, fresh } = useLiveTRM()
  const { theme, toggle } = useTheme()

  const trmFormatted = trm
    ? trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

  return (
    <header className="grid gap-2 py-3 pb-4"
      style={{ gridTemplateColumns: '1fr auto 1fr' }}>
      <h1 className="text-[14px] font-semibold text-[var(--n-txt2)] self-center">Neto</h1>
      <MonthNav />
      <div className="flex items-center justify-end gap-2">
        {trm && (
          <span className="text-[11px] text-[var(--n-txt3)] whitespace-nowrap">
            <span
              className={`text-[8px] align-middle mr-0.5 ${fresh ? 'text-[var(--n-green)]' : 'text-[var(--n-amber)]'}`}
              title={fresh ? 'Actualizado ahora' : 'Desde caché (< 8h)'}
            >
              ●
            </span>
            TRM&nbsp;{trmFormatted}
          </span>
        )}
        <button
          onClick={toggle}
          title={theme === 'dark' ? 'Cambiar a modo claro' : 'Cambiar a modo oscuro'}
          className="p-1.5 rounded-lg text-[var(--n-txt3)] hover:text-[var(--n-txt)] hover:bg-[var(--n-bg2)] transition-colors border-0 bg-transparent cursor-pointer"
        >
          {theme === 'dark' ? <Sun size={15} /> : <Moon size={15} />}
        </button>
      </div>
    </header>
  )
}
