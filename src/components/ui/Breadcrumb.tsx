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

/**
 * One crumb.
 *
 * `Link` is navigable. `Current` is the current page: it carries `aria-current`, does not
 * react to the pointer and takes no focus, which is why it only has a default state.
 *
 * The 4px horizontal padding is not decoration — it is the box the focus ring is drawn
 * in. Take it away and the ring cuts through the letters.
 */
function BreadcrumbItem({ label, onClick, current, showIcon }: {
  label: string
  onClick?: () => void
  current?: boolean
  showIcon?: boolean
}) {
  const icon = showIcon ? (
    <House
      aria-hidden
      className="shrink-0"
      style={{ width: 'var(--breadcrumb-icon-size)', height: 'var(--breadcrumb-icon-size)' }}
    />
  ) : null

  const box: React.CSSProperties = {
    gap: 'var(--breadcrumb-item-gap)',
    padding: 'var(--breadcrumb-item-padding-y) var(--breadcrumb-item-padding-x)',
    borderRadius: 'var(--breadcrumb-item-radius)',
  }

  if (current) {
    return (
      <span
        aria-current="page"
        className="ts-body-small-emphasis truncate inline-flex items-center"
        style={{ ...box, color: 'var(--breadcrumb-current-foreground)' }}
      >
        {icon}
        {label}
      </span>
    )
  }

  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'ts-body-small truncate inline-flex items-center transition-colors',
        'text-[var(--breadcrumb-item-foreground)]',
        'hover:underline hover:text-[var(--breadcrumb-item-foreground-hover)]',
        'hover:bg-[var(--breadcrumb-item-background-hover)]',
        'focus-visible:outline-none focus-visible:ring-[length:var(--breadcrumb-focus-ring-width)]',
        'focus-visible:ring-[var(--breadcrumb-focus-ring)]',
      )}
      style={box}
    >
      {icon}
      {label}
    </button>
  )
}

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
              <BreadcrumbItem label={c.label} current showIcon={i === 0 && showHomeIcon} />
            ) : (
              <BreadcrumbItem label={c.label} onClick={c.onClick} showIcon={i === 0 && showHomeIcon} />
            )}
          </span>
        )
      })}
    </nav>
  )
}
