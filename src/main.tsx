import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'

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
    <App />
  </StrictMode>,
)
