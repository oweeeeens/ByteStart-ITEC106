import { useState, useEffect, useMemo } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { api } from '../api/client.js'
import { lessons } from '../data/lessons.js'
import { quizBank } from '../data/quiz.js'
import { useApp } from '../context/AppContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useToast } from '../components/Toast.jsx'
import Confetti from '../components/Confetti.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

function getParaStyle(idx) {
  const styles = ['standard', 'highlighted', 'callout', 'standard', 'tip', 'standard', 'highlighted', 'callout', 'standard', 'tip']
  return styles[idx % styles.length]
}

const STYLE_CONFIG = {
  standard:    { icon: '📖', borderClass: 'border-l-4 border-l-brand-300', bgClass: 'bg-white' },
  highlighted: { icon: '💡', borderClass: 'border-l-4 border-l-yellow-400', bgClass: 'bg-yellow-50' },
  callout:     { icon: '🔍', borderClass: 'border-l-4 border-l-purple-400', bgClass: 'bg-purple-50' },
  tip:         { icon: '⭐', borderClass: 'border-l-4 border-l-green-400', bgClass: 'bg-green-50' },
}

const FUN_BOOSTS = [
  'Try explaining this section out loud in your own words.',
  'Find one real-life example for the concept you just learned.',
  'Challenge mode: summarize this section in 10 words.',
  'Teach this idea to a friend or classmate in under 30 seconds.',
  'Speed run: scan the key idea, then close your eyes and recall it.',
  'Detective mode: spot one term you can connect to a previous lesson.',
]

function getParaLabel(text) {
  const lower = (typeof text === 'string' ? text : text.text || '').toLowerCase()
  if (lower.startsWith('it is important') || lower.startsWith('always') || lower.includes('do not') || lower.includes('never')) return 'Remember'
  if (lower.includes('first') || lower.includes('million') || lower.includes('interesting') || lower.includes('did you know')) return 'Did You Know?'
  if (lower.includes('for example') || lower.includes('great for') || lower.includes('can also')) return 'Example'
  return null
}

function randomFrom(arr) {
  return arr[Math.floor(Math.random() * arr.length)]
}

function mapFallbackQuizQuestions(lessonKey) {
  return (quizBank[lessonKey] || []).map((q, idx) => ({
    id: `local-${lessonKey}-${idx}`,
    question_text: q.prompt,
    image_path: q.image || '',
    options: q.options || [],
    correct_index: q.answer,
    explanation: q.explanation || '',
  }))
}

function normalizeDbQuizQuestions(rawQuestions, dbLessonId) {
  return (rawQuestions || [])
    .map((q, idx) => {
      const options = (q.options || []).filter((opt) => typeof opt === 'string' && opt.trim() !== '')
      return {
        id: q.id ?? `db-${dbLessonId}-${idx}`,
        question_text: q.question_text || `Question ${idx + 1}`,
        image_path: q.image_path || '',
        options,
        correct_index: q.correct_index,
        explanation: q.explanation || '',
      }
    })
    .filter((q) => Number.isInteger(q.correct_index) && q.correct_index >= 0 && q.correct_index < q.options.length)
}

export default function LessonDetail() {
  const { lessonId } = useParams()
  const { progress, markLessonCompleted } = useApp()
  const { showToast } = useToast()
  const navigate = useNavigate()
  const lesson = lessons.find((l) => l.id === lessonId)
  useDocTitle(lesson ? lesson.title : 'Lesson')

  const [revealedSections, setRevealedSections] = useState({})
  const [inlineFunCheckAnswers, setInlineFunCheckAnswers] = useState({})
  const [masteredSections, setMasteredSections] = useState({})
  const [funBoostMessage, setFunBoostMessage] = useState('Hit "Spin Fun Boost" to get a surprise challenge!')
  const [showConfetti, setShowConfetti] = useState(false)

  const [dbQuestions, setDbQuestions] = useState([])
  const [qLoading, setQLoading] = useState(false)

  const [redirectCountdown, setRedirectCountdown] = useState(4)
  const [redirectActive, setRedirectActive] = useState(true)
  const [hasQueuedRedirect, setHasQueuedRedirect] = useState(false)

  const dbLessonId = useMemo(() => {
    const num = parseInt(lessonId.replace('lesson', ''), 10)
    return isNaN(num) ? null : num + 1
  }, [lessonId])

  useEffect(() => {
    setRevealedSections({})
    setInlineFunCheckAnswers({})
    setMasteredSections({})
    setFunBoostMessage('Hit "Spin Fun Boost" to get a surprise challenge!')
    setShowConfetti(false)

    setDbQuestions([])
    setRedirectCountdown(4)
    setRedirectActive(true)
    setHasQueuedRedirect(false)
  }, [lessonId])

  useEffect(() => {
    if (!lesson) return

    let cancelled = false

    async function loadQuizQuestions() {
      setQLoading(true)
      const fallbackQuestions = mapFallbackQuizQuestions(lesson.id)

      try {
        if (!dbLessonId) {
          if (!cancelled) setDbQuestions(fallbackQuestions)
          return
        }

        const response = await api.quiz(dbLessonId)
        const normalized = normalizeDbQuizQuestions(response.questions || [], dbLessonId)
        if (!cancelled) {
          setDbQuestions(normalized.length ? normalized : fallbackQuestions)
        }
      } catch (e) {
        console.error('Failed to load quizzes, using local fallback:', e)
        if (!cancelled) setDbQuestions(fallbackQuestions)
      } finally {
        if (!cancelled) setQLoading(false)
      }
    }

    loadQuizQuestions()
    return () => {
      cancelled = true
    }
  }, [dbLessonId, lesson])

  const isReview = lesson ? progress[lesson.id] === 'completed' : false
  const inlineFunChecks = lesson?.funChecks || []
  const totalQuizQuestions = dbQuestions.length

  const quickChecksCompletedCount = inlineFunChecks.reduce((count, check, idx) => {
    return inlineFunCheckAnswers[`inline-${idx}`] === check.answer ? count + 1 : count
  }, 0)

  const allInlineFunChecksCorrect = isReview || inlineFunChecks.length === 0 || inlineFunChecks.every((check, idx) => {
    const key = `inline-${idx}`
    return inlineFunCheckAnswers[key] === check.answer
  })

  const lessonReadyForQuiz = allInlineFunChecksCorrect && !qLoading

  useEffect(() => {
    if (!lessonReadyForQuiz || isReview) return
    setShowConfetti(true)
    const timer = setTimeout(() => setShowConfetti(false), 2600)
    return () => clearTimeout(timer)
  }, [lessonReadyForQuiz, isReview])

  useEffect(() => {
    if (isReview || !lessonReadyForQuiz || totalQuizQuestions === 0) return
    if (hasQueuedRedirect) return

    setHasQueuedRedirect(true)
    setRedirectActive(true)
    setRedirectCountdown(4)
    showToast('✅ Quick checks complete! Redirecting to the full quiz...', 'success')
  }, [hasQueuedRedirect, isReview, lessonReadyForQuiz, totalQuizQuestions, showToast])

  useEffect(() => {
    if (!lesson || !hasQueuedRedirect || !redirectActive) return
    if (redirectCountdown <= 0) {
      navigate(`/quiz/${lesson.id}`)
      return
    }

    const timer = setTimeout(() => {
      setRedirectCountdown((prev) => prev - 1)
    }, 1000)

    return () => clearTimeout(timer)
  }, [hasQueuedRedirect, redirectActive, redirectCountdown, lesson, navigate])

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

  const totalSections = lesson.content?.length || 0
  const firstBlockedInlineCheckIdx = isReview
    ? -1
    : inlineFunChecks.findIndex((check, idx) => inlineFunCheckAnswers[`inline-${idx}`] !== check.answer)
  const firstBlockedInlineCheck = firstBlockedInlineCheckIdx >= 0 ? inlineFunChecks[firstBlockedInlineCheckIdx] : null
  const maxVisibleSectionIndex = firstBlockedInlineCheck
    ? Math.max(-1, Math.min(firstBlockedInlineCheck.after, totalSections - 1))
    : totalSections - 1
  const visibleSectionCount = totalSections > 0 ? maxVisibleSectionIndex + 1 : 0
  const hiddenSectionCount = Math.max(totalSections - visibleSectionCount, 0)

  const sectionProgressPercent = totalSections === 0 ? 100 : Math.round((visibleSectionCount / totalSections) * 100)
  const quickCheckProgressPercent = inlineFunChecks.length === 0 ? 100 : Math.round((quickChecksCompletedCount / inlineFunChecks.length) * 100)
  const revealedCount = Object.values(revealedSections).filter(Boolean).length
  const masteredVisibleCount = Array.from({ length: visibleSectionCount }).reduce((count, _, idx) => {
    return masteredSections[idx] ? count + 1 : count
  }, 0)
  const allVisibleMastered = visibleSectionCount > 0 && masteredVisibleCount === visibleSectionCount
  const missionPoints = quickChecksCompletedCount * 40 + masteredVisibleCount * 15 + revealedCount * 5

  function toggleReveal(idx) {
    setRevealedSections((prev) => ({ ...prev, [idx]: !prev[idx] }))
  }

  function toggleMasteredSection(idx) {
    setMasteredSections((prev) => {
      const next = { ...prev, [idx]: !prev[idx] }
      if (next[idx]) showToast('⭐ Section mastered!', 'success')
      return next
    })
  }

  function spinFunBoost() {
    setFunBoostMessage(randomFrom(FUN_BOOSTS))
  }

  function answerInlineFunCheck(checkIdx, optionIdx, isCorrect) {
    const key = `inline-${checkIdx}`
    if (inlineFunCheckAnswers[key] !== undefined) return
    setInlineFunCheckAnswers((prev) => ({ ...prev, [key]: optionIdx }))

    if (isCorrect) {
      showToast('🎉 Correct! New content unlocked!', 'success')
    } else {
      showToast('❌ Not quite right. Try again!', 'error')
      setTimeout(() => {
        setInlineFunCheckAnswers((prev) => {
          const next = { ...prev }
          delete next[key]
          return next
        })
      }, 1500)
    }
  }

  function renderInlineFunCheck(check, checkIdx) {
    const key = `inline-${checkIdx}`
    const answered = inlineFunCheckAnswers[key] !== undefined
    const userAnswer = inlineFunCheckAnswers[key]
    const isCorrect = userAnswer === check.answer
    const checkAnswerIdx = check.answer

    return (
      <div key={key} className="my-8 animate-slide-up">
        <Card className="p-6 border border-brand-200 bg-white shadow-md">
          <div className="flex flex-wrap items-center gap-2 mb-3">
            <span className="inline-flex items-center gap-1 rounded-full border border-brand-200 bg-brand-50 px-3 py-1 text-xs font-bold text-brand-700">
              🧠 Quick Check
            </span>
            <span className="text-xs font-semibold text-gray-500">Answer this to unlock the next section</span>
          </div>

          <p className="text-gray-800 text-lg font-bold mb-4">{check.question}</p>

          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3 mb-4">
            {check.options.map((opt, oi) => {
              let btnClass = 'bg-white border-2 border-brand-200 hover:border-brand-400 hover:bg-brand-50 text-gray-800'
              if (answered) {
                if (oi === checkAnswerIdx) btnClass = 'bg-green-100 text-green-700 border-2 border-green-500 shadow-md'
                else if (oi === userAnswer && !isCorrect) btnClass = 'bg-red-100 text-red-700 border-2 border-red-500'
                else btnClass = 'bg-gray-50 text-gray-400 border-2 border-gray-200 opacity-60'
              }

              return (
                <button
                  key={oi}
                  onClick={() => answerInlineFunCheck(checkIdx, oi, oi === checkAnswerIdx)}
                  disabled={answered}
                  className={`text-left px-4 py-3 rounded-lg font-bold transition-all duration-300 ${btnClass}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>

          {answered && (
            <div className={`p-4 rounded-lg border ${isCorrect ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'}`}>
              <p className={`font-semibold ${isCorrect ? 'text-green-700' : 'text-red-700'}`}>
                {isCorrect ? '✅ Correct!' : '❌ Try again:'} {check.explanation}
              </p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  function renderSection(idx) {
    const item = lesson.content[idx]
    const paraText = typeof item === 'string' ? item : item.text
    const paraImage = typeof item === 'object' ? item.image : null
    const paraAlt = typeof item === 'object' ? item.alt : ''
    const paraCaption = typeof item === 'object' ? item.caption : ''
    const style = getParaStyle(idx)
    const config = STYLE_CONFIG[style]
    const label = getParaLabel(paraText)
    const sectionNum = idx + 1
    const hasImage = !!paraImage
    const isRevealable = style === 'callout' || style === 'tip'
    const mastered = !!masteredSections[idx]

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
              <div className="flex flex-wrap items-center gap-2 mb-2">
                <span className="text-lg" aria-hidden="true">{config.icon}</span>
                {label && (
                  <span className={`inline-block text-xs font-bold px-2.5 py-0.5 rounded-full ${
                    label === 'Remember' ? 'bg-red-100 text-red-700' :
                    label === 'Did You Know?' ? 'bg-purple-100 text-purple-700' :
                    'bg-blue-100 text-blue-700'
                  }`}>
                    {label === 'Remember' ? '⚠️' : label === 'Did You Know?' ? '🤔' : '📌'} {label}
                  </span>
                )}
                {mastered && (
                  <span className="inline-block text-xs font-bold px-2.5 py-0.5 rounded-full bg-green-100 text-green-700">
                    ⭐ Mastered
                  </span>
                )}
              </div>

              <p className="text-gray-800 text-base leading-relaxed">{paraText}</p>

              <div className="mt-3 flex flex-wrap gap-2">
                <button
                  onClick={() => toggleMasteredSection(idx)}
                  className={`inline-flex items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-bold border transition-all ${
                    mastered
                      ? 'bg-green-100 text-green-700 border-green-300'
                      : 'bg-white text-brand-700 border-brand-200 hover:bg-brand-50 hover:border-brand-300'
                  }`}
                >
                  {mastered ? '✅ Marked as Mastered' : '✨ Mark as Mastered'}
                </button>

                {isRevealable && (
                  <button
                    onClick={() => toggleReveal(idx)}
                    className="reveal-btn inline-flex items-center gap-2 text-sm font-bold text-brand-700 bg-brand-50 hover:bg-brand-100 px-4 py-2 rounded-xl transition-all border border-brand-200"
                  >
                    {revealedSections[idx] ? '📖 Hide Extra Info' : '💡 Tap to Learn More'}
                    <span className={`transition-transform duration-300 ${revealedSections[idx] ? 'rotate-180' : ''}`}>▼</span>
                  </button>
                )}
              </div>

              {isRevealable && revealedSections[idx] && (
                <div className="mt-3 bg-white rounded-xl p-4 border border-brand-100 animate-slide-up">
                  <p className="text-sm text-gray-700 leading-relaxed">
                    {style === 'callout'
                      ? `🔍 Fun Fact: This concept is a major checkpoint. Understanding "${paraText.slice(0, 50)}..." will help you with the full quiz.`
                      : '⭐ Pro Tip: Add this point to your memory list before moving to the next section.'}
                  </p>
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
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto pb-24" role="region" aria-label={`Lesson: ${lesson.title}`}>
      <Confetti active={showConfetti} />

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

      {lesson.points && (
        <Card className="p-5 bg-gradient-to-r from-brand-50 to-blue-50 border-brand-200">
          <h2 className="text-xl font-bold text-brand-700 mb-3 flex items-center gap-2">
            <span className="text-2xl">🎯</span> What You Will Learn
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

      <Card className="p-5 border border-brand-200 bg-white shadow-sm">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-3">
          <div>
            <h2 className="text-2xl font-extrabold text-brand-700 heading flex items-center gap-2">
              <span>🎮</span> Learning Arcade
            </h2>
            <p className="text-sm text-gray-600 mt-1">Complete checkpoints, master sections, and build your score.</p>
          </div>
          <Button variant="secondary" className="font-extrabold" onClick={spinFunBoost}>🎲 Spin Fun Boost</Button>
        </div>

        <div className="mt-4 rounded-xl border border-brand-100 bg-brand-50 px-4 py-3 text-sm font-semibold text-brand-700">
          {funBoostMessage}
        </div>

        <div className="mt-4 grid grid-cols-1 sm:grid-cols-3 gap-3">
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Mission Points</p>
            <p className="text-2xl font-extrabold text-brand-700 mt-1">{missionPoints}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Sections Mastered</p>
            <p className="text-2xl font-extrabold text-green-700 mt-1">{masteredVisibleCount} / {visibleSectionCount}</p>
          </div>
          <div className="rounded-xl border border-gray-200 bg-gray-50 px-4 py-3">
            <p className="text-xs font-bold uppercase tracking-wide text-gray-500">Quick Checks</p>
            <p className="text-2xl font-extrabold text-blue-700 mt-1">{quickChecksCompletedCount} / {inlineFunChecks.length}</p>
          </div>
        </div>

        <div className="mt-4 space-y-3">
          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1">
              <span>Lesson Unlock Progress</span>
              <span>{sectionProgressPercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-500 transition-all duration-500" style={{ width: `${sectionProgressPercent}%` }} />
            </div>
          </div>

          <div>
            <div className="flex items-center justify-between text-xs font-bold text-gray-600 mb-1">
              <span>Checkpoint Progress</span>
              <span>{quickCheckProgressPercent}%</span>
            </div>
            <div className="h-2.5 rounded-full bg-gray-200 overflow-hidden">
              <div className="h-full rounded-full bg-gradient-to-r from-green-500 to-emerald-500 transition-all duration-500" style={{ width: `${quickCheckProgressPercent}%` }} />
            </div>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-2">
          {allVisibleMastered && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-green-100 text-green-700 border border-green-200">
              🏅 Mastery Streak Unlocked
            </span>
          )}
          {quickChecksCompletedCount > 0 && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-blue-100 text-blue-700 border border-blue-200">
              🔐 Checkpoint Runner
            </span>
          )}
          {revealedCount >= 2 && (
            <span className="inline-flex items-center rounded-full px-3 py-1 text-xs font-bold bg-purple-100 text-purple-700 border border-purple-200">
              📚 Explorer Badge
            </span>
          )}
        </div>
      </Card>

      {lesson.content && (
        <div className="mt-8">
          <h2 className="text-2xl font-extrabold text-brand-700 heading flex items-center gap-2 mb-6">
            <span className="text-2xl">📖</span> Lesson Content
          </h2>

          {lesson.content.slice(0, maxVisibleSectionIndex + 1).map((_, i) => {
            const quickCheckAfterThis = inlineFunChecks.find((check) => check.after === i)
            const quickCheckIndex = quickCheckAfterThis ? inlineFunChecks.indexOf(quickCheckAfterThis) : -1
            const quickCheckAnswered = quickCheckIndex === -1
              ? true
              : inlineFunCheckAnswers[`inline-${quickCheckIndex}`] === quickCheckAfterThis.answer

            return (
              <div key={`section-${i}`}>
                {renderSection(i)}
                {quickCheckAfterThis && renderInlineFunCheck(quickCheckAfterThis, quickCheckIndex)}

                {quickCheckAfterThis && !quickCheckAnswered && !isReview && (
                  <div className="my-6 rounded-xl border-2 border-dashed border-brand-300 bg-white px-4 py-3 text-center">
                    <p className="font-extrabold text-brand-700">🔐 Checkpoint Locked</p>
                    <p className="text-sm text-gray-600 mt-1">Answer the quick check above to unlock the next section.</p>
                  </div>
                )}
              </div>
            )
          })}

          {firstBlockedInlineCheck && (
            <Card className="mt-4 p-0 overflow-hidden border border-brand-200 bg-white shadow-md">
              <div className="px-5 py-3 bg-gradient-to-r from-brand-50 to-blue-50 border-b border-brand-100">
                <h3 className="text-lg font-extrabold text-brand-700">🚧 Learning Gate</h3>
              </div>
              <div className="p-5">
                <p className="text-gray-700 font-semibold">
                  You are very close. Complete the checkpoint above to unlock the next chapter and launch the full quiz.
                </p>
                <div className="mt-4 h-2.5 rounded-full bg-gray-200 overflow-hidden">
                  <div className="h-full rounded-full bg-gradient-to-r from-brand-500 to-blue-500" style={{ width: `${sectionProgressPercent}%` }} />
                </div>
                <div className="mt-3 flex flex-wrap items-center justify-between gap-2 text-sm font-semibold text-gray-600">
                  <span>{visibleSectionCount} of {totalSections} sections unlocked</span>
                  <span>{hiddenSectionCount} section{hiddenSectionCount === 1 ? '' : 's'} still locked</span>
                </div>
              </div>
            </Card>
          )}
        </div>
      )}

      {allInlineFunChecksCorrect && lesson.images && lesson.images.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-blue-50 to-pink-50 border-blue-200 mt-8">
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

      {allInlineFunChecksCorrect && lesson.points && (
        <Card className="p-5 bg-gradient-to-br from-green-50 to-blue-50 border-2 border-green-200 mt-8">
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

      {lessonReadyForQuiz && !isReview && (
        <Card className="mt-12 p-6 border-2 border-brand-300 bg-gradient-to-r from-brand-50 to-blue-50 shadow-lg">
          <h2 className="text-2xl font-extrabold text-brand-700 heading flex items-center gap-2">
            <span>🚀</span> Ready for Full Quiz
          </h2>

          {totalQuizQuestions > 0 ? (
            <>
              <p className="mt-2 text-gray-700 text-lg">
                Great work. You will now take the full quiz on its own page.
              </p>
              <p className="mt-2 font-bold text-blue-700">
                {redirectActive
                  ? `Auto-redirecting in ${redirectCountdown} second${redirectCountdown === 1 ? '' : 's'}...`
                  : 'Auto-redirect paused. Launch the quiz when you are ready.'}
              </p>

              <div className="mt-5 flex flex-col sm:flex-row gap-3">
                <Button
                  variant="primary"
                  className="text-lg px-8 py-3"
                  onClick={() => navigate(`/quiz/${lesson.id}`)}
                >
                  📝 Start Full Quiz Now
                </Button>
                {redirectActive ? (
                  <Button variant="secondary" className="text-lg px-6 py-3" onClick={() => setRedirectActive(false)}>
                    Pause Auto-Redirect
                  </Button>
                ) : (
                  <Button
                    variant="secondary"
                    className="text-lg px-6 py-3"
                    onClick={() => {
                      setRedirectActive(true)
                      setRedirectCountdown(4)
                    }}
                  >
                    Resume Auto-Redirect
                  </Button>
                )}
              </div>
            </>
          ) : (
            <>
              <p className="mt-2 text-gray-700 text-lg">
                No full quiz is available yet for this lesson. You can still complete it now.
              </p>
              <div className="mt-5">
                <Button
                  variant="success"
                  className="text-lg px-8 py-3"
                  onClick={() => {
                    markLessonCompleted(lesson.id)
                    showToast('🎉 Lesson completed! Next lesson unlocked.', 'success')
                    setTimeout(() => navigate('/lessons'), 700)
                  }}
                >
                  ✅ Complete Lesson
                </Button>
              </div>
            </>
          )}
        </Card>
      )}

      {isReview && (
        <Card className="mt-12 p-6 border-2 border-green-300 bg-gradient-to-r from-green-50 to-blue-50">
          <h2 className="text-2xl font-extrabold text-green-700 heading flex items-center gap-2">
            <span>✅</span> Lesson Already Completed
          </h2>
          <p className="mt-2 text-gray-700">
            You can review this lesson, or jump straight to the full quiz again.
          </p>
          <div className="mt-5 flex flex-col sm:flex-row gap-3">
            <Link to={`/quiz/${lesson.id}`}>
              <Button variant="primary" className="text-lg px-8 py-3 w-full sm:w-auto">
                📝 Take Full Quiz
              </Button>
            </Link>
            <Link to="/lessons">
              <Button variant="secondary" className="text-lg px-8 py-3 w-full sm:w-auto">
                ← Back to Lessons
              </Button>
            </Link>
          </div>
        </Card>
      )}
    </div>
  )
}
