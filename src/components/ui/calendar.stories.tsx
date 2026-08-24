import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { Calendar } from './calendar'
import { Tooltip, TooltipProvider, TooltipTrigger, TooltipContent } from './tooltip'
import { Popover, PopoverTrigger, PopoverContent } from './popover'
import { Button } from './button'

const meta = { title: 'Overlays/Calendar and floating', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * `today` is pinned, not left to the clock. DayPicker marks the real current date, so this
 * story changed appearance at midnight and the visual regression reported 1720 changed
 * pixels — a true diff of a story that had no business moving. A library page that drifts
 * daily teaches people to wave the detector through.
 */
export const CalendarStory: Story = {
  render: () => {
    const [d, setD] = useState<Date | undefined>(new Date(2026, 7, 19))
    return (
      <Calendar
        mode="single"
        selected={d}
        onSelect={setD}
        defaultMonth={new Date(2026, 7)}
        today={new Date(2026, 7, 19)}
      />
    )
  },
}

/**
 * Rendered open. A story that only shows the trigger tests nothing: the surface worth
 * looking at is the panel, and it is the part nobody sees until it is on screen.
 */
export const Floating: Story = {
  render: () => (
    <TooltipProvider>
      <div style={{ display: 'flex', gap: 24, alignItems: 'flex-start', minHeight: 220 }}>
        <Tooltip open>
          <TooltipTrigger asChild><Button variant="outline">With tooltip</Button></TooltipTrigger>
          <TooltipContent side="bottom">Help text</TooltipContent>
        </Tooltip>

        <Popover open>
          <PopoverTrigger asChild><Button variant="outline">With popover</Button></PopoverTrigger>
          <PopoverContent side="bottom" align="start">
            <p className="ts-body-small-emphasis">Panel title</p>
            <p className="ts-body-small text-muted-foreground">One line of content.</p>
          </PopoverContent>
        </Popover>
      </div>
    </TooltipProvider>
  ),
}
