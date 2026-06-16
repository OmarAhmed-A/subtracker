import { useEffect, useState } from 'react'
import api from '../api'
import CurrencyToggle from './CurrencyToggle'
import SummaryCards from './SummaryCards'
import SubscriptionList from './SubscriptionList'
import SubscriptionForm from './SubscriptionForm'

export default function Dashboard() {
  const [subs, setSubs] = useState([])
  const [dashboard, setDashboard] = useState(null)
  const [currency, setCurrency] = useState('USD')
  const [showForm, setShowForm] = useState(false)
  const [editing, setEditing] = useState(null)

  const load = async () => {
    const [subsRes, dashRes] = await Promise.all([
      api.get('/subscriptions'),
      api.get(`/dashboard?currency=${currency}`),
    ])
    setSubs(subsRes.data)
    setDashboard(dashRes.data)
  }

  useEffect(() => {
    load()
  }, [currency])

  const handleSave = async (form) => {
    if (editing) {
      await api.put(`/subscriptions/${editing.id}`, form)
    } else {
      await api.post('/subscriptions', form)
    }
    setShowForm(false)
    setEditing(null)
    await load()
  }

  const handleDelete = async (id) => {
    if (!confirm('Delete this subscription?')) return
    await api.delete(`/subscriptions/${id}`)
    await load()
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Dashboard</h2>
        <CurrencyToggle value={currency} onChange={setCurrency} />
      </div>

      {dashboard && <SummaryCards dashboard={dashboard} currency={currency} />}

      {dashboard?.upcoming && (
        <div className="rounded-2xl border border-slate-800 bg-slate-900 p-4">
          <div className="text-sm text-slate-400">Upcoming renewal</div>
          <div className="mt-1 flex items-center justify-between">
            <span className="font-semibold">{dashboard.upcoming.name}</span>
            <span className="text-sm text-sky-400">{dashboard.upcoming.next_renewal}</span>
          </div>
        </div>
      )}

      <div>
        <h3 className="mb-3 text-sm font-medium uppercase tracking-wide text-slate-400">Subscriptions</h3>
        <SubscriptionList subscriptions={subs} onEdit={(sub) => { setEditing(sub); setShowForm(true) }} onDelete={handleDelete} />
      </div>

      <button onClick={() => { setEditing(null); setShowForm(true) }} className="fixed bottom-6 right-6 flex h-14 w-14 items-center justify-center rounded-full bg-sky-600 text-2xl text-white shadow-lg hover:bg-sky-500">
        +
      </button>

      {showForm && <SubscriptionForm subscription={editing} onSave={handleSave} onCancel={() => { setShowForm(false); setEditing(null) }} />}
    </div>
  )
}
