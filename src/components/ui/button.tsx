import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-[14px] border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
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
      size: {
        default:   "h-9 px-[14px] gap-2 [&_svg]:size-4",                                        /* Figma LG  36px r=14px */
        xs:        "h-6 px-2 text-[11px] rounded-[10px] gap-1 [&_svg]:size-3",                  /* Figma SM  24px r=10px */
        sm:        "h-7 px-[10px] text-[12px] rounded-[12px] [&_svg]:size-3",                   /* Figma MD  28px r=12px */
        lg:        "h-10 px-5 gap-2 [&_svg]:size-4",
        xl:        "h-11 px-4 text-base gap-2 [&_svg]:size-5 rounded-[16px]",                   /* Figma XL  44px r=16px */
        icon:      "size-9",                                                                      /* 36px → r=14px (base) */
        "icon-sm": "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:size-8 rounded-[14px]", /* 32px → LG r=14px */
        "icon-xs": "size-6 rounded-[10px]",                                                      /* 24px → SM r=10px */
        "icon-lg": "size-10 rounded-[16px]",                                                     /* 40px → XL r=16px */
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
