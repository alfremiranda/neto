import { useSettingsStore } from '@/store/settingsStore'
import { useMonthData } from '@/hooks/useMonthData'

/**
 * Derives which deduction-related surfaces should be shown, based on the
 * user's enabled deductions (from settings) and the current month's voluntary
 * savings. Employees with no fiscal obligations disable these deductions, and
 * the related KPIs/cards then disappear — leaving a simple income/egreso view.
 *
 * Visibility is derived from the `enabled` flags, NOT from computed results:
 * calcAllDeductions can inject FSS into ssItems even when SS is disabled (when
 * IBC ≥ 4 SMMLV), so reading results would give false positives.
 */
export function useDeductionGroups() {
  const deductions = useSettingsStore(s => s.deductions)
  const month = useMonthData()

  const hasVoluntarias = (month.voluntarias?.length ?? 0) > 0

  const ssEnabled          = deductions.some(d => d.group === 'ss' && d.enabled)
  const retencionEnabled   = deductions.some(d => d.id === 'retencion' && d.enabled)
  const provisionesEnabled = deductions.some(d => d.group === 'provision' && d.id !== 'retencion' && d.enabled)

  // ObligacionesCard + "O. Tributarias" KPI (SS + retención)
  const showObligaciones = ssEnabled || retencionEnabled
  // ProvisionesCard + "Provisiones" KPI (legal provisions + voluntary savings).
  // The KPI and card both include voluntarias, so they share the condition.
  const showProvisiones  = provisionesEnabled || hasVoluntarias
  // DistribucionCard — only meaningful when there is something to distribute
  const showDistribucion = showObligaciones || showProvisiones

  return {
    ssEnabled,
    retencionEnabled,
    provisionesEnabled,
    hasVoluntarias,
    showObligaciones,
    showProvisiones,
    showDistribucion,
  }
}
