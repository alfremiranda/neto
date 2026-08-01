import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Text comes from the Control/* styles, carried by the size variants — not from
// `text-*` utilities here. Utilities outrank the .ts-* classes, so as long as
// this component set its own size/weight, a `ts-control-*` at a call site was
// silently dead (design-system/docs/03-typography.md §"Control/").
const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-full border border-transparent whitespace-nowrap transition-all duration-100 active:scale-95 outline-none select-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:          "bg-btn-filled text-btn-filled-fg hover:bg-btn-filled-hover",
        outline:          "border-btn-outline bg-transparent text-btn-outline-fg hover:bg-btn-outline-hover",
        secondary:        "bg-secondary text-secondary-foreground hover:opacity-90",
        ghost:            "bg-transparent text-btn-ghost-fg hover:bg-btn-ghost-hover",
        destructive:      "bg-btn-danger-filled text-btn-danger-filled-fg hover:bg-btn-danger-filled-hover",
        "outline-danger": "border-btn-danger bg-transparent text-btn-danger-fg hover:bg-btn-danger-hover",
        "ghost-danger":   "bg-transparent text-btn-danger-fg hover:bg-btn-danger-hover",
        link:             "text-primary underline-offset-4 hover:underline border-none",
      },
      /* Every size is a pill — the base class carries rounded-full. Ratified
         2026-08-01; the graduated 10/12/14/16 scale these comments used to cite
         was retired (design-system/docs/06-radius-map.md). Heights stay as they
         were; only the radius changed. */
      /* Each size carries its Control/* style. Every size in use keeps the exact
         font size it had — default/lg 14px, sm 12px, xl 16px — so this is a
         line-height and tracking change, not a resize. `xs` had no Control rung
         at 11px and no usages either; it takes Control/XS (10) rather than
         inventing a step. Icon sizes bind no text style: they hold no text. */
      size: {
        default:   "h-9 px-[14px] gap-2 ts-control-md [&_svg]:size-4",                       /* Figma LG  36px */
        xs:        "h-6 px-2 gap-1 ts-control-xs [&_svg]:size-3",                            /* Figma SM  24px */
        sm:        "h-7 px-[10px] ts-control-sm [&_svg]:size-3",                             /* Figma MD  28px */
        lg:        "h-10 px-5 gap-2 ts-control-md [&_svg]:size-4",
        xl:        "h-11 px-[18px] gap-2 ts-control-lg [&_svg]:size-5",                           /* Figma XL  44px */
        icon:      "size-9",                                                                 /* 36px */
        "icon-sm": "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:size-8",              /* 32px */
        "icon-xs": "size-6",                                                                 /* 24px */
        "icon-lg": "size-10",                                                                /* 40px */
      },
    },
    defaultVariants: {
      variant: "default",
      size: "default",
    },
  }
)

function Button({
  className,
  variant,
  size,
  asChild = false,
  ...props
}: React.ComponentProps<"button"> &
  VariantProps<typeof buttonVariants> & { asChild?: boolean }) {
  const Comp = asChild ? Slot.Root : "button"
  return (
    <Comp
      data-slot="button"
      className={cn(buttonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { Button, buttonVariants }
