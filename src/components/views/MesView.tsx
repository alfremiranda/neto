import { KPIStrip } from '@/components/cards/KPIStrip'
import { DistribucionCard } from '@/components/cards/DistribucionCard'
import { MovimientosCard } from '@/components/cards/MovimientosCard'
import { IngresosCard } from '@/components/cards/IngresosCard'
import { EgresosCard } from '@/components/cards/EgresosCard'
import { ObligacionesCard } from '@/components/cards/ObligacionesCard'
import { ProvisionesCard } from '@/components/cards/ProvisionesCard'
import { MonthNav } from '@/components/layout/MonthNav'
import { useDeductionGroups } from '@/hooks/useDeductionGroups'
import { cn } from '@/lib/utils'

export function MesView() {
  const { showObligaciones, showProvisiones, showDistribucion } = useDeductionGroups()
  const bothOblig = showObligaciones && showProvisiones

  return (
    <div>
      <div className="sticky top-0 z-30 mb-4 -mx-4 sm:-mx-5 lg:-mx-6 -mt-4 sm:-mt-5 lg:-mt-6 px-4 sm:px-5 lg:px-6 py-3 bg-[var(--background)]/80 backdrop-blur-md border-b border-[var(--border)]">
        <MonthNav />
      </div>

      {/* ── Insights del mes ──────────────────────────────── */}
      <KPIStrip />
      {showDistribucion && <DistribucionCard />}

      {/* ── Ingresos + Movimientos ────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <IngresosCard />
        <MovimientosCard />
      </div>

      {/* ── Obligaciones + Provisiones ───────────────────── */}
      {(showObligaciones || showProvisiones) && (
        <div className={cn('grid gap-4 mb-4', bothOblig && 'md:grid-cols-2')}>
          {showObligaciones && <ObligacionesCard />}
          {showProvisiones && <ProvisionesCard />}
        </div>
      )}

      {/* ── Egresos ──────────────────────────────────────── */}
      <div className="mb-4">
        <EgresosCard />
      </div>
    </div>
  )
}
