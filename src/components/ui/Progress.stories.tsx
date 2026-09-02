import type { Meta, StoryObj } from '@storybook/react-vite'
import { Progress } from './Progress'

const meta = { title: 'Feedback/Progress', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const Row = ({ label, value, tone, note }: {
  label: string; value: number; tone: 'provision' | 'expense'; note: string
}) => (
  <div style={{ display: 'flex', flexDirection: 'column', gap: 4, maxWidth: 420 }}>
    <div className="flex items-baseline justify-between">
      <span className="ts-body-small text-muted-foreground">{label}</span>
      <span className="ts-amount-small">{note}</span>
    </div>
    <Progress value={value} tone={tone} label={`${label}: ${note}`} />
  </div>
)

/**
 * ## Criterios de aceptación
 *
 * - **Dos tonos, y solo dos.** `provision` para algo que se acumula (la reserva);
 *   `expense` para un límite que se consume (el cupo). No hay neutral, warning ni danger:
 *   un umbral ("rojo pasado el 80%") es una regla de producto que esta pieza no debe
 *   poseer — el consumidor elige el tono y la barra lo dibuja.
 * - **Nunca aparece sin su número.** Largo y color es todo lo que carga, así que sola
 *   incumple 1.4.1 y no dice nada a quien no puede comparar dos longitudes con el ojo.
 *   Por eso `label` es obligatorio y los dos consumidores imprimen la cifra al lado.
 * - **El track se distingue de la superficie.** Usa `--progress-track` y no
 *   `bg/neutral-subtle`, que es el MISMO valor que `bg/surface` en claro: sobre una card
 *   la barra desaparecía, y a 0% no quedaba nada que ver.
 * - **El valor se recorta a 0–1.** Un consumidor que se pase dibuja una barra llena, no
 *   una rota.
 */
export const Tones: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row label="Retención reservada" value={0.37} tone="provision" note="37%" />
      <Row label="Cupo usado"          value={0.12} tone="expense"   note="12%" />
    </div>
  ),
}

/**
 * Los extremos. **0% es el caso que importa**: sin relleno, el track ES toda la barra, y
 * si no se distingue de la card no hay nada en pantalla. Por encima de 1 se recorta.
 */
export const Edges: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20 }}>
      <Row label="Sin nada apartado"  value={0}   tone="provision" note="0%" />
      <Row label="Justo al límite"    value={1}   tone="expense"   note="100%" />
      <Row label="Pasado (se recorta)" value={1.4} tone="expense"  note="140%" />
    </div>
  ),
}
