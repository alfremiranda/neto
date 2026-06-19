import { useState } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Pencil, Trash2 } from 'lucide-react'

interface ExtraAction {
  label: string
  icon: React.ReactNode
  onClick: () => void
}

interface RowActionsSheetProps {
  open: boolean
  onOpenChange: (open: boolean) => void
  title: string
  subtitle?: string
  onEdit: () => void
  onDelete: () => void
  extraActions?: ExtraAction[]
}

export function RowActionsSheet({
  open, onOpenChange, title, subtitle, onEdit, onDelete, extraActions,
}: RowActionsSheetProps) {
  const [confirming, setConfirming] = useState(false)

  function close() {
    setConfirming(false)
    onOpenChange(false)
  }

  function handleEdit() {
    close()
    onEdit()
  }

  function handleDelete() {
    if (!confirming) { setConfirming(true); return }
    close()
    onDelete()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={o => { if (!o) close() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          data-slot="row-actions-sheet"
          className={[
            'fixed inset-x-0 bottom-0 z-50 flex flex-col',
            'bg-[var(--card)] rounded-t-2xl shadow-xl',
            'focus:outline-none',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:duration-300',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:duration-200',
          ].join(' ')}
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-[var(--border)]" />
          </div>

          {/* Item info */}
          <div className="px-5 pt-2 pb-4 border-b border-[var(--border)]">
            <DialogPrimitive.Title className="text-sm font-semibold truncate">
              {title}
            </DialogPrimitive.Title>
            {subtitle && (
              <p className="text-xs text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Action list */}
          <div className="p-3 flex flex-col gap-1">
            {extraActions?.map((a, i) => (
              <button
                key={i}
                onClick={() => { close(); a.onClick() }}
                className="flex items-center gap-3 w-full px-4 py-4 rounded-xl text-left text-sm font-medium hover:bg-[var(--accent)] transition-colors"
              >
                {a.icon}
                {a.label}
              </button>
            ))}

            <button
              onClick={handleEdit}
              className="flex items-center gap-3 w-full px-4 py-4 rounded-xl text-left text-sm font-medium hover:bg-[var(--accent)] transition-colors"
            >
              <Pencil size={18} className="text-muted-foreground shrink-0" />
              Editar
            </button>

            <button
              onClick={handleDelete}
              className={[
                'flex items-center gap-3 w-full px-4 py-4 rounded-xl text-left text-sm font-medium transition-colors',
                confirming
                  ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)]'
                  : 'text-muted-foreground hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]',
              ].join(' ')}
            >
              <Trash2 size={18} className="shrink-0" />
              {confirming ? 'Tocar para confirmar eliminación' : 'Eliminar'}
            </button>
          </div>

          {/* Cancel */}
          <div className="px-3 pt-1">
            <button
              onClick={close}
              className="w-full py-4 rounded-xl bg-[var(--muted)] text-sm font-semibold text-[var(--foreground)] hover:bg-[var(--accent)] transition-colors"
            >
              Cancelar
            </button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
