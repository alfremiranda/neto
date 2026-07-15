import { useState, useEffect } from 'react'
import { Plus, TrendingUp, TrendingDown, ArrowLeftRight } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import { cn } from '@/lib/utils'

interface Action {
  label: string
  Icon: React.ElementType
  onTrigger: () => void
  delay: number
}

function FABAction({ label, Icon, onTrigger, delay }: Action) {
  return (
    <button
      onClick={onTrigger}
      style={{ animationDelay: `${delay}ms` }}
      className={cn(
        'flex items-center gap-2.5 h-11 pl-3.5 pr-4 rounded-full shadow-lg',
        'bg-[var(--card)] border border-[var(--border)]',
        'text-sm font-medium text-[var(--foreground)]',
        // Press feedback
        'active:scale-95 transition-transform duration-100',
        // Entrance: fade + scale up from slightly below — fill-mode-backwards holds
        // the initial keyframe state during the delay so items stay hidden
        'animate-in fade-in-0 zoom-in-95 slide-in-from-bottom-2 fill-mode-backwards duration-200',
      )}
    >
      <span className="text-[var(--primary)]"><Icon size={16} /></span>
      {label}
    </button>
  )
}

export function FAB() {
  const [open, setOpen] = useState(false)
  const { view, openSheet, setEditingIncome, setEditingEgreso, setEditingTransfer } = useUIStore()

  useEffect(() => { setOpen(false) }, [view])

  const visible = view === 'mes' || view === 'dashboard' || view === 'cuentas'
  if (!visible) return null

  function trigger(action: () => void) {
    setOpen(false)
    setTimeout(action, 50)
  }

  const actions = [
    {
      label: 'Ingreso',
      Icon: TrendingUp,
      onTrigger: () => trigger(() => { setEditingIncome(null); openSheet('income') }),
    },
    {
      label: 'Gasto',
      Icon: TrendingDown,
      onTrigger: () => trigger(() => { setEditingEgreso(null); openSheet('egreso') }),
    },
    {
      label: 'Movimiento',
      Icon: ArrowLeftRight,
      onTrigger: () => trigger(() => { setEditingTransfer(null); openSheet('transfer') }),
    },
  ]

  return (
    <>
      {/* Overlay — always in DOM, fade controlled via opacity so the transition runs
          in both directions. backdrop-blur-sm is invisible at opacity-0. */}
      <div
        aria-hidden
        className={cn(
          'sm:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm',
          'transition-opacity duration-200',
          open ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none',
        )}
        onClick={() => setOpen(false)}
      />

      {/* FAB + speed-dial */}
      <div
        className="sm:hidden fixed right-4 z-50 flex flex-col items-end gap-3"
        style={{ bottom: 'calc(env(safe-area-inset-bottom) + 72px)' }}
      >
        {/* Actions — stagger from closest to the FAB (bottom) outward.
            Ahorro (last in array, visually bottom) gets delay 0;
            Ingreso (first in array, visually top) gets the longest delay. */}
        {open && (
          <div className="flex flex-col items-end gap-2.5">
            {actions.map((a, i) => (
              <FABAction
                key={a.label}
                {...a}
                delay={(actions.length - 1 - i) * 40}
              />
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
            'active:scale-90 transition-transform duration-100',
          )}
        >
          <Plus
            size={26}
            strokeWidth={2}
            style={{ transition: 'transform 300ms cubic-bezier(0.34, 1.56, 0.64, 1)' }}
            className={cn(open ? 'rotate-45' : 'rotate-0')}
          />
        </button>
      </div>
    </>
  )
}
