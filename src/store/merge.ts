import type { MonthData } from '@/types'

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
