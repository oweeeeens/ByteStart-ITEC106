import { Link } from 'react-router-dom'
import Card from './ui/Card.jsx'
import Button from './ui/Button.jsx'
import { useToast } from './Toast.jsx'

export default function LessonCard({ lesson, lessonNumber, status }) {
  const isLocked = status === 'locked';
  const isCompleted = status === 'completed';
  const isUnlocked = status === 'unlocked';
  const { showToast } = useToast();

  const borderColor = isCompleted
    ? 'border-green-300 hover:border-green-400'
    : isLocked
    ? 'border-gray-200 hover:border-gray-300'
    : 'border-blue-300 hover:border-pink-400';

  const bgColor = isCompleted
    ? 'bg-gradient-to-r from-green-50 via-white to-green-50'
    : isLocked
    ? 'bg-gradient-to-r from-gray-50 via-white to-gray-50 opacity-70'
    : 'bg-gradient-to-r from-blue-50 via-white to-pink-50';

  const badgeColor = isCompleted
    ? 'bg-green-500'
    : isLocked
    ? 'bg-gray-400'
    : 'bg-blue-500';

  return (
    <Card className={`${bgColor} rounded-2xl shadow-lg border-2 ${borderColor} transition-all duration-200 animate-fadeIn ${isUnlocked ? 'ring-2 ring-brand-300 ring-offset-2' : ''}`}>
      <div className="flex flex-col sm:flex-row items-center gap-4">
        {/* Lesson number badge + image */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <div className={`${badgeColor} text-white w-12 h-12 rounded-full flex items-center justify-center text-lg font-extrabold shadow-md`}>
            {isCompleted ? '✓' : lessonNumber}
          </div>
          <div className="relative w-24 h-24">
            <img
              src={lesson.image}
              alt={lesson.alt || lesson.title || 'Lesson image'}
              className={`w-full h-full object-contain rounded-xl border-2 ${isLocked ? 'border-gray-200 grayscale' : 'border-blue-200'} bg-white`}
            />
            {isCompleted && (
              <div className="absolute inset-0 bg-green-500/20 rounded-xl flex items-center justify-center">
                <span className="text-2xl drop-shadow-md">✅</span>
              </div>
            )}
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 text-center sm:text-left">
          <div className="flex items-center gap-2 justify-center sm:justify-start">
            <h2 className={`text-xl font-extrabold heading tracking-wide ${isLocked ? 'text-gray-400' : 'text-blue-700'}`}>
              Lesson {lessonNumber}: {lesson.title}
            </h2>
            {isUnlocked && (
              <span className="hidden sm:inline-flex items-center gap-1 text-[10px] font-extrabold bg-brand-100 text-brand-700 px-2 py-0.5 rounded-full border border-brand-200 animate-pulse">
                ▶ UP NEXT
              </span>
            )}
          </div>
          <p className={`mt-1 text-sm leading-relaxed ${isLocked ? 'text-gray-400' : 'text-gray-700'}`}>
            {lesson.summary}
          </p>
          {isCompleted && (
            <span className="inline-flex items-center gap-1 text-xs font-bold text-green-600 mt-1.5">
              ✅ Completed
            </span>
          )}
        </div>

        {/* Action */}
        <div className="flex-shrink-0 flex flex-col items-center gap-2">
          <Link
            aria-disabled={isLocked}
            to={isLocked ? '#' : `/lessons/${lesson.id}`}
            onClick={(e) => {
              if (isLocked) {
                e.preventDefault();
                showToast(`🔒 Lesson ${lessonNumber} is locked. Complete the previous lesson first!`, 'warning');
              }
            }}
          >
            <Button
              variant={isLocked ? 'secondary' : isCompleted ? 'success' : 'primary'}
              className={`rounded-full font-bold px-5 py-2 text-sm ${isLocked ? 'cursor-not-allowed opacity-60' : ''}`}
            >
              {isLocked ? '🔒 Locked' : isCompleted ? '📖 Review' : '🚀 Start'}
            </Button>
          </Link>
        </div>
      </div>
    </Card>
  );
}
