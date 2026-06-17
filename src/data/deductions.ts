import type { DeductionConfig } from '@/types'

export const DEFAULT_DEDUCTIONS: DeductionConfig[] = [
  // ── Seguridad Social (base: IBC) ─────────────────────────
  {
    id: 'salud', label: 'Salud (EPS)', group: 'ss',
    base: 'ibc', pct: 12.5, months: [],
    enabled: true, locked: true, color: '--color-income',
  },
  {
    id: 'pension', label: 'Pensión obligatoria', group: 'ss',
    base: 'ibc', pct: 16, months: [],
    enabled: true, locked: true, color: '--color-income',
  },
  {
    id: 'arl', label: 'ARL (riesgo I)', group: 'ss',
    base: 'ibc', pct: 0.522, months: [],
    enabled: true, locked: true, color: '--color-income',
  },

  // ── Provisiones (base: bruto) ────────────────────────────
  {
    id: 'retencion', label: 'Retención en la fuente', group: 'provision',
    base: 'bruto', pct: 20, months: [],
    enabled: true, locked: true, color: '--color-tax',
  },
  {
    id: 'primas', label: 'Primas de servicios', group: 'provision',
    base: 'neto_ibc', pct: 8.33, months: [],
    enabled: true, color: '--color-provision',
  },
  {
    id: 'cesantias', label: 'Cesantías', group: 'provision',
    base: 'neto_ibc', pct: 8.33, months: [],
    enabled: true, color: '--color-provision',
  },
  {
    id: 'vacaciones', label: 'Vacaciones', group: 'provision',
    base: 'neto_ibc', pct: 4.17, months: [],
    enabled: true, color: '--color-provision',
  },

]

export const BASE_LABELS: Record<string, string> = {
  ibc:       'IBC',
  bruto:     'Bruto',
  neto_ibc:  'Bruto − IBC',
  fixed_cop: 'Fijo COP',
  fixed_usd: 'Fijo USD',
  base_usd:  'Base USD',
}

export const GROUP_LABELS: Record<string, string> = {
  ss:        'Seguridad Social',
  provision: 'Provisiones',
  voluntary: 'Voluntarias',
}

export const MONTH_ABBR = ['E','F','M','A','M','J','J','A','S','O','N','D']
export const MONTH_NAMES = ['Ene','Feb','Mar','Abr','May','Jun','Jul','Ago','Sep','Oct','Nov','Dic']

export function monthsLabel(months: number[]): string {
  if (!months.length) return 'Todos los meses'
  if (months.length === 12) return 'Todos los meses'
  return months.map(m => MONTH_NAMES[m - 1]).join(', ')
}
