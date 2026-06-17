// Estonian-style formatting helpers

const currencyFormatter = new Intl.NumberFormat('et-EE', {
  style: 'currency',
  currency: 'EUR',
  minimumFractionDigits: 2,
  maximumFractionDigits: 2,
})

/** Formats a number as Estonian currency, e.g. "1 250,00 €" */
export function formatCurrency(amount: number): string {
  if (!Number.isFinite(amount)) return '0,00 €'
  // Intl uses a non-breaking space; normalise to a regular space for consistency.
  return currencyFormatter.format(amount).replace(/ /g, ' ')
}

const ESTONIAN_MONTHS = [
  'jaanuar',
  'veebruar',
  'märts',
  'aprill',
  'mai',
  'juuni',
  'juuli',
  'august',
  'september',
  'oktoober',
  'november',
  'detsember',
]

/** Formats an ISO date string as Estonian style, e.g. "17. juuni 2026" */
export function formatDate(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const day = date.getDate()
  const month = ESTONIAN_MONTHS[date.getMonth()]
  const year = date.getFullYear()
  return `${day}. ${month} ${year}`
}

/** Returns YYYY-MM-DD for use in <input type="date"> */
export function toDateInputValue(iso: string): string {
  const date = new Date(iso)
  if (Number.isNaN(date.getTime())) return ''
  const y = date.getFullYear()
  const m = String(date.getMonth() + 1).padStart(2, '0')
  const d = String(date.getDate()).padStart(2, '0')
  return `${y}-${m}-${d}`
}
