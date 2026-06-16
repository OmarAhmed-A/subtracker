import { useEffect, useState } from 'react'
import api from '../api'

export default function Settings({ onBack }) {
  const [rate, setRate] = useState('')
  const [loading, setLoading] = useState(true)
  const [saving, setSaving] = useState(false)
  const [message, setMessage] = useState('')
  const [error, setError] = useState('')

  useEffect(() => {
    api.get('/settings')
      .then((data) => {
        setRate(data.usd_to_egp)
        setLoading(false)
      })
      .catch((err) => {
        setError(err.response?.data?.detail || 'Failed to load settings')
        setLoading(false)
      })
  }, [])

  const save = async (e) => {
    e.preventDefault()
    setSaving(true)
    setMessage('')
    setError('')
    try {
      await api.put('/settings/usd-to-egp', { rate: parseFloat(rate) })
      setMessage('Exchange rate saved')
    } catch (err) {
      setError(err.response?.data?.detail || 'Failed to save')
    } finally {
      setSaving(false)
    }
  }

  if (loading) return <p className="text-center text-slate-400">Loading...</p>

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <h2 className="text-xl font-bold">Settings</h2>
        <button onClick={onBack} className="text-sm text-slate-400 hover:text-slate-100">Back</button>
      </div>

      <form onSubmit={save} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h3 className="mb-2 font-semibold">Exchange Rate</h3>
        <p className="mb-4 text-sm text-slate-400">
          How many EGP one USD is worth. Used when toggling the dashboard to EGP.
        </p>

        {message && <p className="mb-4 text-sm text-emerald-400">{message}</p>}
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}

        <label className="mb-2 block text-sm text-slate-400">USD to EGP</label>
        <input
          type="number"
          step="0.01"
          value={rate}
          onChange={(e) => setRate(e.target.value)}
          className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 outline-none focus:border-sky-500"
          required
        />

        <button
          type="submit"
          disabled={saving}
          className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500 disabled:opacity-50"
        >
          {saving ? 'Saving...' : 'Save rate'}
        </button>

        <p className="mt-4 text-xs text-slate-500">
          The app automatically updates this rate once per day from Exchange Rate API. You can override it here.
        </p>
      </form>
    </div>
  )
}
