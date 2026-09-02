import type { Meta, StoryObj } from '@storybook/react-vite'
import { Breadcrumb } from './Breadcrumb'

const meta = { title: 'Navigation/Breadcrumb', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const noop = () => {}

/**
 * ## Acceptance criteria
 *
 * - **Levels 2, 3 and 4.** More than four is not supported: a deeper path collapses its
 *   middle segments BEFORE reaching here — this component does not truncate on its own,
 *   because deciding what to drop is the caller's knowledge.
 * - **The last crumb is the current page and is NOT a link.** It carries
 *   `aria-current="page"`, uses `Body/Small-Emphasis` (500) and takes no focus and no
 *   pointer. That is why it only has a default state.
 * - **Links use `Body/Small`** (400) on `breadcrumb/item/foreground`.
 * - **The house icon lives in the first crumb** and is turned on with `showHomeIcon`. It is
 *   off by default because only the root carries it.
 * - **The 4px horizontal padding is not decoration: it is the focus ring's box.** Removing
 *   it makes the ring cut through the letters.
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
 * The link's states. **Hover** takes its own background and foreground plus the underline;
 * **focus** draws the 2px ring over the padding that exists to house it. The current crumb
 * has neither: it is not a control.
 *
 * (Hover and focus are seen by interacting — Storybook cannot freeze them without painting
 * them by hand, and a hand-painted state stops being the state.)
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

/** Without the house: a path that does not start at the root. */
export const WithoutHome: Story = {
  render: () => (
    <Breadcrumb items={[{ label: 'Cuentas', onClick: noop }, { label: 'ARQ (Observer Hub)' }]} />
  ),
}

/** A long label truncates inside its own crumb without pushing the others out. */
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
