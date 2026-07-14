import { useSettingsStore } from '@/store/settingsStore'
import { useMonthData } from '@/hooks/useMonthData'
import type { DeductionConfig } from '@/types'

/**
 * Pure, month-independent view of which deduction groups the user has enabled.
 * Shared by the reactive hook (month view) and the annual view.
 *
 * Derived from the `enabled` flags, NOT from computed results: calcAllDeductions
 * can inject FSS into ssItems even when SS is disabled (when IBC ≥ 4 SMMLV), so
 * reading results would give false positives.
 */
export function deductionGroupFlags(deductions: DeductionConfig[]) {
  return {
    ssEnabled:          deductions.some(d => d.group === 'ss' && d.enabled),
    retencionEnabled:   deductions.some(d => d.id === 'retencion' && d.enabled),
    provisionesEnabled: deductions.some(d => d.group === 'provision' && d.id !== 'retencion' && d.enabled),
  }
}

/**
 * Derives which deduction-related surfaces should be shown in the month view,
 * based on enabled deductions and the current month's voluntary savings.
 * Employees with no fiscal obligations disable these deductions, and the
 * related KPIs/cards then disappear — leaving a simple income/egreso view.
 */
export function useDeductionGroups() {
  const deductions = useSettingsStore(s => s.deductions)
  const month = useMonthData()

  const hasVoluntarias = (month.voluntarias?.length ?? 0) > 0

  const { ssEnabled, retencionEnabled, provisionesEnabled } = deductionGroupFlags(deductions)

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
