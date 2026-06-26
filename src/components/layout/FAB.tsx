import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight, PiggyBank } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface Action {
  label: string
  Icon: React.ElementType
  onTrigger: () => void
}

function FABAction({ label, Icon, onTrigger }: Action) {
  return (
    <button
      onClick={onTrigger}
      className={cn(
        'flex items-center gap-2.5 h-11 pl-3.5 pr-4 rounded-full shadow-lg',
        'bg-[var(--card)] border border-[var(--border)]',
        'text-sm font-medium text-[var(--foreground)]',
        'active:scale-95 transition-transform',
      )}
    >
      <span className="text-[var(--primary)]"><Icon size={16} /></span>
      {label}
    </button>
  )
}

export function FAB() {
  const [open, setOpen] = useState(false)
  const { view, openSheet, setEditingIncome, setEditingEgreso, setEditingTransfer, setEditingVoluntaria } = useUIStore()

  // Close on view change
  useEffect(() => { setOpen(false) }, [view])

  const visible = view === 'mes' || view === 'dashboard' || view === 'cuentas'
  if (!visible) return null

  function trigger(action: () => void) {
    setOpen(false)
    // Small delay so overlay dismisses before sheet opens
    setTimeout(action, 50)
  }

  const actions: Action[] = [
    {
      label: 'Ingreso',
      Icon: TrendingUp,
      onTrigger: () => trigger(() => { setEditingIncome(null); openSheet('income') }),
    },
    {
      label: 'Egreso',
      Icon: TrendingDown,
      onTrigger: () => trigger(() => { setEditingEgreso(null); openSheet('egreso') }),
    },
    {
      label: 'Movimiento',
      Icon: ArrowLeftRight,
      onTrigger: () => trigger(() => { setEditingTransfer(null); openSheet('transfer') }),
    },
    {
      label: 'Ahorro voluntario',
      Icon: PiggyBank,
      onTrigger: () => trigger(() => { setEditingVoluntaria(null); openSheet('voluntaria') }),
    },
  ]

  return (
    <>
      {/* Tap-outside overlay */}
      {open && (
        <div
          className="sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm"
          onClick={() => setOpen(false)}
        />
      )}

      {/* FAB + speed-dial */}
      <div
        className="sm:hidden fixed right-4 z-50 flex flex-col items-end gap-3"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
      >
        {/* Actions (visible when open) */}
        {open && (
          <div className="flex flex-col items-end gap-2.5">
            {actions.map(a => (
              <FABAction key={a.label} {...a} />
            ))}
          </div>
        )}

        {/* Main button */}
        <button
          onClick={() => setOpen(v => !v)}
          aria-label={open ? 'Cerrar menú' : 'Agregar registro'}
          className={cn(
            'w-14 h-14 rounded-full shadow-xl flex items-center justify-center',
            'bg-[var(--primary)] text-[var(--primary-foreground)]',
            'active:scale-95 transition-transform',
          )}
        >
          <Plus
            size={26}
            strokeWidth={2}
            className={cn('transition-transform duration-200', open && 'rotate-45')}
          />
        </button>
      </div>
    </>
  )
}
