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
        subtitle="Template-driven cutlist generation. Each product generates multiple parts with detailed specifications."
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
              <div className="flex-1">
                <div className="flex items-center gap-2 flex-wrap">
                  <div className="font-semibold">{c.partName}</div>
                  {c.partType && (
                    <span className="text-xs bg-slate-100 dark:bg-slate-800 px-2 py-0.5 rounded">
                      {c.partType}
                    </span>
                  )}
                  <span className="chip">Item #{c.quoteItem?.id ?? '-'}</span>
                </div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  Qty {c.quantity} • {c.cutHeight ?? '-'} × {c.cutWidth ?? '-'} mm • Thk {c.thickness ?? '-'} mm
                </div>
                {c.materialType && (
                  <div className="text-xs text-blue-600 dark:text-blue-400 mt-1.5">
                    📦 Material: {c.materialType}
                  </div>
                )}
                <div className="flex gap-3 mt-1">
                  {c.edgeBanding && (
                    <div className="text-xs text-green-600 dark:text-green-400">
                      🔲 Edge: {c.edgeBanding}
                    </div>
                  )}
                  {c.grainDirection && (
                    <div className="text-xs text-amber-600 dark:text-amber-400">
                      ↔ Grain: {c.grainDirection}
                    </div>
                  )}
                </div>
              </div>
            </div>
          </div>
        ))}
        {!cutlist.length && <div className="text-sm text-slate-500">No cutlist yet. Generate it.</div>}
      </div>
    </div>
  )
}
