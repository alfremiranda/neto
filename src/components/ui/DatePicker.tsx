import { format, parseISO } from 'date-fns'
import { es } from 'date-fns/locale'
import { CalendarIcon } from 'lucide-react'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { Calendar } from '@/components/ui/calendar'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

interface DatePickerProps {
  value: string            // ISO date string YYYY-MM-DD
  onChange: (iso: string) => void
  className?: string
  placeholder?: string
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

export function DatePicker({ value, onChange, className, placeholder = 'Seleccionar fecha' }: DatePickerProps) {
  const selected = isoToDate(value)

  return (
    <Popover>
      <PopoverTrigger asChild>
        <Button
          variant="outline"
          className={cn(
            'w-full justify-start text-left font-normal h-11 sm:h-9',
            !selected && 'text-muted-foreground',
            className,
          )}
        >
          <CalendarIcon className="mr-2 size-4 shrink-0 text-muted-foreground" />
          {selected
            ? format(selected, "d 'de' MMMM yyyy", { locale: es })
            : placeholder}
        </Button>
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
