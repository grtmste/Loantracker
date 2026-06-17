import type { LoanStatus } from '../types'

const CONFIG: Record<LoanStatus, { label: string; classes: string }> = {
  kaesolev: { label: 'Tähtis', classes: 'bg-primary/15 text-primary' },
  hilinenud: { label: 'Hilinenud', classes: 'bg-overdue/15 text-overdue' },
  lopetatud: { label: 'Lõpetatud', classes: 'bg-good/15 text-good' },
}

export default function StatusBadge({ status }: { status: LoanStatus }) {
  const { label, classes } = CONFIG[status]
  return (
    <span
      className={`inline-flex items-center rounded-full px-2.5 py-1 text-xs font-semibold ${classes}`}
    >
      {label}
    </span>
  )
}
