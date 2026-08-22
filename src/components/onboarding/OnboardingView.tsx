import { useState } from 'react'
import { Check, ChevronRight, Landmark, Wallet, CreditCard, Plus, Briefcase, UserRound, Layers } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRANSFER_ACCOUNTS } from '@/data/defaults'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { CurrencyRadio } from '@/components/ui/CurrencyRadio'
import { ChoiceRow } from '@/components/ui/ChoiceRow'
import { AccountRow } from '@/components/ui/AccountRow'
import { Field } from '@/components/ui/Field'
import { SegmentedControl } from '@/components/ui/SegmentedControl'
import type { Account } from '@/types'

type Currency = 'COP' | 'USD'
type Profile = 'empleado' | 'independiente' | 'ambos'

const CURRENCY_META: Record<Currency, { flag: string; name: string; desc: string }> = {
  COP: { flag: '🇨🇴', name: 'COP', desc: 'Peso colombiano' },
  USD: { flag: '🇺🇸', name: 'USD', desc: 'Dólar americano' },
}

const LOCKED_ACCOUNTS = TRANSFER_ACCOUNTS.filter(a => a.locked)

// ─── Accounts step ────────────────────────────────────────────────────────────

type AccType = 'account' | 'cash' | 'credit'

type NewAccount = {
  label: string
  currency: 'USD' | 'COP'
  type: AccType
  creditLimit?: number
  cutoffDay?: number
  dueDay?: number
  startingBalance?: number  // credit cards store −debt here
}

const ACC_TYPE_LABEL: Record<AccType, string> = {
  account: 'Cuenta bancaria',
  cash:    'Efectivo',
  credit:  'Tarjeta de crédito',
}

// Parse a grouped es-CO number string ("1.750.905") to a plain integer
function parseGrouped(s: string): number {
  return parseInt(s.replace(/[^\d]/g, ''), 10) || 0
}
function clampDay(s: string): number | undefined {
  const n = parseInt(s.replace(/[^\d]/g, ''), 10)
  return n ? Math.min(Math.max(n, 1), 31) : undefined
}

function AccountsStep({ added, onAdd, onRemove }: {
  added: NewAccount[]
  onAdd: (a: NewAccount) => void
  onRemove: (idx: number) => void
}) {
  const [label,    setLabel]    = useState('')
  const [currency, setCurrency] = useState<'USD' | 'COP'>('COP')
  const [type,     setType]     = useState<AccType>('account')
  const [cupo,     setCupo]     = useState('')
  const [deuda,    setDeuda]    = useState('')
  const [cutoff,   setCutoff]   = useState('')
  const [due,      setDue]      = useState('')

  const isCredit = type === 'credit'

  function reset() {
    setLabel(''); setCurrency('COP'); setType('account')
    setCupo(''); setDeuda(''); setCutoff(''); setDue('')
  }

  function handleAdd() {
    if (!label.trim()) return
    const acc: NewAccount = isCredit
      ? {
          label: label.trim(), currency, type,
          creditLimit: parseGrouped(cupo),
          startingBalance: -parseGrouped(deuda),
          cutoffDay: clampDay(cutoff),
          dueDay: clampDay(due),
        }
      : { label: label.trim(), currency, type }
    onAdd(acc)
    reset()
  }

  // Format a numeric string with es-CO grouping as the user types
  const onMoneyChange = (setter: (v: string) => void) => (v: string) => {
    const digits = v.replace(/[^\d]/g, '')
    setter(digits ? parseInt(digits, 10).toLocaleString('es-CO') : '')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="ts-heading-section">Tus cuentas</h2>
        <p className="ts-body-base text-muted-foreground mt-1">
          Agrega las cuentas que usas. Puedes editar detalles y agregar más en <strong>Cuentas</strong>.
        </p>
      </div>

      {/* Efectivo — always included */}
      {LOCKED_ACCOUNTS.map(a => (
        <AccountRow
          key={a.id}
          type="fixed"
          label={a.label}
          description="Siempre incluida"
          badge={
            <span className="ts-label-badge px-1.5 py-0.5 rounded-lg bg-muted text-muted-foreground shrink-0">
              {a.currency}
            </span>
          }
        />
      ))}

      {/* User-added accounts */}
      {added.map((a, i) => (
        <AccountRow
          key={i}
          type="user"
          label={a.label}
          description={ACC_TYPE_LABEL[a.type]
            + (a.type === 'credit' && a.creditLimit ? ` · cupo ${a.creditLimit.toLocaleString('es-CO')}` : '')}
          badge={
            <span className={cn(
              'ts-label-badge px-1.5 py-0.5 rounded-lg shrink-0',
              a.currency === 'USD'
                ? 'bg-[var(--color-income)]/15 text-[var(--color-income-txt)]'
                : 'bg-muted text-muted-foreground',
            )}>
              {a.currency}
            </span>
          }
          onRemove={() => onRemove(i)}
        />
      ))}

      {/* Add form */}
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <p className="ts-body-base-emphasis">Agregar cuenta</p>

        {/* Type */}
        <SegmentedControl
          ariaLabel="Tipo de cuenta"
          className="w-full"
          value={type}
          onChange={setType}
          options={[
            { value: 'account', label: 'Cuenta',   icon: <Landmark size={12} /> },
            { value: 'cash',    label: 'Efectivo', icon: <Wallet size={12} /> },
            { value: 'credit',  label: 'Crédito',  icon: <CreditCard size={12} /> },
          ] as const}
        />

        {/* Name + currency. items-end so the toggle lines up with the input rather
            than stretching alongside the label above it. */}
        <div className="flex items-end gap-2">
          <Field label="Nombre" className="flex-1 min-w-0">
            {id => (
              <input
                id={id}
                type="text"
                value={label}
                onChange={e => setLabel(e.target.value)}
                onKeyDown={e => e.key === 'Enter' && !isCredit && handleAdd()}
                placeholder={isCredit ? 'Ej: Visa Bancolombia' : type === 'cash' ? 'Ej: Billetera, Menudo…' : 'Ej: Bancolombia Ahorros'}
                className="field-input w-full"
              />
            )}
          </Field>
          <SegmentedControl
            ariaLabel="Moneda de la cuenta"
            className="shrink-0"
            value={currency}
            onChange={setCurrency}
            options={[{ value: 'COP', label: 'COP' }, { value: 'USD', label: 'USD' }] as const}
          />
        </div>

        {/* Credit-card fields */}
        {isCredit && (
          <div className="flex flex-col gap-2">
            <div className="flex gap-2">
              <Field label="Cupo total" className="flex-1 min-w-0">
                {id => (
                  <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={cupo}
                    onChange={e => onMoneyChange(setCupo)(e.target.value)}
                    placeholder="2.000.000"
                    className="field-input w-full"
                  />
                )}
              </Field>
              <Field label="Deuda actual" className="flex-1 min-w-0">
                {id => (
                  <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={deuda}
                    onChange={e => onMoneyChange(setDeuda)(e.target.value)}
                    placeholder="0"
                    className="field-input w-full"
                  />
                )}
              </Field>
            </div>
            <div className="flex gap-2">
              <Field label="Día de corte" className="flex-1 min-w-0">
                {id => (
                  <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={cutoff}
                    onChange={e => setCutoff(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                    placeholder="19"
                    className="field-input w-full"
                  />
                )}
              </Field>
              <Field label="Día de pago" className="flex-1 min-w-0">
                {id => (
                  <input
                    id={id}
                    type="text"
                    inputMode="numeric"
                    value={due}
                    onChange={e => setDue(e.target.value.replace(/[^\d]/g, '').slice(0, 2))}
                    placeholder="5"
                    className="field-input w-full"
                  />
                )}
              </Field>
            </div>
          </div>
        )}

        <Button
          size="sm"
          variant="outline"
          className="w-full"
          onClick={handleAdd}
          disabled={!label.trim()}
        >
          <Plus size={14} />
          Agregar
        </Button>
      </div>
    </div>
  )
}

// ─── Profile step ─────────────────────────────────────────────────────────────

const PROFILE_OPTIONS: Array<{ value: Profile; icon: typeof Briefcase; label: string; desc: string }> = [
  {
    value: 'empleado',
    icon: Briefcase,
    label: 'Empleado',
    desc: 'Recibo salario; mi empleador maneja los aportes y la retención.',
  },
  {
    value: 'independiente',
    icon: UserRound,
    label: 'Independiente',
    desc: 'Manejo mis propios aportes a seguridad social y provisiones.',
  },
  {
    value: 'ambos',
    icon: Layers,
    label: 'Ambos',
    desc: 'Tengo salario y también ingresos independientes.',
  },
]

function ProfileStep({ profile, onSelect }: {
  /** null = still unanswered; nothing is highlighted. */
  profile: Profile | null
  onSelect: (p: Profile) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="ts-heading-section">¿Cómo trabajas?</h2>
        <p className="ts-body-base text-muted-foreground mt-1">
          Esto define si Neto calcula tus aportes y provisiones.
        </p>
      </div>

      <div role="radiogroup" aria-label="Cómo trabajas" className="flex flex-col gap-2">
        {PROFILE_OPTIONS.map(opt => (
          <ChoiceRow
            key={opt.value}
            label={opt.label}
            description={opt.desc}
            media={<opt.icon size={17} />}
            selected={profile === opt.value}
            onSelect={() => onSelect(opt.value)}
          />
        ))}
      </div>

      {profile === 'ambos' && (
        <div className="rounded-xl bg-muted/60 border border-[var(--border)] px-3.5 py-3">
          <p className="text-[12px] text-muted-foreground leading-relaxed">
            Al registrar tu salario, márcalo como ingreso <strong>"otro"</strong> para excluirlo
            de los aportes — tus ingresos independientes sí los calcularán.
          </p>
        </div>
      )}

      <p className="ts-body-small text-muted-foreground pb-2">
        Puedes ajustar deducciones y porcentajes en <strong>Configuración</strong>.
      </p>
    </div>
  )
}

// ─── Currency step ────────────────────────────────────────────────────────────

function CurrencyStep({
  primary, secondary,
  onPrimary, onSecondary,
}: {
  /** null = unanswered. */
  primary: Currency | null
  /** undefined = unanswered; null is the real answer "No mostrar". */
  secondary: Currency | null | undefined
  onPrimary: (c: Currency) => void
  onSecondary: (c: Currency | null) => void
}) {
  const secondaryOptions: Array<{ value: Currency | null; label: string; flag?: string; sub: string }> = [
    ...(['COP', 'USD'] as Currency[])
      .filter(c => c !== primary)
      .map(c => ({ value: c, flag: CURRENCY_META[c].flag, label: CURRENCY_META[c].name, sub: CURRENCY_META[c].desc })),
    { value: null, label: 'No mostrar', sub: 'Solo la moneda principal' },
  ]

  return (
    <div className="flex flex-col gap-6">
      <div>
        <h2 className="ts-heading-section">Tu moneda principal</h2>
        <p className="ts-body-base text-muted-foreground mt-1">
          Elige cómo quieres ver los valores en Neto.
        </p>
      </div>

      {/* Primary */}
      <div className="space-y-2">
        <p className="ts-label-micro text-muted-foreground uppercase px-1">Moneda principal</p>
        <div role="radiogroup" aria-label="Moneda principal" className="flex gap-3">
          {(['COP', 'USD'] as Currency[]).map(c => (
            <CurrencyRadio
              key={c}
              code={CURRENCY_META[c].name}
              description={CURRENCY_META[c].desc}
              flag={CURRENCY_META[c].flag}
              selected={primary === c}
              onSelect={() => { onPrimary(c); if (secondary === c) onSecondary(null) }}
            />
          ))}
        </div>
      </div>

      {/* Secondary */}
      <div className="space-y-2">
        <p className="ts-label-micro text-muted-foreground uppercase px-1">Moneda secundaria</p>
        <p className="text-[12px] text-muted-foreground px-1">Equivalencia visible junto a los valores</p>
        <div role="radiogroup" aria-label="Moneda secundaria" className="flex flex-col gap-2">
          {secondaryOptions.map(opt => (
            // No media: 19-choice-rows.md lists this frame as text + trailing radio.
            // The leading tile belongs to the Perfil rows. The old hand-built version
            // carried a flag here; dropping it is the spec's call, not an oversight.
            <ChoiceRow
              key={String(opt.value)}
              label={opt.label}
              description={opt.sub}
              selected={secondary === opt.value}
              onSelect={() => onSecondary(opt.value)}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

// ─── Welcome / Done steps ─────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
      {/* The designed mark — the same asset as the favicon and the PWA icon.
          It carries its own background, so the container only clips and shadows,
          exactly as LoginScreen does it. */}
      <div className="w-16 h-16 rounded-2xl overflow-hidden shadow-lg">
        <img src="/icon.svg" alt="Neto" className="w-full h-full" />
      </div>
      <div>
        <h1 className="ts-heading-display">Bienvenido a Neto</h1>
        <p className="ts-body-base text-muted-foreground mt-2">
          Vamos a configurar tu moneda, tus cuentas<br />y tu perfil en unos pasos rápidos.
        </p>
      </div>
    </div>
  )
}

function DoneStep() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
      <div className="w-16 h-16 rounded-full bg-[var(--primary)] flex items-center justify-center shadow-lg">
        <Check size={28} className="text-[var(--primary-foreground)]" strokeWidth={2.5} />
      </div>
      <div>
        <h1 className="ts-heading-display">¡Todo listo!</h1>
        <p className="ts-body-base text-muted-foreground mt-2">
          Puedes ajustar cuentas, deducciones y más<br />en <strong>Configuración</strong> cuando quieras.
        </p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Steps: 0=welcome  1=currency  2=accounts  3=profile  4=done
const TOTAL_STEPS = 5
const CONTENT_STEPS = [1, 2, 3]   // steps with scrollable content + progress bar
const PROGRESS_STEPS = [1, 2, 3]  // steps counted in the progress bar

export function OnboardingView() {
  const { saveAccountsConfig, completeOnboarding } = useFinanceStore()
  const { setDeductionsEnabled, setDisplayCurrency } = useSettingsStore()
  const { setView } = useUIStore()

  const [step,  setStep]  = useState(0)
  const [added, setAdded] = useState<NewAccount[]>([])
  // Nothing starts selected. "Omitir este paso" means "decido después", so a step
  // must not show a choice it will not save — a highlighted radio is a promise.
  // For the secondary currency `null` is a real answer ("No mostrar"), so
  // `undefined` is what carries "not answered yet".
  const [primary,   setPrimary]   = useState<Currency | null>(null)
  const [secondary, setSecondary] = useState<Currency | null | undefined>(undefined)
  const [profile,   setProfile]   = useState<Profile | null>(null)

  // Skipping is only offered while the step is unanswered. Once a choice exists,
  // offering "omitir" is how the previous version silently discarded it.
  const answered = step === 1
    ? primary !== null || secondary !== undefined
    : step === 3
      ? profile !== null
      : false

  function handleAdd(a: NewAccount) { setAdded(prev => [...prev, a]) }
  function handleRemove(idx: number) { setAdded(prev => prev.filter((_, i) => i !== idx)) }

  function handleNext() {
    // Persist only what was actually answered. An untouched step keeps the store
    // default (COP/USD, deductions on), which is what "decido después" means —
    // and it is reachable later from Configuración.
    if (step === 1 && (primary !== null || secondary !== undefined)) {
      const main = primary ?? 'COP'
      // An unanswered secondary defaults to *the other* currency, which is what the
      // shipped default (COP main / USD secondary) actually means. A fixed 'USD'
      // would render USD/USD for anyone who picks USD as their main.
      setDisplayCurrency(main, secondary === undefined ? (main === 'USD' ? 'COP' : 'USD') : secondary)
    }
    if (step === 3 && profile !== null) {
      // Employees have no self-managed deductions; independents/mixed keep them on
      setDeductionsEnabled(profile !== 'empleado')
    }
    if (step === TOTAL_STEPS - 1) {
      // Persist accounts only here, at the very end. Writing them earlier (at the
      // Cuentas step) flips App's onboardingDone fallback (accounts.length > 0),
      // which unmounts the wizard before the Perfil step — silently skipping the
      // profile / deduction setup.
      const accounts: Account[] = [
        ...added.map((a, i) => ({
          id: `acc_onboarding_${Date.now()}_${i}`,
          number: '',
          rate: 0,
          startingBalance: 0,
          ...a,
        })),
        ...LOCKED_ACCOUNTS,
      ]
      saveAccountsConfig(accounts)
      setView('dashboard')
      completeOnboarding()
      return
    }
    setStep(s => s + 1)
  }

  const isContentStep = CONTENT_STEPS.includes(step)
  // Which progress dot is active (1-based within content steps)
  const progressIndex = PROGRESS_STEPS.indexOf(step) + 1

  return (
    <div
      className="h-full flex flex-col bg-[var(--background)] overflow-hidden"
      style={{
        paddingTop:    'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
    >
      {/* Progress bar */}
      {isContentStep && (
        <div className="flex gap-2 px-6 pb-2">
          {PROGRESS_STEPS.map((_, i) => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                progressIndex > i ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]',
              )}
            />
          ))}
        </div>
      )}

      {/* Content */}
      <div className={cn(
        'flex-1 px-6',
        isContentStep ? 'overflow-y-auto py-5' : 'flex flex-col justify-center',
      )}>
        <div className="max-w-sm mx-auto w-full">
          {step === 0 && <WelcomeStep />}
          {step === 1 && (
            <CurrencyStep
              primary={primary}
              secondary={secondary}
              onPrimary={setPrimary}
              onSecondary={setSecondary}
            />
          )}
          {step === 2 && <AccountsStep added={added} onAdd={handleAdd} onRemove={handleRemove} />}
          {step === 3 && <ProfileStep profile={profile} onSelect={setProfile} />}
          {step === 4 && <DoneStep />}
        </div>
      </div>

      {/* CTA */}
      <div className="shrink-0 px-6 max-w-sm mx-auto w-full space-y-1">
        <Button size="xl" className="w-full" onClick={handleNext}>
          {step === 0
            ? 'Comenzar'
            : step === TOTAL_STEPS - 1
              ? 'Ir a Neto'
              : 'Continuar'}
          {step < TOTAL_STEPS - 1 && <ChevronRight size={18} />}
        </Button>
        {isContentStep && step !== TOTAL_STEPS - 1 && !answered && (
          <Button
            type="button"
            variant="link"
            onClick={() => setStep(s => s + 1)}
            className="w-full text-muted-foreground hover:text-foreground no-underline"
          >
            Omitir este paso
          </Button>
        )}
      </div>
    </div>
  )
}
