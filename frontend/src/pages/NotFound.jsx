import { Link } from 'react-router-dom'
import { useState, useEffect } from 'react'
import useDocTitle from '../hooks/useDocTitle.js'

const FUN_FACTS = [
  '💡 The first computer bug was a real moth found in a relay in 1947!',
  '💡 A group of computers is sometimes called a "cluster".',
  '💡 The first 1 GB hard drive weighed over 500 pounds!',
  '💡 RAM stands for Random Access Memory — it forgets everything when powered off.',
  '💡 The first computer mouse was made of wood!',
]

export default function NotFound() {
  useDocTitle('Page Not Found')
  const [fact, setFact] = useState('')

  useEffect(() => {
    setFact(FUN_FACTS[Math.floor(Math.random() * FUN_FACTS.length)])
  }, [])

  return (
    <div className="text-center py-16 animate-fadeIn" role="region" aria-label="Page not found">
      <div className="relative inline-block mb-6">
        <div className="text-9xl font-extrabold text-brand-200 select-none">404</div>
        <div className="absolute inset-0 flex items-center justify-center">
          <span className="text-7xl animate-bounce">😵</span>
        </div>
      </div>
      <h1 className="text-3xl sm:text-4xl font-extrabold heading text-brand-700 mb-3">
        Oops! Page Not Found
      </h1>
      <p className="text-lg text-steel mb-4 max-w-md mx-auto">
        The page you are looking for doesn't exist or has been moved. Let's get you back on track!
      </p>
      <div className="mx-auto max-w-sm bg-brand-50 rounded-2xl p-4 border border-brand-100 mb-8">
        <p className="text-sm font-medium text-brand-700">{fact}</p>
      </div>
      <div className="flex flex-wrap gap-3 justify-center">
        <Link to="/" className="btn btn-primary text-base px-6 py-3 inline-flex items-center gap-2">
          🏠 Go Home
        </Link>
        <Link to="/lessons" className="btn btn-secondary text-base px-6 py-3 inline-flex items-center gap-2">
          📖 View Lessons
        </Link>
        <Link to="/help" className="btn btn-secondary text-base px-6 py-3 inline-flex items-center gap-2">
          ❓ Get Help
        </Link>
      </div>
    </div>
  )
}
