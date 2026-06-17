interface ProgressBarProps {
  value: number // 0..1
  color?: string // tailwind bg class
}

export default function ProgressBar({ value, color = 'bg-primary' }: ProgressBarProps) {
  const pct = Math.round(Math.min(1, Math.max(0, value)) * 100)
  return (
    <div className="h-2.5 w-full overflow-hidden rounded-full bg-slate-700/70">
      <div
        className={`h-full rounded-full transition-all duration-500 ${color}`}
        style={{ width: `${pct}%` }}
      />
    </div>
  )
}
