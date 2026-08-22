import { Check, X } from 'lucide-react'
import { IconButton } from '@/components/ui/icon-button'
import { cn } from '@/lib/utils'

/**
 * An account included in the setup (design-system/docs/19-choice-rows.md).
 *
 * Same skeleton as `ChoiceRow`, opposite grammar. The control **leads** and it is
 * always on: it states a fact — this account is included — not a choice. The
 * trailing slot holds metadata and an action, which is why this is a separate
 * component rather than a variant.
 *
 * The axis is `fixed | user`, not `selected`. What varies is whether the person
 * can take the account out: `fixed` is what the product includes and nobody
 * removes; `user` is what the person added. Calling that axis `selected` would
 * make the check and the wash look like the same state when they are not.
 */
export function AccountRow({ label, description, badge, type = 'user', onRemove, className }: {
  label: string
  description?: string
  /** Currency chip or similar. Metadata, not a control. */
  badge?: React.ReactNode
  type?: 'fixed' | 'user'
  /** Only meaningful for `user`; a fixed account has nothing to remove. */
  onRemove?: () => void
  className?: string
}) {
  const isUser = type === 'user'
  return (
    <div
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl transition-colors',
        isUser
          ? 'bg-[var(--bg-brand-alpha-10)] border border-[var(--primary)]'
          : 'bg-[var(--card)] border border-[var(--border)]',
        className,
      )}
    >
      {/* Leading check — always on. Decorative: "included" is what the row says
          in words, so announcing a tick as well would only repeat it. */}
      <span
        aria-hidden="true"
        className="w-5 h-5 rounded-full bg-[var(--primary)] border-2 border-[var(--primary)] flex items-center justify-center shrink-0"
      >
        <Check size={10} strokeWidth={3} className="text-[var(--primary-foreground)]" />
      </span>

      <span className="flex-1 min-w-0">
        <span className="block ts-body-base-emphasis truncate">{label}</span>
        {description && (
          <span className="block ts-body-small text-muted-foreground truncate">{description}</span>
        )}
      </span>

      {badge}

      {isUser && onRemove && (
        <IconButton variant="ghost" size="md" onClick={onRemove} aria-label={`Quitar ${label}`}>
          <X size={14} />
        </IconButton>
      )}
    </div>
  )
}
