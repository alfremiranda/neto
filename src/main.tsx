import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { AppErrorBoundary } from './components/AppErrorBoundary.tsx'
import { initSentry } from './lib/sentry.ts'
import { registerSW } from 'virtual:pwa-register'
import { useUIStore } from './store/uiStore.ts'

// Prod-only, gated on VITE_SENTRY_DSN — no-op without a DSN (dev / offline).
initSentry()

// Register the PWA service worker manually so we can SWALLOW registration errors instead
// of letting the promise reject unhandled (it was rejecting during the OAuth navigation and
// surfacing as noisy Sentry events).
//
// registerType is 'prompt' so a new build never force-reloads the page: the autoUpdate
// reload raced the OAuth callback and broke login on mobile. But 'prompt' does NOT mean
// "applies on next launch" — the new worker installs, enters `waiting`, and stays there
// until something tells it to take over. Nothing did, so every build after the first was
// installed and never served, and no prompt ever appeared because none was wired.
//
// The offer below is what closes that: the reload happens on a user gesture, which is
// exactly why it cannot race a callback the way autoUpdate did.
const updateSW = registerSW({
  immediate: true,
  onNeedRefresh() {
    useUIStore.getState().setUpdateReady(() => updateSW(true))
  },
  onRegisterError(error) {
    // Non-fatal: only offline caching is unavailable this session. Don't rethrow.
    console.warn('Service worker registration failed', error)
  },
})

// iOS PWA fix: dvh/vh and window.innerHeight all reflect the Safari browser
// viewport (with chrome reserved) even in standalone mode. Only
// window.screen.height returns the true physical screen height in CSS pixels.
function setAppHeight() {
  const isIosStandalone =
    typeof window !== 'undefined' &&
    'standalone' in window.navigator &&
    (window.navigator as Record<string, unknown>).standalone === true
  const h = isIosStandalone ? window.screen.height : window.innerHeight
  document.documentElement.style.setProperty('--app-height', `${h}px`)
}
setAppHeight()
window.addEventListener('resize', setAppHeight)

createRoot(document.getElementById('root')!).render(
  <StrictMode>
    <AppErrorBoundary>
      <App />
    </AppErrorBoundary>
  </StrictMode>,
)
