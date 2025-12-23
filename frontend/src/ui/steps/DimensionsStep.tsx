import { useEffect, useMemo, useState } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { addQuoteItem, deleteQuoteItem, loadAreas, loadProducts, loadQuoteItems, loadProductTemplateParams, recalcQuote } from '../../store/entitiesSlice'
import { setStep } from '../../store/wizardSlice'

export default function DimensionsStep() {
  const dispatch = useAppDispatch()
  const { areas, products, quoteItems, templateParams, loading, error, quotes } = useAppSelector(s => s.entities)
  const projectId = useAppSelector(s => s.wizard.selectedProjectId)
  const quoteId = useAppSelector(s => s.wizard.selectedQuoteId)

  const quote = useMemo(() => quotes.find(q => q.id === quoteId), [quotes, quoteId])

  const [form, setForm] = useState({
    areaId: 0,
    productId: 0,
    quantity: '1',
    height: '',
    width: '',
    depth: '',
    notes: '',
  })
  const [templateParamValues, setTemplateParamValues] = useState<Record<string, string>>({})
  const [editingItemId, setEditingItemId] = useState<number | null>(null)

  useEffect(() => {
    if (projectId) dispatch(loadAreas(projectId))
    dispatch(loadProducts())
  }, [dispatch, projectId])

  useEffect(() => {
    if (quoteId) dispatch(loadQuoteItems(quoteId))
  }, [dispatch, quoteId])

  useEffect(() => {
    if (areas.length && !form.areaId) setForm(f => ({ ...f, areaId: areas[0]!.id }))
  }, [areas])

  useEffect(() => {
    if (products.length && !form.productId) setForm(f => ({ ...f, productId: products[0]!.id }))
  }, [products])

  // Load template params when product changes
  useEffect(() => {
    if (form.productId && !editingItemId) {
      dispatch(loadProductTemplateParams(form.productId))
    }
  }, [dispatch, form.productId, editingItemId])

  // Initialize template param values with defaults
  useEffect(() => {
    const defaults: Record<string, string> = {}
    templateParams.forEach(param => {
      if (param.defaultValue !== undefined && param.defaultValue !== null) {
        defaults[param.paramName] = String(param.defaultValue)
      }
    })
    setTemplateParamValues(defaults)
  }, [templateParams])

  const selectedProduct = useMemo(() =>
    products.find(p => p.id === form.productId),
    [products, form.productId]
  )

  // Get products already added to the selected area (for display/grouping purposes)
  const productsInSelectedArea = useMemo(() => {
    if (!form.areaId) return new Set<number>()

    return new Set(
      quoteItems
        .filter(item => item.area.id === form.areaId)
        .map(item => item.product.id)
    )
  }, [form.areaId, quoteItems])

  // Filter quote items by selected area
  const filteredQuoteItems = useMemo(() => {
    if (!form.areaId) return quoteItems
    return quoteItems.filter(item => item.area.id === form.areaId)
  }, [form.areaId, quoteItems])

  const handleEditItem = (item: any) => {
    setForm({
      areaId: item.area.id,
      productId: item.product.id,
      quantity: String(item.quantity),
      height: item.height ? String(item.height) : '',
      width: item.width ? String(item.width) : '',
      depth: item.depth ? String(item.depth) : '',
      notes: item.notes || '',
    })
    setEditingItemId(item.id)
  }

  const handleCancelEdit = () => {
    setForm({
      areaId: form.areaId, // Keep the area selected
      productId: products.length ? products[0].id : 0,
      quantity: '1',
      height: '',
      width: '',
      depth: '',
      notes: '',
    })
    setEditingItemId(null)
  }

  const canAdd = !!quoteId && form.areaId && form.productId && Number(form.quantity) > 0

  return (
    <div>
      <SectionHeader
        title="5) Add Products + Dimensions"
        subtitle="Select area + product and capture dimensions (mm). This builds the draft quotation items."
      />

      {!quoteId && (
        <div className="rounded-2xl border border-amber-200 bg-amber-50 text-amber-900 dark:border-amber-900/60 dark:bg-amber-950/40 dark:text-amber-100 px-4 py-3 text-sm">
          Create/select a project to auto-create a draft quote.
        </div>
      )}

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 mt-4">
        <div>
          <div className="label mb-2">{editingItemId ? 'Edit quote item' : 'Add quote item'}</div>
          <div className="space-y-3">
            <div className="grid grid-cols-2 gap-3">
              <select className="input" value={form.areaId} onChange={e => setForm({ ...form, areaId: Number(e.target.value) })} disabled={!!editingItemId}>
                {areas.map(a => <option key={a.id} value={a.id}>{a.name} ({a.type})</option>)}
              </select>
              <select className="input" value={form.productId} onChange={e => setForm({ ...form, productId: Number(e.target.value) })} disabled={!!editingItemId}>
                {products.map(p => (
                  <option key={p.id} value={p.id}>
                    {p.name}{productsInSelectedArea.has(p.id) ? ' ✓' : ''}
                  </option>
                ))}
              </select>
            </div>

            <div className="grid grid-cols-4 gap-3">
              <input className="input" placeholder="Qty" value={form.quantity} onChange={e => setForm({ ...form, quantity: e.target.value })} />
              <input className="input" placeholder="H (mm)" value={form.height} onChange={e => setForm({ ...form, height: e.target.value })} />
              <input className="input" placeholder="W (mm)" value={form.width} onChange={e => setForm({ ...form, width: e.target.value })} />
              <input className="input" placeholder="D/Thk (mm)" value={form.depth} onChange={e => setForm({ ...form, depth: e.target.value })} />
            </div>

            {/* Template Parameters Section */}
            {selectedProduct?.template && templateParams.length > 0 && (
              <div className="rounded-xl border border-blue-200 dark:border-blue-800 bg-blue-50 dark:bg-blue-950/30 p-4">
                <div className="text-sm font-semibold text-blue-900 dark:text-blue-100 mb-3">
                  🔧 Template Parameters ({selectedProduct.template.name})
                </div>
                <div className="grid grid-cols-2 gap-3">
                  {templateParams.map(param => (
                    <div key={param.id}>
                      <label className="text-xs text-slate-600 dark:text-slate-400 block mb-1">
                        {param.displayLabel}
                        {param.required && <span className="text-red-500 ml-1">*</span>}
                      </label>
                      <input
                        type="number"
                        className="input text-sm"
                        placeholder={param.helpText || param.displayLabel}
                        value={templateParamValues[param.paramName] || ''}
                        min={param.minValue ?? undefined}
                        max={param.maxValue ?? undefined}
                        onChange={e => setTemplateParamValues({
                          ...templateParamValues,
                          [param.paramName]: e.target.value
                        })}
                      />
                      {param.helpText && (
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">{param.helpText}</div>
                      )}
                    </div>
                  ))}
                </div>
              </div>
            )}

            <textarea className="input min-h-[90px]" placeholder="Notes (e.g., drawers, shelves, accessories)" value={form.notes} onChange={e => setForm({ ...form, notes: e.target.value })} />

            <div className="flex flex-wrap gap-2">
              {editingItemId ? (
                <>
                  <button
                    className={`font-medium px-4 py-2 rounded-xl transition ${
                      canAdd && !loading
                        ? 'bg-green-600 hover:bg-green-700 text-white'
                        : 'bg-slate-300 text-slate-500 cursor-not-allowed dark:bg-slate-700 dark:text-slate-500'
                    }`}
                    disabled={!canAdd || loading}
                    onClick={async () => {
                      // Delete old item and add updated one
                      await dispatch(deleteQuoteItem(editingItemId)).unwrap()

                      const templateParamsObj: Record<string, number> = {}
                      Object.entries(templateParamValues).forEach(([key, val]) => {
                        if (val) templateParamsObj[key] = Number(val)
                      })

                      await dispatch(addQuoteItem({
                        quoteId: quoteId!,
                        areaId: form.areaId,
                        productId: form.productId,
                        body: {
                          quantity: Number(form.quantity || 1),
                          height: form.height ? Number(form.height) : undefined,
                          width: form.width ? Number(form.width) : undefined,
                          depth: form.depth ? Number(form.depth) : undefined,
                          notes: form.notes,
                          templateParamsJson: Object.keys(templateParamsObj).length > 0
                            ? JSON.stringify(templateParamsObj)
                            : undefined
                        }
                      })).unwrap()
                      await dispatch(recalcQuote(quoteId!))
                      handleCancelEdit()
                    }}
                  >
                    {loading ? 'Updating...' : 'Update Item'}
                  </button>
                  <button className="btn-ghost" onClick={handleCancelEdit}>
                    Cancel
                  </button>
                </>
              ) : (
                <button
                  className="btn-primary"
                  disabled={!canAdd || loading}
                  onClick={async () => {
                    const templateParamsObj: Record<string, number> = {}
                    Object.entries(templateParamValues).forEach(([key, val]) => {
                      if (val) templateParamsObj[key] = Number(val)
                    })

                    await dispatch(addQuoteItem({
                      quoteId: quoteId!,
                      areaId: form.areaId,
                      productId: form.productId,
                      body: {
                        quantity: Number(form.quantity || 1),
                        height: form.height ? Number(form.height) : undefined,
                        width: form.width ? Number(form.width) : undefined,
                        depth: form.depth ? Number(form.depth) : undefined,
                        notes: form.notes,
                        templateParamsJson: Object.keys(templateParamsObj).length > 0
                          ? JSON.stringify(templateParamsObj)
                          : undefined
                      }
                    })).unwrap()
                    await dispatch(recalcQuote(quoteId!))
                    setForm({ ...form, quantity: '1', height: '', width: '', depth: '', notes: '' })
                    // Reset template params to defaults
                    const defaults: Record<string, string> = {}
                    templateParams.forEach(param => {
                      if (param.defaultValue !== undefined) defaults[param.paramName] = String(param.defaultValue)
                    })
                    setTemplateParamValues(defaults)
                  }}
                >
                  {loading ? 'Adding...' : 'Add to Quote'}
                </button>
              )}

              <button className="btn-ghost" onClick={() => quoteId && dispatch(recalcQuote(quoteId))}>
                Recalculate
              </button>

              <button className="btn-ghost" onClick={() => dispatch(setStep('quotation'))}>
                Next: Quotation
              </button>
            </div>

            {quote && (
              <div className="mt-3 rounded-2xl border border-slate-200 dark:border-slate-800 p-4 text-sm">
                <div className="font-semibold">Draft Quote Total</div>
                <div className="text-2xl font-semibold mt-1">₹ {Math.round((quote.totalPrice ?? 0) * 100) / 100}</div>
                <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">Quote #{quote.id} • Status: {quote.status}</div>
              </div>
            )}

            <InlineError message={error} />
          </div>
        </div>

        <div>
          <div className="label mb-2">
            {form.areaId ? `Items in ${areas.find(a => a.id === form.areaId)?.name || 'Selected Area'}` : 'Current quote items'}
          </div>
          <div className="space-y-2 max-h-[420px] overflow-auto pr-1">
            {filteredQuoteItems.map(i => (
              <div key={i.id} className={`rounded-2xl border p-4 ${editingItemId === i.id ? 'border-blue-500 bg-blue-50 dark:bg-blue-950' : 'border-slate-200 dark:border-slate-800'}`}>
                <div className="flex items-start justify-between gap-3">
                  <div className="flex-1">
                    <div className="font-semibold">{i.product.name} <span className="chip ml-2">{i.area.name}</span></div>
                    <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                      Qty {i.quantity} • {i.height ?? '-'} × {i.width ?? '-'} × {i.depth ?? '-'} mm
                    </div>
                    {i.notes && <div className="text-sm text-slate-500 dark:text-slate-400 mt-2">{i.notes}</div>}
                    <div className="mt-2 text-sm font-semibold">₹ {Math.round((i.computedPrice ?? 0) * 100) / 100}</div>
                  </div>
                  <div className="flex gap-1">
                    <button
                      className="text-xs text-blue-600 hover:text-blue-700 dark:text-blue-400 dark:hover:text-blue-300 px-2 py-1"
                      title="Edit"
                      onClick={() => handleEditItem(i)}
                    >
                      ✎
                    </button>
                    <button
                      className="text-xs text-red-600 hover:text-red-700 dark:text-red-400 dark:hover:text-red-300 px-2 py-1"
                      title="Remove"
                      onClick={async () => {
                        if (editingItemId === i.id) handleCancelEdit()
                        await dispatch(deleteQuoteItem(i.id)).unwrap()
                        quoteId && dispatch(recalcQuote(quoteId))
                      }}
                    >
                      ✕
                    </button>
                  </div>
                </div>
              </div>
            ))}
            {!filteredQuoteItems.length && (
              <div className="text-sm text-slate-500">
                {form.areaId ? 'No items added to this area yet.' : 'No items added yet.'}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}
