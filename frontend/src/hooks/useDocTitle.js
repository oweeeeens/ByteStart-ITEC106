import { useEffect } from 'react'

/**
 * Sets document.title when a page mounts. Resets on unmount.
 * @param {string} title — the page-specific portion, e.g. "Lessons"
 */
export default function useDocTitle(title) {
  useEffect(() => {
    const prev = document.title
    document.title = title ? `${title} — CompuBasics` : 'CompuBasics'
    return () => { document.title = prev }
  }, [title])
}
