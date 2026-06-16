import { useEffect, useState } from 'react'
import { CYCLE_LABELS } from './SubscriptionList'

export default function SubscriptionForm({ subscription, onSave, onCancel }) {
  const [form, setForm] = useState({
    name: '',
    cost: '',
    currency: 'USD',
    cycle: 'monthly',
    next_renewal: '',
    category: 'Entertainment',
    notes: '',
  })

  useEffect(() => {
    if (subscription) {
      setForm({
        name: subscription.name,
        cost: subscription.cost,
        currency: subscription.currency,
        cycle: subscription.cycle,
        next_renewal: subscription.next_renewal,
        category: subscription.category,
        notes: subscription.notes || '',
      })
    }
  }, [subscription])

  const update = (key, value) => setForm((f) => ({ ...f, [key]: value }))

  const submit = (e) => {
    e.preventDefault()
    onSave(form)
  }

  return (
    <div className="fixed inset-0 z-20 flex items-end bg-black/60 sm:items-center sm:justify-center">
      <form onSubmit={submit} className="h-[90vh] w-full overflow-y-auto rounded-t-3xl bg-slate-900 p-6 sm:h-auto sm:max-w-md sm:rounded-3xl">
        <h2 className="mb-6 text-xl font-bold">{subscription ? 'Edit' : 'Add'} subscription</h2>
        <label className="mb-2 block text-sm text-slate-400">Name</label>
        <input value={form.name} onChange={(e) => update('name', e.target.value)} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" required />

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Cost</label>
            <input type="number" step="0.01" value={form.cost} onChange={(e) => update('cost', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" required />
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">Currency</label>
            <select value={form.currency} onChange={(e) => update('currency', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500">
              <option value="EGP">EGP</option>
              <option value="USD">USD</option>
            </select>
          </div>
        </div>

        <div className="mb-4 grid grid-cols-2 gap-4">
          <div>
            <label className="mb-2 block text-sm text-slate-400">Cycle</label>
            <select value={form.cycle} onChange={(e) => update('cycle', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500">
              {Object.entries(CYCLE_LABELS).map(([value, label]) => (
                <option key={value} value={value}>{label}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="mb-2 block text-sm text-slate-400">Next renewal</label>
            <input type="date" value={form.next_renewal} onChange={(e) => update('next_renewal', e.target.value)} className="w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" required />
          </div>
        </div>

        <label className="mb-2 block text-sm text-slate-400">Category</label>
        <input value={form.category} onChange={(e) => update('category', e.target.value)} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" />

        <label className="mb-2 block text-sm text-slate-400">Notes</label>
        <textarea value={form.notes} onChange={(e) => update('notes', e.target.value)} className="mb-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500" rows={3} />

        <div className="flex gap-3">
          <button type="button" onClick={onCancel} className="flex-1 rounded-xl border border-slate-700 py-3 font-medium text-slate-300 hover:bg-slate-800">Cancel</button>
          <button type="submit" className="flex-1 rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500">Save</button>
        </div>
      </form>
    </div>
  )
}
