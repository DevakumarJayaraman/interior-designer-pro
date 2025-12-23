import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createArea, deleteArea, loadAreas } from '../../store/entitiesSlice'
import { setStep } from '../../store/wizardSlice'

export default function AreasStep() {
  const dispatch = useAppDispatch()
  const projectId = useAppSelector(s => s.wizard.selectedProjectId)
  const { areas, loading, error } = useAppSelector(s => s.entities)

  const [form, setForm] = useState({ name: '', type: 'Kitchen', notes: '', length: '', width: '', height: '' })

  useEffect(() => {
    if (projectId) dispatch(loadAreas(projectId))
  }, [dispatch, projectId])

  const canCreate = !!projectId && form.name.trim()

  return (
    <div>
      <SectionHeader
        title="3) Areas"
        subtitle="Add areas like Kitchen, Bedrooms, Living etc. Optionally add rough dimensions for planning."
      />

      {!projectId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100 px-4 py-3 text-sm">
          Select a project first.
        </div>
      )}

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="label mb-2">Add area</div>
          <div className="space-y-3">
            <input className="input" placeholder="Area name * (e.g., Master Bedroom)" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <select className="input" value={form.type} onChange={e => setForm({ ...form, type: e.target.value })}>
              <option>Kitchen</option><option>Bedroom</option><option>Living</option><option>Dining</option><option>Bathroom</option><option>Balcony</option>
            </select>
            <div className="grid grid-cols-3 gap-3">
              <input className="input" placeholder="L (mm)" value={form.length} onChange={e => setForm({ ...form, length: e.target.value })} />
              <input className="input" placeholder="W (mm)" value={form.width} onChange={e => setForm({ ...form, width: e.target.value })} />
              <input className="input" placeholder="H (mm)" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
            </div>
            <textarea className="input min-h-[90px]" placeholder="Notes" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

            <div className="flex gap-2">
              <button
                className="btn-primary"
                disabled={!canCreate || loading}
                onClick={async () => {
                  await dispatch(createArea({
                    projectId: projectId!,
                    body: {
                      name: form.name,
                      type: form.type,
                      notes: form.notes,
                      length: form.length ? Number(form.length) : undefined,
                      width: form.width ? Number(form.width) : undefined,
                      height: form.height ? Number(form.height) : undefined,
                    }
                  })).unwrap()
                  setForm({ name: '', type: form.type, notes: '', length: '', width: '', height: '' })
                  dispatch(loadAreas(projectId!))
                }}
              >
                {loading ? 'Saving...' : 'Add Area'}
              </button>
              <button className="btn-ghost" onClick={() => dispatch(setStep('dimensions'))}>Next: Dimensions</button>
            </div>

            <InlineError message={error} />
          </div>
        </div>

        <div>
          <div className="label mb-2">Areas in project</div>
          <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
            {areas.map(a => (
              <div key={a.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="flex items-start justify-between gap-3">
                  <div>
                    <div className="font-semibold">{a.name} <span className="chip ml-2">{a.type}</span></div>
                    {(a.length || a.width || a.height) && (
                      <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                        {a.length ?? '-'} × {a.width ?? '-'} × {a.height ?? '-'} mm
                      </div>
                    )}
                    {a.notes && <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">{a.notes}</div>}
                  </div>
                  <button
                    className="btn-ghost"
                    onClick={async () => {
                      await dispatch(deleteArea(a.id)).unwrap()
                    }}
                    title="Delete area"
                  >
                    ✕
                  </button>
                </div>
              </div>
            ))}
            {!areas.length && <div className="text-sm text-slate-500">No areas added yet.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
