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
      fontFamily: {
        sans:    ['var(--font-sans)', 'Inter', 'system-ui', 'sans-serif'],
        mono:    ['var(--font-mono)', 'Geist Mono', 'monospace'],
        heading: ['var(--font-heading)', 'Geist Mono', 'monospace'],
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
      fontSize: {
        '2xs': ['0.625rem', { lineHeight: '0.875rem' }],
      },
      borderRadius: {
        lg: 'var(--radius)',
        md: 'calc(var(--radius) - 2px)',
        sm: 'calc(var(--radius) - 4px)',
      },
    },
  },
  plugins: [require('tailwindcss-animate')],
}
