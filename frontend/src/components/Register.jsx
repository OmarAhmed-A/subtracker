import { useState } from 'react'
import { useAuth } from '../auth.jsx'

export default function Register({ onToggle }) {
  const [username, setUsername] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const { register } = useAuth()

  const submit = async (e) => {
    e.preventDefault()
    setError('')
    try {
      await register(username, password)
    } catch (err) {
      setError(err.response?.data?.detail || 'Registration failed')
    }
  }

  return (
    <div className="flex min-h-[60vh] flex-col justify-center">
      <form onSubmit={submit} className="rounded-2xl border border-slate-800 bg-slate-900 p-6">
        <h2 className="mb-6 text-2xl font-bold">Create account</h2>
        {error && <p className="mb-4 text-sm text-red-400">{error}</p>}
        <label className="mb-2 block text-sm text-slate-400">Username</label>
        <input value={username} onChange={(e) => setUsername(e.target.value)} className="mb-4 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" required />
        <label className="mb-2 block text-sm text-slate-400">Password</label>
        <input type="password" value={password} onChange={(e) => setPassword(e.target.value)} className="mb-6 w-full rounded-xl border border-slate-700 bg-slate-950 px-4 py-3 text-slate-100 outline-none focus:border-sky-500" required />
        <button className="w-full rounded-xl bg-sky-600 py-3 font-semibold text-white hover:bg-sky-500">Register</button>
        <p className="mt-4 text-center text-sm text-slate-400">
          Have an account? <button type="button" onClick={onToggle} className="text-sky-400 hover:underline">Log in</button>
        </p>
      </form>
    </div>
  )
}
