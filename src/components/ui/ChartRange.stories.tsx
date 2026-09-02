import { useState } from 'react'
import type { Meta, StoryObj } from '@storybook/react-vite'
import { ChartRange } from './ChartRange'
import { availableRanges } from '@/lib/chartRange'
import type { Account, FinanceDB, Egreso } from '@/types'

const meta = { title: 'Charts/ChartRange', parameters: { layout: 'padded' } } satisfies Meta
export default meta
type Story = StoryObj<typeof meta>

const TODAY = '2026-09-01'

const account: Account = {
  id: 'Bancolombia', label: 'Bancolombia', currency: 'COP',
  number: '', rate: 0, startingBalance: 0,
}

const dbWith = (dates: string[]): FinanceDB => {
  const db: FinanceDB = {}
  dates.forEach((d, i) => {
    const egreso: Egreso = {
      id: i + 1, desc: 'Movimiento', category: 'otro',
      amount: 1000, currency: 'COP', date: d, account: 'Bancolombia',
    }
    const key = d.slice(0, 7)
    const m = db[key] ?? { trm: 4000, incomes: [], egresos: [], transfers: [] }
    db[key] = { ...m, egresos: [...m.egresos, egreso] }
  })
  return db
}

function Strip({ label, dates }: { label: string; dates: string[] }) {
  const ranges = availableRanges(account, dbWith(dates), TODAY)
  const [v, setV] = useState(ranges[ranges.length - 1]?.id)
  return (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
      <span className="ts-label-micro uppercase text-muted-foreground/70">{label}</span>
      {ranges.length < 2
        ? <span className="ts-body-small text-muted-foreground">— no se dibuja —</span>
        : <ChartRange ranges={ranges} value={v!} onChange={setV} />}
    </div>
  )
}

/**
 * The strip's length is DATA, not design. A range appears only once the account has a
 * movement older than that range's start — otherwise the pill would draw the same line
 * as the shorter one beside it, and a control that cannot change what you see is not a
 * choice.
 *
 * The last pill of each strip is the one that shows EVERYTHING; the ones that would sit
 * behind it are dropped, because they would each redraw the same line.
 */
export const LengthIsData: Story = {
  render: () => (
    <div style={{ display: 'flex', flexDirection: 'column', gap: 20, maxWidth: 420 }}>
      <Strip label="Un movimiento, hoy — ningún rango es honesto" dates={[TODAY]} />
      <Strip label="Tres meses de historia" dates={['2026-06-15', TODAY]} />
      <Strip label="Dos años" dates={['2024-03-10', TODAY]} />
      <Strip label="Más de cinco años — los siete" dates={['2020-01-10', TODAY]} />
    </div>
  ),
}

/**
 * Below a month a movement has to be placeable on a DAY. `date` is optional on an income,
 * so an account carrying an undated one has no daily series at all and must not be
 * offered 1D or 1S — the pills would draw a fiction.
 */
export const NoDailySeries: Story = {
  render: () => {
    const db = dbWith(['2024-03-10', TODAY])
    db['2026-08'] = {
      trm: 4000, egresos: [], transfers: [],
      incomes: [{ id: 99, desc: 'Ingreso sin fecha', amount: 1000, currency: 'COP',
                  account: 'Bancolombia', tipo: 'servicios' }],
    }
    const ranges = availableRanges(account, db, TODAY)
    return (
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, maxWidth: 420 }}>
        <span className="ts-label-micro uppercase text-muted-foreground/70">
          Un ingreso sin fecha — 1D y 1S desaparecen
        </span>
        <ChartRange ranges={ranges} value={ranges[ranges.length - 1].id} onChange={() => {}} />
      </div>
    )
  },
}
