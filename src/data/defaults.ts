import type { LucideIcon } from 'lucide-react'
import { Home, ShoppingBasket, ShoppingCart, Monitor, CreditCard, Heart, Car, Users, Tag, Plane, Globe, ShieldPlus, Briefcase, PiggyBank, Landmark } from 'lucide-react'
import type { Account } from '@/types'

export const MONTHS = [
  'Enero','Febrero','Marzo','Abril','Mayo','Junio',
  'Julio','Agosto','Septiembre','Octubre','Noviembre','Diciembre',
]

export const GASTOS_KEYS = [
  'arriendo','servicios','internet','mercado','tarjetas',
  'transporte','streaming','salud','otros',
]

export interface EgresoCategoria {
  id: string
  label: string
  color: string
  bgColor: string
  icon: LucideIcon
  tipos: string[]
}

export const EGRESO_CATEGORIAS: EgresoCategoria[] = [
  { id: 'vivienda',        label: 'Vivienda',          color: '--cat-home',        bgColor: '--cat-home-bg',        icon: Home,           tipos: ['arriendo', 'servicios'] },
  { id: 'alimentacion',    label: 'Alimentación',      color: '--cat-food',        bgColor: '--cat-food-bg',        icon: ShoppingBasket, tipos: ['mercado'] },
  { id: 'bancario',        label: 'Deudas y Crédito',  color: '--cat-bank',        bgColor: '--cat-bank-bg',        icon: CreditCard,     tipos: ['tarjetas'] },
  { id: 'salud',           label: 'Salud',             color: '--cat-health',      bgColor: '--cat-health-bg',      icon: Heart,          tipos: ['salud'] },
  { id: 'movilidad',       label: 'Movilidad',         color: '--cat-transit',     bgColor: '--cat-transit-bg',     icon: Car,            tipos: ['transporte'] },
  { id: 'tecnologia',      label: 'Conectividad',      color: '--cat-tech',        bgColor: '--cat-tech-bg',        icon: Globe,          tipos: ['internet'] },
  { id: 'entretenimiento', label: 'Entretenimiento',   color: '--cat-recreation',  bgColor: '--cat-recreation-bg',  icon: Monitor,        tipos: ['streaming'] },
  { id: 'trabajo',         label: 'Trabajo',           color: '--cat-work',        bgColor: '--cat-work-bg',        icon: Briefcase,      tipos: [] },
  { id: 'familia',         label: 'Personas',          color: '--cat-family',      bgColor: '--cat-family-bg',      icon: Users,          tipos: [] },
  { id: 'seguros',         label: 'Seguros',           color: '--cat-insurance',   bgColor: '--cat-insurance-bg',   icon: ShieldPlus,     tipos: [] },
  { id: 'ahorro',          label: 'Ahorros e Inv.',    color: '--cat-savings',     bgColor: '--cat-savings-bg',     icon: PiggyBank,      tipos: ['pension_vol'] },
  { id: 'viajes',          label: 'Viajes',            color: '--cat-travel',      bgColor: '--cat-travel-bg',      icon: Plane,          tipos: ['viaje'] },
  { id: 'impuestos',       label: 'Impuestos',         color: '--cat-taxes',       bgColor: '--cat-taxes-bg',       icon: Landmark,       tipos: [] },
  { id: 'compras',         label: 'Compras',           color: '--cat-shopping',    bgColor: '--cat-shopping-bg',    icon: ShoppingCart,   tipos: ['compras'] },
  { id: 'otro',            label: 'Otros',             color: '--cat-other',       bgColor: '--cat-other-bg',       icon: Tag,            tipos: ['otro'] },
]

export const EGRESO_TIPOS: { id: string; label: string; category: string }[] = [
  { id: 'arriendo',    label: 'Arriendo',            category: 'vivienda'        },
  { id: 'servicios',   label: 'Servicios públicos',  category: 'vivienda'        },
  { id: 'mercado',     label: 'Mercado',             category: 'alimentacion'    },
  { id: 'internet',    label: 'Internet / cel',      category: 'tecnologia'      },
  { id: 'streaming',   label: 'Streaming',           category: 'entretenimiento' },
  { id: 'tarjetas',    label: 'Tarjetas',            category: 'bancario'        },
  { id: 'salud',       label: 'Salud prepagada',     category: 'salud'           },
  { id: 'transporte',  label: 'Transporte',          category: 'movilidad'       },
  { id: 'viaje',       label: 'Viaje',               category: 'viajes'          },
  { id: 'pension_vol', label: 'Pensión voluntaria',  category: 'ahorro'          },
  { id: 'compras',     label: 'Compras',             category: 'compras'         },
  { id: 'otro',        label: 'Otro',                category: 'otro'            },
]

export const TRANSFER_ACCOUNTS: Account[] = [
  { id: 'ARQ',         label: 'ARQ (Observer Hub)', currency: 'USD', number: '', rate: 3.5, startingBalance: 0 },
  { id: 'Toptal',      label: 'Toptal',              currency: 'USD', number: '', rate: 0,   startingBalance: 0 },
  { id: 'Bancolombia', label: 'Bancolombia',          currency: 'COP', number: '', rate: 0,  startingBalance: 0 },
  { id: 'NU',          label: 'NU',                   currency: 'COP', number: '', rate: 0,  startingBalance: 0 },
  { id: 'Nequi',       label: 'Nequi',                currency: 'COP', number: '', rate: 0,  startingBalance: 0 },
  { id: 'Efectivo',    label: 'Efectivo',             currency: 'COP', type: 'cash', number: '', rate: 0,  startingBalance: 0, locked: true },
]

// SMMLV (salario mínimo mensual legal vigente) is a legal constant set each
// year by government decree — not a user preference. Values are hardcoded per
// year and updated once a year when the new decree is published.
export const SMMLV_BY_YEAR: Record<number, number> = {
  2024: 1300000,
  2025: 1423500,
  2026: 1750905,
}

/**
 * Official SMMLV for a given year. Years outside the known range clamp to the
 * nearest known year (earliest for past, latest for future) so calculations
 * always have a sensible legal base until the table is updated.
 */
export function smmlvForYear(year: number): number {
  const exact = SMMLV_BY_YEAR[year]
  if (exact) return exact
  const years = Object.keys(SMMLV_BY_YEAR).map(Number).sort((a, b) => a - b)
  if (year < years[0]) return SMMLV_BY_YEAR[years[0]]
  return SMMLV_BY_YEAR[years[years.length - 1]]
}

export const DEFAULTS = {
  trm: 3567.11,
  pv: 2000000,
  smmlv: 1750905,
  salud_prepagada: 2000000,
  arq_savings_rate: 0.035,
  ss_salud: 0.125,
  ss_pens: 0.16,
  ss_arl: 0.00522,
  ibc_factor: 0.40,
  retencion: 0.20,
  primas: 0.0833,
} as const
