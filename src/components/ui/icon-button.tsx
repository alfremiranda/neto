import * as React from "react"
import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

// Figma: Icon Button — node 30:259
// Sizes: SM=24px/6px-r/12px-icon, MD=28px/8px-r/12px-icon, LG=36px/8px-r/16px-icon, XL=44px/8px-r/20px-icon
const iconButtonVariants = cva(
  "inline-flex shrink-0 items-center justify-center border border-transparent transition-all outline-none select-none focus-visible:ring-2 focus-visible:ring-ring disabled:pointer-events-none disabled:opacity-60 [&_svg]:pointer-events-none [&_svg]:shrink-0",
  {
    variants: {
      variant: {
        filled:           "bg-btn-filled text-btn-filled-fg hover:bg-btn-filled-hover",
        outline:          "border-btn-outline bg-transparent text-btn-outline-fg hover:bg-btn-outline-hover",
        ghost:            "bg-transparent text-btn-ghost-fg hover:bg-btn-ghost-hover",
        "filled-danger":  "bg-btn-danger-filled text-btn-danger-filled-fg hover:bg-btn-danger-filled-hover",
        "outline-danger": "border-btn-danger bg-transparent text-btn-danger-fg hover:bg-btn-danger-hover",
        "ghost-danger":   "bg-transparent text-btn-danger-fg hover:bg-btn-danger-hover",
      },
      size: {
        sm: "size-6 rounded-[6px] [&_svg]:size-3",   // 24px, r=6px, icon=12px
        md: "size-7 rounded-[8px] [&_svg]:size-3",   // 28px, r=8px, icon=12px
        lg: "size-9 rounded-[8px] [&_svg]:size-4",   // 36px, r=8px, icon=16px
        xl: "size-11 rounded-[8px] [&_svg]:size-5",  // 44px, r=8px, icon=20px
      },
    },
    defaultVariants: {
      variant: "ghost",
      size: "lg",
    },
  }
)

function IconButton({
  className,
  variant,
  size,
  ...props
}: React.ComponentProps<"button"> & VariantProps<typeof iconButtonVariants>) {
  return (
    <button
      type="button"
      data-slot="icon-button"
      className={cn(iconButtonVariants({ variant, size, className }))}
      {...props}
    />
  )
}

export { IconButton, iconButtonVariants }
