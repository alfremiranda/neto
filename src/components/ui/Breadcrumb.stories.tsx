import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './Breadcrumb'

const meta = { title: 'Navigation/Breadcrumb', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

/**
 * ## Criterios de aceptación
 *
 * - **Niveles 2, 3 y 4.** Más de cuatro no se soporta: una ruta más profunda colapsa sus
 *   segmentos intermedios ANTES de llegar aquí — este componente no trunca solo, porque
 *   decidir qué se cae es conocimiento del que llama.
 * - **El último crumb es la página actual y NO es un enlace.** Lleva `aria-current="page"`,
 *   va en `Body/Small-Emphasis` (500) y no toma foco ni reacciona al puntero. Por eso solo
 *   tiene estado por defecto.
 * - **Los enlaces van en `Body/Small`** (400) sobre `breadcrumb/item/foreground`.
 * - **El icono de casa vive en el primer crumb** y se enciende con `showHomeIcon`. Está
 *   apagado por defecto porque solo la raíz lo lleva.
 * - **El padding horizontal de 4px no es decoración: es la caja del anillo de foco.**
 *   Quitarlo hace que el anillo corte las letras.
 */
export const Levels: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 18 }}>
      <Breadcrumb showHomeIcon items={[{ label: 'Inicio', onClick: noop }, { label: 'Movimiento' }]} />
      <Breadcrumb showHomeIcon items={[
        { label: 'Inicio', onClick: noop }, { label: 'Cuentas', onClick: noop }, { label: 'Movimiento' },
      ]} />
      <Breadcrumb showHomeIcon items={[
        { label: 'Inicio', onClick: noop }, { label: 'Cuentas', onClick: noop },
        { label: 'Bancolombia', onClick: noop }, { label: 'Movimiento' },
      ]} />
    </div>
  ),
}

/**
 * Los estados del enlace. **Hover** toma su propio fondo y foreground más el subrayado;
 * **foco** dibuja el anillo de 2px sobre el padding que existe para alojarlo. El crumb
 * actual no tiene ninguno de los dos: no es un control.
 *
 * (Hover y foco se ven interactuando — Storybook no los puede congelar sin pintarlos a
 * mano, y un estado pintado a mano deja de ser el estado.)
 */
export const States: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
      <span className="ts-body-small text-muted-foreground">
        Pasa el puntero por “Cuentas”, y tabula hasta él para ver el anillo.
      </span>
      <Breadcrumb showHomeIcon items={[
        { label: 'Cuentas', onClick: noop }, { label: 'CMR Falabella' },
      ]} />
    </div>
  ),
}

/** Sin la casa: una ruta que no arranca en la raíz. */
export const WithoutHome: Story = {
  render: () => (
    <Breadcrumb items={[{ label: 'Cuentas', onClick: noop }, { label: 'ARQ (Observer Hub)' }]} />
  ),
}

/** Una etiqueta larga trunca en su crumb sin empujar a los demás fuera. */
export const LongLabel: Story = {
  render: () => (
    <div style={{ maxWidth: 320 }}>
      <Breadcrumb showHomeIcon items={[
        { label: 'Cuentas', onClick: noop },
        { label: 'Bancolombia Ahorros — cuenta principal de nómina' },
      ]} />
    </div>
  ),
}
