import { useApp } from '../context/AppContext.jsx'
import { useEffect, useState, useCallback, useRef } from 'react'
import Card from '../components/ui/Card.jsx'
import useDocTitle from '../hooks/useDocTitle.js'

export default function Accessibility() {
  useDocTitle('Accessibility Settings')
  const { settings, setSettings } = useApp()
  const [savedMsg, setSavedMsg] = useState('')
  const speechRef = useRef(null)

  useEffect(() => {
    if (savedMsg) {
      const t = setTimeout(() => setSavedMsg(''), 2000)
      return () => clearTimeout(t)
    }
  }, [savedMsg])

  const update = useCallback((key, value) => {
    setSettings((prev) => ({ ...prev, [key]: value }))
    setSavedMsg('Settings saved!')
    const announce = document.getElementById('a11y-announce')
    if (announce) {
      announce.textContent = `${key.replace(/([A-Z])/g, ' $1')} updated`
      setTimeout(() => { announce.textContent = '' }, 1500)
    }
  }, [setSettings])

  const speak = useCallback((text) => {
    if ('speechSynthesis' in window) {
      window.speechSynthesis.cancel()
      const utterance = new SpeechSynthesisUtterance(text)
      utterance.rate = 0.9
      utterance.pitch = 1
      window.speechSynthesis.speak(utterance)
    }
  }, [])

  useEffect(() => {
    return () => {
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  const Toggle = ({ id, label, description, settingKey, icon }) => {
    const isOn = !!settings[settingKey]
    return (
      <div className="flex items-start gap-4 bg-gray-50 rounded-xl p-4 border border-gray-100 hover:bg-gray-100 transition-colors">
        <div className="pt-0.5">
          <button
            id={id}
            role="switch"
            aria-checked={isOn}
            onClick={() => update(settingKey, !isOn)}
            className={`relative inline-flex h-7 w-14 items-center rounded-full transition-colors duration-200 focus-outline ${isOn ? 'bg-green-500' : 'bg-gray-400'}`}
          >
            <span className={`absolute text-[9px] font-extrabold text-white select-none ${isOn ? 'left-1.5' : 'right-1.5'}`}>
              {isOn ? 'ON' : 'OFF'}
            </span>
            <span className={`inline-block h-5 w-5 rounded-full bg-white shadow-md transform transition-transform duration-200 ${isOn ? 'translate-x-8' : 'translate-x-1'}`} />
          </button>
        </div>
        <label htmlFor={id} className="flex-1 cursor-pointer">
          <div className="font-bold text-ink">{icon} {label}</div>
          <div className="text-sm text-steel mt-0.5">{description}</div>
        </label>
      </div>
    )
  }

  return (
    <div className="max-w-2xl mx-auto space-y-6 animate-fadeIn" role="region" aria-label="Accessibility settings">
      <div id="a11y-announce" aria-live="assertive" aria-atomic="true" className="sr-only" />
      <div className="text-center">
        <div className="text-5xl mb-3">♿</div>
        <h1 className="text-3xl font-extrabold heading text-brand-700">Accessibility Settings</h1>
        <p className="mt-2 text-steel text-lg">Make CompuBasics work best for you. All settings are saved automatically.</p>
      </div>
      <div aria-live="polite" className={`text-center text-green-600 text-sm font-bold h-6 transition-opacity ${savedMsg ? 'opacity-100' : 'opacity-0'}`}>
        {savedMsg && '✅ ' + savedMsg}
      </div>

      {/* ===== VISION ===== */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">👁️</span>
          <h2 className="text-xl font-bold heading text-brand-700">Vision</h2>
        </div>
        <p className="text-sm text-steel -mt-2">Settings for low vision, color blindness, and visual impairments.</p>
        <div>
          <label className="block font-bold text-ink mb-2" htmlFor="font-size">🔤 Text Size</label>
          <div className="grid grid-cols-3 gap-2">
            {[
              { value: 'small', label: 'A', desc: 'Small' },
              { value: 'medium', label: 'A', desc: 'Medium' },
              { value: 'large', label: 'A', desc: 'Large' },
            ].map((opt, i) => (
              <button
                key={opt.value}
                onClick={() => update('fontSize', opt.value)}
                className={`py-3 rounded-xl border-2 font-bold transition-all ${settings.fontSize === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                style={{ fontSize: `${1 + i * 0.25}rem` }}
                aria-pressed={settings.fontSize === opt.value}
              >
                {opt.label}<span className="block text-xs font-normal mt-0.5">{opt.desc}</span>
              </button>
            ))}
          </div>
        </div>
        <Toggle id="contrast" settingKey="highContrast" label="High Contrast Mode" description="Uses dark background with bright yellow text for maximum readability." icon="🌗" />
        <Toggle id="dark-mode" settingKey="darkMode" label="Dark Mode" description="A comfortable dark theme for low-light environments. Reduces eye strain with cool-toned dark backgrounds." icon="🌙" />
        <div>
          <label className="block font-bold text-ink mb-2">↕️ Line Spacing</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ value: 'normal', label: 'Normal' }, { value: 'wide', label: 'Wide' }, { value: 'extra-wide', label: 'Extra Wide' }].map((opt) => (
              <button
                key={opt.value}
                onClick={() => update('lineSpacing', opt.value)}
                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${settings.lineSpacing === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                aria-pressed={settings.lineSpacing === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <Toggle id="highlight-focus" settingKey="highlightFocus" label="Enhanced Focus Indicator" description="Shows a bold visible outline around the currently focused element (buttons, links, inputs)." icon="🔲" />
      </Card>

      {/* ===== MOTOR / PHYSICAL ===== */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🖐️</span>
          <h2 className="text-xl font-bold heading text-brand-700">Motor & Physical</h2>
        </div>
        <p className="text-sm text-steel -mt-2">Settings for motor impairments, limited dexterity, and tremors.</p>
        <div>
          <label className="block font-bold text-ink mb-2">🖱️ Cursor Size</label>
          <div className="grid grid-cols-3 gap-2">
            {[{ value: 'default', label: 'Default' }, { value: 'large', label: 'Large' }, { value: 'extra-large', label: 'Extra Large' }].map((opt) => (
              <button
                key={opt.value}
                onClick={() => update('cursorSize', opt.value)}
                className={`py-3 rounded-xl border-2 font-bold text-sm transition-all ${settings.cursorSize === opt.value ? 'border-brand-500 bg-brand-50 text-brand-700 shadow-sm' : 'border-gray-200 bg-white text-gray-600 hover:border-gray-300'}`}
                aria-pressed={settings.cursorSize === opt.value}
              >
                {opt.label}
              </button>
            ))}
          </div>
        </div>
        <Toggle id="reduced-motion" settingKey="reducedMotion" label="Reduce Motion" description="Turns off all animations and transitions for users with vestibular disorders or motion sensitivity." icon="🚫" />
        <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
          <div className="font-bold text-blue-700 mb-2">⌨️ Keyboard Navigation</div>
          <p className="text-sm text-steel mb-2">You can use the keyboard to navigate the entire site:</p>
          <ul className="text-sm text-steel space-y-1.5">
            <li><kbd className="px-2 py-0.5 bg-white rounded border text-xs font-mono">Tab</kbd> — Move to the next button or link</li>
            <li><kbd className="px-2 py-0.5 bg-white rounded border text-xs font-mono">Shift+Tab</kbd> — Move backwards</li>
            <li><kbd className="px-2 py-0.5 bg-white rounded border text-xs font-mono">Enter</kbd> or <kbd className="px-2 py-0.5 bg-white rounded border text-xs font-mono">Space</kbd> — Activate a button</li>
            <li><kbd className="px-2 py-0.5 bg-white rounded border text-xs font-mono">1-4</kbd> — Select a quiz answer</li>
            <li><kbd className="px-2 py-0.5 bg-white rounded border text-xs font-mono">N</kbd> — Next quiz question</li>
          </ul>
        </div>
      </Card>

      {/* ===== COGNITIVE / LEARNING ===== */}
      <Card className="p-6 space-y-4">
        <div className="flex items-center gap-2 mb-1">
          <span className="text-2xl">🧠</span>
          <h2 className="text-xl font-bold heading text-brand-700">Cognitive & Learning</h2>
        </div>
        <p className="text-sm text-steel -mt-2">Settings for dyslexia, ADHD, and learning difficulties.</p>
        <Toggle id="dyslexia-font" settingKey="dyslexiaFont" label="Dyslexia-Friendly Font" description="Switches to OpenDyslexic font, designed to make letters easier to tell apart for readers with dyslexia." icon="📝" />
        <Toggle id="text-to-speech" settingKey="textToSpeech" label="Read Aloud (Text-to-Speech)" description='Shows a floating 🔊 toolbar on every page. Click to hear the page content read aloud, or select text to read just that part.' icon="🔊" />
        {settings.textToSpeech && (
          <div className="bg-green-50 rounded-xl p-4 border border-green-100">
            <div className="font-bold text-green-700 mb-2">🔊 Text-to-Speech is ON</div>
            <p className="text-sm text-steel mb-3">A floating toolbar will appear in the bottom-right of every page. Try it:</p>
            <button onClick={() => speak('Hello! Welcome to CompuBasics. The read aloud toolbar is now active on every page. Click Read Page to hear the whole page, or select some text and click Selection to hear just that part.')} className="btn btn-primary text-sm px-4 py-2">
              🔊 Play Sample
            </button>
            <button onClick={() => window.speechSynthesis.cancel()} className="btn btn-secondary text-sm px-4 py-2 ml-2">
              ⏹️ Stop
            </button>
          </div>
        )}
        <Toggle id="screen-reader" settingKey="screenReader" label="Screen Reader Optimized" description="Adds extra hidden labels, landmarks, and descriptions for screen reader software like NVDA or JAWS." icon="📖" />
      </Card>

      {/* ===== QUICK RESET ===== */}
      <Card className="p-6">
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-bold heading text-ink">🔄 Reset All Settings</h2>
            <p className="text-sm text-steel mt-1">Restore all accessibility settings to their defaults.</p>
          </div>
          <button
            onClick={() => {
              setSettings({ fontSize: 'medium', highContrast: false, darkMode: false, dyslexiaFont: false, reducedMotion: false, lineSpacing: 'normal', cursorSize: 'default', screenReader: false, highlightFocus: false, textToSpeech: false })
              setSavedMsg('All settings reset to defaults!')
            }}
            className="btn btn-danger text-sm px-4 py-2"
          >
            Reset
          </button>
        </div>
      </Card>

      <Card className="p-6 bg-gradient-to-br from-purple-50 to-pink-50 border-purple-100">
        <h2 className="text-xl font-bold heading text-purple-700 mb-3">💜 About PWD Accessibility</h2>
        <p className="text-steel text-sm leading-relaxed">
          CompuBasics is designed to be inclusive for Persons with Disabilities (PWDs). We follow
          web accessibility guidelines (WCAG 2.1) to ensure everyone can learn about computers.
          Features include keyboard navigation, screen reader support, dyslexia-friendly fonts,
          adjustable text sizes, high contrast mode, reduced motion, and text-to-speech.
          If you have suggestions on how we can improve accessibility, please let us know on the Help page.
        </p>
      </Card>
    </div>
  )
}
