import { useState, useEffect } from 'react'
import { api } from '../../api/client.js'
import { useApp } from '../../context/AppContext.jsx'
import Modal from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/Toast.jsx'

export default function AdminUsers() {
  const { user: me } = useApp()
  const { showToast } = useToast()
  const [users, setUsers] = useState([])
  const [loading, setLoading] = useState(true)
  const [editUser, setEditUser] = useState(null)
  const [deleteId, setDeleteId] = useState(null)
  const [form, setForm] = useState({})

  async function load() {
    try {
      setLoading(true)
      const r = await api.admin.getUsers()
      setUsers(r.users)
    } catch (e) { showToast(e.message, 'error') }
    finally { setLoading(false) }
  }
  useEffect(() => { load() }, [])

  function openEdit(u) {
    setEditUser(u)
    setForm({ full_name: u.full_name, guardian_name: u.guardian_name || '', age: u.age || '', grade_level: u.grade_level || '', role: u.role })
  }

  async function saveEdit() {
    try {
      await api.admin.updateUser(editUser.id, {
        full_name: form.full_name,
        guardian_name: form.guardian_name,
        age: form.age ? Number(form.age) : null,
        grade_level: form.grade_level,
        role: form.role,
      })
      showToast('User updated ✓', 'success')
      setEditUser(null)
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  async function confirmDelete() {
    try {
      await api.admin.deleteUser(deleteId)
      showToast('User deleted ✓', 'success')
      setDeleteId(null)
      load()
    } catch (e) { showToast(e.message, 'error') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading users…</div></div>

  return (
    <div className="animate-page-enter">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">User Moderation</h1>
        <p className="text-slate-400 font-medium">View platform users and moderate accounts.</p>
      </header>

      <div className="admin-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-white/10 bg-white/5">
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Access Role</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-slate-400 uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {users.map((u) => (
                <tr key={u.id} className="admin-table-row group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-slate-700 to-slate-800 flex items-center justify-center text-lg shadow-inner">
                        👤
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-white group-hover:text-cyan-400 transition-colors uppercase tracking-tight">{u.full_name}</span>
                        <span className="text-[10px] font-mono text-slate-500">@{u.username}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin' 
                        ? 'bg-cyan-500/10 text-cyan-400 border border-cyan-500/20' 
                        : 'bg-slate-500/10 text-slate-400 border border-slate-500/20'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-slate-300">Grade {u.grade_level || 'N/A'}</span>
                      <span className="text-[10px] text-slate-500 uppercase tracking-tighter">Age: {u.age || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => { if (String(u.id) === String(me?.id)) { showToast('You cannot delete yourself', 'error'); return; } setDeleteId(u.id) }}
                        className="p-2.5 bg-white/5 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                        title="Delete User"
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Delete Account" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Are you sure you want to permanently remove this user account? This action cannot be reverted.
      </Modal>
    </div>
  )
}

