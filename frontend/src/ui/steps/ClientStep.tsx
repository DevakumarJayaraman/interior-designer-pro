import { useEffect, useState, useMemo } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createClient, loadClients, updateClient } from '../../store/entitiesSlice'
import { selectClient, setStep } from '../../store/wizardSlice'

export default function ClientStep() {
  const dispatch = useAppDispatch()
  const { clients, loading, error } = useAppSelector(s => s.entities)
  const selectedClientId = useAppSelector(s => s.wizard.selectedClientId)

  const [form, setForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [isEditing, setIsEditing] = useState(false)

  const selectedClient = useMemo(
    () => clients.find(c => c.id === selectedClientId),
    [clients, selectedClientId]
  )

  useEffect(() => { dispatch(loadClients()) }, [dispatch])

  useEffect(() => {
    if (selectedClient && !isEditing) {
      setForm({
        name: selectedClient.name,
        phone: selectedClient.phone,
        email: selectedClient.email || '',
        address: selectedClient.address || ''
      })
    }
  }, [selectedClient, isEditing])

  const canSave = form.name.trim() && form.phone.trim()
  const hasExistingClient = !!selectedClient

  return (
    <div>
      <SectionHeader
        title="1) Client / Owner Details"
        subtitle={hasExistingClient ? "View or edit client information." : "Add a new client to start a project."}
      />

      <div className="max-w-2xl">
        {hasExistingClient && !isEditing ? (
          // Readonly Mode with Edit Button
          <div className="card p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="label">Client Information</div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                ✎ Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Name</div>
                <div className="text-sm font-medium">{selectedClient.name}</div>
              </div>
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Phone</div>
                <div className="text-sm">{selectedClient.phone}</div>
              </div>
              {selectedClient.email && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Email</div>
                  <div className="text-sm">{selectedClient.email}</div>
                </div>
              )}
              {selectedClient.address && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Address</div>
                  <div className="text-sm">{selectedClient.address}</div>
                </div>
              )}
            </div>
            <button
              className="btn-primary mt-4"
              onClick={() => dispatch(setStep('project'))}
            >
              Continue to Project →
            </button>
          </div>
        ) : (
          // Edit Mode (for both new client and editing existing)
          <>
            <div className="label mb-2">{hasExistingClient ? 'Edit client' : 'Create new client'}</div>
            <div className="space-y-3">
              <input className="input" placeholder="Name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Phone *" value={form.phone} onChange={e => setForm({ ...form, phone: e.target.value })} />
              <input className="input" placeholder="Email" value={form.email} onChange={e => setForm({ ...form, email: e.target.value })} />
              <input className="input" placeholder="Address" value={form.address} onChange={e => setForm({ ...form, address: e.target.value })} />

              <div className="flex gap-2">
                <button
                  className={`font-medium px-4 py-2 rounded-xl transition ${
                    canSave && !loading
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                  }`}
                  disabled={!canSave || loading}
                  onClick={async () => {
                    if (hasExistingClient) {
                      await dispatch(updateClient({ id: selectedClientId!, body: form })).unwrap()
                      setIsEditing(false)
                    } else {
                      const created: any = await dispatch(createClient({ ...form })).unwrap()
                      dispatch(selectClient(created.id))
                      dispatch(setStep('project'))
                    }
                  }}
                >
                  {loading ? 'Saving...' : hasExistingClient ? 'Save' : 'Save & Continue'}
                </button>
                {hasExistingClient && (
                  <button
                    className="btn-ghost"
                    onClick={() => setIsEditing(false)}
                  >
                    Cancel
                  </button>
                )}
              </div>
            </div>
          </>
        )}

        <InlineError message={error} />
      </div>
    </div>
  )
}
