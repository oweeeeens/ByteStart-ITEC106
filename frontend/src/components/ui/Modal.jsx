import { useEffect, useRef, useId } from 'react'

export default function Modal({ open, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)
  const titleId = useId()
  const descId = useId()
  const isAdmin = typeof document !== 'undefined' && document.querySelector('.admin-wrapper')

  // Capture the element that opened the modal so we can return focus
  useEffect(() => {
    if (open) {
      triggerRef.current = document.activeElement
    }
  }, [open])

  // Focus the dialog when opened; return focus when closed
  useEffect(() => {
    if (open && dialogRef.current) {
      dialogRef.current.focus()
    }
    return () => {
      if (!open && triggerRef.current && typeof triggerRef.current.focus === 'function') {
        triggerRef.current.focus()
      }
    }
  }, [open])

  // Keyboard: Escape to close + focus trap (Tab / Shift+Tab)
  useEffect(() => {
    function onKey(e) {
      if (e.key === 'Escape') {
        onClose?.()
        return
      }
      if (e.key === 'Tab' && dialogRef.current) {
        const focusable = dialogRef.current.querySelectorAll(
          'button, [href], input, select, textarea, [tabindex]:not([tabindex="-1"])'
        )
        if (focusable.length === 0) return
        const first = focusable[0]
        const last = focusable[focusable.length - 1]
        if (e.shiftKey) {
          if (document.activeElement === first) { e.preventDefault(); last.focus() }
        } else {
          if (document.activeElement === last) { e.preventDefault(); first.focus() }
        }
      }
    }
    if (open) window.addEventListener('keydown', onKey)
    return () => window.removeEventListener('keydown', onKey)
  }, [open, onClose])

  if (!open) return null
  return (
    <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-page-enter">
      <div className="absolute inset-0 bg-black/60 backdrop-blur-md" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className={`relative w-full max-w-md p-8 outline-none transition-all duration-300 ${
          confirmText === 'Delete' ? 'border-red-500/20' : ''
        } ${
          title.includes('Edit') || title.includes('Add') || title.includes('New') ? 'border-brand-200' : ''
        } ${
          isAdmin
            ? 'admin-glass-card border border-brand-100 text-ink'
            : 'bg-white rounded-2xl shadow-xl border border-gray-100'
        }`}
      >
        <h2 id={titleId} className={`text-2xl font-extrabold tracking-tight ${
          isAdmin ? 'text-ink' : 'text-brand-700'
        }`}>{title}</h2>
        <div id={descId} className={`mt-4 ${
          isAdmin ? 'text-steel' : 'text-slate-600'
        }`}>{children}</div>
        <div className="mt-8 flex justify-end gap-3">
          <button 
            className={`px-5 py-2.5 rounded-xl font-bold transition-all ${
              isAdmin 
                ? 'bg-gray-100 hover:bg-gray-200 text-steel' 
                : 'bg-gray-100 hover:bg-gray-200 text-slate-700'
            }`} 
            onClick={onClose}
          >
            {cancelText}
          </button>
          <button 
            className={`px-6 py-2.5 rounded-xl font-bold text-white transition-all shadow-lg ${
              confirmText === 'Delete' 
                ? 'bg-red-500 hover:bg-red-600 shadow-red-500/20' 
                : 'bg-gradient-to-r from-brand-500 to-brand-600 shadow-brand-500/20 hover:scale-105'
            }`} 
            onClick={onConfirm}
          >
            {confirmText}
          </button>
        </div>
      </div>
    </div>
  )
}

