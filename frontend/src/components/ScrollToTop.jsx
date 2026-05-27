import { useEffect } from 'react'
import { useLocation } from 'react-router-dom'

/**
 * Scrolls the window to the top on every route change.
 * Drop this inside <BrowserRouter> / <Routes> parent.
 */
export default function ScrollToTop() {
  const { pathname } = useLocation()
  useEffect(() => {
    window.scrollTo({ top: 0, behavior: 'smooth' })
  }, [pathname])
  return null
}
