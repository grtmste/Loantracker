export interface Loan {
  id: string
  nimi: string // borrower name
  laenuSumma: number // total loan amount
  kestusKuudes: number // duration in months
  intressProtsent: number // annual interest rate % (auto-calculated)
  igakuineMakse: number // monthly payment amount
  algusKuupäev: string // loan start date (ISO)
  makstudMaksed: number // number of full payments made so far
  intressiMaksed: number // number of interest-only payments made so far
  märkmed: string // optional notes
}

export type LoanStatus = 'kaesolev' | 'hilinenud' | 'lopetatud'

export interface Account {
  kasutajanimi: string
  parool: string
}
