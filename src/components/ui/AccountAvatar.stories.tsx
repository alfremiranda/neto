import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountAvatar } from './AccountAvatar'
import { AccountBadge } from './AccountBadge'
import { ACCOUNT_COLORS } from '@/lib/accountColor'

const meta = { title: 'Accounts/AccountAvatar', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/** All twelve, in hue order — the same order the picker shows and the hash indexes into. */
export const TwelveColours: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {ACCOUNT_COLORS.map(c => (
        <AccountAvatar key={c} size="lg" account={{ id: c, color: c, type: 'account' }} />
      ))}
    </div>
  ),
}

export const ByTypeAndSize: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 16, alignItems: 'center' }}>
      {(['account', 'cash', 'credit', 'savings'] as const).map(t => (
        <AccountAvatar key={t} size="lg" account={{ id: t, color: 'sky', type: t }} />
      ))}
      {(['sm', 'md', 'lg'] as const).map(s => (
        <AccountAvatar key={s} size={s} account={{ id: 'x', color: 'purple', type: 'account' }} />
      ))}
    </div>
  ),
}

export const Chip: Story = {
  name: 'AccountBadge — the chip with a dot',
  render: () => (
    <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
      {ACCOUNT_COLORS.slice(0, 6).map(c => (
        <AccountBadge key={c} account={{ id: c, color: c }} label={c} />
      ))}
    </div>
  ),
}
