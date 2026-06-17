import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import type { Loan } from '../types'
import { getLoans, saveLoans, uuid } from '../lib/storage'
import { isCompleted } from '../lib/calc'

export type LoanInput = Omit<Loan, 'id' | 'makstudMaksed'> & { makstudMaksed?: number }

interface LoansContextValue {
  loans: Loan[]
  getLoan: (id: string) => Loan | undefined
  addLoan: (input: LoanInput) => Loan
  updateLoan: (id: string, input: LoanInput) => void
  deleteLoan: (id: string) => void
  markPayment: (id: string) => void
  unmarkPayment: (id: string) => void
}

const LoansContext = createContext<LoansContextValue | null>(null)

export function LoansProvider({ children }: { children: ReactNode }) {
  const [loans, setLoans] = useState<Loan[]>(() => getLoans())

  useEffect(() => {
    saveLoans(loans)
  }, [loans])

  const value = useMemo<LoansContextValue>(
    () => ({
      loans,
      getLoan: (id) => loans.find((l) => l.id === id),
      addLoan(input) {
        const loan: Loan = {
          id: uuid(),
          makstudMaksed: input.makstudMaksed ?? 0,
          ...input,
        }
        setLoans((prev) => [...prev, loan])
        return loan
      },
      updateLoan(id, input) {
        setLoans((prev) =>
          prev.map((l) =>
            l.id === id
              ? { ...l, ...input, makstudMaksed: input.makstudMaksed ?? l.makstudMaksed }
              : l,
          ),
        )
      },
      deleteLoan(id) {
        setLoans((prev) => prev.filter((l) => l.id !== id))
      },
      markPayment(id) {
        setLoans((prev) =>
          prev.map((l) => {
            if (l.id !== id || isCompleted(l)) return l
            return { ...l, makstudMaksed: l.makstudMaksed + 1 }
          }),
        )
      },
      unmarkPayment(id) {
        setLoans((prev) =>
          prev.map((l) =>
            l.id === id && l.makstudMaksed > 0
              ? { ...l, makstudMaksed: l.makstudMaksed - 1 }
              : l,
          ),
        )
      },
    }),
    [loans],
  )

  return <LoansContext.Provider value={value}>{children}</LoansContext.Provider>
}

export function useLoans(): LoansContextValue {
  const ctx = useContext(LoansContext)
  if (!ctx) throw new Error('useLoans peab olema LoansProvider sees')
  return ctx
}
