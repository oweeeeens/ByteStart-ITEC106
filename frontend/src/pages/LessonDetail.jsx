import { useState, useEffect, useRef, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { lessons } from '../data/lessons.js'
import { useApp } from '../context/AppContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useToast } from '../components/Toast.jsx'
import Confetti from '../components/Confetti.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

function getParaStyle(idx, total) {
  const styles = ['standard', 'highlighted', 'callout', 'standard', 'tip', 'standard', 'highlighted', 'callout', 'standard', 'tip']
  return styles[idx % styles.length]
}

const STYLE_CONFIG = {
  standard:    { icon: '📖', borderClass: 'border-l-4 border-l-brand-300', bgClass: 'bg-white' },
  highlighted: { icon: '💡', borderClass: 'border-l-4 border-l-yellow-400', bgClass: 'bg-yellow-50' },
  callout:     { icon: '🔍', borderClass: 'border-l-4 border-l-purple-400', bgClass: 'bg-purple-50' },
  tip:         { icon: '⭐', borderClass: 'border-l-4 border-l-green-400', bgClass: 'bg-green-50' },
}

function getParaLabel(text) {
  const lower = (typeof text === 'string' ? text : text.text || '').toLowerCase()
  if (lower.startsWith('it is important') || lower.startsWith('always') || lower.includes('do not') || lower.includes('never')) return 'Remember'
  if (lower.includes('first') || lower.includes('million') || lower.includes('interesting') || lower.includes('did you know')) return 'Did You Know?'
  if (lower.includes('for example') || lower.includes('great for') || lower.includes('can also')) return 'Example'
  return null
}

export default function LessonDetail() {
  const { lessonId } = useParams()
  const { progress, markLessonCompleted } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const lesson = lessons.find((l) => l.id === lessonId)
  useDocTitle(lesson ? lesson.title : 'Lesson')

  const [revealedSections, setRevealedSections] = useState({})
  const [funCheckAnswers, setFunCheckAnswers] = useState({})
  const [funCheckRevealed, setFunCheckRevealed] = useState({})
  const [showConfetti, setShowConfetti] = useState(false)
  const [lessonComplete, setLessonComplete] = useState(false)
  
  const contentRef = useRef(null)
  const completionRef = useRef(null)

  const [dbQuestions, setDbQuestions] = useState([])
  const [qLoading, setQLoading] = useState(false)
  const [currentQuizIndex, setCurrentQuizIndex] = useState(0)

  const dbLessonId = useMemo(() => {
    const num = parseInt(lessonId.replace('lesson', ''))
    return isNaN(num) ? null : num + 1
  }, [lessonId])

  useEffect(() => {
    if (!dbLessonId || !lesson) return
    setQLoading(true)
    api.quiz(dbLessonId)
      .then(r => setDbQuestions(r.questions || []))
      .catch(e => console.error('Failed to load quizzes:', e))
      .finally(() => setQLoading(false))
  }, [dbLessonId, lesson])

  const isReview = lesson ? progress[lesson.id] === 'completed' : false

  useEffect(() => {
    // If there are NO questions, or ALL questions are answered, mark as completed
    if (lessonComplete || !lesson || isReview) return
    if (!qLoading) {
      if (dbQuestions.length === 0) {
        setLessonComplete(true)
      } else if (Object.keys(funCheckRevealed).length >= dbQuestions.length) {
        setLessonComplete(true)
      }
    }
  }, [funCheckRevealed, lessonComplete, lesson, isReview, dbQuestions, qLoading])

  useEffect(() => {
    if (!lessonComplete || isReview) return
    const el = completionRef.current
    if (!el) return
    const observer = new IntersectionObserver(([entry]) => {
      if (entry.isIntersecting) {
        setShowConfetti(true)
        observer.disconnect()
      }
    }, { threshold: 0.3 })
    observer.observe(el)
    return () => observer.disconnect()
  }, [lessonComplete, isReview])

  if (!lesson) return <div className="text-center py-12 text-xl text-steel">Lesson not found.</div>
  const status = progress[lesson.id]
  const locked = status === 'locked'

  if (locked) {
    return (
      <div className="space-y-4 animate-fadeIn" role="region" aria-label="Lesson locked">
        <div className="mb-4">
          <Link to="/lessons" className="text-brand-600 font-bold hover:text-brand-700 text-lg">
            ← Back to Lessons
          </Link>
        </div>
        <Card className="p-8 text-center bg-gradient-to-br from-yellow-50 to-orange-50 border-yellow-200">
          <div className="text-6xl mb-4">🔒</div>
          <h1 className="text-3xl font-extrabold heading text-yellow-700 mb-3">Lesson Locked</h1>
          <p className="text-steel text-lg max-w-md mx-auto">
            <strong>{lesson.title}</strong> is not available yet. Complete the previous lesson first to unlock this one.
          </p>
          <div className="mt-6">
            <Link to="/lessons">
              <Button variant="primary" className="text-lg px-6 py-3">📖 Go to Lessons</Button>
            </Link>
          </div>
        </Card>
      </div>
    )
  }

  const totalSections = (lesson.content?.length || 0)
  const totalFunChecks = dbQuestions.length

  function toggleReveal(idx) {
    setRevealedSections(prev => ({ ...prev, [idx]: !prev[idx] }))
  }

  function answerFunCheck(checkId, optionIdx, isCorrect) {
    if (funCheckRevealed[checkId]) return
    setFunCheckAnswers(prev => ({ ...prev, [checkId]: optionIdx }))
    setFunCheckRevealed(prev => ({ ...prev, [checkId]: true }))
    
    if (isCorrect) {
      showToast('🎉 Correct! Great job!', 'success')
    } else {
      showToast('Not quite — review the explanation!', 'info')
    }
  }

  function renderSection(idx) {
    const item = lesson.content[idx]
    const paraText = typeof item === 'string' ? item : item.text
    const paraImage = typeof item === 'object' ? item.image : null
    const paraAlt = typeof item === 'object' ? item.alt : ''
    const paraCaption = typeof item === 'object' ? item.caption : ''
    const style = getParaStyle(idx, totalSections)
    const config = STYLE_CONFIG[style]
    const label = getParaLabel(paraText)
    const sectionNum = idx + 1
    const hasImage = !!paraImage
    const isRevealable = style === 'callout' || style === 'tip'

    return (
      <div
        key={`content-${idx}`}
        className={`rounded-xl p-5 ${config.borderClass} ${config.bgClass} shadow-sm hover:shadow-md transition-all duration-300 fun-hover animate-slide-up mb-4`}
        role="region"
        aria-label={`Section ${sectionNum} of ${totalSections}`}
      >
        <div className={`flex ${hasImage ? 'flex-col sm:flex-row' : ''} items-start gap-3`}>
          <div className={`flex items-start gap-3 ${hasImage ? 'sm:flex-1' : 'flex-1'}`}>
            <div className="flex-shrink-0 w-9 h-9 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center mt-0.5 shadow-sm">
              {sectionNum}
            </div>
            <div className="flex-1">
              {label && (
                <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full mb-2 ${
                  label === 'Remember' ? 'bg-red-100 text-red-700' :
                  label === 'Did You Know?' ? 'bg-purple-100 text-purple-700' :
                  'bg-blue-100 text-blue-700'
                }`}>
                  {label === 'Remember' ? '⚠️' : label === 'Did You Know?' ? '🤔' : '📌'} {label}
                </span>
              )}
              <p className="text-gray-800 text-base leading-relaxed">{paraText}</p>

              {isRevealable && (
                <div className="mt-3">
                  <button
                    onClick={() => toggleReveal(idx)}
                    className="reveal-btn inline-flex items-center gap-2 text-sm font-bold text-brand-600 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-all border border-brand-200"
                  >
                    {revealedSections[idx] ? '📖 Hide Extra Info' : '💡 Tap to Learn More!'}
                    <span className={`transition-transform duration-300 ${revealedSections[idx] ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                  {revealedSections[idx] && (
                    <div className="mt-3 bg-white rounded-xl p-4 border border-brand-100 animate-slide-up">
                      <p className="text-sm text-gray-700 leading-relaxed">
                        {style === 'callout'
                          ? `🔍 Fun Fact: This is one of the most important concepts in this lesson. Understanding "${paraText.slice(0, 50)}..." will help you answer the knowledge checks!`
                          : `⭐ Pro Tip: Try to remember this key point — it often comes up when reviewing the lesson!`
                        }
                      </p>
                    </div>
                  )}
                </div>
              )}
            </div>
          </div>

          {hasImage && (
            <figure className="sm:w-48 md:w-56 flex-shrink-0 bg-white rounded-xl p-2 border border-gray-100 shadow-sm mt-3 sm:mt-0 self-center">
              <img
                src={paraImage}
                alt={paraAlt || 'Lesson illustration'}
                className="w-full h-32 sm:h-36 object-contain rounded-lg"
                onError={(e) => {
                  e.target.style.display = 'none'
                }}
              />
              {paraCaption && (
                <figcaption className="text-center text-xs font-bold text-brand-600 mt-1.5">
                  {paraCaption}
                </figcaption>
              )}
            </figure>
          )}
        </div>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-24" role="region" aria-label={`Lesson: ${lesson.title}`} ref={contentRef}>
      <Confetti active={showConfetti} />

      {/* ─── Header ─────────────────────────────── */}
      <div className="flex items-center justify-between mb-4">
        <Link to="/lessons" className="text-brand-600 font-bold hover:text-brand-700 text-lg">
          ← Back to Lessons
        </Link>
      </div>

      <Card className="p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-pink-50 border-blue-200" role="article" aria-label={lesson.title}>
        <div className="p-6 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-700 heading flex items-center gap-3">
            <span className="text-4xl">📚</span> {lesson.title}
          </h1>
          <p className="mt-2 text-gray-600 text-lg">{lesson.summary}</p>
        </div>
        <div className="bg-white mx-6 mb-6 rounded-2xl p-4 border border-gray-100 shadow-sm">
          <img
            src={lesson.image}
            alt={lesson.alt || lesson.title || 'Lesson overview'}
            className="w-full max-h-72 object-contain rounded-xl"
          />
        </div>
      </Card>

      {/* ─── What You'll Learn ───────────────────────────────────────── */}
      {lesson.points && (
        <Card className="p-5 bg-gradient-to-r from-brand-50 to-blue-50 border-brand-200">
          <h2 className="text-xl font-bold text-brand-700 mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span> What You'll Learn
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-2">
            {lesson.points.slice(0, 6).map((pt, idx) => (
              <div key={idx} className="flex items-start gap-2 text-sm text-gray-700">
                <span className="text-green-500 font-bold mt-0.5">✓</span>
                <span>{pt}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Lesson Content ──────────────────────────────────────────── */}
      {lesson.content && (
        <div className="mt-8">
          <h2 className="text-2xl font-extrabold text-brand-700 heading flex items-center gap-2 mb-6">
            <span className="text-2xl">📖</span> Lesson Content
          </h2>
          {lesson.content.map((_, i) => renderSection(i))}
        </div>
      )}

      {/* ─── Images Gallery ──────────────────────────────────────────── */}
      {lesson.images && lesson.images.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-indigo-50 to-pink-50 border-indigo-200 mt-8">
          <h2 className="text-2xl font-bold heading text-brand-700 mb-4 flex items-center gap-2">
            <span>🖼️</span> Visual Guide
          </h2>
          <div className="grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-4">
            {lesson.images.map((img, idx) => (
              <figure key={idx} className="bg-white rounded-xl p-3 border border-gray-100 shadow-sm fun-hover">
                <img
                  src={img.src}
                  alt={img.alt || img.caption || 'Lesson image'}
                  className="w-full h-40 object-contain rounded-lg"
                />
                <figcaption className="mt-2 text-center text-sm font-bold text-brand-600">
                  {img.caption}
                </figcaption>
              </figure>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Key Points Summary ──────────────────────────────────────── */}
      {lesson.points && (
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200 mt-8">
          <h2 className="text-2xl font-bold text-green-700 heading flex items-center gap-2">
            <span>📋</span> Key Takeaways
          </h2>
          <div className="space-y-2 mt-4">
            {lesson.points.map((pt, idx) => (
              <div key={idx} className="flex items-start gap-3 bg-white rounded-xl px-4 py-3 border border-green-100 shadow-sm fun-hover">
                <span className="flex-shrink-0 w-7 h-7 rounded-full bg-green-500 text-white text-xs font-bold flex items-center justify-center mt-0.5">
                  ✓
                </span>
                <span className="text-gray-800 leading-relaxed">{pt}</span>
              </div>
            ))}
          </div>
        </Card>
      )}

      {/* ─── Quiz Carousel ────────────────────────────────────────────── */}
      {!qLoading && totalFunChecks > 0 && (
        <Card className="mt-12 p-6 border-2 border-brand-300 bg-gradient-to-br from-brand-50 to-indigo-50 shadow-lg">
          <div className="flex items-center justify-between mb-6">
            <h2 className="text-2xl font-extrabold text-brand-700 heading flex items-center gap-2">
              <span className="text-2xl">🧠</span> Knowledge Check
            </h2>
            <div className="bg-white px-4 py-1.5 rounded-full border border-brand-200 text-sm font-bold text-brand-600">
              Question {currentQuizIndex + 1} of {totalFunChecks}
            </div>
          </div>

          <div className="bg-white rounded-2xl p-6 shadow-sm border border-brand-100">
            {(() => {
              const currentQ = dbQuestions[currentQuizIndex]
              const checkId = currentQ.id
              const answered = funCheckRevealed[checkId]
              const userAnswer = funCheckAnswers[checkId]
              const isCorrect = userAnswer === currentQ.correct_index

              return (
                <div key={checkId} className="animate-fade-in">
                  <p className="text-gray-800 text-xl font-bold mb-6 leading-relaxed">
                    {currentQ.question_text}
                  </p>
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-6">
                    {currentQ.options.filter(o => o).map((opt, oi) => {
                      let btnClass = 'bg-gray-50 border-2 border-gray-200 hover:border-brand-400 hover:bg-brand-50 text-gray-800'
                      if (answered) {
                        if (oi === currentQ.correct_index) btnClass = 'bg-emerald-50 text-emerald-700 border-2 border-emerald-500 shadow-md transform scale-[1.02]'
                        else if (oi === userAnswer) btnClass = 'bg-red-50 text-red-700 border-2 border-red-500'
                        else btnClass = 'bg-gray-50 text-gray-400 border-2 border-gray-200 opacity-50'
                      }
                      
                      return (
                        <button
                          key={oi}
                          onClick={() => answerFunCheck(checkId, oi, oi === currentQ.correct_index)}
                          disabled={answered}
                          className={`text-left px-5 py-4 rounded-xl font-bold text-[15px] transition-all duration-300 ${btnClass}`}
                        >
                          <div className="flex items-center">
                            <span className={`w-8 h-8 rounded-full flex items-center justify-center mr-3 font-bold border-2 ${
                              answered && oi === currentQ.correct_index ? 'bg-emerald-500 border-emerald-500 text-white' : 
                              answered && oi === userAnswer ? 'bg-red-500 border-red-500 text-white' : 
                              'bg-white border-gray-300 text-gray-500'
                            }`}>
                              {['A', 'B', 'C', 'D'][oi]}
                            </span>
                            <span className="flex-1">{opt}</span>
                            {answered && oi === currentQ.correct_index && <span className="text-xl">✅</span>}
                            {answered && oi === userAnswer && oi !== currentQ.correct_index && <span className="text-xl">❌</span>}
                          </div>
                        </button>
                      )
                    })}
                  </div>

                  {/* Carousel Controls */}
                  <div className="flex items-center justify-between pt-6 border-t border-gray-100">
                    <button
                      onClick={() => setCurrentQuizIndex(prev => Math.max(0, prev - 1))}
                      disabled={currentQuizIndex === 0}
                      className={`flex items-center gap-2 px-5 py-2.5 rounded-xl font-bold transition-all ${
                        currentQuizIndex === 0 
                          ? 'text-gray-400 cursor-not-allowed opacity-50' 
                          : 'bg-brand-50 text-brand-600 hover:bg-brand-100 hover:scale-105 cursor-pointer border border-brand-200'
                      }`}
                    >
                      <span className="text-xl">←</span> Previous
                    </button>

                    <button
                      onClick={() => setCurrentQuizIndex(prev => prev + 1)}
                      disabled={!isCorrect || currentQuizIndex === totalFunChecks - 1}
                      className={`flex items-center gap-2 px-6 py-2.5 rounded-xl font-bold transition-all ${
                        !isCorrect || currentQuizIndex === totalFunChecks - 1
                          ? 'bg-gray-100 text-gray-400 cursor-not-allowed'
                          : 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer animate-pulse-glow'
                      }`}
                    >
                      Next <span className="text-xl">→</span>
                    </button>
                  </div>
                </div>
              )
            })()}
          </div>
        </Card>
      )}

      {/* ─── Lesson Complete Celebration ─────────────────────────────── */}
      {lessonComplete && (
        <div ref={completionRef} className="mt-8 animate-slide-up">
          <Card className={`p-8 text-center bg-gradient-to-r from-green-50 via-white to-emerald-50 border-2 border-emerald-300 ${isReview ? '' : 'animate-bounce-in shadow-xl shadow-green-500/10'}`}>
            <div className="text-6xl mb-4">🏆</div>
            <h2 className="text-3xl font-extrabold text-green-700 heading">
              {isReview ? 'Already Completed!' : 'Lesson Complete!'}
            </h2>
            <p className="text-gray-600 text-lg mt-2 mb-6">
              {isReview 
                ? 'You already completed this lesson. Review it anytime or head back to lessons.' 
                : 'Amazing job! You mastered all the concepts block by block!'}
            </p>

            {isReview ? (
               <Link to="/lessons">
                 <Button variant="secondary" className="text-lg px-8 py-4 w-full sm:w-auto">
                   ← Back to Lessons
                 </Button>
               </Link>
             ) : (
               <Button
                 variant="primary"
                 className="text-xl px-10 py-4 w-full sm:w-auto transform hover:scale-105 transition-all shadow-xl bg-gradient-to-r from-green-500 to-emerald-500 hover:from-green-600 hover:to-emerald-600 text-white border-transparent"
                 onClick={() => {
                   markLessonCompleted(lesson.id)
                   showToast('🎉 Lesson completed! Next lesson unlocked!', 'success')
                   setTimeout(() => navigate('/lessons'), 800)
                 }}
               >
                 ✅ Complete Lesson &amp; Continue
               </Button>
             )}
          </Card>
        </div>
      )}
    </div>
  )
}
