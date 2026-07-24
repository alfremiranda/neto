import { useState } from 'react'
import { useAuthStore } from '@/store/authStore'
import { useFinanceStore } from '@/store/financeStore'
import { PRIVACY_POLICY_VERSION, PRIVACY_POLICY_URL } from '@/lib/privacy'

// Blocking consent gate (Ley 1581). Rendered as a full-screen view in App's gating
// chain (between login and onboarding), NOT a dismissible modal — there is no Esc,
// click-outside or X. The only ways out are "Aceptar" (records consent) or
// "No acepto" (signs out). Shown to new users AND to existing users who never
// accepted / accepted an older version (see needsPrivacyConsent).
export function ConsentScreen() {
  const acceptPrivacyPolicy = useFinanceStore(s => s.acceptPrivacyPolicy)
  const signOut = useAuthStore(s => s.signOut)
  const [busy, setBusy] = useState<'accept' | 'decline' | null>(null)

  function handleAccept() {
    setBusy('accept')
    acceptPrivacyPolicy(PRIVACY_POLICY_VERSION)
    // No await: the store update flips needsPrivacyConsent → App re-renders past
    // this gate. (autoPush syncs in the background; local-first, so offline is fine.)
  }

  async function handleDecline() {
    setBusy('decline')
    try {
      await signOut()
    } catch {
      /* ignore — auth listener resolves the signed-out state regardless */
    }
  }

  return (
    <div
      className="h-full flex flex-col items-center justify-center px-6 bg-[var(--background)] overflow-y-auto"
      style={{
        paddingTop: 'max(24px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
    >
      <div className="w-full max-w-[380px] flex flex-col gap-6">
        <div className="space-y-3">
          <h1 className="text-xl font-bold font-heading">Antes de empezar</h1>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Neto guarda tus datos financieros en tu dispositivo y los respalda en la nube
            para sincronizarlos entre tus dispositivos. Usamos tu correo para identificar tu
            cuenta y un servicio de monitoreo de errores (que <strong>no</strong> recibe datos
            financieros) para corregir fallas.
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Tus datos se almacenan en servidores fuera de Colombia (Estados Unidos y la Unión
            Europea).
          </p>
          <p className="text-sm text-muted-foreground leading-relaxed">
            Al continuar, autorizas el tratamiento de tus datos como se describe en la{' '}
            <a
              href={PRIVACY_POLICY_URL}
              target="_blank"
              rel="noopener noreferrer"
              className="text-[var(--primary)] underline underline-offset-2 hover:opacity-80"
            >
              Política de Privacidad
            </a>.
          </p>
        </div>

        <div className="flex flex-col gap-2">
          <button
            type="button"
            onClick={handleAccept}
            disabled={busy !== null}
            className="w-full h-12 rounded-xl bg-[var(--primary)] text-[var(--primary-foreground)] text-sm font-medium transition-opacity hover:opacity-90 disabled:opacity-50 disabled:pointer-events-none"
          >
            Aceptar y continuar
          </button>
          <button
            type="button"
            onClick={handleDecline}
            disabled={busy !== null}
            className="w-full h-11 rounded-xl border border-[var(--border)] text-muted-foreground text-sm font-medium transition-colors hover:text-foreground disabled:opacity-50 disabled:pointer-events-none"
          >
            No acepto
          </button>
        </div>

        <p className="text-[11px] text-muted-foreground leading-relaxed">
          Si no aceptas, cerraremos tu sesión. Para eliminar tus datos, escríbenos a{' '}
          <a
            href="mailto:privacidad@netofinanzas.app"
            className="underline underline-offset-2 hover:text-foreground"
          >
            privacidad@netofinanzas.app
          </a>.
        </p>
      </div>
    </div>
  )
}
