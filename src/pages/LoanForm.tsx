import { useMemo, useState, type FormEvent } from 'react'
import { useNavigate, useParams } from 'react-router-dom'
import { useLoans, type LoanInput } from '../context/LoansContext'
import { totalInterest, totalRepayment } from '../lib/calc'
import { formatCurrency, toDateInputValue } from '../lib/format'
import { ChevronLeftIcon, TrashIcon } from '../components/icons'
import ConfirmDialog from '../components/ConfirmDialog'

interface FormState {
  nimi: string
  laenuSumma: string
  kestusKuudes: string
  intressProtsent: string
  igakuineMakse: string
  algusKuupäev: string
  märkmed: string
}

function todayInput(): string {
  return toDateInputValue(new Date().toISOString())
}

export default function LoanForm() {
  const { id } = useParams<{ id: string }>()
  const navigate = useNavigate()
  const { getLoan, addLoan, updateLoan, deleteLoan } = useLoans()

  const editing = Boolean(id)
  const existing = id ? getLoan(id) : undefined

  const [form, setForm] = useState<FormState>(() => ({
    nimi: existing?.nimi ?? '',
    laenuSumma: existing ? String(existing.laenuSumma) : '',
    kestusKuudes: existing ? String(existing.kestusKuudes) : '',
    intressProtsent: existing ? String(existing.intressProtsent) : '',
    igakuineMakse: existing ? String(existing.igakuineMakse) : '',
    algusKuupäev: existing ? toDateInputValue(existing.algusKuupäev) : todayInput(),
    märkmed: existing?.märkmed ?? '',
  }))
  const [errors, setErrors] = useState<Record<string, string>>({})
  const [showDelete, setShowDelete] = useState(false)

  // Editing an id that doesn't exist.
  if (editing && !existing) {
    return (
      <div className="animate-fade-in">
        <p className="text-slate-300">Laenu ei leitud.</p>
        <button className="btn-secondary mt-4" onClick={() => navigate('/')}>
          Tagasi avalehele
        </button>
      </div>
    )
  }

  const num = (v: string) => {
    const n = Number(v.replace(',', '.'))
    return Number.isFinite(n) ? n : 0
  }

  const calc = useMemo(() => {
    const igakuineMakse = num(form.igakuineMakse)
    const kestusKuudes = num(form.kestusKuudes)
    const laenuSumma = num(form.laenuSumma)
    const repayment = totalRepayment({ igakuineMakse, kestusKuudes })
    const interest = totalInterest({ igakuineMakse, kestusKuudes, laenuSumma })
    return { repayment, interest }
  }, [form.igakuineMakse, form.kestusKuudes, form.laenuSumma])

  const set = (key: keyof FormState) => (e: { target: { value: string } }) =>
    setForm((prev) => ({ ...prev, [key]: e.target.value }))

  const validate = (): boolean => {
    const next: Record<string, string> = {}
    if (!form.nimi.trim()) next.nimi = 'Sisesta laenusaaja nimi.'
    if (num(form.laenuSumma) <= 0) next.laenuSumma = 'Sisesta kehtiv summa.'
    if (num(form.kestusKuudes) <= 0) next.kestusKuudes = 'Sisesta kestus kuudes.'
    if (num(form.intressProtsent) < 0) next.intressProtsent = 'Intress ei saa olla negatiivne.'
    if (num(form.igakuineMakse) <= 0) next.igakuineMakse = 'Sisesta igakuine makse.'
    if (!form.algusKuupäev) next.algusKuupäev = 'Vali alguskuupäev.'
    setErrors(next)
    return Object.keys(next).length === 0
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    if (!validate()) return

    const payload: LoanInput = {
      nimi: form.nimi.trim(),
      laenuSumma: num(form.laenuSumma),
      kestusKuudes: Math.round(num(form.kestusKuudes)),
      intressProtsent: num(form.intressProtsent),
      igakuineMakse: num(form.igakuineMakse),
      algusKuupäev: new Date(form.algusKuupäev).toISOString(),
      märkmed: form.märkmed.trim(),
    }

    if (editing && id) {
      updateLoan(id, payload)
      navigate(`/laen/${id}`)
    } else {
      const created = addLoan(payload)
      navigate(`/laen/${created.id}`)
    }
  }

  const handleDelete = () => {
    if (id) {
      deleteLoan(id)
      navigate('/', { replace: true })
    }
  }

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

      <h1 className="mb-5 text-2xl font-extrabold tracking-tight text-slate-100">
        {editing ? 'Muuda laenu' : 'Uus laen'}
      </h1>

      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <Field label="Laenusaaja nimi" error={errors.nimi}>
          <input
            className="input"
            type="text"
            value={form.nimi}
            onChange={set('nimi')}
            placeholder="nt. Mari Maasikas"
          />
        </Field>

        <div className="grid grid-cols-1 gap-4 sm:grid-cols-2">
          <Field label="Laenu summa (€)" error={errors.laenuSumma}>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.laenuSumma}
              onChange={set('laenuSumma')}
              placeholder="0"
            />
          </Field>

          <Field label="Kestus (kuudes)" error={errors.kestusKuudes}>
            <input
              className="input"
              type="number"
              inputMode="numeric"
              min="1"
              step="1"
              value={form.kestusKuudes}
              onChange={set('kestusKuudes')}
              placeholder="0"
            />
          </Field>

          <Field label="Aastane intress (%)" error={errors.intressProtsent}>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.1"
              value={form.intressProtsent}
              onChange={set('intressProtsent')}
              placeholder="nt. 5"
            />
          </Field>

          <Field label="Igakuine makse (€)" error={errors.igakuineMakse}>
            <input
              className="input"
              type="number"
              inputMode="decimal"
              min="0"
              step="0.01"
              value={form.igakuineMakse}
              onChange={set('igakuineMakse')}
              placeholder="0"
            />
          </Field>
        </div>

        <Field label="Laenu alguskuupäev" error={errors.algusKuupäev}>
          <input
            className="input"
            type="date"
            value={form.algusKuupäev}
            onChange={set('algusKuupäev')}
          />
        </Field>

        <Field label="Märkmed">
          <textarea
            className="input min-h-[96px] resize-y py-3"
            value={form.märkmed}
            onChange={set('märkmed')}
            placeholder="Valikulised märkmed..."
          />
        </Field>

        {/* Auto-calculated summary */}
        <div className="card grid grid-cols-2 gap-3 bg-navy-light/40">
          <div>
            <p className="text-xs text-slate-400">Tagasimakse kokku</p>
            <p className="text-lg font-bold text-slate-100">{formatCurrency(calc.repayment)}</p>
          </div>
          <div>
            <p className="text-xs text-slate-400">Intressikulu kokku</p>
            <p className="text-lg font-bold text-upcoming">{formatCurrency(calc.interest)}</p>
          </div>
        </div>

        <div className="mt-2 flex gap-3">
          <button
            type="button"
            className="btn-secondary flex-1"
            onClick={() => navigate(-1)}
          >
            Tühista
          </button>
          <button type="submit" className="btn-primary flex-1">
            Salvesta
          </button>
        </div>

        {editing && (
          <button
            type="button"
            className="btn-danger mt-4 w-full"
            onClick={() => setShowDelete(true)}
          >
            <TrashIcon className="h-5 w-5" />
            Kustuta laen
          </button>
        )}
      </form>

      <ConfirmDialog
        open={showDelete}
        title="Kustuta laen?"
        message={`Kas oled kindel, et soovid kustutada laenu "${form.nimi}"? Seda tegevust ei saa tagasi võtta.`}
        confirmLabel="Kustuta"
        cancelLabel="Tühista"
        onConfirm={handleDelete}
        onCancel={() => setShowDelete(false)}
      />
    </div>
  )
}

function Field({
  label,
  error,
  children,
}: {
  label: string
  error?: string
  children: React.ReactNode
}) {
  return (
    <div>
      <label className="label">{label}</label>
      {children}
      {error && <p className="mt-1 text-sm text-overdue">{error}</p>}
    </div>
  )
}
