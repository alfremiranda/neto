import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Briefcase, UserRound, Layers } from 'lucide-react'
import { ChoiceRow } from './ChoiceRow'

const meta = { title: 'Rows/ChoiceRow', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
      <ChoiceRow label="Unselected" selected={false} onSelect={() => {}} />
      <ChoiceRow label="Selected" selected onSelect={() => {}} />
      <ChoiceRow label="With a description" description="A line explaining the option" selected={false} onSelect={() => {}} />
      <ChoiceRow label="With media" description="Leading tile" media={<Briefcase size={17} />} selected onSelect={() => {}} />
      <ChoiceRow label="Disabled" selected={false} onSelect={() => {}} disabled />
    </div>
  ),
}

/**
 * `23-onboarding-motion.md`: nothing resizes on selection. A list where the chosen item
 * grows moves every other item, and the eye follows the movement instead of the choice.
 *
 * The two columns hold the same rows, selected and not. Any height difference between
 * them is the defect, and a visual diff catches it without anyone measuring.
 */
export const SelectionDoesNotResize: Story = {
  name: 'Selection — nothing resizes',
  render: () => {
    const opts = [
      { label: 'Empleado', desc: 'Recibo salario', Icon: Briefcase },
      { label: 'Independiente', desc: 'Manejo mis propios aportes', Icon: UserRound },
      { label: 'Ambos', desc: 'Salario y trabajo independiente', Icon: Layers },
    ]
    return (
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 16 }}>
        {[false, true].map(sel => (
          <div key={String(sel)} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
            {opts.map(o => (
              <ChoiceRow key={o.label} label={o.label} description={o.desc}
                media={<o.Icon size={17} />} selected={sel} onSelect={() => {}} />
            ))}
          </div>
        ))}
      </div>
    )
  },
}

export const Interactive: Story = {
  render: () => {
    const [v, setV] = useState('a')
    return (
      <div role="radiogroup" aria-label="Demo" style={{ display: 'flex', flexDirection: 'column', gap: 8, maxWidth: 420 }}>
        {['a', 'b', 'c'].map(k => (
          <ChoiceRow key={k} label={`Option ${k.toUpperCase()}`} selected={v === k} onSelect={() => setV(k)} />
        ))}
      </div>
    )
  },
}
