import { useState, useEffect, useMemo } from 'react'
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
  const [query, setQuery] = useState('')
  const [roleFilter, setRoleFilter] = useState('all')

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
      if (!editUser) return
      if (!form.full_name?.trim()) {
        showToast('Full name is required', 'error')
        return
      }
      if (!form.role) {
        showToast('Role is required', 'error')
        return
      }
      if (String(editUser.id) === String(me?.id) && form.role !== 'admin') {
        showToast('You cannot remove your own admin access.', 'error')
        return
      }
      await api.admin.updateUser(editUser.id, {
        full_name: form.full_name.trim(),
        guardian_name: form.guardian_name || '',
        age: form.age ? Number(form.age) : null,
        grade_level: form.grade_level || '',
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

  const filteredUsers = useMemo(() => {
    const q = query.trim().toLowerCase()
    return users.filter((u) => {
      const matchesQuery = !q || [u.full_name, u.email, u.guardian_name].some((val) => String(val || '').toLowerCase().includes(q))
      const matchesRole = roleFilter === 'all' || u.role === roleFilter
      return matchesQuery && matchesRole
    })
  }, [users, query, roleFilter])

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading users…</div></div>

  return (
    <div className="animate-page-enter max-w-6xl mx-auto space-y-8">
      <header className="flex flex-col gap-2">
        <h1 className="text-3xl font-extrabold heading text-ink">User Management</h1>
        <p className="text-steel font-medium">Review profiles, update roles, and manage access.</p>
      </header>

      <div className="admin-glass-card p-4 flex flex-col lg:flex-row lg:items-center gap-3">
        <div className="flex-1">
          <label className="sr-only" htmlFor="admin-user-search">Search users</label>
          <input
            id="admin-user-search"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            placeholder="Search by name, email, or guardian"
            className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
          />
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <label className="sr-only" htmlFor="admin-role-filter">Filter by role</label>
          <select
            id="admin-role-filter"
            value={roleFilter}
            onChange={(e) => setRoleFilter(e.target.value)}
            className="rounded-xl border border-gray-200 bg-white px-3 py-2.5 text-sm font-semibold text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
          >
            <option value="all">All Roles</option>
            <option value="admin">Admins</option>
            <option value="student">Students</option>
          </select>
          <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
            {filteredUsers.length} of {users.length}
          </span>
        </div>
      </div>

      <div className="admin-glass-card overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-left border-collapse">
            <thead>
              <tr className="border-b border-gray-100 bg-brand-50">
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest">User Profile</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest">Access Role</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest">Details</th>
                <th className="px-6 py-4 text-xs font-bold text-steel uppercase tracking-widest text-right">Actions</th>
              </tr>
            </thead>
            <tbody>
              {filteredUsers.map((u) => {
                const isSelf = String(u.id) === String(me?.id)
                return (
                <tr key={u.id} className="admin-table-row group">
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-3">
                      <div className="w-10 h-10 rounded-xl bg-gradient-to-br from-brand-500 to-brand-600 flex items-center justify-center text-lg text-white shadow-sm">
                        👤
                      </div>
                      <div className="flex flex-col">
                        <span className="text-sm font-bold text-ink group-hover:text-brand-700 transition-colors">{u.full_name}</span>
                        <span className="text-[11px] font-mono text-steel">{u.email}</span>
                      </div>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <span className={`px-3 py-1 rounded-lg text-[10px] font-bold uppercase tracking-wider ${
                      u.role === 'admin'
                        ? 'bg-brand-50 text-brand-700 border border-brand-100'
                        : 'bg-gray-50 text-steel border border-gray-200'
                    }`}>
                      {u.role}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-col gap-0.5">
                      <span className="text-xs font-bold text-ink">Grade {u.grade_level || 'N/A'}</span>
                      <span className="text-[10px] text-steel uppercase tracking-tighter">Age: {u.age || '—'}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex justify-end gap-2">
                      <button
                        onClick={() => openEdit(u)}
                        className="p-2.5 bg-white hover:bg-brand-50 rounded-xl text-steel hover:text-brand-700 transition-all border border-gray-200"
                        title="Edit User"
                        aria-label={`Edit ${u.full_name}`}
                      >
                        ✏️
                      </button>
                      <button
                        onClick={() => { if (isSelf) { showToast('You cannot delete yourself', 'error'); return; } setDeleteId(u.id) }}
                        className={`p-2.5 bg-white rounded-xl text-steel transition-all border border-gray-200 ${isSelf ? 'opacity-50 cursor-not-allowed' : 'hover:bg-red-50 hover:text-red-600'}`}
                        title="Delete User"
                        aria-label={`Delete ${u.full_name}`}
                        disabled={isSelf}
                      >
                        🗑️
                      </button>
                    </div>
                  </td>
                </tr>
              )})}
              {!filteredUsers.length && (
                <tr>
                  <td colSpan={4} className="px-6 py-12 text-center text-steel italic font-medium">
                    {users.length ? 'No users match your search.' : 'No users found yet.'}
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>

      <Modal
        open={!!editUser}
        title={editUser ? `Edit ${editUser.full_name}` : 'Edit User'}
        onClose={() => setEditUser(null)}
        onConfirm={saveEdit}
        confirmText="Save Changes"
        cancelText="Cancel"
      >
        <div className="space-y-4">
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
            <label className="block">
              <span className="block mb-2 text-xs font-bold uppercase tracking-widest text-steel">Full Name</span>
              <input
                value={form.full_name || ''}
                onChange={(e) => setForm((f) => ({ ...f, full_name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                placeholder="Full name"
              />
            </label>
            <label className="block">
              <span className="block mb-2 text-xs font-bold uppercase tracking-widest text-steel">Guardian Name</span>
              <input
                value={form.guardian_name || ''}
                onChange={(e) => setForm((f) => ({ ...f, guardian_name: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                placeholder="Guardian name"
              />
            </label>
            <label className="block">
              <span className="block mb-2 text-xs font-bold uppercase tracking-widest text-steel">Age</span>
              <input
                type="number"
                min={1}
                value={form.age ?? ''}
                onChange={(e) => setForm((f) => ({ ...f, age: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                placeholder="Age"
              />
            </label>
            <label className="block">
              <span className="block mb-2 text-xs font-bold uppercase tracking-widest text-steel">Grade Level</span>
              <input
                value={form.grade_level || ''}
                onChange={(e) => setForm((f) => ({ ...f, grade_level: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
                placeholder="Grade"
              />
            </label>
            <label className="block sm:col-span-2">
              <span className="block mb-2 text-xs font-bold uppercase tracking-widest text-steel">Role</span>
              <select
                value={form.role || 'student'}
                onChange={(e) => setForm((f) => ({ ...f, role: e.target.value }))}
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
              >
                <option value="student">Student</option>
                <option value="admin">Admin</option>
              </select>
            </label>
          </div>
          {editUser?.email && (
            <p className="text-xs text-steel">Account email: <span className="font-semibold text-ink">{editUser.email}</span></p>
          )}
        </div>
      </Modal>

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Delete Account" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Are you sure you want to permanently remove this user account? This action cannot be reverted.
      </Modal>
    </div>
  )
}

