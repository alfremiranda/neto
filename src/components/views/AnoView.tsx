import { useState } from 'react'
import { CalendarRange, Download } from 'lucide-react'
import { TrendChart } from '@/components/annual/TrendChart'
import { EgresosCategoryChart } from '@/components/annual/EgresosCategoryChart'
import { EgresosBreakdown } from '@/components/annual/EgresosBreakdown'
import { AnnualTable } from '@/components/annual/AnnualTable'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { SectionCard } from '@/components/ui/SectionCard'
import { Button } from '@/components/ui/button'
import { exportAnnualCSV } from '@/lib/export'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'

export function AnoView() {
  const { db, getSMMLV } = useFinanceStore()
  const deductions = useSettingsStore(s => s.deductions)
  const { showToast } = useUIStore()
  const currentYear = new Date().getFullYear()

  const years = [...new Set([
    ...Object.keys(db).filter(k => k !== '_settings').map(k => k.split('-')[0]),
    String(currentYear),
  ])].sort().reverse()

  const [year, setYear] = useState(currentYear)
  const [exporting, setExporting] = useState(false)

  function handleExport() {
    setExporting(true)
    try {
      exportAnnualCSV(
        db as Record<string, import('@/types').MonthData>,
        year,
        getSMMLV,
        deductions,
      )
      showToast(`CSV ${year} descargado`)
    } catch {
      showToast('Error al exportar')
    } finally {
      setExporting(false)
    }
  }

  return (
    <div className="space-y-4">
      <SectionCard
        icon={CalendarRange}
        title="Resumen anual"
        action={
          <div className="flex items-center gap-2">
            <Select value={String(year)} onValueChange={v => setYear(parseInt(v))}>
              <SelectTrigger size="sm" className="w-auto">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                {years.map(y => <SelectItem key={y} value={String(y)}>{y}</SelectItem>)}
              </SelectContent>
            </Select>
            <Button
              size="sm"
              variant="outline"
              onClick={handleExport}
              disabled={exporting}
              title={`Exportar ${year} como CSV`}
            >
              <Download size={12} />
              CSV
            </Button>
          </div>
        }
      >
        <AnnualTable year={year} />
      </SectionCard>

      <TrendChart />
      <EgresosBreakdown year={year} />
      <EgresosCategoryChart year={year} />

    </div>
  )
}
