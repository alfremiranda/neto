import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountRow } from './AccountRow'
import { CurrencyBadge } from './Badge'

const meta = { title: 'Rows/AccountRow', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * The axis is fixed|user, not selected. The leading check is always on — it states a fact,
 * that the account is included — and what varies is whether the person can take it out.
 * Calling the axis `selected` would make the check and the brand wash look like the same
 * state when they are not.
 */
export const Types: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 460 }}>
      <AccountRow type="fixed" label="Efectivo" description="Siempre incluida"
        badge={<CurrencyBadge currency="COP" />} />
      <AccountRow type="user" label="Bancolombia Ahorros" description="Cuenta bancaria"
        badge={<CurrencyBadge currency="COP" />} onRemove={() => {}} />
      <AccountRow type="user" label="Visa Bancolombia" description="Tarjeta de crédito · cupo 2.000.000"
        badge={<CurrencyBadge currency="USD" />} onRemove={() => {}} />
      <AccountRow type="user"
        label="Bancolombia Ahorros Cuenta Nómina Principal Empresarial Extra Larga"
        description="The name truncates, the row does not grow"
        badge={<CurrencyBadge currency="COP" />} onRemove={() => {}} />
    </div>
  ),
}
