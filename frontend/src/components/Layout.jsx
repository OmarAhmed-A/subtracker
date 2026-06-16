import { useAuth } from '../auth.jsx'

export default function Layout({ children, page, onChangePage }) {
  const { user, logout } = useAuth()
  return (
    <div className="min-h-screen bg-slate-950 text-slate-100">
      <header className="sticky top-0 z-10 border-b border-slate-800 bg-slate-900/80 backdrop-blur">
        <div className="mx-auto flex max-w-3xl items-center justify-between px-4 py-3">
          <h1 className="text-lg font-bold tracking-tight">SubTracker</h1>
          {user && (
            <div className="flex items-center gap-4">
              {page === 'settings' ? (
                <button onClick={() => onChangePage('dashboard')} className="text-sm text-slate-400 hover:text-slate-100">
                  Back
                </button>
              ) : (
                <button onClick={() => onChangePage('settings')} className="text-sm text-slate-400 hover:text-slate-100">
                  Settings
                </button>
              )}
              <button onClick={logout} className="text-sm text-slate-400 hover:text-slate-100">
                Logout
              </button>
            </div>
          )}
        </div>
      </header>
      <main className="mx-auto max-w-3xl px-4 py-6">{children}</main>
    </div>
  )
}
