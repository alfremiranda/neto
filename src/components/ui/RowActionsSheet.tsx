import { useState } from 'react'
import { Dialog as DialogPrimitive } from 'radix-ui'
import { Pencil, Trash2 } from 'lucide-react'
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
  /** Omit when the row has nothing to delete — the account's opening balance is a field
   *  on the Account, not an entry, so there is no asiento for a delete to point at. The
   *  action is then hidden rather than shown as a no-op. */
  onDelete?: () => void
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
    onDelete?.()
  }

  return (
    <DialogPrimitive.Root open={open} onOpenChange={o => { if (!o) close() }}>
      <DialogPrimitive.Portal>
        <DialogPrimitive.Overlay
          className="fixed inset-0 z-50 bg-black/40 backdrop-blur-sm data-[state=open]:animate-in data-[state=open]:fade-in-0 data-[state=closed]:animate-out data-[state=closed]:fade-out-0"
        />
        <DialogPrimitive.Content
          aria-describedby={undefined}
          data-slot="row-actions-sheet"
          className={[
            'fixed inset-x-0 bottom-0 z-50 flex flex-col',
            'bg-[var(--card)] rounded-t-2xl shadow-xl',
            'focus:outline-none',
            'data-[state=open]:animate-in data-[state=open]:slide-in-from-bottom-full data-[state=open]:duration-slow',
            'data-[state=closed]:animate-out data-[state=closed]:slide-out-to-bottom-full data-[state=closed]:duration-moderate',
          ].join(' ')}
          style={{ paddingBottom: 'max(1rem, env(safe-area-inset-bottom))' }}
        >
          {/* Drag handle */}
          <div className="flex justify-center pt-3 pb-1">
            <div className="w-9 h-1 rounded-full bg-[var(--border)]" />
          </div>

          {/* Item info */}
          <div className="px-5 pt-2 pb-4 border-b border-[var(--border)]">
            <DialogPrimitive.Title className="ts-body-base-emphasis truncate">
              {title}
            </DialogPrimitive.Title>
            {subtitle && (
              <p className="ts-body-small text-muted-foreground mt-0.5 truncate">{subtitle}</p>
            )}
          </div>

          {/* Action list */}
          <div className="p-3 flex flex-col gap-1">
            {extraActions?.map((a, i) => (
              <Button
                key={i}
                variant="outline"
                size="xl"
                onClick={() => { close(); a.onClick() }}
                className="h-auto py-4 px-4 w-full justify-start gap-3 rounded-xl"
              >
                {a.icon}
                {a.label}
              </Button>
            ))}

            {/* Prominence follows consequence, which is why Cancelar and the actions read
                inverted against what was here: Cancelar used to be the only outlined thing
                and Eliminar the quietest. */}
            <Button
              variant="outline"
              size="xl"
              onClick={handleEdit}
              className="h-auto py-4 px-4 w-full justify-start gap-3 rounded-xl"
            >
              <Pencil size={18} className="shrink-0" />
              Editar
            </Button>

            {/* Confirming is the same piece stepping up in weight — outline → filled, same
                position, same place. Not a new state and not a separate dialog: moving the
                button would make the second tap land where nothing was. */}
            {onDelete && (
            <Button
              variant={confirming ? 'destructive' : 'outline-danger'}
              size="xl"
              onClick={handleDelete}
              className="h-auto py-4 px-4 w-full justify-start gap-3 rounded-xl"
            >
              <Trash2 size={18} className="shrink-0" />
              {confirming ? 'Tocar para confirmar eliminación' : 'Eliminar'}
            </Button>
            )}
          </div>

          {/* Cancel — the quietest thing here, and it gets its own rule above it so the
              list of actions reads as closed before the way out. */}
          <div className="px-3 pt-3 border-t border-[var(--border)]">
            <Button
              variant="ghost"
              size="xl"
              onClick={close}
              className="h-auto py-4 w-full rounded-xl"
            >
              Cancelar
            </Button>
          </div>
        </DialogPrimitive.Content>
      </DialogPrimitive.Portal>
    </DialogPrimitive.Root>
  )
}
