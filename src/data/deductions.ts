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

// Apply the deduction schema migrations (formerly inline in settingsStore's zustand
// `merge`) to a stored list, and append any new defaults the stored set lacks. Used
// when consolidating the local `neto-settings` backup into the synced `_settings` —
// the on-disk backup may still hold a pre-migration shape (old color tokens, old
// base, frequency instead of months[]).
export function migrateDeductions(stored: DeductionConfig[]): DeductionConfig[] {
  const NETO_IBC_IDS = new Set(['primas', 'cesantias', 'vacaciones'])
  const OLD_PROVISION_COLORS = new Set(['--n-lime', '--n-purple-txt', '--n-pink'])
  const TOKEN_MAP: Record<string, string> = {
    '--n-blue':  '--color-income',
    '--n-green': '--color-provision',
    '--n-amber': '--color-tax',
    '--n-pink':  '--color-expense',
    '--n-lime':  '--color-net',
  }

  const migrated = stored.map((d: DeductionConfig & { frequency?: string }) => {
    let r: DeductionConfig = d
    if (r.months === undefined) {
      const months = (r as DeductionConfig & { frequency?: string }).frequency === 'semiannual' ? [6, 12] : []
      const { frequency: _f, ...rest } = r as DeductionConfig & { frequency?: string }
      r = { ...rest, months }
    }
    if (NETO_IBC_IDS.has(r.id) && r.base === 'bruto') r = { ...r, base: 'neto_ibc' }
    if (NETO_IBC_IDS.has(r.id) && OLD_PROVISION_COLORS.has(r.color ?? '')) r = { ...r, color: '--n-green' }
    if (r.id === 'primas' && (r.months?.length ?? 0) > 0) r = { ...r, months: [] }
    if (r.color && TOKEN_MAP[r.color]) r = { ...r, color: TOKEN_MAP[r.color] }
    return r
  })

  const storedIds = new Set(migrated.map(d => d.id))
  return [...migrated, ...DEFAULT_DEDUCTIONS.filter(d => !storedIds.has(d.id))]
}

export const BASE_LABELS: Record<string, string> = {
  ibc:       'IBC',
  bruto:     'Bruto',
  neto_ibc:  'Ingreso bruto',
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
