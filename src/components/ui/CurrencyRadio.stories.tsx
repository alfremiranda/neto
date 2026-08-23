import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { CurrencyRadio } from './CurrencyRadio'

const meta = { title: 'Forms/CurrencyRadio', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', gap: 12, maxWidth: 460 }}>
      <CurrencyRadio code="COP" description="Peso colombiano" flag="🇨🇴" selected={false} onSelect={() => {}} />
      <CurrencyRadio code="USD" description="Dólar americano" flag="🇺🇸" selected onSelect={() => {}} />
      <CurrencyRadio code="EUR" description="Disabled" flag="🇪🇺" selected={false} onSelect={() => {}} disabled />
    </div>
  ),
}

export const Interactive: Story = {
  render: () => {
    const [v, setV] = useState('COP')
    return (
      <div role="radiogroup" aria-label="Moneda" style={{ display: 'flex', gap: 12, maxWidth: 360 }}>
        {[['COP', 'Peso colombiano', '🇨🇴'], ['USD', 'Dólar americano', '🇺🇸']].map(([c, d, f]) => (
          <CurrencyRadio key={c} code={c} description={d} flag={f} selected={v === c} onSelect={() => setV(c)} />
        ))}
      </div>
    )
  },
}
