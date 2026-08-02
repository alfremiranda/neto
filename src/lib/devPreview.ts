/**
 * Dev-only preview mode — mounts the authenticated app with seeded local data
 * and NO Supabase session, so the views behind the auth gate can be opened and
 * screenshotted (typography batches, visual QA, design review).
 *
 * Safety, in order of importance:
 *
 * 1. `import.meta.env.DEV` is statically `false` in a production build, so every
 *    branch below folds to `false` and the seed data is dropped by tree-shaking.
 *    There is no runtime flag, header or cookie that can turn this on in prod.
 * 2. It is opt-in per page load (`?preview`), so ordinary `npm run dev` work is
 *    untouched — you get the real login screen unless you ask for this.
 * 3. It never fabricates a Supabase session — it seeds the store and tells `App`
 *    to skip the gates. Nothing here can reach the network or the real auth flow.
 *
 * It does go through the normal persisted store, so it replaces whatever is in
 * the dev localStorage. `backupBeforeSeed()` copies the previous value to
 * `amd-finance.pre-preview` first, so a dev session is recoverable.
 *
 * Usage: `npm run dev` then open http://localhost:5173/?preview
 *        (or ?preview=onboarding to land on the onboarding flow instead)
 */
import { TRANSFER_ACCOUNTS } from '@/data/defaults'
import type { FinanceDB } from '@/types'

const PARAM = import.meta.env.DEV
  ? new URLSearchParams(window.location.search).get('preview')
  : null

/** True for any preview mode: walks past the auth and consent gates. */
export const DEV_PREVIEW = import.meta.env.DEV && PARAM !== null

/**
 * `?preview=onboarding` keeps the onboarding gate CLOSED instead of skipping it,
 * so that view can be reached too. Plain `?preview` still lands on the app.
 * Anything else is treated as plain `?preview`.
 */
export const DEV_PREVIEW_ONBOARDING = DEV_PREVIEW && PARAM === 'onboarding' 

/**
 * The fixture lands in whatever month the app opens on, and dates every entry on
 * day 01. Both matter: the app opens on the current month, and it excludes
 * future-dated expenses from the totals — a fixture with entries on day 12 shows
 * "Gastos $0" for the first eleven days of every month, which is correct
 * behaviour and a useless screenshot.
 */
const PREVIEW_MONTH = new Date().toISOString().slice(0, 7)
const DAY_ONE = `${PREVIEW_MONTH}-01`
const TS = Date.parse(`${DAY_ONE}T12:00:00Z`)

const STORE_KEY = 'amd-finance'
const BACKUP_KEY = 'amd-finance.pre-preview'

/**
 * Preserve whatever the dev had before the fixture overwrites it. Restore with:
 * `localStorage.setItem('amd-finance', localStorage.getItem('amd-finance.pre-preview'))`
 */
export function backupBeforeSeed(): void {
  const current = localStorage.getItem(STORE_KEY)
  if (current && !localStorage.getItem(BACKUP_KEY)) {
    localStorage.setItem(BACKUP_KEY, current)
    console.info(
      `[preview] your dev data was backed up to "${BACKUP_KEY}". Restore:\n` +
      `localStorage.setItem('${STORE_KEY}', localStorage.getItem('${BACKUP_KEY}'))`,
    )
  }
}

/**
 * A month with enough shape to exercise the views: income in both currencies,
 * expenses across several categories, and balances that make the KPI cards and
 * the annual table render real figures instead of zeros.
 */
export function previewDB(): FinanceDB {
  return {
    _settings: {
      accounts: TRANSFER_ACCOUNTS.map(a => ({
        ...a,
        startingBalance: a.currency === 'USD' ? 4200 : 6_500_000,
        favorite: a.id === 'ARQ' || a.id === 'Bancolombia',
        updatedAt: TS,
      })),
      onboardingDone: true,
      displayName: 'Preview',
      primaryCurrency: 'COP',
      secondaryCurrency: 'USD',
      privacyConsent: { version: 1, acceptedAt: TS },
      fieldUpdatedAt: { onboardingDone: TS },
    },
    [PREVIEW_MONTH]: {
      trm: 3980.5,
      incomes: [
        { id: 1, desc: 'Observer Hub — mensualidad', amount: 8800, currency: 'USD', account: 'ARQ', tipo: 'servicios', date: DAY_ONE, updatedAt: TS },
        { id: 2, desc: 'Toptal — proyecto corto', amount: 1450, currency: 'USD', account: 'Toptal', tipo: 'servicios', date: DAY_ONE, updatedAt: TS },
        { id: 3, desc: 'Reembolso', amount: 320_000, currency: 'COP', account: 'Bancolombia', tipo: 'otro', date: DAY_ONE, updatedAt: TS },
      ],
      egresos: [
        { id: 11, desc: 'Arriendo', category: 'hogar', amount: 2_600_000, currency: 'COP', date: DAY_ONE, recurring: true, confirmed: true, account: 'Bancolombia', updatedAt: TS },
        { id: 12, desc: 'Mercado', category: 'alimentacion', amount: 890_000, currency: 'COP', date: DAY_ONE, confirmed: true, account: 'Nequi', updatedAt: TS },
        { id: 13, desc: 'Salud prepagada', category: 'salud', amount: 512_000, currency: 'COP', date: DAY_ONE, recurring: true, confirmed: true, account: 'Bancolombia', updatedAt: TS },
        { id: 14, desc: 'Internet y celular', category: 'conectividad', amount: 210_000, currency: 'COP', date: DAY_ONE, recurring: true, confirmed: true, account: 'NU', updatedAt: TS },
        { id: 15, desc: 'Transporte', category: 'transporte', amount: 340_000, currency: 'COP', date: DAY_ONE, confirmed: true, account: 'Efectivo', updatedAt: TS },
        { id: 16, desc: 'Suscripciones', category: 'tecnologia', amount: 128_000, currency: 'COP', date: DAY_ONE, recurring: true, confirmed: true, account: 'NU', updatedAt: TS },
      ],
      transfers: [],
      updatedAt: TS,
    },
  } as unknown as FinanceDB
}
