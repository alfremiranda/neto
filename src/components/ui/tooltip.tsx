import * as React from "react"
import { Tooltip as TooltipPrimitive } from "radix-ui"

import { cn } from "@/lib/utils"

function TooltipProvider({
  delayDuration = 0,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Provider>) {
  return (
    <TooltipPrimitive.Provider
      data-slot="tooltip-provider"
      delayDuration={delayDuration}
      {...props}
    />
  )
}

function Tooltip({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Root>) {
  return <TooltipPrimitive.Root data-slot="tooltip" {...props} />
}

function TooltipTrigger({
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Trigger>) {
  return <TooltipPrimitive.Trigger data-slot="tooltip-trigger" {...props} />
}

/**
 * The bubble's surface, in ONE place.
 *
 * A chart tooltip cannot hang off a Radix trigger — it follows the cursor across an SVG,
 * so it mounts itself. It still has to BE this bubble: same inversion, same cap. Design's
 * whole reason for making Content an instance-swap rather than forking the bubble was to
 * keep the inversion from being defined twice, and a hand-rolled chart bubble would have
 * defined it a third time.
 */
export const TOOLTIP_SURFACE =
  "w-fit max-w-xs rounded-md bg-foreground px-3 py-1.5 ts-detail-large text-background"

function TooltipContent({
  className,
  sideOffset = 0,
  children,
  ...props
}: React.ComponentProps<typeof TooltipPrimitive.Content>) {
  return (
    <TooltipPrimitive.Portal>
      <TooltipPrimitive.Content
        data-slot="tooltip-content"
        sideOffset={sideOffset}
        className={cn(
          "z-50 inline-flex items-center gap-1.5", TOOLTIP_SURFACE,
          className
        )}
        {...props}
      >
        {children}
        <TooltipPrimitive.Arrow style={{ fill: 'var(--foreground)' }} className="size-2.5" />
      </TooltipPrimitive.Content>
    </TooltipPrimitive.Portal>
  )
}

export { Tooltip, TooltipContent, TooltipProvider, TooltipTrigger }
