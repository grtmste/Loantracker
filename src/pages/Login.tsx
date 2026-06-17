import { useState, type FormEvent } from 'react'
import { Navigate, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { WalletIcon } from '../components/icons'

export default function Login() {
  const { authenticated, hasAccount, login, register } = useAuth()
  const navigate = useNavigate()
  const [mode, setMode] = useState<'login' | 'register'>(hasAccount ? 'login' : 'register')
  const [kasutajanimi, setKasutajanimi] = useState('')
  const [parool, setParool] = useState('')
  const [error, setError] = useState('')

  if (authenticated) {
    return <Navigate to="/" replace />
  }

  const handleSubmit = (e: FormEvent) => {
    e.preventDefault()
    setError('')
    const result =
      mode === 'register' ? register(kasutajanimi, parool) : login(kasutajanimi, parool)
    if (result.ok) {
      navigate('/', { replace: true })
    } else {
      setError(result.error ?? 'Midagi läks valesti.')
    }
  }

  return (
    <div className="flex min-h-screen flex-col items-center justify-center px-4 py-10">
      <div className="animate-fade-in w-full max-w-sm">
        <div className="mb-8 flex flex-col items-center text-center">
          <span className="mb-4 flex h-16 w-16 items-center justify-center rounded-2xl bg-primary text-white shadow-lg shadow-primary/30">
            <WalletIcon className="h-8 w-8" />
          </span>
          <h1 className="text-3xl font-extrabold tracking-tight text-slate-100">Laenuhai</h1>
          <p className="mt-1 text-sm text-slate-400">
            {mode === 'register'
              ? 'Loo konto, et alustada laenude jälgimist'
              : 'Logi sisse, et jätkata'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="card flex flex-col gap-4">
          <div>
            <label className="label" htmlFor="kasutajanimi">
              Kasutajanimi
            </label>
            <input
              id="kasutajanimi"
              className="input"
              type="text"
              autoComplete="username"
              value={kasutajanimi}
              onChange={(e) => setKasutajanimi(e.target.value)}
              placeholder="Sinu kasutajanimi"
            />
          </div>

          <div>
            <label className="label" htmlFor="parool">
              Parool
            </label>
            <input
              id="parool"
              className="input"
              type="password"
              autoComplete={mode === 'register' ? 'new-password' : 'current-password'}
              value={parool}
              onChange={(e) => setParool(e.target.value)}
              placeholder="••••••••"
            />
          </div>

          {error && (
            <p className="rounded-lg bg-overdue/10 px-3 py-2 text-sm text-overdue">{error}</p>
          )}

          <button type="submit" className="btn-primary w-full">
            {mode === 'register' ? 'Loo konto' : 'Logi sisse'}
          </button>
        </form>

        <div className="mt-5 text-center text-sm text-slate-400">
          {mode === 'login' ? (
            !hasAccount && (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => {
                  setMode('register')
                  setError('')
                }}
              >
                Loo konto
              </button>
            )
          ) : (
            hasAccount && (
              <button
                type="button"
                className="font-semibold text-primary hover:underline"
                onClick={() => {
                  setMode('login')
                  setError('')
                }}
              >
                Mul on juba konto — logi sisse
              </button>
            )
          )}
        </div>
      </div>
    </div>
  )
}
