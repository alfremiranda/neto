# Neto — North Star & Execution Plan

> **Purpose.** This is the target architecture and phased roadmap for turning Neto from a
> single-user personal PWA into a scalable, multi-user native product — *without a rewrite*.
> It is the source of truth for sequencing. For product/business context see [PRODUCT.md](./PRODUCT.md);
> for current stack and code conventions see [CLAUDE.md](./CLAUDE.md).
>
> Created 2026-07-22.

---

## 0. Guiding principles

1. **Evolve, don't rewrite.** The existing React 19 + Vite + TS codebase and the per-entry merge
   engine are assets to protect, not replace. Every phase ships a working product.
2. **Local-first survives.** The device stays the source of truth. The cloud is backup + sync,
   never a runtime dependency. The app must always work offline.
3. **Retire risk first.** Security and data-integrity gaps that only appeared *because* the product
   went multi-user are fixed before any growth feature. Boring work goes first.
4. **The domain does not change.** The money flow (`bruto → IBC → deductions → neto libre`), the
   configurable deduction engine, the month-as-unit model, and the canonical terminology
   (`Gastos` in UI / `egresos` in code) are stable. This plan is about the *platform*, not the domain.

---

## 1. Target architecture

Single React codebase feeds iOS, Android, and web via **Capacitor**. The local-first core remains
the offline source of truth. The backend is hardened with per-user RLS. Integrations that require
secrets (Belvo, server push, billing) live behind Edge Functions.

```
SURFACES            iOS (App Store) · Android (Play Store) · Web/PWA
  │                 one codebase: React 19 + TS + Vite
  ▼
NATIVE LAYER        Capacitor plugins: Push (APNs/FCM) · Biometric lock ·
  │                 Secure token storage · OTA updates
  ▼
LOCAL-FIRST CORE    Zustand state ── IndexedDB (offline source of truth) ──
  │                 per-entry merge + tombstones (CRDT-ish; now covers accounts/settings)
  ▼
BACKEND (Supabase)  Auth (OAuth GitHub/Google/Apple + email) · Postgres with RLS by auth.uid()
  │                 on ALL tables · Realtime (live sync) · Edge Functions (secret-holding logic)
  ▼
INTEGRATIONS        Belvo (open finance CO → seeds "sin confirmar" expenses) ·
  (via Edge Fns)    Push scheduler (cron → APNs/FCM) · Shared TRM cache (Banco de la República) ·
  │                 RevenueCat / Stripe (cross-platform subscriptions)
  ▼
OBSERVABILITY       PostHog (product analytics) · Sentry (errors) ·
  & COMPLIANCE      Ley 1581 / Habeas Data (privacy, consent)

GROWTH              App Store / Play Store listings · Referrals / sharing ·
                    Profile-driven onboarding (already exists)
```

---

## 2. Phased execution plan

Each phase is independently shippable and leaves the product functional. Do not jump ahead.

### Phase 1 — Multi-user foundations (retire risk) 🔴 *highest priority, least glamorous*

**Goal:** make Neto safe and legal for a second user with two devices. This is active risk today.

- [x] **RLS audit + enforcement.** ✅ 2026-07-22. `months` (the only table) hardened on dev **and**
      prod: RLS enabled + forced, single `for all to authenticated using/with check (auth.uid() = user_id)`
      policy, `user_id default auth.uid()`, `anon` grants revoked. Tenant isolation proven
      **empirically** (not just by inspection) on both dev and prod — `supabase/rls_isolation_test.sql`
      returns 5/5 (B cannot see, read, update, or spoof-insert A's rows). Canonical `supabase/schema.sql`
      corrected from the old open PoC. *Deferred debt (minor, non-security): `months.data` is nullable on
      prod vs `not null default '{}'` in schema.sql — backfill needs care under forced RLS.*
- [ ] **Fix `_settings` sync.** Today `_settings` (which includes accounts) is whole-object LWW —
      concurrent account edits across devices can silently drop one side. Upgrade to per-entry /
      per-field merge, consistent with the existing `mergeMonth`/`mergeList` model. Scope also covers
      **deductions**, which today live in a separate `neto-settings` store that **never syncs at all**
      (a worse bug than the LWW one) — they get consolidated into the synced `_settings`.
      Three merge groups: accounts (per-entry), deductions (per-entry), scalars (per-field LWW, except
      `onboardingDone` which is monotonic OR — must never regress to false).
      *Note: the onboarding profile (empleado/independiente/ambos) is NOT persisted — it is a transient
      `useState` in OnboardingView that only calls `setDeductionsEnabled` once. Deductions are the source
      of truth; do NOT persist the profile as a synced field, or you reintroduce a profile↔deductions
      invariant the merge cannot preserve.*
      <br>**W2 test-coverage caveats (known debt):**
      (a) The pre-merge validation was a **manual two-instance smoke on dev** (see PR #3). It did NOT
      cover the **automatic sync triggers** (focus / reconnect / mutation) — dev has no auto-push by
      design, so only `mergeSettings` + the write-side were exercised; that trigger path is unchanged by W2.
      (b) `saveAccountsConfig` / `saveDeductionsConfig` (the store write-side) have **no unit tests** —
      their only coverage is that functional smoke. Only the pure merge engine (`src/store/merge.ts`) is
      unit-tested (33 tests).
      **Known edge (onboarding + W2):** an existing user opening the app on a **new device** can, if
      onboarding starts before the initial pull brings `onboardingDone`, create accounts with fresh
      `acc_onboarding_<ts>_*` ids that then union with the cloud's → duplicate accounts. Not blocking
      (monotonic OR covers the flag, prod gates the UI on `cloudReady` after the pull, `neto-settings`
      stays as backup) but it is the **first thing to check** if a tester reports something odd post-deploy.
      <br>**Post-deploy status (2026-07-23):** shipped to prod (PR #3, squash `9a4fadb7`) and verified on
      the user's two real devices — current-month figures unchanged, no duplicate accounts, deductions
      correct. A prod `months` JSON snapshot (10 rows) was taken **pre-merge** as the data-rollback net;
      the real risk window is each old-data device's **first consolidation** (which happens when that
      device opens post-deploy, not at deploy time), so keep the snapshot until the other testers have
      opened the app and synced at least once — roughly deletable after **2026-07-30**. Code rollback =
      revert the squash commit (reverts code only, not data — hence the snapshot).
- [ ] **Ley 1581 groundwork.** Privacy policy, explicit consent on onboarding, data-processing
      basics. *Get real legal advice — this doc is not it.*
- [ ] **Sentry.** Error tracking wired for web (and later native).

**Definition of done:** a second test account cannot see or touch the first account's rows
(verified manually); concurrent settings edits on two devices converge with no data loss;
privacy policy is live and consented; Sentry captures client errors.

### Phase 2 — Native shell + push

**Goal:** ship to the App Store / Play Store and unlock OS-level notifications.

- [ ] **Capacitor** wrapping iOS + Android; the same build still deploys as web/PWA.
- [ ] **Local notifications (device-side).** Use Capacitor LocalNotifications to fire reminders for
      overdue / unconfirmed / scheduled expenses **from local data** — works offline, preserves
      local-first, needs no server. (Server-triggered push is Phase 3.)
- [ ] **Biometric lock** (Face ID / fingerprint) to gate app entry.
- [ ] **Secure token storage** via native secure storage.
- [ ] **Apple Sign-In** (required by App Store review when offering Google/GitHub OAuth).
- [ ] **OTA updates** (e.g. Capgo / live updates) to ship JS-only changes without full store review.

**Definition of done:** apps build and run on a physical device; local reminders fire offline;
biometric lock works; an OTA JS update ships without store review; Apple Sign-In passes review.

### Phase 3 — Open finance + monetization

**Goal:** auto-import expenses and support a real business model.

- [ ] **Edge Functions** infrastructure (secret-holding server logic).
- [ ] **Belvo integration.** Connect flow (client → Edge Function holds the secret), webhook
      receives transactions, seeds them as `ImportedExpense` in the user's data with state
      **"sin confirmar"** (matches the existing recurring-expense pattern). Covers the COP side:
      Bancolombia, Nequi, credit cards. USD side (ARQ/Toptal) stays manual.
- [ ] **Server push scheduler.** Cron Edge Function → APNs/FCM for cross-device / app-closed reminders.
- [ ] **Shared TRM service.** Cron caches Banco de la República TRM once, served to all clients
      instead of each client hitting the API.
- [ ] **Billing.** RevenueCat for iOS/Android IAP + Stripe for web; subscription gating.

**Definition of done:** a connected bank seeds unconfirmed expenses the user can categorize;
subscriptions work on iOS, Android, and web; TRM is served from cache.

### Phase 4 — Scale

**Goal:** support many users, real-time multi-device, and analytics. Only the entries-as-rows
migration here carries real weight; do it only when scale/analytics demand it.

- [ ] **Storage model migration.** Move from "one JSON blob per month" to normalized
      entries-as-rows (users, months, incomes, egresos, transfers, accounts, deductions). This
      *aligns with* the per-entry merge model and unlocks server-side queries. Versioned migration
      (like the existing v1–v5), run on both local and cloud data.
- [ ] **Supabase Realtime** for live multi-device sync, augmenting focus/reconnect polling.
- [ ] **PostHog** product analytics.
- [ ] **Referrals / sharing** for propagation.

**Definition of done:** entries are queryable server-side; realtime updates propagate across
devices; analytics dashboards exist; referral flow works.

---

## 3. Non-negotiables

- **RLS by `auth.uid()` on every table.** No exceptions. This gates going multi-user at all.
- **`_settings` per-entry merge** before onboarding real users on multiple devices.
- **Local-first is never broken.** The app must function fully offline in every phase.
- **The per-entry merge + tombstones engine must not regress.** Guard it with the merge tests in
  `src/store/merge.test.ts` (union / newer-wins / delete-propagates / resurrect / converge / deterministic),
  run via `npm test`. *These were created 2026-07-22 (Phase 1 / W2, commit 0): the engine had been
  referenced as "verified with standalone tests" but no automated net existed in the repo — every earlier
  change to the sync engine shipped without one. Extend this suite, never weaken it.*
- **Ley 1581 compliance** before handling third-party financial data at scale (Phase 3).

---

## 4. Key decisions & trade-offs

| Decision | Choice | Rationale / trade-off |
|---|---|---|
| Native strategy | **Capacitor** (web-in-native shell) | Reuses the entire React/Vite codebase; native plugins cover the gaps. React Native or Swift/Kotlin would throw away working UI for no gain here. |
| Reminder mechanism (P2) | **Device-side local notifications** | Works offline, preserves local-first. Server push (P3) only for cross-device / app-closed. |
| Storage model | **Blob-per-month now → entries-as-rows in P4** | The rows model aligns better with per-entry merge and unlocks server features, but it is the only heavy migration — defer until scale needs it. |
| Integrations tooling | **Belvo · RevenueCat · Stripe · PostHog · Sentry** | Lowest-friction standards for this stack. All have alternatives (Finerio, Stripe-only, Umami, etc.) — not a lock-in. |
| Monetization on mobile | Platform IAP via RevenueCat | App Store / Play Store take up to 30% (15% small-business tier). Web billing via Stripe avoids part of it, at a conversion cost. The business model must absorb the platform cut. |

---

## 5. Out of scope / explicitly deferred

- Rewriting the domain/business logic — it does not change.
- Entries-as-rows migration before Phase 4.
- USD-side auto-import (ARQ/Toptal) — not covered by Belvo; stays manual.
- Anything that would make the app require a network connection to function.

---

## 6. Constraints inherited from the codebase

- **Tailwind v3 only.** v4 syntax (`@utility`, `@theme inline`, `tw-animate-css`) is silently
  ignored. Use `tailwindcss-animate` and the `cv()` (`color-mix`) helper. See CLAUDE.md.
- **Dev/prod are separate Supabase projects.** Auto-sync runs in **prod only**. Never run
  destructive operations against prod. Test RLS and migrations on dev/local first.
- **Language:** Spanish for conversation; English for all code, commits, comments, and docs.
