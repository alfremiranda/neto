import type { LucideIcon } from 'lucide-react'
import type { ReactNode } from 'react'
import { Card } from '@/components/ui/card'
import { cn } from '@/lib/utils'

interface SectionCardProps {
  icon: LucideIcon
  title: string
  action?: ReactNode
  children: ReactNode
  className?: string
}

export function SectionCard({ icon: Icon, title, action, children, className }: SectionCardProps) {
  return (
    <Card className={cn("overflow-visible", className)}>
      <div className="flex items-center justify-between px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 text-foreground">
          <Icon size={15} className="text-muted-foreground shrink-0" />
          <span className="text-sm font-semibold font-heading leading-none">{title}</span>
        </div>
        {action}
      </div>
      <div className="px-4 pb-4">{children}</div>
    </Card>
  )
}
