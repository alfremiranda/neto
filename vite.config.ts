import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/neto/',
  // Sentry release: the commit SHA in CI (GitHub Actions sets GITHUB_SHA), else
  // 'dev' locally. Ties every captured error to a build so minified stacks stay
  // legible until source-map upload lands (W4 D2, deferred).
  define: {
    __SENTRY_RELEASE__: JSON.stringify(process.env.GITHUB_SHA ?? 'dev'),
  },
  plugins: [
    react(),
    VitePWA({
      registerType: 'autoUpdate',
      // Workbox takes over — delete manual public/sw.js
      filename: 'sw.js',
      strategies: 'generateSW',
      workbox: {
        // Cache all build assets + shell
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Network-first for navigation (SPA shell)
        navigateFallback: '/neto/index.html',
        navigateFallbackDenylist: [/^\/api/],
        // Network-only for external APIs
        runtimeCaching: [
          {
            urlPattern: /^https:\/\/.*supabase\.co\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/datos\.gov\.co\//,
            handler: 'NetworkOnly',
          },
          {
            urlPattern: /^https:\/\/open\.er-api\.com\//,
            handler: 'NetworkFirst',
            options: {
              cacheName: 'trm-cache',
              expiration: { maxAgeSeconds: 60 * 60 * 8 }, // 8h — same as useLiveTRM TTL
            },
          },
        ],
      },
      // Manifest is in public/manifest.json — don't inject a second one
      manifest: false,
      // Register SW via built-in virtual module (replaces manual navigator.serviceWorker.register)
      injectRegister: 'auto',
      devOptions: {
        enabled: false, // only active in production build
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
})
