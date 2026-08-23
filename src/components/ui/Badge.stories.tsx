import type { Meta, StoryObj } from '@storybook/react-vite'
import { Badge, CurrencyBadge } from './Badge'
import { AccountBadge } from './AccountBadge'

const meta = { title: 'Badges/Badge', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const TONES = ['accent', 'success', 'info', 'warning', 'danger', 'neutral'] as const

/** The whole matrix: six tones by two treatments, the shape Figma publishes. */
export const Matrix: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12 }}>
      {(['filled', 'outline'] as const).map(v => (
        <div key={v} style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
          <span style={{ width: 60, font: '500 11px var(--font-sans)', color: 'var(--muted-foreground)' }}>{v}</span>
          {TONES.map(t => <Badge key={t} tone={t} variant={v}>{t}</Badge>)}
        </div>
      ))}
    </div>
  ),
}

/**
 * Colour on a Badge is decorative. The moment it carries meaning — a currency, an
 * account — the thing needs its own component, so the semantic token layer stays the
 * source of that meaning instead of a `tone` chosen at the call site.
 */
export const WhenColourCarriesMeaning: Story = {
  name: 'When colour carries meaning',
  render: () => (
    <div style={{ display: 'flex', gap: 8, alignItems: 'center', flexWrap: 'wrap' }}>
      <CurrencyBadge currency="USD" />
      <CurrencyBadge currency="COP" />
      <AccountBadge account={{ id: 'ARQ' }} label="ARQ" />
      <AccountBadge account={{ id: 'x', color: 'teal' }} label="Bancolombia" />
    </div>
  ),
}
