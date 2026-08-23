import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar } from './calendar'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './tooltip'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'

const meta = { title: 'Overlays/Calendario y flotantes', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

export const Calendario: Story = {
  render: () => {
    const [d, setD] = useState<Date | undefined>(new Date(2026, 7, 19))
    return <Calendar mode="single" selected={d} onSelect={setD} defaultMonth={new Date(2026, 7)} />
  },
}

/**
 * Rendered open. A story that only shows the trigger tests nothing: the surface worth
 * looking at is the panel, and it is the part nobody sees until it is on screen.
 */
export const Flotantes: Story = {
  render: () => (
    <TooltipProvider>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', minHeight: 220 }}>
        <Tooltip open>
          <TooltipTrigger asChild><Button variant="outline">Con tooltip</Button></TooltipTrigger>
          <TooltipContent side="bottom">Texto de ayuda</TooltipContent>
        </Tooltip>

        <Popover open>
          <PopoverTrigger asChild><Button variant="outline">Con popover</Button></PopoverTrigger>
          <PopoverContent side="bottom" align="start">
            <p className="ts-body-small-emphasis">Título del panel</p>
            <p className="ts-body-small text-muted-foreground">Una línea de contenido.</p>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  ),
}
