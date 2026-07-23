import type { Account } from '@/types'

export const DELETED_ACCOUNT_LABEL = 'Cuenta eliminada'

// Resolve an account id to its display label. A non-empty id that no longer maps to
// an account is an orphan — the account was deleted (possibly on another device, and
// the per-entry merge keeps the referencing entry rather than dropping it). Show a
// clear marker instead of the raw id so the entry stays legible and visible, without
// pretending the account still exists.
export function accountLabel(id: string | undefined | null, accounts: Account[]): string {
  if (!id) return ''
  return accounts.find(a => a.id === id)?.label ?? DELETED_ACCOUNT_LABEL
}
