import { useEffect, useMemo } from 'react'
import SectionHeader from '../components/SectionHeader'
import InlineError from '../components/InlineError'
import { useAppDispatch, useAppSelector } from '../../store/hooks'
import { loadQuoteItems, recalcQuote, submitQuote } from '../../store/entitiesSlice'
import { setStep } from '../../store/wizardSlice'

export default function QuotationStep() {
  const dispatch = useAppDispatch()
  const { quoteItems, quotes, loading, error } = useAppSelector(s => s.entities)
  const quoteId = useAppSelector(s => s.wizard.selectedQuoteId)

  const quote = useMemo(() => quotes.find(q => q.id === quoteId), [quotes, quoteId])

  // Group quote items by area
  const itemsByArea = useMemo(() => {
    const grouped = new Map<number, { areaName: string; items: any[]; total: number }>()

    quoteItems.forEach(item => {
      const areaId = item.area.id
      if (!grouped.has(areaId)) {
        grouped.set(areaId, {
          areaName: item.area.name,
          items: [],
          total: 0
        })
      }
      const group = grouped.get(areaId)!
      group.items.push(item)
      group.total += item.computedPrice ?? 0
    })

    return Array.from(grouped.entries()).map(([areaId, data]) => ({
      areaId,
      ...data
    }))
  }, [quoteItems])

  useEffect(() => {
    if (quoteId) dispatch(loadQuoteItems(quoteId))
  }, [dispatch, quoteId])

  if (!quoteId) {
    return (
      <div>
        <SectionHeader title="6) Quotation" />
        <div className="text-sm text-slate-500">Select project to create/load a draft quotation.</div>
      </div>
    )
  }

  if (!quote) {
    return (
      <div>
        <SectionHeader title="6) Quotation" />
        <div className="text-sm text-slate-500">Loading quote...</div>
      </div>
    )
  }

  return (
    <div>
      <SectionHeader
        title="6) High-level Quotation"
        subtitle="Review totals. This is a starter quote model; you can extend into taxes, discounts, and line-item pricing rules."
      />

      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Quote ID</div>
          <div className="text-lg font-semibold">{quote.id}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Items</div>
          <div className="text-lg font-semibold">{quoteItems.length}</div>
        </div>
        <div className="rounded-2xl border border-slate-200 dark:border-slate-800 p-4">
          <div className="text-xs text-slate-500 dark:text-slate-400">Total</div>
          <div className="text-lg font-semibold">₹ {Math.round((quote.totalPrice ?? 0) * 100) / 100}</div>
        </div>
      </div>

      <div className="mt-4 flex flex-wrap gap-2">
        <button className="btn-primary" disabled={loading} onClick={() => dispatch(recalcQuote(quoteId))}>
          {loading ? 'Working...' : 'Recalculate Total'}
        </button>
        <button
          className="btn-ghost"
          disabled={loading || quote.status !== 'DRAFT'}
          onClick={async () => {
            await dispatch(submitQuote(quoteId)).unwrap()
          }}
        >
          Submit Quote
        </button>
        <button className="btn-ghost" onClick={() => dispatch(setStep('cutlist'))}>
          Next: Cutlist
        </button>
      </div>

      <InlineError message={error} />

      <div className="mt-6">
        <div className="label mb-3">Items by Area</div>
        {itemsByArea.length === 0 ? (
          <div className="text-sm text-slate-500">No items added yet. Go back to Dimensions step to add products.</div>
        ) : (
          <div className="space-y-4">
            {itemsByArea.map(({ areaId, areaName, items, total }) => (
              <div key={areaId} className="card p-4 border border-slate-200 dark:border-slate-800">
                {/* Area Header */}
                <div className="flex items-center justify-between mb-3 pb-2 border-b border-slate-200 dark:border-slate-700">
                  <h3 className="font-semibold text-lg">{areaName}</h3>
                  <div className="text-sm">
                    <span className="text-slate-500 dark:text-slate-400">Area Total: </span>
                    <span className="font-semibold text-lg">₹ {Math.round(total * 100) / 100}</span>
                  </div>
                </div>

                {/* Items in this area */}
                <div className="space-y-2">
                  {items.map(item => (
                    <div key={item.id} className="flex items-start justify-between gap-3 p-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-900 transition">
                      <div className="flex-1">
                        <div className="font-medium">{item.product.name}</div>
                        <div className="text-xs text-slate-500 dark:text-slate-400 mt-1">
                          Qty: {item.quantity} • Dimensions: {item.height ?? '-'} × {item.width ?? '-'} × {item.depth ?? '-'} mm
                        </div>
                        {item.notes && (
                          <div className="text-xs text-slate-600 dark:text-slate-400 mt-1">
                            📝 {item.notes}
                          </div>
                        )}
                      </div>
                      <div className="font-semibold text-slate-900 dark:text-slate-100">
                        ₹ {Math.round((item.computedPrice ?? 0) * 100) / 100}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            ))}

            {/* Grand Total Card */}
            <div className="card p-5 bg-gradient-to-r from-blue-50 to-blue-100 dark:from-blue-950 dark:to-blue-900 border-2 border-blue-300 dark:border-blue-700">
              <div className="flex items-center justify-between">
                <div>
                  <div className="text-sm text-blue-700 dark:text-blue-300 mb-1">Grand Total</div>
                  <div className="text-xs text-blue-600 dark:text-blue-400">
                    {quoteItems.length} item(s) across {itemsByArea.length} area(s)
                  </div>
                </div>
                <div className="text-3xl font-bold text-blue-900 dark:text-blue-100">
                  ₹ {Math.round((quote.totalPrice ?? 0) * 100) / 100}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  )
}
