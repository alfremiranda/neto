/**
 * Date comparators for the month lists.
 *
 * Entry dates are `YYYY-MM-DD`, so everything registered on the same day compares
 * equal and `Array.sort` falls back to insertion order — which is oldest-first,
 * the opposite of what "Fecha: más reciente" promises. Every entry's `id` is the
 * `Date.now()` of its creation (see financeStore.addEgreso), so it breaks the tie
 * with the real registration time.
 *
 * The tiebreak uses `id`, not `updatedAt`: editing a two-week-old expense should
 * not launch it to the top of a list sorted by date.
 */
type Dated = { date?: string; id: number }

/** Newest first — same-day entries ordered by when they were registered. */
export function byDateDesc(a: Dated, b: Dated): number {
  return (b.date || '').localeCompare(a.date || '') || b.id - a.id
}

/** Oldest first — the exact mirror, so the two orders are reverses of each other. */
export function byDateAsc(a: Dated, b: Dated): number {
  return (a.date || '').localeCompare(b.date || '') || a.id - b.id
}
