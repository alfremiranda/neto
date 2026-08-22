import { useId } from 'react'
import { cn } from '@/lib/utils'

/**
 * Label + control + message (design-system/docs/22-fields.md).
 *
 * It exists because four form components had four different answers about the
 * label, and two of them were defects: `Input`, `Select` and `DatePicker` let the
 * placeholder carry the field's name. That fails twice — the placeholder vanishes
 * the moment the user types, exactly when they need it, and at `#94a3b8` it
 * measures 2.56:1 where a real label measures 10.35:1.
 *
 * The label is not optional. Presence is composition, not state: a `Label=on|off`
 * axis doubles the matrix for something that is not a state at all.
 *
 * `Field` deliberately does not own the control's visual state. Focus, disabled
 * and the error outline belong to the control. Field knows what the message says;
 * the control knows how it looks.
 */
export function Field({ label, children, message, state = 'default', htmlFor, className }: {
  label: string
  /** The control. Receives the generated id when `htmlFor` is not given. */
  children: (id: string) => React.ReactNode
  message?: string
  /** `hint` shows the message muted; `error` shows it in the danger colour. */
  state?: 'default' | 'hint' | 'error'
  /** Override the generated id, for a control that already has one. */
  htmlFor?: string
  className?: string
}) {
  const autoId = useId()
  const id = htmlFor ?? autoId
  // The message's reason to exist is the state: a field in error with no message
  // is useless, and a hint with nowhere to show is dead weight.
  const showMessage = state !== 'default' && !!message
  return (
    <div className={cn('flex flex-col gap-1.5', className)}>
      <label htmlFor={id} className="field-label ts-label-base">{label}</label>
      {children(id)}
      {showMessage && (
        <p className={cn(
          'ts-detail-nano',
          state === 'error' ? 'text-[var(--color-danger)]' : 'text-muted-foreground',
        )}>
          {message}
        </p>
      )}
    </div>
  )
}
