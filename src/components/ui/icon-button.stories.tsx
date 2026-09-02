import type { Meta, StoryObj } from '@storybook/react-vite'
import { Pencil, Trash2, Plus, MoreVertical } from 'lucide-react'
import { IconButton } from './icon-button'

const meta = { title: 'Elements/IconButton', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const VARIANTS = ['filled', 'outline', 'ghost', 'filled-danger', 'outline-danger', 'ghost-danger'] as const
const SIZES = [
  { size: 'sm', px: 24, icon: 12 },
  { size: 'md', px: 28, icon: 12 },
  { size: 'lg', px: 36, icon: 16 },
  { size: 'xl', px: 44, icon: 20 },
] as const

/**
 * ## Criterios de aceptación
 *
 * - **Los mismos cuatro ejes que `Button`**: variante, severidad, tamaño y estado. Las
 *   severidades no son variantes aparte: `*-danger` es la misma variante con consecuencia.
 * - **Toda instancia necesita un nombre accesible.** El icono solo no es un nombre —
 *   `aria-label` es obligatorio en cada llamada.
 * - **Las acciones de fila están SIEMPRE visibles.** Esconderlas tras hover
 *   (`opacity-0 group-hover`) es un antipatrón aquí: en táctil no hay hover.
 * - **XL (44) es el objetivo táctil de WCAG 2.5.5** y es el que usan las filas en móvil.
 *   LG (36) es para escritorio, donde hay puntero.
 * - El icono escala con el tamaño (12 · 12 · 16 · 20); un icono a 17px es un bug, no una
 *   elección.
 */
export const VariantsAndSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Variantes (LG)</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {VARIANTS.map(v => (
            <IconButton key={v} variant={v} size="lg" aria-label={v}>
              {v.includes('danger') ? <Trash2 /> : <Pencil />}
            </IconButton>
          ))}
        </div>
      </div>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Tamaños — el icono escala con la caja</span>
        <div className="mt-2 flex items-end gap-3">
          {SIZES.map(s => (
            <div key={s.size} className="flex flex-col items-center gap-1">
              <IconButton variant="outline" size={s.size} aria-label={`Agregar ${s.size}`}><Plus /></IconButton>
              <span className="ts-detail-base text-muted-foreground">{s.size} · {s.px}</span>
            </div>
          ))}
        </div>
      </div>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Deshabilitado</span>
        <div className="mt-2 flex items-center gap-2">
          {(['filled', 'outline', 'ghost'] as const).map(v => (
            <IconButton key={v} variant={v} size="lg" disabled aria-label={`${v} deshabilitado`}><Pencil /></IconButton>
          ))}
        </div>
      </div>
    </div>
  ),
}

/**
 * En una fila: escritorio edita y borra en sitio a **LG (36)**; móvil abre el sheet detrás
 * de un solo botón a **XL (44)**, el objetivo táctil.
 */
export const InARow: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 12, maxWidth: 420 }}>
      <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
        <span className="flex-1 ts-body-base">Arriendo</span>
        <IconButton variant="ghost" size="lg" aria-label="Editar"><Pencil /></IconButton>
        <IconButton variant="ghost-danger" size="lg" aria-label="Eliminar"><Trash2 /></IconButton>
      </div>
      <div className="flex items-center gap-2 rounded-xl border border-[var(--border)] px-3 py-2">
        <span className="flex-1 ts-body-base">Arriendo</span>
        <IconButton variant="ghost" size="xl" aria-label="Opciones"><MoreVertical /></IconButton>
      </div>
    </div>
  ),
}
