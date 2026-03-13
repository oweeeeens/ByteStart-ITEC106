import { useApp } from '../context/AppContext.jsx'
import { lessons } from '../data/lessons.js'
import { Link } from 'react-router-dom'
import Card from '../components/ui/Card.jsx'
import Button from '../components/ui/Button.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

export default function Home() {
  useDocTitle('Home')
  const { user, progress } = useApp()
  const total = lessons.length
  const completed = Object.values(progress).filter((s) => s === 'completed').length
  const pct = total ? Math.round((completed / total) * 100) : 0
  const nextLesson =
    lessons.find((l) => progress[l.id] === 'unlocked') ||
    lessons.find((l) => progress[l.id] !== 'completed')

  const totalQuizQuestions = lessons.reduce((n, l) => n + (l.funChecks?.length || 0), 0)

  return (
    <div className="space-y-8 animate-fadeIn" role="region" aria-label="Home page">
      {/* ─── Hero Section ─── */}
      <Card className="p-0 overflow-hidden bg-gradient-to-br from-brand-50 via-white to-blue-50 border-brand-200">
        <div className="px-8 pt-10 pb-8 text-center max-w-3xl mx-auto">
          <span className="inline-block text-brand-600 font-semibold text-sm px-5 py-1.5 rounded-full border border-brand-200 bg-white mb-6">
            E-Learning for Students — Grade 6
          </span>
          <h1 className="text-4xl sm:text-5xl md:text-6xl font-extrabold heading text-brand-700 leading-tight">
            Learn &amp; Master<br />Computer Hardware
          </h1>
          <p className="mt-4 text-steel text-lg leading-relaxed max-w-2xl mx-auto">
            {user
              ? `Welcome back, ${user.username}! Continue your journey to understand every part of a computer — fun, interactive, and fully accessible.`
              : 'Understand every part of a computer through fun, interactive lessons and quizzes — designed for young learners with full accessibility support.'}
          </p>
          <div className="mt-8 flex flex-wrap gap-3 justify-center">
            <Link to={nextLesson ? `/lessons/${nextLesson.id}` : '/lessons'}>
              <Button className="text-lg px-8 py-3 shadow-md">🚀 {user ? 'Continue' : 'Start Learning'}</Button>
            </Link>
            <Link to="/lessons">
              <Button variant="secondary" className="text-lg px-8 py-3">📖 View Lessons</Button>
            </Link>
          </div>
          <div className="mt-6 flex flex-wrap gap-2 justify-center">
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-green-100 text-green-700 px-3 py-1 rounded-full">✅ Free</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-blue-100 text-blue-700 px-3 py-1 rounded-full">🎓 Grade 6</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-purple-100 text-purple-700 px-3 py-1 rounded-full">♿ WCAG 2.1 AA</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full">🎮 Fun & Interactive</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-gray-800 text-gray-100 px-3 py-1 rounded-full">🌙 Dark Mode</span>
            <span className="inline-flex items-center gap-1 text-xs font-bold bg-pink-100 text-pink-700 px-3 py-1 rounded-full">🔊 Read Aloud</span>
          </div>
        </div>
        <div className="bg-gradient-to-r from-brand-600 to-brand-700 text-white px-8 py-4">
          <div className="flex flex-wrap items-center justify-center gap-x-6 gap-y-2 text-sm">
            <span className="font-bold text-white/80 mr-1">💡 Quick Tips:</span>
            <span>📝 Press 1–4 to answer quizzes</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span>⏎ Enter to confirm answer</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span>🌙 Toggle Dark Mode in Accessibility</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span>🔊 Click Read Aloud in any lesson</span>
            <span className="hidden sm:inline text-white/40">|</span>
            <span>❓ Press ? for keyboard shortcuts</span>
          </div>
        </div>
      </Card>

      {/* ─── Platform Stats ─── */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {[
          { icon: '📖', value: `${total}`, label: 'Interactive Lessons' },
          { icon: '❓', value: `${totalQuizQuestions}+`, label: 'Quiz Questions' },
          { icon: '♿', value: '10+', label: 'Accessibility Settings' },
          { icon: '🏆', value: '6', label: 'Achievements to Earn' },
        ].map((s) => (
          <Card key={s.label} className="p-5 text-center border-brand-100 hover:shadow-card-hover transition-shadow">
            <div className="text-3xl mb-1">{s.icon}</div>
            <div className="text-2xl font-extrabold heading text-brand-700">{s.value}</div>
            <p className="text-steel text-sm mt-1">{s.label}</p>
          </Card>
        ))}
      </div>

      {/* ─── About Section ─── */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold heading text-brand-700">📌 About CompuBasics</h2>
        <div className="mt-4 grid grid-cols-1 md:grid-cols-3 gap-5">
          <div className="bg-blue-50 rounded-xl p-5 border border-blue-100">
            <h3 className="font-bold text-blue-700 text-lg">🖥️ What is it?</h3>
            <p className="text-steel mt-2">A fully accessible e-learning platform that teaches computer hardware through step-by-step lessons, images, and interactive quizzes.</p>
          </div>
          <div className="bg-pink-50 rounded-xl p-5 border border-pink-100">
            <h3 className="font-bold text-pink-700 text-lg">🧠 Why learn hardware?</h3>
            <p className="text-steel mt-2">Understanding hardware builds a strong foundation for using, troubleshooting, and appreciating the technology you use every day.</p>
          </div>
          <div className="bg-green-50 rounded-xl p-5 border border-green-100">
            <h3 className="font-bold text-green-700 text-lg">👦👧 Who is it for?</h3>
            <p className="text-steel mt-2">Grade 6 students (ages 10–15). Written in simple language with large text options, dark mode, read-aloud, and more.</p>
          </div>
        </div>
      </Card>

      {/* ─── What You'll Learn ─── */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold heading text-brand-700">🗺️ What You'll Learn</h2>
        <p className="text-steel mt-1 mb-4">Your learning journey covers {total} lessons — from basics to advanced components.</p>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
          {lessons.map((lesson, i) => {
            const status = progress[lesson.id]
            const isCompleted = status === 'completed'
            const isUnlocked = status === 'unlocked'
            return (
              <Link
                key={lesson.id}
                to={isCompleted || isUnlocked ? `/lessons/${lesson.id}` : '#'}
                className={`rounded-xl p-4 border transition-all ${
                  isCompleted
                    ? 'bg-green-50 border-green-200 hover:shadow-md'
                    : isUnlocked
                    ? 'bg-brand-50 border-brand-200 hover:shadow-md'
                    : 'bg-gray-50 border-gray-200 opacity-70 cursor-default'
                }`}
                aria-label={`${lesson.title}${isCompleted ? ' (completed)' : isUnlocked ? ' (unlocked)' : ' (locked)'}`}
                tabIndex={!isCompleted && !isUnlocked ? -1 : undefined}
              >
                <div className="flex items-start gap-3">
                  <span className={`text-xl flex-shrink-0 w-8 h-8 rounded-full flex items-center justify-center font-bold text-sm ${
                    isCompleted ? 'bg-green-200 text-green-800' : isUnlocked ? 'bg-brand-200 text-brand-800' : 'bg-gray-200 text-gray-500'
                  }`}>
                    {isCompleted ? '✓' : i + 1}
                  </span>
                  <div>
                    <h3 className={`font-bold text-sm ${isCompleted ? 'text-green-700' : isUnlocked ? 'text-brand-700' : 'text-gray-500'}`}>
                      {lesson.title}
                    </h3>
                    <p className="text-steel text-xs mt-0.5 line-clamp-2">{lesson.summary}</p>
                  </div>
                </div>
                {!isCompleted && !isUnlocked && (
                  <span className="inline-block text-xs text-gray-400 mt-2">🔒 Locked</span>
                )}
              </Link>
            )
          })}
        </div>
      </Card>

      {/* ─── Features ─── */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold heading text-brand-700">✨ Features</h2>
        <p className="text-steel mt-1 mb-4">Everything you need for a great learning experience.</p>
        <div className="mt-2 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { icon: '📖', title: 'Interactive Lessons', desc: 'Step-by-step lessons with images, captions, and built-in fun checks to test your understanding as you read.' },
            { icon: '🧩', title: 'Image-Based Quizzes', desc: 'Engaging picture quizzes with instant feedback, hints, streak bonuses, and a points system.' },
            { icon: '⌨️', title: 'Keyboard Shortcuts', desc: 'Press 1–4 to choose answers, Enter to confirm, N for next — or press ? to see all shortcuts.' },
            { icon: '🔓', title: 'Progressive Unlocking', desc: 'Pass each quiz to unlock the next lesson. Review completed lessons any time without locking.' },
            { icon: '🌙', title: 'Dark Mode', desc: 'Easy on the eyes — switch to dark mode instantly from the Accessibility page or settings.' },
            { icon: '🔊', title: 'Text-to-Speech', desc: 'Click Read Aloud to have any lesson read to you — pause, resume, and control speed.' },
            { icon: '♿', title: 'WCAG 2.1 AA Accessible', desc: '10+ settings: high contrast, dyslexia font, large text, focus highlights, reduced motion, and more.' },
            { icon: '🏆', title: 'Achievements & Stats', desc: 'Earn badges like First Steps, Quiz Whiz, Perfect Score, and Speed Demon. Track everything on your Profile.' },
          ].map((f) => (
            <div key={f.title} className="bg-white rounded-xl p-5 border border-gray-100 shadow-sm hover:shadow-card-hover transition-shadow group">
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{f.icon}</div>
              <h3 className="font-bold text-ink">{f.title}</h3>
              <p className="text-steel text-sm mt-1">{f.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Accessibility Highlights ─── */}
      <Card className="p-6 bg-gradient-to-br from-purple-50 via-white to-pink-50 border-purple-200">
        <h2 className="text-2xl font-bold heading text-purple-700">♿ Built for Everyone</h2>
        <p className="text-steel mt-1 mb-4">CompuBasics follows <strong>WCAG 2.1 AA</strong> standards. Every learner can customise their experience.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-5 gap-3">
          {[
            { icon: '🌙', label: 'Dark Mode' },
            { icon: '🔲', label: 'High Contrast' },
            { icon: '🔤', label: 'Dyslexia Font' },
            { icon: '🔊', label: 'Read Aloud' },
            { icon: '🔍', label: 'Large Text' },
            { icon: '📏', label: 'Line Spacing' },
            { icon: '🖱️', label: 'Large Cursor' },
            { icon: '🎯', label: 'Focus Highlights' },
            { icon: '🐢', label: 'Reduced Motion' },
            { icon: '📢', label: 'Screen Reader' },
          ].map((a) => (
            <div key={a.label} className="bg-white/70 rounded-lg p-3 text-center border border-purple-100 hover:bg-white transition-colors">
              <div className="text-2xl">{a.icon}</div>
              <p className="text-xs font-bold text-purple-700 mt-1">{a.label}</p>
            </div>
          ))}
        </div>
        <div className="mt-4 text-center">
          <Link to="/accessibility">
            <Button variant="secondary" className="px-6">⚙️ Open Accessibility Settings</Button>
          </Link>
        </div>
      </Card>

      {/* ─── How It Works ─── */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold heading text-brand-700">🎯 How It Works</h2>
        <div className="mt-4 grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
          {[
            { step: 1, icon: '📖', title: 'Study the Lesson', desc: 'Read through images, captions, and fun checks at your own pace.' },
            { step: 2, icon: '✅', title: 'Take the Quiz', desc: 'Answer image-based questions — use keyboard shortcuts for speed!' },
            { step: 3, icon: '🚀', title: 'Unlock & Progress', desc: 'Pass with 70%+ to unlock the next lesson and earn achievements.' },
            { step: 4, icon: '🔄', title: 'Review Any Time', desc: 'Revisit completed lessons freely to refresh your knowledge.' },
          ].map((s) => (
            <div key={s.step} className="bg-brand-50 rounded-xl p-5 border border-brand-100 text-center relative">
              <span className="absolute -top-3 -left-3 w-8 h-8 rounded-full bg-brand-600 text-white text-sm font-bold flex items-center justify-center shadow-md">{s.step}</span>
              <div className="text-4xl mb-3">{s.icon}</div>
              <h3 className="font-bold text-brand-700">{s.title}</h3>
              <p className="text-steel text-sm mt-1">{s.desc}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Keyboard Shortcuts Preview ─── */}
      <Card className="p-6">
        <h2 className="text-2xl font-bold heading text-brand-700">⌨️ Keyboard Shortcuts</h2>
        <p className="text-steel mt-1 mb-4">Navigate quickly without a mouse — great for accessibility and power users.</p>
        <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6 gap-3">
          {[
            { keys: '1 – 4', action: 'Select answer' },
            { keys: 'Enter', action: 'Confirm choice' },
            { keys: 'N', action: 'Next question' },
            { keys: '?', action: 'Show shortcuts' },
            { keys: 'Tab', action: 'Navigate elements' },
            { keys: 'Esc', action: 'Close modals' },
          ].map((k) => (
            <div key={k.keys} className="bg-gray-50 rounded-lg p-3 text-center border border-gray-200">
              <kbd className="inline-block bg-white border border-gray-300 rounded px-2 py-1 text-sm font-mono font-bold text-brand-700 shadow-sm">{k.keys}</kbd>
              <p className="text-xs text-steel mt-2">{k.action}</p>
            </div>
          ))}
        </div>
      </Card>

      {/* ─── Quick Progress Teaser ─── */}
      <Card className="p-5 bg-gradient-to-r from-brand-50 to-white border-brand-200">
        <div className="flex flex-col sm:flex-row items-center justify-between gap-4">
          <div className="flex items-center gap-4">
            <div className="text-3xl">📊</div>
            <div>
              <h3 className="text-lg font-bold heading text-brand-700">{completed} of {total} lessons completed</h3>
              <p className="text-steel text-sm">View your full progress, stats &amp; achievements on your profile.</p>
            </div>
          </div>
          <div className="flex items-center gap-4">
            <div className="hidden sm:block w-32">
              <div className="bg-gray-200 rounded-full h-2.5 overflow-hidden">
                <div className="bg-brand-500 h-2.5 rounded-full transition-all duration-500" style={{ width: `${pct}%` }} />
              </div>
              <p className="text-xs text-steel text-center mt-1">{pct}%</p>
            </div>
            <Link to="/profile">
              <Button variant="secondary" className="px-5">View Profile ➡️</Button>
            </Link>
          </div>
        </div>
      </Card>

      {nextLesson && (
        <Card className="p-5 flex flex-col sm:flex-row items-center justify-between gap-4 bg-gradient-to-r from-brand-50 to-white border-brand-200">
          <div>
            <h3 className="text-lg font-bold heading text-brand-700">📚 Continue Learning</h3>
            <p className="mt-1 text-steel text-sm">
              Next up: <span className="font-bold text-ink">{nextLesson.title}</span>
            </p>
          </div>
          <Link to={`/lessons/${nextLesson.id}`}>
            <Button className="px-5">Continue ➡️</Button>
          </Link>
        </Card>
      )}

      {/* ─── Footer ─── */}
      <Card className="p-6 bg-gray-50">
        <div className="grid grid-cols-1 md:grid-cols-4 gap-4 text-steel text-sm">
          <div>
            <h3 className="font-bold text-ink">About</h3>
            <p className="mt-1">CompuBasics — a WCAG 2.1 AA compliant e-learning platform helping Grade 6 students master computer hardware.</p>
          </div>
          <div>
            <h3 className="font-bold text-ink">Contact</h3>
            <p className="mt-1">Email: support@compubasics.example</p>
          </div>
          <div>
            <h3 className="font-bold text-ink">Quick Links</h3>
            <ul className="mt-1 space-y-1">
              <li><Link to="/lessons" className="text-brand-600 hover:text-brand-700">Lessons</Link></li>
              <li><Link to="/accessibility" className="text-brand-600 hover:text-brand-700">Accessibility</Link></li>
              <li><Link to="/help" className="text-brand-600 hover:text-brand-700">Help</Link></li>
            </ul>
          </div>
          <div className="md:text-right">
            <h3 className="font-bold text-ink">Copyright</h3>
            <p className="mt-1">© {new Date().getFullYear()} CompuBasics</p>
          </div>
        </div>
      </Card>
    </div>
  )
}
