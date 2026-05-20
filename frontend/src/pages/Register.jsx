import { useState, useEffect, useCallback, useRef } from 'react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { useApp } from '../context/AppContext.jsx'
import { useToast } from '../components/Toast.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

const BLOCKED_PASSWORDS = new Set([
  'password', 'password1', 'password123', '123456', '1234567', '12345678',
  '123456789', '1234567890', 'qwerty', 'qwerty123', 'abc123', 'monkey',
  'master', 'dragon', 'login', 'princess', 'football', 'shadow', 'sunshine',
  'trustno1', 'iloveyou', 'batman', 'access', 'hello', 'charlie', 'donald',
  '654321', 'letmein', 'welcome', 'admin', 'passw0rd', 'p@ssword', 'pass123',
  '111111', '000000', 'baseball', 'michael', 'jordan', 'superman', 'hunter',
  'thomas', 'ranger', 'buster', 'soccer', 'harley', 'daniel', 'robert',
  'computer', 'bytestart', 'grade6', 'student', 'school', 'teacher',
])

const EMAIL_RE = /^[^\s@]+@[^\s@]+\.[^\s@]+$/

function checkPasswordStrength(pw) {
  if (!pw) return { score: 0, label: '', color: 'bg-gray-200', checks: { length: false, upper: false, lower: false, number: false, notBreached: true } }
  const hasLower = /[a-z]/.test(pw)
  const hasUpper = /[A-Z]/.test(pw)
  const hasNumber = /[0-9]/.test(pw)
  const hasSpecial = /[^a-zA-Z0-9]/.test(pw)
  const isLong = pw.length >= 8
  const isVeryLong = pw.length >= 12
  const isBreached = BLOCKED_PASSWORDS.has(pw.toLowerCase())
  const checks = { length: isLong, upper: hasUpper, lower: hasLower, number: hasNumber, notBreached: !isBreached }
  if (isBreached) return { score: 0, label: '⛔ Breached password!', color: 'bg-red-600', checks }
  let score = 0
  if (isLong) score++
  if (isVeryLong) score++
  if (hasLower && hasUpper) score++
  if (hasNumber) score++
  if (hasSpecial) score++
  if (score <= 1) return { score: 1, label: 'Weak 😟', color: 'bg-red-500', checks }
  if (score === 2) return { score: 2, label: 'Fair 😐', color: 'bg-orange-400', checks }
  if (score === 3) return { score: 3, label: 'Good 😊', color: 'bg-yellow-400', checks }
  return { score: 4, label: 'Strong 💪', color: 'bg-green-500', checks }
}

function Check({ ok, label }) {
  return (
    <li className={`flex items-center gap-1.5 text-xs font-medium transition-colors ${ok ? 'text-green-600' : 'text-gray-400'}`}>
      <span className={`inline-flex items-center justify-center w-4 h-4 rounded-full text-[10px] font-bold ${ok ? 'bg-green-100 text-green-600' : 'bg-gray-100 text-gray-400'}`}>
        {ok ? '✓' : '•'}
      </span>
      {label}
    </li>
  )
}

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

export default function Register() {
  useDocTitle('Create Account')
  const [form, setForm] = useState({ full_name: '', guardian_name: '', age: '', grade_level: '', email: '', password: '' })
  const [error, setError] = useState('')
  const [loading, setLoading] = useState(false)
  const [offerLocal, setOfferLocal] = useState(false)
  const [showPassword, setShowPassword] = useState(false)
  const [emailStatus, setEmailStatus] = useState(null)
  const navigate = useNavigate()
  const { login } = useApp()
  const { showToast } = useToast()
  const pwStrength = checkPasswordStrength(form.password)
  const debounceRef = useRef(null)

  const ageNum = form.age === '' ? null : Number(form.age)
  const ageValid = ageNum !== null && !isNaN(ageNum) && ageNum >= 10 && ageNum <= 15
  const ageTouched = form.age !== ''
  const nameTouched = form.full_name !== ''
  const nameValid = form.full_name.trim().length >= 2
  const guardianTouched = form.guardian_name !== ''
  const guardianValid = form.guardian_name.trim().length >= 2
  const emailValue = form.email.trim()
  const emailTouched = form.email !== ''
  const emailValid = emailValue ? EMAIL_RE.test(emailValue.toLowerCase()) : false

  const checkEmail = useCallback((value) => {
    if (debounceRef.current) clearTimeout(debounceRef.current)
    const trimmed = value.trim().toLowerCase()
    if (!EMAIL_RE.test(trimmed)) { setEmailStatus(null); return }
    setEmailStatus('checking')
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await api.checkEmail(trimmed)
        setEmailStatus(res.available ? 'available' : 'taken')
      } catch {
        setEmailStatus(null)
      }
    }, 500)
  }, [])

  useEffect(() => {
    return () => { if (debounceRef.current) clearTimeout(debounceRef.current) }
  }, [])

  async function onSubmit(e) {
    e.preventDefault()
    setError('')
    setOfferLocal(false)
    if (!form.full_name.trim()) { setError('Please enter your full name.'); return }
    if (!form.guardian_name.trim()) { setError('Please enter your guardian\'s name.'); return }
    if (!form.email.trim()) { setError('Please enter your email address.'); return }
    const normalizedEmail = form.email.trim().toLowerCase()
    if (!EMAIL_RE.test(normalizedEmail)) { setError('Please enter a valid email address.'); return }
    if (!form.password || form.password.length < 8) { setError('Password must be at least 8 characters.'); return }
    if (BLOCKED_PASSWORDS.has(form.password.toLowerCase())) {
      setError('This password was found in data breaches. Please choose a stronger one.')
      showToast('⛔ That password is too common and has been leaked in data breaches. Pick something unique!', 'error', 5000)
      return
    }
    if (!/[A-Z]/.test(form.password)) { setError('Password must include at least one uppercase letter (A-Z).'); return }
    if (!/[a-z]/.test(form.password)) { setError('Password must include at least one lowercase letter (a-z).'); return }
    if (!/[0-9]/.test(form.password)) { setError('Password must include at least one number (0-9).'); return }
    const age = Number(form.age)
    if (!form.age || isNaN(age) || age < 10 || age > 15) {
      setError('ByteStart is for students aged 10–15 only. Please enter a valid age.')
      showToast('You must be between 10 and 15 years old to register.', 'warning')
      return
    }
    try {
      setLoading(true)
      const payload = { ...form, email: normalizedEmail, age: form.age ? Number(form.age) : null, grade_level: '6' }
      const res = await api.register(payload)
      localStorage.setItem('cb_token', res.token)
      login(res.user || { email: normalizedEmail, role: 'student' }, { isNewAccount: true })
      navigate('/')
    } catch (err) {
      const msg = err?.message || 'Registration failed'
      setError(msg)
      setOfferLocal(true)
    } finally {
      setLoading(false)
    }
  }

  function update(k, v) {
    setForm((f) => ({ ...f, [k]: v }))
    if (k === 'email') checkEmail(v)
  }

  return (
    <div className="min-h-[70vh] flex items-center justify-center animate-fadeIn" role="region" aria-label="Registration form">
      <div className="w-full max-w-md">
        <div className="card p-8 bg-gradient-to-br from-white to-green-50 border-green-200 shadow-lg">
          <div className="text-center mb-6">
            <div className="text-5xl mb-3">📝</div>
            <h1 className="text-3xl font-extrabold heading text-brand-700">Create Account</h1>
            <p className="mt-2 text-steel">Join ByteStart and start learning!</p>
          </div>
          <form onSubmit={onSubmit} className="space-y-4" aria-busy={loading}>
            <label className="block" htmlFor="reg-fullname">
              <span className="block mb-1 font-bold text-ink">👤 Full Name</span>
              <input
                id="reg-fullname"
                autoComplete="name"
                placeholder="Enter your full name"
                aria-required="true"
                aria-describedby={nameTouched && !nameValid ? 'reg-fullname-err' : undefined}
                className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  !nameTouched ? 'border-gray-200 focus:border-brand-500 focus:ring-brand-200'
                  : nameValid ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : 'border-red-300 focus:border-red-500 focus:ring-red-200'
                }`}
                value={form.full_name}
                onChange={(e) => update('full_name', e.target.value)}
              />
              {nameTouched && !nameValid && (
                <p id="reg-fullname-err" className="mt-1 text-xs text-red-500 font-medium">⚠️ Please enter your full name</p>
              )}
            </label>
            <label className="block" htmlFor="reg-guardian">
              <span className="block mb-1 font-bold text-ink">👨‍👩‍👧 Guardian's Name</span>
              <input
                id="reg-guardian"
                placeholder="Enter your guardian's name"
                aria-required="true"
                aria-describedby={guardianTouched && !guardianValid ? 'reg-guardian-err' : undefined}
                className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  !guardianTouched ? 'border-gray-200 focus:border-brand-500 focus:ring-brand-200'
                  : guardianValid ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : 'border-red-300 focus:border-red-500 focus:ring-red-200'
                }`}
                value={form.guardian_name}
                onChange={(e) => update('guardian_name', e.target.value)}
              />
              {guardianTouched && !guardianValid && (
                <p id="reg-guardian-err" className="mt-1 text-xs text-red-500 font-medium">⚠️ Please enter your guardian's name</p>
              )}
            </label>
            <label className="block" htmlFor="reg-age">
              <span className="block mb-1 font-bold text-ink">🎂 Age <span className="text-red-500">*</span></span>
              <input
                id="reg-age"
                type="number"
                min="10"
                max="15"
                placeholder="10–15 only"
                aria-required="true"
                aria-describedby={ageTouched && !ageValid ? 'reg-age-err' : undefined}
                className={`w-full border-2 rounded-xl px-4 py-3 focus:ring-2 outline-none transition-all ${
                  !ageTouched ? 'border-gray-200 focus:border-brand-500 focus:ring-brand-200'
                  : ageValid ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                  : 'border-red-300 focus:border-red-500 focus:ring-red-200'
                }`}
                value={form.age}
                onChange={(e) => update('age', e.target.value)}
                required
              />
              {ageTouched && !ageValid && (
                <p id="reg-age-err" className="mt-1 text-xs text-red-500 font-medium">⚠️ Must be between 10 and 15 years old</p>
              )}
              {ageTouched && ageValid && (
                <p className="mt-1 text-xs text-green-600 font-medium">✓ Age accepted</p>
              )}
            </label>
            <div className="bg-blue-50 border border-blue-200 rounded-xl px-4 py-3">
              <p className="text-sm font-medium text-blue-900">🏫 Grade Level: <strong>6</strong></p>
              <p className="text-xs text-blue-700 mt-1">ByteStart is designed for Grade 6 students</p>
            </div>
            <label className="block" htmlFor="reg-email">
              <span className="block mb-1 font-bold text-ink">📧 Email</span>
              <div className="relative">
                <input
                  id="reg-email"
                  type="email"
                  autoComplete="email"
                  placeholder="you@example.com"
                  aria-required="true"
                  aria-describedby={
                    emailStatus === 'taken' ? 'reg-email-taken'
                    : emailTouched && !emailValid ? 'reg-email-invalid'
                    : emailStatus === 'available' ? 'reg-email-ok'
                    : undefined
                  }
                  className={`w-full border-2 rounded-xl px-4 py-3 pr-10 focus:ring-2 outline-none transition-all ${
                    !emailTouched ? 'border-gray-200 focus:border-brand-500 focus:ring-brand-200'
                    : !emailValid ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : emailStatus === 'taken' ? 'border-red-300 focus:border-red-500 focus:ring-red-200'
                    : emailStatus === 'available' ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                    : 'border-gray-200 focus:border-brand-500 focus:ring-brand-200'
                  }`}
                  value={form.email}
                  onChange={(e) => update('email', e.target.value)}
                />
                {emailStatus === 'checking' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 text-sm animate-pulse">⏳</span>
                )}
                {emailStatus === 'available' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-green-500 text-sm">✓</span>
                )}
                {emailStatus === 'taken' && (
                  <span className="absolute right-3 top-1/2 -translate-y-1/2 text-red-500 text-sm">✗</span>
                )}
              </div>
              {emailTouched && !emailValid && (
                <p id="reg-email-invalid" className="mt-1 text-xs text-red-500 font-medium">⚠️ Enter a valid email address</p>
              )}
              {emailStatus === 'taken' && (
                <p id="reg-email-taken" className="mt-1 text-xs text-red-500 font-medium">⚠️ This email is already registered</p>
              )}
              {emailStatus === 'available' && (
                <p id="reg-email-ok" className="mt-1 text-xs text-green-600 font-medium">✓ Email is available</p>
              )}
            </label>
            <label className="block" htmlFor="reg-password">
              <span className="block mb-1 font-bold text-ink">🔒 Password <span className="text-red-500">*</span></span>
              <div className="relative">
                <input
                  id="reg-password"
                  type={showPassword ? 'text' : 'password'}
                  autoComplete="new-password"
                  placeholder="Min 8 chars, upper + lower + number"
                  aria-required="true"
                  aria-describedby={form.password ? 'reg-pw-strength' : undefined}
                  className={`w-full border-2 rounded-xl px-4 py-3 pr-12 focus:ring-2 outline-none transition-all ${
                    !form.password ? 'border-gray-200 focus:border-brand-500 focus:ring-brand-200'
                    : (pwStrength.checks.length && pwStrength.checks.upper && pwStrength.checks.lower && pwStrength.checks.number && pwStrength.checks.notBreached)
                      ? 'border-green-300 focus:border-green-500 focus:ring-green-200'
                      : 'border-red-300 focus:border-red-500 focus:ring-red-200'
                  }`}
                  value={form.password}
                  onChange={(e) => update('password', e.target.value)}
                  required
                />
                <button
                  type="button"
                  aria-label={showPassword ? 'Hide password' : 'Show password'}
                  className="absolute right-3 top-1/2 -translate-y-1/2 text-gray-400 hover:text-gray-600 transition-colors focus:outline-none focus-visible:ring-2 focus-visible:ring-brand-400 rounded"
                  onClick={() => setShowPassword((v) => !v)}
                >
                  <EyeIcon open={showPassword} />
                </button>
              </div>
              {form.password && (
                <div id="reg-pw-strength" className="mt-2" role="status" aria-live="polite">
                  <div className="flex items-center gap-2 mb-1.5">
                    <div className="flex-1 h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className={`h-full rounded-full transition-all duration-300 ${pwStrength.color}`}
                        style={{ width: `${(pwStrength.score / 4) * 100}%` }}
                      />
                    </div>
                    <span className={`text-xs font-bold whitespace-nowrap ${
                      pwStrength.score <= 1 ? 'text-red-600' :
                      pwStrength.score === 2 ? 'text-orange-500' :
                      pwStrength.score === 3 ? 'text-yellow-600' : 'text-green-600'
                    }`}>{pwStrength.label}</span>
                  </div>
                  <ul className="space-y-1 ml-0.5">
                    <Check ok={pwStrength.checks.length} label="At least 8 characters" />
                    <Check ok={pwStrength.checks.upper} label="An uppercase letter (A-Z)" />
                    <Check ok={pwStrength.checks.lower} label="A lowercase letter (a-z)" />
                    <Check ok={pwStrength.checks.number} label="A number (0-9)" />
                    <Check ok={pwStrength.checks.notBreached} label="Not a commonly breached password" />
                  </ul>
                </div>
              )}
            </label>
            {error ? (
              <div id="reg-error" className="text-red-600 text-sm bg-red-50 border border-red-200 rounded-xl px-4 py-2" role="alert" aria-live="assertive">
                ⚠️ {error}
              </div>
            ) : null}
            {offerLocal ? (
              <button
                type="button"
                className="btn btn-secondary w-full"
                onClick={() => {
                  const localEmail = form.email.trim() || 'guest@bytestart.local'
                  login({ email: localEmail, role: 'student' })
                  localStorage.setItem('cb_token', 'local')
                  navigate('/')
                }}
              >
                Continue without account
              </button>
            ) : null}
            <button type="submit" className="btn btn-primary w-full text-lg py-3" disabled={loading}>
              {loading ? 'Creating account…' : '🎉 Create Account'}
            </button>
          </form>
          <div className="mt-4 text-xs text-steel bg-yellow-50 border border-yellow-200 rounded-xl px-4 py-3 text-center">
            ⚠️ <strong>ByteStart is for Grade 6 students only</strong> (ages 10–15).
          </div>
          <div className="mt-4 text-center text-sm text-steel">
            Already have an account?{' '}
            <a href="/login" className="text-brand-600 font-bold hover:text-brand-700">
              Sign in →
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}
