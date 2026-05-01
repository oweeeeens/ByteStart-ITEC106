import { useState, useEffect, useRef } from 'react'
import { useNavigate, useLocation, Link } from 'react-router-dom'
import { useApp } from '../context/AppContext.jsx'
import { api } from '../api/client.js'
import { useToast } from '../components/Toast.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

export default function Login() {
  useDocTitle('Sign In')
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const { login } = useApp()
  const navigate = useNavigate()
  const location = useLocation()
  const { showToast } = useToast()
  const from = location.state?.from?.pathname || '/'
  const info = location.state?.message || (location.state?.from ? 'Please log in to continue.' : '')
  const toastShown = useRef(false)

  useEffect(() => {
    if (info && !toastShown.current) {
      toastShown.current = true
      const pageName = location.state?.from?.pathname?.replace('/', '') || 'that page'
      showToast(`🔒 You need to sign in to access "${pageName}". Please log in or create an account.`, 'warning', 5000)
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    const emailValue = email.trim()
    const p = password.trim()
    if (!emailValue || !p) {
      setError('Email and password are required.')
      return
    }
    try {
      setLoading(true)
      const res = await api.login(emailValue, p)
      localStorage.setItem('cb_token', res.token)
      login(res.user || { email: emailValue, role: 'student' })
      navigate(from, { replace: true })
    } catch (err) {
      const message = err.message || 'Login failed'
      setError(message)
      if (err.status === 423) {
        showToast(`🔒 ${message} Please try again in 1 minute.`, 'error', 5000)
      } else if (err.status === 401) {
        showToast('❌ Invalid email or password. Please try again.', 'error', 3000)
      } else {
        showToast(message, 'error', 3000)
      }
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fadeIn" role="region" aria-label="Login form">
      <div className="w-full max-w-md">
        <div className="card p-8 bg-gradient-to-br from-white to-brand-50 border-brand-200 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">💻</div>
            <h1 className="text-3xl font-extrabold heading text-brand-700">Welcome Back!</h1>
            <p className="mt-2 text-steel">Sign in to continue learning</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4" aria-busy={loading}>
            <label className="block" htmlFor="login-email">
              <span className="block mb-1 font-bold text-ink">📧 Email</span>
              <input
                id="login-email"
                type="email"
                autoComplete="email"
                placeholder="you@example.com"
                aria-required="true"
                aria-describedby={error ? 'login-error' : undefined}
                className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
              />
            </label>
            <label className="block" htmlFor="login-password">
              <span className="block mb-1 font-bold text-ink">🔒 Password</span>
              <div className="relative">
                <input
                  id="login-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="current-password"
                  placeholder="Enter your password"
                  aria-required="true"
                  aria-describedby={error ? 'login-error' : undefined}
                  className="w-full border-2 border-gray-200 rounded-xl px-4 py-3 pr-12 focus:border-brand-500 focus:ring-2 focus:ring-brand-200 outline-none transition-all"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" className="w-5 h-5">
                    {showPassword ? (
                      <>
                        <path d="M1 12s4-8 11-8 11 8 11 8-4 8-11 8-11-8-11-8z" />
                        <circle cx="12" cy="12" r="3" />
                      </>
                    ) : (
                      <>
                        <path d="M17.94 17.94A10.07 10.07 0 0 1 12 20c-7 0-11-8-11-8a18.45 18.45 0 0 1 5.06-5.94M9.9 4.24A9.12 9.12 0 0 1 12 4c7 0 11 8 11 8a18.5 18.5 0 0 1-2.16 3.19m-6.72-1.07a3 3 0 1 1-4.24-4.24" />
                        <line x1="1" y1="1" x2="23" y2="23" />
                      </>
                    )}
                  </svg>
                </button>
              </div>
            </label>
            {error ? (
              <div id="login-error" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2" role="alert" aria-live="assertive">
                ⚠️ {error}
              </div>
            ) : null}
            <button type="submit" className="btn btn-primary w-full text-lg py-3" disabled={loading}>
              {loading ? 'Signing in…' : '🚀 Sign In'}
            </button>
          </form>
          <div className="mt-6 text-center text-sm text-steel space-y-2">
            <div>
              New here?{' '}
              <Link to="/register" className="text-brand-600 font-bold hover:text-brand-700">
                Create an account →
              </Link>
            </div>
            <div>
              Forgot password?{' '}
              <Link to="/forgot-password" className="text-brand-600 font-bold hover:text-brand-700">
                Recover it here →
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}
