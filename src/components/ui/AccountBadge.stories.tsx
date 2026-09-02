import type { Meta, StoryObj } from '@storybook/react-vite'
import { AccountBadge } from './AccountBadge'
import { Badge } from './Badge'
import { ACCOUNT_COLORS } from '@/lib/accountColor'

const meta = { title: 'Badges/AccountBadge', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

/**
 * ## Criterios de aceptación
 *
 * - **Dice QUÉ cuenta**, no qué clase de cuenta. Lo segundo era trabajo de
 *   `AccountTypeBadge`: responden preguntas distintas y pueden aparecer juntos.
 * - **El color viene del registro de la cuenta, no de un `tone` en el call site.** En un
 *   `Badge` genérico el color es decorativo; aquí identifica, así que no se elige al
 *   pintar.
 * - **El punto es lo único coloreado.** El chip se queda en `bg/account`. Doce tonos son
 *   seguros justamente porque cada uno vive confinado en una marca pequeña que nunca
 *   comparte superficie con un número.
 * - **El nombre viaja siempre al lado** (WCAG 1.4.1): el color no puede ser el único
 *   portador de cuál cuenta es.
 * - Sin variantes: no hay ejes que elegir, solo la cuenta.
 */
export const Accounts: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2" style={{ maxWidth: 520 }}>
      {[
        { id: 'ARQ', label: 'ARQ (Observer Hub)' },
        { id: 'Bancolombia', label: 'Bancolombia' },
        { id: 'CMR', label: 'CMR Falabella' },
        { id: 'Nequi', label: 'Nequi' },
        { id: 'Efectivo', label: 'Efectivo' },
      ].map(a => <AccountBadge key={a.id} account={a} label={a.label} />)}
    </div>
  ),
}

/** Los doce tonos. El punto cambia; el chip nunca. */
export const EveryHue: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2" style={{ maxWidth: 520 }}>
      {ACCOUNT_COLORS.map(c => (
        <AccountBadge key={c} account={{ id: c, color: c }} label={c} />
      ))}
    </div>
  ),
}

/**
 * Junto al `Badge` genérico, que es de lo que se distingue: aquel colorea por tono elegido
 * en el call site, éste por identidad de la cuenta.
 */
export const AgainstGenericBadge: Story = {
  render: () => (
    <div className="flex flex-wrap items-center gap-2">
      <AccountBadge account={{ id: 'Bancolombia' }} label="Bancolombia" />
      <Badge tone="warning">Pendiente</Badge>
      <Badge tone="neutral">Pagado</Badge>
    </div>
  ),
}
