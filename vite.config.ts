import { defineConfig } from 'vite'
import react from '@vitejs/plugin-react'
import { VitePWA } from 'vite-plugin-pwa'

export default defineConfig({
  base: '/',
  // Sentry release: the commit SHA in CI (GitHub Actions sets GITHUB_SHA), else
  // 'dev' locally. Ties every captured error to a build so minified stacks stay
  // legible until source-map upload lands (W4 D2, deferred).
  define: {
    __SENTRY_RELEASE__: JSON.stringify(process.env.GITHUB_SHA ?? 'dev'),
  },
  plugins: [
    react(),
    VitePWA({
      // 'prompt' (not 'autoUpdate'): a new SW must NOT force-reload the page. The
      // autoUpdate reload was racing the OAuth callback on mobile — the reload
      // re-hit the callback, the single-use provider code got exchanged twice, and
      // login failed with "Unable to exchange external code". New versions now apply
      // on the next natural app launch instead of a surprise mid-flow reload.
      registerType: 'prompt',
      // Workbox takes over — delete manual public/sw.js
      filename: 'sw.js',
      strategies: 'generateSW',
      workbox: {
        // Cache all build assets + shell
        globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
        // Network-first for navigation (SPA shell)
        navigateFallback: '/index.html',
        // Keep the static privacy policy out of the SPA navigation fallback — a
        // direct navigation to /neto/privacidad.html must serve that page, not the
        // app shell. (It must also load pre-login and without depending on the SW.)
        navigateFallbackDenylist: [/^\/api/, /privacidad\.html$/],
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
      // null: we register the SW manually in main.tsx (via virtual:pwa-register) so
      // we can catch registration errors — the auto-injected registerSW.js let the
      // register() promise reject UNHANDLED during OAuth navigation (noisy Sentry).
      injectRegister: null,
      devOptions: {
        enabled: false, // only active in production build
      },
    }),
  ],
  resolve: {
    tsconfigPaths: true,
  },
})
