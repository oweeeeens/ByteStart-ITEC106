import { useEffect, useRef, useId } from 'react'

export default function Modal({ open, title, children, onClose, onConfirm, confirmText = 'Confirm', cancelText = 'Cancel' }) {
  const dialogRef = useRef(null)
  const triggerRef = useRef(null)
  const titleId = useId()
  const descId = useId()

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
    <div className="fixed inset-0 z-50 flex items-center justify-center p-4 animate-fadeIn">
      <div className="absolute inset-0 bg-black/40 backdrop-blur-sm" aria-hidden="true" onClick={onClose} />
      <div
        ref={dialogRef}
        role="dialog"
        aria-modal="true"
        aria-labelledby={titleId}
        aria-describedby={descId}
        tabIndex={-1}
        className="relative bg-white rounded-2xl shadow-xl w-full max-w-md p-6 border border-gray-100 outline-none"
      >
        <h2 id={titleId} className="text-xl font-bold heading text-brand-700">{title}</h2>
        <div id={descId} className="mt-3 text-steel">{children}</div>
        <div className="mt-6 flex justify-end gap-3">
          <button className="btn btn-secondary" onClick={onClose}>{cancelText}</button>
          <button className="btn btn-danger" onClick={onConfirm}>{confirmText}</button>
        </div>
      </div>
    </div>
  )
}
