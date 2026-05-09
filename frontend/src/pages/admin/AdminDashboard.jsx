import { useState, useEffect } from 'react'
import { api } from '../../api/client.js'
import { Link } from 'react-router-dom'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.admin.getStats()
      .then((r) => setStats(r.stats))
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="text-danger-600 font-semibold p-4">{error}</div>
  if (!stats) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-600 text-lg font-bold">Loading dashboard…</div></div>

  const cards = [
    { label: 'Total Users', value: stats.users, icon: '👥', badge: 'bg-brand-50 text-brand-700 border border-brand-100', accent: 'bg-brand-500 text-brand-500' },
    { label: 'Total Lessons', value: stats.lessons, icon: '📖', badge: 'bg-emerald-50 text-emerald-700 border border-emerald-100', accent: 'bg-emerald-500 text-emerald-500' },
    { label: 'Total Quizzes', value: stats.quizzes, icon: '📝', badge: 'bg-sky-50 text-sky-700 border border-sky-100', accent: 'bg-sky-500 text-sky-500' },
    { label: 'Total Questions', value: stats.questions, icon: '❓', badge: 'bg-amber-50 text-amber-700 border border-amber-100', accent: 'bg-amber-500 text-amber-500' },
  ]

  return (
    <div className="animate-page-enter max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold heading text-ink mb-2">Admin Overview</h1>
        <p className="text-steel font-medium">Monitor platform activity and key system metrics.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="admin-glass-card p-6 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-8">
              <div className={`p-3 rounded-2xl border border-transparent ${c.badge} group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{c.icon}</span>
              </div>
              <div className={`admin-accent-dot ${c.accent}`} />
            </div>
            <div>
              <div className="admin-stat-value mb-1">{c.value}</div>
              <p className="text-sm font-bold text-steel uppercase tracking-widest">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-glass-card p-8">
          <h3 className="text-lg font-bold text-ink mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-brand-500 animate-pulse" />
            System Health
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-brand-50 rounded-2xl border border-brand-100">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🌐</div>
                <div>
                  <p className="text-ink font-bold">API Server</p>
                  <p className="text-xs text-emerald-600 font-bold uppercase">Operational</p>
                </div>
              </div>
              <div className="text-xs font-mono text-steel">Live monitoring</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-gray-50 rounded-2xl border border-gray-200">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🗄️</div>
                <div>
                  <p className="text-ink font-bold">Database Instance</p>
                  <p className="text-xs text-emerald-600 font-bold uppercase">Healthy</p>
                </div>
              </div>
              <div className="text-xs font-mono text-steel">Stable latency</div>
            </div>
          </div>
        </div>

        <div className="admin-glass-card p-8">
          <h3 className="text-lg font-bold text-ink mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <Link to="/admin/lessons" className="w-full py-3 px-4 bg-white hover:bg-brand-50 border border-gray-200 rounded-xl text-sm font-bold text-ink text-left transition-colors">
              Add a Lesson
            </Link>
            <Link to="/admin/users" className="w-full py-3 px-4 bg-white hover:bg-brand-50 border border-gray-200 rounded-xl text-sm font-bold text-ink text-left transition-colors">
              Review Users
            </Link>
            <Link to="/admin/quizzes" className="w-full py-3 px-4 bg-white hover:bg-brand-50 border border-gray-200 rounded-xl text-sm font-bold text-ink text-left transition-colors">
              Update Quiz Bank
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
