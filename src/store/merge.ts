import type { MonthData, Settings, Account, DeductionConfig } from '@/types'

// ── per-entry merge (cross-device) ──────────────────────────────────────────
// Pure, dependency-free CRDT-ish merge helpers, extracted from financeStore so
// they can be unit-tested without pulling in zustand/supabase. Behaviour is
// identical to the previous inline versions.
//
// Union month lists by entry id so no device's entries are ever dropped;
// newest edit wins per entry (entry.updatedAt, falling back to the month-level
// timestamp for entries created before per-entry stamping); a tombstone whose
// time ≥ the entry's last edit removes it (so deletes propagate).
//
// `id` is number (month entries) or string (accounts/deductions). The sort must
// stay deterministic across devices, so string ids compare by CODE POINT, never
// via localeCompare (whose order depends on the runtime locale → would make two
// devices sort differently and ping-pong). Numeric ids keep numeric order so
// month behaviour is unchanged (9 before 10, not "10" before "9").
export type Stamped = { id: number | string; updatedAt?: number }

function byId(a: Stamped, b: Stamped): number {
  if (typeof a.id === 'number' && typeof b.id === 'number') return a.id - b.id
  const as = String(a.id), bs = String(b.id)
  return as < bs ? -1 : as > bs ? 1 : 0   // code-point order — locale-independent
}

// Canonical serialization: recursively key-sorted, with `undefined` treated as
// absent so a field left out on one device and set to undefined on the other
// serialize identically. Plain JSON.stringify is key-INSERTION-order dependent
// (the same logical entry built in the UI vs received from the cloud can differ),
// which would make a content tie-break pick different winners on each device —
// reintroducing the ping-pong. This is stable across devices and runtimes.
function canonical(v: unknown): string {
  if (v === undefined || v === null) return 'null'
  if (Array.isArray(v)) return '[' + v.map(canonical).join(',') + ']'
  if (typeof v === 'object') {
    const keys = Object.keys(v as Record<string, unknown>)
      .filter(k => (v as Record<string, unknown>)[k] !== undefined)
      .sort()
    return '{' + keys.map(k => JSON.stringify(k) + ':' + canonical((v as Record<string, unknown>)[k])).join(',') + '}'
  }
  return JSON.stringify(v)
}

// Deterministic, symmetric tie-break for entries with an equal updatedAt: the
// canonically-greater one wins, the same on both devices. Opt-in (see mergeList's
// `tieBreak` param) — off for months, where Date.now() ids make same-id ties all
// but impossible and touching that path would be risk without benefit.
export function canonicalTieBreak(a: unknown, b: unknown): number {
  const as = canonical(a), bs = canonical(b)
  return as < bs ? -1 : as > bs ? 1 : 0
}

export function mergeList<T extends Stamped>(
  type: string,
  local: T[] = [],
  cloud: T[] = [],
  del: Record<string, number>,
  localMs: number,
  cloudMs: number,
  tieBreak?: (a: T, b: T) => number,   // opt-in: resolve equal-updatedAt collisions deterministically
): T[] {
  const map = new Map<number | string, { e: T; ts: number }>()
  for (const e of local) map.set(e.id, { e, ts: e.updatedAt ?? localMs })
  for (const e of cloud) {
    const ts = e.updatedAt ?? cloudMs
    const ex = map.get(e.id)
    // Replace when strictly newer, or — with a tieBreak — when equal-ts and the
    // incoming entry is the canonical winner. Without tieBreak, equal-ts keeps
    // local (legacy behaviour; asymmetric, so months rely on unique ids instead).
    if (!ex || ts > ex.ts || (ts === ex.ts && tieBreak !== undefined && tieBreak(e, ex.e) > 0)) {
      map.set(e.id, { e, ts })
    }
  }
  const out: T[] = []
  for (const [id, { e, ts }] of map) {
    if ((del[`${type}:${id}`] ?? 0) >= ts) continue
    out.push(e)
  }
  return out.sort(byId)   // deterministic → both devices converge
}

export function mergeMonth(local: MonthData, cloud: MonthData, localMs: number, cloudMs: number): MonthData {
  const del: Record<string, number> = {}
  for (const k of new Set([...Object.keys(local.deleted ?? {}), ...Object.keys(cloud.deleted ?? {})])) {
    del[k] = Math.max(local.deleted?.[k] ?? 0, cloud.deleted?.[k] ?? 0)
  }
  const scalar = cloudMs > localMs ? cloud : local   // trm, balances, egresosSeeded
  const merged: MonthData = {
    ...scalar,
    incomes:   mergeList('income',   local.incomes,   cloud.incomes,   del, localMs, cloudMs),
    egresos:   mergeList('egreso',   local.egresos,   cloud.egresos,   del, localMs, cloudMs),
    transfers: mergeList('transfer', local.transfers, cloud.transfers, del, localMs, cloudMs),
    deleted:   Object.keys(del).length ? del : undefined,
  }
  if (local.voluntarias || cloud.voluntarias) {
    merged.voluntarias = mergeList('vol', local.voluntarias, cloud.voluntarias, del, localMs, cloudMs)
  }
  return merged
}

// True if local holds anything the cloud copy lacks (new/newer entry, tombstone,
// or newer scalars) — if so we push the merged blob so the cloud converges too.
export function localHasExtra(local: MonthData, cloud: MonthData, localMs: number, cloudMs: number): boolean {
  if (localMs > cloudMs) return true
  for (const f of ['incomes', 'egresos', 'transfers', 'voluntarias'] as const) {
    const cloudMap = new Map(((cloud[f] as Stamped[] | undefined) ?? []).map(e => [e.id, e]))
    for (const e of ((local[f] as Stamped[] | undefined) ?? [])) {
      const ce = cloudMap.get(e.id)
      if (!ce) return true
      if ((e.updatedAt ?? localMs) > (ce.updatedAt ?? cloudMs)) return true
    }
  }
  const cd = cloud.deleted ?? {}
  for (const [k, ts] of Object.entries(local.deleted ?? {})) {
    if (ts > (cd[k] ?? 0)) return true
  }
  return false
}

// ── settings merge (accounts + deductions per-entry, scalars per-field) ───────
// `_settings` was whole-object LWW, which silently drops one side's edit when two
// devices touch settings concurrently. This merges it in three groups, mirroring
// the month model:
//   • accounts, deductions → per-entry union by id (mergeList) with a deterministic
//     tie-break, since their ids are STABLE across devices (unlike Date.now() month
//     ids) so same-id collisions are realistic.
//   • scalars (displayName, currencies) → per-FIELD LWW via `fieldUpdatedAt`.
//   • onboardingDone / dbMigrationVersion → monotonic (OR / max), never regress.
// System (locked) ids are passed in (systemIds) so this module stays pure and does
// not import the account/deduction defaults; tombstones targeting them are ignored,
// so a device with stale state can never delete an indestructible entity.
const SCALAR_FIELDS = ['displayName', 'primaryCurrency', 'secondaryCurrency'] as const

export interface SystemIds {
  accounts:   Set<string>
  deductions: Set<string>
}

// Pick the winning value for one scalar field, symmetrically. `null` counts as a
// real value (distinct from absent) so clearing e.g. secondaryCurrency propagates.
// A field STAMP is evidence of a real edit; an unstamped side that merely rides a
// newer blob ms must not overwrite a stamped edit — so a stamped side beats an
// unstamped one when the values differ. Equal clocks fall to the canonical
// tie-break (deterministic across devices).
function pickScalar(
  local: Settings, cloud: Settings, f: string, localMs: number, cloudMs: number,
): { present: boolean; value: unknown } {
  const lp = f in local, cp = f in cloud
  if (!lp && !cp) return { present: false, value: undefined }
  const lv = (local as Record<string, unknown>)[f]
  const cv = (cloud as Record<string, unknown>)[f]
  if (lp && !cp) return { present: true, value: lv }
  if (!lp && cp) return { present: true, value: cv }
  if (canonicalTieBreak(lv, cv) === 0) return { present: true, value: lv }   // equal → no conflict

  const ls = local.fieldUpdatedAt?.[f], cs = cloud.fieldUpdatedAt?.[f]
  const lsDef = ls !== undefined, csDef = cs !== undefined
  // Rollout heuristic (transition window): prefer the stamped side over the
  // unstamped one. In theory a stale stamped value could beat a fresh edit from
  // an OLD (pre-W2) client that doesn't stamp; with a tiny user base + fast PWA
  // updates that risk is far smaller than the systematic loss it prevents.
  if (lsDef && !csDef) return { present: true, value: lv }
  if (csDef && !lsDef) return { present: true, value: cv }

  const lc = lsDef ? ls! : localMs
  const cc = csDef ? cs! : cloudMs
  if (lc > cc) return { present: true, value: lv }
  if (cc > lc) return { present: true, value: cv }
  return { present: true, value: canonicalTieBreak(lv, cv) > 0 ? lv : cv }   // symmetric tie-break
}

export function mergeSettings(
  local: Settings,
  cloud: Settings,
  localMs: number,
  cloudMs: number,
  systemIds: SystemIds,
): Settings {
  // Tombstones: union by max, minus any that target a system (locked) entity.
  const del: Record<string, number> = {}
  for (const k of new Set([...Object.keys(local.deleted ?? {}), ...Object.keys(cloud.deleted ?? {})])) {
    const sep = k.indexOf(':')
    const kind = k.slice(0, sep), id = k.slice(sep + 1)
    if (kind === 'account'   && systemIds.accounts.has(id))   continue
    if (kind === 'deduction' && systemIds.deductions.has(id)) continue
    del[k] = Math.max(local.deleted?.[k] ?? 0, cloud.deleted?.[k] ?? 0)
  }

  const result: Settings = {
    accounts:   mergeList<Account>('account', local.accounts, cloud.accounts, del, localMs, cloudMs, canonicalTieBreak),
    deductions: mergeList<DeductionConfig>('deduction', local.deductions, cloud.deductions, del, localMs, cloudMs, canonicalTieBreak),
  }
  if (Object.keys(del).length) result.deleted = del

  // Monotonic fields — never regress.
  if ((local.onboardingDone ?? false) || (cloud.onboardingDone ?? false)) result.onboardingDone = true
  const dbv = Math.max(local.dbMigrationVersion ?? 0, cloud.dbMigrationVersion ?? 0)
  if (dbv) result.dbMigrationVersion = dbv

  // Privacy consent — monotonic by VERSION (a stale device must never roll back a
  // higher-version acceptance). On equal version, keep the earlier acceptedAt so
  // both devices converge on the same object deterministically. Like the other
  // monotonic fields, this must be handled explicitly or it would be dropped —
  // mergeSettings builds `result` from scratch.
  const lpc = local.privacyConsent, cpc = cloud.privacyConsent
  if (lpc && cpc) {
    result.privacyConsent = lpc.version !== cpc.version
      ? (lpc.version > cpc.version ? lpc : cpc)
      : { version: lpc.version, acceptedAt: Math.min(lpc.acceptedAt, cpc.acceptedAt) }
  } else if (lpc || cpc) {
    result.privacyConsent = (lpc ?? cpc)!
  }

  // Scalars: per-field LWW (stamp-aware). Carry the newest known stamp per field.
  for (const f of SCALAR_FIELDS) {
    const picked = pickScalar(local, cloud, f, localMs, cloudMs)
    if (picked.present) (result as Record<string, unknown>)[f] = picked.value
  }
  const fieldUpdatedAt: Record<string, number> = {}
  for (const f of new Set([...Object.keys(local.fieldUpdatedAt ?? {}), ...Object.keys(cloud.fieldUpdatedAt ?? {})])) {
    fieldUpdatedAt[f] = Math.max(local.fieldUpdatedAt?.[f] ?? 0, cloud.fieldUpdatedAt?.[f] ?? 0)
  }
  if (Object.keys(fieldUpdatedAt).length) result.fieldUpdatedAt = fieldUpdatedAt

  return result
}
