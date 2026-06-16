import type { LucideIcon } from 'lucide-react'
import { Home, ShoppingBasket, Monitor, CreditCard, Heart, Car, Users, Tag } from 'lucide-react'
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
  { id: 'vivienda',     label: 'Vivienda',     color: '--cat-home',    bgColor: '--cat-home-bg',    icon: Home,           tipos: ['arriendo', 'servicios'] },
  { id: 'alimentacion', label: 'Alimentación', color: '--cat-food',    bgColor: '--cat-food-bg',    icon: ShoppingBasket, tipos: ['mercado'] },
  { id: 'tecnologia',   label: 'Tecnología',   color: '--cat-tech',    bgColor: '--cat-tech-bg',    icon: Monitor,        tipos: ['internet', 'streaming'] },
  { id: 'bancario',     label: 'Bancario',     color: '--cat-bank',    bgColor: '--cat-bank-bg',    icon: CreditCard,     tipos: ['tarjetas'] },
  { id: 'salud',        label: 'Salud',        color: '--cat-health',  bgColor: '--cat-health-bg',  icon: Heart,          tipos: ['salud'] },
  { id: 'movilidad',    label: 'Movilidad',    color: '--cat-transit', bgColor: '--cat-transit-bg', icon: Car,            tipos: ['transporte'] },
  { id: 'familia',      label: 'Familia',      color: '--cat-family',  bgColor: '--cat-family-bg',  icon: Users,          tipos: [] },
  { id: 'otro',         label: 'Otros',        color: '--cat-other',   bgColor: '--cat-other-bg',   icon: Tag,            tipos: ['pension_vol', 'otro'] },
]

export const EGRESO_TIPOS: { id: string; label: string; category: string }[] = [
  { id: 'arriendo',    label: 'Arriendo',            category: 'vivienda'     },
  { id: 'servicios',   label: 'Servicios públicos',  category: 'vivienda'     },
  { id: 'mercado',     label: 'Mercado',             category: 'alimentacion' },
  { id: 'internet',    label: 'Internet / cel',      category: 'tecnologia'   },
  { id: 'streaming',   label: 'Streaming',           category: 'tecnologia'   },
  { id: 'tarjetas',    label: 'Tarjetas',            category: 'bancario'     },
  { id: 'salud',       label: 'Salud prepagada',     category: 'salud'        },
  { id: 'transporte',  label: 'Transporte',          category: 'movilidad'    },
  { id: 'pension_vol', label: 'Pensión voluntaria',  category: 'otro'         },
  { id: 'otro',        label: 'Otro',                category: 'otro'         },
]

export const TRANSFER_ACCOUNTS: Account[] = [
  { id: 'ARQ',         label: 'ARQ (Observer Hub)', currency: 'USD', number: '', rate: 3.5 },
  { id: 'Toptal',      label: 'Toptal',              currency: 'USD', number: '', rate: 0 },
  { id: 'Bancolombia', label: 'Bancolombia',          currency: 'COP', number: '', rate: 0 },
  { id: 'NU',          label: 'NU',                   currency: 'COP', number: '', rate: 0 },
  { id: 'Nequi',       label: 'Nequi',                currency: 'COP', number: '', rate: 0 },
]

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
