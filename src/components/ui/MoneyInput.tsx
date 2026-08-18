import { forwardRef, useId, type InputHTMLAttributes } from 'react'
import { cn } from '@/lib/utils'

interface MoneyInputProps extends Omit<InputHTMLAttributes<HTMLInputElement>, 'onChange' | 'value'> {
  value: string
  onChange: (raw: string) => void
  hint?: string
  label?: string
  currency?: string
  error?: string
}

export const MoneyInput = forwardRef<HTMLInputElement, MoneyInputProps>(
  ({ value, onChange, hint, label, currency, error, className, id, ...rest }, ref) => {
    // Without a fallback, a caller that omits `id` leaves htmlFor AND the input id
    // undefined: the label points at nothing and the field has no accessible name.
    // Most call sites omit it, so the default has to be correct, not the exception.
    const autoId = useId()
    const fieldId = id ?? autoId
    return (
      <div className="space-y-0.5">
        {label && (
          <label htmlFor={fieldId} className="field-label ts-label-base">
            {label}{currency ? ` (${currency})` : ''}
          </label>
        )}
        <input
          ref={ref}
          id={fieldId}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn('field-input font-[inherit] tabular-nums', error && '!border-destructive', className)}
          {...rest}
        />
        {hint && !error && (
          <div className="ts-detail-nano text-[var(--color-income)] min-h-[13px]">{hint}</div>
        )}
        {error && (
          <div className="ts-detail-nano text-[var(--color-danger)]">{error}</div>
        )}
      </div>
    )
  },
)
MoneyInput.displayName = 'MoneyInput'
