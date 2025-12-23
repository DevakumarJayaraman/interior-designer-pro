import { useState, useEffect, useRef } from 'react'
import { Outlet, useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setTheme, setStep, selectClient, selectProject, selectQuote } from '../store/wizardSlice'

export default function Layout() {
  const theme = useAppSelector(s => s.wizard.theme)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const [menuOpen, setMenuOpen] = useState(false)
  const menuRef = useRef<HTMLDivElement>(null)

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setMenuOpen(false)
      }
    }
    if (menuOpen) {
      document.addEventListener('mousedown', handleClickOutside)
    }
    return () => {
      document.removeEventListener('mousedown', handleClickOutside)
    }
  }, [menuOpen])

  return (
    <div className="min-h-screen">
      <header className="sticky top-0 z-10 border-b border-slate-200 dark:border-slate-800 bg-white/80 dark:bg-slate-950/80 backdrop-blur">
        <div className="mx-auto max-w-6xl px-4 py-3 flex items-center justify-between">
          <div className="flex items-center gap-3 cursor-pointer" onClick={() => navigate('/')}>
            <div className="h-9 w-9 rounded-2xl bg-slate-900 dark:bg-slate-50" />
            <div>
              <div className="font-semibold leading-tight">Interior Designer Pro</div>
              <div className="text-xs text-slate-500 dark:text-slate-400">Client → Project → Areas → Dimensions → Quote → Cutlist</div>
            </div>
          </div>

          <div className="flex items-center gap-2">
            {/* Menu Dropdown */}
            <div className="relative" ref={menuRef}>
              <button
                className="btn-ghost"
                onClick={() => setMenuOpen(!menuOpen)}
                title="Menu"
              >
                ☰ Menu
              </button>
              {menuOpen && (
                <div className="absolute right-0 mt-2 w-56 rounded-2xl border border-slate-200 dark:border-slate-800 bg-white dark:bg-slate-900 shadow-soft z-20">
                  <div className="py-2">
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      onClick={() => {
                        navigate('/')
                        setMenuOpen(false)
                      }}
                    >
                      <div className="font-semibold text-sm">🏠 Dashboard</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Back to home</div>
                    </button>
                    <div className="border-t border-slate-200 dark:border-slate-800 my-1"></div>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      onClick={() => {
                        // Clear all context for fresh onboarding
                        dispatch(selectClient(undefined))
                        dispatch(selectProject(undefined))
                        dispatch(selectQuote(undefined))
                        dispatch(setStep('client'))
                        navigate('/workflow')
                        setMenuOpen(false)
                      }}
                    >
                      <div className="font-semibold text-sm">Onboard Client</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Start new client workflow</div>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      onClick={() => {
                        navigate('/manage-project')
                        setMenuOpen(false)
                      }}
                    >
                      <div className="font-semibold text-sm">Manage Project</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Search clients and manage projects</div>
                    </button>
                    <button
                      className="w-full text-left px-4 py-2 hover:bg-slate-100 dark:hover:bg-slate-800 transition"
                      onClick={() => {
                        navigate('/products')
                        setMenuOpen(false)
                      }}
                    >
                      <div className="font-semibold text-sm">Add Product</div>
                      <div className="text-xs text-slate-500 dark:text-slate-400">Manage product catalog</div>
                    </button>
                  </div>
                </div>
              )}
            </div>

            <button
              className="btn-ghost"
              onClick={() => dispatch(setTheme(theme === 'dark' ? 'light' : 'dark'))}
              title="Toggle theme"
            >
              {theme === 'dark' ? '☾' : '☀︎'}
            </button>
          </div>
        </div>
      </header>

      <main className="mx-auto max-w-6xl px-4 py-6">
        <Outlet />
      </main>
    </div>
  )
}
