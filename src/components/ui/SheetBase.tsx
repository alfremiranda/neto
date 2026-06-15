import { useEffect, useRef, type ReactNode } from 'react'
import { X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { useUIStore } from '@/store/uiStore'
import type { SheetId } from '@/types'

interface SheetBaseProps {
  id: SheetId
  title: string
  children: ReactNode
  footer?: ReactNode
  className?: string
}

export function SheetBase({ id, title, children, footer, className }: SheetBaseProps) {
  const { activeSheet, closeSheet } = useUIStore()
  const open = activeSheet === id
  const firstInputRef = useRef<HTMLElement | null>(null)

  useEffect(() => {
    const handler = (e: KeyboardEvent) => { if (e.key === 'Escape') closeSheet() }
    document.addEventListener('keydown', handler)
    return () => document.removeEventListener('keydown', handler)
  }, [closeSheet])

  useEffect(() => {
    if (open) {
      setTimeout(() => {
        const el = document.querySelector(`[data-sheet="${id as string}"] input, [data-sheet="${id as string}"] select`) as HTMLElement | null
        el?.focus()
        firstInputRef.current = el
      }, 50)
    }
  }, [open, id])

  return (
    <>
      {/* Overlay */}
      <div
        className={cn(
          'fixed inset-0 bg-black/45 z-[100] opacity-0 pointer-events-none transition-opacity duration-200',
          open && 'opacity-100 pointer-events-auto',
        )}
        onClick={closeSheet}
      />

      {/* Sheet */}
      <div
        data-sheet={id as string}
        className={cn(
          'fixed z-[101] bg-[var(--n-bg)] overflow-y-auto',
          // Desktop: centered modal
          'sm:top-1/2 sm:left-1/2 sm:-translate-x-1/2 sm:-translate-y-[56%] sm:opacity-0 sm:w-[440px] sm:max-h-[85vh] sm:rounded-xl sm:pointer-events-none sm:shadow-2xl',
          'sm:transition-[transform,opacity] sm:duration-200',
          open && 'sm:!-translate-y-1/2 sm:!opacity-100 sm:!pointer-events-auto',
          // Mobile: slide-up
          'left-0 right-0 bottom-0 max-h-[88vh] rounded-t-2xl translate-y-full transition-transform duration-[280ms]',
          open && '!translate-y-0',
          className,
        )}
      >
        <div className="flex justify-between items-center px-4 py-4 border-b border-[var(--n-border)] sticky top-0 bg-[var(--n-bg)] z-[1]">
          <span className="text-[15px] font-semibold">{title}</span>
          <button
            onClick={closeSheet}
            className="p-2 rounded-lg hover:bg-[var(--n-bg2)] text-[var(--n-txt2)] transition-colors"
          >
            <X size={16} />
          </button>
        </div>
        <div className="px-4 py-4 pb-6">{children}</div>
        {footer && (
          <div className="px-4 pb-6">{footer}</div>
        )}
      </div>
    </>
  )
}
