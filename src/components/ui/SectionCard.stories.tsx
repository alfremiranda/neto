import type { Meta, StoryObj } from '@storybook/react-vite'
import { Landmark, TrendingUp, PiggyBank } from 'lucide-react'
import { SectionCard } from './SectionCard'
import { Button } from './button'

const meta = { title: 'Containers/SectionCard', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const Rows = () => (
  <div className="space-y-1">
    {[['Salud (EPS)', '$1.000.000'], ['Pensión obligatoria', '$1.280.000'], ['ARL', '$41.760']].map(([l, v]) => (
      <div key={l} className="flex items-baseline justify-between py-1">
        <span className="ts-body-base">{l}</span>
        <span className="ts-amount-base">{v}</span>
      </div>
    ))}
  </div>
)

/**
 * ## Criterios de aceptación
 *
 * - **El contenedor más usado del producto** — diez archivos lo importan. Cualquier cambio
 *   aquí se nota en toda la app, y por eso no acepta variantes de conveniencia.
 * - **Un eje: `Action` sí o no.** Cabecera con icono + título, y a la derecha una acción
 *   opcional.
 * - **El título usa el estilo de encabezado de sección**, no un tamaño elegido a mano.
 * - **La acción es una sola cosa**, alineada a la derecha: un total, un botón, un control.
 *   Dos acciones compitiendo ahí convierten la cabecera en una barra de herramientas.
 * - El contenido va tal cual; la card no impone padding interno a sus hijos más allá del
 *   suyo.
 */
export const WithAndWithoutAction: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 16, maxWidth: 520 }}>
      <SectionCard icon={Landmark} title="Obligaciones tributarias">
        <Rows />
      </SectionCard>

      <SectionCard
        icon={Landmark}
        title="Obligaciones tributarias"
        action={
          <div className="text-right">
            <div className="ts-amount-large text-[var(--color-tax-txt)]">$2.321.760</div>
            <div className="ts-amount-micro text-muted-foreground">USD 583,12</div>
          </div>
        }
      >
        <Rows />
      </SectionCard>

      <SectionCard
        icon={PiggyBank}
        title="Retención 2026"
        action={<Button size="sm" variant="outline">Transferir</Button>}
      >
        <div className="ts-body-small text-muted-foreground">
          La acción también puede ser un control, no solo una cifra.
        </div>
      </SectionCard>
    </div>
  ),
}

/** Un título largo no empuja la acción fuera: la cabecera reparte, no desborda. */
export const LongTitle: Story = {
  render: () => (
    <div style={{ maxWidth: 380 }}>
      <SectionCard
        icon={TrendingUp}
        title="Tendencia de los últimos ocho meses por categoría"
        action={<div className="ts-amount-large">$41.120.125</div>}
      >
        <Rows />
      </SectionCard>
    </div>
  ),
}
