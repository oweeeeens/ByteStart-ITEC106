import { createContext, useContext, useState, useCallback } from 'react'

const ToastContext = createContext(null)

export function ToastProvider({ children }) {
  const [toasts, setToasts] = useState([])

  const showToast = useCallback((message, type = 'info', duration = 3500) => {
    const id = Date.now() + Math.random()
    setToasts((prev) => [...prev, { id, message, type, duration }])
    setTimeout(() => {
      setToasts((prev) => prev.filter((t) => t.id !== id))
    }, duration)
  }, [])

  const dismiss = useCallback((id) => {
    setToasts((prev) => prev.filter((t) => t.id !== id))
  }, [])

  return (
    <ToastContext.Provider value={{ showToast }}>
      {children}
      <div className="fixed top-20 right-4 z-[100] flex flex-col gap-3 pointer-events-none" aria-live="polite">
        {toasts.map((toast) => (
          <ToastItem key={toast.id} toast={toast} onDismiss={() => dismiss(toast.id)} />
        ))}
      </div>
    </ToastContext.Provider>
  )
}

function ToastItem({ toast, onDismiss }) {
  const styles = {
    info:    { bg: 'bg-blue-50 border-blue-300',   icon: 'ℹ️', text: 'text-blue-800',   bar: 'bg-blue-400' },
    warning: { bg: 'bg-yellow-50 border-yellow-300', icon: '⚠️', text: 'text-yellow-800', bar: 'bg-yellow-400' },
    error:   { bg: 'bg-red-50 border-red-300',     icon: '🚫', text: 'text-red-800',    bar: 'bg-red-400' },
    success: { bg: 'bg-green-50 border-green-300', icon: '✅', text: 'text-green-800',  bar: 'bg-green-400' },
  }
  const s = styles[toast.type] || styles.info

  return (
    <div
      className={`pointer-events-auto max-w-sm w-full ${s.bg} border-2 rounded-2xl shadow-lg animate-slideUp flex flex-col overflow-hidden`}
      role="alert"
    >
      <div className="px-5 py-4 flex items-start gap-3">
        <span className="text-xl flex-shrink-0 mt-0.5">{s.icon}</span>
        <div className="flex-1">
          <p className={`font-semibold text-sm ${s.text}`}>{toast.message}</p>
        </div>
        <button
          onClick={onDismiss}
          className="flex-shrink-0 text-gray-400 hover:text-gray-600 text-lg leading-none mt-0.5"
          aria-label="Dismiss"
        >
          ✕
        </button>
      </div>
      <div className="h-1 w-full bg-black/5">
        <div
          className={`h-full ${s.bar} rounded-full`}
          style={{ animation: `toast-progress ${toast.duration || 3500}ms linear forwards` }}
        />
      </div>
    </div>
  )
}

export function useToast() {
  const ctx = useContext(ToastContext)
  if (!ctx) throw new Error('useToast must be used within <ToastProvider>')
  return ctx
}
