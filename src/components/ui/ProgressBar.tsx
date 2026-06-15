interface ProgressBarProps {
  label: string
  value: string
  pct: number
  color: string
  className?: string
}

export function ProgressBar({ label, value, pct, color, className }: ProgressBarProps) {
  const w = Math.max(0, Math.min(100, pct))
  return (
    <div className={className}>
      <div className="flex justify-between items-baseline mb-[5px]">
        <span className="text-[11px] text-[var(--n-txt2)]">{label}</span>
        <span className="text-[15px] font-semibold text-[var(--n-txt)]">{value}</span>
      </div>
      <div className="h-[5px] bg-[var(--n-bg3)] rounded-[3px] overflow-hidden">
        <div
          className="h-[5px] rounded-[3px] transition-[width] duration-400"
          style={{ width: `${w}%`, background: color }}
        />
      </div>
      <div className="text-[10px] text-[var(--n-txt3)] text-right mt-[3px]">{pct}%</div>
    </div>
  )
}
