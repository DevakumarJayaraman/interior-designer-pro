import { useMemo } from 'react'
import { useAppSelector } from '../../store/hooks'

export default function ContextCard() {
  const { selectedClientId, selectedProjectId, selectedQuoteId } = useAppSelector(s => s.wizard)
  const { clients, projects, quotes } = useAppSelector(s => s.entities)

  const selectedClient = useMemo(
    () => clients.find(c => c.id === selectedClientId),
    [clients, selectedClientId]
  )

  const selectedProject = useMemo(
    () => projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  )

  const selectedQuote = useMemo(
    () => quotes.find(q => q.id === selectedQuoteId),
    [quotes, selectedQuoteId]
  )

  if (!selectedClient && !selectedProject && !selectedQuote) {
    return null
  }

  return (
    <div className="card p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-300 dark:border-slate-700 mb-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-2">
        Current Context
      </div>
      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        {selectedClient && (
          <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Client</div>
            <div className="font-semibold text-sm">{selectedClient.name}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              📞 {selectedClient.phone}
            </div>
            {selectedClient.email && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                ✉️ {selectedClient.email}
              </div>
            )}
          </div>
        )}

        {selectedProject && (
          <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Project</div>
            <div className="font-semibold text-sm">{selectedProject.name}</div>
            {selectedProject.siteAddress && (
              <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                📍 {selectedProject.siteAddress}
              </div>
            )}
            {selectedProject.propertyType && (
              <div className="text-xs text-slate-600 dark:text-slate-400">
                🏠 {selectedProject.propertyType}
              </div>
            )}
          </div>
        )}

        {selectedQuote && (
          <div className="rounded-xl bg-white dark:bg-slate-950 p-3 border border-slate-200 dark:border-slate-800">
            <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Quote</div>
            <div className="font-semibold text-sm">Quote #{selectedQuote.id}</div>
            <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
              Version: {selectedQuote.versionNo}
            </div>
            <div className="text-xs text-slate-600 dark:text-slate-400">
              Status: <span className="chip text-xs">{selectedQuote.status}</span>
            </div>
            <div className="text-xs font-semibold text-slate-700 dark:text-slate-300 mt-1">
              Total: ₹{selectedQuote.totalPrice?.toFixed(2) || '0.00'}
            </div>
          </div>
        )}
      </div>
    </div>
  )
}

