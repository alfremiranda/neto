import * as React from "react"
import { Slot } from "radix-ui"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

const buttonVariants = cva(
  "inline-flex shrink-0 items-center justify-center gap-1.5 rounded-lg border border-transparent text-sm font-medium whitespace-nowrap transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-50 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        default:     "bg-primary text-primary-foreground hover:opacity-90",
        outline:     "border-border bg-background hover:bg-[var(--muted)] hover:text-[var(--foreground)]",
        secondary:   "bg-secondary text-secondary-foreground hover:opacity-90",
        ghost:       "hover:bg-[var(--accent)] hover:text-[var(--foreground)]",
        destructive: "bg-destructive text-white hover:opacity-90",
        link:        "text-primary underline-offset-4 hover:underline border-none",
      },
      size: {
        default:   "h-8 px-3",
        xs:        "h-6 px-2 text-xs rounded-md",
        sm:        "h-7 px-2.5 text-xs rounded-md",
        lg:        "h-9 px-4",
        icon:      "size-9 sm:size-9",
        "icon-sm": "min-h-[44px] min-w-[44px] sm:min-h-0 sm:min-w-0 sm:size-8 rounded-md",
        "icon-xs": "size-6 rounded-md",
        "icon-lg": "size-10",
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
