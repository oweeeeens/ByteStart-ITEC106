import { useState, useEffect, useRef } from 'react'
import { useApp } from '../context/AppContext.jsx'
import { useLocation } from 'react-router-dom'

/**
 * Enhanced global TTS toolbar — reads sentence-by-sentence with natural pauses.
 */

function splitIntoChunks(text) {
  if (!text) return []
  const paragraphs = text.split(/\n{2,}|\r\n{2,}/).filter(Boolean)
  const chunks = []
  for (const para of paragraphs) {
    const sentences = para
      .split(/(?<=[.!?:;])\s+/)
      .map(s => s.trim())
      .filter(s => s.length > 0)
    for (let i = 0; i < sentences.length; i++) {
      const sentence = sentences[i]
      const isLastInParagraph = i === sentences.length - 1
      let pauseAfter = 500
      if (/[!?]$/.test(sentence)) pauseAfter = 650
      if (/[:;]$/.test(sentence)) pauseAfter = 400
      if (isLastInParagraph) pauseAfter = 800
      if (sentence.length > 200) {
        const subParts = sentence.split(/(?<=,)\s+/).filter(Boolean)
        subParts.forEach((part, j) => {
          chunks.push({ text: part.trim(), pause: j === subParts.length - 1 ? pauseAfter : 300 })
        })
      } else {
        chunks.push({ text: sentence, pause: pauseAfter })
      }
    }
  }
  return chunks
}

const SPEED_PRESETS = [
  { label: '🐢', rate: 0.65, title: 'Slow — easier to understand' },
  { label: '🚶', rate: 0.82, title: 'Normal — natural pace' },
  { label: '🏃', rate: 1.05, title: 'Fast — quicker reading' },
]

export default function ReadAloudToolbar() {
  const { settings } = useApp()
  const location = useLocation()
  const [isSpeaking, setIsSpeaking] = useState(false)
  const [isPaused, setIsPaused] = useState(false)
  const [isMinimized, setIsMinimized] = useState(false)
  const [speedIdx, setSpeedIdx] = useState(1)
  const [currentChunkIdx, setCurrentChunkIdx] = useState(-1)
  const [totalChunks, setTotalChunks] = useState(0)

  const chunksRef = useRef([])
  const indexRef = useRef(0)
  const stoppedRef = useRef(false)
  const pausedRef = useRef(false)
  const pauseTimerRef = useRef(null)

  useEffect(() => {
    stopSpeech()
  }, [location.pathname]) // eslint-disable-line react-hooks/exhaustive-deps

  useEffect(() => {
    return () => {
      stoppedRef.current = true
      clearTimeout(pauseTimerRef.current)
      if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    }
  }, [])

  if (!settings.textToSpeech) return null

  function getPageText() {
    const main = document.getElementById('main')
    if (!main) return ''
    const clone = main.cloneNode(true)
    clone.querySelectorAll('button, nav, .sr-only, script, style, [aria-hidden="true"], .tts-toolbar').forEach(el => el.remove())
    clone.querySelectorAll('p, h1, h2, h3, h4, li, tr, br, div').forEach(el => {
      el.insertAdjacentText('afterend', '\n\n')
    })
    let text = clone.innerText || clone.textContent || ''
    text = text.replace(/[\p{Emoji_Presentation}\p{Extended_Pictographic}\u200d\ufe0f]/gu, '')
    text = text.replace(/[^\S\n]+/g, ' ')
    text = text.replace(/\n{3,}/g, '\n\n')
    return text.trim()
  }

  function speakNextChunk() {
    if (stoppedRef.current) return
    if (pausedRef.current) return
    const chunks = chunksRef.current
    const idx = indexRef.current
    if (idx >= chunks.length) {
      setIsSpeaking(false)
      setIsPaused(false)
      setCurrentChunkIdx(-1)
      return
    }
    const chunk = chunks[idx]
    setCurrentChunkIdx(idx)
    const utterance = new SpeechSynthesisUtterance(chunk.text)
    utterance.rate = SPEED_PRESETS[speedIdx].rate
    utterance.pitch = 1.0
    utterance.onend = () => {
      if (stoppedRef.current) return
      indexRef.current = idx + 1
      pauseTimerRef.current = setTimeout(() => { speakNextChunk() }, chunk.pause)
    }
    utterance.onerror = () => {
      if (stoppedRef.current) return
      indexRef.current = idx + 1
      speakNextChunk()
    }
    window.speechSynthesis.speak(utterance)
  }

  function startSpeech(text) {
    if (!('speechSynthesis' in window)) return
    window.speechSynthesis.cancel()
    clearTimeout(pauseTimerRef.current)
    const rawText = text || getPageText()
    if (!rawText) return
    const chunks = splitIntoChunks(rawText)
    if (chunks.length === 0) return
    chunksRef.current = chunks
    indexRef.current = 0
    stoppedRef.current = false
    pausedRef.current = false
    setTotalChunks(chunks.length)
    setIsSpeaking(true)
    setIsPaused(false)
    speakNextChunk()
  }

  function pauseSpeech() {
    if ('speechSynthesis' in window) window.speechSynthesis.pause()
    clearTimeout(pauseTimerRef.current)
    pausedRef.current = true
    setIsPaused(true)
  }

  function resumeSpeech() {
    pausedRef.current = false
    setIsPaused(false)
    if ('speechSynthesis' in window && window.speechSynthesis.paused) {
      window.speechSynthesis.resume()
    } else {
      speakNextChunk()
    }
  }

  function stopSpeech() {
    stoppedRef.current = true
    clearTimeout(pauseTimerRef.current)
    if ('speechSynthesis' in window) window.speechSynthesis.cancel()
    setIsSpeaking(false)
    setIsPaused(false)
    setCurrentChunkIdx(-1)
  }

  function readSelection() {
    const selected = window.getSelection()?.toString().trim()
    if (!selected) return
    startSpeech(selected)
  }

  const progress = totalChunks > 0 && currentChunkIdx >= 0
    ? Math.round(((currentChunkIdx + 1) / totalChunks) * 100)
    : 0

  if (isMinimized) {
    return (
      <div className="fixed bottom-5 right-5 z-50">
        <button
          onClick={() => setIsMinimized(false)}
          className="w-14 h-14 rounded-full bg-gradient-to-br from-brand-500 to-purple-600 text-white shadow-lg hover:shadow-2xl flex items-center justify-center text-2xl transition-all hover:scale-110 border-2 border-white/20"
          aria-label="Expand read aloud toolbar"
          title="Expand Read Aloud"
        >
          🔊
        </button>
      </div>
    )
  }

  return (
    <div
      className="tts-toolbar fixed bottom-5 right-5 z-50 bg-white rounded-2xl shadow-2xl border border-gray-200 animate-slideUp overflow-hidden"
      role="toolbar"
      aria-label="Read Aloud controls"
      style={{ width: 280 }}
    >
      <div className="flex items-center justify-between px-4 py-2.5 bg-gradient-to-r from-brand-500 to-purple-600">
        <div className="flex items-center gap-2">
          <span className="text-lg">🔊</span>
          <span className="text-sm font-bold text-white tracking-wide">Read Aloud</span>
        </div>
        <button
          onClick={() => setIsMinimized(true)}
          className="w-6 h-6 rounded-md bg-white/20 hover:bg-white/30 text-white text-xs flex items-center justify-center transition-colors"
          aria-label="Minimize toolbar"
          title="Minimize"
        >
          —
        </button>
      </div>
      <div className="p-3 space-y-3">
        {isSpeaking && (
          <div>
            <div className="flex justify-between text-xs text-steel mb-1 font-medium">
              <span>Reading…</span>
              <span>{progress}%</span>
            </div>
            <div className="h-2 bg-gray-100 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-brand-400 to-purple-500 rounded-full transition-all duration-300"
                style={{ width: `${progress}%` }}
              />
            </div>
          </div>
        )}
        <div className="flex items-center gap-2">
          {!isSpeaking ? (
            <button
              onClick={() => startSpeech()}
              className="tts-btn flex-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-sm"
              aria-label="Read entire page aloud"
              title="Read Page"
            >
              ▶ Read Page
            </button>
          ) : isPaused ? (
            <button
              onClick={resumeSpeech}
              className="tts-btn flex-1 bg-gradient-to-r from-brand-500 to-brand-600 hover:from-brand-600 hover:to-brand-700 text-white shadow-sm"
              aria-label="Resume reading"
              title="Resume"
            >
              ▶ Resume
            </button>
          ) : (
            <button
              onClick={pauseSpeech}
              className="tts-btn flex-1 bg-gradient-to-r from-yellow-400 to-yellow-500 hover:from-yellow-500 hover:to-yellow-600 text-white shadow-sm"
              aria-label="Pause reading"
              title="Pause"
            >
              ⏸ Pause
            </button>
          )}
          {isSpeaking && (
            <button
              onClick={stopSpeech}
              className="tts-btn bg-red-500 hover:bg-red-600 text-white shadow-sm px-3"
              aria-label="Stop reading"
              title="Stop"
            >
              ⏹
            </button>
          )}
          <button
            onClick={readSelection}
            className="tts-btn bg-purple-500 hover:bg-purple-600 text-white shadow-sm"
            aria-label="Read selected text"
            title="Read Selection"
          >
            ✂ Selection
          </button>
        </div>
        <div className="flex items-center gap-2 bg-gray-50 rounded-xl px-3 py-2">
          <span className="text-xs text-steel font-semibold">Speed</span>
          <div className="flex-1 flex items-center gap-1.5 justify-end">
            {SPEED_PRESETS.map((preset, i) => (
              <button
                key={i}
                onClick={() => setSpeedIdx(i)}
                className={`w-9 h-9 rounded-lg flex items-center justify-center text-lg transition-all ${
                  speedIdx === i
                    ? 'bg-brand-500 shadow-md scale-110 ring-2 ring-brand-200'
                    : 'bg-white text-steel hover:bg-gray-100 border border-gray-200'
                }`}
                aria-label={preset.title}
                title={preset.title}
                aria-pressed={speedIdx === i}
              >
                {preset.label}
              </button>
            ))}
          </div>
        </div>
        <p className="text-[11px] text-gray-400 leading-tight">
          Select text on the page, then click <strong>Selection</strong> to read just that part.
        </p>
      </div>
    </div>
  )
}
