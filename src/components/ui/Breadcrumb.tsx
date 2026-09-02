import { ChevronRight, House } from 'lucide-react'
import { cn } from '@/lib/utils'

export interface Crumb {
  label: string
  /** Absent on the last crumb — it is the current page, not a link. */
  onClick?: () => void
}

/**
 * Hierarchical navigation between pages. The last crumb is the current page and is not a
 * link: it carries `aria-current`, takes no focus and does not react to the pointer.
 *
 * More than four crumbs is not supported. A deeper path has to collapse its middle
 * segments before it gets here — this component does not truncate on its own, because
 * deciding what to drop is the caller's knowledge, not the crumb's.
 *
 * The house icon lives in the first crumb only, and is off by default: only the root
 * carries it.
 */
export function Breadcrumb({ items, showHomeIcon }: { items: Crumb[]; showHomeIcon?: boolean }) {
  return (
    <nav aria-label="Ruta" className="flex items-center min-w-0" style={{ gap: 'var(--breadcrumb-gap)', height: 'var(--breadcrumb-height)' }}>
      {items.map((c, i) => {
        const isCurrent = i === items.length - 1 || !c.onClick
        return (
          <span key={`${c.label}-${i}`} className="flex items-center min-w-0" style={{ gap: 'var(--breadcrumb-gap)' }}>
            {i > 0 && (
              <ChevronRight
                aria-hidden
                className="shrink-0"
                style={{
                  width: 'var(--breadcrumb-separator-size)',
                  height: 'var(--breadcrumb-separator-size)',
                  color: 'var(--breadcrumb-separator-foreground)',
                }}
              />
            )}
            {isCurrent ? (
              <span
                aria-current="page"
                className="ts-body-small-emphasis truncate"
                style={{
                  color: 'var(--breadcrumb-current-foreground)',
                  padding: 'var(--breadcrumb-item-padding-y) var(--breadcrumb-item-padding-x)',
                }}
              >
                {c.label}
              </span>
            ) : (
              <button
                type="button"
                onClick={c.onClick}
                className={cn(
                  'ts-body-small truncate inline-flex items-center transition-colors',
                  'hover:underline focus-visible:outline-none',
                )}
                style={{
                  gap: 'var(--breadcrumb-item-gap)',
                  color: 'var(--breadcrumb-item-foreground)',
                  // The 4px padding is not decoration: it is the box the focus ring is
                  // drawn in. Without it the ring cuts through the letters.
                  padding: 'var(--breadcrumb-item-padding-y) var(--breadcrumb-item-padding-x)',
                  borderRadius: 'var(--breadcrumb-item-radius)',
                }}
              >
                {i === 0 && showHomeIcon && (
                  <House
                    aria-hidden
                    className="shrink-0"
                    style={{ width: 'var(--breadcrumb-icon-size)', height: 'var(--breadcrumb-icon-size)' }}
                  />
                )}
                {c.label}
              </button>
            )}
          </span>
        )
      })}
    </nav>
  )
}
