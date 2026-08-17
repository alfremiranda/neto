import { cva, type VariantProps } from "class-variance-authority"
import { cn } from "@/lib/utils"

/**
 * User avatar. Falls back to initials on the avatar/background token when there
 * is no image (design-system/components/avatar.html).
 *
 * Every value comes from the avatar/* tokens rather than utilities: the sizes
 * are 32 · 40 · 48 · 56 and the initials are sized per rung (12 · 14 · 16 · 18),
 * which is why they cannot be a single text style. Before this component the
 * same img/initials fallback was written in three places at three sizes, and the
 * header's initials shipped at 10px where the SM rung says 12.
 */
const avatarVariants = cva(
  "relative shrink-0 inline-flex items-center justify-center overflow-hidden rounded-full bg-[var(--avatar-background)] text-[var(--avatar-foreground)] font-semibold select-none",
  {
    variants: {
      size: {
        sm: "w-[var(--avatar-size-sm)] h-[var(--avatar-size-sm)] text-[length:var(--avatar-font-size-sm)]",
        md: "w-[var(--avatar-size-md)] h-[var(--avatar-size-md)] text-[length:var(--avatar-font-size-md)]",
        lg: "w-[var(--avatar-size-lg)] h-[var(--avatar-size-lg)] text-[length:var(--avatar-font-size-lg)]",
        xl: "w-[var(--avatar-size-xl)] h-[var(--avatar-size-xl)] text-[length:var(--avatar-font-size-xl)]",
      },
      bordered: {
        true: "border border-[var(--avatar-border)]",
        false: "",
      },
    },
    defaultVariants: { size: "md", bordered: true },
  },
)

type AvatarProps = React.ComponentProps<"span"> &
  VariantProps<typeof avatarVariants> & {
    /** Image URL. Falls back to `initials` when absent. */
    src?: string | null
    /** Alt text for the image, and the accessible name of the fallback. */
    name: string
    /** Shown when there is no image. */
    initials: string
  }

function Avatar({ className, size, bordered, src, name, initials, ...props }: AvatarProps) {
  return (
    <span
      data-slot="avatar"
      className={cn(avatarVariants({ size, bordered }), className)}
      {...props}
    >
      {src
        ? <img src={src} alt={name} className="w-full h-full object-cover" />
        : <span aria-label={name}>{initials}</span>}
    </span>
  )
}

export { Avatar, avatarVariants }
