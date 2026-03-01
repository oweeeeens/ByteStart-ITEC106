import { lessons } from '../data/lessons.js'
import LessonCard from '../components/LessonCard.jsx'
import { useApp } from '../context/AppContext.jsx'
import ProgressBar from '../components/ProgressBar.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

export default function Lessons() {
  useDocTitle('Lessons')
  const { progress } = useApp()
  const completed = Object.values(progress).filter(s => s === 'completed').length
  const total = lessons.length
  const percent = Math.round((completed / total) * 100)

  return (
    <div className="space-y-6 animate-fadeIn" role="region" aria-label="Lessons list">
      <div className="text-center">
        <div className="text-5xl mb-2">📖</div>
        <h1 className="text-4xl font-extrabold text-brand-700 heading">My Lessons</h1>
        <p className="mt-2 text-lg text-steel">Complete each lesson to unlock the next one. Keep going!</p>
      </div>

      {/* Overall progress bar */}
      <div className="max-w-xl mx-auto">
        <div className="flex items-center justify-between text-sm font-bold mb-1.5">
          <span className="text-brand-600">Overall Progress</span>
          <span className="text-brand-700">{completed}/{total} lessons · {percent}%</span>
        </div>
        <ProgressBar percent={percent} size="sm" />
      </div>

      <div className="flex justify-center gap-4 text-sm font-bold">
        <span className="inline-flex items-center gap-1 bg-gray-100 text-gray-600 rounded-full px-4 py-1.5 border border-gray-200">🔒 Locked</span>
        <span className="inline-flex items-center gap-1 bg-brand-50 text-brand-600 rounded-full px-4 py-1.5 border border-brand-200">🔓 Unlocked</span>
        <span className="inline-flex items-center gap-1 bg-green-50 text-green-600 rounded-full px-4 py-1.5 border border-green-200">✅ Completed</span>
      </div>

      <div className="flex flex-col items-center gap-5 mt-4">
        {lessons.map((l, idx) => (
          <div key={l.id} className="w-full max-w-3xl">
            <LessonCard lesson={l} lessonNumber={idx + 1} status={progress[l.id]} />
          </div>
        ))}
      </div>
    </div>
  )
}
