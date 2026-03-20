import { useState, useEffect } from 'react'
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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading lessons…</div></div>

  const onlyOneCourse = courses.length === 1

  return (
    <div className="animate-page-enter">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">Lesson Bank</h1>
          <p className="text-slate-400 font-medium">Manage and sequence educational curriculum modules.</p>
        </div>
        <button
          onClick={openAdd}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
        >
          ➕ Add New Lesson
        </button>
      </header>

      <div className="admin-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest w-16 text-center">Ord.</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Module Title</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Parent Course</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {lessons.map((l) => (
                <tr key={l.id} className="admin-table-row group">
                  <td className="px-6 py-4 text-center">
                    <span className="text-xs font-mono font-bold text-cyan-500/60 group-hover:text-cyan-400 transition-colors">#{l.lesson_order}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{l.title}</span>
                  </td>
                  <td className="px-6 py-4">
                    <span className="px-3 py-1 rounded-lg bg-white/5 border border-white/5 text-[10px] font-bold text-slate-400">{l.courseTitle || '—'}</span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(l)}
                        className="p-2.5 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-slate-400 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-500/20"
                        title="Edit Lesson"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteId(l.id)}
                        className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                        title="Delete Lesson"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!lessons.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-slate-500 italic font-medium">
                    The module bank is empty. Start by creating your first lesson above.
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
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative admin-glass-card w-full max-w-2xl p-8 border-white/10 outline-none max-h-[95vh] overflow-y-auto">
            <h2 className="text-2xl font-extrabold text-white mb-6">
              {editing ? 'Refine Lesson Module' : 'Configure New Module'}
            </h2>
            <div className="space-y-6">
              <div className="grid grid-cols-1 sm:grid-cols-2 gap-6">
                {onlyOneCourse ? (
                  <div className="sm:col-span-2">
                    <span className="block mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">Assigned Course</span>
                    <p className="bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-cyan-400 font-bold text-sm">{courses[0].title}</p>
                  </div>
                ) : (
                  <label className="block sm:col-span-2">
                    <span className="block mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">Parent Learning Path</span>
                    <select className="w-full bg-slate-800 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 outline-none transition appearance-none" value={form.course_id} onChange={e => setForm(f => ({ ...f, course_id: e.target.value }))}>
                      <option value="">Choose a path…</option>
                      {courses.map(c => <option key={c.id} value={c.id}>{c.title}</option>)}
                    </select>
                  </label>
                )}
                <label className="block sm:col-span-2">
                  <span className="block mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">Module Header</span>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="Lesson title..." />
                </label>
                <label className="block sm:col-span-2">
                  <span className="block mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">Module Content (Markdown/Rich Text)</span>
                  <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition resize-none font-mono text-sm" rows={6} value={form.content} onChange={e => setForm(f => ({ ...f, content: e.target.value }))} placeholder="Wait, what should they learn today?" />
                </label>
                <label className="block">
                  <span className="block mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">Display Sequence #</span>
                  <input type="number" min={1} className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition" value={form.lesson_order} onChange={e => setForm(f => ({ ...f, lesson_order: e.target.value }))} />
                </label>
              </div>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20" onClick={save}>
                {editing ? 'Commit Changes' : 'Initialize Module'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Decommission Lesson" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Are you certain? Terminating this module will also vaporize its associated quiz bank and all learner history for this lesson.
      </Modal>
    </div>
  )
}

