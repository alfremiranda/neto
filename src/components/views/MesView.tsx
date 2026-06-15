import { MovimientosCard } from '@/components/cards/MovimientosCard'
import { IngresosCard } from '@/components/cards/IngresosCard'
import { EgresosCard } from '@/components/cards/EgresosCard'
import { DistribucionCard } from '@/components/cards/DistribucionCard'
import { ObligacionesCard } from '@/components/cards/ObligacionesCard'
import { FlujoCard } from '@/components/cards/FlujoCard'

export function MesView() {
  return (
    <div className="space-y-[10px]">
      <MovimientosCard />
      <IngresosCard />
      <EgresosCard />
      <div className="grid grid-cols-2 gap-[10px] sm:grid-cols-2 grid-cols-1">
        <DistribucionCard />
        <ObligacionesCard />
      </div>
      <FlujoCard />
    </div>
  )
}
