import type { Loan, LoanStatus } from '../types'

/** Adds a number of whole months to a date, clamping the day if needed. */
export function addMonths(date: Date, months: number): Date {
  const result = new Date(date.getTime())
  const targetMonth = result.getMonth() + months
  const day = result.getDate()
  result.setDate(1)
  result.setMonth(targetMonth)
  // Clamp the day to the last valid day of the resulting month.
  const lastDay = new Date(result.getFullYear(), result.getMonth() + 1, 0).getDate()
  result.setDate(Math.min(day, lastDay))
  return result
}

/** Number of whole days between two dates (a - b), ignoring time of day. */
export function daysBetween(a: Date, b: Date): number {
  const startOfDay = (d: Date) => new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime()
  const MS_PER_DAY = 1000 * 60 * 60 * 24
  return Math.round((startOfDay(a) - startOfDay(b)) / MS_PER_DAY)
}

/** Total amount to be repaid over the full loan duration. */
export function totalRepayment(loan: Pick<Loan, 'igakuineMakse' | 'kestusKuudes'>): number {
  return loan.igakuineMakse * loan.kestusKuudes
}

/** Total interest cost = total repayment - principal. */
export function totalInterest(
  loan: Pick<Loan, 'igakuineMakse' | 'kestusKuudes' | 'laenuSumma'>,
): number {
  return Math.max(0, totalRepayment(loan) - loan.laenuSumma)
}

/** Interest amount included in a single monthly payment. */
export function monthlyInterest(
  loan: Pick<Loan, 'igakuineMakse' | 'kestusKuudes' | 'laenuSumma'>,
): number {
  if (loan.kestusKuudes <= 0) return 0
  return totalInterest(loan) / loan.kestusKuudes
}

/** Annual interest rate %, derived from the monthly payment and duration. */
export function annualInterestRate(
  loan: Pick<Loan, 'igakuineMakse' | 'kestusKuudes' | 'laenuSumma'>,
): number {
  if (loan.laenuSumma <= 0 || loan.kestusKuudes <= 0) return 0
  return (totalInterest(loan) / loan.laenuSumma) * (12 / loan.kestusKuudes) * 100
}

/** Monthly interest rate % (annual rate / 12). */
export function monthlyInterestRate(
  loan: Pick<Loan, 'igakuineMakse' | 'kestusKuudes' | 'laenuSumma'>,
): number {
  return annualInterestRate(loan) / 12
}

/**
 * Remaining balance = everything still owed (principal + interest), i.e. the
 * payments not yet made. Interest-only payments do not reduce this.
 */
export function remainingBalance(loan: Loan): number {
  return Math.max(0, (loan.kestusKuudes - loan.makstudMaksed) * loan.igakuineMakse)
}

/** Number of payments still outstanding. */
export function remainingMonths(loan: Loan): number {
  return Math.max(0, loan.kestusKuudes - loan.makstudMaksed)
}

/** True when every scheduled payment has been made. */
export function isCompleted(loan: Loan): boolean {
  return loan.makstudMaksed >= loan.kestusKuudes
}

/** Date the next (unpaid) payment is due. Null when the loan is completed. */
export function nextPaymentDate(loan: Loan, now: Date = new Date()): Date | null {
  void now
  if (isCompleted(loan)) return null
  const start = new Date(loan.algusKuupäev)
  if (Number.isNaN(start.getTime())) return null
  // First payment is due one month after the start date. Interest-only
  // payments push the schedule forward by a month each.
  return addMonths(start, loan.makstudMaksed + loan.intressiMaksed + 1)
}

/**
 * Days overdue for the next payment. Positive => overdue by that many days,
 * 0 => due today, negative => that many days until due. Null when completed.
 */
export function daysOverdue(loan: Loan, now: Date = new Date()): number | null {
  const due = nextPaymentDate(loan, now)
  if (!due) return null
  return daysBetween(now, due)
}

export function loanStatus(loan: Loan, now: Date = new Date()): LoanStatus {
  if (isCompleted(loan)) return 'lopetatud'
  const overdue = daysOverdue(loan, now)
  if (overdue !== null && overdue > 0) return 'hilinenud'
  return 'kaesolev'
}

/** Progress as a fraction between 0 and 1. */
export function progress(loan: Loan): number {
  if (loan.kestusKuudes <= 0) return 0
  return Math.min(1, loan.makstudMaksed / loan.kestusKuudes)
}
