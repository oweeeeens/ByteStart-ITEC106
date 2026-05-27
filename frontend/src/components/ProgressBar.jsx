export default function ProgressBar({ percent, size = 'default' }) {
  const p = Math.max(0, Math.min(100, Math.round(percent)))
  const heightClass = size === 'sm' ? 'h-3' : 'h-7'
  const showLabel = size !== 'sm'

  return (
    <div
      aria-label="Progress"
      className={`progress-bar-track w-full rounded-full ${heightClass} overflow-hidden relative`}
      role="progressbar"
      aria-valuemin={0}
      aria-valuemax={100}
      aria-valuenow={p}
    >
      <div className="absolute inset-0 flex">
        {[...Array(10)].map((_, i) => (
          <div key={i} className="flex-1 border-r border-white/10 last:border-r-0" />
        ))}
      </div>
      <div
        className="progress-bar-fill h-full rounded-full relative overflow-hidden transition-all duration-700 ease-out"
        style={{ width: `${Math.max(p, showLabel ? 10 : 4)}%` }}
      >
        <div className="progress-bar-shimmer absolute inset-0" />
        {showLabel && (
          <span className="relative z-10 flex items-center justify-center h-full text-white text-sm font-bold drop-shadow-sm">
            {p}%
          </span>
        )}
      </div>
    </div>
  )
}
