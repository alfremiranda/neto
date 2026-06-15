import { MonthNav } from './MonthNav'
import { useLiveTRM } from '@/hooks/useLiveTRM'

export function Header() {
  const { trm, fresh } = useLiveTRM()

  const trmFormatted = trm
    ? trm.toLocaleString('es-CO', { minimumFractionDigits: 2, maximumFractionDigits: 2 })
    : '—'

  return (
    <header className="grid gap-2 py-3 pb-4"
      style={{ gridTemplateColumns: '1fr auto 1fr' }}>
      <h1 className="text-[14px] font-semibold text-[var(--n-txt2)] self-center">Neto</h1>
      <MonthNav />
      <div className="text-[11px] text-[var(--n-txt3)] text-right whitespace-nowrap self-center">
        {trm && (
          <>
            <span
              className={`text-[8px] align-middle mr-0.5 ${fresh ? 'text-[var(--n-green)]' : 'text-[var(--n-amber)]'}`}
              title={fresh ? 'Actualizado ahora' : 'Desde caché (< 8h)'}
            >
              ●
            </span>
            TRM&nbsp;{trmFormatted}
          </>
        )}
      </div>
    </header>
  )
}
