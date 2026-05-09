import { useState, useEffect, useMemo } from 'react'
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
  const [query, setQuery] = useState('')

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
      const scoreValue = Number(r.passing_score)
      setPassingScore(Number.isFinite(scoreValue) ? scoreValue : 70)
      setScoreDirty(false)
    } catch (e) { showToast(e.message, 'error') }
    finally { setQLoading(false) }
  }

  function selectLesson(l) {
    setSelectedLesson(l)
    setQuery('')
    loadQuestions(l.id)
  }

  function openAdd() {
    setEditing(null)
    setForm({ ...emptyQ })
    setShowModal(true)
  }
  function openEdit(q) {
    setEditing(q)
    const normalized = q.options.map((opt) => opt || '')
    setForm({ question_text: q.question_text, options: normalized, correct_answer: q.correct_answer, image_path: q.image_path || '' })
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
    const isTF = form.options[0]?.trim() === 'True' && form.options[1]?.trim() === 'False' && !form.options[2]?.trim() && !form.options[3]?.trim()
    const requiredCount = isTF ? 2 : 4
    if (form.options.slice(0, requiredCount).some(o => !o.trim())) { 
      showToast(`All ${requiredCount} options are required`, 'error')
      return 
    }
    if (isTF && form.correct_answer > 1) {
      showToast('True/False questions must use A or B as the correct answer.', 'error')
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

  const letters = ['A', 'B', 'C', 'D']
  const filteredQuestions = useMemo(() => {
    const q = query.trim().toLowerCase()
    if (!q) return questions
    return questions.filter((item) => String(item.question_text || '').toLowerCase().includes(q))
  }, [questions, query])

  if (loading) return <div className="flex justify-center py-12"><div className="animate-pulse text-brand-500 text-lg font-bold">Loading…</div></div>

  return (
    <div className="animate-page-enter max-w-6xl mx-auto space-y-8">
      <header>
        <h1 className="text-3xl font-extrabold heading text-ink mb-2">Quizzes</h1>
        <p className="text-steel font-medium">Manage question banks and passing scores.</p>
      </header>

      {/* Lesson Selector */}
      <div>
        <label className="block mb-3 font-bold text-steel text-xs uppercase tracking-widest">Select Lesson</label>
        <div className="flex flex-wrap gap-2">
          {lessons.map((l, i) => (
            <button
              key={l.id}
              onClick={() => selectLesson(l)}
              className={`px-5 py-2.5 rounded-xl text-sm font-bold transition-all border ${
                selectedLesson?.id === l.id
                  ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-400 shadow-lg shadow-brand-500/20'
                  : 'bg-white text-steel border-gray-200 hover:bg-brand-50 hover:text-brand-700'
              }`}
            >
              Lesson {i + 1}: {l.title}
            </button>
          ))}
        </div>
        {!lessons.length && (
          <div className="admin-glass-card p-6 mt-4 text-steel">
            No lessons found yet. Create a lesson first to build a quiz.
          </div>
        )}
      </div>

      {selectedLesson && (
        <>
          {/* Passing Score */}
          <div className="admin-glass-card p-6 flex flex-wrap items-center justify-between gap-6">
            <div className="flex items-center gap-4">
              <div className="w-12 h-12 rounded-xl bg-brand-50 flex items-center justify-center text-xl">🏆</div>
              <div>
                <p className="text-ink font-bold tracking-tight">Passing Score</p>
                <p className="text-xs text-steel font-medium uppercase">Required percentage to pass</p>
              </div>
            </div>
            <div className="flex items-center gap-4">
              <input
                type="number"
                min={0}
                max={100}
                className="w-20 bg-white border border-gray-200 rounded-xl px-2 py-3 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition text-center font-mono font-bold text-brand-700 text-xl"
                value={passingScore}
                onChange={e => { setPassingScore(e.target.value); setScoreDirty(true) }}
              />
              {scoreDirty && (
                <button 
                  onClick={savePassingScore} 
                  className="px-6 py-3 bg-brand-50 hover:bg-brand-100 text-brand-700 rounded-xl font-bold transition-all border border-brand-100"
                >
                  Apply
                </button>
              )}
            </div>
          </div>

          {/* Header */}
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-xl font-extrabold text-ink tracking-tight flex items-center gap-3">
              <span className="text-steel">Bank:</span>
              {selectedLesson.title}
            </h2>
            <button
              onClick={openAdd}
              className="px-6 py-3 bg-gradient-to-r from-brand-500 to-brand-600 text-white rounded-xl font-bold hover:scale-105 transition-all shadow-lg shadow-brand-500/20"
            >
              Add Question
            </button>
          </div>

          <div className="admin-glass-card p-4 mb-6 flex flex-col md:flex-row md:items-center gap-3">
            <div className="flex-1">
              <label className="sr-only" htmlFor="admin-question-search">Search questions</label>
              <input
                id="admin-question-search"
                value={query}
                onChange={(e) => setQuery(e.target.value)}
                placeholder="Search by question text"
                className="w-full rounded-xl border border-gray-200 bg-white px-4 py-2.5 text-ink placeholder:text-gray-400 focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition"
              />
            </div>
            <span className="text-xs font-bold uppercase tracking-widest text-brand-700 bg-brand-50 border border-brand-100 rounded-lg px-3 py-2">
              {filteredQuestions.length} of {questions.length}
            </span>
          </div>

          {qLoading ? (
            <div className="text-center text-brand-600 py-12 animate-pulse font-bold tracking-widest">FETCHING QUESTIONS...</div>
          ) : questions.length === 0 ? (
            <div className="admin-glass-card p-12 text-center text-steel italic font-medium">
              This lesson has no questions yet. Add your first question to get started.
            </div>
          ) : filteredQuestions.length === 0 ? (
            <div className="admin-glass-card p-8 text-center text-steel italic font-medium">
              No questions match your search.
            </div>
          ) : (
            <div className="space-y-4">
              {filteredQuestions.map((q, i) => {
                const displayOptions = q.options
                  .map((opt, idx) => ({ opt, idx }))
                  .filter((item) => String(item.opt || '').trim())
                return (
                <div key={q.id} className="admin-glass-card p-6 group transition-all duration-300">
                  <div className="flex justify-between items-start gap-4">
                    <div className="flex-1">
                      <div className="flex items-center gap-3 mb-4">
                        <span className="text-xs font-mono font-bold text-brand-600 uppercase">Question {i + 1}</span>
                        <div className="h-px flex-1 bg-gray-100" />
                      </div>
                      <p className="text-lg font-bold text-ink mb-6 leading-relaxed">
                        {q.question_text}
                      </p>
                      <div className="flex flex-wrap gap-2 mb-6">
                        {q.image_path && (
                          <div className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-gray-50 border border-gray-200 w-fit">
                            <span className="text-sm">🖼️</span>
                            <span className="text-[10px] font-mono text-steel uppercase tracking-tighter truncate max-w-xs">{q.image_path}</span>
                          </div>
                        )}
                      </div>
                      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
                        {displayOptions.map(({ opt, idx }) => (
                          <div key={idx} className={`relative flex items-center px-4 py-3 rounded-xl border transition-all ${
                            idx === q.correct_answer
                              ? 'bg-emerald-50 border-emerald-200 text-emerald-700'
                              : 'bg-white border-gray-200 text-steel'
                          }`}>
                            <span className={`w-6 h-6 rounded-full flex items-center justify-center text-[10px] font-bold mr-3 ${
                              idx === q.correct_answer ? 'bg-emerald-500 text-white shadow-lg shadow-emerald-500/20' : 'bg-gray-100 text-steel'
                            }`}>
                              {letters[idx]}
                            </span>
                            <span className="text-sm font-medium">{opt}</span>
                            {idx === q.correct_answer && (
                              <div className="absolute top-2 right-2 w-2 h-2 rounded-full bg-emerald-500 animate-pulse" />
                            )}
                          </div>
                        ))}
                      </div>
                    </div>
                    <div className="flex flex-col gap-2">
                      <button 
                        onClick={() => openEdit(q)} 
                        className="p-3 bg-white hover:bg-brand-50 rounded-xl text-steel hover:text-brand-700 transition-all border border-gray-200"
                        title="Edit Question"
                      >
                        ✏️
                      </button>
                      <button 
                        onClick={() => setDeleteId(q.id)} 
                        className="p-3 bg-white hover:bg-red-50 rounded-xl text-steel hover:text-red-600 transition-all border border-gray-200"
                        title="Delete Question"
                      >
                        🗑️
                      </button>
                    </div>
                  </div>
                </div>
              )})}
            </div>
          )}
        </>
      )}

      {/* Add/Edit Question Modal */}
      {showModal && (
        <div className="fixed inset-0 z-[100] flex items-start justify-center p-4 sm:pt-12 animate-page-enter">
          <div className="absolute inset-0 bg-slate-900/40 backdrop-blur-sm" onClick={() => setShowModal(false)} />
          <div className="relative admin-glass-card w-full max-w-2xl p-8 border border-brand-100 outline-none max-h-[90vh] overflow-y-auto">
            <header className="flex items-center justify-between mb-8">
              <h2 className="text-2xl font-extrabold heading text-ink">
                {editing ? 'Edit Question' : 'Create Question'}
              </h2>
              <div className="flex bg-gray-50 p-1 rounded-xl border border-gray-200">
                <button 
                  onClick={() => {
                    const isTF = form.options[0]?.trim() === 'True' && form.options[1]?.trim() === 'False' && !form.options[2]?.trim() && !form.options[3]?.trim()
                    if (!isTF) {
                      setForm(f => ({ ...f, options: ['True', 'False', '', ''], correct_answer: 0 }))
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    (form.options[0]?.trim() === 'True' && form.options[1]?.trim() === 'False' && !form.options[2]?.trim() && !form.options[3]?.trim())
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-steel hover:text-ink'
                  }`}
                >
                  True/False
                </button>
                <button 
                  onClick={() => {
                    const isTF = form.options[0]?.trim() === 'True' && form.options[1]?.trim() === 'False' && !form.options[2]?.trim() && !form.options[3]?.trim()
                    if (isTF) {
                      setForm(f => ({ ...f, options: ['', '', '', ''], correct_answer: 0 }))
                    }
                  }}
                  className={`px-3 py-1.5 rounded-lg text-[10px] font-bold uppercase tracking-widest transition-all ${
                    !(form.options[0]?.trim() === 'True' && form.options[1]?.trim() === 'False' && !form.options[2]?.trim() && !form.options[3]?.trim())
                      ? 'bg-brand-500 text-white shadow-lg shadow-brand-500/20'
                      : 'text-steel hover:text-ink'
                  }`}
                >
                  Multiple Choice
                </button>
              </div>
            </header>

            <div className="space-y-8">
              <label className="block">
                <span className="block mb-3 font-bold text-steel text-xs uppercase tracking-widest">Question</span>
                <textarea className="w-full bg-white border border-gray-200 rounded-2xl px-5 py-4 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition resize-none text-lg font-medium leading-relaxed" rows={3} value={form.question_text} onChange={e => setForm(f => ({ ...f, question_text: e.target.value }))} placeholder="Write the question prompt..." />
              </label>
              
              <div>
                <span className="block mb-4 font-bold text-steel text-xs uppercase tracking-widest">
                  { (form.options[0]?.trim() === 'True' && form.options[1]?.trim() === 'False' && !form.options[2]?.trim() && !form.options[3]?.trim()) ? 'True / False Options' : 'Multiple Choice Options' }
                </span>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  {letters.map((letter, i) => {
                    const isTF = form.options[0]?.trim() === 'True' && form.options[1]?.trim() === 'False' && !form.options[2]?.trim() && !form.options[3]?.trim()
                    if (isTF && i > 1) return null
                    return (
                      <div key={i} className={`flex items-center gap-4 p-4 rounded-2xl border transition-all ${
                        form.correct_answer === i ? 'bg-emerald-50 border-emerald-200' : 'bg-white border-gray-200'
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
                            form.correct_answer === i ? 'bg-emerald-500 text-white rotate-12 scale-110 shadow-emerald-500/20' : 'bg-gray-100 text-steel group-hover:bg-gray-200'
                          }`}>
                            {letter}
                          </div>
                        </label>
                        <input
                          className={`flex-1 bg-transparent border-none text-ink focus:ring-0 placeholder-gray-400 font-medium py-0 ${isTF ? 'cursor-not-allowed opacity-80' : ''}`}
                          value={form.options[i]}
                          onChange={e => !isTF && updateOption(i, e.target.value)}
                          placeholder={`Option ${letter}`}
                          readOnly={isTF}
                        />
                      </div>
                    )
                  })}
                </div>
                <p className="mt-4 text-xs font-medium text-steel uppercase tracking-widest flex items-center gap-2">
                  <span className="w-2 h-2 rounded-full bg-emerald-500" />
                  Select the correct answer label
                </p>
              </div>

              <div className="w-full">
                <label className="block">
                  <span className="block mb-3 font-bold text-steel text-xs uppercase tracking-widest">Image Path (Optional)</span>
                  <input className="w-full bg-white border border-gray-200 rounded-xl px-5 py-4 text-ink focus:border-brand-400 focus:ring-2 focus:ring-brand-100 outline-none transition font-mono text-sm" value={form.image_path} onChange={e => setForm(f => ({ ...f, image_path: e.target.value }))} placeholder="/images/lesson-1/question-1.png" />
                </label>
              </div>
            </div>
            <div className="mt-10 flex justify-end gap-3 pt-6 border-t border-gray-200">
              <button className="px-6 py-4 bg-gray-100 hover:bg-gray-200 text-steel font-bold rounded-2xl transition-all" onClick={() => setShowModal(false)}>Cancel</button>
              <button className="px-10 py-4 bg-gradient-to-r from-brand-500 to-brand-600 text-white font-bold rounded-2xl hover:scale-105 transition-all shadow-lg shadow-brand-500/20" onClick={save}>
                {editing ? 'Save Changes' : 'Create Question'}
              </button>
            </div>
          </div>
        </div>
      )}

      {/* Delete Confirmation */}
      <Modal open={!!deleteId} title="Delete Question" onClose={() => setDeleteId(null)} onConfirm={confirmDelete} confirmText="Delete" cancelText="Cancel">
        Are you sure you want to delete this question? This action cannot be undone.
      </Modal>
    </div>
  )
}

