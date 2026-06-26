import { useState, useEffect } from 'react'
import { ArrowLeft, LogOut, Check } from 'lucide-react'
import { useAuthStore } from '@/store/authStore'
import { useSettingsStore } from '@/store/settingsStore'
import { useUIStore } from '@/store/uiStore'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

// ─── Currency picker ──────────────────────────────────────────────────────────

type Currency = 'COP' | 'USD'

const CURRENCY_META: Record<Currency, { flag: string; name: string }> = {
  COP: { flag: '🇨🇴', name: 'Peso colombiano' },
  USD: { flag: '🇺🇸', name: 'Dólar americano' },
}

function CurrencyCard({
  currency, selected, onClick,
}: { currency: Currency; selected: boolean; onClick: () => void }) {
  const meta = CURRENCY_META[currency]
  return (
    <button
      type="button"
      onClick={onClick}
      className={cn(
        'flex-1 flex flex-col items-center gap-2 py-4 px-3 rounded-xl border-2 transition-all duration-150',
        selected
          ? 'border-[var(--primary)] bg-[var(--primary)]/8'
          : 'border-[var(--border)] bg-[var(--card)] hover:border-[var(--primary)]/40',
      )}
    >
      <span className="text-2xl leading-none select-none">{meta.flag}</span>
      <div className="text-center">
        <p className="text-sm font-bold">{currency}</p>
        <p className="text-[11px] text-muted-foreground leading-snug">{meta.name}</p>
      </div>
      {selected && (
        <div className="w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center">
          <Check size={9} strokeWidth={3} className="text-[var(--primary-foreground)]" />
        </div>
      )}
    </button>
  )
}

// ─── Main view ────────────────────────────────────────────────────────────────

export function ProfileView() {
  const { user, signOut } = useAuthStore()
  const { displayName, primaryCurrency, secondaryCurrency, setDisplayName, setDisplayCurrency } = useSettingsStore()
  const { goBack, showToast } = useUIStore()

  const avatarUrl  = user?.user_metadata?.avatar_url as string | undefined
  const oauthName  = (user?.user_metadata?.full_name ?? user?.user_metadata?.user_name ?? '') as string
  const email      = user?.email ?? ''
  const provider   = (user?.app_metadata?.provider ?? '') as string

  const displayedName = displayName.trim() || oauthName

  const initials = displayedName
    .split(' ')
    .map((w: string) => w[0])
    .join('')
    .slice(0, 2)
    .toUpperCase()

  // Local state for the name input
  const [nameInput, setNameInput] = useState(displayName)

  // Local state for currency (applied on save)
  const [primary,   setPrimary]   = useState<Currency>(primaryCurrency)
  const [secondary, setSecondary] = useState<Currency | null>(secondaryCurrency)

  // Reset if store changes externally
  useEffect(() => { setNameInput(displayName) }, [displayName])
  useEffect(() => { setPrimary(primaryCurrency); setSecondary(secondaryCurrency) }, [primaryCurrency, secondaryCurrency])

  function handleSaveName() {
    const trimmed = nameInput.trim()
    setDisplayName(trimmed)
    showToast(trimmed ? 'Nombre actualizado' : 'Nombre restablecido')
  }

  function handleSelectPrimary(c: Currency) {
    setPrimary(c)
    // If secondary matches new primary, clear it
    if (secondary === c) setSecondary(null)
  }

  function handleSaveCurrency() {
    setDisplayCurrency(primary, secondary)
    showToast('Preferencias guardadas')
  }

  const providerLabel = provider === 'github' ? 'GitHub'
    : provider === 'google' ? 'Google'
    : provider

  const secondaryOptions: Array<{ value: Currency | null; label: string; flag?: string }> = [
    ...((['COP', 'USD'] as Currency[]).filter(c => c !== primary).map(c => ({
      value: c,
      label: CURRENCY_META[c].name,
      flag: CURRENCY_META[c].flag,
    }))),
    { value: null, label: 'No mostrar' },
  ]

  return (
    <div className="max-w-lg mx-auto w-full space-y-6">

      {/* Back + title */}
      <div className="flex items-center gap-3">
        <button
          type="button"
          onClick={goBack}
          className="w-8 h-8 flex items-center justify-center rounded-lg hover:bg-[var(--muted)] transition-colors text-muted-foreground hover:text-foreground"
          aria-label="Volver"
        >
          <ArrowLeft size={16} />
        </button>
        <h1 className="text-lg font-bold font-heading">Perfil</h1>
      </div>

      {/* Avatar + identity */}
      <div className="flex flex-col items-center gap-3 py-4">
        <div className="w-20 h-20 rounded-full overflow-hidden border-2 border-[var(--border)] shrink-0">
          {avatarUrl
            ? <img src={avatarUrl} alt={displayedName} className="w-full h-full object-cover" />
            : <span className="w-full h-full flex items-center justify-center bg-[var(--muted)] text-xl font-bold text-muted-foreground select-none">{initials}</span>
          }
        </div>
        <div className="text-center">
          <p className="font-semibold text-base">{displayedName}</p>
          <p className="text-sm text-muted-foreground">{email}</p>
          {providerLabel && (
            <span className="inline-flex items-center gap-1 mt-1.5 text-[11px] font-medium px-2 py-0.5 rounded-full bg-[var(--muted)] text-muted-foreground">
              {providerLabel}
            </span>
          )}
        </div>
      </div>

      {/* Display name */}
      <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] divide-y divide-[var(--border)] overflow-hidden">
        <div className="px-4 py-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-3">Nombre de display</p>
          <input
            type="text"
            value={nameInput}
            onChange={e => setNameInput(e.target.value)}
            onBlur={handleSaveName}
            onKeyDown={e => e.key === 'Enter' && handleSaveName()}
            placeholder={oauthName || 'Tu nombre'}
            className="field-input w-full"
          />
          <p className="text-[11px] text-muted-foreground mt-2">
            Aparece en la app. Deja en blanco para usar el nombre de {providerLabel || 'tu cuenta'}.
          </p>
        </div>
      </section>

      {/* Currency preferences */}
      <section className="bg-[var(--card)] rounded-xl border border-[var(--border)] overflow-hidden">
        <div className="px-4 pt-4 pb-3">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Moneda principal</p>
          <p className="text-[12px] text-muted-foreground mb-3">Cómo se muestran los valores en la app</p>
          <div className="flex gap-3">
            <CurrencyCard currency="COP" selected={primary === 'COP'} onClick={() => handleSelectPrimary('COP')} />
            <CurrencyCard currency="USD" selected={primary === 'USD'} onClick={() => handleSelectPrimary('USD')} />
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[var(--border)]">
          <p className="text-xs font-semibold text-muted-foreground uppercase tracking-wide mb-1">Moneda secundaria</p>
          <p className="text-[12px] text-muted-foreground mb-3">Equivalencia visible junto a los valores principales</p>
          <div className="flex flex-col gap-2">
            {secondaryOptions.map(opt => (
              <button
                key={String(opt.value)}
                type="button"
                onClick={() => setSecondary(opt.value)}
                className={cn(
                  'flex items-center gap-3 px-3 py-2.5 rounded-xl border-2 text-left transition-all duration-150',
                  secondary === opt.value
                    ? 'border-[var(--primary)] bg-[var(--primary)]/8'
                    : 'border-[var(--border)] bg-[var(--background)] hover:border-[var(--primary)]/40',
                )}
              >
                {opt.flag && <span className="text-lg leading-none select-none">{opt.flag}</span>}
                {!opt.flag && <span className="w-[26px] h-[26px] flex items-center justify-center rounded-full bg-muted text-muted-foreground text-sm font-bold shrink-0">–</span>}
                <span className="text-sm font-medium">
                  {opt.value ? <><strong>{opt.value}</strong> · {opt.label}</> : opt.label}
                </span>
                {secondary === opt.value && (
                  <div className="ml-auto w-4 h-4 rounded-full bg-[var(--primary)] flex items-center justify-center shrink-0">
                    <Check size={9} strokeWidth={3} className="text-[var(--primary-foreground)]" />
                  </div>
                )}
              </button>
            ))}
          </div>
        </div>

        <div className="px-4 py-3 border-t border-[var(--border)]">
          <Button
            className="w-full"
            onClick={handleSaveCurrency}
            disabled={primary === primaryCurrency && secondary === secondaryCurrency}
          >
            Guardar preferencias
          </Button>
        </div>
      </section>

      {/* Sign out */}
      <section>
        <Button
          variant="outline-danger"
          className="w-full"
          onClick={() => { signOut() }}
        >
          <LogOut size={15} />
          Cerrar sesión
        </Button>
      </section>

    </div>
  )
}
