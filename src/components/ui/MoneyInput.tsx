import { forwardRef, type InputHTMLAttributes } from 'react'
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
    return (
      <div className="space-y-0.5">
        {label && (
          <label htmlFor={id} className="field-label">
            {label}{currency ? ` (${currency})` : ''}
          </label>
        )}
        <input
          ref={ref}
          id={id}
          type="text"
          inputMode="decimal"
          value={value}
          onChange={e => onChange(e.target.value)}
          className={cn('field-input font-[inherit] tabular-nums', error && '!border-destructive', className)}
          {...rest}
        />
        {hint && !error && (
          <div className="text-[10px] text-[var(--n-blue)] font-medium min-h-[13px]">{hint}</div>
        )}
        {error && (
          <div className="text-[10px] text-[var(--n-danger)] font-medium">{error}</div>
        )}
      </div>
    )
  },
)
MoneyInput.displayName = 'MoneyInput'
