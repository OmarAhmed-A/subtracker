import { useState } from 'react'
import { AuthProvider, useAuth } from './auth.jsx'
import Layout from './components/Layout'
import Login from './components/Login'
import Register from './components/Register'
import Dashboard from './components/Dashboard'
import Settings from './components/Settings'

function Router() {
  const { user, loading } = useAuth()
  const [isLogin, setIsLogin] = useState(true)
  const [page, setPage] = useState('dashboard')

  if (loading) return <div className="p-8 text-center text-slate-400">Loading...</div>
  if (!user) return (
    <Layout>
      {isLogin ? <Login onToggle={() => setIsLogin(false)} /> : <Register onToggle={() => setIsLogin(true)} />}
    </Layout>
  )
  return (
    <Layout page={page} onChangePage={setPage}>
      {page === 'settings' ? <Settings onBack={() => setPage('dashboard')} /> : <Dashboard />}
    </Layout>
  )
}

export default function App() {
  return (
    <AuthProvider>
      <Router />
    </AuthProvider>
  )
}
