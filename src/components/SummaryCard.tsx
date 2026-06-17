import type { ReactNode } from 'react'

interface SummaryCardProps {
  label: string
  value: string
  icon?: ReactNode
  highlight?: boolean
  accent?: string // text color class for the value
}

export default function SummaryCard({
  label,
  value,
  icon,
  highlight = false,
  accent = 'text-slate-100',
}: SummaryCardProps) {
  return (
    <div
      className={`card flex flex-col gap-2 ${
        highlight ? 'border-overdue/40 bg-overdue/10' : ''
      }`}
    >
      <div className="flex items-center justify-between">
        <span className="text-sm text-slate-400">{label}</span>
        {icon && <span className="text-slate-500">{icon}</span>}
      </div>
      <span className={`text-2xl font-bold leading-tight ${accent}`}>{value}</span>
    </div>
  )
}
