import { useState, useEffect, useRef, useMemo, useCallback } from 'react'
import { useParams, Link, useNavigate } from 'react-router-dom'
import { lessons } from '../data/lessons.js'
import { useApp } from '../context/AppContext.jsx'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import { useToast } from '../components/Toast.jsx'
import Confetti from '../components/Confetti.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

// Assign visual style per paragraph to create variety
function getParaStyle(idx, total) {
  const styles = [
    'standard',
    'highlighted',
    'callout',
    'standard',
    'tip',
    'standard',
    'highlighted',
    'callout',
    'standard',
    'tip',
  ]
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
  const [funFactsFound, setFunFactsFound] = useState(0)
  const [unlockedGroup, setUnlockedGroup] = useState(0)
  const [readyTimers, setReadyTimers] = useState({})
  const startedTimers = useRef(new Set())
  const contentRef = useRef(null)
  const completionRef = useRef(null)
  const [navHeight, setNavHeight] = useState(0)

  useEffect(() => {
    function measure() {
      const header = document.getElementById('site-header')
      if (header) setNavHeight(header.offsetHeight)
    }
    measure()
    window.addEventListener('resize', measure)
    return () => window.removeEventListener('resize', measure)
  }, [])

  const sectionGroups = useMemo(() => {
    if (!lesson) return []
    const groups = []
    const checks = lesson.funChecks || []
    const content = lesson.content || []
    let startIdx = 0
    checks.forEach((check, ci) => {
      const endIdx = check.after
      const indices = []
      for (let i = startIdx; i <= endIdx && i < content.length; i++) indices.push(i)
      groups.push({ sections: indices, checkIndex: ci })
      startIdx = endIdx + 1
    })
    if (startIdx < content.length) {
      const indices = []
      for (let i = startIdx; i < content.length; i++) indices.push(i)
      groups.push({ sections: indices, checkIndex: null })
    }
    return groups
  }, [lesson])

  const readProgress = useMemo(() => {
    const total = lesson?.content?.length || 0
    if (sectionGroups.length === 0 || total === 0) return 0
    const unlocked = sectionGroups.slice(0, unlockedGroup + 1).reduce((s, g) => s + g.sections.length, 0)
    return Math.round((unlocked / total) * 100)
  }, [unlockedGroup, sectionGroups, lesson])

  // Review mode: lesson already completed
  const isReview = lesson ? progress[lesson.id] === 'completed' : false

  useEffect(() => {
    if (isReview && sectionGroups.length > 0) {
      setUnlockedGroup(sectionGroups.length - 1)
      const timers = {}
      sectionGroups.forEach((_, idx) => { timers[idx] = true })
      setReadyTimers(timers)
      setLessonComplete(true)
    }
  }, [isReview, sectionGroups])

  useEffect(() => {
    if (isReview) return
    for (let g = 0; g <= unlockedGroup; g++) {
      if (!startedTimers.current.has(g)) {
        startedTimers.current.add(g)
        setTimeout(() => {
          setReadyTimers(prev => ({ ...prev, [g]: true }))
        }, 5000)
      }
    }
  }, [unlockedGroup, isReview])

  useEffect(() => {
    if (lessonComplete || !lesson || isReview) return
    const checks = lesson.funChecks || []
    const allChecksAnswered = checks.length === 0 || Object.keys(funCheckRevealed).length >= checks.length
    const allGroupsUnlocked = sectionGroups.length > 0 && unlockedGroup >= sectionGroups.length - 1
    if (allGroupsUnlocked && allChecksAnswered) {
      setLessonComplete(true)
    }
  }, [unlockedGroup, funCheckRevealed, lessonComplete, lesson, sectionGroups, isReview])

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
  const funChecks = lesson.funChecks || []
  const totalFunChecks = funChecks.length
  const correctFunChecks = Object.values(funCheckAnswers).filter((a, i) => a === funChecks[i]?.answer).length

  function toggleReveal(idx) {
    setRevealedSections(prev => ({ ...prev, [idx]: !prev[idx] }))
    if (!revealedSections[idx]) {
      setFunFactsFound(prev => prev + 1)
    }
  }

  function answerFunCheck(checkIdx, optionIdx) {
    if (funCheckRevealed[checkIdx]) return
    setFunCheckAnswers(prev => ({ ...prev, [checkIdx]: optionIdx }))
    setFunCheckRevealed(prev => ({ ...prev, [checkIdx]: true }))
    const isCorrect = funChecks[checkIdx].answer === optionIdx
    if (isCorrect) {
      showToast('🎉 Correct! Great job!', 'success')
    } else {
      showToast('Not quite — read the explanation below!', 'info')
    }
  }

  function unlockNextGroup(groupIdx) {
    const nextGroup = groupIdx + 1
    if (nextGroup < sectionGroups.length) {
      setUnlockedGroup(nextGroup)
      showToast(`🎉 Part ${nextGroup + 1} of ${sectionGroups.length} unlocked!`, 'success')
      setTimeout(() => {
        const el = document.getElementById(`lesson-group-${nextGroup}`)
        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' })
      }, 150)
    }
  }

  function canContinueGroup(groupIdx) {
    const group = sectionGroups[groupIdx]
    if (!group) return false
    const timerReady = readyTimers[groupIdx] === true
    const checkDone = group.checkIndex === null || funCheckRevealed[group.checkIndex]
    return timerReady && checkDone
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
        className={`rounded-xl p-5 ${config.borderClass} ${config.bgClass} shadow-sm hover:shadow-md transition-all duration-300 fun-hover animate-slide-up`}
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
                  if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                }}
              />
              <div className="hidden items-center justify-center h-32 sm:h-36 text-steel text-xs" style={{ display: 'none' }}>
                <div className="text-center">
                  <div className="text-2xl mb-1">🖼️</div>
                  <p>Image coming soon</p>
                </div>
              </div>
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

  function renderFunCheck(ci) {
    const check = funChecks[ci]
    const answered = funCheckRevealed[ci]
    const userAnswer = funCheckAnswers[ci]
    const isCorrect = userAnswer === check.answer

    return (
      <div key={`funcheck-${ci}`} className="my-4">
        <Card className={`p-5 border-2 ${answered ? (isCorrect ? 'border-green-300 bg-green-50' : 'border-red-200 bg-red-50') : 'border-dashed border-brand-300 bg-gradient-to-r from-brand-50 to-purple-50'} transition-all`}>
          <div className="flex items-center gap-2 mb-3">
            <span className="text-2xl">{answered ? (isCorrect ? '✅' : '❌') : '🧠'}</span>
            <h3 className="text-lg font-extrabold text-brand-700">Quick Check!</h3>
            {!answered && <span className="ml-auto text-xs font-bold text-brand-500 bg-white px-2 py-1 rounded-full border border-brand-200">Interactive</span>}
          </div>
          <p className="text-gray-800 font-bold mb-3">{check.question}</p>
          <div className="flex flex-wrap gap-2">
            {check.options.map((opt, oi) => {
              let btnClass = 'bg-white border-2 border-gray-200 hover:border-brand-400 hover:bg-brand-50 text-gray-800'
              if (answered) {
                if (oi === check.answer) btnClass = 'bg-green-500 text-white border-2 border-green-600 animate-check-pop'
                else if (oi === userAnswer) btnClass = 'bg-red-400 text-white border-2 border-red-500 animate-shake'
                else btnClass = 'bg-gray-100 text-gray-400 border-2 border-gray-200'
              }
              return (
                <button
                  key={oi}
                  onClick={() => answerFunCheck(ci, oi)}
                  disabled={answered}
                  className={`px-5 py-2.5 rounded-xl font-bold text-sm transition-all ${btnClass} ${!answered ? 'fun-hover cursor-pointer' : ''}`}
                >
                  {opt}
                </button>
              )
            })}
          </div>
          {answered && (
            <div className={`mt-3 p-3 rounded-xl animate-slide-up ${isCorrect ? 'bg-green-100 border border-green-200' : 'bg-yellow-50 border border-yellow-200'}`}>
              <p className="text-sm font-medium text-gray-800">
                {isCorrect ? '🎉 ' : '💡 '}{check.explanation}
              </p>
            </div>
          )}
        </Card>
      </div>
    )
  }

  return (
    <div className="space-y-6 animate-fadeIn max-w-4xl mx-auto" role="region" aria-label={`Lesson: ${lesson.title}`} ref={contentRef}>
      <Confetti active={showConfetti} />

      {/* Reading Progress Bar — fixed below the sticky site header */}
      <div className="lesson-progress-bar fixed left-0 right-0 z-40 bg-white shadow-md border-b border-gray-200" style={{ top: `${navHeight}px` }}>
        <div className="max-w-4xl mx-auto px-4 py-2">
          <div className="flex items-center gap-3">
            <Link to="/lessons" className="flex-shrink-0 text-brand-600 hover:text-brand-700 font-bold text-sm flex items-center gap-1 bg-brand-50 hover:bg-brand-100 px-3 py-1 rounded-full border border-brand-200 transition-colors" aria-label="Back to Lessons">
              ← Lessons
            </Link>
            <span className="text-xs font-bold text-brand-600 whitespace-nowrap">
              {isReview ? '✅ Review Mode' : '📖 Reading Progress'}
            </span>
            <div className="flex-1 h-2.5 bg-gray-200 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 via-brand-500 to-green-500 rounded-full transition-all duration-300"
                style={{ width: `${readProgress}%` }}
              />
            </div>
            <span className="text-xs font-bold text-brand-700 whitespace-nowrap">{Math.round(readProgress)}%</span>
            <span className="text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full bg-brand-100 text-brand-700">
              📖 Part {Math.min(unlockedGroup + 1, sectionGroups.length)}/{sectionGroups.length}
            </span>
            {(lesson?.funChecks?.length > 0) && (
              <span className={`text-xs font-bold whitespace-nowrap px-2 py-0.5 rounded-full ${
                Object.keys(funCheckRevealed).length >= (lesson?.funChecks?.length || 0)
                  ? 'bg-green-100 text-green-700'
                  : 'bg-yellow-100 text-yellow-700'
              }`}>
                🧠 {Object.keys(funCheckRevealed).length}/{lesson?.funChecks?.length || 0}
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Spacer for fixed progress bar */}
      <div className="h-10" />

      {/* ─── Hero Header ─────────────────────────────────────────────── */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-blue-50 via-white to-pink-50 border-blue-200" role="article" aria-label={lesson.title}>
        <div className="p-6 pb-4">
          <h1 className="text-3xl md:text-4xl font-extrabold text-brand-700 heading flex items-center gap-3">
            <span className="text-4xl">📚</span> {lesson.title}
          </h1>
          <p className="mt-2 text-gray-600 text-lg">{lesson.summary}</p>
          <div className="mt-3 flex flex-wrap gap-3">
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1.5 rounded-full">
              📋 {sectionGroups.length} parts · {totalSections} sections
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1.5 rounded-full">
              🧠 {totalFunChecks} knowledge checks
            </span>
            <span className="inline-flex items-center gap-1.5 text-xs font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full">
              ✅ {correctFunChecks}/{totalFunChecks} correct
            </span>
          </div>
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
        <div className="space-y-5">
          <h2 className="text-2xl font-extrabold text-brand-700 heading flex items-center gap-2">
            <span className="text-2xl">📖</span> Lesson Content
            <span className="ml-auto text-sm font-bold text-brand-500 bg-brand-50 px-3 py-1 rounded-full">
              Part {Math.min(unlockedGroup + 1, sectionGroups.length)} of {sectionGroups.length}
            </span>
          </h2>

          {sectionGroups.map((group, groupIdx) => {
            const isLocked = groupIdx > unlockedGroup
            const isLastGroup = groupIdx === sectionGroups.length - 1
            const checkDone = group.checkIndex === null || funCheckRevealed[group.checkIndex]
            const timerReady = readyTimers[groupIdx] === true
            const canContinue = timerReady && checkDone

            if (isLocked) {
              return (
                <div
                  key={`group-${groupIdx}`}
                  id={`lesson-group-${groupIdx}`}
                  className="rounded-2xl border-2 border-dashed border-gray-300 bg-gray-50/80 p-6 text-center transition-all"
                >
                  <div className="text-4xl mb-2 animate-pulse">🔒</div>
                  <h3 className="text-lg font-bold text-gray-400">Part {groupIdx + 1}</h3>
                  <p className="text-sm text-gray-400 mt-1">
                    {group.sections.length} section{group.sections.length > 1 ? 's' : ''} · Complete Part {groupIdx} to unlock
                  </p>
                  <div className="mt-3 flex justify-center gap-1">
                    {group.sections.map((_, i) => (
                      <div key={i} className="w-8 h-1.5 bg-gray-300 rounded-full"></div>
                    ))}
                  </div>
                </div>
              )
            }

            return (
              <div key={`group-${groupIdx}`} id={`lesson-group-${groupIdx}`} className="space-y-4">
                <div className="flex items-center gap-3 pt-1">
                  <div className="flex items-center gap-2 bg-gradient-to-r from-brand-500 to-brand-600 text-white px-4 py-1.5 rounded-full text-sm font-bold shadow-sm">
                    {groupIdx < unlockedGroup ? '✅' : '📖'} Part {groupIdx + 1} of {sectionGroups.length}
                  </div>
                  <div className="flex-1 h-px bg-gray-200"></div>
                  <span className="text-xs text-gray-400 font-medium">{group.sections.length} section{group.sections.length > 1 ? 's' : ''}</span>
                </div>

                {group.sections.map(sIdx => renderSection(sIdx))}

                {group.checkIndex !== null && renderFunCheck(group.checkIndex)}

                {!isLastGroup && !isReview && (
                  <div className="flex flex-col items-center gap-2 py-3">
                    <button
                      disabled={!canContinue}
                      onClick={() => unlockNextGroup(groupIdx)}
                      className={`inline-flex items-center gap-2 px-8 py-3.5 rounded-2xl font-bold text-base transition-all duration-300 ${
                        canContinue
                          ? 'bg-gradient-to-r from-brand-500 to-brand-600 text-white shadow-lg hover:shadow-xl hover:scale-105 cursor-pointer animate-pulse-glow'
                          : 'bg-gray-200 text-gray-400 cursor-not-allowed'
                      }`}
                    >
                      {!timerReady
                        ? <><span className="animate-spin inline-block">⏳</span> Reading...</>
                        : !checkDone
                          ? '🧠 Answer the Knowledge Check First'
                          : <><span>▶</span> Continue to Part {groupIdx + 2}</>
                      }
                    </button>
                    {!canContinue && timerReady && !checkDone && (
                      <p className="text-xs text-yellow-600 font-medium animate-pulse">Answer the quick check above to unlock the next part</p>
                    )}
                    {!canContinue && !timerReady && (
                      <p className="text-xs text-gray-400 font-medium">Take your time reading the sections above...</p>
                    )}
                  </div>
                )}
              </div>
            )
          })}
        </div>
      )}

      {/* ─── Images Gallery ──────────────────────────────────────────── */}
      {lesson.images && lesson.images.length > 0 && (
        <Card className="p-5 bg-gradient-to-br from-indigo-50 to-pink-50 border-indigo-200">
          <h2 className="text-2xl font-bold heading text-brand-700 mb-4 flex items-center gap-2">
            <span>🖼️</span> Visual Guide
          </h2>
          <p className="text-steel text-sm mb-4">Take a closer look at the parts discussed in this lesson.</p>
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
        <Card className="p-5 bg-gradient-to-br from-green-50 to-emerald-50 border-2 border-green-200">
          <h2 className="text-2xl font-bold text-green-700 heading flex items-center gap-2">
            <span>📋</span> Key Takeaways
          </h2>
          <p className="text-steel text-sm mt-1 mb-4">Review these important points before completing the lesson.</p>
          <div className="space-y-2">
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

      {/* ─── Unanswered Checks Reminder ─────────────────────────────── */}
      {!lessonComplete && !isReview && unlockedGroup >= sectionGroups.length - 1 && totalFunChecks > 0 && Object.keys(funCheckRevealed).length < totalFunChecks && (
        <Card className="p-5 text-center bg-gradient-to-r from-yellow-50 to-orange-50 border-2 border-yellow-300 animate-slide-up">
          <div className="text-4xl mb-2">🧠</div>
          <h2 className="text-xl font-extrabold text-yellow-700 heading">Answer All Knowledge Checks!</h2>
          <p className="text-steel mt-1 text-sm">
            You've answered <strong>{Object.keys(funCheckRevealed).length}</strong> of <strong>{totalFunChecks}</strong> quick checks. Scroll back up and answer all of them to complete this lesson!
          </p>
        </Card>
      )}

      {/* ─── Lesson Complete Celebration ─────────────────────────────── */}
      {lessonComplete && (
        <div ref={completionRef}>
          <Card className={`p-6 text-center bg-gradient-to-r from-yellow-50 via-white to-green-50 border-2 border-yellow-300 ${isReview ? '' : 'animate-bounce-in'}`}>
            <div className="text-5xl mb-3">🏆</div>
            <h2 className="text-2xl font-extrabold text-brand-700 heading">Lesson Complete!</h2>
            <p className="text-steel mt-1">
              You completed all {sectionGroups.length} parts ({totalSections} sections)
              {totalFunChecks > 0 && ` and answered ${correctFunChecks}/${totalFunChecks} knowledge checks correctly`}!
            </p>
            <div className="mt-3 flex flex-wrap gap-2 justify-center">
              {correctFunChecks === totalFunChecks && totalFunChecks > 0 && (
                <span className="inline-flex items-center gap-1 text-sm font-bold bg-yellow-100 text-yellow-700 px-3 py-1.5 rounded-full border border-yellow-200">
                  🌟 Perfect Score!
                </span>
              )}
              <span className="inline-flex items-center gap-1 text-sm font-bold bg-green-100 text-green-700 px-3 py-1.5 rounded-full border border-green-200">
                📖 Lesson Finished
              </span>
            </div>
          </Card>
        </div>
      )}

      {/* ─── Complete Lesson CTA ─────────────────────────────────────── */}
      {(() => {
        const allChecksAnswered = totalFunChecks === 0 || Object.keys(funCheckRevealed).length >= totalFunChecks
        const allGroupsUnlocked = sectionGroups.length === 0 || unlockedGroup >= sectionGroups.length - 1
        const isReady = isReview || (allChecksAnswered && allGroupsUnlocked)
        const remaining = totalFunChecks - Object.keys(funCheckRevealed).length
        const remainingParts = Math.max(0, sectionGroups.length - 1 - unlockedGroup)

        return (
          <Card className={`p-6 text-center ${isReady ? 'bg-gradient-to-r from-brand-50 via-white to-green-50 border-brand-200' : 'bg-gradient-to-r from-gray-50 to-gray-100 border-gray-300 opacity-80'}`}>
            <div className="text-4xl mb-2">{isReady ? (isReview ? '📖' : '🎉') : '🔒'}</div>
            <h2 className="text-2xl font-extrabold text-brand-700 heading">
              {isReview
                ? 'Already Completed!'
                : isReady
                ? "You've Finished This Lesson!"
                : 'Complete All Parts First!'}
            </h2>
            <p className="text-steel mt-1 mb-4">
              {isReview
                ? 'You already completed this lesson. Review it anytime or head back to lessons.'
                : isReady
                ? 'Click below to mark this lesson as complete and unlock the next lesson!'
                : remainingParts > 0
                  ? `You still have ${remainingParts} part${remainingParts > 1 ? 's' : ''} to unlock. Keep reading!`
                  : `You still have ${remaining} knowledge check${remaining > 1 ? 's' : ''} to answer.`
              }
            </p>

            {isReview ? (
              <Link to="/lessons">
                <Button variant="secondary" className="text-lg px-8 py-3">
                  ← Back to Lessons
                </Button>
              </Link>
            ) : isReady ? (
              <Button
                variant="primary"
                className="text-lg px-8 py-3"
                onClick={() => {
                  markLessonCompleted(lesson.id)
                  showToast('🎉 Lesson completed! Next lesson unlocked!', 'success')
                  setTimeout(() => navigate('/lessons'), 800)
                }}
              >
                ✅ Complete Lesson &amp; Continue
              </Button>
            ) : (
              <Button
                variant="secondary"
                className="text-lg px-8 py-3 cursor-not-allowed opacity-60"
                onClick={() =>
                  showToast(
                    remainingParts > 0
                      ? `📖 Complete all ${sectionGroups.length} parts first!`
                      : `🧠 Answer all ${totalFunChecks} knowledge checks first!`,
                    'warning',
                  )
                }
              >
                🔒 Finish Reading First
              </Button>
            )}
          </Card>
        )
      })()}
    </div>
  )
}
