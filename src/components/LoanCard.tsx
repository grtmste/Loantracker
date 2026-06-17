import { useNavigate } from 'react-router-dom'
import type { Loan } from '../types'
import {
  loanStatus,
  progress,
  remainingBalance,
} from '../lib/calc'
import { formatCurrency } from '../lib/format'
import ProgressBar from './ProgressBar'
import StatusBadge from './StatusBadge'

const PROGRESS_COLOR: Record<string, string> = {
  kaesolev: 'bg-primary',
  hilinenud: 'bg-overdue',
  lopetatud: 'bg-good',
}

export default function LoanCard({ loan }: { loan: Loan }) {
  const navigate = useNavigate()
  const status = loanStatus(loan)
  const remaining = remainingBalance(loan)

  return (
    <button
      type="button"
      onClick={() => navigate(`/laen/${loan.id}`)}
      className="card animate-fade-in w-full text-left transition-transform hover:border-slate-700 active:scale-[0.99]"
    >
      <div className="mb-3 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h3 className="truncate text-lg font-semibold text-slate-100">{loan.nimi}</h3>
          <p className="text-sm text-slate-400">
            Laen: {formatCurrency(loan.laenuSumma)}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      <div className="mb-2 flex items-end justify-between">
        <span className="text-sm text-slate-400">Jääk</span>
        <span className="text-base font-semibold text-slate-100">
          {formatCurrency(remaining)}
        </span>
      </div>

      <ProgressBar value={progress(loan)} color={PROGRESS_COLOR[status]} />
      <p className="mt-2 text-xs text-slate-500">
        {loan.makstudMaksed} / {loan.kestusKuudes} makset tehtud
      </p>
    </button>
  )
}
