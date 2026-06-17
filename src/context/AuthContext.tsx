import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isLoggedIn, setSession } from '../lib/storage'

// Single fixed account for personal use.
const CREDENTIALS = {
  kasutajanimi: 'laenuhai',
  parool: 'Siiski2026!',
}

interface AuthContextValue {
  authenticated: boolean
  login: (kasutajanimi: string, parool: string) => { ok: boolean; error?: string }
  logout: () => void
}

const AuthContext = createContext<AuthContextValue | null>(null)

export function AuthProvider({ children }: { children: ReactNode }) {
  const [authenticated, setAuthenticated] = useState(() => isLoggedIn())

  useEffect(() => {
    setSession(authenticated)
  }, [authenticated])

  const value = useMemo<AuthContextValue>(
    () => ({
      authenticated,
      login(kasutajanimi, parool) {
        if (kasutajanimi.trim() !== CREDENTIALS.kasutajanimi || parool !== CREDENTIALS.parool) {
          return { ok: false, error: 'Vale kasutajanimi või parool.' }
        }
        setAuthenticated(true)
        return { ok: true }
      },
      logout() {
        setAuthenticated(false)
      },
    }),
    [authenticated],
  )

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>
}

export function useAuth(): AuthContextValue {
  const ctx = useContext(AuthContext)
  if (!ctx) throw new Error('useAuth peab olema AuthProvider sees')
  return ctx
}
