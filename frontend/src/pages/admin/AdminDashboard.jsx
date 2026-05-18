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
  if (!stats) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-600 text-lg font-bold">Loading dashboard...</div></div>

  const cards = [
    { label: 'Total Users', value: stats.users, icon: 'US', badge: 'admin-dashboard-badge admin-dashboard-badge-brand', accent: 'admin-accent-dot bg-brand-500 text-brand-500' },
    { label: 'Total Lessons', value: stats.lessons, icon: 'LS', badge: 'admin-dashboard-badge admin-dashboard-badge-green', accent: 'admin-accent-dot bg-emerald-500 text-emerald-500' },
    { label: 'Total Quizzes', value: stats.quizzes, icon: 'QZ', badge: 'admin-dashboard-badge admin-dashboard-badge-blue', accent: 'admin-accent-dot bg-sky-500 text-sky-500' },
    { label: 'Total Questions', value: stats.questions, icon: 'QA', badge: 'admin-dashboard-badge admin-dashboard-badge-amber', accent: 'admin-accent-dot bg-amber-500 text-amber-500' },
  ]

  const statusChips = [
    { label: 'API Online', value: 'Operational' },
    { label: 'Database Connected', value: 'Healthy' },
    { label: 'Quiz Bank Ready', value: `${stats.questions} questions` },
  ]

  const actions = [
    { to: '/admin/users', label: 'Manage Users', desc: 'Review accounts and roles' },
    { to: '/admin/lessons', label: 'Edit Lessons', desc: 'Update lesson content' },
    { to: '/admin/quizzes', label: 'Update Quizzes', desc: 'Manage questions and scores' },
    { to: '/lessons', label: 'Back to Site', desc: 'Preview the student side' },
  ]

  const checklist = [
    { label: 'Review users', done: stats.users > 0 },
    { label: 'Check quiz questions', done: stats.questions > 0 },
    { label: 'Update lesson content', done: stats.lessons > 0 },
    { label: 'Test student view', done: false },
  ]

  return (
    <div className="animate-page-enter max-w-6xl mx-auto space-y-6">
      <header className="admin-glass-card admin-dashboard-hero p-6">
        <div>
          <p className="admin-dashboard-kicker">Admin Workspace</p>
          <h1 className="text-3xl font-extrabold heading text-ink mb-2">Admin Overview</h1>
          <p className="text-steel font-medium">Monitor platform activity and jump into common tasks.</p>
        </div>
        <div className="admin-dashboard-updated">
          <span className="admin-live-dot" />
          <span>Last checked just now</span>
        </div>
      </header>

      <div className="admin-status-strip">
        {statusChips.map((chip) => (
          <div key={chip.label} className="admin-status-chip">
            <span className="admin-live-dot" />
            <div>
              <strong>{chip.label}</strong>
              <span>{chip.value}</span>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
        {cards.map((c) => (
          <div key={c.label} className="admin-glass-card p-6 flex flex-col justify-between group">
            <div className="flex items-center justify-between mb-8">
              <div className={c.badge}>
                <span>{c.icon}</span>
              </div>
              <div className={c.accent} />
            </div>
            <div>
              <div className="admin-stat-value mb-1">{c.value}</div>
              <p className="text-sm font-bold text-steel uppercase tracking-widest">{c.label}</p>
            </div>
          </div>
        ))}
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <div className="lg:col-span-2 admin-glass-card p-6">
          <div className="admin-dashboard-section-head">
            <div>
              <h2 className="text-lg font-bold text-ink">Quick Actions</h2>
              <p className="text-sm text-steel font-medium">The usual admin stops, one click away.</p>
            </div>
          </div>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            {actions.map((action) => (
              <Link key={action.to} to={action.to} className="admin-quick-action">
                <span>{action.label}</span>
                <small>{action.desc}</small>
              </Link>
            ))}
          </div>
        </div>

        <div className="admin-glass-card p-6">
          <div className="admin-dashboard-section-head">
            <div>
              <h2 className="text-lg font-bold text-ink">Admin Checklist</h2>
              <p className="text-sm text-steel font-medium">Simple reminders for today.</p>
            </div>
          </div>
          <div className="admin-checklist">
            {checklist.map((item) => (
              <div key={item.label} className="admin-checklist-item">
                <span className={item.done ? 'admin-checkmark is-done' : 'admin-checkmark'}>{item.done ? '✓' : ''}</span>
                <span>{item.label}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}
