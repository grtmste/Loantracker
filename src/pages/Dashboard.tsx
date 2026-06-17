import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoans } from '../context/LoansContext'
import {
  isCompleted,
  loanStatus,
  nextPaymentDate,
  remainingBalance,
} from '../lib/calc'
import { formatCurrency } from '../lib/format'
import SummaryCard from '../components/SummaryCard'
import LoanCard from '../components/LoanCard'
import EmptyState from '../components/EmptyState'
import FloatingAddButton from '../components/FloatingAddButton'
import { AlertIcon, CalendarIcon, CoinsIcon, PlusIcon, WalletIcon } from '../components/icons'

export default function Dashboard() {
  const { loans } = useLoans()
  const navigate = useNavigate()

  const stats = useMemo(() => {
    const now = new Date()
    let activeCount = 0
    let outstanding = 0
    let overdueCount = 0
    let expectedThisMonth = 0

    for (const loan of loans) {
      const completed = isCompleted(loan)
      if (!completed) {
        activeCount += 1
        outstanding += remainingBalance(loan)
      }
      if (loanStatus(loan, now) === 'hilinenud') {
        overdueCount += 1
      }
      // Count the next unpaid payment only if it falls in this calendar month
      // (or earlier, i.e. overdue). A payment due next month is not expected yet.
      const due = nextPaymentDate(loan, now)
      if (due) {
        const dueThisMonthOrEarlier =
          due.getFullYear() < now.getFullYear() ||
          (due.getFullYear() === now.getFullYear() && due.getMonth() <= now.getMonth())
        if (dueThisMonthOrEarlier) {
          expectedThisMonth += loan.igakuineMakse
        }
      }
    }

    return { activeCount, outstanding, overdueCount, expectedThisMonth }
  }, [loans])

  const sortedLoans = useMemo(() => {
    const order = { hilinenud: 0, kaesolev: 1, lopetatud: 2 } as const
    return [...loans].sort((a, b) => order[loanStatus(a)] - order[loanStatus(b)])
  }, [loans])

  return (
    <div className="animate-fade-in">
      <div className="mb-5 flex items-center justify-between">
        <div>
          <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Avaleht</h1>
          <p className="text-sm text-slate-400">Ülevaade sinu laenudest</p>
        </div>
      </div>

      <div className="mb-6 grid grid-cols-2 gap-3">
        <SummaryCard
          label="Aktiivsed laenud"
          value={String(stats.activeCount)}
          icon={<WalletIcon className="h-5 w-5" />}
        />
        <SummaryCard
          label="Jääk kokku"
          value={formatCurrency(stats.outstanding)}
          icon={<CoinsIcon className="h-5 w-5" />}
        />
        <SummaryCard
          label="Hilinenud"
          value={String(stats.overdueCount)}
          icon={<AlertIcon className="h-5 w-5" />}
          highlight={stats.overdueCount > 0}
          accent={stats.overdueCount > 0 ? 'text-overdue' : 'text-slate-100'}
        />
        <SummaryCard
          label="Oodatav sel kuul"
          value={formatCurrency(stats.expectedThisMonth)}
          icon={<CalendarIcon className="h-5 w-5" />}
          accent="text-upcoming"
        />
      </div>

      <h2 className="mb-3 text-lg font-bold text-slate-100">Laenusaajad</h2>
      {sortedLoans.length === 0 ? (
        <EmptyState
          icon={<WalletIcon className="h-12 w-12" />}
          title="Ühtegi laenu pole veel"
          message="Lisa oma esimene laen, et alustada maksete jälgimist."
          action={
            <button className="btn-primary mt-2" onClick={() => navigate('/laen/uus')}>
              <PlusIcon className="h-5 w-5" />
              Lisa laen
            </button>
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {sortedLoans.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}

      {/* Floating add button */}
      <FloatingAddButton />
    </div>
  )
}
