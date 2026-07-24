import * as Sentry from '@sentry/react'
import type { ErrorEvent } from '@sentry/react'

// ─── Sentry — error tracking (W4) ─────────────────────────────────────────────
// Prod-only, gated on VITE_SENTRY_DSN: with no DSN this is a no-op, so dev and
// offline are completely unaffected (same posture as auto-sync being prod-only).
//
// This is a personal-finance app, so the config is privacy-first by construction:
//  · sendDefaultPii off, no user identity attached (we tie errors to the BUILD,
//    not the person — see `release`).
//  · No Session Replay (it records the screen → would capture money figures).
//  · No performance tracing (tracesSampleRate 0).
//  · Breadcrumbs are ALLOWLISTED, not filtered: console / DOM (UI text) / fetch /
//    xhr capture is off at the source, and beforeBreadcrumb lets only `navigation`
//    through. A button label or a Supabase response body never becomes a breadcrumb.
//  · beforeSend rebuilds the event from an ALLOWLIST (scrubEvent) — anything not
//    explicitly kept is dropped. Safer than blacklisting every shape a number can
//    take (request bodies, extra, contexts.state, user, server_name all go).
//
// NOTE: the DSN lives committed in .env.production. Unlike a server secret, a
// Sentry DSN is public by design — it only authorizes *writing* events, grants no
// read access. (Same "committed but public" bucket as the Supabase anon key, but
// for a different reason: the anon key is safe because RLS backs it; the DSN is
// safe because it is write-only. Do NOT generalize this precedent to a real secret
// — e.g. a Sentry auth token for source-map upload, which must stay in CI secrets.)

declare const __SENTRY_RELEASE__: string

// Allowlist: build a minimal event with only fields that cannot carry financial
// data, and drop everything else. Adding a field here is a deliberate decision.
function scrubEvent(event: ErrorEvent): ErrorEvent {
  const clean: ErrorEvent = {
    type:        event.type, // always undefined for error events; required by the type
    event_id:    event.event_id,
    timestamp:   event.timestamp,
    platform:    event.platform,
    level:       event.level,
    release:     event.release,
    environment: event.environment,
    // The error itself: type, message, and stack frames. JS stack frames expose
    // file/function/line — never local variable values — so they are safe.
    exception:   event.exception,
    // Already allowlisted to `navigation` by beforeBreadcrumb.
    breadcrumbs: event.breadcrumbs,
    sdk:         event.sdk,
  }
  // Curated, non-sensitive contexts only — browser/OS/runtime help triage and
  // carry no user data. contexts.state / .app / request / user are intentionally
  // NOT copied.
  if (event.contexts) {
    clean.contexts = {
      browser: event.contexts.browser,
      os:      event.contexts.os,
      runtime: event.contexts.runtime,
    }
  }
  return clean
}

export function initSentry(): void {
  const dsn = import.meta.env.VITE_SENTRY_DSN as string | undefined
  if (!dsn) return // no DSN → no-op (dev / offline / any build without it)

  Sentry.init({
    dsn,
    release:        __SENTRY_RELEASE__,
    environment:    import.meta.env.MODE,
    sendDefaultPii: false,
    tracesSampleRate: 0, // no performance tracing
    integrations: [
      // Merged over defaults (deduped by name → this config wins). Turn off every
      // breadcrumb source that can carry money: console output, DOM/UI text, and
      // network (fetch/xhr) URLs + bodies. Keep only navigation history.
      Sentry.breadcrumbsIntegration({
        console: false,
        dom:     false,
        fetch:   false,
        xhr:     false,
        history: true,
        sentry:  true,
      }),
    ],
    // Second gate on breadcrumbs: allowlist navigation only.
    beforeBreadcrumb: (breadcrumb) =>
      breadcrumb.category === 'navigation' ? breadcrumb : null,
    // Allowlist the outgoing event.
    beforeSend: scrubEvent,
  })
}
