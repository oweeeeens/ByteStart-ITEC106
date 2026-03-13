import { useState, useEffect, useCallback } from 'react'

/**
 * An overlay that shows all keyboard shortcuts in the app.
 * Triggered by pressing the "?" key.
 */
export default function KeyboardShortcuts() {
  const [open, setOpen] = useState(false)

  const handleKey = useCallback((e) => {
    if (e.target.tagName === 'INPUT' || e.target.tagName === 'TEXTAREA' || e.target.tagName === 'SELECT') return
    if (e.key === '?' || (e.key === '/' && e.shiftKey)) {
      e.preventDefault()
      setOpen(prev => !prev)
    }
    if (e.key === 'Escape') setOpen(false)
  }, [])

  useEffect(() => {
    window.addEventListener('keydown', handleKey)
    return () => window.removeEventListener('keydown', handleKey)
  }, [handleKey])

  if (!open) return null

  const shortcuts = [
    { keys: ['1', '2', '3', '4'], desc: 'Select quiz answer' },
    { keys: ['Enter'], desc: 'Confirm selected answer' },
    { keys: ['N'], desc: 'Next question / advance' },
    { keys: ['?'], desc: 'Toggle this shortcuts panel' },
    { keys: ['Esc'], desc: 'Close dialogs & panels' },
  ]

  return (
    <div className="fixed inset-0 z-[200] flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" onClick={() => setOpen(false)} />
      <div className="relative bg-white rounded-2xl shadow-2xl w-full max-w-md p-6 border border-gray-100 animate-bounce-in">
        <div className="flex items-center justify-between mb-5">
          <h2 className="text-xl font-extrabold heading text-brand-700 flex items-center gap-2">
            <span className="text-2xl">⌨️</span> Keyboard Shortcuts
          </h2>
          <button
            onClick={() => setOpen(false)}
            className="text-gray-400 hover:text-gray-600 text-xl leading-none p-1 rounded-lg hover:bg-gray-100 transition-colors"
            aria-label="Close shortcuts panel"
          >
            ✕
          </button>
        </div>
        <div className="space-y-3">
          {shortcuts.map((s, i) => (
            <div key={i} className="flex items-center justify-between py-2 px-3 rounded-xl bg-gray-50 border border-gray-100">
              <span className="text-sm text-gray-700 font-medium">{s.desc}</span>
              <div className="flex gap-1.5">
                {s.keys.map((k) => (
                  <kbd key={k} className="inline-flex items-center justify-center min-w-[28px] h-7 px-2 bg-white border border-gray-200 rounded-lg text-xs font-bold text-brand-700 shadow-sm">
                    {k}
                  </kbd>
                ))}
              </div>
            </div>
          ))}
        </div>
        <p className="mt-4 text-center text-xs text-gray-400">
          Press <kbd className="bg-gray-100 text-gray-600 px-1.5 py-0.5 rounded text-xs font-bold">?</kbd> anytime to toggle this panel
        </p>
      </div>
    </div>
  )
}
