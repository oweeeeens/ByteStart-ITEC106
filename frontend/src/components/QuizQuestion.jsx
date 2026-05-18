export default function QuizQuestion({ item, onAnswer, selected, answered, isCorrect, selectedOption }) {
  if (!item) return <div className="text-center py-8 text-steel">No question available.</div>
  return (
    <div className="space-y-5" role="group" aria-label={`Question: ${item.prompt}`}>
      {item.image && (
        <div className="bg-gradient-to-br from-gray-50 to-white rounded-2xl border border-gray-100 overflow-hidden flex items-center justify-center p-4">
          <img
            src={item.image}
            alt={item.alt || item.prompt}
            className="max-w-full max-h-72 sm:max-h-80 object-contain bg-white rounded-xl"
          />
        </div>
      )}
      <p className="text-xl font-bold heading text-brand-700" id="quiz-question">{item.prompt}</p>
      <div className="grid grid-cols-1 sm:grid-cols-2 gap-3" role="radiogroup" aria-labelledby="quiz-question">
        {item.options.map((opt, idx) => {
          // Determine button style based on answered state
          let btnClass = ''
          const isKeyboardHighlighted = !answered && selectedOption === idx
          if (answered) {
            if (idx === item.answer) {
              // Correct answer — always highlight green
              btnClass = 'bg-gradient-to-r from-green-400 to-green-500 text-white border-green-600 shadow-md scale-[1.02] animate-check-pop'
            } else if (idx === selected && !isCorrect) {
              // User's wrong answer — highlight red
              btnClass = 'bg-gradient-to-r from-red-400 to-red-500 text-white border-red-500 shadow-md animate-shake'
            } else {
              // Other options — dimmed
              btnClass = 'bg-gray-100 text-gray-400 border-gray-200 opacity-60 cursor-not-allowed'
            }
          } else if (selected === idx) {
            btnClass = 'bg-gradient-to-r from-brand-500 to-brand-600 text-white border-brand-600 shadow-md scale-[1.02]'
          } else if (isKeyboardHighlighted) {
            // Keyboard-highlighted but not yet confirmed with Enter
            btnClass = 'bg-brand-50 border-brand-400 shadow-md scale-[1.02] ring-2 ring-brand-300 ring-offset-1'
          } else {
            btnClass = 'bg-white hover:bg-brand-50 border-gray-200 hover:border-brand-300 hover:shadow-sm'
          }

          return (
            <button
              key={idx}
              onClick={() => !answered && onAnswer(idx)}
              role="radio"
              aria-checked={selected === idx || isKeyboardHighlighted}
              aria-label={`Option ${String.fromCharCode(65 + idx)}: ${opt}${isKeyboardHighlighted ? ' (highlighted, press Enter to confirm)' : ''}`}
              disabled={answered}
              className={`px-5 py-4 rounded-xl text-left border-2 transition-all duration-200 font-medium focus:outline-none focus:ring-4 focus:ring-brand-200 ${btnClass}`}
            >
              <span className="inline-flex items-center gap-2">
                <span className={`w-7 h-7 rounded-lg flex items-center justify-center text-sm font-bold ${
                  answered && idx === item.answer
                    ? 'bg-white/30 text-white'
                    : answered && idx === selected && !isCorrect
                    ? 'bg-white/30 text-white'
                    : selected === idx && !answered
                    ? 'bg-white/20 text-white'
                    : isKeyboardHighlighted
                    ? 'bg-brand-500 text-white'
                    : 'bg-brand-100 text-brand-600'
                }`}>
                  {answered && idx === item.answer ? '✓' : answered && idx === selected && !isCorrect ? '✗' : String.fromCharCode(65 + idx)}
                </span>
                {opt}
              </span>
            </button>
          )
        })}
      </div>
    </div>
  )
}
