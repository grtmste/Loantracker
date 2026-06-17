import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import {
  getAccount,
  isLoggedIn,
  saveAccount,
  setSession,
} from '../lib/storage'

interface AuthContextValue {
  authenticated: boolean
  hasAccount: boolean
  register: (kasutajanimi: string, parool: string) => { ok: boolean; error?: string }
  login: (kasutajanimi: string, parool: string) => { ok: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => isLoggedIn())
  const [hasAccount, setHasAccount] = useState(() => getAccount() !== null)

  useEffect(() => {
    setSession(authenticated)
  }, [authenticated])

  const value = useMemo<AuthContextValue>(
    () => ({
      authenticated,
      hasAccount,
      register(kasutajanimi, parool) {
        const name = kasutajanimi.trim()
        if (!name || !parool) {
          return { ok: false, error: 'Täida nii kasutajanimi kui ka parool.' }
        }
        if (getAccount()) {
          return { ok: false, error: 'Konto on juba olemas.' }
        }
        saveAccount({ kasutajanimi: name, parool })
        setHasAccount(true)
        setAuthenticated(true)
        return { ok: true }
      },
      login(kasutajanimi, parool) {
        const account = getAccount()
        if (!account) {
          return { ok: false, error: 'Kontot pole veel loodud. Loo konto.' }
        }
        if (account.kasutajanimi !== kasutajanimi.trim() || account.parool !== parool) {
          return { ok: false, error: 'Vale kasutajanimi või parool.' }
        }
        setAuthenticated(true)
        return { ok: true }
      },
      logout() {
        setAuthenticated(false)
      },
    }),
    [authenticated, hasAccount],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth peab olema AuthProvider sees')
  return ctx
}
