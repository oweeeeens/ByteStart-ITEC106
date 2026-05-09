import { useState, useEffect, useMemo } from 'react'
import { api } from '../../api/client.js'
import Modal from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/Toast.jsx'

const empty = { title: '', description: '' }

export default function AdminCourses() {
  const { showToast } = useToast()
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(empty)
  const [deleteId, setDeleteId] = useState(null)
  const [query, setQuery] = useState('')

  async function load() {
    try {
      setLoading(true)
      const r = await api.admin.getCourses()
      setCourses(r.courses)
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    setEditing(null)
    setForm(empty)
    setShowModal(true)
  }
  function openEdit(c) {
    setEditing(c)
    setForm({ title: c.title, description: c.description || '' })
    setShowModal(true)
  }

  async function save() {
    if (!form.title.trim()) { showToast('Title is required', 'error'); return }
    try {
      if (editing) {
        await api.admin.updateCourse(editing.id, form)
        showToast('Course updated ✓', 'success')
      } else {
        await api.admin.createCourse(form)
        showToast('Course created ✓', 'success')
      }
      setShowModal(false)
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  async function confirmDelete() {
    try {
      await api.admin.deleteCourse(deleteId)
      showToast('Course deleted ✓', 'success')
      setDeleteId(null)
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  const filteredCourses = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return courses
    return courses.filter((c) => [c.title, c.description].some((val) => String(val || '').toLowerCase().includes(q)))
  }, [courses, query])

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading courses…</div></div>

  return (
    <div className="animate-page-enter max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold heading text-ink mb-2">Courses</h1>
          <p className="text-steel font-medium">Organize learning paths and manage course descriptions.</p>
        </div>
        <button
          onClick={openAdd}
          className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-brand-500/20"
        >
          Create Course
        </button>
      </header>

      <div className="admin-glass-card p-4 flex flex-col md:flex-row md:items-center gap-3">
        <div className="flex-1">
          <label className="sr-only" htmlFor="admin-course-search">Search courses</label>
          <input
            id="admin-course-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by course title or description"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
          />
        </div>
        <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
          {filteredCourses.length} of {courses.length}
        </span>
      </div>

      <div className="admin-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-brand-50">
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest">Course Detail</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest">Overview</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredCourses.map((c) => (
                <tr key={c.id} className="admin-table-row group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-brand-50 text-xl">📁</div>
                      <span className="text-md font-bold text-ink group-hover:text-brand-700 transition-colors">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-steel max-w-md truncate">
                    {c.description || 'No description provided.'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2.5 bg-white hover:bg-brand-50 rounded-xl text-steel hover:text-brand-700 transition-all border border-gray-200"
                        title="Edit Course"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-2.5 bg-white hover:bg-red-50 rounded-xl text-steel hover:text-red-600 transition-all border border-gray-200"
                        title="Delete Course"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredCourses.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-steel italic font-medium">
                    {courses.length ? 'No courses match your search.' : 'No learning paths registered yet. Use the action button above to start.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Add/Edit Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-center justify-center p-4 animate-page-enter">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative admin-glass-card w-full max-w-lg p-8 border border-brand-100 outline-none">
            <h2 className="text-2xl font-extrabold heading text-ink mb-6">
              {editing ? 'Update Course' : 'Create New Course'}
            </h2>
            <div className="space-y-6">
              <label className="block">
                <span className="block mb-2 font-bold text-steel text-xs uppercase tracking-widest">Title</span>
                <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Computing" />
              </label>
              <label className="block">
                <span className="block mb-2 font-bold text-steel text-xs uppercase tracking-widest">Description</span>
                <textarea className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Briefly describe what students will learn..." />
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-steel font-bold rounded-xl transition-all" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-8 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-500/20" onClick={save}>
                {editing ? 'Save Changes' : 'Create Course'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Remove Course" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Confirm deletion of this course? All associated lessons, quizzes, and student progress will be permanently removed.
      </Modal>
    </div>
  )
}

