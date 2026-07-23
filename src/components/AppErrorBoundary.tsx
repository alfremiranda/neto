import * as Sentry from '@sentry/react'
import type { ReactNode } from 'react'
import { useAuthStore } from '@/store/authStore'

// Panic screen shown when a render crash escapes the tree. Two recovery paths,
// both NON-destructive to `amd-finance`:
//   · Recargar     — reload the app (fixes transient crashes).
//   · Cerrar sesión — sign out (clears the Supabase session only, never the local
//     financial data) then reload. This is the escape hatch for a reload loop:
//     if the crash comes from auth/session state, plain reload keeps reproducing
//     it, so sign-out breaks the cycle.
// Deliberately NO "clear data" button — wiping financial data must never be one
// click away on a panic screen. A corrupt-`amd-finance` recovery, if ever needed,
// belongs in a deliberate, guarded flow, not here.
function PanicScreen() {
  const reload = () => window.location.reload()

  const signOutAndReload = async () => {
    try {
      await useAuthStore.getState().signOut()
    } catch {
      // ignore — reload regardless so the user is never stuck
    }
    window.location.reload()
  }

  return (
    <div className="flex min-h-[100dvh] flex-col items-center justify-center gap-6 bg-background px-6 text-center text-foreground">
      <div className="max-w-sm space-y-2">
        <h1 className="text-lg font-semibold">Algo salió mal</h1>
        <p className="text-sm text-muted-foreground">
          La app encontró un error inesperado. Tus datos siguen guardados en este
          dispositivo. Intenta recargar; si el problema persiste, cierra sesión y
          vuelve a entrar.
        </p>
      </div>
      <div className="flex w-full max-w-xs flex-col gap-2">
        <button
          type="button"
          onClick={reload}
          className="rounded-md bg-primary px-4 py-2 text-sm font-medium text-primary-foreground"
        >
          Recargar la app
        </button>
        <button
          type="button"
          onClick={signOutAndReload}
          className="rounded-md border border-border px-4 py-2 text-sm font-medium text-foreground"
        >
          Cerrar sesión
        </button>
      </div>
    </div>
  )
}

// Wraps the app. Works as a plain React error boundary even when Sentry is not
// initialized (no DSN) — it always catches crashes and shows the panic screen;
// it only *reports* them when Sentry is active.
export function AppErrorBoundary({ children }: { children: ReactNode }) {
  return (
    <Sentry.ErrorBoundary fallback={<PanicScreen />}>
      {children}
    </Sentry.ErrorBoundary>
  )
}
