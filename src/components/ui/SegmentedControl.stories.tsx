import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Landmark, Wallet, CreditCard } from 'lucide-react'
import { SegmentedControl } from './SegmentedControl'

const meta = { title: 'Formularios/SegmentedControl', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const DosYTres: Story = {
  render: () => {
    const [a, setA] = useState<'COP' | 'USD'>('COP')
    const [b, setB] = useState<'account' | 'cash' | 'credit'>('account')
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 420 }}>
        <SegmentedControl ariaLabel="Moneda" value={a} onChange={setA}
          options={[{ value: 'COP', label: 'COP' }, { value: 'USD', label: 'USD' }] as const} />
        <SegmentedControl ariaLabel="Tipo" value={b} onChange={setB} className="w-full"
          options={[
            { value: 'account', label: 'Cuenta', icon: <Landmark size={12} /> },
            { value: 'cash', label: 'Efectivo', icon: <Wallet size={12} /> },
            { value: 'credit', label: 'Crédito', icon: <CreditCard size={12} /> },
          ] as const} />
      </div>
    )
  },
}

/** Segments fill the track, so every option is the same width whatever its label. */
export const AnchosIguales: Story = {
  name: 'Anchos iguales, etiquetas desiguales',
  render: () => {
    const [v, setV] = useState('a')
    return (
      <SegmentedControl ariaLabel="Desiguales" value={v} onChange={setV} className="w-full"
        options={[{ value: 'a', label: 'A' }, { value: 'b', label: 'Etiqueta larguísima' }, { value: 'c', label: 'Media' }]} />
    )
  },
}
