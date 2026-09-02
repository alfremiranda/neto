import type { Account, FinanceDB, Income, MonthData } from '@/types'
import { buildLedger } from '@/lib/calc'

/**
 * The date-range strip under an account chart.
 *
 * Its length is DATA, not design. A range is offered only when the account has at least
 * one movement older than that range's start — otherwise the pill draws exactly the same
 * line as the shorter one beside it, and a control that cannot change what you see is not
 * a choice, it is a promise the data does not keep.
 *
 * That rule also handles 5A on its own: an account younger than five years has nothing
 * older than five years, so the pill simply never appears until it does.
 */
export type RangeId = '1D' | '1S' | '1M' | '3M' | 'YTD' | '1A' | '5A'

export interface ChartRange {
  id:    RangeId
  label: string
  /** Inclusive lower bound, 'YYYY-MM-DD'. */
  start: string
}

/** Labels follow Figma. */
const LABEL: Record<RangeId, string> = {
  '1D': '1D', '1S': '1S', '1M': '1M', '3M': '3M', YTD: 'YTD', '1A': '1A', '5A': '5A',
}

const ORDER: RangeId[] = ['1D', '1S', '1M', '3M', 'YTD', '1A', '5A']

/** Day-resolution ranges: below a month, a month-only movement cannot be placed. */
const DAY_LEVEL: RangeId[] = ['1D', '1S']

const iso = (d: Date): string => {
  const p = (n: number) => String(n).padStart(2, '0')
  return `${d.getFullYear()}-${p(d.getMonth() + 1)}-${p(d.getDate())}`
}

export function rangeStart(id: RangeId, today: string): string {
  const [y, m, d] = today.split('-').map(Number)
  switch (id) {
    case '1D':  return iso(new Date(y, m - 1, d - 1))
    case '1S':  return iso(new Date(y, m - 1, d - 7))
    case '1M':  return iso(new Date(y, m - 2, d))
    case '3M':  return iso(new Date(y, m - 4, d))
    case 'YTD': return `${y}-01-01`
    case '1A':  return iso(new Date(y - 1, m - 1, d))
    case '5A':  return iso(new Date(y - 5, m - 1, d))
  }
}

/**
 * Whether this account's movements can be placed on a day.
 *
 * `date` is OPTIONAL on an Income (see types), and buildLedger falls back to day 01 of
 * the month — so a month-only income is indistinguishable from one genuinely dated the
 * 1st once it reaches the ledger. The check has to read the source entries, and it has to
 * be pessimistic: one undated income makes the whole daily series a fiction.
 */
export function hasDayLevelDates(accountId: string, db: FinanceDB): boolean {
  for (const key of Object.keys(db)) {
    if (key === '_settings') continue
    const month = db[key] as MonthData
    if (!month) continue
    for (const inc of (month.incomes || []) as Income[]) {
      if (inc.account === accountId && !inc.date) return false
    }
  }
  return true
}

/**
 * The ranges this account can actually offer, in Figma's order.
 *
 * Design's wording is "a range is rendered only when the account has at least one
 * movement OLDER than that range's start", and taken literally it drops the range that
 * shows everything. An account whose oldest movement is exactly 3 months old has nothing
 * older than 3M's start, so 3M goes — leaving 1M as the widest pill, which shows only the
 * last month and hides the other two. The user cannot reach their own history.
 *
 * The intent is the sentence after it: "otherwise it draws exactly the same line as the
 * shorter range beside it". So the comparison belongs against the NEXT SHORTER range's
 * start, not the range's own. A range earns its pill when it reaches back past where the
 * one before it stopped — which keeps exactly one range that covers all the data, and
 * drops every longer one behind it as the duplicate it would be.
 *
 * Same worked example: oldest = 3 months ago, so 3M is offered (it reaches past 1M's
 * start) and YTD, 1A and 5A are not (they would each redraw 3M).
 */
export function availableRanges(
  account: Account,
  db:      FinanceDB,
  today:   string,
): ChartRange[] {
  const entries = buildLedger(account.id, account, db)
  if (entries.length === 0) return []

  const oldest  = entries[0].date          // buildLedger sorts oldest-first
  const dayable = hasDayLevelDates(account.id, db)

  const offerable = ORDER.filter(id => dayable || !DAY_LEVEL.includes(id))

  return offerable
    .filter((_id, i) => {
      // The shortest offerable range always exists — there is nothing behind it to
      // duplicate, and the account has movements or we would have returned already.
      if (i === 0) return true
      return oldest < rangeStart(offerable[i - 1], today)
    })
    .map(id => ({ id, label: LABEL[id], start: rangeStart(id, today) }))
}
