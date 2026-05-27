import { useState } from 'react'
import { Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

function EyeIcon({ open }) {
  if (open) {
    return (
      <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
        <circle cx="12" cy="12" r="3" />
      </svg>
    )
  }
  return (
    <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
      <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
      <line x1="1" y1="1" x2="23" y2="23" />
    </svg>
  )
}

export default function ForgotPassword() {
  useDocTitle('Forgot Password')
  const [form, setForm] = useState({ email: '', guardian_name: '', new_password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const navigate = useNavigate()
  const { showToast } = useToast()

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    if (!form.email.trim() || !form.guardian_name.trim() || !form.new_password) {
      setError('Please fill in all fields.')
      return
    }
    try {
      setLoading(true)
      const res = await api.forgotPassword(form.email, form.guardian_name, form.new_password)
      showToast(res.message || 'Password updated successfully!', 'success')
      navigate('/login')
    } catch (err) {
      setError(err?.message || 'Failed to update password. Make sure the email and guardian name match.')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fadeIn" role="region" aria-label="Forgot Password form">
      <div className="w-full max-w-sm">
        <div className="card p-8 bg-gradient-to-br from-white to-blue-50 border-blue-200 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">🔑</div>
            <h1 className="text-3xl font-extrabold heading text-brand-700">Forgot Password</h1>
            <p className="mt-2 text-steel">Reset your password with your Guardian's Name.</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4" aria-busy={loading}>
            <label className="block" htmlFor="fp-email">
              <span className="block mb-1 font-bold text-ink">📧 Email</span>
              <input
                id="fp-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-required="true"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                value={form.email}
                onChange={(e) => setForm({ ...form, email: e.target.value })}
              />
            </label>
            <label className="block" htmlFor="fp-guardian">
              <span className="block mb-1 font-bold text-ink">👨‍👩‍👧 Guardian's Name</span>
              <input
                id="fp-guardian"
                placeholder="Guardian's name used during registration"
                aria-required="true"
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                value={form.guardian_name}
                onChange={(e) => setForm({ ...form, guardian_name: e.target.value })}
              />
            </label>
            <label className="block relative" htmlFor="fp-pass">
              <span className="block mb-1 font-bold text-ink">🔒 New Password</span>
              <div className="relative">
                <input
                  id="fp-pass"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Enter a new password"
                  aria-required="true"
                  className="w-full border-2 border-gray-200 rounded-xl pl-4 pr-12 py-3 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  value={form.new_password}
                  onChange={(e) => setForm({ ...form, new_password: e.target.value })}
                />
                <button
                  type="button"
                  onClick={() => setShowPassword(!showPassword)}
                  className="absolute right-3 top-1/2 -translate-y-1/2 p-1 text-gray-400 hover:text-brand-600 transition-colors focus:outline-none focus:ring-2 focus:ring-brand-200 rounded"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  aria-pressed={showPassword}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
            </label>
            {error && (
              <div className="p-3 bg-red-50 text-red-700 rounded-xl text-sm font-medium border border-red-200 flex items-start gap-2" role="alert">
                <span className="text-red-500">⚠️</span>
                {error}
              </div>
            )}
            <button
              type="submit"
              disabled={loading}
              className="w-full font-bold text-lg heading bg-brand-500 hover:bg-brand-600 text-white rounded-xl py-3 px-6 transform transition-all hover:-translate-y-0.5 shadow-md hover:shadow-lg disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none mt-2"
            >
              {loading ? 'Updating Password...' : 'Reset Password'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm font-medium text-steel">
            Remembered your password?{' '}
            <Link to="/login" className="text-brand-600 hover:text-brand-800 underline decoration-2 underline-offset-4 transition-colors">
              Log in here.
            </Link>
          </div>
        </div>
      </div>
    </div>
  )
}
