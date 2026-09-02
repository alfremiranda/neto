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
 * ## Acceptance criteria
 *
 * - **The same four axes as `Button`**: variant, severity, size and state. Severity is not
 *   a separate variant: `*-danger` is the same variant carrying a consequence.
 * - **Every instance needs an accessible name.** The icon alone is not a name —
 *   `aria-label` is required at each call site.
 * - **Row actions are ALWAYS visible.** Hiding them behind hover (`opacity-0 group-hover`)
 *   is an anti-pattern here: there is no hover on touch.
 * - **XL (44) is the WCAG 2.5.5 touch target** and is what rows use on mobile. LG (36) is
 *   for desktop, where there is a pointer.
 * - The icon scales with the box (12 · 12 · 16 · 20); an icon at 17px is a bug, not a
 *   choice.
 */
export const VariantsAndSizes: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Variants (LG)</span>
        <div className="mt-2 flex flex-wrap items-center gap-2">
          {VARIANTS.map(v => (
            <IconButton key={v} variant={v} size="lg" aria-label={v}>
              {v.includes('danger') ? <Trash2 /> : <Pencil />}
            </IconButton>
          ))}
        </div>
      </div>
      <div>
        <span className="ts-label-micro uppercase text-muted-foreground/70">Sizes — the icon scales with the box</span>
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
        <span className="ts-label-micro uppercase text-muted-foreground/70">Disabled</span>
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
 * In a row: desktop edits and deletes in place at **LG (36)**; mobile opens the sheet behind
 * a single button at **XL (44)**, the touch target.
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
