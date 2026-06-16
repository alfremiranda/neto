import type { DeductionConfig } from '@/types'

export const DEFAULT_DEDUCTIONS: DeductionConfig[] = [
  // ── Seguridad Social (base: IBC) ─────────────────────────
  {
    id: 'salud', label: 'Salud (EPS)', group: 'ss',
    base: 'ibc', pct: 12.5, months: [],
    enabled: true, locked: true, color: '--n-blue',
  },
  {
    id: 'pension', label: 'Pensión obligatoria', group: 'ss',
    base: 'ibc', pct: 16, months: [],
    enabled: true, locked: true, color: '--n-blue',
  },
  {
    id: 'arl', label: 'ARL (riesgo I)', group: 'ss',
    base: 'ibc', pct: 0.522, months: [],
    enabled: true, locked: true, color: '--n-blue',
  },

  // ── Provisiones (base: bruto) ────────────────────────────
  {
    id: 'retencion', label: 'Retención en la fuente', group: 'provision',
    base: 'bruto', pct: 20, months: [],
    enabled: true, locked: true, color: '--n-amber',
  },
  {
    id: 'primas', label: 'Primas de servicios', group: 'provision',
    base: 'bruto', pct: 8.33, months: [6, 12],
    enabled: true, color: '--n-pink',
  },
  {
    id: 'cesantias', label: 'Cesantías', group: 'provision',
    base: 'bruto', pct: 8.33, months: [],
    enabled: false, color: '--n-lime',
  },
  {
    id: 'vacaciones', label: 'Vacaciones', group: 'provision',
    base: 'bruto', pct: 4.17, months: [],
    enabled: false, color: '--n-purple-txt',
  },

]

export const BASE_LABELS: Record<string, string> = {
  ibc:       'IBC',
  bruto:     'Bruto',
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
