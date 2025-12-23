import { useEffect, useState, useMemo } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createProject, loadDraftQuote, loadProjects, updateProject } from '../../store/entitiesSlice'
import { selectProject, selectQuote, setStep } from '../../store/wizardSlice'

export default function ProjectStep() {
  const dispatch = useAppDispatch()
  const { projects, loading, error } = useAppSelector(s => s.entities)
  const clientId = useAppSelector(s => s.wizard.selectedClientId)
  const selectedProjectId = useAppSelector(s => s.wizard.selectedProjectId)

  const [form, setForm] = useState({
    name: '',
    siteAddress: '',
    propertyType: 'Flat',
    scope: 'Full Home',
    timeline: '',
    notes: '',
  })
  const [isEditing, setIsEditing] = useState(false)

  const selectedProject = useMemo(
    () => projects.find(p => p.id === selectedProjectId),
    [projects, selectedProjectId]
  )

  useEffect(() => {
    if (clientId) dispatch(loadProjects(clientId))
  }, [dispatch, clientId])

  useEffect(() => {
    if (selectedProject && !isEditing) {
      setForm({
        name: selectedProject.name,
        siteAddress: selectedProject.siteAddress || '',
        propertyType: selectedProject.propertyType || 'Flat',
        scope: selectedProject.scope || 'Full Home',
        timeline: selectedProject.timeline || '',
        notes: selectedProject.notes || ''
      })
    }
  }, [selectedProject, isEditing])

  // Load draft quote when project exists
  useEffect(() => {
    if (selectedProjectId && !isEditing) {
      dispatch(loadDraftQuote(selectedProjectId)).then((result: any) => {
        if (result.payload) {
          dispatch(selectQuote(result.payload.id))
        }
      })
    }
  }, [selectedProjectId, isEditing, dispatch])

  const canSave = !!clientId && form.name.trim()
  const hasExistingProject = !!selectedProject

  return (
    <div>
      <SectionHeader
        title="2) Project Details"
        subtitle={hasExistingProject ? "View or edit project information." : "Capture scope, site details, and create a draft quotation."}
      />

      {!clientId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100 px-4 py-3 text-sm">
          Select a client first.
        </div>
      )}

      <div className="max-w-2xl mt-4">
        {hasExistingProject && !isEditing ? (
          // Readonly Mode with Edit Button
          <div className="card p-4 border border-slate-200 dark:border-slate-800">
            <div className="flex items-center justify-between mb-4">
              <div className="label">Project Information</div>
              <button
                onClick={() => setIsEditing(true)}
                className="text-sm text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 font-medium px-3 py-1.5 rounded-lg border border-blue-200 dark:border-blue-800 hover:bg-blue-50 dark:hover:bg-blue-950"
              >
                ✎ Edit
              </button>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Project Name</div>
                <div className="text-sm font-medium">{selectedProject.name}</div>
              </div>
              {selectedProject.siteAddress && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Site Address</div>
                  <div className="text-sm">{selectedProject.siteAddress}</div>
                </div>
              )}
              {selectedProject.propertyType && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Property Type</div>
                  <div className="text-sm">{selectedProject.propertyType}</div>
                </div>
              )}
              {selectedProject.scope && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Scope</div>
                  <div className="text-sm">{selectedProject.scope}</div>
                </div>
              )}
              {selectedProject.timeline && (
                <div>
                  <div className="text-xs text-slate-500 dark:text-slate-400 mb-1">Timeline</div>
                  <div className="text-sm">{selectedProject.timeline}</div>
                </div>
              )}
            </div>
            <button
              className="btn-primary mt-4"
              onClick={async () => {
                // Load draft quote for existing project if not already loaded
                if (selectedProjectId) {
                  const quote: any = await dispatch(loadDraftQuote(selectedProjectId)).unwrap()
                  dispatch(selectQuote(quote.id))
                }
                dispatch(setStep('areas'))
              }}
            >
              Continue to Areas →
            </button>
          </div>
        ) : (
          // Edit Mode (for both new project and editing existing)
          <>
            <div className="label mb-2">{hasExistingProject ? 'Edit project' : 'Create new project'}</div>
            <div className="space-y-3">
              <input className="input" placeholder="Project name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
              <input className="input" placeholder="Site address" value={form.siteAddress} onChange={e => setForm({ ...form, siteAddress: e.target.value })} />

              <div className="grid grid-cols-2 gap-3">
                <select className="input" value={form.propertyType} onChange={e => setForm({ ...form, propertyType: e.target.value })}>
                  <option>Flat</option><option>Villa</option><option>Independent</option><option>Office</option>
                </select>
                <select className="input" value={form.scope} onChange={e => setForm({ ...form, scope: e.target.value })}>
                  <option>Full Home</option><option>Kitchen Only</option><option>Wardrobes</option><option>Living</option>
                </select>
              </div>

              <input className="input" placeholder="Timeline (e.g., 45 days)" value={form.timeline} onChange={e => setForm({ ...form, timeline: e.target.value })} />
              <textarea className="input min-h-[96px]" placeholder="Notes / requirements" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

              <div className="flex gap-2">
                <button
                  className={`font-medium px-4 py-2 rounded-xl transition ${
                    canSave && !loading
                      ? 'bg-green-600 hover:bg-green-700 text-white'
                      : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                  }`}
                  disabled={!canSave || loading}
                  onClick={async () => {
                    if (hasExistingProject) {
                      await dispatch(updateProject({ id: selectedProjectId!, body: form })).unwrap()
                      // Also ensure quote is loaded after updating project
                      const quote: any = await dispatch(loadDraftQuote(selectedProjectId!)).unwrap()
                      dispatch(selectQuote(quote.id))
                      setIsEditing(false)
                    } else {
                      const created: any = await dispatch(createProject({ clientId: clientId!, body: form })).unwrap()
                      dispatch(selectProject(created.id))
                      const quote: any = await dispatch(loadDraftQuote(created.id)).unwrap()
                      dispatch(selectQuote(quote.id))
                      dispatch(setStep('areas'))
                    }
                  }}
                >
                  {loading ? 'Saving...' : hasExistingProject ? 'Save' : 'Save & Create Draft Quote'}
                </button>
                {hasExistingProject && (
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

