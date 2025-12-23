import { useEffect } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { generateCutlist, loadCutlist } from '../../store/entitiesSlice'
import { setStep } from '../../store/wizardSlice'

export default function CutlistStep() {
  const dispatch = useAppDispatch()
  const quoteId = useAppSelector(s => s.wizard.selectedQuoteId)
  const { cutlist, loading, error } = useAppSelector(s => s.entities)

  useEffect(() => { if (quoteId) dispatch(loadCutlist(quoteId)) }, [dispatch, quoteId])

  return (
    <div>
      <SectionHeader
        title="7) Cutlist"
        subtitle="Starter cutlist generation (1 cut-part per quote item). Next iteration will expand templates into panels, shutters, shelves, etc."
      />

      {!quoteId && <div className="text-sm text-slate-500">Select project first.</div>}

      <div className="flex flex-wrap gap-2 mt-2">
        <button
          className="btn-primary"
          disabled={!quoteId || loading}
          onClick={async () => {
            await dispatch(generateCutlist(quoteId!)).unwrap()
          }}
        >
          {loading ? 'Generating...' : 'Generate Cutlist'}
        </button>
        <button className="btn-ghost" onClick={() => quoteId && dispatch(loadCutlist(quoteId))}>
          Refresh
        </button>
        <button className="btn-ghost" onClick={() => dispatch(setStep('material'))}>
          Next: Material Usage
        </button>
      </div>

      <InlineError message={error} />

      <div className="mt-5 space-y-2">
        {cutlist.map(c => (
          <div key={c.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <div className="font-semibold">{c.partName}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Qty {c.quantity} • {c.cutHeight ?? '-'} × {c.cutWidth ?? '-'} mm • Thk {c.thickness ?? '-'} mm
                </div>
              </div>
              <span className="chip">Item #{c.quoteItem?.id ?? '-'}</span>
            </div>
          </div>
        ))}
        {!cutlist.length && <div className="text-sm text-slate-500">No cutlist yet. Generate it.</div>}
      </div>
    </div>
  )
}
