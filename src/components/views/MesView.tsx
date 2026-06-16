import { KPIStrip } from '@/components/cards/KPIStrip'
import { DistribucionCard } from '@/components/cards/DistribucionCard'
import { MovimientosCard } from '@/components/cards/MovimientosCard'
import { IngresosCard } from '@/components/cards/IngresosCard'
import { EgresosCard } from '@/components/cards/EgresosCard'
import { ObligacionesCard } from '@/components/cards/ObligacionesCard'
import { ProvisionesCard } from '@/components/cards/ProvisionesCard'
import { MonthNav } from '@/components/layout/MonthNav'

export function MesView() {
  return (
    <div>
      <div className="mb-4">
        <MonthNav />
      </div>

      {/* ── Insights del mes ──────────────────────────────── */}
      <KPIStrip />
      <DistribucionCard />

      {/* ── Ingresos + Movimientos ────────────────────────── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <IngresosCard />
        <MovimientosCard />
      </div>

      {/* ── Obligaciones + Provisiones ───────────────────── */}
      <div className="grid md:grid-cols-2 gap-4 mb-4">
        <ObligacionesCard />
        <ProvisionesCard />
      </div>

      {/* ── Egresos ──────────────────────────────────────── */}
      <div className="mb-4">
        <EgresosCard />
      </div>
    </div>
  )
}
