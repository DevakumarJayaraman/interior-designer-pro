import { useEffect } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loadMaterial } from '../../store/entitiesSlice'

export default function MaterialStep() {
  const dispatch = useAppDispatch()
  const quoteId = useAppSelector(s => s.wizard.selectedQuoteId)
  const { material, loading, error } = useAppSelector(s => s.entities)

  useEffect(() => { if (quoteId) dispatch(loadMaterial(quoteId)) }, [dispatch, quoteId])

  return (
    <div>
      <SectionHeader
        title="8) Material Usage & Cutting Strategy"
        subtitle="Starter estimation using standard 8×4 sheet (2440×1220 mm). Next iteration: sheet nesting, kerf, grain direction, and optimal cutting."
      />

      {!quoteId && <div className="text-sm text-slate-500">Select project first.</div>}

      <div className="flex gap-2 mt-2">
        <button className="btn-primary" disabled={!quoteId || loading} onClick={() => quoteId && dispatch(loadMaterial(quoteId))}>
          {loading ? 'Loading...' : 'Refresh Summary'}
        </button>
      </div>

      <InlineError message={error} />

      {material && (
        <div className="mt-5 grid grid-cols-1 md:grid-cols-4 gap-3">
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Total Part Area</div>
            <div className="text-lg font-semibold">{Math.round(material.totalPartAreaMm2).toLocaleString()} mm²</div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Sheet Area (8×4)</div>
            <div className="text-lg font-semibold">{Math.round(material.sheetAreaMm2).toLocaleString()} mm²</div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Sheets Needed</div>
            <div className="text-lg font-semibold">{material.sheetCount}</div>
          </div>
          <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
            <div className="text-xs text-slate-500 dark:text-slate-400">Wastage</div>
            <div className="text-lg font-semibold">{Math.round(material.wastagePercent * 100) / 100}%</div>
          </div>
        </div>
      )}

      {!material && <div className="mt-4 text-sm text-slate-500">Generate cutlist first, then material summary will be meaningful.</div>}
    </div>
  )
}
