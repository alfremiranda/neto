import { PiggyBank } from 'lucide-react'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { COP } from '@/lib/format'
import { retencionReserve } from '@/lib/obligations'
import { SectionCard } from '@/components/ui/SectionCard'
import { Progress } from '@/components/ui/Progress'

/**
 * Retención for the year: what it has accrued against what is actually set aside.
 *
 * Not a variant of SavingsCard. That one shows a balance; target-against-actual is a
 * different job, and folding it in would make one component mean two things.
 *
 * The GAP is the headline — accrued and reserved are its context. A payment to the DIAN
 * comes once a year, so a countdown would say nothing useful for eleven months; what
 * matters every month is whether the money is there when it arrives.
 *
 * `reserved` counts MARKED transfers rather than the destination account's balance,
 * because personal savings share ARQ Savings and a balance would quietly report the user
 * as covered when they are not.
 */
export function ReservaCard({ year }: { year: number }) {
  const { db, getSMMLV } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)

  const r = retencionReserve(db, year, deductions, getSMMLV)
  if (r.accrued <= 0) return null

  const covered = r.gap <= 0

  return (
    <SectionCard icon={PiggyBank} title={`Retención ${year}`}>
      <div className="space-y-3">

        <div className="flex items-baseline justify-between gap-3">
          <span className="ts-body-small text-muted-foreground">Causado en el año</span>
          <span className="ts-amount-small">{COP(r.accrued)}</span>
        </div>
        <div className="flex items-baseline justify-between gap-3">
          <span className="ts-body-small text-muted-foreground">Reservado</span>
          <span className="ts-amount-small">{COP(r.reserved)}</span>
        </div>

        <div className="pt-1 border-t border-[var(--border)]">
          <div className="flex items-baseline justify-between gap-3 pt-2">
            {/* Always the gap, even at zero. "Faltante $0" is a fact the user can act
                on — it says the money is there; swapping the label for "Cubierto" and
                the figure for something else would make the headline mean two different
                quantities depending on the state. */}
            <span className="ts-body-base-emphasis">Faltante</span>
            <span className={`ts-amount-large ${covered ? 'text-[var(--color-provision)]' : 'text-[var(--color-tax-txt)]'}`}>
              {COP(r.gap)}
            </span>
          </div>
          {/* The bar never appears without its number — on its own it says nothing to
              anyone who cannot compare two lengths by eye. */}
          <Progress
            className="mt-2"
            value={r.pct}
            tone="provision"
            label={`${Math.round(r.pct * 100)}% de la retención del año reservado`}
          />
          <div className="ts-body-small text-muted-foreground mt-1.5">
            {Math.round(r.pct * 100)}% reservado
            {r.settled > 0 && ` · pagado a la DIAN ${COP(r.settled)}`}
          </div>
        </div>

      </div>
    </SectionCard>
  )
}
