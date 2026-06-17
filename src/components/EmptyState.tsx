import type { ReactNode } from 'react'

interface EmptyStateProps {
  icon?: ReactNode
  title: string
  message: string
  action?: ReactNode
}

export default function EmptyState({ icon, title, message, action }: EmptyStateProps) {
  return (
    <div className="animate-fade-in flex flex-col items-center justify-center gap-3 rounded-2xl border border-dashed border-slate-700 bg-navy-card/50 px-6 py-12 text-center">
      {icon && <div className="text-slate-600">{icon}</div>}
      <h3 className="text-lg font-semibold text-slate-200">{title}</h3>
      <p className="max-w-xs text-sm text-slate-400">{message}</p>
      {action}
    </div>
  )
}
