import { useEffect, useState, useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from './components/SectionHeader'
import InlineError from './components/InlineError'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { loadClients } from '../store/entitiesSlice'
import { selectClient, setStep } from '../store/wizardSlice'

export default function ManageProject() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { clients, loading, error } = useAppSelector(s => s.entities)
  const [searchTerm, setSearchTerm] = useState('')

  useEffect(() => {
    dispatch(loadClients())
  }, [dispatch])

  const filteredClients = useMemo(() => {
    if (!searchTerm.trim()) return clients
    const term = searchTerm.toLowerCase()
    return clients.filter(c =>
      c.name.toLowerCase().includes(term) ||
      c.phone.toLowerCase().includes(term) ||
      (c.email && c.email.toLowerCase().includes(term)) ||
      (c.address && c.address.toLowerCase().includes(term))
    )
  }, [clients, searchTerm])

  const handleClientSelect = (clientId: number) => {
    dispatch(selectClient(clientId))
    dispatch(setStep('project'))
    navigate('/workflow')
  }

  return (
    <div className="card p-5">
      {/* Breadcrumb */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      <SectionHeader
        title="Manage Projects"
        subtitle="Search and select a client to view or manage their projects. You can also edit client details here."
      />

      <div className="mb-4">
        <div className="label mb-2">Search Clients</div>
        <input
          type="text"
          className="input w-full"
          placeholder="Search by name, phone, email, or address..."
          value={searchTerm}
          onChange={e => setSearchTerm(e.target.value)}
        />
      </div>

      <div className="label mb-2">
        Client / Owner Details ({filteredClients.length} {filteredClients.length === 1 ? 'client' : 'clients'})
      </div>

      <InlineError message={error} />

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mt-4">
        {filteredClients.map(client => (
          <div
            key={client.id}
            className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4 hover:border-slate-300 dark:hover:border-slate-700 transition cursor-pointer"
            onClick={() => handleClientSelect(client.id)}
          >
            <div className="font-semibold mb-3">{client.name}</div>
            <div className="text-sm text-slate-600 dark:text-slate-400 space-y-1">
              <div>📞 {client.phone}</div>
              {client.email && <div>✉️ {client.email}</div>}
              {client.address && <div>📍 {client.address}</div>}
            </div>
            <button
              className="btn-primary w-full mt-4 text-sm"
              onClick={(e) => {
                e.stopPropagation()
                handleClientSelect(client.id)
              }}
            >
              View Projects →
            </button>
          </div>
        ))}
      </div>

      {filteredClients.length === 0 && (
        <div className="text-center text-slate-500 py-8">
          {searchTerm ? 'No clients found matching your search.' : 'No clients yet. Go to "Onboard Client" to add your first client.'}
        </div>
      )}
    </div>
  )
}

