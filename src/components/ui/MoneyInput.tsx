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
          <label htmlFor={id} className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">
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
          className={cn(
            'w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2',
            'bg-[var(--n-bg)] text-[var(--n-txt)] font-[inherit]',
            'focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)] focus:ring-offset-[-1px]',
            error && 'border-[var(--n-danger)]',
            className,
          )}
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
