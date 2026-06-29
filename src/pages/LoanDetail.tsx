import { useState } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLoans } from '../context/LoansContext'
import {
  addMonths,
  daysOverdue,
  dailyInterest,
  dailyInterestRate,
  isCompleted,
  loanStatus,
  monthlyInterest,
  monthlyInterestRate,
  nextPaymentDate,
  progress,
  remainingBalance,
  remainingMonths,
} from '../lib/calc'
import { formatCurrency, formatDate } from '../lib/format'
import ProgressBar from '../components/ProgressBar'
import StatusBadge from '../components/StatusBadge'
import ConfirmDialog from '../components/ConfirmDialog'
import { CheckIcon, ChevronLeftIcon, EditIcon } from '../components/icons'

const PROGRESS_COLOR: Record<string, string> = {
  kaesolev: 'bg-primary',
  hilinenud: 'bg-overdue',
  lopetatud: 'bg-good',
}

export default function LoanDetail() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getLoan, markPayment, unmarkPayment, markInterestPayment, unmarkInterestPayment } =
    useLoans()
  const [showUndo, setShowUndo] = useState(false)
  const [showUndoInterest, setShowUndoInterest] = useState(false)

  const loan = id ? getLoan(id) : undefined

  if (!loan) {
    return (
      <div className="animate-fade-in">
        <p className="text-slate-300">Laenu ei leitud.</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/')}>
          Tagasi avalehele
        </button>
      </div>
    )
  }

  const status = loanStatus(loan)
  const completed = isCompleted(loan)
  const remaining = remainingBalance(loan)
  const monthsLeft = remainingMonths(loan)
  const next = nextPaymentDate(loan)
  const overdue = daysOverdue(loan)
  const interestAmount = monthlyInterest(loan)

  const start = new Date(loan.algusKuupäev)

  return (
    <div className="animate-fade-in">
      <button
        type="button"
        onClick={() => navigate(-1)}
        className="mb-4 inline-flex items-center gap-1 text-sm font-medium text-slate-400 hover:text-slate-200"
      >
        <ChevronLeftIcon className="h-4 w-4" />
        Tagasi
      </button>

      <div className="mb-5 flex items-start justify-between gap-3">
        <div className="min-w-0">
          <h1 className="break-words text-2xl font-extrabold tracking-tight text-slate-100">
            {loan.nimi}
          </h1>
          <p className="mt-1 text-sm text-slate-400">
            Alustatud {formatDate(loan.algusKuupäev)}
          </p>
        </div>
        <StatusBadge status={status} />
      </div>

      {/* Overdue / next-payment banner */}
      {!completed && overdue !== null && overdue > 0 && (
        <div className="mb-4 rounded-xl border border-overdue/40 bg-overdue/10 px-4 py-3 text-sm text-overdue">
          Makse on {overdue} {overdue === 1 ? 'päev' : 'päeva'} hilinenud
          {next && ` (tähtaeg oli ${formatDate(next.toISOString())})`}.
        </div>
      )}
      {completed && (
        <div className="mb-4 rounded-xl border border-good/40 bg-good/10 px-4 py-3 text-sm text-good">
          Laen on täielikult tagasi makstud. 🎉
        </div>
      )}

      {/* Key stats */}
      <div className="mb-5 grid grid-cols-2 gap-3">
        <Stat label="Algne summa" value={formatCurrency(loan.laenuSumma)} />
        <Stat label="Jääk" value={formatCurrency(remaining)} accent="text-primary" />
        <Stat label="Kuid jäänud" value={`${monthsLeft} / ${loan.kestusKuudes}`} />
        <Stat
          label="Järgmine makse"
          value={next ? formatDate(next.toISOString()) : '—'}
        />
        <Stat label="Igakuine makse" value={formatCurrency(loan.igakuineMakse)} />
        <Stat label="Aastane intress" value={`${loan.intressProtsent.toFixed(1)} %`} />
        <Stat
          label="Kuine intress"
          value={`${monthlyInterestRate(loan).toFixed(1)} % · ${formatCurrency(monthlyInterest(loan))}`}
        />
        <Stat
          label="Päevane intress"
          value={`${dailyInterestRate(loan).toFixed(2)} % · ${formatCurrency(dailyInterest(loan))}`}
        />
      </div>

      {/* Progress */}
      <div className="card mb-5">
        <div className="mb-2 flex items-center justify-between">
          <span className="text-sm font-medium text-slate-300">Maksete edenemine</span>
          <span className="text-sm text-slate-400">
            {loan.makstudMaksed} / {loan.kestusKuudes}
          </span>
        </div>
        <ProgressBar value={progress(loan)} color={PROGRESS_COLOR[status]} />
      </div>

      {/* Mark payment */}
      <div className="mb-3 flex gap-3">
        <button
          type="button"
          className="btn-primary flex-1"
          disabled={completed}
          onClick={() => markPayment(loan.id)}
        >
          <CheckIcon className="h-5 w-5" />
          {completed ? 'Kõik maksed tehtud' : 'Märgi makse tehtuks'}
        </button>
        {loan.makstudMaksed > 0 && (
          <button
            type="button"
            className="btn-secondary"
            onClick={() => setShowUndo(true)}
            aria-label="Võta viimane makse tagasi"
          >
            Võta tagasi
          </button>
        )}
      </div>

      {/* Interest-only payment: borrower paid only the interest this month */}
      {!completed && interestAmount > 0 && (
        <>
          <button
            type="button"
            className="btn-secondary mb-1.5 w-full"
            onClick={() => markInterestPayment(loan.id)}
          >
            Märgi ainult intress makstuks ({formatCurrency(interestAmount)})
          </button>
          <p className="mb-3 px-1 text-xs text-slate-500">
            Kasuta, kui laenusaaja maksab sel kuul ainult intressi. Nihutab järgmise makse
            tähtaega kuu võrra edasi, kuid ei vähenda laenu jääki ega kestust.
          </p>
        </>
      )}

      {loan.intressiMaksed > 0 && (
        <div className="mb-5 flex items-center justify-between rounded-xl border border-upcoming/30 bg-upcoming/5 px-4 py-3">
          <div>
            <p className="text-sm font-medium text-slate-200">
              Intressimakseid: {loan.intressiMaksed}
            </p>
            <p className="text-xs text-slate-400">
              kokku {formatCurrency(loan.intressiMaksed * interestAmount)} · pikendab graafikut
            </p>
          </div>
          <button
            type="button"
            className="text-sm font-semibold text-slate-400 hover:text-slate-200"
            onClick={() => setShowUndoInterest(true)}
          >
            Võta tagasi
          </button>
        </div>
      )}

      {loan.märkmed && (
        <div className="card mb-5">
          <p className="mb-1 text-sm font-medium text-slate-300">Märkmed</p>
          <p className="whitespace-pre-wrap text-sm text-slate-400">{loan.märkmed}</p>
        </div>
      )}

      {/* Payment history timeline */}
      <h2 className="mb-3 text-lg font-bold text-slate-100">Maksete ajalugu</h2>
      <ol className="mb-6 space-y-2">
        {Array.from({ length: loan.kestusKuudes }).map((_, i) => {
          const monthNo = i + 1
          const paid = i < loan.makstudMaksed
          // Interest-only payments push the remaining (unpaid) due dates out.
          const dueDate = addMonths(start, monthNo + (paid ? 0 : loan.intressiMaksed))
          const isNext = !paid && i === loan.makstudMaksed
          const isLate =
            isNext && overdue !== null && overdue > 0
          return (
            <li
              key={i}
              className={`flex items-center gap-3 rounded-xl border px-3 py-2.5 ${
                paid
                  ? 'border-good/30 bg-good/5'
                  : isLate
                    ? 'border-overdue/30 bg-overdue/5'
                    : isNext
                      ? 'border-upcoming/30 bg-upcoming/5'
                      : 'border-slate-800 bg-navy-card/50'
              }`}
            >
              <span
                className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-full text-xs font-bold ${
                  paid
                    ? 'bg-good text-white'
                    : isLate
                      ? 'bg-overdue text-white'
                      : isNext
                        ? 'bg-upcoming text-white'
                        : 'bg-slate-700 text-slate-300'
                }`}
              >
                {paid ? <CheckIcon className="h-4 w-4" /> : monthNo}
              </span>
              <div className="min-w-0 flex-1">
                <p className="text-sm font-medium text-slate-200">
                  {monthNo}. makse
                </p>
                <p className="text-xs text-slate-500">{formatDate(dueDate.toISOString())}</p>
              </div>
              <span className="shrink-0 text-sm font-semibold text-slate-300">
                {formatCurrency(loan.igakuineMakse)}
              </span>
              <span
                className={`shrink-0 text-xs font-semibold ${
                  paid
                    ? 'text-good'
                    : isLate
                      ? 'text-overdue'
                      : isNext
                        ? 'text-upcoming'
                        : 'text-slate-500'
                }`}
              >
                {paid ? 'Makstud' : isLate ? 'Hilinenud' : isNext ? 'Järgmine' : 'Ootel'}
              </span>
            </li>
          )
        })}
      </ol>

      <button
        type="button"
        className="btn-secondary w-full"
        onClick={() => navigate(`/laen/${loan.id}/muuda`)}
      >
        <EditIcon className="h-5 w-5" />
        Muuda
      </button>

      <ConfirmDialog
        open={showUndo}
        title="Võta makse tagasi?"
        message="Viimane märgitud makse võetakse tagasi."
        confirmLabel="Võta tagasi"
        cancelLabel="Tühista"
        onConfirm={() => {
          unmarkPayment(loan.id)
          setShowUndo(false)
        }}
        onCancel={() => setShowUndo(false)}
      />

      <ConfirmDialog
        open={showUndoInterest}
        title="Võta intressimakse tagasi?"
        message="Viimane märgitud intressimakse võetakse tagasi."
        confirmLabel="Võta tagasi"
        cancelLabel="Tühista"
        onConfirm={() => {
          unmarkInterestPayment(loan.id)
          setShowUndoInterest(false)
        }}
        onCancel={() => setShowUndoInterest(false)}
      />
    </div>
  )
}

function Stat({
  label,
  value,
  accent = 'text-slate-100',
}: {
  label: string
  value: string
  accent?: string
}) {
  return (
    <div className="card py-3">
      <p className="text-xs text-slate-400">{label}</p>
      <p className={`mt-1 text-base font-bold ${accent}`}>{value}</p>
    </div>
  )
}
