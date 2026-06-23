import { type ReactNode, useEffect, useState } from 'react'
import { X } from 'lucide-react'
import { useUIStore } from '@/store/uiStore'
import type { SheetId } from '@/types'
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerBody,
} from '@/components/ui/drawer'

function useIsDesktop() {
  const [isDesktop, setIsDesktop] = useState(
    () => typeof window !== 'undefined' && window.matchMedia('(min-width: 640px)').matches
  )
  useEffect(() => {
    const mq = window.matchMedia('(min-width: 640px)')
    const handler = (e: MediaQueryListEvent) => setIsDesktop(e.matches)
    mq.addEventListener('change', handler)
    return () => mq.removeEventListener('change', handler)
  }, [])
  return isDesktop
}

interface SheetBaseProps {
  id: SheetId
  title: ReactNode
  children: ReactNode
  footer?: ReactNode
}

export function SheetBase({ id, title, children, footer }: SheetBaseProps) {
  const { activeSheet, closeSheet } = useUIStore()
  const open = activeSheet === id
  const isDesktop = useIsDesktop()

  const direction = isDesktop ? 'right' : 'bottom'

  // Direction-specific classes passed directly to DrawerContent
  const contentCls = isDesktop
    ? 'inset-y-0 right-0 w-[420px] shadow-2xl rounded-l-2xl'
    : 'inset-x-0 bottom-0 max-h-[92dvh] rounded-t-2xl'

  return (
    <Drawer
      open={open}
      onOpenChange={v => { if (!v) closeSheet() }}
      direction={direction}
      noBodyStyles
    >
      <DrawerContent className={contentCls}>
        {/* Drag handle — mobile only */}
        {!isDesktop && (
          <div className="mx-auto mt-3 mb-1 h-1 w-10 rounded-full bg-[var(--border)] shrink-0" />
        )}

        <DrawerHeader>
          <DrawerTitle>{title}</DrawerTitle>
          <button
            onClick={closeSheet}
            aria-label="Cerrar"
            className="p-2 rounded-lg hover:bg-muted text-muted-foreground transition-colors"
          >
            <X size={16} />
          </button>
        </DrawerHeader>

        <DrawerBody>
          {children}
        </DrawerBody>

        {footer && (
          <div
            className="shrink-0 px-5 pt-3 border-t border-[var(--border)]"
            style={{ paddingBottom: 'max(20px, env(safe-area-inset-bottom))' }}
          >
            {footer}
          </div>
        )}
      </DrawerContent>
    </Drawer>
  )
}
