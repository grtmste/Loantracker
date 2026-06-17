import { NavLink, Outlet, useNavigate } from 'react-router-dom'
import { useAuth } from '../context/AuthContext'
import { BellIcon, HomeIcon, ListIcon, LogoutIcon } from './icons'

const NAV_ITEMS = [
  { to: '/', label: 'Avaleht', icon: HomeIcon, end: true },
  { to: '/jälgimine', label: 'Jälgimine', icon: BellIcon, end: false },
  { to: '/laenud', label: 'Laenud', icon: ListIcon, end: false },
]

export default function Layout() {
  const { logout } = useAuth()
  const navigate = useNavigate()

  const handleLogout = () => {
    logout()
    navigate('/login', { replace: true })
  }

  return (
    <div className="min-h-screen lg:flex">
      {/* Desktop sidebar */}
      <aside className="hidden w-64 shrink-0 flex-col border-r border-slate-800 bg-navy-light/40 p-5 lg:flex">
        <div className="mb-8 flex items-center gap-2 px-2">
          <span className="flex h-9 w-9 items-center justify-center rounded-xl bg-primary text-lg font-extrabold text-white">
            L
          </span>
          <span className="text-xl font-extrabold tracking-tight text-slate-100">Laenuhai</span>
        </div>
        <nav className="flex flex-1 flex-col gap-1">
          {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
            <NavLink
              key={to}
              to={to}
              end={end}
              className={({ isActive }) =>
                `flex items-center gap-3 rounded-xl px-4 py-3 font-medium transition-colors ${
                  isActive
                    ? 'bg-primary/15 text-primary'
                    : 'text-slate-300 hover:bg-navy-light hover:text-slate-100'
                }`
              }
            >
              <Icon className="h-5 w-5" />
              {label}
            </NavLink>
          ))}
        </nav>
        <button
          type="button"
          onClick={handleLogout}
          className="flex items-center gap-3 rounded-xl px-4 py-3 font-medium text-slate-300 transition-colors hover:bg-overdue/10 hover:text-overdue"
        >
          <LogoutIcon className="h-5 w-5" />
          Logi välja
        </button>
      </aside>

      {/* Main content */}
      <div className="flex min-w-0 flex-1 flex-col">
        {/* Mobile top bar */}
        <header className="sticky top-0 z-30 flex items-center justify-between border-b border-slate-800 bg-navy/90 px-4 py-3 backdrop-blur lg:hidden">
          <div className="flex items-center gap-2">
            <span className="flex h-8 w-8 items-center justify-center rounded-lg bg-primary text-base font-extrabold text-white">
              L
            </span>
            <span className="text-lg font-extrabold tracking-tight text-slate-100">Laenuhai</span>
          </div>
          <button
            type="button"
            onClick={handleLogout}
            aria-label="Logi välja"
            className="flex h-10 w-10 items-center justify-center rounded-xl text-slate-400 hover:bg-navy-light hover:text-overdue"
          >
            <LogoutIcon className="h-5 w-5" />
          </button>
        </header>

        <main className="mx-auto w-full max-w-3xl flex-1 px-4 pb-28 pt-5 lg:pb-10 lg:pt-8">
          <Outlet />
        </main>
      </div>

      {/* Mobile bottom navigation */}
      <nav className="safe-bottom fixed inset-x-0 bottom-0 z-30 grid grid-cols-3 border-t border-slate-800 bg-navy/95 backdrop-blur lg:hidden">
        {NAV_ITEMS.map(({ to, label, icon: Icon, end }) => (
          <NavLink
            key={to}
            to={to}
            end={end}
            className={({ isActive }) =>
              `flex min-h-[56px] flex-col items-center justify-center gap-1 text-xs font-medium transition-colors ${
                isActive ? 'text-primary' : 'text-slate-400'
              }`
            }
          >
            <Icon className="h-6 w-6" />
            {label}
          </NavLink>
        ))}
      </nav>
    </div>
  )
}
