import { useState, useEffect } from 'react'
import { api } from '../../api/client.js'

export default function AdminDashboard() {
  const [stats, setStats] = useState(null)
  const [error, setError] = useState('')

  useEffect(() => {
    api.admin.getStats()
      .then((r) => setStats(r.stats))
      .catch((e) => setError(e.message))
  }, [])

  if (error) return <div className="text-red-500 font-semibold p-4">{error}</div>
  if (!stats) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading dashboard…</div></div>

  const cards = [
    { label: 'Total Users', value: stats.users, icon: '👥', color: 'text-blue-400', accent: 'bg-blue-400' },
    { label: 'Total Lessons', value: stats.lessons, icon: '📖', color: 'text-emerald-400', accent: 'bg-emerald-400' },
    { label: 'Total Quizzes', value: stats.quizzes, icon: '📝', color: 'text-violet-400', accent: 'bg-violet-400' },
    { label: 'Total Questions', value: stats.questions, icon: '❓', color: 'text-orange-400', accent: 'bg-orange-400' },
  ]

  return (
    <div className="animate-page-enter">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">Dashboard Overview</h1>
        <p className="text-slate-400 font-medium">Platform performance and statistics at a glance.</p>
      </header>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6 mb-10">
        {cards.map((c) => (
          <div key={c.label} className="admin-glass-card p-6 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-8">
              <div className={`p-3 rounded-2xl bg-white/5 border border-white/5 ${c.color} group-hover:scale-110 transition-transform duration-300`}>
                <span className="text-2xl">{c.icon}</span>
              </div>
              <div className={`admin-accent-dot ${c.accent}`} />
            </div>
            <div>
              <div className="admin-stat-value mb-1">{c.value}</div>
              <p className="text-sm font-bold text-slate-500 uppercase tracking-widest">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-glass-card p-8">
          <h3 className="text-lg font-bold text-white mb-6 flex items-center gap-2">
            <span className="w-2 h-2 rounded-full bg-cyan-500 animate-pulse" />
            System Health
          </h3>
          <div className="space-y-6">
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🌐</div>
                <div>
                  <p className="text-white font-bold">API Server</p>
                  <p className="text-xs text-emerald-400 font-bold uppercase">Operational</p>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500">99.9% Uptime</div>
            </div>
            <div className="flex items-center justify-between p-4 bg-white/5 rounded-2xl border border-white/5">
              <div className="flex items-center gap-4">
                <div className="text-2xl">🗄️</div>
                <div>
                  <p className="text-white font-bold">Database Instance</p>
                  <p className="text-xs text-emerald-400 font-bold uppercase">Healthy</p>
                </div>
              </div>
              <div className="text-xs font-mono text-slate-500">12ms Latency</div>
            </div>
          </div>
        </div>

        <div className="admin-glass-card p-8">
          <h3 className="text-lg font-bold text-white mb-6">Quick Actions</h3>
          <div className="grid grid-cols-1 gap-3">
            <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-slate-300 text-left transition-colors">
              ➕ Add New Lesson
            </button>
            <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-slate-300 text-left transition-colors">
              👥 Review New Users
            </button>
            <button className="w-full py-3 px-4 bg-white/5 hover:bg-white/10 border border-white/10 rounded-xl text-sm font-bold text-slate-300 text-left transition-colors">
              📝 Update Quiz Bank
            </button>
          </div>
        </div>
      </div>
    </div>
  )
}
