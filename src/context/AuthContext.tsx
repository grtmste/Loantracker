import { createContext, useContext, useEffect, useMemo, useState, type ReactNode } from 'react'
import { isLoggedIn, setSession } from '../lib/storage'

// Single fixed account for personal use. Only the SHA-256 hashes of the
// username and password are stored here, so the plaintext credentials are
// not present in the source. (This is obfuscation, not real security — a
// client-only app can never keep a secret from someone inspecting it.)
const CREDENTIAL_HASHES = {
  kasutajanimi: '3d9aa0b490daf21c207d1e42771d8858bc280858c13888db281b73f843ef4396',
  parool: 'bb7fd9d57eb5e08f90d23cf949e5d494ddb62268bf3255678066243813c49544',
}

async function sha256(value: string): Promise<string> {
  const data = new TextEncoder().encode(value)
  const digest = await crypto.subtle.digest('SHA-256', data)
  return Array.from(new Uint8Array(digest))
    .map((b) => b.toString(16).padStart(2, '0'))
    .join('')
}

interface AuthContextValue {
  authenticated: boolean
  login: (kasutajanimi: string, parool: string) => Promise<{ ok: boolean; error?: string }>
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
      async login(kasutajanimi, parool) {
        const [nameHash, passHash] = await Promise.all([
          sha256(kasutajanimi.trim()),
          sha256(parool),
        ])
        if (
          nameHash !== CREDENTIAL_HASHES.kasutajanimi ||
          passHash !== CREDENTIAL_HASHES.parool
        ) {
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
