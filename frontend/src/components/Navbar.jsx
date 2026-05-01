import { Link, NavLink, useNavigate } from 'react-router-dom'
import { useState } from 'react'
import { useApp } from '../context/AppContext.jsx'
import Modal from './ui/Modal.jsx'

export default function Navbar() {
  const { user, logout, progress } = useApp()
  const navigate = useNavigate()
  const [open, setOpen] = useState(false)
  const [confirmOpen, setConfirmOpen] = useState(false)

  // Count completed lessons for a quick stat
  const completedCount = Object.values(progress).filter(s => s === 'completed').length

  function handleLogoutConfirm() {
    setConfirmOpen(false)
    logout()
    navigate('/login')
  }
  const linkClass = ({ isActive }) =>
    `px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-200 ${
      isActive
        ? 'bg-white/20 text-white shadow-sm backdrop-blur-sm'
        : 'text-white/80 hover:text-white hover:bg-white/10'
    }`
  return (
    <nav id="main-nav" className="bg-gradient-to-r from-brand-600 via-brand-500 to-brand-600 text-white border-b border-brand-700/30 sticky top-0 z-50 shadow-lg" role="navigation" aria-label="Main navigation">
      <div className="max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
        <Link to="/" className="text-2xl font-extrabold heading text-white flex items-center gap-2 hover:scale-105 transition-transform">
          <span className="text-3xl">💻</span> CompuBasics
        </Link>
        <button
          aria-label={open ? 'Close menu' : 'Open menu'}
          aria-expanded={open}
          aria-controls="mobile-nav-menu"
          className="md:hidden text-white text-2xl p-2 rounded-xl hover:bg-white/10"
          onClick={() => setOpen(!open)}
        >
          {open ? '✕' : '☰'}
        </button>
        <div className="hidden md:flex items-center gap-1">
          <NavLink to="/" className={linkClass}>
            🏠 Home
          </NavLink>
          <NavLink to="/lessons" className={linkClass}>
            📖 Lessons
          </NavLink>
          <NavLink to="/profile" className={linkClass}>
            👤 Profile
          </NavLink>
          <NavLink to="/help" className={linkClass}>
            ❓ Help
          </NavLink>
          <NavLink to="/accessibility" className={linkClass}>
            ♿ Accessibility
          </NavLink>
          {user?.role === 'admin' && (
            <NavLink to="/admin" className={linkClass}>
              ⚙️ Admin
            </NavLink>
          )}
          {user ? (
            <div className="flex items-center gap-2 ml-2">
              {/* User greeting badge */}
              <div className="hidden lg:flex items-center gap-1.5 bg-white/15 backdrop-blur-sm text-white px-3 py-1.5 rounded-full text-xs font-bold border border-white/20">
                <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                <span>{user.email}</span>
                {completedCount > 0 && (
                  <span className="bg-yellow-400/30 text-yellow-100 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold ml-0.5">
                    ⭐{completedCount}
                  </span>
                )}
              </div>
              <button onClick={() => setConfirmOpen(true)} className="btn btn-danger text-sm px-4 py-2">
                Logout
              </button>
            </div>
          ) : (
            <>
              <NavLink to="/login" className={linkClass}>
                Login
              </NavLink>
              <NavLink to="/register" className={linkClass}>
                Register
              </NavLink>
            </>
          )}
        </div>
      </div>
      {open && (
        <div id="mobile-nav-menu" role="menu" className="md:hidden px-4 pb-4 space-y-1 animate-fadeIn">
          <div className="flex flex-col gap-1">
            <NavLink to="/" className={linkClass} onClick={() => setOpen(false)}>
              🏠 Home
            </NavLink>
            <NavLink to="/lessons" className={linkClass} onClick={() => setOpen(false)}>
              📖 Lessons
            </NavLink>
            <NavLink to="/profile" className={linkClass} onClick={() => setOpen(false)}>
              👤 Profile
            </NavLink>
            <NavLink to="/help" className={linkClass} onClick={() => setOpen(false)}>
              ❓ Help
            </NavLink>
            <NavLink to="/accessibility" className={linkClass} onClick={() => setOpen(false)}>
              ♿ Accessibility
            </NavLink>
            {user?.role === 'admin' && (
              <NavLink to="/admin" className={linkClass} onClick={() => setOpen(false)}>
                ⚙️ Admin
              </NavLink>
            )}
            {user ? (
              <>
                {/* Mobile user greeting */}
                <div className="flex items-center gap-2 bg-white/15 text-white px-3 py-2 rounded-xl text-sm font-bold border border-white/20 mb-1">
                  <span className="w-2 h-2 rounded-full bg-green-400 animate-pulse" />
                  <span>Hello, {user.email}!</span>
                  {completedCount > 0 && (
                    <span className="bg-yellow-400/30 text-yellow-100 px-1.5 py-0.5 rounded-full text-[10px] font-extrabold">
                      ⭐{completedCount}
                    </span>
                  )}
                </div>
                <button onClick={() => { setOpen(false); setConfirmOpen(true) }} className="btn btn-danger text-sm">
                  Logout
                </button>
              </>
            ) : (
              <>
                <NavLink to="/login" className={linkClass} onClick={() => setOpen(false)}>
                  Login
                </NavLink>
                <NavLink to="/register" className={linkClass} onClick={() => setOpen(false)}>
                  Register
                </NavLink>
              </>
            )}
          </div>
        </div>
      )}
      <Modal
        open={confirmOpen}
        title="Confirm Logout"
        onClose={() => setConfirmOpen(false)}
        onConfirm={handleLogoutConfirm}
        confirmText="Logout"
        cancelText="Cancel"
      >
        You will return to the Login page. Continue?
      </Modal>
    </nav>
  )
}
