const BASE = '/api'

function getToken() {
  try {
    const raw = localStorage.getItem('cb_token')
    return raw || ''
  } catch {
    return ''
  }
}

async function request(path, opts = {}) {
  const headers = opts.headers || {}
  const token = getToken()
  if (token) headers['Authorization'] = `Bearer ${token}`
  if (opts.body && !headers['Content-Type']) headers['Content-Type'] = 'application/json'
  let res
  try {
    res = await fetch(`${BASE}${path}`, { ...opts, headers })
  } catch (e) {
    const err = new Error('Network error: cannot reach server')
    err.code = 'NETWORK'
    throw err
  }
  if (!res.ok) {
    let msg = ''
    try {
      const data = await res.json()
      msg = data?.error || ''
    } catch {
      try {
        const text = await res.text()
        msg = text?.slice(0, 140) || ''
      } catch {}
    }
    const err = new Error(msg || `Request failed (${res.status} ${res.statusText})`)
    err.status = res.status
    throw err
  }
  return res.json()
}

export const api = {
  login: (username, password) =>
    request('/auth/login', { method: 'POST', body: JSON.stringify({ username, password }) }),
  register: (payload) =>
    request('/auth/register', { method: 'POST', body: JSON.stringify(payload) }),
  checkUsername: (username) => request(`/auth/check-username/${encodeURIComponent(username)}`),
  forgotPassword: (username, guardian_name, new_password) =>
    request('/auth/forgot-password', { method: 'POST', body: JSON.stringify({ username, guardian_name, new_password }) }),
  lessons: (courseId) => request(`/courses/${courseId}/lessons`),
  quiz: (lessonId) => request(`/quiz/${lessonId}`),
  submitQuiz: (lessonId, answers) =>
    request(`/quiz/${lessonId}/submit`, { method: 'POST', body: JSON.stringify({ answers }) }),
  progress: () => request('/progress'),
  getProgressMap: () => request('/progress/map'),
  saveProgressMap: (progress) =>
    request('/progress/map', { method: 'PUT', body: JSON.stringify({ progress }) }),
  getSettings: () => request('/settings'),
  saveSettings: (settings) =>
    request('/settings', { method: 'PUT', body: JSON.stringify({ settings }) }),
  getHistory: () => request('/history'),
  recordHistory: (entry) =>
    request('/history', { method: 'POST', body: JSON.stringify(entry) }),
}
