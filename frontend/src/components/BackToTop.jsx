import { useState, useEffect } from 'react'

/**
 * Floating "back to top" button that appears when the user scrolls down.
 * Smoothly scrolls back to the top of the page.
 */
export default function BackToTop() {
  const [visible, setVisible] = useState(false)

  useEffect(() => {
    function onScroll() {
      setVisible(window.scrollY > 400)
    }
    window.addEventListener('scroll', onScroll, { passive: true })
    return () => window.removeEventListener('scroll', onScroll)
  }, [])

  if (!visible) return null

  return (
    <button
      onClick={() => window.scrollTo({ top: 0, behavior: 'smooth' })}
      aria-label="Back to top"
      className="fixed bottom-6 left-6 z-50 w-12 h-12 rounded-full bg-gradient-to-br from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl hover:scale-110 active:scale-95 transition-all duration-200 flex items-center justify-center text-xl animate-bounce-in focus:outline-none focus:ring-4 focus:ring-brand-200"
      title="Back to top"
    >
      ↑
    </button>
  )
}
