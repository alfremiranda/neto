import { useState } from 'react'
import { Check, ChevronRight, Landmark, Wallet, Plus, X } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRANSFER_ACCOUNTS } from '@/data/defaults'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { Account, DeductionConfig } from '@/types'

type Currency = 'COP' | 'USD'

const CURRENCY_META: Record<Currency, { flag: string; name: string; desc: string }> = {
  COP: { flag: '🇨🇴', name: 'COP', desc: 'Peso colombiano' },
  USD: { flag: '🇺🇸', name: 'USD', desc: 'Dólar americano' },
}

const LOCKED_ACCOUNTS = TRANSFER_ACCOUNTS.filter(a => a.locked)

// ─── Accounts step ────────────────────────────────────────────────────────────

type NewAccount = Omit<Account, 'id' | 'number' | 'rate' | 'startingBalance'>

function AccountsStep({ added, onAdd, onRemove }: {
  added: NewAccount[]
  onAdd: (a: NewAccount) => void
  onRemove: (idx: number) => void
}) {
  const [label,    setLabel]    = useState('')
  const [currency, setCurrency] = useState<'USD' | 'COP'>('COP')
  const [type,     setType]     = useState<'account' | 'cash'>('account')

  function handleAdd() {
    if (!label.trim()) return
    onAdd({ label: label.trim(), currency, type })
    setLabel('')
    setCurrency('COP')
    setType('account')
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold font-heading">Tus cuentas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Agrega las cuentas que usas. Puedes editar detalles y agregar más en <strong>Cuentas</strong>.
        </p>
      </div>

      {/* Efectivo — always included */}
      {LOCKED_ACCOUNTS.map(a => (
        <div key={a.id} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--border)] bg-[var(--card)]">
          <div className="w-5 h-5 rounded-full bg-[var(--primary)] border-2 border-[var(--primary)] flex items-center justify-center shrink-0">
            <Check size={10} className="text-[var(--primary-foreground)]" strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium">{a.label}</p>
            <p className="text-xs text-muted-foreground">Siempre incluida</p>
          </div>
          <span className="text-[10px] font-bold px-1.5 py-0.5 rounded-md bg-muted text-muted-foreground shrink-0">
            {a.currency}
          </span>
        </div>
      ))}

      {/* User-added accounts */}
      {added.map((a, i) => (
        <div key={i} className="flex items-center gap-3 px-4 py-3 rounded-xl border border-[var(--primary)] bg-[var(--primary)]/5">
          <div className="w-5 h-5 rounded-full bg-[var(--primary)] border-2 border-[var(--primary)] flex items-center justify-center shrink-0">
            <Check size={10} className="text-[var(--primary-foreground)]" strokeWidth={3} />
          </div>
          <div className="flex-1 min-w-0">
            <p className="text-sm font-medium truncate">{a.label}</p>
            <p className="text-xs text-muted-foreground">{a.type === 'cash' ? 'Efectivo' : 'Cuenta bancaria'}</p>
          </div>
          <span className={cn(
            'text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0',
            a.currency === 'USD'
              ? 'bg-[var(--color-income)]/15 text-[var(--color-income-txt)]'
              : 'bg-muted text-muted-foreground',
          )}>
            {a.currency}
          </span>
          <button
            type="button"
            onClick={() => onRemove(i)}
            className="shrink-0 w-7 h-7 flex items-center justify-center rounded-lg text-muted-foreground hover:text-foreground hover:bg-[var(--accent)] transition-colors"
            aria-label="Eliminar cuenta"
          >
            <X size={14} />
          </button>
        </div>
      ))}

      {/* Add form */}
      <div className="rounded-xl border border-dashed border-[var(--border)] bg-[var(--card)] p-4 space-y-3">
        <p className="text-sm font-semibold">Agregar cuenta</p>

        {/* Type */}
        <div className="flex rounded-lg border border-[var(--border)] p-0.5 gap-0.5">
          {([['account', 'Cuenta bancaria', Landmark], ['cash', 'Efectivo / Bolsillo', Wallet]] as const).map(([t, tLabel, Icon]) => (
            <button
              key={t}
              type="button"
              onClick={() => setType(t)}
              className={cn(
                'flex-1 flex items-center justify-center gap-1.5 py-1.5 rounded-md text-xs font-medium transition-colors border-0',
                type === t
                  ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                  : 'bg-transparent text-muted-foreground hover:text-foreground',
              )}
            >
              <Icon size={12} />
              {tLabel}
            </button>
          ))}
        </div>

        {/* Name + currency */}
        <div className="flex gap-2">
          <input
            type="text"
            value={label}
            onChange={e => setLabel(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && handleAdd()}
            placeholder={type === 'cash' ? 'Ej: Billetera, Menudo…' : 'Ej: Bancolombia Ahorros'}
            className="field-input flex-1 min-w-0"
          />
          <div className="flex rounded-lg border border-[var(--border)] p-0.5 gap-0.5 shrink-0">
            {(['COP', 'USD'] as const).map(c => (
              <button
                key={c}
                type="button"
                onClick={() => setCurrency(c)}
                className={cn(
                  'px-2.5 py-1 rounded-md text-xs font-bold transition-colors border-0',
                  currency === c
                    ? 'bg-[var(--primary)] text-[var(--primary-foreground)]'
                    : 'bg-transparent text-muted-foreground hover:text-foreground',
                )}
              >
                {c}
              </button>
            ))}
          </div>
        </div>

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

// ─── Deductions step ──────────────────────────────────────────────────────────

function DeductionsStep({ deductions, onToggle }: {
  deductions: DeductionConfig[]
  onToggle: (id: string, enabled: boolean) => void
}) {
  const ss        = deductions.filter(d => d.group === 'ss')
  const provision = deductions.filter(d => d.group === 'provision')

  function Section({ title, items }: { title: string; items: DeductionConfig[] }) {
    return (
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">{title}</p>
        <div className="bg-[var(--card)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)]">
          {items.map(d => (
            <div key={d.id} className="flex items-center justify-between px-4 py-3 gap-3">
              <div className="min-w-0">
                <p className="text-sm font-medium leading-snug">{d.label}</p>
                <p className="text-xs text-muted-foreground">{d.pct}%</p>
              </div>
              <Switch
                checked={d.enabled}
                onCheckedChange={v => onToggle(d.id, v)}
              />
            </div>
          ))}
        </div>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold font-heading">Tus obligaciones</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Activa las deducciones que apliquen a tu situación.
        </p>
      </div>
      <Section title="Seguridad Social" items={ss} />
      <Section title="Provisiones" items={provision} />
      <p className="text-xs text-muted-foreground pb-2">
        Puedes ajustar porcentajes y agregar más en <strong>Configuración</strong>.
      </p>
    </div>
  )
}

// ─── Currency step ────────────────────────────────────────────────────────────

function CurrencyStep({
  primary, secondary,
  onPrimary, onSecondary,
}: {
  primary: Currency
  secondary: Currency | null
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
        <h2 className="text-xl font-bold font-heading">Tu moneda principal</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Elige cómo quieres ver los valores en Neto.
        </p>
      </div>

      {/* Primary */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Moneda principal</p>
        <div className="flex gap-3">
          {(['COP', 'USD'] as Currency[]).map(c => {
            const meta = CURRENCY_META[c]
            const selected = primary === c
            return (
              <button
                key={c}
                type="button"
                onClick={() => {
                  onPrimary(c)
                  if (secondary === c) onSecondary(null)
                }}
                className={cn(
                  'flex-1 flex flex-col items-center gap-2 py-5 px-3 rounded-xl border-2 transition-all duration-150',
                  selected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/8'
                    : 'border-[var(--border)] bg-[var(--card)]',
                )}
              >
                <span className="text-3xl leading-none select-none">{meta.flag}</span>
                <div className="text-center">
                  <p className="text-sm font-bold">{meta.name}</p>
                  <p className="text-[11px] text-muted-foreground">{meta.desc}</p>
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center transition-colors',
                  selected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]',
                )}>
                  {selected && <Check size={10} strokeWidth={3} className="text-[var(--primary-foreground)]" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>

      {/* Secondary */}
      <div className="space-y-2">
        <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide px-1">Moneda secundaria</p>
        <p className="text-[12px] text-muted-foreground px-1">Equivalencia visible junto a los valores</p>
        <div className="flex flex-col gap-2">
          {secondaryOptions.map(opt => {
            const selected = secondary === opt.value
            return (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => onSecondary(opt.value)}
                className={cn(
                  'flex items-center gap-3 px-4 py-3 rounded-xl border-2 text-left transition-all duration-150',
                  selected
                    ? 'border-[var(--primary)] bg-[var(--primary)]/8'
                    : 'border-[var(--border)] bg-[var(--card)]',
                )}
              >
                {opt.flag
                  ? <span className="text-xl leading-none select-none">{opt.flag}</span>
                  : <span className="w-7 h-7 flex items-center justify-center rounded-full bg-muted text-muted-foreground font-bold shrink-0">–</span>
                }
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium">{opt.value ? <><strong>{opt.label}</strong> · {opt.sub}</> : opt.label}</p>
                  {!opt.value && <p className="text-[11px] text-muted-foreground">{opt.sub}</p>}
                </div>
                <div className={cn(
                  'w-5 h-5 rounded-full border-2 flex items-center justify-center shrink-0 transition-colors',
                  selected ? 'border-[var(--primary)] bg-[var(--primary)]' : 'border-[var(--border)]',
                )}>
                  {selected && <Check size={10} strokeWidth={3} className="text-[var(--primary-foreground)]" />}
                </div>
              </button>
            )
          })}
        </div>
      </div>
    </div>
  )
}

// ─── Welcome / Done steps ─────────────────────────────────────────────────────

function WelcomeStep() {
  return (
    <div className="flex-1 flex flex-col items-center justify-center text-center gap-6">
      <div className="w-16 h-16 rounded-2xl bg-foreground flex items-center justify-center shadow-lg">
        <span className="text-background font-heading font-black text-3xl leading-none select-none">N</span>
      </div>
      <div>
        <h1 className="text-2xl font-bold font-heading">Bienvenido a Neto</h1>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Vamos a configurar tus cuentas y obligaciones<br />en 2 pasos rápidos.
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
        <h2 className="text-2xl font-bold font-heading">¡Todo listo!</h2>
        <p className="text-sm text-muted-foreground mt-2 leading-relaxed">
          Puedes ajustar cuentas, deducciones y más<br />en <strong>Configuración</strong> cuando quieras.
        </p>
      </div>
    </div>
  )
}

// ─── Main ─────────────────────────────────────────────────────────────────────

// Steps: 0=welcome  1=currency  2=accounts  3=deductions  4=done
const TOTAL_STEPS = 5
const CONTENT_STEPS = [1, 2, 3]   // steps with scrollable content + progress bar
const PROGRESS_STEPS = [1, 2, 3]  // steps counted in the progress bar

export function OnboardingView() {
  const { saveAccountsConfig, completeOnboarding } = useFinanceStore()
  const { deductions, setDeduction, setDisplayCurrency } = useSettingsStore()
  const { setView } = useUIStore()

  const [step,      setStep]      = useState(0)
  const [added,     setAdded]     = useState<NewAccount[]>([])
  const [primary,   setPrimary]   = useState<Currency>('COP')
  const [secondary, setSecondary] = useState<Currency | null>('USD')

  function handleAdd(a: NewAccount) { setAdded(prev => [...prev, a]) }
  function handleRemove(idx: number) { setAdded(prev => prev.filter((_, i) => i !== idx)) }

  function handleNext() {
    if (step === 1) {
      setDisplayCurrency(primary, secondary)
    }
    if (step === 2) {
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
    }
    if (step === TOTAL_STEPS - 1) {
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
      className="h-[100dvh] flex flex-col bg-[var(--background)] overflow-hidden"
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
          {step === 3 && (
            <DeductionsStep
              deductions={deductions}
              onToggle={(id, enabled) => setDeduction(id, { enabled })}
            />
          )}
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
        {isContentStep && step !== TOTAL_STEPS - 1 && (
          <button
            type="button"
            onClick={() => setStep(s => s + 1)}
            className="w-full text-center text-sm text-muted-foreground py-2.5 hover:text-foreground transition-colors"
          >
            Omitir este paso
          </button>
        )}
      </div>
    </div>
  )
}
