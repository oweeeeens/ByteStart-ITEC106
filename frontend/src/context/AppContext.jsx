import { createContext, useContext, useEffect, useMemo, useRef, useState, useCallback } from 'react'
import { api } from '../api/client.js'
import { lessons } from '../data/lessons.js'

const AppContext = createContext(null)

const initialSettings = {
  fontSize: 'medium',
  highContrast: false,
  darkMode: true,
  dyslexiaFont: false,
  reducedMotion: false,
  lineSpacing: 'normal',
  cursorSize: 'default',
  screenReader: false,
  highlightFocus: false,
  textToSpeech: false,
}

function defaultProgress() {
  const prog = {}
  lessons.forEach((l, i) => {
    if (i === 0) prog[l.id] = 'unlocked'
    else prog[l.id] = 'locked'
  })
  return prog
}

function storageKeyProgress(email) { return `cb_progress_${email}` }
function storageKeySettings(email) { return `cb_settings_${email}` }
function storageKeyHistory(email) { return `cb_history_${email}` }
const USER_KEY = 'cb_user'

function hasToken() {
  return !!localStorage.getItem('cb_token')
}

export function AppProvider({ children }) {
  const [user, setUser] = useState(null)
  const [progress, setProgress] = useState({})
  const [settings, setSettings] = useState(initialSettings)
  const [quizHistory, setQuizHistory] = useState([])
  const settingsSaveTimer = useRef(null)
  const progressSaveTimer = useRef(null)
  const initialSyncDone = useRef(false)

  async function saveProgressToAPI(progressData) {
    try { await api.saveProgressMap(progressData) } catch { /* silently fail */ }
  }

  async function saveSettingsToAPI(newSettings) {
    try { await api.saveSettings(newSettings) } catch { /* silently fail */ }
  }

  const syncProgressFromAPI = useCallback(async () => {
    try {
      const res = await api.getProgressMap()
      if (res.progress && Object.keys(res.progress).length > 0) {
        const merged = { ...defaultProgress(), ...res.progress }
        setProgress(merged)
        return merged
      }
    } catch { /* API unreachable */ }
    return null
  }, [])

  const syncSettingsFromAPI = useCallback(async () => {
    try {
      const res = await api.getSettings()
      if (res.settings) setSettings((prev) => ({ ...initialSettings, ...prev, ...res.settings }))
    } catch { /* API unreachable */ }
  }, [])

  const syncHistoryFromAPI = useCallback(async () => {
    try {
      const res = await api.getHistory()
      if (res.history?.length) {
        setQuizHistory(res.history.map((h) => ({
          lessonId: h.lessonId, title: h.title, score: h.score, passed: !!h.passed, date: h.date,
        })))
      }
    } catch { /* API unreachable */ }
  }, [])

  const syncAllFromAPI = useCallback(async () => {
    try {
      await Promise.all([syncProgressFromAPI(), syncSettingsFromAPI(), syncHistoryFromAPI()])
      initialSyncDone.current = true
    } catch {
      initialSyncDone.current = true
    }
  }, [syncProgressFromAPI, syncSettingsFromAPI, syncHistoryFromAPI])

  useEffect(() => {
    const storedUser = localStorage.getItem(USER_KEY)
    if (storedUser) {
      const parsed = JSON.parse(storedUser)
      const email = parsed.email || parsed.username
      setUser(email ? { ...parsed, email } : parsed)
      const p = localStorage.getItem(storageKeyProgress(email))
      setProgress(p ? JSON.parse(p) : defaultProgress())
      const s = localStorage.getItem(storageKeySettings(email))
      setSettings(s ? JSON.parse(s) : initialSettings)
      const h = localStorage.getItem(storageKeyHistory(email))
      setQuizHistory(h ? JSON.parse(h) : [])
      if (hasToken()) {
        syncAllFromAPI().catch(() => {})
      } else {
        initialSyncDone.current = true
      }
    } else {
      initialSyncDone.current = true
    }
  }, []) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    if (user) {
      localStorage.setItem(USER_KEY, JSON.stringify(user))
      localStorage.setItem(storageKeyProgress(user.email), JSON.stringify(progress))
      localStorage.setItem(storageKeySettings(user.email), JSON.stringify(settings))
      localStorage.setItem(storageKeyHistory(user.email), JSON.stringify(quizHistory))
    }
  }, [user, progress, settings, quizHistory])

  useEffect(() => {
    if (!user || !hasToken() || !initialSyncDone.current) return
    if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current)
    progressSaveTimer.current = setTimeout(() => { saveProgressToAPI(progress) }, 500)
    return () => { if (progressSaveTimer.current) clearTimeout(progressSaveTimer.current) }
  }, [progress, user])

  useEffect(() => {
    if (!user || !hasToken()) return
    if (settingsSaveTimer.current) clearTimeout(settingsSaveTimer.current)
    settingsSaveTimer.current = setTimeout(() => { saveSettingsToAPI(settings) }, 800)
    return () => { if (settingsSaveTimer.current) clearTimeout(settingsSaveTimer.current) }
  }, [settings, user])

  useEffect(() => {
    function handleVisibility() {
      if (document.visibilityState === 'visible' && user && hasToken()) syncAllFromAPI().catch(() => {})
    }
    document.addEventListener('visibilitychange', handleVisibility)
    return () => document.removeEventListener('visibilitychange', handleVisibility)
  }, [user, syncAllFromAPI])

  useEffect(() => {
    function handleFocus() {
      if (user && hasToken()) syncAllFromAPI().catch(() => {})
    }
    window.addEventListener('focus', handleFocus)
    return () => window.removeEventListener('focus', handleFocus)
  }, [user, syncAllFromAPI])

  function login(userData, { isNewAccount = false } = {}) {
    const email = typeof userData === 'string' ? userData : (userData.email || userData.username)
    const role = typeof userData === 'string' ? 'student' : (userData.role || 'student')
    const id = typeof userData === 'string' ? undefined : userData.id
    setUser({ email, role, id })
    if (isNewAccount) {
      localStorage.removeItem(storageKeyProgress(email))
      localStorage.removeItem(storageKeySettings(email))
      localStorage.removeItem(storageKeyHistory(email))
      setProgress(defaultProgress())
      setSettings(initialSettings)
      setQuizHistory([])
    } else {
      const existing = localStorage.getItem(storageKeyProgress(email))
      setProgress(existing ? JSON.parse(existing) : defaultProgress())
      const s = localStorage.getItem(storageKeySettings(email))
      setSettings(s ? JSON.parse(s) : initialSettings)
      const h = localStorage.getItem(storageKeyHistory(email))
      setQuizHistory(h ? JSON.parse(h) : [])
    }
    if (hasToken()) {
      initialSyncDone.current = false
      syncAllFromAPI().catch(() => {})
    }
  }

  function logout() {
    if (progressSaveTimer.current) {
      clearTimeout(progressSaveTimer.current)
      if (hasToken()) saveProgressToAPI(progress)
    }
    if (settingsSaveTimer.current) {
      clearTimeout(settingsSaveTimer.current)
      if (hasToken()) saveSettingsToAPI(settings)
    }
    setUser(null)
    setProgress(defaultProgress())
    setSettings(initialSettings)
    setQuizHistory([])
    localStorage.removeItem(USER_KEY)
    localStorage.removeItem('cb_token')
    initialSyncDone.current = false
  }

  function markLessonCompleted(lessonId) {
    setProgress((prev) => {
      const next = { ...prev, [lessonId]: 'completed' }
      const idx = lessons.findIndex((l) => l.id === lessonId)
      if (idx >= 0 && idx + 1 < lessons.length) {
        const nextLessonId = lessons[idx + 1].id
        if (next[nextLessonId] === 'locked') next[nextLessonId] = 'unlocked'
      }
      return next
    })
  }

  function recordQuizAttempt(lessonId, score, passed) {
    const title = lessons.find((l) => l.id === lessonId)?.title || lessonId
    const entry = { lessonId, title, score, passed, date: new Date().toISOString() }
    setQuizHistory((prev) => [entry, ...prev])
    if (hasToken()) { api.recordHistory(entry).catch(() => {}) }
  }

  const value = useMemo(
    () => ({
      user, login, logout, progress, setProgress, settings, setSettings,
      markLessonCompleted, syncProgressFromAPI, syncAllFromAPI, quizHistory, recordQuizAttempt,
    }),
    [user, progress, settings, quizHistory, syncProgressFromAPI, syncAllFromAPI],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
