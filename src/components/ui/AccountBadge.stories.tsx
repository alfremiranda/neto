import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountBadge } from './AccountBadge'
import { Badge } from './Badge'
import { ACCOUNT_COLORS } from '@/lib/accountColor'

const meta = { title: 'Badges/AccountBadge', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Acceptance criteria
 *
 * - **It says WHICH account**, not what kind of account. That was `AccountTypeBadge`'s job:
 *   they answer different questions and can appear together.
 * - **The colour comes from the account record, not from a `tone` at the call site.** On a
 *   generic `Badge` colour is decorative; here it identifies, so it is not chosen at paint
 *   time.
 * - **The dot is the only coloured part.** The chip stays on `bg/account`. Twelve hues are
 *   safe precisely because each one is confined to a small mark that never shares a surface
 *   with a number.
 * - **The name always travels beside it** (WCAG 1.4.1): colour cannot be the only carrier
 *   of which account this is.
 * - No variants: there are no axes to pick, only the account.
 */
export const Accounts: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2" style={{ maxWidth: 520 }}>
      {[
        { id: 'ARQ', label: 'ARQ (Observer Hub)' },
        { id: 'Bancolombia', label: 'Bancolombia' },
        { id: 'CMR', label: 'CMR Falabella' },
        { id: 'Nequi', label: 'Nequi' },
        { id: 'Efectivo', label: 'Efectivo' },
      ].map(a => <AccountBadge key={a.id} account={a} label={a.label} />)}
    </div>
  ),
}

/** The twelve hues. The dot changes; the chip never does. */
export const EveryHue: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2" style={{ maxWidth: 520 }}>
      {ACCOUNT_COLORS.map(c => (
        <AccountBadge key={c} account={{ id: c, color: c }} label={c} />
      ))}
    </div>
  ),
}

/**
 * Beside the generic `Badge`, which is what it is distinguished from: that one colours by a
 * tone chosen at the call site, this one by the account's identity.
 */
export const AgainstGenericBadge: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <AccountBadge account={{ id: 'Bancolombia' }} label="Bancolombia" />
      <Badge tone="warning">Pendiente</Badge>
      <Badge tone="neutral">Pagado</Badge>
    </div>
  ),
}
