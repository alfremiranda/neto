import { Landmark, ShieldCheck } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { calcTotales, calcIBC, calcGastos, calcAllDeductions, calcProvisionBase } from '@/lib/calc'
import { COP, USD } from '@/lib/format'
import { cn } from '@/lib/utils'
import { SectionCard } from '@/components/ui/SectionCard'
import { Empty, EmptyHeader, EmptyMedia, EmptyTitle, EmptyDescription } from '@/components/ui/empty'

interface ItemRowProps {
  label: string
  amount: number
  badge: string
  color: string
  dim?: boolean
}

function ItemRow({ label, amount, badge, color, dim }: ItemRowProps) {
  return (
    <div className={cn(
      'flex items-center gap-2.5 py-2 border-b border-[var(--border)] last:border-0',
      dim && 'opacity-35'
    )}>
      <span className="w-1.5 h-1.5 rounded-full shrink-0" style={{ background: `var(${color})` }} />
      <span className="text-sm text-foreground flex-1 truncate">{label}</span>
      <span className="text-[10px] text-muted-foreground tabular-nums font-mono shrink-0">{badge}</span>
      <span className="text-sm font-semibold tabular-nums font-heading text-right shrink-0 min-w-[6.5rem]">
        {COP(amount)}
      </span>
    </div>
  )
}

function GroupBox({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="rounded-lg bg-muted overflow-hidden">
      <div className="px-3 pt-2 pb-0.5 text-[10px] font-semibold uppercase tracking-wide text-muted-foreground/70">
        {label}
      </div>
      <div className="px-3">
        {children}
      </div>
    </div>
  )
}

export function ObligacionesCard() {
  const { getCurrentMonth, getSMMLV, curKey } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const month = getCurrentMonth()
  const [y, m] = curKey.split('-').map(Number)
  const smmlv = getSMMLV(y)

  const { totUSD, bruto } = calcTotales(month.incomes, month.trm)
  const ibc  = calcIBC(month.incomes, month.trm, smmlv)
  const gast = calcGastos(month.egresos || [], month.trm)
  const provBase = calcProvisionBase(month.incomes, month.trm, ibc)
  const res  = calcAllDeductions(bruto, ibc, m, deductions, gast, month.trm, month.voluntarias, provBase)

  const ibcIsMin   = ibc <= smmlv * 1.001
  const showUSD    = totUSD > 0
  const retefuente = res.provItems.filter(i => i.id === 'retencion' && i.applies)
  const totalOblig = res.ssTotal + retefuente.reduce((a, i) => a + i.amount, 0)

  if (bruto === 0) {
    return (
      <SectionCard icon={Landmark} title="Obligaciones tributarias">
        <Empty className="border-0 py-2">
          <EmptyHeader>
            <EmptyMedia variant="icon"><ShieldCheck size={14} /></EmptyMedia>
            <EmptyTitle>Sin obligaciones</EmptyTitle>
            <EmptyDescription>Registra ingresos para calcular SS y retención</EmptyDescription>
          </EmptyHeader>
        </Empty>
      </SectionCard>
    )
  }

  const totalAction = (
    <div className="text-right">
      <div className="text-base font-bold font-heading tabular-nums text-[var(--color-tax-txt)]">
        {COP(totalOblig)}
      </div>
      {showUSD && (
        <div className="text-[10px] text-muted-foreground tabular-nums">{USD(totalOblig / month.trm)}</div>
      )}
    </div>
  )

  return (
    <SectionCard icon={Landmark} title="Obligaciones tributarias" action={totalAction}>

      {/* IBC context line */}
      <div className="flex items-center gap-1.5 text-xs text-muted-foreground mb-3 pb-3 border-b border-[var(--border)]">
        <span className="font-medium">IBC</span>
        <span className="text-muted-foreground/40">·</span>
        <span className="font-mono font-semibold tabular-nums text-foreground">{COP(ibc)}</span>
        <span className="ml-auto text-[10px] text-muted-foreground/60">
          {ibcIsMin ? 'mínimo SMMLV' : '40% servicios'}
        </span>
      </div>

      <div className="space-y-2">
        {/* SS group */}
        {res.ssItems.length > 0 && (
          <GroupBox label="Seguridad Social">
            {res.ssItems.map(item => (
              <ItemRow
                key={item.id}
                label={item.label}
                amount={item.amount}
                badge={`${item.pct}%`}
                color={item.color}
              />
            ))}
          </GroupBox>
        )}

        {/* Retención group */}
        {retefuente.length > 0 && (
          <GroupBox label="Retención en la fuente">
            {retefuente.map(item => (
              <ItemRow
                key={item.id}
                label={item.label}
                amount={item.amount}
                badge={`${item.pct}%`}
                color={item.color}
              />
            ))}
          </GroupBox>
        )}
      </div>

    </SectionCard>
  )
}
