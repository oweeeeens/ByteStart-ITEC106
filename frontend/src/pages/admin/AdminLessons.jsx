import { useState, useEffect, useMemo } from 'react'
import { api } from '../../api/client.js'
import Modal from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/Toast.jsx'

const emptyForm = { course_id: '', title: '', content: '', lesson_order: 1 }

export default function AdminLessons() {
  const { showToast } = useToast()
  const [lessons, setLessons] = useState([])
  const [courses, setCourses] = useState([])
  const [loading, setLoading] = useState(true)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyForm)
  const [deleteId, setDeleteId] = useState(null)
  const [query, setQuery] = useState('')
  const [courseFilter, setCourseFilter] = useState('all')

  async function load() {
    try {
      setLoading(true)
      const [lr, cr] = await Promise.all([api.admin.getLessons(), api.admin.getCourses()])
      setLessons(lr.lessons)
      setCourses(cr.courses)
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openAdd() {
    if (!courses.length) {
      showToast('Create a course before adding lessons.', 'warning')
      return
    }
    setEditing(null)
    setForm({ ...emptyForm, course_id: courses.length === 1 ? courses[0].id : '' })
    setShowModal(true)
  }
  function openEdit(l) {
    setEditing(l)
    setForm({ course_id: l.course_id, title: l.title, content: l.content || '', lesson_order: l.lesson_order })
    setShowModal(true)
  }

  async function save() {
    if (!form.title.trim()) { showToast('Title is required', 'error'); return }
    if (!form.course_id) { showToast('Course is required', 'error'); return }
    if (!form.content.trim()) { showToast('Content is required', 'error'); return }
    try {
      const payload = { ...form, lesson_order: Number(form.lesson_order) || 1 }
      if (editing) {
        await api.admin.updateLesson(editing.id, payload)
        showToast('Lesson updated ✓', 'success')
      } else {
        await api.admin.createLesson(payload)
        showToast('Lesson created ✓', 'success')
      }
      setShowModal(false)
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  async function confirmDelete() {
    try {
      await api.admin.deleteLesson(deleteId)
      showToast('Lesson deleted ✓', 'success')
      setDeleteId(null)
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  const onlyOneCourse = courses.length === 1
  const filteredLessons = useMemo(() => {
    const q = query.trim().toLowerCase()
    return lessons.filter((l) => {
      const matchesQuery = !q || [l.title, l.courseTitle].some((val) => String(val || '').toLowerCase().includes(q))
      const matchesCourse = courseFilter === 'all' || String(l.course_id) === String(courseFilter)
      return matchesQuery && matchesCourse
    })
  }, [lessons, query, courseFilter])

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading lessons…</div></div>

  return (
    <div className="animate-page-enter max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold heading text-ink mb-2">Lessons</h1>
          <p className="text-steel font-medium">Manage curriculum modules and control lesson order.</p>
        </div>
        <button
          onClick={openAdd}
          className={`px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-brand-500/20 ${!courses.length ? 'opacity-60 cursor-not-allowed hover:scale-100' : ''}`}
          disabled={!courses.length}
        >
          Add Lesson
        </button>
      </header>

      {!courses.length && (
        <div className="admin-glass-card p-6 border border-warning-100 bg-warning-50/60">
          <p className="text-steel font-medium">
            You need at least one course before adding lessons. Create a course first, then come back here to add modules.
          </p>
        </div>
      )}

      <div className="admin-glass-card p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1">
          <label className="sr-only" htmlFor="admin-lesson-search">Search lessons</label>
          <input
            id="admin-lesson-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by lesson title or course"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="admin-lesson-filter">Filter by course</label>
          <select
            id="admin-lesson-filter"
            value={courseFilter}
            onChange={(e) => setCourseFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
          >
            <option value="all">All Courses</option>
            {courses.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
            {filteredLessons.length} of {lessons.length}
          </span>
        </div>
      </div>

      <div className="admin-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-brand-50">
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest w-16 text-center">Order</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest">Lesson Title</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest">Course</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredLessons.map((l) => (
                <tr key={l.id} className="admin-table-row group">
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono font-bold text-brand-600 group-hover:text-brand-700 transition-colors">#{l.lesson_order}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-ink group-hover:text-brand-700 transition-colors">{l.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg bg-gray-50 border border-gray-200 text-[10px] font-bold text-steel">{l.courseTitle || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(l)}
                        className="p-2.5 bg-white hover:bg-brand-50 rounded-xl text-steel hover:text-brand-700 transition-all border border-gray-200"
                        title="Edit Lesson"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteId(l.id)}
                        className="p-2.5 bg-white hover:bg-red-50 rounded-xl text-steel hover:text-red-600 transition-all border border-gray-200"
                        title="Delete Lesson"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!filteredLessons.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-steel italic font-medium">
                    {lessons.length ? 'No lessons match your filters.' : 'The lesson library is empty. Start by creating your first lesson above.'}
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
          <div className="relative admin-glass-card w-full max-w-2xl p-8 border border-brand-100 outline-none max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold heading text-ink mb-6">
              {editing ? 'Edit Lesson' : 'Create Lesson'}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {onlyOneCourse ? (
                  <div className="sm:col-span-2">
                    <span className="block mb-2 font-bold text-steel text-xs uppercase tracking-widest">Assigned Course</span>
                    <p className="bg-brand-50 border border-brand-100 rounded-xl px-4 py-3 text-brand-700 font-bold text-sm">{courses[0].title}</p>
                  </div>
                ) : (
                  <label className="block sm:col-span-2">
                    <span className="block mb-2 font-bold text-steel text-xs uppercase tracking-widest">Course</span>
                    <select className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition appearance-none" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
                      <option value="">Choose a path…</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </label>
                )}
                <label className="block sm:col-span-2">
                  <span className="block mb-2 font-bold text-steel text-xs uppercase tracking-widest">Lesson Title</span>
                  <input className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Lesson title..." />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block mb-2 font-bold text-steel text-xs uppercase tracking-widest">Lesson Content</span>
                  <textarea className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none font-mono text-sm" rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="What should learners cover in this lesson?" />
                </label>
                <label className="block">
                  <span className="block mb-2 font-bold text-steel text-xs uppercase tracking-widest">Display Order</span>
                  <input type="number" min={1} className="w-full bg-white border border-gray-200 rounded-xl px-4 py-3 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition" value={form.lesson_order} onChange={e => setForm(f => ({ ...f, lesson_order: e.target.value }))} />
                </label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="px-6 py-3 bg-gray-100 hover:bg-gray-200 text-steel font-bold rounded-xl transition-all" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-8 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-brand-500/20" onClick={save}>
                {editing ? 'Save Changes' : 'Create Lesson'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Decommission Lesson" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Are you sure you want to remove this lesson? Its quiz bank and learner history will also be deleted.
      </Modal>
    </div>
  )
}

