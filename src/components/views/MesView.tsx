import { useState } from 'react'
import { KPIStrip } from '@/components/cards/KPIStrip'
import { DistribucionCard } from '@/components/cards/DistribucionCard'
import { MovimientosCard } from '@/components/cards/MovimientosCard'
import { IngresosCard } from '@/components/cards/IngresosCard'
import { EgresosCard } from '@/components/cards/EgresosCard'
import { ObligacionesCard } from '@/components/cards/ObligacionesCard'
import { ProvisionesCard } from '@/components/cards/ProvisionesCard'
import { useDeductionGroups } from '@/hooks/useDeductionGroups'
import { cn } from '@/lib/utils'

type TabId = 'ingresos' | 'gastos' | 'movimientos' | 'tributarias' | 'provisiones'

export function MesView() {
  const { showObligaciones, showProvisiones, showDistribucion } = useDeductionGroups()

  // Only surface deduction tabs to users who have those groups configured.
  const tabs: { id: TabId; label: string }[] = [
    { id: 'ingresos',    label: 'Ingresos' },
    { id: 'gastos',      label: 'Gastos' },
    { id: 'movimientos', label: 'Movimientos' },
    ...(showObligaciones ? [{ id: 'tributarias' as TabId, label: 'Tributarias' }] : []),
    ...(showProvisiones  ? [{ id: 'provisiones' as TabId, label: 'Provisiones' }] : []),
  ]

  const [tab, setTab] = useState<TabId>('ingresos')
  // Fall back if the active tab's group got disabled while it was selected.
  const activeTab: TabId = tabs.some(t => t.id === tab) ? tab : 'ingresos'

  return (
    <>
      {/* ── Resumen del mes — siempre visible (centrado + padding) ── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-5 lg:px-6 pt-4 sm:pt-5 lg:pt-6">
        <KPIStrip onNavigate={t => setTab(t as TabId)} />
        {showDistribucion && <DistribucionCard />}
      </div>

      {/* ── Tabs — ancho completo de main, sticky bajo el month nav ── */}
      <div className="sticky top-[68px] sm:top-[56px] z-20 mb-4 bg-[var(--background)] border-b border-[var(--border)]">
        <div className="max-w-5xl mx-auto w-full px-4 sm:px-5 lg:px-6">
          <div className="flex gap-1.5 overflow-x-auto overscroll-x-contain scrollbar-none py-2">
            {tabs.map(t => {
              const active = t.id === activeTab
              return (
                <button
                  key={t.id}
                  type="button"
                  onClick={() => setTab(t.id)}
                  aria-pressed={active}
                  className={cn(
                    'shrink-0 h-9 px-3.5 rounded-lg text-sm font-medium whitespace-nowrap cursor-pointer transition-colors',
                    active
                      ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                      : 'text-muted-foreground hover:text-foreground hover:bg-[var(--muted)]',
                  )}
                >
                  {t.label}
                </button>
              )
            })}
          </div>
        </div>
      </div>

      {/* ── Contenido del tab activo (centrado + padding) ────────── */}
      <div className="max-w-5xl mx-auto w-full px-4 sm:px-5 lg:px-6 pb-4 sm:pb-5 lg:pb-6">
        {activeTab === 'ingresos'    && <IngresosCard />}
        {activeTab === 'gastos'      && <EgresosCard />}
        {activeTab === 'movimientos' && <MovimientosCard />}
        {activeTab === 'tributarias' && <ObligacionesCard />}
        {activeTab === 'provisiones' && <ProvisionesCard />}
      </div>
    </>
  )
}
