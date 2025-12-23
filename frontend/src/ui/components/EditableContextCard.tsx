import { useState, useMemo } from 'react'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { updateClient, updateProject } from '../../store/entitiesSlice'

export default function EditableContextCard() {
  const dispatch = useAppDispatch()
  const { selectedClientId, selectedProjectId } = useAppSelector(s => s.wizard)
  const { clients, projects, loading } = useAppSelector(s => s.entities)

  const [editingClient, setEditingClient] = useState(false)
  const [editingProject, setEditingProject] = useState(false)
  const [clientForm, setClientForm] = useState({ name: '', phone: '', email: '', address: '' })
  const [projectForm, setProjectForm] = useState({ name: '', siteAddress: '', propertyType: '', scope: '', timeline: '', notes: '' })

  const selectedClient = useMemo(
    () => clients.find(c => c.id === selectedClientId),
    [clients, selectedClientId]
  )

  const selectedProject = useMemo(
    () => projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  )

  const handleEditClient = () => {
    if (selectedClient) {
      setClientForm({
        name: selectedClient.name,
        phone: selectedClient.phone,
        email: selectedClient.email || '',
        address: selectedClient.address || ''
      })
      setEditingClient(true)
    }
  }

  const handleSaveClient = async () => {
    if (selectedClientId) {
      await dispatch(updateClient({ id: selectedClientId, body: clientForm })).unwrap()
      setEditingClient(false)
    }
  }

  const handleEditProject = () => {
    if (selectedProject) {
      setProjectForm({
        name: selectedProject.name,
        siteAddress: selectedProject.siteAddress || '',
        propertyType: selectedProject.propertyType || '',
        scope: selectedProject.scope || '',
        timeline: selectedProject.timeline || '',
        notes: selectedProject.notes || ''
      })
      setEditingProject(true)
    }
  }

  const handleSaveProject = async () => {
    if (selectedProjectId) {
      await dispatch(updateProject({ id: selectedProjectId, body: projectForm })).unwrap()
      setEditingProject(false)
    }
  }

  const canSaveClient = clientForm.name.trim() && clientForm.phone.trim()
  const canSaveProject = projectForm.name.trim()

  if (!selectedClient && !selectedProject) {
    return null
  }

  return (
    <div className="card p-4 bg-gradient-to-r from-slate-50 to-slate-100 dark:from-slate-900 dark:to-slate-800 border-2 border-slate-300 dark:border-slate-700 mb-4">
      <div className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400 mb-3">
        Current Context
      </div>
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Client Card */}
        {selectedClient && (
          <div className="rounded-xl bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">CLIENT</div>
              {!editingClient && (
                <button
                  onClick={handleEditClient}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  ✎ Edit
                </button>
              )}
            </div>

            {editingClient ? (
              <div className="space-y-3">
                <div>
                  <label className="label text-xs mb-1">Name *</label>
                  <input
                    className="input text-sm"
                    value={clientForm.name}
                    onChange={e => setClientForm({ ...clientForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs mb-1">Phone *</label>
                  <input
                    className="input text-sm"
                    value={clientForm.phone}
                    onChange={e => setClientForm({ ...clientForm, phone: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs mb-1">Email</label>
                  <input
                    className="input text-sm"
                    value={clientForm.email}
                    onChange={e => setClientForm({ ...clientForm, email: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs mb-1">Address</label>
                  <input
                    className="input text-sm"
                    value={clientForm.address}
                    onChange={e => setClientForm({ ...clientForm, address: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className={`text-xs font-medium px-3 py-1.5 rounded-xl transition ${
                      canSaveClient && !loading
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                    }`}
                    disabled={!canSaveClient || loading}
                    onClick={handleSaveClient}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setEditingClient(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Name</div>
                  <div className="font-semibold text-sm">{selectedClient.name}</div>
                </div>
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Phone</div>
                  <div className="text-xs text-slate-600 dark:text-slate-400">📞 {selectedClient.phone}</div>
                </div>
                {selectedClient.email && (
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Email</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">✉️ {selectedClient.email}</div>
                  </div>
                )}
                {selectedClient.address && (
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Address</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">📍 {selectedClient.address}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}

        {/* Project Card */}
        {selectedProject && (
          <div className="rounded-xl bg-white dark:bg-slate-950 p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-3">
              <div className="text-xs font-semibold text-slate-500 dark:text-slate-400">PROJECT</div>
              {!editingProject && (
                <button
                  onClick={handleEditProject}
                  className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium"
                >
                  ✎ Edit
                </button>
              )}
            </div>

            {editingProject ? (
              <div className="space-y-3">
                <div>
                  <label className="label text-xs mb-1">Project Name *</label>
                  <input
                    className="input text-sm"
                    value={projectForm.name}
                    onChange={e => setProjectForm({ ...projectForm, name: e.target.value })}
                  />
                </div>
                <div>
                  <label className="label text-xs mb-1">Site Address</label>
                  <input
                    className="input text-sm"
                    value={projectForm.siteAddress}
                    onChange={e => setProjectForm({ ...projectForm, siteAddress: e.target.value })}
                  />
                </div>
                <div className="grid grid-cols-2 gap-2">
                  <div>
                    <label className="label text-xs mb-1">Property Type</label>
                    <select
                      className="input text-sm"
                      value={projectForm.propertyType}
                      onChange={e => setProjectForm({ ...projectForm, propertyType: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option>Flat</option>
                      <option>Villa</option>
                      <option>Independent</option>
                      <option>Office</option>
                    </select>
                  </div>
                  <div>
                    <label className="label text-xs mb-1">Scope</label>
                    <select
                      className="input text-sm"
                      value={projectForm.scope}
                      onChange={e => setProjectForm({ ...projectForm, scope: e.target.value })}
                    >
                      <option value="">Select</option>
                      <option>Full Home</option>
                      <option>Kitchen Only</option>
                      <option>Wardrobes</option>
                      <option>Living</option>
                    </select>
                  </div>
                </div>
                <div>
                  <label className="label text-xs mb-1">Timeline</label>
                  <input
                    className="input text-sm"
                    value={projectForm.timeline}
                    onChange={e => setProjectForm({ ...projectForm, timeline: e.target.value })}
                  />
                </div>
                <div className="flex gap-2">
                  <button
                    className={`text-xs font-medium px-3 py-1.5 rounded-xl transition ${
                      canSaveProject && !loading
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                    }`}
                    disabled={!canSaveProject || loading}
                    onClick={handleSaveProject}
                  >
                    {loading ? 'Saving...' : 'Save'}
                  </button>
                  <button
                    className="text-xs px-3 py-1.5 rounded-xl border border-slate-300 dark:border-slate-600 hover:bg-slate-100 dark:hover:bg-slate-800"
                    onClick={() => setEditingProject(false)}
                  >
                    Cancel
                  </button>
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400">Name</div>
                  <div className="font-semibold text-sm">{selectedProject.name}</div>
                </div>
                {selectedProject.siteAddress && (
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Site Address</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">📍 {selectedProject.siteAddress}</div>
                  </div>
                )}
                {selectedProject.propertyType && (
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Property Type</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">🏠 {selectedProject.propertyType}</div>
                  </div>
                )}
                {selectedProject.scope && (
                  <div>
                    <div className="text-xs text-slate-500 dark:text-slate-400">Scope</div>
                    <div className="text-xs text-slate-600 dark:text-slate-400">{selectedProject.scope}</div>
                  </div>
                )}
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  )
}

