import { useState, useEffect } from 'react'
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

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading courses…</div></div>

  return (
    <div className="animate-page-enter">
      <header className="mb-10 flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-3xl font-extrabold text-white mb-2">System Courses</h1>
          <p className="text-slate-400 font-medium">Structure and categorize platform content paths.</p>
        </div>
        <button
          onClick={openAdd}
          className="px-8 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-2xl font-bold hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
        >
          ➕ Create Course
        </button>
      </header>

      <div className="admin-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Course Detail</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Overview</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {courses.map((c) => (
                <tr key={c.id} className="admin-table-row group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="p-2.5 rounded-xl bg-white/5 text-xl">📁</div>
                      <span className="text-md font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{c.title}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-slate-400 max-w-md truncate italic font-medium">
                    {c.description || 'No description provided.'}
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(c)}
                        className="p-2.5 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-slate-400 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-500/20"
                        title="Edit Course"
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => setDeleteId(c.id)}
                        className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                        title="Delete Course"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
              {!courses.length && (
                <tr>
                  <td colSpan={3} className="px-6 py-12 text-center text-slate-500 italic font-medium">
                    No learning paths registered yet. Use the action button above to start.
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
          <div className="relative admin-glass-card w-full max-w-lg p-8 border-white/10 outline-none">
            <h2 className="text-2xl font-extrabold text-white mb-6">
              {editing ? 'Update Course Context' : 'Register New Course'}
            </h2>
            <div className="space-y-6">
              <label className="block">
                <span className="block mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">Display Title</span>
                <input className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition" value={form.title} onChange={e => setForm(f => ({ ...f, title: e.target.value }))} placeholder="e.g. Introduction to Computing" />
              </label>
              <label className="block">
                <span className="block mb-2 font-bold text-slate-400 text-xs uppercase tracking-widest">Descriptive Overview</span>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition resize-none" rows={4} value={form.description} onChange={e => setForm(f => ({ ...f, description: e.target.value }))} placeholder="Briefly describe what students will learn..." />
              </label>
            </div>
            <div className="mt-8 flex justify-end gap-3">
              <button className="px-6 py-3 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-xl transition-all" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-8 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20" onClick={save}>
                {editing ? 'Apply Updates' : 'Confirm Registration'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Remove Course" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Confirm deletion of this course path? Warning: All associated lessons, quizzes and student progress data will be permanently wiped.
      </Modal>
    </div>
  )
}

