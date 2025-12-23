import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import SectionHeader from './components/SectionHeader'
import InlineError from './components/InlineError'
import { useAppDispatch, useAppSelector } from '../store/hooks'
import { createProduct, loadProducts, loadTemplates } from '../store/entitiesSlice'

export default function ProductCatalog() {
  const dispatch = useAppDispatch()
  const navigate = useNavigate()
  const { products, templates, loading, error } = useAppSelector(s => s.entities)

  const [form, setForm] = useState({
    name: '',
    category: 'Wardrobe',
    pricingModel: 'PER_UNIT',
    unitRate: '0',
    description: '',
    templateId: ''
  })

  useEffect(() => {
    dispatch(loadProducts())
    dispatch(loadTemplates())
  }, [dispatch])

  const canCreate = form.name.trim()

  const filteredTemplates = templates.filter(t =>
    !form.category || t.category === form.category
  )

  const selectedTemplate = templates.find(t => t.id === Number(form.templateId))

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
        title="Product Catalog"
        subtitle="Manage your reusable products and pricing models. Link products to templates for automated cut-list generation."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="label mb-2">Add product</div>
          <div className="space-y-3">
            <input
              className="input"
              placeholder="Product name *"
              value={form.name}
              onChange={e => setForm({ ...form, name: e.target.value })}
            />
            <div className="grid grid-cols-2 gap-3">
              <select
                className="input"
                value={form.category}
                onChange={e => setForm({ ...form, category: e.target.value, templateId: '' })}
              >
                <option>Wardrobe</option>
                <option>Kitchen</option>
                <option>Living</option>
                <option>Bedroom</option>
                <option>Bathroom</option>
              </select>
              <select
                className="input"
                value={form.pricingModel}
                onChange={e => setForm({ ...form, pricingModel: e.target.value })}
              >
                <option>PER_UNIT</option>
                <option>AREA</option>
                <option>VOLUME</option>
                <option>RUNNING_FT</option>
              </select>
            </div>

            <select
              className="input"
              value={form.templateId}
              onChange={e => setForm({ ...form, templateId: e.target.value })}
            >
              <option value="">No template (basic product)</option>
              {filteredTemplates.map(t => (
                <option key={t.id} value={t.id}>{t.name} ({t.code})</option>
              ))}
            </select>

            {selectedTemplate && (
              <div className="text-xs text-slate-600 dark:text-slate-400 bg-blue-50 dark:bg-blue-900/20 p-3 rounded-lg">
                <strong>Template:</strong> {selectedTemplate.description}
              </div>
            )}

            <input
              className="input"
              placeholder="Unit rate (number)"
              value={form.unitRate}
              onChange={e => setForm({ ...form, unitRate: e.target.value })}
            />
            <textarea
              className="input min-h-[90px]"
              placeholder="Description"
              value={form.description}
              onChange={e => setForm({ ...form, description: e.target.value })}
            />

            <button
              className="btn-primary"
              disabled={!canCreate || loading}
              onClick={async () => {
                const payload: any = {
                  name: form.name,
                  category: form.category,
                  pricingModel: form.pricingModel,
                  unitRate: Number(form.unitRate || 0),
                  description: form.description
                }
                if (form.templateId) {
                  payload.template = { id: Number(form.templateId) }
                }
                await dispatch(createProduct(payload)).unwrap()
                setForm({ name: '', category: 'Wardrobe', pricingModel: 'PER_UNIT', unitRate: '0', description: '', templateId: '' })
                dispatch(loadProducts())
              }}
            >
              {loading ? 'Saving...' : 'Add Product'}
            </button>

            <InlineError message={error} />
          </div>
        </div>

        <div>
          <div className="label mb-2">Existing Products ({products.length})</div>
          <div className="space-y-2 max-h-[400px] overflow-auto pr-1">
            {products.map(p => (
              <div key={p.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {p.category ?? '-'} • {p.pricingModel ?? 'PER_UNIT'} • rate: ₹{p.unitRate ?? 0}
                  {p.template && <span className="ml-2 text-blue-600 dark:text-blue-400">🔧 {p.template.code}</span>}
                </div>
                {p.description && <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">{p.description}</div>}
              </div>
            ))}
            {!products.length && <div className="text-sm text-slate-500">No products found. Add your first product above.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}

