import { useMemo, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { useLoans } from '../context/LoansContext'
import { loanStatus } from '../lib/calc'
import LoanCard from '../components/LoanCard'
import EmptyState from '../components/EmptyState'
import FloatingAddButton from '../components/FloatingAddButton'
import ConfirmDialog from '../components/ConfirmDialog'
import { ListIcon, PlusIcon, TrashIcon } from '../components/icons'

type Filter = 'koik' | 'kaesolev' | 'hilinenud' | 'lopetatud'

const FILTERS: { key: Filter; label: string }[] = [
  { key: 'koik', label: 'Kõik' },
  { key: 'kaesolev', label: 'Aktiivsed' },
  { key: 'hilinenud', label: 'Hilinenud' },
  { key: 'lopetatud', label: 'Lõpetatud' },
]

export default function Loans() {
  const { loans, clearAll } = useLoans()
  const navigate = useNavigate()
  const [filter, setFilter] = useState<Filter>('koik')
  const [showClear, setShowClear] = useState(false)

  const filtered = useMemo(() => {
    if (filter === 'koik') return loans
    return loans.filter((l) => loanStatus(l) === filter)
  }, [loans, filter])

  return (
    <div className="animate-fade-in">
      <div className="mb-5">
        <h1 className="text-2xl font-extrabold tracking-tight text-slate-100">Laenud</h1>
        <p className="text-sm text-slate-400">Kõik laenusaajad</p>
      </div>

      <div className="mb-5 flex gap-2 overflow-x-auto pb-1">
        {FILTERS.map(({ key, label }) => (
          <button
            key={key}
            type="button"
            onClick={() => setFilter(key)}
            className={`min-h-[40px] whitespace-nowrap rounded-full px-4 text-sm font-semibold transition-colors ${
              filter === key
                ? 'bg-primary text-white'
                : 'bg-navy-light text-slate-300 hover:bg-slate-700'
            }`}
          >
            {label}
          </button>
        ))}
      </div>

      {filtered.length === 0 ? (
        <EmptyState
          icon={<ListIcon className="h-12 w-12" />}
          title="Laene ei leitud"
          message={
            loans.length === 0
              ? 'Lisa oma esimene laen, et see siin näha oleks.'
              : 'Selle filtriga ei leitud ühtegi laenu.'
          }
          action={
            loans.length === 0 ? (
              <button className="btn-primary mt-2" onClick={() => navigate('/laen/uus')}>
                <PlusIcon className="h-5 w-5" />
                Lisa laen
              </button>
            ) : undefined
          }
        />
      ) : (
        <div className="grid gap-3 sm:grid-cols-2">
          {filtered.map((loan) => (
            <LoanCard key={loan.id} loan={loan} />
          ))}
        </div>
      )}

      {loans.length > 0 && (
        <div className="mt-10 border-t border-slate-800 pt-6">
          <p className="mb-3 text-xs font-semibold uppercase tracking-wide text-slate-500">
            Ohtlik tsoon
          </p>
          <button type="button" className="btn-danger w-full" onClick={() => setShowClear(true)}>
            <TrashIcon className="h-5 w-5" />
            Kustuta kõik andmed
          </button>
        </div>
      )}

      <FloatingAddButton />

      <ConfirmDialog
        open={showClear}
        title="Kustuta kõik andmed?"
        message="See kustutab jäädavalt kõik laenud ja maksed. Seda tegevust ei saa tagasi võtta."
        confirmLabel="Kustuta kõik"
        cancelLabel="Tühista"
        onConfirm={() => {
          clearAll()
          setShowClear(false)
        }}
        onCancel={() => setShowClear(false)}
      />
    </div>
  )
}
