import { Routes, Route, Navigate } from 'react-router-dom'
import { AppProvider } from './context/AppContext.jsx'
import { ToastProvider } from './components/Toast.jsx'
import Lessons from './pages/Lessons.jsx'
import LessonDetail from './pages/LessonDetail.jsx'

function AppShell() {
  return (
    <div className="app-bg font-sans min-h-screen">
      {/* ── Top banner ────────────────────────────────────────────── */}
      <header id="site-header" className="sticky top-0 z-50 bg-brand-700 text-white text-center py-3 shadow-md">
        <span className="text-xl font-extrabold tracking-tight">📖 CompuBasics — Learning Module</span>
      </header>

      {/* ── Page content ──────────────────────────────────────────── */}
      <main
        id="main"
        aria-label="Main content"
        className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-6"
      >
        <Routes>
          {/* Default: redirect root to /lessons */}
          <Route path="/" element={<Navigate to="/lessons" replace />} />

          {/* Lessons list */}
          <Route path="/lessons" element={<Lessons />} />

          {/* Individual lesson detail */}
          <Route path="/lessons/:lessonId" element={<LessonDetail />} />

          {/* Catch-all: redirect unknown paths to lessons */}
          <Route path="*" element={<Navigate to="/lessons" replace />} />
        </Routes>
      </main>
    </div>
  )
}

export default function App() {
  return (
    <AppProvider>
      <ToastProvider>
        <AppShell />
      </ToastProvider>
    </AppProvider>
  )
}
