import { useState, useEffect } from 'react'
import { api } from '../../api/client.js'
import Modal from '../../components/ui/Modal.jsx'
import { useToast } from '../../components/Toast.jsx'

const emptyQ = { question_text: '', options: ['', '', '', ''], correct_answer: 0, image_path: '' }

export default function AdminQuizzes() {
  const { showToast } = useToast()
  const [lessons, setLessons] = useState([])
  const [selectedLesson, setSelectedLesson] = useState(null)
  const [questions, setQuestions] = useState([])
  const [passingScore, setPassingScore] = useState(70)
  const [scoreDirty, setScoreDirty] = useState(false)
  const [loading, setLoading] = useState(true)
  const [qLoading, setQLoading] = useState(false)
  const [showModal, setShowModal] = useState(false)
  const [editing, setEditing] = useState(null)
  const [form, setForm] = useState(emptyQ)
  const [deleteId, setDeleteId] = useState(null)

  useEffect(() => {
    api.admin.getLessons()
      .then(r => { setLessons(r.lessons); setLoading(false) })
      .catch(e => { showToast(e.message, 'error'); setLoading(false) })
  }, [])

  async function loadQuestions(lessonId) {
    try {
      setQLoading(true)
      const r = await api.admin.getQuestions(lessonId)
      setQuestions(r.questions)
      setPassingScore(r.passing_score)
      setScoreDirty(false)
    } catch (e) { showToast(e.message, 'error') }
    finally { setQLoading(false) }
  }

  function selectLesson(l) {
    setSelectedLesson(l)
    loadQuestions(l.id)
  }

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyQ })
    setShowModal(true)
  }
  function openEdit(q) {
    setEditing(q)
    setForm({ question_text: q.question_text, options: [...q.options], correct_answer: q.correct_answer, image_path: q.image_path || '' })
    setShowModal(true)
  }

  function updateOption(idx, val) {
    setForm(f => {
      const opts = [...f.options]
      opts[idx] = val
      return { ...f, options: opts }
    })
  }

  async function save() {
    if (!form.question_text.trim()) { showToast('Question text is required', 'error'); return }
    const isTF = form.options[0] === 'True' && form.options[1] === 'False' && !form.options[2]
    const requiredCount = isTF ? 2 : 4
    if (form.options.slice(0, requiredCount).some(o => !o.trim())) { 
      showToast(`All ${requiredCount} options are required`, 'error')
      return 
    }
    try {
      if (editing) {
        await api.admin.updateQuestion(editing.id, form)
        showToast('Question updated ✓', 'success')
      } else {
        await api.admin.addQuestion(selectedLesson.id, form)
        showToast('Question added ✓', 'success')
      }
      setShowModal(false)
      loadQuestions(selectedLesson.id)
    } catch (e) { showToast(e.message, 'error') }
  }

  async function confirmDelete() {
    try {
      await api.admin.deleteQuestion(deleteId)
      showToast('Question deleted ✓', 'success')
      setDeleteId(null)
      loadQuestions(selectedLesson.id)
    } catch (e) { showToast(e.message, 'error') }
  }

  async function savePassingScore() {
    try {
      await api.admin.updatePassingScore(selectedLesson.id, Number(passingScore))
      showToast('Passing score updated ✓', 'success')
      setScoreDirty(false)
    } catch (e) { showToast(e.message, 'error') }
  }

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading…</div></div>

  const letters = ['A', 'B', 'C', 'D']

  return (
    <div className="animate-page-enter">
      <header className="mb-10">
        <h1 className="text-3xl font-extrabold text-white mb-2">Quiz Repository</h1>
        <p className="text-slate-400 font-medium">Configure assessment criteria and question banks.</p>
      </header>

      {/* Lesson Selector */}
      <div className="mb-10">
        <label className="block mb-3 font-bold text-slate-500 text-xs uppercase tracking-widest">Target Lesson Module</label>
        <div className="flex flex-wrap gap-2">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => selectLesson(l)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                selectedLesson?.id === l.id
                  ? 'bg-gradient-to-r from-cyan-500 to-blue-600 text-white border-cyan-400 shadow-lg shadow-cyan-500/20'
                  : 'bg-white/5 text-slate-400 border-white/5 hover:bg-white/10 hover:text-slate-200'
              }`}
            >
              Lesson {i + 1}: {l.title}
            </button>
          ))}
        </div>
      </div>

      {selectedLesson && (
        <>
          {/* Passing Score */}
          <div className="admin-glass-card p-6 mb-10 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-violet-500/10 flex items-center justify-center text-xl">🏆</div>
              <div>
                <p className="text-white font-bold tracking-tight">Requirement Threshold</p>
                <p className="text-xs text-slate-500 font-medium uppercase">Passing Score Percentage</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={0}
                max={100}
                className="w-20 bg-white/5 border border-white/10 rounded-xl px-2 py-3 focus:border-cyan-500/50 outline-none transition text-center font-mono font-bold text-cyan-400 text-xl"
                value={passingScore}
                onChange={e => { setPassingScore(e.target.value); setScoreDirty(true) }}
              />
              {scoreDirty && (
                <button 
                  onClick={savePassingScore} 
                  className="px-6 py-3 bg-cyan-500/20 hover:bg-cyan-500/30 text-cyan-400 rounded-xl font-bold transition-all border border-cyan-500/20"
                >
                  Apply
                </button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-white tracking-tight flex items-center gap-3">
              <span className="text-slate-500">Bank:</span>
              {selectedLesson.title}
            </h2>
            <button
              onClick={openAdd}
              className="px-6 py-3 bg-gradient-to-r from-cyan-500 to-blue-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-cyan-500/20"
            >
              ➕ Add Question
            </button>
          </div>

          {qLoading ? (
            <div className="text-center text-cyan-500 py-12 animate-pulse font-bold tracking-widest">FETCHING QUESTIONS...</div>
          ) : questions.length === 0 ? (
            <div className="admin-glass-card p-12 text-center text-slate-500 italic font-medium">
              This module doesn't have any assessment data yet. Initialize it by adding your first question.
            </div>
          ) : (
            <div className="space-y-4">
              {questions.map((q, i) => (
                <div key={q.id} className="admin-glass-card p-6 group transition-all duration-300">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-mono font-bold text-cyan-500/60 uppercase">Question {i + 1}</span>
                        <div className="h-px flex-1 bg-white/5" />
                      </div>
                      <p className="text-lg font-bold text-white mb-6 leading-relaxed">
                        {q.question_text}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {q.image_path && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/5 w-fit">
                            <span className="text-sm">🖼️</span>
                            <span className="text-[10px] font-mono text-slate-500 uppercase tracking-tighter truncate max-w-xs">{q.image_path}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {q.options.map((opt, oi) => (
                          <div key={oi} className={`relative flex items-center px-4 py-3 rounded-xl border transition-all ${
                            oi === q.correct_answer
                              ? 'bg-emerald-500/10 border-emerald-500/30 text-emerald-400'
                              : 'bg-white/5 border-white/5 text-slate-400'
                          }`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 ${
                              oi === q.correct_answer ? 'bg-emerald-500 text-emerald-900 shadow-lg shadow-emerald-500/20' : 'bg-white/10 text-slate-500'
                            }`}>
                              {letters[oi]}
                            </span>
                            <span className="text-sm font-medium">{opt}</span>
                            {oi === q.correct_answer && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => openEdit(q)} 
                        className="p-3 bg-white/5 hover:bg-cyan-500/20 rounded-xl text-slate-400 hover:text-cyan-400 transition-all border border-white/5 hover:border-cyan-500/20"
                        title="Edit Question"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => setDeleteId(q.id)} 
                        className="p-3 bg-white/5 hover:bg-red-500/20 rounded-xl text-slate-400 hover:text-red-400 transition-all border border-white/5 hover:border-red-500/20"
                        title="Delete Question"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:pt-12 animate-page-enter">
          <div className="absolute inset-0 bg-black/60 backdrop-blur-md" onClick={() => setShowModal(false)} />
          <div className="relative admin-glass-card w-full max-w-2xl p-8 border-white/10 outline-none max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold text-white">
                {editing ? 'Refine Question Logic' : 'Define Challenge Context'}
              </h2>
              <div className="flex bg-white/5 p-1 rounded-xl border border-white/10">
                <button 
                  onClick={() => {
                    const isTF = form.options[0] === 'True' && form.options[1] === 'False' && !form.options[2] && !form.options[3]
                    if (!isTF) {
                      setForm(f => ({ ...f, options: ['True', 'False', '', ''], correct_answer: 0 }))
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    (form.options[0] === 'True' && form.options[1] === 'False' && !form.options[2])
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  True/False
                </button>
                <button 
                  onClick={() => {
                    const isTF = form.options[0] === 'True' && form.options[1] === 'False' && !form.options[2]
                    if (isTF) {
                      setForm(f => ({ ...f, options: ['', '', '', ''], correct_answer: 0 }))
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    !(form.options[0] === 'True' && form.options[1] === 'False' && !form.options[2])
                      ? 'bg-cyan-500 text-white shadow-lg shadow-cyan-500/20'
                      : 'text-slate-500 hover:text-slate-300'
                  }`}
                >
                  Multiple Choice
                </button>
              </div>
            </header>

            <div className="space-y-8">
              <label className="block">
                <span className="block mb-3 font-bold text-slate-400 text-xs uppercase tracking-widest">Question Narrative</span>
                <textarea className="w-full bg-white/5 border border-white/10 rounded-2xl px-5 py-4 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition resize-none text-lg font-medium leading-relaxed" rows={3} value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} placeholder="Wait, what's the challenge?" />
              </label>
              
              <div>
                <span className="block mb-4 font-bold text-slate-400 text-xs uppercase tracking-widest">
                  { (form.options[0] === 'True' && form.options[1] === 'False' && !form.options[2]) ? 'Binary Truth State' : 'Response Matrix & Calibration' }
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {letters.map((letter, i) => {
                    const isTF = form.options[0] === 'True' && form.options[1] === 'False' && !form.options[2]
                    if (isTF && i > 1) return null
                    return (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        form.correct_answer === i ? 'bg-emerald-500/10 border-emerald-500/30' : 'bg-white/5 border-white/10'
                      }`}>
                        <label className="flex items-center cursor-pointer group">
                          <input
                            type="radio"
                            name="correct_answer"
                            checked={form.correct_answer === i}
                            onChange={() => setForm(f => ({ ...f, correct_answer: i }))}
                            className="hidden"
                          />
                          <div className={`w-8 h-8 rounded-xl flex items-center justify-center text-xs font-bold transition-all shadow-inner ${
                            form.correct_answer === i ? 'bg-emerald-500 text-emerald-900 rotate-12 scale-110 shadow-emerald-500/20' : 'bg-white/10 text-slate-500 group-hover:bg-white/20'
                          }`}>
                            {letter}
                          </div>
                        </label>
                        <input
                          className={`flex-1 bg-transparent border-none text-white focus:ring-0 placeholder-slate-600 font-medium py-0 ${isTF ? 'cursor-not-allowed opacity-80' : ''}`}
                          value={form.options[i]}
                          onChange={e => !isTF && updateOption(i, e.target.value)}
                          placeholder={`Option ${letter}`}
                          readOnly={isTF}
                        />
                      </div>
                    )
                  })}
                </div>
                <p className="mt-4 text-xs font-medium text-slate-500 uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Select the identifier bubble of the definitive correct response
                </p>
              </div>

              <div className="w-full">
                <label className="block">
                  <span className="block mb-3 font-bold text-slate-400 text-xs uppercase tracking-widest">Visual Asset Reference (Pointer)</span>
                  <input className="w-full bg-white/5 border border-white/10 rounded-xl px-5 py-4 text-white focus:border-cyan-500/50 focus:bg-white/10 outline-none transition font-mono text-sm" value={form.image_path} onChange={e => setForm(f => ({ ...f, image_path: e.target.value }))} placeholder="C:\Assets\Render_01.png..." />
                </label>
              </div>
            </div>
            <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-white/5">
              <button className="px-6 py-4 bg-white/5 hover:bg-white/10 text-slate-300 font-bold rounded-2xl transition-all" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-10 py-4 bg-gradient-to-r from-cyan-500 to-blue-600 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-cyan-500/20" onClick={save}>
                {editing ? 'Commit Refinement' : 'Deploy Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Decommission Challenge" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Are you certain you want to permanently vaporize this assessment challenge? This action is immutable.
      </Modal>
    </div>
  )
}

