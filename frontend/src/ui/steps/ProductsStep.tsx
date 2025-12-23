import { useEffect, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { createProduct, loadProducts } from '../../store/entitiesSlice'
import { setStep } from '../../store/wizardSlice'

export default function ProductsStep() {
  const dispatch = useAppDispatch()
  const { products, loading, error } = useAppSelector(s => s.entities)

  const [form, setForm] = useState({
    name: '',
    category: 'Wardrobe',
    pricingModel: 'PER_UNIT',
    unitRate: '0',
    description: ''
  })

  useEffect(() => { dispatch(loadProducts()) }, [dispatch])

  const canCreate = form.name.trim()

  return (
    <div>
      <SectionHeader
        title="4) Product Catalog"
        subtitle="Add reusable products and a basic pricing model. Later we’ll extend this with templates and BOM rules."
      />

      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <div>
          <div className="label mb-2">Add product</div>
          <div className="space-y-3">
            <input className="input" placeholder="Product name *" value={form.name} onChange={e => setForm({ ...form, name: e.target.value })} />
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.category} onChange={e => setForm({ ...form, category: e.target.value })}>
                <option>Wardrobe</option><option>Kitchen</option><option>Living</option><option>Bedroom</option><option>Bathroom</option>
              </select>
              <select className="input" value={form.pricingModel} onChange={e => setForm({ ...form, pricingModel: e.target.value })}>
                <option>PER_UNIT</option><option>AREA</option><option>VOLUME</option><option>RUNNING_FT</option>
              </select>
            </div>
            <input className="input" placeholder="Unit rate (number)" value={form.unitRate} onChange={e => setForm({ ...form, unitRate: e.target.value })} />
            <textarea className="input min-h-[90px]" placeholder="Description" value={form.description} onChange={e => setForm({ ...form, description: e.target.value })} />

            <div className="flex gap-2">
              <button
                className="btn-primary"
                disabled={!canCreate || loading}
                onClick={async () => {
                  await dispatch(createProduct({
                    name: form.name,
                    category: form.category,
                    pricingModel: form.pricingModel,
                    unitRate: Number(form.unitRate || 0),
                    description: form.description
                  })).unwrap()
                  setForm({ ...form, name: '', description: '' })
                  dispatch(loadProducts())
                }}
              >
                {loading ? 'Saving...' : 'Add Product'}
              </button>
              <button className="btn-ghost" onClick={() => dispatch(setStep('dimensions'))}>Next: Dimensions</button>
            </div>

            <InlineError message={error} />
          </div>
        </div>

        <div>
          <div className="label mb-2">Products</div>
          <div className="space-y-2 max-h-[360px] overflow-auto pr-1">
            {products.map(p => (
              <div key={p.id} className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
                <div className="font-semibold">{p.name}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                  {p.category ?? '-'} • {p.pricingModel ?? 'PER_UNIT'} • rate: {p.unitRate ?? 0}
                </div>
                {p.description && <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">{p.description}</div>}
              </div>
            ))}
            {!products.length && <div className="text-sm text-slate-500">No products found.</div>}
          </div>
        </div>
      </div>
    </div>
  )
}
