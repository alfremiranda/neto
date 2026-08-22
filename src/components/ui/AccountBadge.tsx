import { accountColor, accountColorVars } from '@/lib/accountColor'
import { cn } from '@/lib/utils'
import type { Account } from '@/types'

/**
 * An account's chip: a neutral pill with a dot in the account's own colour
 * (`Components · Rows` → `AccountBadge`).
 *
 * This is the "specific component" the generic `Badge` points at. Colour on a `Badge` is
 * decorative; here it identifies, so it comes from the account record rather than from a
 * `tone` prop chosen at the call site.
 *
 * The dot is the only coloured part. The chip itself stays `bg/account` — twelve hues are
 * safe precisely because each one is confined to a small mark that never shares a surface
 * with a number, and the account's name always travels beside it (WCAG 1.4.1).
 */
export function AccountBadge({ account, label, className }: {
  account: Pick<Account, 'id' | 'color'>
  /** What to show. Usually the account's display label, which may differ from its id. */
  label: string
  className?: string
}) {
  return (
    <span
      style={accountColorVars(accountColor(account))}
      className={cn(
        'ts-label-badge h-[var(--badge-size)] pl-1.5 pr-2 rounded-full whitespace-nowrap',
        'inline-flex items-center gap-1.5 shrink-0',
        'bg-[var(--bg-account)] text-[var(--fg-account)]',
        className,
      )}
    >
      <span aria-hidden="true" className="w-2 h-2 rounded-full bg-[var(--account-accent)] shrink-0" />
      {label}
    </span>
  )
}
