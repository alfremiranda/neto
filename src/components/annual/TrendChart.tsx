import { Bar } from 'react-chartjs-2'
import {
  Chart as ChartJS,
  CategoryScale,
  LinearScale,
  BarElement,
  Title,
  Tooltip,
  Legend,
} from 'chart.js'
import { useFinanceStore } from '@/store/financeStore'
import { calcTotales, calcIBC, calcSS, calcGastos, calcDistribucion } from '@/lib/calc'
import { MONTHS, DEFAULTS } from '@/data/defaults'

ChartJS.register(CategoryScale, LinearScale, BarElement, Title, Tooltip, Legend)

function chartColors() {
  const dark = window.matchMedia('(prefers-color-scheme: dark)').matches
  return {
    grid:        dark ? 'rgba(255,255,255,0.07)' : 'rgba(0,0,0,0.06)',
    tick:        dark ? '#636366' : '#999',
    tooltipBg:   dark ? '#2c2c2e' : '#fff',
    tooltipText: dark ? '#f2f2f7' : '#1a1a1a',
    border:      dark ? 'rgba(255,255,255,0.12)' : 'rgba(0,0,0,0.1)',
  }
}

export function TrendChart() {
  const { db, curKey, getSMMLV } = useFinanceStore()
  const M = 1_000_000

  const allKeys = [...new Set([
    ...Object.keys(db).filter(k => k !== '_settings').sort(),
    curKey,
  ])]
  const keys = allKeys.slice(-8)

  const labels: string[] = []
  const dSS: number[] = [], dGast: number[] = [], dRet: number[] = [], dPrim: number[] = [], dNeto: number[] = []

  keys.forEach(k => {
    const [y, m] = k.split('-')
    labels.push(MONTHS[parseInt(m)].slice(0, 3) + ' \'' + y.slice(2))
    const d = (db[k] as { trm?: number; incomes?: unknown[]; egresos?: unknown[] } | undefined) ?? { trm: DEFAULTS.trm, incomes: [], egresos: [] }
    const trm = (d.trm as number) || DEFAULTS.trm
    const incomes = (d.incomes || []) as Parameters<typeof calcTotales>[0]
    const egresos = (d.egresos || []) as Parameters<typeof calcGastos>[0]
    const { bruto } = calcTotales(incomes, trm)
    const smmlv = getSMMLV(parseInt(y))
    const ibc = calcIBC(incomes, trm, smmlv)
    const ss = calcSS(ibc)
    const gastTotal = calcGastos(egresos, trm)
    const { ret, prim, netoLibre } = calcDistribucion(bruto, ss.total, gastTotal)

    dSS.push(+(ss.total / M).toFixed(3))
    dGast.push(+(gastTotal / M).toFixed(3))
    dRet.push(+(ret / M).toFixed(3))
    dPrim.push(+(prim / M).toFixed(3))
    dNeto.push(+(Math.max(netoLibre, 0) / M).toFixed(3))
  })

  const c = chartColors()

  const data = {
    labels,
    datasets: [
      { label: 'SS',          data: dSS,   backgroundColor: '#378ADD', stack: 'a' },
      { label: 'Manutención', data: dGast,  backgroundColor: '#1D9E75', stack: 'a' },
      { label: 'Retención',   data: dRet,   backgroundColor: '#EF9F27', stack: 'a' },
      { label: 'Primas',      data: dPrim,  backgroundColor: '#D4537E', stack: 'a' },
      { label: 'Neto libre',  data: dNeto,  backgroundColor: '#639922', stack: 'a' },
    ],
  }

  const options = {
    responsive: true,
    maintainAspectRatio: false,
    plugins: {
      legend: {
        position: 'bottom' as const,
        labels: { color: c.tick, boxWidth: 10, padding: 14, font: { size: 11 } },
      },
      tooltip: {
        backgroundColor: c.tooltipBg,
        titleColor: c.tooltipText,
        bodyColor: c.tooltipText,
        borderColor: c.border,
        borderWidth: 0.5,
        callbacks: {
          label: (ctx: { dataset: { label?: string }; parsed: { y: number | null } }) =>
            ` ${ctx.dataset.label}: $${(ctx.parsed.y ?? 0).toLocaleString('es-CO', { minimumFractionDigits: 2 })}M`,
        },
      },
    },
    scales: {
      x: {
        stacked: true,
        grid: { display: false },
        ticks: { color: c.tick, font: { size: 11 } },
      },
      y: {
        stacked: true,
        grid: { color: c.grid },
        ticks: {
          color: c.tick,
          font: { size: 11 },
          callback: (v: number | string) => '$' + v + 'M',
        },
      },
    },
  }

  return (
    <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
      <div className="text-[12px] font-medium text-[var(--n-txt2)] mb-3 flex items-center gap-[5px]">
        <span>📈</span>
        <span>Tendencia (últimos 8 meses)</span>
      </div>
      <div style={{ height: 260 }}>
        <Bar data={data} options={options} />
      </div>
    </div>
  )
}
