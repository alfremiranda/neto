import { type ReactNode, useEffect, useMemo, useState } from 'react'
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

// Tracks how many px the keyboard is covering from the bottom of the layout viewport.
// On iOS PWA, position:fixed elements anchor to the layout viewport (full screen),
// so the keyboard overlaps the drawer from below without resizing it.
function useKeyboardOffset(active: boolean): number {
  const [offset, setOffset] = useState(0)
  useEffect(() => {
    if (!active || !window.visualViewport) { setOffset(0); return }
    const vv = window.visualViewport
    function update() {
      setOffset(Math.max(0, window.innerHeight - vv.height - vv.offsetTop))
    }
    vv.addEventListener('resize', update)
    vv.addEventListener('scroll', update)
    update()
    return () => {
      vv.removeEventListener('resize', update)
      vv.removeEventListener('scroll', update)
    }
  }, [active])
  return offset
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
  const keyboardOffset = useKeyboardOffset(!isDesktop && open)

  // On iOS PWA standalone, dvh/vh/innerHeight are all wrong — use screen.height.
  // Same root cause as the app height fix; gated on navigator.standalone.
  const baseMaxH = useMemo(() => {
    if ((window.navigator as Navigator & { standalone?: boolean }).standalone) {
      return `${Math.floor(window.screen.height * 0.92)}px`
    }
    return '92dvh'
  }, [])

  const direction = isDesktop ? 'right' : 'bottom'

  const contentCls = isDesktop
    ? 'inset-y-0 right-0 w-[420px] shadow-2xl rounded-l-2xl'
    : 'inset-x-0 bottom-0 rounded-t-2xl'

  // On mobile, fix the drawer to exactly the available height so short forms
  // fill the same space as long ones. vaul animates via transform:translateY,
  // so changing bottom/height is safe and doesn't conflict with its animation.
  const contentStyle = !isDesktop ? {
    bottom: keyboardOffset,
    height: `calc(${baseMaxH} - ${keyboardOffset}px)`,
    transition: 'bottom 0.25s cubic-bezier(0.32,0.72,0,1), height 0.25s cubic-bezier(0.32,0.72,0,1)',
  } : undefined

  return (
    <Drawer
      open={open}
      onOpenChange={v => { if (!v) closeSheet() }}
      direction={direction}
      noBodyStyles
    >
      <DrawerContent className={contentCls} style={contentStyle}>
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
