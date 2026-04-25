import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import {
  MessageCircle, Send, Database, ChevronDown, ChevronUp,
  Sparkles, BookOpen, Zap, Brain, Trash2, Wifi, WifiOff, RefreshCw, Feather
} from 'lucide-react'
import { api } from '../api'
import { Card, Badge, CFBar, Button } from '../components/ui'
import Tabs from '../components/ui/Tabs'
import { PageHeader } from '../components/layout/PageTransition'

const CQS = [
  { id: 'cq1', label: 'CQ1 — Karma Yoga verses' },
  { id: 'cq2', label: 'CQ2 — Sthitaprajna (Steady Wisdom)' },
  { id: 'cq3', label: 'CQ3 — Desire downfall chain (transitive)' },
  { id: 'cq4', label: 'CQ4 — Meditation instructions (Ch. 6)' },
  { id: 'cq5', label: 'CQ5 — Karma vs. Sannyasa contrast' },
  { id: 'cq6', label: 'CQ6 — Good work → Wisdom chain' },
  { id: 'cq7', label: 'CQ7 — Arjuna questions → Krishna responses' },
  { id: 'cq8', label: 'CQ8 — Property chain inference' },
]

const SUGGESTED_CONCERNS = [
  'I feel anxious about the results of my work',
  'I am angry and cannot control my desires',
  'I am confused about my duty in life',
  'My mind is restless during meditation',
  'I seek liberation and inner peace',
  'I feel grief and do not know what to do',
]

// ── Raven sigil SVG ───────────────────────────────────────────────────────────
function RavenIcon({ size = 16, className = '' }) {
  return (
    <svg width={size} height={size * 0.72} viewBox="0 0 64 46" fill="currentColor" className={className} aria-hidden>
      <path d="M32 3C28 3 22 7 18 13C14 19 12 27 14 33C10 31 6 29 4 31C8 33 12 37 16 39
               C18 43 22 45 26 45C28 45 30 43 30 41C30 39 28 37 26 37C24 37 22 39 22 39
               C20 37 18 33 20 29C22 25 26 23 28 21C26 25 24 29 26 33C28 35 32 35 34 33
               C36 31 36 27 34 23C38 21 44 19 48 15C52 11 54 7 52 5
               C50 3 46 5 44 9C42 13 42 17 40 19C38 15 36 9 32 3Z
               M48 7C50 7 52 9 50 11C48 13 44 13 42 11C44 9 46 7 48 7Z" />
    </svg>
  )
}

// ── Language config ───────────────────────────────────────────────────────────
const LANG_CONFIG = {
  en: {
    label: 'EN',
    full: 'English',
    placeholder: 'Describe your concern or emotion…',
    greeting: 'Namaste. Share your concern or question — I will search the Bhagavad Gītā, infer the most relevant teachings, and explain them through the lens of your situation.',
    tryLabel: 'Try asking about:',
    suggestions: SUGGESTED_CONCERNS,
    goalPlaceholder: 'e.g., liberation, inner peace…',
  },
  hi: {
    label: 'हिंदी',
    full: 'Hindi',
    placeholder: 'अपनी समस्या या भावना बताएं…',
    greeting: 'नमस्ते। अपनी चिंता या प्रश्न बताइए — मैं भगवद् गीता में सबसे प्रासंगिक शिक्षाएं खोजूंगा।',
    tryLabel: 'इनके बारे में पूछें:',
    suggestions: [
      'मुझे काम के परिणामों की चिंता है',
      'मैं अपने क्रोध और इच्छाओं को नियंत्रित नहीं कर पा रहा',
      'मुझे अपने कर्तव्य को लेकर भ्रम है',
      'ध्यान के दौरान मन बहुत चंचल रहता है',
      'मुझे मोक्ष और आंतरिक शांति की तलाश है',
      'मैं बहुत दुखी हूं, समझ नहीं आता क्या करूं',
    ],
    goalPlaceholder: 'जैसे: मोक्ष, शांति, आत्मज्ञान…',
  },
  hinglish: {
    label: 'Hinglish',
    full: 'Hinglish',
    placeholder: 'Apni pareshani ya emotion batao…',
    greeting: 'Namaste! Apna concern ya question batao — main Bhagavad Gītā mein sabse relevant teachings dhundhunga aur Ollama se explanation bhi de sakta hoon.',
    tryLabel: 'In topics pe pooch sakte ho:',
    suggestions: [
      'Mujhe kaam ke results ki bahut chinta rehti hai',
      'Main gusse aur desires ko control nahi kar pa raha',
      'Apne duty ko lekar bahut confused hoon',
      'Meditation mein mann bahut chanchal rehta hai',
      'Mukti aur inner peace chahiye mujhe',
      'Bahut dukhi hoon, samajh nahi aa raha kya karun',
    ],
    goalPlaceholder: 'Jaise: moksha, shanti, atma gyan…',
  },
}

// ── Language toggle — illuminated pill ───────────────────────────────────────
function LangToggle({ lang, setLang }) {
  return (
    <div className="flex items-center gap-0.5 p-0.5 rounded-full"
      style={{ background: 'rgba(31,23,16,0.85)', border: '1px solid rgba(138,110,42,0.3)' }}>
      {Object.entries(LANG_CONFIG).map(([key, cfg]) => (
        <button key={key} onClick={() => setLang(key)}
          className="px-3 py-1 rounded-full text-[11px] font-semibold transition-all duration-200"
          style={lang === key ? {
            background: 'linear-gradient(135deg, #d5b35b, #ad8430)',
            color: '#160f08',
            boxShadow: '0 2px 10px rgba(201,168,76,0.25)',
          } : { color: 'rgba(138,110,42,0.8)' }}
        >
          {cfg.label}
        </button>
      ))}
    </div>
  )
}

// ── Ollama status badge ────────────────────────────────────────────────────────
function OllamaStatus({ model, onModelChange }) {
  const { data, isLoading, refetch } = useQuery({
    queryKey: ['ollama_status'],
    queryFn: api.ollamaStatus,
    refetchInterval: 15000,
    retry: false,
  })
  const running = data?.running
  const models  = data?.models ?? []

  return (
    <div className="flex items-center gap-2">
      <div className="flex items-center gap-1.5 text-[11px] px-2.5 py-1 rounded-full"
        style={{
          border: `1px solid ${isLoading ? 'rgba(122,96,64,0.4)' : running ? 'rgba(74,158,122,0.35)' : 'rgba(176,48,32,0.35)'}`,
          background: isLoading ? 'transparent' : running ? 'rgba(74,158,122,0.08)' : 'rgba(176,48,32,0.08)',
          color: isLoading ? '#7A6040' : running ? '#4A9E7A' : '#B03020',
        }}>
        {isLoading ? <RefreshCw size={10} className="animate-spin" /> :
         running   ? <Wifi size={10} /> : <WifiOff size={10} />}
        <span>Ollama {isLoading ? '…' : running ? 'online' : 'offline'}</span>
      </div>
      {running && models.length > 0 && (
        <select value={model} onChange={e => onModelChange(e.target.value)}
          className="text-[11px] py-1 h-auto" style={{ background: '#1F1710', borderColor: 'rgba(138,110,42,0.3)', color: '#C4A97A' }}>
          {models.map(m => <option key={m} value={m}>{m}</option>)}
        </select>
      )}
      {!running && !isLoading && (
        <button onClick={() => refetch()} className="transition-colors" style={{ color: 'rgba(122,96,64,0.7)' }}>
          <RefreshCw size={10} />
        </button>
      )}
    </div>
  )
}

// ── Illuminated verse card ─────────────────────────────────────────────────────
function AskVerseCard({ v, score, concern, model, lang = 'en', showCommentaryBtn = false }) {
  const [expanded, setExpanded]   = useState(false)
  const [commentary, setCommentary] = useState(null)
  const ch = v.chapter ?? v.chapter_number
  const vs = v.verse_number ?? v.verse

  const { mutate: getCommentary, isPending: commentaryPending } = useMutation({
    mutationFn: () => api.contextualize({
      verse_ref: `${ch}.${vs}`,
      english:   v.en || v.translation || '',
      sanskrit:  v.sa || '',
      concept:   v.concepts?.join(', ') || '',
      user_query: concern || 'general spiritual guidance',
      model: model || 'llama3',
      lang,
    }),
    onSuccess: (d) => setCommentary(d.commentary || d.error),
  })

  return (
    <div className="illuminated-card overflow-hidden text-left" style={{ position: 'relative' }}>
      {/* Raven sigil watermark — top-right corner */}
      <RavenIcon size={48} className="absolute top-3 right-3 opacity-[0.06] text-gold pointer-events-none" />

      <div className="relative px-5 pt-4 pb-3">
        {/* Header */}
        <div className="flex items-center gap-2 mb-3 flex-wrap">
          <span className="font-cinzel font-bold text-base tracking-wider"
            style={{ color: '#f0d8a0', textShadow: '0 0 14px rgba(201,168,76,0.25)' }}>
            {ch}.{vs}
          </span>
          {score != null && (
            <span className="text-[10px] font-mono px-2 py-0.5 rounded-full"
              style={{ background: 'rgba(74,158,122,0.12)', border: '1px solid rgba(74,158,122,0.25)', color: '#4A9E7A' }}>
              {(score * 100).toFixed(1)}% match
            </span>
          )}
          {v.speaker && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-semibold"
              style={v.speaker === 'Krishna'
                ? { border: '1px solid rgba(74,158,122,0.3)', color: '#4A9E7A', background: 'rgba(74,158,122,0.08)' }
                : { border: '1px solid rgba(232,134,26,0.3)', color: '#E8861A', background: 'rgba(232,134,26,0.08)' }}>
              {v.speaker}
            </span>
          )}
          {v.ai_corpus && (
            <span className="text-[10px] px-2 py-0.5 rounded-full font-mono"
              style={{ border: '1px solid rgba(201,168,76,0.2)', color: 'rgba(201,168,76,0.55)' }}>
              AI Corpus
            </span>
          )}
        </div>

        {/* Score bar */}
        {score != null && (
          <div className="h-0.5 w-full rounded-full mb-3 overflow-hidden"
            style={{ background: 'rgba(61,46,30,0.8)' }}>
            <div className="h-full rounded-full"
              style={{ width: `${Math.max(score * 100, 4)}%`, background: 'linear-gradient(90deg, #4A9E7A, #C9A84C)' }} />
          </div>
        )}

        {/* Sanskrit — large glowing Devanagari */}
        {v.sa && (
          <div className="mb-3 px-2 py-2 rounded-xl text-center"
            style={{ background: 'rgba(201,168,76,0.04)', border: '1px solid rgba(201,168,76,0.10)' }}>
            <p className="font-dev whitespace-pre-line leading-[2.3]"
              style={{ color: '#f4d9a1', fontSize: '1rem', textShadow: '0 0 20px rgba(201,168,76,0.18)' }}>
              {v.sa}
            </p>
          </div>
        )}

        {/* Knotwork divider */}
        {v.sa && (v.en || v.hi) && (
          <div className="knotwork-rule my-2"><span>✦</span></div>
        )}

        {/* English — IM Fell with drop-cap */}
        {v.en && (
          <p className="manuscript-dropcap font-fell leading-[1.9] mb-2"
            style={{ color: '#f2e3bf', fontSize: '1.05rem', lineHeight: '1.85' }}>
            {v.en}
          </p>
        )}

        {/* Hindi */}
        {v.hi && (
          <p className="font-dev leading-[2.0] mt-1"
            style={{ color: '#e2d0af', fontSize: '0.9rem' }}>
            {v.hi}
          </p>
        )}

        {/* Concept chips — wax seals */}
        {v.concepts?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-3 pt-2.5"
            style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}>
            {v.concepts.map(c => (
              <span key={c} className="wax-chip">
                {c.replace(/_inst$/, '').replace(/_/g, ' ')}
              </span>
            ))}
          </div>
        )}

        {/* Expand transliteration */}
        {(v.transliteration || v.word_meanings) && (
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 mt-2.5 transition-colors"
            style={{ color: 'rgba(122,96,64,0.85)', fontSize: '0.7rem', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={11} />
            </motion.span>
            {expanded ? 'Hide' : 'Transliteration & meanings'}
          </button>
        )}
      </div>

      {/* Expandable transliteration */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-5 pb-4 pt-2 space-y-2"
              style={{ borderTop: '1px solid rgba(201,168,76,0.10)', background: 'rgba(10,8,5,0.4)' }}>
              {v.transliteration && (
                <p className="font-cormorant italic leading-relaxed"
                  style={{ color: '#cdb899', fontSize: '0.95rem' }}>
                  {v.transliteration}
                </p>
              )}
              {v.word_meanings && (
                <p className="leading-relaxed"
                  style={{ color: '#8a7060', fontSize: '0.78rem' }}>
                  {v.word_meanings}
                </p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Ollama commentary */}
      {showCommentaryBtn && (
        <div style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}>
          {!commentary ? (
            <button onClick={() => getCommentary()} disabled={commentaryPending}
              className="w-full flex items-center justify-center gap-2 px-5 py-2.5 transition-colors disabled:opacity-50"
              style={{ color: 'rgba(122,96,64,0.75)', fontSize: '0.7rem', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
              {commentaryPending ? (
                <>
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}>
                    <RefreshCw size={11} />
                  </motion.span>
                  <span>Summoning <span style={{ color: '#C9A84C', fontFamily: 'JetBrains Mono, monospace' }}>{model || 'llama3'}</span>…</span>
                </>
              ) : (
                <>
                  <RavenIcon size={12} className="text-gold opacity-60" />
                  <span>Oracle commentary via <span style={{ color: '#C9A84C', fontFamily: 'JetBrains Mono, monospace' }}>{model || 'llama3'}</span></span>
                </>
              )}
            </button>
          ) : (
            <motion.div initial={{ opacity: 0, y: 4 }} animate={{ opacity: 1, y: 0 }}
              className="px-5 py-4 space-y-2"
              style={{ background: 'rgba(15,11,7,0.6)', borderTop: '1px solid rgba(139,32,16,0.20)' }}>
              <div className="flex items-center gap-2 mb-2">
                <RavenIcon size={13} className="text-gold" />
                <span className="font-cinzel text-[10px] tracking-[0.18em] uppercase"
                  style={{ color: '#C9A84C' }}>
                  Oracle · {model || 'llama3'}
                </span>
              </div>
              {commentary.split('\n\n').filter(Boolean).map((para, k) => (
                <p key={k} className="font-fell leading-[1.85]"
                  style={{ color: '#e8d5b0', fontSize: '0.88rem' }}>
                  {para.trim()}
                </p>
              ))}
              <button onClick={() => setCommentary(null)}
                className="text-[10px] transition-colors mt-1"
                style={{ color: 'rgba(122,96,64,0.6)', letterSpacing: '0.1em', textTransform: 'uppercase' }}>
                Dismiss
              </button>
            </motion.div>
          )}
        </div>
      )}
    </div>
  )
}

// ── Chat Panel ────────────────────────────────────────────────────────────────
function ChatPanel() {
  const [lang, setLang]   = useState('en')
  const lc = LANG_CONFIG[lang]

  const [messages, setMessages] = useState([
    { role: 'system', text: LANG_CONFIG.en.greeting }
  ])
  const [concern, setConcern]   = useState('')
  const [goal, setGoal]         = useState('')
  const [stage, setStage]       = useState('beginner')
  const [nature, setNature]     = useState('active')
  const [model, setModel]       = useState('llama3')
  const [autoCommentary, setAutoCommentary] = useState(true)
  const [expandedRules, setExpandedRules]   = useState(null)
  const [expandedVerses, setExpandedVerses] = useState(null)
  const [lastConcern, setLastConcern]       = useState('')
  const bottomRef = useRef(null)

  useEffect(() => {
    setMessages(prev => {
      if (prev.length === 1 && prev[0].role === 'system' && !prev[0].data) {
        return [{ role: 'system', text: LANG_CONFIG[lang].greeting }]
      }
      return prev
    })
  }, [lang])

  const { mutate: infer, isPending: inferPending } = useMutation({
    mutationFn: api.infer,
    onSuccess: (data) => {
      setMessages(m => [...m, { role: 'system', data, concern: lastConcern }])
      if (autoCommentary && data.start_verse?.en) {
        const sv = data.start_verse
        mutateCommentary({
          verse_ref: `${sv.chapter}.${sv.verse_number}`,
          english:   sv.en || sv.translation || '',
          sanskrit:  sv.sa || '',
          concept:   data.recommend_concept || '',
          user_query: lastConcern,
          model,
          lang,
        })
      }
    }
  })

  const { mutate: mutateCommentary, isPending: commentaryPending } = useMutation({
    mutationFn: api.contextualize,
    onSuccess: (data) => {
      setMessages(m => [...m, {
        role: 'ollama',
        text: data.commentary || data.error,
        model: data.model,
        lang,
        isError: !!data.error,
      }])
    }
  })

  const isPending = inferPending || commentaryPending

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, inferPending, commentaryPending])

  const send = (text) => {
    const val = (text ?? concern).trim()
    if (!val) return
    setLastConcern(val)
    setMessages(m => [...m, { role: 'user', text: val }])
    infer({ concern: val, goal, stage, nature, lang })
    setConcern('')
  }

  const clearChat = () => setMessages([{ role: 'system', text: lc.greeting }])

  return (
    <div className="space-y-4">
      {/* Controls panel */}
      <div className="parchment-card p-4">
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="block mb-1" style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(122,96,64,0.85)' }}>Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="block mb-1" style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(122,96,64,0.85)' }}>Nature</label>
            <select value={nature} onChange={e => setNature(e.target.value)}>
              <option value="active">Active</option>
              <option value="contemplative">Contemplative</option>
              <option value="devotional">Devotional</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="block mb-1" style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(122,96,64,0.85)' }}>Goal (optional)</label>
            <input placeholder={lc.goalPlaceholder} value={goal} onChange={e => setGoal(e.target.value)} />
          </div>
        </div>

        <div className="mt-3 pt-3 flex items-center justify-between flex-wrap gap-3"
          style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}>
          <div className="flex items-center gap-3 flex-wrap">
            <OllamaStatus model={model} onModelChange={setModel} />
            <LangToggle lang={lang} setLang={setLang} />
          </div>
          <label className="flex items-center gap-2 cursor-pointer select-none"
            style={{ fontSize: '0.7rem', color: 'rgba(122,96,64,0.8)', letterSpacing: '0.08em', textTransform: 'uppercase' }}>
            <div onClick={() => setAutoCommentary(v => !v)}
              className="relative rounded-full transition-colors"
              style={{
                width: 32, height: 16,
                background: autoCommentary ? 'linear-gradient(90deg, #d5b35b, #ad8430)' : 'rgba(61,46,30,0.8)',
                border: autoCommentary ? 'none' : '1px solid rgba(138,110,42,0.3)',
              }}>
              <motion.div
                animate={{ x: autoCommentary ? 16 : 2 }}
                className="absolute top-0.5 left-0 rounded-full bg-white shadow-sm"
                style={{ width: 12, height: 12 }}
                transition={{ type: 'spring', stiffness: 500, damping: 30 }}
              />
            </div>
            Oracle auto-commentary
          </label>
        </div>
      </div>

      {/* Suggested concerns */}
      {messages.length <= 1 && (
        <div>
          <p className="mb-2" style={{ fontSize: '0.68rem', color: 'rgba(122,96,64,0.8)', textTransform: 'uppercase', letterSpacing: '0.14em' }}>
            {lc.tryLabel}
          </p>
          <div className="flex flex-wrap gap-2">
            {lc.suggestions.map(s => (
              <button key={s} onClick={() => send(s)}
                className="transition-colors"
                style={{
                  fontSize: '0.72rem', padding: '0.35rem 0.85rem', borderRadius: 999,
                  border: '1px solid rgba(138,110,42,0.28)', color: 'rgba(196,169,122,0.8)',
                  background: 'rgba(26,20,14,0.7)', fontFamily: '"IM Fell English", Spectral, serif',
                }}>
                {s}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Chat window */}
      <div style={{
        background: 'linear-gradient(180deg, #14100a 0%, #0e0b07 100%)',
        border: '1px solid rgba(201,168,76,0.16)',
        borderRadius: 20,
        overflow: 'hidden',
        boxShadow: '0 8px 40px rgba(0,0,0,0.45), inset 0 1px 0 rgba(255,241,195,0.04)',
      }}>
        {/* Chat header bar */}
        <div className="flex items-center justify-between px-5 py-2.5"
          style={{ borderBottom: '1px solid rgba(201,168,76,0.10)', background: 'rgba(10,8,5,0.5)' }}>
          <span className="flex items-center gap-2 font-cinzel"
            style={{ fontSize: '0.65rem', color: 'rgba(138,110,42,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
            <MessageCircle size={11} />
            {messages.filter(m => m.role !== 'system' || m.data).length} exchange{messages.filter(m => m.role !== 'system' || m.data).length !== 1 ? 's' : ''}
          </span>
          <button onClick={clearChat} className="flex items-center gap-1 transition-colors"
            style={{ fontSize: '0.65rem', color: 'rgba(122,96,64,0.6)', letterSpacing: '0.12em', textTransform: 'uppercase' }}>
            <Trash2 size={10} /> Clear scroll
          </button>
        </div>

        {/* Messages — manuscript paper */}
        <div className="manuscript-paper h-[32rem] overflow-y-auto p-5 space-y-4">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {/* User bubble */}
                {msg.role === 'user' && (
                  <div className="max-w-xs royal-bubble-user px-4 py-2.5"
                    style={{ fontFamily: '"IM Fell English", Spectral, serif', fontSize: '0.92rem', lineHeight: 1.7 }}>
                    {msg.text}
                  </div>
                )}

                {/* Plain system greeting */}
                {msg.role === 'system' && msg.text && !msg.data && (
                  <div className="max-w-sm royal-bubble-system px-4 py-3">
                    <div className="flex items-center gap-1.5 mb-1.5">
                      <RavenIcon size={11} className="text-gold opacity-60" />
                      <span className="font-cinzel text-[9px] tracking-[0.2em] uppercase" style={{ color: 'rgba(138,110,42,0.7)' }}>
                        Gītā Oracle
                      </span>
                    </div>
                    <p style={{ fontFamily: '"IM Fell English", Spectral, serif', fontSize: '0.88rem', lineHeight: 1.75, color: '#c4a97a' }}>
                      {msg.text}
                    </p>
                  </div>
                )}

                {/* Expert system result */}
                {msg.role === 'system' && msg.data && (
                  <div className="w-full max-w-xl parchment-card p-4 space-y-3">
                    <div className="flex items-center gap-2 flex-wrap">
                      {msg.data.recommend_concept && (
                        <span className="font-cinzel text-[10px] tracking-[0.15em] uppercase px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.28)', color: '#f0d8a0' }}>
                          📌 {msg.data.recommend_concept.replace(/_inst$/, '').replace(/_/g, ' ')}
                        </span>
                      )}
                      {msg.data.start_verse && (
                        <span className="font-mono text-[10px] px-2.5 py-1 rounded-full"
                          style={{ background: 'rgba(74,158,122,0.10)', border: '1px solid rgba(74,158,122,0.28)', color: '#4A9E7A' }}>
                          📖 {msg.data.start_verse.chapter}.{msg.data.start_verse.verse_number}
                        </span>
                      )}
                      <span className="ml-auto font-cinzel" style={{ fontSize: '0.6rem', color: 'rgba(122,96,64,0.6)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                        Expert System
                      </span>
                    </div>

                    <CFBar value={msg.data.confidence ?? 0} label="Confidence" />

                    {/* Start verse */}
                    {msg.data.start_verse && (
                      <div>
                        <p className="mb-1.5 font-cinzel"
                          style={{ fontSize: '0.6rem', color: 'rgba(122,96,64,0.75)', letterSpacing: '0.18em', textTransform: 'uppercase' }}>
                          Recommended starting verse:
                        </p>
                        <AskVerseCard v={msg.data.start_verse} concern={msg.concern} model={model}
                          lang={lang} showCommentaryBtn={!autoCommentary} />
                      </div>
                    )}

                    {/* Related verses */}
                    {msg.data.recommended_verses?.length > 0 && (
                      <div>
                        <button onClick={() => setExpandedVerses(expandedVerses === i ? null : i)}
                          className="flex items-center gap-1.5 transition-colors"
                          style={{ fontSize: '0.72rem', color: 'rgba(122,96,64,0.75)', letterSpacing: '0.08em' }}>
                          <BookOpen size={11} />
                          {expandedVerses === i ? 'Hide' : 'Show'}{' '}
                          {msg.data.recommended_verses.length} related verse{msg.data.recommended_verses.length > 1 ? 's' : ''}
                          <motion.span animate={{ rotate: expandedVerses === i ? 180 : 0 }} transition={{ duration: 0.2 }}>
                            <ChevronDown size={11} />
                          </motion.span>
                        </button>
                        <AnimatePresence>
                          {expandedVerses === i && (
                            <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
                              exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
                              <div className="mt-2 space-y-2">
                                {msg.data.recommended_verses.map((v, j) => (
                                  <AskVerseCard key={v.key ?? j} v={v} concern={msg.concern}
                                    model={model} lang={lang} showCommentaryBtn />
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}

                    {/* Fired rules */}
                    {msg.data.fired_rules?.length > 0 && (
                      <div>
                        <button onClick={() => setExpandedRules(expandedRules === i ? null : i)}
                          className="flex items-center gap-1.5 transition-colors"
                          style={{ fontSize: '0.72rem', color: 'rgba(122,96,64,0.7)' }}>
                          <Zap size={11} />
                          {expandedRules === i ? <ChevronUp size={11} /> : <ChevronDown size={11} />}
                          {msg.data.fired_rules.length} rule{msg.data.fired_rules.length > 1 ? 's' : ''} fired
                        </button>
                        <AnimatePresence>
                          {expandedRules === i && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="mt-2 space-y-1.5">
                                {msg.data.fired_rules.map((r, j) => {
                                  const name = Array.isArray(r) ? r[0] : r
                                  const cf   = Array.isArray(r) ? parseFloat(r[1]) : null
                                  const desc = Array.isArray(r) ? r[2] : ''
                                  return (
                                    <div key={j} className="flex items-start gap-1.5" style={{ fontSize: '0.78rem', color: '#c4a97a' }}>
                                      <span className="w-1.5 h-1.5 rounded-full shrink-0 mt-1.5" style={{ background: '#C9A84C' }} />
                                      <span>
                                        <span className="font-mono" style={{ color: '#C9A84C', fontSize: '0.68rem' }}>{name}</span>
                                        {cf != null && <span style={{ color: 'rgba(122,96,64,0.8)', marginLeft: 4 }}>(CF: {cf.toFixed(2)})</span>}
                                        {desc && <span style={{ color: 'rgba(122,96,64,0.75)', marginLeft: 4 }}>— {desc}</span>}
                                      </span>
                                    </div>
                                  )
                                })}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                )}

                {/* Raven / Ollama commentary bubble */}
                {msg.role === 'ollama' && (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}
                    className={`w-full max-w-xl ${msg.isError ? '' : 'raven-bubble'} p-4`}
                    style={msg.isError ? {
                      background: 'rgba(176,48,32,0.08)', border: '1px solid rgba(176,48,32,0.25)',
                      borderRadius: '18px 18px 18px 4px',
                    } : {}}>
                    <div className="flex items-center gap-2 mb-3">
                      <RavenIcon size={14} className="text-gold" />
                      <span className="font-cinzel tracking-[0.16em] uppercase"
                        style={{ fontSize: '0.62rem', color: msg.isError ? '#B03020' : '#C9A84C' }}>
                        {msg.isError ? 'Oracle error' : `Oracle · ${msg.model} · ${LANG_CONFIG[msg.lang ?? 'en']?.full ?? 'English'}`}
                      </span>
                    </div>
                    {msg.isError ? (
                      <p style={{ fontSize: '0.82rem', color: '#B03020' }}>{msg.text}</p>
                    ) : (
                      msg.text?.split('\n\n').filter(Boolean).map((para, k) => (
                        <p key={k} className="font-fell leading-[1.85] mb-2 last:mb-0"
                          style={{ color: '#e8d5b0', fontSize: '0.9rem' }}>
                          {para.trim()}
                        </p>
                      ))
                    )}
                  </motion.div>
                )}
              </motion.div>
            ))}

            {/* Searching indicator */}
            {inferPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="royal-bubble-system flex items-center gap-2 px-4 py-3">
                  {[0,1,2].map(d => (
                    <motion.div key={d} className="w-1.5 h-1.5 rounded-full"
                      style={{ background: '#C9A84C' }}
                      animate={{ y: [0,-5,0] }}
                      transition={{ repeat: Infinity, duration: 0.9, delay: d * 0.18 }}
                    />
                  ))}
                  <span style={{ fontSize: '0.7rem', color: 'rgba(122,96,64,0.8)', marginLeft: 4, letterSpacing: '0.06em' }}>
                    Searching the Gītā…
                  </span>
                </div>
              </motion.div>
            )}

            {/* Oracle thinking indicator */}
            {commentaryPending && !inferPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="raven-bubble flex items-center gap-2 px-4 py-3">
                  <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1.5, ease: 'linear' }}>
                    <RavenIcon size={13} className="text-gold" />
                  </motion.span>
                  <span style={{ fontSize: '0.7rem', color: 'rgba(180,150,100,0.8)', letterSpacing: '0.06em' }}>
                    {model} is consulting the ancient scrolls…
                  </span>
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Quill input bar */}
        <div className="flex gap-2 p-4" style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}>
          <div className="flex-1 relative">
            <Feather size={14} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(138,110,42,0.55)' }} />
            <textarea
              rows={1}
              className="scroll-input w-full pl-9 pr-3"
              style={{ minHeight: 40, maxHeight: 120, resize: 'none', paddingTop: '0.55rem', paddingBottom: '0.55rem', lineHeight: 1.6 }}
              placeholder={lc.placeholder}
              value={concern}
              onChange={e => setConcern(e.target.value)}
              onKeyDown={e => {
                if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); send() }
              }}
            />
          </div>
          <button
            onClick={() => send()}
            disabled={!concern.trim() || isPending}
            className="flex items-center justify-center rounded-xl transition-all disabled:opacity-40"
            style={{
              width: 42, height: 42, flexShrink: 0,
              background: concern.trim() && !isPending
                ? 'linear-gradient(135deg, #d5b35b, #ad8430)'
                : 'rgba(61,46,30,0.6)',
              border: '1px solid rgba(138,110,42,0.4)',
              color: concern.trim() && !isPending ? '#160f08' : 'rgba(138,110,42,0.5)',
              boxShadow: concern.trim() && !isPending ? '0 4px 16px rgba(201,168,76,0.20)' : 'none',
            }}>
            {inferPending
              ? <motion.span animate={{ rotate: 360 }} transition={{ repeat: Infinity, duration: 1, ease: 'linear' }}><RefreshCw size={14} /></motion.span>
              : <Send size={14} />}
          </button>
        </div>
      </div>
    </div>
  )
}

// ── SPARQL Panel ──────────────────────────────────────────────────────────────
function SPARQLPanel() {
  const [cq, setCq] = useState('cq1')
  const { mutate, data, isPending } = useMutation({ mutationFn: (id) => api.sparql(id) })

  return (
    <div className="space-y-4">
      <div className="parchment-card p-4">
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="block mb-1" style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(122,96,64,0.85)' }}>
              Competency Question
            </label>
            <select value={cq} onChange={e => setCq(e.target.value)}>
              {CQS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <Button variant="gold" loading={isPending} onClick={() => mutate(cq)}>
            Execute SPARQL
          </Button>
        </div>
        {data?.question && (
          <p className="mt-3 font-fell leading-relaxed" style={{ fontSize: '0.85rem', color: '#c4a97a' }}>
            <span style={{ color: 'rgba(122,96,64,0.9)', fontWeight: 600 }}>Question: </span>{data.question}
          </p>
        )}
        {data?.technique && (
          <p className="mt-0.5" style={{ fontSize: '0.75rem', color: 'rgba(122,96,64,0.8)' }}>
            <span style={{ fontWeight: 600 }}>Technique: </span>{data.technique}
          </p>
        )}
      </div>

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {data.query && (
              <div className="parchment-card p-4">
                <p className="mb-2 font-cinzel" style={{ fontSize: '0.6rem', color: 'rgba(122,96,64,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>SPARQL Query</p>
                <pre className="font-mono overflow-x-auto p-3 rounded-lg leading-relaxed whitespace-pre-wrap"
                  style={{ fontSize: '0.72rem', color: '#c4a97a', background: 'rgba(10,8,5,0.6)', border: '1px solid rgba(61,46,30,0.8)' }}>
                  {data.query}
                </pre>
              </div>
            )}
            {data.error ? (
              <div className="parchment-card p-4">
                <p style={{ fontSize: '0.88rem', color: '#B03020' }}>{data.error}</p>
              </div>
            ) : (
              <div className="parchment-card p-4">
                <p className="mb-3 font-cinzel" style={{ fontSize: '0.6rem', color: 'rgba(122,96,64,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
                  {data.rows?.length ?? 0} result{(data.rows?.length ?? 0) !== 1 ? 's' : ''}
                </p>
                <div className="overflow-x-auto">
                  <table className="w-full" style={{ fontSize: '0.75rem' }}>
                    {data.headers?.length > 0 && (
                      <thead>
                        <tr style={{ borderBottom: '1px solid rgba(61,46,30,0.8)' }}>
                          {data.headers.map(h => (
                            <th key={h} className="text-left py-2 pr-4 capitalize" style={{ color: 'rgba(122,96,64,0.85)', fontWeight: 600 }}>{h}</th>
                          ))}
                        </tr>
                      </thead>
                    )}
                    <tbody>
                      {(data.rows ?? []).map((row, i) => (
                        <tr key={i} className="transition-colors" style={{ borderBottom: '1px solid rgba(61,46,30,0.4)' }}>
                          {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (
                            <td key={j} className="py-2 pr-4 font-mono align-top max-w-xs break-words"
                              style={{ color: '#c4a97a' }}>{String(cell)}</td>
                          ))}
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              </div>
            )}
          </motion.div>
        )}
      </AnimatePresence>
      {!data && !isPending && (
        <div className="text-center py-10" style={{ color: 'rgba(122,96,64,0.6)', fontFamily: '"IM Fell English", serif', fontSize: '0.9rem', fontStyle: 'italic' }}>
          Select a competency question and execute the SPARQL query
        </div>
      )}
    </div>
  )
}

// ── Semantic Panel ────────────────────────────────────────────────────────────
function SemanticPanel() {
  const [q, setQ]               = useState('')
  const [submitted, setSubmitted] = useState('')
  const [model, setModel]       = useState('llama3')

  const { mutate, data, isPending, isError } = useMutation({
    mutationFn: (query) => api.semanticSearch(query, 12),
  })

  const search = () => {
    const trimmed = q.trim()
    if (!trimmed) return
    setSubmitted(trimmed)
    mutate(trimmed)
  }

  const SUGGESTIONS = [
    'feeling lost in duty', 'grief and sorrow', 'how to control anger',
    'detachment from results', 'path to liberation', 'restless mind in meditation',
  ]

  return (
    <div className="space-y-4">
      <div className="parchment-card p-4">
        <p className="font-fell leading-relaxed mb-3"
          style={{ fontSize: '0.88rem', color: '#c4a97a', lineHeight: 1.7 }}>
          Search all 701 verses using semantic similarity — no keyword matching required.
          Describe a feeling, situation, or question in natural language.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles size={13} className="absolute left-3 top-1/2 -translate-y-1/2 pointer-events-none"
              style={{ color: 'rgba(138,110,42,0.55)' }} />
            <input className="pl-9"
              placeholder="e.g. feeling lost in duty, grief over loss of a loved one…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>
          <Button variant="gold" loading={isPending} onClick={search}>Search</Button>
        </div>
        {!data && (
          <div className="flex flex-wrap gap-2 mt-3">
            {SUGGESTIONS.map(s => (
              <button key={s} onClick={() => { setQ(s); setSubmitted(s); mutate(s) }}
                className="transition-colors"
                style={{
                  fontSize: '0.7rem', padding: '0.28rem 0.75rem', borderRadius: 999,
                  border: '1px solid rgba(61,46,30,0.8)', color: 'rgba(122,96,64,0.75)',
                  fontFamily: '"IM Fell English", serif',
                }}>
                {s}
              </button>
            ))}
          </div>
        )}
        <div className="mt-3 pt-3" style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}>
          <OllamaStatus model={model} onModelChange={setModel} />
        </div>
      </div>

      {isError && (
        <div className="parchment-card p-4">
          <p style={{ fontSize: '0.88rem', color: '#B03020' }}>
            Semantic search unavailable. Run <code className="font-mono text-xs">python generate_embeddings.py</code> to enable it.
          </p>
        </div>
      )}

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="font-cinzel" style={{ fontSize: '0.6rem', color: 'rgba(122,96,64,0.8)', letterSpacing: '0.2em', textTransform: 'uppercase' }}>
              {data.count} verses matched for "{submitted}"
            </p>
            {(data.results ?? []).map((v, i) => (
              <motion.div key={v.key ?? i}
                initial={{ opacity: 0, y: 10 }} animate={{ opacity: 1, y: 0 }} transition={{ delay: i * 0.04 }}>
                <AskVerseCard v={v} score={v.score} concern={submitted} model={model} showCommentaryBtn />
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Ask() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Ask the Gītā"
        subtitle="Expert system · SPARQL · Semantic RAG · Ollama AI commentary"
        module="MODULE 4 — Expert System"
        icon={MessageCircle}
      />
      <Tabs items={[
        { label: 'Chat',     icon: MessageCircle, content: <ChatPanel /> },
        { label: 'SPARQL',   icon: Database,      content: <SPARQLPanel /> },
        { label: 'Semantic', icon: Sparkles,       content: <SemanticPanel /> },
      ]} />
    </div>
  )
}
