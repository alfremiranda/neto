/**
 * An account's identity colour (design-system/docs/25-account-color.md).
 *
 * The design system publishes twelve accent/surface pairs and nothing that names an
 * account: which account is which colour is runtime data, not a token. That is what
 * retires the old `--account-{1..4}-*`, which had four of Alfredo's own accounts
 * hard-coded into the system.
 */
import type { Account } from '@/types'

/** Order is part of the contract: `derivedColor` indexes into it. Never reorder. */
export const ACCOUNT_COLORS = [
  'purple', 'sky', 'emerald', 'lime', 'amber', 'pink',
  'blue', 'green', 'indigo', 'orange', 'rose', 'teal',
] as const

export type AccountColor = (typeof ACCOUNT_COLORS)[number]

/**
 * Spanish names for the picker. Not decoration: WCAG 1.4.1 forbids colour as the sole
 * carrier of information, and §3 of the spec measured that it could not be anyway —
 * twelve hues out of the fourteen left over force 11° neighbours (orange/amber,
 * emerald/teal, pink/rose), which are not reliably distinguishable at 32px.
 *
 * Ratified by Design 2026-08-22 (A-2026-08-22-fucsia-y-los-tres-naranjas). `pink` is
 * Fucsia, not Rosado: "Rosado"/"Rosa" for the two hues 14 degrees apart was the pair
 * that naming was supposed to rescue and did not. This list is contract now — it also
 * lives in 25-account-color.md and in the component's description.
 */
export const ACCOUNT_COLOR_LABEL: Record<AccountColor, string> = {
  purple: 'Morado', sky: 'Celeste', emerald: 'Esmeralda', lime: 'Lima',
  amber: 'Ámbar', pink: 'Fucsia', blue: 'Azul', green: 'Verde',
  indigo: 'Índigo', orange: 'Naranja', rose: 'Rosa', teal: 'Turquesa',
}

/**
 * FNV-1a over the id. Any stable hash would do; what matters is that it is stable —
 * §4 chose derive-from-id over a random roll precisely so that two devices reach the
 * same answer with no sync round trip and no migration write that can fail halfway.
 */
function hash(id: string): number {
  let h = 0x811c9dc5
  for (let i = 0; i < id.length; i++) {
    h ^= id.charCodeAt(i)
    h = Math.imul(h, 0x01000193) >>> 0
  }
  return h
}

/** The colour an account gets when it has never been given one. */
export function derivedColor(id: string): AccountColor {
  return ACCOUNT_COLORS[hash(id) % ACCOUNT_COLORS.length]
}

/**
 * Chosen colour, or the derived one. `account.color` stays optional on purpose:
 * absent means derived, present means chosen, and writing it on first open would
 * erase that distinction and make every account look deliberately coloured (§4).
 */
export function accountColor(account: Pick<Account, 'id' | 'color'>): AccountColor {
  return account.color ?? derivedColor(account.id)
}

/** The two CSS custom properties an avatar needs, for `style={...}`. */
export function accountColorVars(color: AccountColor): Record<string, string> {
  return {
    '--account-accent': `var(--account-${color}-accent)`,
    '--account-surface': `var(--account-${color}-surface)`,
  }
}
