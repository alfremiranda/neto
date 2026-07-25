import type { Settings } from '@/types'

// Privacy policy version (Ley 1581 consent). Bump this whenever the policy text
// changes materially: the consent screen re-appears for anyone whose accepted
// version is below the current one (see needsPrivacyConsent). The accepted value
// is merged MONOTONICALLY by version in mergeSettings — a stale device can't roll
// it back.
export const PRIVACY_POLICY_VERSION = 1

// Static policy page (public/privacidad.html), under the app's base path.
export const PRIVACY_POLICY_URL = `${import.meta.env.BASE_URL}privacidad.html`

// True when the user must (re-)consent: no record, or an older version accepted.
export function needsPrivacyConsent(settings: Settings | undefined): boolean {
  return (settings?.privacyConsent?.version ?? 0) < PRIVACY_POLICY_VERSION
}
