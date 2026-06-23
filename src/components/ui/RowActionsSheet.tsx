import { useState } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Pencil, Trash2 } from 'lucide-react'
import { cn } from '@/lib/utils'
import { Button } from '@/components/ui/button'

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
              <Button
                key={i}
                variant="ghost"
                onClick={() => { close(); a.onClick() }}
                className="h-auto py-4 px-4 w-full justify-start gap-3 text-sm font-medium rounded-xl"
              >
                {a.icon}
                {a.label}
              </Button>
            ))}

            <Button
              variant="ghost"
              onClick={handleEdit}
              className="h-auto py-4 px-4 w-full justify-start gap-3 text-sm font-medium rounded-xl"
            >
              <Pencil size={18} className="text-muted-foreground shrink-0" />
              Editar
            </Button>

            <Button
              variant="ghost"
              onClick={handleDelete}
              className={cn(
                'h-auto py-4 px-4 w-full justify-start gap-3 text-sm font-medium rounded-xl',
                confirming
                  ? 'bg-[var(--color-danger-bg)] text-[var(--color-danger)] hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]'
                  : 'text-muted-foreground hover:bg-[var(--color-danger-bg)] hover:text-[var(--color-danger)]',
              )}
            >
              <Trash2 size={18} className="shrink-0" />
              {confirming ? 'Tocar para confirmar eliminación' : 'Eliminar'}
            </Button>
          </div>

          {/* Cancel */}
          <div className="px-3 pt-1">
            <Button
              variant="secondary"
              onClick={close}
              className="h-auto py-4 w-full text-sm font-semibold rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
