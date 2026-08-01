/** @type {import('tailwindcss').Config} */

// Tailwind v3 wraps string colors in hsl() which breaks oklch vars.
// Function-based colors bypass this and output var(...) directly.
const cv = (v) => ({ opacityValue }) =>
  opacityValue !== undefined
    ? `color-mix(in oklch, var(${v}) ${Math.round(opacityValue * 100)}%, transparent)`
    : `var(${v})`

export default {
  darkMode: ['class'],
  content: ['./index.html', './src/**/*.{ts,tsx}'],
  theme: {
    extend: {
      screens: {
        xs: '480px',
      },
      // One family: Rethink Sans (07-typography-rethink-sans.md §1).
      // `mono` and `heading` survive only as a bridge for the 83 existing
      // font-mono / font-heading usages, and they point at the sans — they do
      // NOT keep their old definitions alive. Ticket 3 removes the usages, then
      // these two entries go with them.
      fontFamily: {
        sans:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-sans)', 'system-ui', 'sans-serif'],
        heading: ['var(--font-sans)', 'system-ui', 'sans-serif'],
      },
      colors: {
        border:     cv('--border'),
        input:      cv('--input'),
        ring:       cv('--ring'),
        background: cv('--background'),
        foreground: cv('--foreground'),
        primary: {
          DEFAULT:    cv('--primary'),
          foreground: cv('--primary-foreground'),
        },
        secondary: {
          DEFAULT:    cv('--secondary'),
          foreground: cv('--secondary-foreground'),
        },
        muted: {
          DEFAULT:    cv('--muted'),
          foreground: cv('--muted-foreground'),
        },
        accent: {
          DEFAULT:    cv('--accent'),
          foreground: cv('--accent-foreground'),
        },
        destructive: {
          DEFAULT:    cv('--destructive'),
          foreground: cv('--destructive-foreground'),
        },
        card: {
          DEFAULT:    cv('--card'),
          foreground: cv('--card-foreground'),
        },
        popover: {
          DEFAULT:    cv('--popover'),
          foreground: cv('--popover-foreground'),
        },
        sidebar: {
          DEFAULT:              cv('--sidebar'),
          foreground:           cv('--sidebar-foreground'),
          primary:              cv('--sidebar-primary'),
          'primary-foreground': cv('--sidebar-primary-foreground'),
          accent:               cv('--sidebar-accent'),
          'accent-foreground':  cv('--sidebar-accent-foreground'),
          border:               cv('--sidebar-border'),
          ring:                 cv('--sidebar-ring'),
        },
        'chart-1': cv('--chart-1'),
        'chart-2': cv('--chart-2'),
        'chart-3': cv('--chart-3'),
        'chart-4': cv('--chart-4'),
        'chart-5': cv('--chart-5'),
      },
      // No fontSize extensions. The 26 semantic text styles ship as `.ts-*`
      // classes from design-system/tokens/tokens.css (generated from Figma) —
      // `text-2xs` used to duplicate `.ts-detail-base` (10/15) under a name
      // nothing ever used, while 44 places wrote text-[10px] by hand.
      // See design-system/docs/03-typography.md.
      // Figma's named scale (design-system/docs/06-radius-map.md). Each rung is a
      // value someone chose, not a calc() off a base — adjusting one no longer
      // drags the others. Note sm/md/lg mean 4/6/8 here, NOT the 8/10/12 they
      // meant while they were derived; component classes were migrated with this.
      borderRadius: {
        none: 'var(--radius-none)',
        xs: 'var(--radius-xs)',
        sm: 'var(--radius-sm)',
        md: 'var(--radius-md)',
        lg: 'var(--radius-lg)',
        xl: 'var(--radius-xl)',
        '2xl': 'var(--radius-2xl)',
        full: 'var(--radius-full)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
