import { useState } from 'react'
import { useFinanceStore } from '@/store/financeStore'
import { useUIStore } from '@/store/uiStore'
import { parseCOP, copFormat } from '@/lib/format'
import { DEFAULTS } from '@/data/defaults'

export function ConfigCard() {
  const { getSMMLV, saveSMMLV, curKey } = useFinanceStore()
  const { showToast } = useUIStore()
  const [y] = curKey.split('-').map(Number)
  const currentSmmlv = getSMMLV(y)
  const [val, setVal] = useState(copFormat(currentSmmlv))

  function handleSave() {
    const n = parseCOP(val) || DEFAULTS.smmlv
    saveSMMLV(String(y), n)
    setVal(copFormat(n))
    showToast(`SMMLV ${y} guardado`)
  }

  return (
    <div className="bg-[var(--n-bg)] border border-[var(--n-border)] rounded-xl p-4">
      <div className="text-[12px] font-medium text-[var(--n-txt2)] mb-3 flex items-center gap-[5px]">
        <span>⚙️</span>
        <span>Configuración</span>
      </div>
      <div className="flex items-end gap-3">
        <div className="flex-1">
          <label className="block text-[11px] text-[var(--n-txt3)] mb-[3px]">SMMLV {y} (COP)</label>
          <input
            type="text"
            inputMode="numeric"
            value={val}
            onChange={e => {
              const stripped = e.target.value.replace(/[^\d]/g, '')
              setVal(stripped ? parseInt(stripped).toLocaleString('es-CO') : '')
            }}
            className="w-full border border-[var(--n-border2)] rounded-lg px-[10px] py-2 bg-[var(--n-bg)] text-[var(--n-txt)] focus:outline-none focus:ring-2 focus:ring-[var(--n-blue)]"
          />
        </div>
        <button
          onClick={handleSave}
          className="bg-[var(--n-txt)] text-[var(--n-bg)] rounded-lg px-4 py-2 text-[13px] font-medium border-0 cursor-pointer hover:opacity-85 transition-opacity whitespace-nowrap"
        >
          Guardar
        </button>
      </div>
      <div className="text-[11px] text-[var(--n-txt3)] mt-[6px]">
        Usado para calcular el IBC mínimo de seguridad social
      </div>
    </div>
  )
}
