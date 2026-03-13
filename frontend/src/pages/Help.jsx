import { useState } from 'react'
import Card from '../components/ui/Card.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

export default function Help() {
  useDocTitle('Help & FAQ')
  const [openFaq, setOpenFaq] = useState(null)
  const [openGuide, setOpenGuide] = useState(null)

  const faqs = [
    { icon: '🚀', q: 'How do I start?', a: 'Create an account or log in, then start with the first lesson.' },
    { icon: '🔓', q: 'How do lessons unlock?', a: 'Pass a lesson quiz with at least 70% to unlock the next one.' },
    { icon: '💾', q: 'How is my progress saved?', a: 'Your progress is saved to your account and stored in your browser session.' },
    { icon: '♿', q: 'Accessibility features', a: 'Go to the Accessibility page to enable dyslexia-friendly font, high contrast, large cursor, reduced motion, text-to-speech, and more.' },
    { icon: '🔊', q: 'How does Read Aloud work?', a: 'Enable Text-to-Speech in Accessibility settings. A floating toolbar appears on every page — click "Page" to read the whole page aloud, or select text and click "Selection" to hear just that part.' },
    { icon: '⌨️', q: 'Keyboard shortcuts', a: 'In quizzes, press 1–4 to select answers and N to go to the next question. Use Tab to navigate, Enter/Space to activate buttons.' },
    { icon: '🌗', q: 'What is High Contrast mode?', a: 'It changes all colors to a dark background with bright yellow text and blue links, making everything easier to see for users with low vision.' },
    { icon: '📝', q: 'What is the Dyslexia Font?', a: 'It switches all text to OpenDyslexic, a font designed to make letters easier to tell apart for readers with dyslexia.' },
  ]

  const guides = [
    {
      icon: '📝', title: 'How to Create an Account',
      image: '/images/guides/guide-register.png',
      alt: 'Screenshot of the CompuBasics registration page showing the form fields',
      steps: [
        'Click "Register" on the navigation bar at the top.',
        'Type your full name, age (10–15), and select Grade 6.',
        'Choose a username (at least 3 characters).',
        'Create a strong password (8+ characters, with uppercase, lowercase, and a number).',
        'Click "Create Account" — you\'re all set!',
      ],
    },
    {
      icon: '📖', title: 'How to Start a Lesson',
      image: '/images/guides/guide-lessons.png',
      alt: 'Screenshot of the Lessons page showing lesson cards with locked and unlocked status',
      steps: [
        'Click "Lessons" on the navigation bar.',
        'Your first lesson is already unlocked — click on it to begin!',
        'Read through each section at your own pace.',
        'Look at the images and key points to understand each topic.',
        'When you\'re ready, click the "Take Quiz" button at the bottom.',
      ],
    },
    {
      icon: '✏️', title: 'How to Take a Quiz',
      image: '/images/guides/guide-quiz.png',
      alt: 'Screenshot of a quiz question showing an image of a computer part with four answer options',
      steps: [
        'After reading a lesson, click "Take Quiz".',
        'Look at the image shown for each question carefully.',
        'Choose the answer that matches what you see in the image.',
        'You can use keyboard shortcuts: press 1–4 to pick an answer, N for next.',
        'You need at least 70% correct to pass and unlock the next lesson!',
      ],
    },
    {
      icon: '♿', title: 'How to Use Accessibility Settings',
      image: '/images/guides/guide-accessibility.png',
      alt: 'Screenshot of the Accessibility settings page showing toggle switches',
      steps: [
        'Click the ♿ icon or "Accessibility" in the navigation bar.',
        'Under Vision: Change text size, turn on High Contrast, or enable Dyslexia Font.',
        'Under Motor: Enable Enhanced Focus or Large Cursor.',
        'Under Cognitive: Turn on Reduced Motion, Text-to-Speech, or adjust Line Spacing.',
        'Changes take effect immediately — try them out!',
      ],
    },
    {
      icon: '📊', title: 'How to Check Your Progress',
      image: '/images/guides/guide-profile.png',
      alt: 'Screenshot of the Profile page showing progress stats and lesson completion',
      steps: [
        'Click your username or "Profile" in the navigation bar.',
        'See your overall progress bar at the top.',
        'Check each lesson\'s status: completed ✅, unlocked 🔓, or locked 🔒.',
        'View your best quiz scores and quiz history.',
        'Earn achievement badges as you complete lessons and quizzes!',
      ],
    },
  ]

  return (
    <div className="max-w-3xl mx-auto space-y-8 animate-fadeIn" role="region" aria-label="Help and frequently asked questions">
      <div className="text-center">
        <div className="text-5xl mb-3">❓</div>
        <h1 className="text-3xl font-extrabold heading text-brand-700">Help & FAQ</h1>
        <p className="mt-2 text-steel">Find answers to common questions and learn how to use CompuBasics</p>
      </div>

      <section aria-label="Step-by-step visual guides">
        <h2 className="text-2xl font-extrabold text-brand-700 mb-4 flex items-center gap-2">
          <span className="text-3xl">📸</span> Step-by-Step Guides
        </h2>
        <p className="text-steel mb-4 text-sm">Click on a guide below to see a screenshot and simple step-by-step instructions.</p>
        <div className="space-y-4">
          {guides.map((guide, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                onClick={() => setOpenGuide(openGuide === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-3 hover:bg-brand-50 transition-colors"
                aria-expanded={openGuide === i}
                aria-controls={`guide-panel-${i}`}
              >
                <h3 className="text-lg font-bold text-brand-700 flex items-center gap-2">
                  <span className="text-2xl">{guide.icon}</span> {guide.title}
                </h3>
                <span className={`text-xl transition-transform duration-200 ${openGuide === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openGuide === i && (
                <div id={`guide-panel-${i}`} className="px-5 pb-5 space-y-4 border-t border-gray-100 pt-4">
                  <div className="rounded-xl overflow-hidden border-2 border-brand-100 bg-gray-50">
                    <img
                      src={guide.image}
                      alt={guide.alt || guide.title || 'Guide screenshot'}
                      className="w-full h-auto object-contain max-h-80"
                      onError={(e) => {
                        e.target.style.display = 'none'
                        if (e.target.nextSibling) e.target.nextSibling.style.display = 'flex'
                      }}
                    />
                    <div className="hidden items-center justify-center py-12 text-steel text-sm" style={{ display: 'none' }}>
                      <div className="text-center">
                        <div className="text-4xl mb-2">🖼️</div>
                        <p className="font-semibold">Screenshot coming soon</p>
                        <p className="text-xs mt-1 text-gray-400">Image: {guide.image.split('/').pop()}</p>
                      </div>
                    </div>
                  </div>
                  <ol className="space-y-2" role="list" aria-label={`Steps for: ${guide.title}`}>
                    {guide.steps.map((step, j) => (
                      <li key={j} className="flex items-start gap-3">
                        <span className="flex-shrink-0 w-7 h-7 rounded-full bg-brand-500 text-white text-sm font-bold flex items-center justify-center mt-0.5">{j + 1}</span>
                        <span className="text-steel leading-relaxed">{step}</span>
                      </li>
                    ))}
                  </ol>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      <section aria-label="Frequently asked questions">
        <h2 className="text-2xl font-extrabold text-brand-700 mb-4 flex items-center gap-2">
          <span className="text-3xl">💬</span> Frequently Asked Questions
        </h2>
        <div className="space-y-3">
          {faqs.map((faq, i) => (
            <Card key={i} className="overflow-hidden">
              <button
                onClick={() => setOpenFaq(openFaq === i ? null : i)}
                className="w-full text-left p-5 flex items-center justify-between gap-3 hover:bg-brand-50 transition-colors"
                aria-expanded={openFaq === i}
                aria-controls={`faq-panel-${i}`}
              >
                <h3 className="text-lg font-bold text-brand-700 flex items-center gap-2">
                  <span className="text-2xl">{faq.icon}</span> {faq.q}
                </h3>
                <span className={`text-xl transition-transform duration-200 ${openFaq === i ? 'rotate-180' : ''}`}>▼</span>
              </button>
              {openFaq === i && (
                <div id={`faq-panel-${i}`} className="px-5 pb-5 border-t border-gray-100 pt-3">
                  <p className="text-steel pl-9 leading-relaxed">{faq.a}</p>
                </div>
              )}
            </Card>
          ))}
        </div>
      </section>

      <div className="text-center text-sm text-steel bg-brand-50 rounded-xl p-4 border border-brand-100">
        💡 <strong>Tip:</strong> You can use the ♿ Accessibility page to adjust text size, contrast, and more to make CompuBasics work best for you!
      </div>
    </div>
  )
}
