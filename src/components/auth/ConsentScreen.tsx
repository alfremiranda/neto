import { useState } from 'react'
import { ChartPie, Landmark, Lock } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useFinanceStore } from '@/store/financeStore'
import { PRIVACY_POLICY_VERSION, PRIVACY_POLICY_URL } from '@/lib/privacy'
import { Button } from '@/components/ui/button'
import { Spinner } from '@/components/ui/Spinner'

// Blocking consent gate (Ley 1581). Rendered as a full-screen view in App's gating
// chain (between login and onboarding), NOT a dismissible modal — there is no Esc,
// click-outside or X. The only ways out are authorising (records consent) or
// "No acepto" (signs out). Shown to new users AND to existing users who never
// accepted / accepted an older version (see needsPrivacyConsent).
//
// The copy is verbatim from design-system/docs/18-consent.md and three phrases come
// from neto-legal.md, NOT from design — do not reword them when touching this file:
//
//   · "Neto no es asesoría tributaria ni contable" — literal, and only ever negated.
//     Ley 43 de 1990 art. 2°: tax advice is a reserved profession, so the word may
//     never appear in the positive.
//   · "estima tus obligaciones" — never a verb of determination. Never "calcula lo
//     que debes pagar".
//   · "el tratamiento y la transferencia internacional" — naming the transfer is the
//     legal basis for Supabase. Dropping it voids the authorisation.
//
// The block order is the argument: what Neto is, then where it ends, then the data.
// The other way round asks permission from someone who does not yet know what for.
const BLOCKS = [
  {
    Icon: ChartPie,
    title: 'Neto es un planeador, no un asesor',
    body: 'Ordena lo que entra, lo que sale y lo que conviene apartar. Con lo que registres, '
        + 'estima tus obligaciones para que las veas venir con tiempo y no el día del pago.',
  },
  {
    Icon: Landmark,
    title: 'Donde termina Neto, empieza tu contador',
    // Titled as a division of scope, never as an exclusion of liability: Ley 1480
    // art. 43 voids clauses that limit the provider's liability.
    body: 'Neto no es asesoría tributaria ni contable, y no lo reemplaza. Sus cifras son '
        + 'estimaciones hechas con los datos que ingreses: antes de pagar una planilla o '
        + 'presentar una declaración, verifícalas con él.',
  },
  {
    Icon: Lock,
    title: 'Tus datos viven en tu dispositivo',
    body: 'Se sincronizan a la nube para que los tengas en todos tus dispositivos, en servidores '
        + 'de Estados Unidos y la Unión Europea. Tu correo sólo identifica tu cuenta, y el '
        + 'servicio que nos avisa de fallas nunca ve tus cifras.',
  },
] as const

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
      <div className="w-full max-w-[420px] flex flex-col gap-6 py-6">
        <div className="space-y-1">
          <h1 className="ts-heading-display">Antes de empezar</h1>
          <p className="ts-body-base text-muted-foreground">Tres cosas que vale la pena tener claras.</p>
        </div>

        <div className="flex flex-col gap-5">
          {BLOCKS.map(({ Icon, title, body }) => (
            <div key={title} className="flex gap-3">
              <span
                aria-hidden="true"
                className="w-9 h-9 rounded-xl shrink-0 flex items-center justify-center bg-[var(--bg-brand-alpha-10)] text-[var(--primary)]"
              >
                <Icon size={17} />
              </span>
              <div className="flex-1 min-w-0">
                <h2 className="ts-body-base-emphasis">{title}</h2>
                <p className="ts-body-small text-muted-foreground leading-snug mt-1">{body}</p>
              </div>
            </div>
          ))}
        </div>

        {/* The rule separates the explanation from the act of authorising. */}
        <hr className="border-[var(--border)]" />

        <p className="ts-body-small text-muted-foreground">
          Al continuar autorizas el tratamiento y la transferencia internacional de tus datos en
          los términos de la{' '}
          <a
            href={PRIVACY_POLICY_URL}
            target="_blank"
            rel="noopener noreferrer"
            className="text-[var(--primary)] underline underline-offset-2 hover:opacity-80"
          >
            Política de Privacidad
          </a>.
        </p>

        {/* Both buttons are the same width, stacked on mobile and side by side from sm.
            Consent has to be genuinely refusable, so the primary stands out by colour
            and never by size. */}
        <div className="flex flex-col sm:flex-row gap-2">
          <Button
            type="button"
            onClick={handleAccept}
            disabled={busy !== null}
            className="w-full sm:flex-1 h-12"
          >
            {busy === 'accept' && <Spinner />}
            Autorizar y continuar
          </Button>
          <Button
            type="button"
            variant="outline"
            onClick={handleDecline}
            disabled={busy !== null}
            className="w-full sm:flex-1 h-12 text-muted-foreground hover:text-foreground"
          >
            {busy === 'decline' && <Spinner />}
            No acepto
          </Button>
        </div>

        <p className="ts-detail-large text-muted-foreground">
          Si no aceptas, cerramos tu sesión. Para que borremos tus datos, escríbenos a{' '}
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
