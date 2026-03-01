import { createContext, useContext, useMemo, useState, useCallback } from 'react'
import { lessons } from '../data/lessons.js'

const AppContext = createContext(null)

// ─── Default progress: first lesson unlocked, rest locked ─────────────────
function defaultProgress() {
  const prog = {}
  lessons.forEach((l, i) => {
    prog[l.id] = i === 0 ? 'unlocked' : 'locked'
  })
  return prog
}

const PROGRESS_KEY = 'lm_progress'

function loadProgress() {
  try {
    const stored = localStorage.getItem(PROGRESS_KEY)
    if (stored) {
      const parsed = JSON.parse(stored)
      // Fill in any lessons missing from stored data (handles new lessons added later)
      const defaults = defaultProgress()
      return { ...defaults, ...parsed }
    }
  } catch {
    // ignore parse errors
  }
  return defaultProgress()
}

function persistProgress(prog) {
  try {
    localStorage.setItem(PROGRESS_KEY, JSON.stringify(prog))
  } catch {
    // ignore storage errors
  }
}

// ─── Provider ─────────────────────────────────────────────────────────────
export function AppProvider({ children }) {
  const [progress, setProgressState] = useState(loadProgress)

  // Wrapped setter that also persists to localStorage
  const setProgress = useCallback((updater) => {
    setProgressState((prev) => {
      const next = typeof updater === 'function' ? updater(prev) : updater
      persistProgress(next)
      return next
    })
  }, [])

  // Mark a lesson as completed and unlock the next one
  const markLessonCompleted = useCallback((lessonId) => {
    setProgress((prev) => {
      const next = { ...prev, [lessonId]: 'completed' }
      const idx = lessons.findIndex((l) => l.id === lessonId)
      if (idx >= 0 && idx + 1 < lessons.length) {
        const nextId = lessons[idx + 1].id
        if (next[nextId] === 'locked') next[nextId] = 'unlocked'
      }
      return next
    })
  }, [setProgress])

  // Reset all progress back to default (optional utility)
  const resetProgress = useCallback(() => {
    const fresh = defaultProgress()
    persistProgress(fresh)
    setProgressState(fresh)
  }, [])

  const value = useMemo(
    () => ({ progress, markLessonCompleted, resetProgress }),
    [progress, markLessonCompleted, resetProgress],
  )

  return <AppContext.Provider value={value}>{children}</AppContext.Provider>
}

export function useApp() {
  return useContext(AppContext)
}
