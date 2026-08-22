import type { Preview, Decorator } from '@storybook/react-vite'
import '../src/index.css'
import { DsStamp } from './DsStamp'

/**
 * Theme and device are global controls rather than per-story props: the point of this
 * library is that every state can be seen in both modes and at both widths without
 * writing four stories for one component.
 *
 * The app writes an explicit class on <html> (never a media query — see tokens.css), so
 * the decorator does exactly what useTheme does.
 */
const withTheme: Decorator = (Story, ctx) => {
  const dark = ctx.globals.theme === 'dark'
  document.documentElement.classList.toggle('dark', dark)
  const width = ctx.globals.device === 'mobile' ? 412 : undefined
  return (
    <div
      style={{ background: 'var(--background)', color: 'var(--foreground)', padding: 24, width, maxWidth: '100%' }}
    >
      <DsStamp />
      <Story />
    </div>
  )
}

const preview: Preview = {
  decorators: [withTheme],
  globalTypes: {
    theme: {
      description: 'Modo de color',
      defaultValue: 'light',
      toolbar: { icon: 'circlehollow', items: [
        { value: 'light', title: 'Claro' }, { value: 'dark', title: 'Oscuro' },
      ] },
    },
    device: {
      description: 'Ancho',
      defaultValue: 'desktop',
      toolbar: { icon: 'mobile', items: [
        { value: 'mobile', title: 'Móvil · 412' }, { value: 'desktop', title: 'Escritorio' },
      ] },
    },
  },
  parameters: { layout: 'fullscreen', controls: { expanded: true } },
}
export default preview
