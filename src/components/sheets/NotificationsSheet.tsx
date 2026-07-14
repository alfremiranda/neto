import { BellOff } from 'lucide-react'
import { SheetBase } from '@/components/ui/SheetBase'
import { useNotifications, type NotificationItem, type NotificationBucket } from '@/hooks/useNotifications'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { COP, USD, fmtDate } from '@/lib/format'
import { EGRESO_CATEGORIAS } from '@/data/defaults'
import { cn } from '@/lib/utils'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

const BUCKET_LABEL: Record<NotificationBucket, string> = {
  overdue: 'Vencidos',
  today: 'Vence hoy',
  upcoming: 'Próximos',
}

function CategoryIcon({ category }: { category: string }) {
  const cat = EGRESO_CATEGORIAS.find(c => c.id === category)
    ?? EGRESO_CATEGORIAS.find(c => c.id === 'otro')
    ?? EGRESO_CATEGORIAS[0]
  const Icon = cat.icon
  return (
    <span
      className="w-8 h-8 rounded-xl flex items-center justify-center shrink-0"
      style={{ background: `var(${cat.bgColor})`, color: `var(${cat.color})` }}
    >
      <Icon size={14} strokeWidth={2} />
    </span>
  )
}

function timing(item: NotificationItem): string {
  if (item.bucket === 'today') return 'Vence hoy'
  if (item.bucket === 'overdue') {
    const d = -item.days
    return d === 1 ? 'Venció ayer' : `Vencido hace ${d} d`
  }
  const label = item.days === 1 ? 'Mañana' : `En ${item.days} d`
  return `${label} · ${fmtDate(item.date)}`
}

export function NotificationsSheet() {
  const { items } = useNotifications()
  const { setCurKey } = useFinanceStore()
  const { setEditingEgreso, openSheet } = useUIStore()

  const groups: NotificationBucket[] = ['overdue', 'today', 'upcoming']

  function openEgreso(item: NotificationItem) {
    setCurKey(item.monthKey)
    setEditingEgreso(item.egresoId)
    openSheet('egreso')
  }

  return (
    <SheetBase id="notifications" title="Notificaciones">
      {items.length === 0 ? (
        <Empty className="border-0 py-8">
          <EmptyHeader>
            <EmptyMedia variant="icon"><BellOff size={16} /></EmptyMedia>
            <EmptyTitle>Sin notificaciones</EmptyTitle>
            <EmptyDescription>No tienes pagos programados pendientes</EmptyDescription>
          </EmptyHeader>
        </Empty>
      ) : (
        <div className="space-y-4">
          {groups.map(bucket => {
            const list = items.filter(i => i.bucket === bucket)
            if (list.length === 0) return null
            return (
              <div key={bucket}>
                <div className="text-[11px] font-semibold uppercase tracking-wide text-muted-foreground mb-1.5 px-1">
                  {BUCKET_LABEL[bucket]}
                </div>
                <div className="rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
                  {list.map(item => {
                    const amtCOP = item.currency === 'USD' ? null : item.amount
                    return (
                      <button
                        key={`${item.monthKey}-${item.egresoId}`}
                        type="button"
                        onClick={() => openEgreso(item)}
                        className="w-full text-left flex items-center gap-3 px-3 py-2.5 hover:bg-muted/50 transition-colors"
                      >
                        <CategoryIcon category={item.category} />
                        <div className="flex-1 min-w-0">
                          <div className="text-sm font-medium leading-snug truncate">{item.desc}</div>
                          <div className={cn(
                            'text-[11px] leading-snug',
                            bucket === 'overdue' ? 'text-[var(--color-danger-txt)]'
                              : bucket === 'today' ? 'text-[var(--color-tax-txt)]'
                              : 'text-muted-foreground',
                          )}>
                            {timing(item)}
                          </div>
                        </div>
                        <div className="text-right shrink-0">
                          <div className="text-sm font-semibold tabular-nums font-mono">
                            {item.currency === 'USD' ? USD(item.amount) : COP(amtCOP!)}
                          </div>
                        </div>
                      </button>
                    )
                  })}
                </div>
              </div>
            )
          })}
        </div>
      )}
    </SheetBase>
  )
}
