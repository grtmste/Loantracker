import type { Account, Loan } from '../types'

const KEYS = {
  account: 'laenuhai.account',
  session: 'laenuhai.session',
  loans: 'laenuhai.loans',
} as const

// --- Account / auth ---------------------------------------------------------

export function getAccount(): Account | null {
  try {
    const raw = localStorage.getItem(KEYS.account)
    return raw ? (JSON.parse(raw) as Account) : null
  } catch {
    return null
  }
}

export function saveAccount(account: Account): void {
  localStorage.setItem(KEYS.account, JSON.stringify(account))
}

export function isLoggedIn(): boolean {
  return localStorage.getItem(KEYS.session) === 'true'
}

export function setSession(active: boolean): void {
  if (active) localStorage.setItem(KEYS.session, 'true')
  else localStorage.removeItem(KEYS.session)
}

// --- Loans ------------------------------------------------------------------

export function getLoans(): Loan[] {
  try {
    const raw = localStorage.getItem(KEYS.loans)
    if (!raw) return []
    const parsed = JSON.parse(raw) as Loan[]
    // Migrate loans saved before interest-only payments existed.
    return parsed.map((loan) => ({ ...loan, intressiMaksed: loan.intressiMaksed ?? 0 }))
  } catch {
    return []
  }
}

export function saveLoans(loans: Loan[]): void {
  localStorage.setItem(KEYS.loans, JSON.stringify(loans))
}

// --- Utilities --------------------------------------------------------------

export function uuid(): string {
  if (typeof crypto !== 'undefined' && 'randomUUID' in crypto) {
    return crypto.randomUUID()
  }
  return 'id-' + Math.random().toString(36).slice(2) + Date.now().toString(36)
}
