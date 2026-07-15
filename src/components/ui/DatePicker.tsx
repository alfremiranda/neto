import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string            // ISO date string YYYY-MM-DD
  onChange: (iso: string) => void
  className?: string
  placeholder?: string
  id?: string
}

function isoToDate(iso: string): Date | undefined {
  if (!iso) return undefined
  try { return parseISO(iso) } catch { return undefined }
}

function dateToISO(d: Date): string {
  const y  = d.getFullYear()
  const mo = String(d.getMonth() + 1).padStart(2, '0')
  const da = String(d.getDate()).padStart(2, '0')
  return `${y}-${mo}-${da}`
}

export function DatePicker({ value, onChange, className, placeholder = 'Seleccionar fecha', id }: DatePickerProps) {
  const selected = isoToDate(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <button
          id={id}
          type="button"
          data-slot="datepicker-trigger"
          className={cn(
            'flex w-full items-center gap-2 h-11 sm:h-9 rounded-sm border border-input bg-[var(--card)] px-3 text-left text-base sm:text-sm whitespace-nowrap transition-colors outline-none select-none focus-visible:border-2 focus-visible:border-foreground disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="size-4 shrink-0 text-muted-foreground" />
          <span className="flex-1 min-w-0 truncate">
            {selected
              ? format(selected, "d 'de' MMMM yyyy", { locale: es })
              : placeholder}
          </span>
        </button>
      </PopoverTrigger>
      <PopoverContent className="w-auto p-0" align="start">
        <Calendar
          mode="single"
          selected={selected}
          onSelect={d => d && onChange(dateToISO(d))}
          locale={es}
        />
      </PopoverContent>
    </Popover>
  )
}
