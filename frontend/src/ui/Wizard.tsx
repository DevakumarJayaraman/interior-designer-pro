import { useMemo } from 'react'
import { useNavigate } from 'react-router-dom'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { setStep, type WizardStep } from '../store/wizardSlice'
import ContextCard from './components/ContextCard'
import ClientStep from './steps/ClientStep'
import ProjectStep from './steps/ProjectStep'
import AreasStep from './steps/AreasStep'
import DimensionsStep from './steps/DimensionsStep'
import QuotationStep from './steps/QuotationStep'
import CutlistStep from './steps/CutlistStep'
import MaterialStep from './steps/MaterialStep'

const steps: { key: WizardStep; label: string; hint: string }[] = [
  { key: 'client', label: 'Client', hint: 'Onboard client details' },
  { key: 'project', label: 'Project', hint: 'Capture site + scope' },
  { key: 'areas', label: 'Areas', hint: 'Rooms & rough dimensions' },
  { key: 'dimensions', label: 'Dimensions', hint: 'Add products to areas with sizes' },
  { key: 'quotation', label: 'Quotation', hint: 'Compute totals & submit' },
  { key: 'cutlist', label: 'Cutlist', hint: 'Generate manufacturing list' },
  { key: 'material', label: 'Material', hint: 'Sheets + wastage estimate' },
]

export default function Wizard() {
  const step = useAppSelector(s => s.wizard.step)
  const dispatch = useAppDispatch()
  const navigate = useNavigate()

  const current = useMemo(() => steps.find(s => s.key === step) ?? steps[0], [step])

  return (
    <div>
      {/* Breadcrumb */}
      <div className="mb-4">
        <button
          onClick={() => navigate('/')}
          className="text-sm text-slate-500 hover:text-slate-700 dark:text-slate-400 dark:hover:text-slate-300 transition"
        >
          ← Back to Dashboard
        </button>
      </div>

      <ContextCard />

      <div className="grid grid-cols-1 lg:grid-cols-12 gap-4">
        <aside className="lg:col-span-4">
        <div className="card p-4">
          <div className="text-sm font-semibold">Workflow</div>
          <div className="mt-1 text-xs text-slate-500 dark:text-slate-400">{current.hint}</div>

          <div className="mt-4 space-y-2">
            {steps.map(s => (
              <button
                key={s.key}
                onClick={() => dispatch(setStep(s.key))}
                className={[
                  'w-full text-left rounded-2xl px-4 py-3 transition border',
                  step === s.key
                    ? 'bg-slate-900 text-white border-slate-900 dark:bg-slate-50 dark:text-slate-900 dark:border-slate-50'
                    : 'bg-transparent border-slate-200 dark:border-slate-800 hover:bg-slate-100 dark:hover:bg-slate-800'
                ].join(' ')}
              >
                <div className="text-sm font-semibold">{s.label}</div>
                <div className="text-xs opacity-80">{s.hint}</div>
              </button>
            ))}
          </div>
        </div>
      </aside>

      <section className="lg:col-span-8">
        <div className="card p-5">
          {step === 'client' && <ClientStep />}
          {step === 'project' && <ProjectStep />}
          {step === 'areas' && <AreasStep />}
          {step === 'dimensions' && <DimensionsStep />}
          {step === 'quotation' && <QuotationStep />}
          {step === 'cutlist' && <CutlistStep />}
          {step === 'material' && <MaterialStep />}
        </div>
      </section>
    </div>
    </div>
  )
}
