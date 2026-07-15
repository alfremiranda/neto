import * as React from "react"

import { cn } from "@/lib/utils"

function Input({ className, type, ...props }: React.ComponentProps<"input">) {
  return (
    <input
      type={type}
      data-slot="input"
      className={cn(
        "flex h-11 sm:h-9 w-full min-w-0 rounded-sm border border-input bg-[var(--card)] px-3 text-base sm:text-sm text-foreground transition-colors outline-none placeholder:text-muted-foreground focus-visible:border-2 focus-visible:border-foreground disabled:pointer-events-none disabled:cursor-not-allowed disabled:opacity-50 aria-invalid:border-destructive dark:aria-invalid:border-destructive/50",
        className
      )}
      {...props}
    />
  )
}

export { Input }
