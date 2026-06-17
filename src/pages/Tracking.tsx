import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoans } from '../context/LoansContext'
import type { Loan } from '../types'
import {
  daysOverdue,
  isCompleted,
  nextPaymentDate,
} from '../lib/calc'
import { formatCurrency, formatDate } from '../lib/format'
import EmptyState from '../components/EmptyState'
import { BellIcon } from '../components/icons'

interface Row {
  loan: Loan
  due: Date
  days: number // positive = overdue, negative = days until due
}

export default function Tracking() {
  const { loans } = useLoans()
  const navigate = useNavigate()

  const { overdue, upcoming, active } = useMemo(() => {
    const now = new Date()
    const overdueRows: Row[] = []
    const upcomingRows: Row[] = []
    const activeRows: Row[] = []

    for (const loan of loans) {
      if (isCompleted(loan)) continue
      const due = nextPaymentDate(loan, now)
      const days = daysOverdue(loan, now)
      if (!due || days === null) continue

      if (days > 0) {
        overdueRows.push({ loan, due, days })
      } else if (days >= -30) {
        upcomingRows.push({ loan, due, days })
      } else {
        activeRows.push({ loan, due, days })
      }
    }

    overdueRows.sort((a, b) => b.days - a.days) // most overdue first
    upcomingRows.sort((a, b) => a.due.getTime() - b.due.getTime()) // soonest first
    activeRows.sort((a, b) => a.due.getTime() - b.due.getTime())

    return { overdue: overdueRows, upcoming: upcomingRows, active: activeRows }
  }, [loans])

  const hasAny = overdue.length + upcoming.length + active.length > 0

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Jälgimine</h1>
        <p className="text-sm text-slate-400">Kes vajab tähelepanu</p>
      </div>

      {!hasAny ? (
        <EmptyState
          icon={<BellIcon className="h-12 w-12" />}
          title="Kõik on korras"
          message="Aktiivseid laene pole või on kõik maksed lõpetatud. Lisa laen, et siin midagi näha."
        />
      ) : (
        <div className="space-y-7">
          <Section
            title="Hilinenud maksed"
            color="text-overdue"
            dot="bg-overdue"
            count={overdue.length}
            empty="Hilinenud makseid pole. Tubli!"
          >
            {overdue.map(({ loan, days }) => (
              <TrackRow
                key={loan.id}
                onClick={() => navigate(`/laen/${loan.id}`)}
                name={loan.nimi}
                primary={`${days} ${days === 1 ? 'päev' : 'päeva'} hilinenud`}
                primaryClass="text-overdue"
                amount={loan.igakuineMakse}
                amountLabel="võlgu"
              />
            ))}
          </Section>

          <Section
            title="Järgmised maksed"
            color="text-upcoming"
            dot="bg-upcoming"
            count={upcoming.length}
            empty="Lähima 30 päeva jooksul makseid pole."
          >
            {upcoming.map(({ loan, due, days }) => {
              const until = Math.abs(days)
              return (
                <TrackRow
                  key={loan.id}
                  onClick={() => navigate(`/laen/${loan.id}`)}
                  name={loan.nimi}
                  primary={
                    until === 0
                      ? 'Tähtaeg täna'
                      : `${formatDate(due.toISOString())} · ${until} ${
                          until === 1 ? 'päeva pärast' : 'päeva pärast'
                        }`
                  }
                  primaryClass="text-upcoming"
                  amount={loan.igakuineMakse}
                  amountLabel="tasuda"
                />
              )
            })}
          </Section>

          <Section
            title="Aktiivsed laenud"
            color="text-primary"
            dot="bg-primary"
            count={active.length}
            empty="Muid aktiivseid laene pole."
          >
            {active.map(({ loan, due }) => (
              <TrackRow
                key={loan.id}
                onClick={() => navigate(`/laen/${loan.id}`)}
                name={loan.nimi}
                primary={`Järgmine makse: ${formatDate(due.toISOString())}`}
                primaryClass="text-slate-400"
                amount={loan.igakuineMakse}
                amountLabel="igakuine"
              />
            ))}
          </Section>
        </div>
      )}
    </div>
  )
}

function Section({
  title,
  color,
  dot,
  count,
  empty,
  children,
}: {
  title: string
  color: string
  dot: string
  count: number
  empty: string
  children: React.ReactNode
}) {
  return (
    <section>
      <div className="mb-3 flex items-center gap-2">
        <span className={`h-2.5 w-2.5 rounded-full ${dot}`} />
        <h2 className={`text-base font-bold ${color}`}>{title}</h2>
        <span className="rounded-full bg-navy-light px-2 py-0.5 text-xs font-semibold text-slate-400">
          {count}
        </span>
      </div>
      {count === 0 ? (
        <p className="rounded-xl border border-dashed border-slate-800 px-4 py-3 text-sm text-slate-500">
          {empty}
        </p>
      ) : (
        <div className="space-y-2">{children}</div>
      )}
    </section>
  )
}

function TrackRow({
  name,
  primary,
  primaryClass,
  amount,
  amountLabel,
  onClick,
}: {
  name: string
  primary: string
  primaryClass: string
  amount: number
  amountLabel: string
  onClick: () => void
}) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="card flex w-full items-center justify-between gap-3 py-3 text-left transition-transform active:scale-[0.99]"
    >
      <div className="min-w-0">
        <p className="truncate font-semibold text-slate-100">{name}</p>
        <p className={`truncate text-sm ${primaryClass}`}>{primary}</p>
      </div>
      <div className="shrink-0 text-right">
        <p className="font-bold text-slate-100">{formatCurrency(amount)}</p>
        <p className="text-xs text-slate-500">{amountLabel}</p>
      </div>
    </button>
  )
}
