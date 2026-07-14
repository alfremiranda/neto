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
      <div className="mb-4">
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
