import { useEffect, useState } from 'react'

const COLORS = ['#6366f1', '#ec4899', '#10b981', '#f59e0b', '#3b82f6', '#ef4444', '#8b5cf6', '#14b8a6']
const SHAPES = ['●', '■', '▲', '★', '♦', '🎉', '✨', '🌟']

function randomBetween(a, b) {
  return Math.random() * (b - a) + a
}

function Piece({ color, shape, left, delay, duration }) {
  return (
    <span
      className="confetti-piece"
      aria-hidden="true"
      style={{
        left: `${left}%`,
        color,
        animationDelay: `${delay}s`,
        animationDuration: `${duration}s`,
        fontSize: `${randomBetween(12, 24)}px`,
      }}
    >
      {shape}
    </span>
  )
}

export default function Confetti({ active, duration = 3000 }) {
  const [show, setShow] = useState(false)
  const [pieces, setPieces] = useState([])

  useEffect(() => {
    if (active) {
      const count = duration >= 5000 ? 80 : 50
      const newPieces = Array.from({ length: count }, (_, i) => ({
        id: i,
        color: COLORS[Math.floor(Math.random() * COLORS.length)],
        shape: SHAPES[Math.floor(Math.random() * SHAPES.length)],
        left: randomBetween(0, 100),
        delay: randomBetween(0, duration >= 5000 ? 1.5 : 0.8),
        duration: randomBetween(1.5, duration >= 5000 ? 4 : 3),
      }))
      setPieces(newPieces)
      setShow(true)
      const timer = setTimeout(() => setShow(false), duration)
      return () => clearTimeout(timer)
    }
  }, [active, duration])

  if (!show) return null

  return (
    <div className="confetti-container" aria-hidden="true">
      {pieces.map((p) => (
        <Piece key={p.id} {...p} />
      ))}
    </div>
  )
}
