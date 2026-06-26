import { useState } from 'react'
import { Check, ChevronRight } from 'lucide-react'
import { cn } from '@/lib/utils'
import { TRANSFER_ACCOUNTS } from '@/data/defaults'
import { useFinanceStore } from '@/store/financeStore'
import { useSettingsStore } from '@/store/settingsStore'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import type { Account, DeductionConfig } from '@/types'

const OPTIONAL_ACCOUNTS = TRANSFER_ACCOUNTS.filter(a => !a.locked)
const LOCKED_ACCOUNTS   = TRANSFER_ACCOUNTS.filter(a => a.locked)

// ─── Account tile ─────────────────────────────────────────────────────────────

function AccountTile({ account, selected, locked, onToggle }: {
  account: Account
  selected: boolean
  locked?: boolean
  onToggle?: () => void
}) {
  return (
    <button
      type="button"
      onClick={locked ? undefined : onToggle}
      disabled={locked}
      className={cn(
        'w-full flex items-center gap-3 px-4 py-3 rounded-xl border transition-all text-left',
        selected
          ? 'border-[var(--primary)] bg-[var(--primary)]/5'
          : 'border-[var(--border)] bg-[var(--card)]',
        locked && 'cursor-default',
      )}
    >
      <div className={cn(
        'w-5 h-5 rounded-full flex items-center justify-center shrink-0 border-2 transition-colors',
        selected
          ? 'bg-[var(--primary)] border-[var(--primary)]'
          : 'border-[var(--border)]',
      )}>
        {selected && <Check size={10} className="text-[var(--primary-foreground)]" strokeWidth={3} />}
      </div>
      <div className="flex-1 min-w-0">
        <p className="text-sm font-medium leading-snug">{account.label}</p>
        {locked && <p className="text-xs text-muted-foreground">Siempre incluida</p>}
      </div>
      <span className={cn(
        'text-[10px] font-bold px-1.5 py-0.5 rounded-md shrink-0',
        account.currency === 'USD'
          ? 'bg-[var(--color-income)]/15 text-[var(--color-income-txt)]'
          : 'bg-muted text-muted-foreground',
      )}>
        {account.currency}
      </span>
    </button>
  )
}

// ─── Steps ────────────────────────────────────────────────────────────────────

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

function AccountsStep({ selectedIds, onToggle }: {
  selectedIds: Set<string>
  onToggle: (id: string) => void
}) {
  return (
    <div className="flex flex-col gap-5">
      <div>
        <h2 className="text-xl font-bold font-heading">Tus cuentas</h2>
        <p className="text-sm text-muted-foreground mt-1">
          Selecciona las que usas. Puedes agregar y editar más en <strong>Cuentas</strong>.
        </p>
      </div>
      <div className="flex flex-col gap-2">
        {OPTIONAL_ACCOUNTS.map(a => (
          <AccountTile
            key={a.id}
            account={a}
            selected={selectedIds.has(a.id)}
            onToggle={() => onToggle(a.id)}
          />
        ))}
        {LOCKED_ACCOUNTS.map(a => (
          <AccountTile key={a.id} account={a} selected locked />
        ))}
      </div>
    </div>
  )
}

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

const TOTAL_STEPS = 4  // 0=welcome, 1=accounts, 2=deductions, 3=done

export function OnboardingView() {
  const { saveAccountsConfig, completeOnboarding } = useFinanceStore()
  const { deductions, setDeduction } = useSettingsStore()

  const [step, setStep]           = useState(0)
  const [selectedIds, setSelectedIds] = useState<Set<string>>(new Set())

  function toggleAccount(id: string) {
    setSelectedIds(prev => {
      const next = new Set(prev)
      next.has(id) ? next.delete(id) : next.add(id)
      return next
    })
  }

  function handleNext() {
    if (step === 1) {
      const selected = OPTIONAL_ACCOUNTS.filter(a => selectedIds.has(a.id))
      saveAccountsConfig([...selected, ...LOCKED_ACCOUNTS])
    }
    if (step === TOTAL_STEPS - 1) {
      completeOnboarding()
      return
    }
    setStep(s => s + 1)
  }

  function handleSkip() {
    setStep(s => s + 1)
  }

  const isContentStep = step === 1 || step === 2

  return (
    <div
      className="min-h-[100dvh] flex flex-col bg-[var(--background)]"
      style={{
        paddingTop:    'max(16px, env(safe-area-inset-top))',
        paddingBottom: 'max(24px, env(safe-area-inset-bottom))',
      }}
    >
      {/* Progress bar */}
      {isContentStep && (
        <div className="flex gap-2 px-6 pb-2">
          {[1, 2].map(i => (
            <div
              key={i}
              className={cn(
                'h-1 flex-1 rounded-full transition-colors duration-300',
                step >= i ? 'bg-[var(--primary)]' : 'bg-[var(--muted)]',
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
            <AccountsStep selectedIds={selectedIds} onToggle={toggleAccount} />
          )}
          {step === 2 && (
            <DeductionsStep
              deductions={deductions}
              onToggle={(id, enabled) => setDeduction(id, { enabled })}
            />
          )}
          {step === 3 && <DoneStep />}
        </div>
      </div>

      {/* CTA */}
      <div className="px-6 max-w-sm mx-auto w-full space-y-1">
        <Button size="xl" className="w-full" onClick={handleNext}>
          {step === 0
            ? 'Comenzar'
            : step === TOTAL_STEPS - 1
              ? 'Ir a Neto'
              : 'Continuar'}
          {step < TOTAL_STEPS - 1 && <ChevronRight size={18} />}
        </Button>
        {isContentStep && (
          <button
            type="button"
            onClick={handleSkip}
            className="w-full text-center text-sm text-muted-foreground py-2.5 hover:text-foreground transition-colors"
          >
            Omitir este paso
          </button>
        )}
      </div>
    </div>
  )
}
