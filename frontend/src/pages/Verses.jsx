import { useState, useDeferredValue, useRef } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { useVirtualizer } from '@tanstack/react-virtual'
import { useSearchParams } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  BookOpen, Search, Filter, ChevronDown, Type, Play, Pause,
  RotateCcw, StopCircle, Sparkles, Pin, PinOff, X,
  Bot, Clock, Columns2, Crown, Feather,
} from 'lucide-react'
import { api } from '../api'
import { Badge, Skeleton } from '../components/ui'

const CHAPTERS = Array.from({ length: 18 }, (_, i) => i + 1)
const LANG_OPTIONS = [
  { key: 'en', label: 'English' },
  { key: 'hi', label: 'Hindi' },
  { key: 'sa', label: 'Sanskrit' },
]
const MAX_HISTORY = 8

/** Parse "शब्द meaning? …" into { pairs: [{word, meaning}], commentary: string } */
function parseWordMeanings(raw) {
  if (!raw) return { pairs: [], commentary: '' }
  let mainText = raw
  let commentary = ''
  const commIdx = raw.search(/\.?\s*Commentary\s*[:\-–]/i)
  if (commIdx !== -1) {
    mainText = raw.slice(0, commIdx).trim().replace(/\.$/, '')
    commentary = raw.slice(commIdx).replace(/^\.?\s*Commentary\s*[:\-–]\s*/i, '').trim()
  }
  const pairs = mainText.split('?')
    .map(s => s.trim()).filter(Boolean)
    .map(token => {
      const i = token.search(/\s/)
      if (i === -1) return null
      return { word: token.slice(0, i).trim(), meaning: token.slice(i).trim() }
    }).filter(Boolean)
  return { pairs, commentary }
}

function escapeRegExp(value) {
  return value.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

function getHighlightTerms(query) {
  return [...new Set(
    (query || '')
      .toLowerCase()
      .split(/[\s,.;:!?/()[\]{}"'`-]+/)
      .map(term => term.trim())
      .filter(term => term.length > 2)
  )]
}

function renderHighlightedText(text, query) {
  if (!text) return null
  const terms = getHighlightTerms(query)
  if (!terms.length) return text

  const pattern = new RegExp(`(${terms.map(escapeRegExp).join('|')})`, 'gi')
  const parts = text.split(pattern)

  return parts.map((part, index) => {
    const isHit = terms.some(term => part.toLowerCase() === term)
    return isHit
      ? <mark key={`${part}-${index}`} className="verse-highlight">{part}</mark>
      : <span key={`${part}-${index}`}>{part}</span>
  })
}

// ── Search history helpers ────────────────────────────────────────────────────
function loadHistory() {
  try { return JSON.parse(localStorage.getItem('gita_search_history') || '[]') }
  catch { return [] }
}
function saveHistory(term) {
  if (!term?.trim()) return
  const hist = [term, ...loadHistory().filter(h => h !== term)].slice(0, MAX_HISTORY)
  localStorage.setItem('gita_search_history', JSON.stringify(hist))
}

// ── Audio Button ──────────────────────────────────────────────────────────────
function AudioButton({ chapter, verse }) {
  const audioRef = useRef(null)
  const [state, setState] = useState('idle')
  const play  = () => { audioRef.current?.play().catch(() => setState('idle')); setState('playing') }
  const pause = () => { audioRef.current?.pause(); setState('paused') }
  const stop  = () => { if (audioRef.current) { audioRef.current.pause(); audioRef.current.currentTime = 0 } setState('idle') }
  const replay = () => { if (audioRef.current) audioRef.current.currentTime = 0; play() }

  return (
    <div className="flex items-center gap-1.5">
      <audio ref={audioRef} src={`/api/audio/${chapter}/${verse}`} preload="none" onEnded={() => setState('ended')} />
      <motion.button onClick={state === 'playing' ? pause : play} whileTap={{ scale: 0.85 }}
        className={`relative w-7 h-7 rounded-full flex items-center justify-center transition-all duration-200 ${
          state === 'playing' ? 'bg-gold text-bg-1 shadow-[0_0_12px_#C9A84C55]'
          : 'border border-border/70 text-ink-3 hover:border-gold/50 hover:text-gold'
        }`} title={state === 'playing' ? 'Pause' : 'Play'}>
        {state === 'playing' && (
          <motion.span className="absolute inset-0 rounded-full border border-gold/30"
            animate={{ scale: [1, 1.6], opacity: [0.5, 0] }} transition={{ repeat: Infinity, duration: 1.6, ease: 'easeOut' }} />
        )}
        {state === 'playing' ? <Pause size={10} /> : <Play size={10} className="ml-0.5" />}
      </motion.button>
      <AnimatePresence>
        {(state === 'playing' || state === 'paused') && (
          <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            onClick={stop} className="w-5 h-5 flex items-center justify-center text-ink-3 hover:text-crimson transition-colors" title="Stop">
            <StopCircle size={13} />
          </motion.button>
        )}
      </AnimatePresence>
      <AnimatePresence>
        {state === 'ended' && (
          <motion.button initial={{ opacity: 0, scale: 0.7 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.7 }}
            onClick={replay} className="w-5 h-5 flex items-center justify-center text-gold hover:text-gold/70 transition-colors" title="Replay">
            <RotateCcw size={12} />
          </motion.button>
        )}
      </AnimatePresence>
    </div>
  )
}

// ── Word meanings ─────────────────────────────────────────────────────────────
function WordMeaningsBlock({ raw, highlightQuery }) {
  const { pairs, commentary } = parseWordMeanings(raw)
  if (!pairs.length && !commentary) {
    return (
      <div className="leaf-note leaf-note-commentary">
        <p className="leaf-note__label">Court Annotation</p>
        <p className="text-sm text-ink-2 leading-relaxed">{renderHighlightedText(raw, highlightQuery)}</p>
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {pairs.length > 0 && (
        <div className="scribe-grid">
          {pairs.map(({ word, meaning }, i) => (
            <div key={i} className="scribe-entry">
              <p className="scribe-entry__word">{word}</p>
              <p className="scribe-entry__meaning">{renderHighlightedText(meaning, highlightQuery)}</p>
            </div>
          ))}
        </div>
      )}
      {commentary && (
        <div className="leaf-note leaf-note-commentary">
          <p className="leaf-note__label">Scribe Commentary</p>
          <p className="font-playfair text-[13px] text-ink-2/90 italic leading-relaxed">
            {renderHighlightedText(commentary, highlightQuery)}
          </p>
        </div>
      )}
    </div>
  )
}

// ── Contextualize Panel ───────────────────────────────────────────────────────
function ContextualizePanel({ verse }) {
  const [userQuery, setUserQuery] = useState('')
  const { mutate, data, isPending, isError, reset } = useMutation({
    mutationFn: (q) => api.contextualize({
      verse_ref: `${verse.chapter}.${verse.verse}`,
      english: verse.en,
      user_query: q,
    }),
  })

  return (
    <div className="oracle-panel space-y-3">
      <p className="text-[10px] font-semibold text-ink-3 uppercase tracking-[0.28em] flex items-center gap-1.5">
        <Bot size={11} className="text-teal" /> Ollama Commentary
      </p>
      <div className="flex gap-2">
        <input
          className="manuscript-input flex-1 text-xs"
          placeholder="Your situation or question… (press Enter)"
          value={userQuery}
          onChange={e => { setUserQuery(e.target.value); if (data) reset() }}
          onKeyDown={e => e.key === 'Enter' && userQuery.trim() && mutate(userQuery.trim())}
        />
        <button
          onClick={() => userQuery.trim() && mutate(userQuery.trim())}
          disabled={isPending || !userQuery.trim()}
          className="px-3 py-1.5 rounded-xl bg-teal/12 border border-teal/35 text-teal text-xs hover:bg-teal/20 transition-colors disabled:opacity-40"
        >
          {isPending ? '…' : 'Ask'}
        </button>
      </div>
      {isError && (
        <p className="text-xs text-crimson">Ollama not running. Start with: <code className="font-mono">ollama serve</code></p>
      )}
      {data?.commentary && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
          className="leaf-note leaf-note-commentary text-[12.5px] font-playfair text-ink-2 leading-relaxed whitespace-pre-wrap">
          {data.commentary}
          <p className="text-[10px] text-ink-3 mt-2 font-mono">via {data.model}</p>
        </motion.div>
      )}
    </div>
  )
}

// ── Verse card ────────────────────────────────────────────────────────────────
function VerseCard({ v, langs, showTranslit, onPin, isPinned, compact = false, highlightQuery }) {
  const [expanded, setExpanded]           = useState(false)
  const [showContextualize, setShowCtx]   = useState(false)

  return (
    <div
      className={`verse-card-monarch rounded-[28px] border transition-all duration-300 overflow-hidden ${
        isPinned ? 'border-gold/45 shadow-[0_16px_60px_rgba(201,168,76,0.18)]' : 'border-[#4b3b22] hover:border-gold/30'
      }`}
    >
      <span className="raven-sigil raven-sigil-left" />
      <span className="raven-sigil raven-sigil-right" />

      {/* Top bar */}
      <div className="flex items-center justify-between px-5 pt-4 pb-3 border-b border-[rgba(201,168,76,0.12)]">
        <div className="flex items-center gap-2.5 flex-wrap">
          {!compact && <AudioButton chapter={v.chapter} verse={v.verse} />}
          <span className="w-8 h-8 rounded-full border border-gold/20 bg-[rgba(38,28,15,0.72)] flex items-center justify-center text-gold shadow-[0_0_24px_rgba(201,168,76,0.14)]">
            <Crown size={14} />
          </span>
          <div>
            <span className="font-cinzel text-[15px] font-bold text-gold tracking-[0.18em]">
              {v.chapter}.{v.verse}
            </span>
            <p className="text-[10px] uppercase tracking-[0.24em] text-[#b9a78a]">Royal Archive Leaf</p>
          </div>
          {v.ai_corpus && (
            <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/25 text-gold/75 font-mono bg-[rgba(201,168,76,0.08)]">AI Corpus</span>
          )}
          {v.speaker && (
            <Badge variant={v.speaker === 'Krishna' ? 'teal' : 'saffron'} className="text-[10px]">{v.speaker}</Badge>
          )}
        </div>
        <div className="flex items-center gap-1.5">
          {/* Contextualize toggle */}
          <button
            onClick={() => setShowCtx(s => !s)}
            title="Ollama commentary"
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
              showContextualize ? 'text-teal bg-teal/15' : 'text-ink-3 hover:text-teal'
            }`}
          >
            <Bot size={13} />
          </button>
          {/* Pin / unpin */}
          <button
            onClick={() => onPin(v)}
            title={isPinned ? 'Unpin' : 'Pin for comparison'}
            className={`w-6 h-6 flex items-center justify-center rounded-md transition-colors ${
              isPinned ? 'text-gold bg-gold/15' : 'text-ink-3 hover:text-gold'
            }`}
          >
            {isPinned ? <PinOff size={13} /> : <Pin size={13} />}
          </button>
          <span className="text-[10px] text-ink-3/50 font-mono ml-1">Ch. {v.chapter}</span>
        </div>
      </div>

      {/* Body */}
      <div className="px-5 md:px-6 pt-5 pb-5 space-y-4 relative z-[1]">
        {langs.sa && v.sa && (
          <div className="manuscript-sheet">
            <p className="verse-sanskrit text-[15px] whitespace-pre-line text-center px-2">{v.sa}</p>
          </div>
        )}
        <AnimatePresence>
          {showTranslit && v.transliteration && (
            <motion.p initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }}
              className="verse-transliteration transliteration-strip text-[12.5px] text-center px-6">
              {renderHighlightedText(v.transliteration, highlightQuery)}
            </motion.p>
          )}
        </AnimatePresence>
        {langs.sa && v.sa && (langs.en || langs.hi) && (
          <div className="flex items-center gap-3 py-0.5">
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
            <div className="w-1 h-1 rounded-full bg-gold/35" />
            <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
          </div>
        )}
        {(langs.en || langs.hi) && (
          <div className={`grid gap-3 ${langs.en && langs.hi ? 'xl:grid-cols-[1.15fr_0.95fr]' : 'grid-cols-1'}`}>
            {langs.en && v.en && (
              <div className="leaf-note leaf-note-meaning">
                <p className="leaf-note__label">Meaning Rendered</p>
                <p className="verse-english drop-cap text-left">{renderHighlightedText(v.en, highlightQuery)}</p>
              </div>
            )}
            {langs.hi && v.hi && (
              <div className="leaf-note leaf-note-reflection">
                <p className="leaf-note__label">Hindi Reflection</p>
                <p className="verse-hindi text-left">{renderHighlightedText(v.hi, highlightQuery)}</p>
              </div>
            )}
          </div>
        )}
        {v.concepts?.length > 0 && (
          <div className="flex flex-wrap gap-2 pt-1">
            {v.concepts.map(c => <span key={c} className="concept-seal text-[10px]">{c}</span>)}
          </div>
        )}
        {v.word_meanings && !compact && (
          <>
            <button onClick={() => setExpanded(e => !e)}
              className="scribe-toggle">
              <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
                <ChevronDown size={12} />
              </motion.span>
              Glossary leaf and commentary
            </button>
            <AnimatePresence>
              {expanded && (
                <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
                  <div className="border-t border-[rgba(201,168,76,0.12)] pt-4">
                    <WordMeaningsBlock raw={v.word_meanings} highlightQuery={highlightQuery} />
                  </div>
                </motion.div>
              )}
            </AnimatePresence>
          </>
        )}
        {/* Contextualize panel */}
        <AnimatePresence>
          {showContextualize && (
            <motion.div initial={{ opacity: 0, height: 0 }} animate={{ opacity: 1, height: 'auto' }} exit={{ opacity: 0, height: 0 }} className="overflow-hidden">
              <ContextualizePanel verse={v} />
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}

// ── Comparison panel ──────────────────────────────────────────────────────────
function ComparisonPanel({ pinned, onUnpin, langs }) {
  if (pinned.length < 1) return null
  return (
    <div className="fixed bottom-4 right-4 z-50 w-[90vw] max-w-4xl">
      <div className="comparison-panel-monarch rounded-[24px] border border-gold/30 p-4 shadow-card">
        <div className="flex items-center justify-between mb-3">
          <span className="text-xs font-semibold text-gold flex items-center gap-2">
            <Columns2 size={14} /> Verse Comparison ({pinned.length}/3 pinned)
          </span>
          <button onClick={() => pinned.forEach(v => onUnpin(v))} className="text-[10px] text-ink-3 hover:text-crimson transition-colors">
            Clear all
          </button>
        </div>
        <div className={`grid gap-3 ${pinned.length >= 2 ? 'grid-cols-2' : 'grid-cols-1'} ${pinned.length === 3 ? 'md:grid-cols-3' : ''}`}>
          {pinned.map(v => (
            <div key={`${v.chapter}-${v.verse}`} className="relative">
              <button onClick={() => onUnpin(v)}
                className="absolute top-2 right-2 z-10 w-5 h-5 flex items-center justify-center rounded-full bg-bg-3 text-ink-3 hover:text-crimson transition-colors">
                <X size={10} />
              </button>
              <VerseCard v={v} langs={langs} showTranslit={false} onPin={onUnpin} isPinned={true} compact={true} />
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

// ── Virtual list ──────────────────────────────────────────────────────────────
function VirtualVerseList({ verses, langs, showTranslit, pinnedKeys, onPin, highlightQuery }) {
  const parentRef = useRef(null)

  const rowVirtualizer = useVirtualizer({
    count: verses.length,
    getScrollElement: () => parentRef.current,
    estimateSize: () => 320,
    overscan: 4,
    gap: 16,
  })

  return (
    <div
      ref={parentRef}
      className="overflow-y-auto royal-scroll pr-1"
      style={{ height: 'clamp(420px, calc(100vh - 520px), 68vh)' }}
    >
      <div style={{ height: rowVirtualizer.getTotalSize(), position: 'relative' }}>
        {rowVirtualizer.getVirtualItems().map(virtualRow => {
          const v = verses[virtualRow.index]
          const key = `${v.chapter}-${v.verse}`
          return (
            <div
              key={key}
              data-index={virtualRow.index}
              ref={rowVirtualizer.measureElement}
              style={{ position: 'absolute', top: virtualRow.start, left: 0, right: 0 }}
            >
              <VerseCard
                v={v}
                langs={langs}
                showTranslit={showTranslit}
                onPin={onPin}
                isPinned={pinnedKeys.has(key)}
                highlightQuery={highlightQuery}
              />
            </div>
          )
        })}
      </div>
    </div>
  )
}

// ── Page ──────────────────────────────────────────────────────────────────────
export default function Verses() {
  const [searchParams] = useSearchParams()
  const [q, setQ]                       = useState('')
  const [ch, setCh]                     = useState(searchParams.get('chapter') || '1')
  const [langs, setLangs]               = useState({ en: true, hi: true, sa: true })
  const [showTranslit, setShowTranslit] = useState(false)
  const [searchMode, setSearchMode]     = useState('keyword')
  const [history, setHistory]           = useState(loadHistory)
  const [pinned, setPinned]             = useState([])
  const dq = useDeferredValue(q)

  const toggle = (l) => setLangs(prev => {
    const next = { ...prev, [l]: !prev[l] }
    if (!Object.values(next).some(Boolean)) return prev
    return next
  })

  const { data, isFetching } = useQuery({
    queryKey: ['verses', dq, ch],
    queryFn:  () => api.verses(dq, ch),
    placeholderData: prev => prev,
    enabled: searchMode === 'keyword',
  })

  const { mutate: doSemanticSearch, data: semanticData, isPending: semanticLoading } = useMutation({
    mutationFn: (query) => api.semanticSearch(query, 50),
  })

  const prevQ = useRef('')
  if (searchMode === 'semantic' && dq !== prevQ.current) {
    prevQ.current = dq
    if (dq.trim().length > 2) doSemanticSearch(dq)
  }

  const handleSearch = (term) => {
    setQ(term)
    if (term.trim()) {
      saveHistory(term.trim())
      setHistory(loadHistory())
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && q.trim()) {
      saveHistory(q.trim())
      setHistory(loadHistory())
    }
  }

  const isFetchingAny = searchMode === 'keyword' ? isFetching : semanticLoading
  const verses = searchMode === 'semantic'
    ? (semanticData?.results ?? [])
    : (data?.verses ?? [])
  const highlightQuery = searchMode === 'keyword' ? dq : ''

  const pinnedKeys = new Set(pinned.map(v => `${v.chapter}-${v.verse}`))

  const handlePin = (v) => {
    const key = `${v.chapter}-${v.verse}`
    if (pinnedKeys.has(key)) {
      setPinned(p => p.filter(x => `${x.chapter}-${x.verse}` !== key))
    } else if (pinned.length < 3) {
      setPinned(p => [...p, v])
    }
  }

  return (
    <div className="verse-sanctum px-4 py-6 md:px-8 md:py-8 max-w-6xl mx-auto">
      <div className="verse-hero mb-6">
        <span className="raven-sigil raven-sigil-left hidden md:block" />
        <span className="raven-sigil raven-sigil-right hidden md:block" />
        <div className="flex flex-col xl:flex-row xl:items-end xl:justify-between gap-6">
          <div className="max-w-3xl">
            <div className="flex flex-wrap items-center gap-2 mb-3">
              <span className="royal-chip"><BookOpen size={12} /> MODULE 2 — Corpus</span>
              <span className="royal-chip royal-chip-muted"><Feather size={12} /> Raven Court Reading Room</span>
            </div>
            <div className="flex items-start gap-3">
              <div className="hidden sm:flex w-12 h-12 shrink-0 rounded-2xl border border-gold/20 bg-[rgba(27,19,10,0.68)] items-center justify-center text-gold shadow-[0_0_32px_rgba(201,168,76,0.14)]">
                <Crown size={22} />
              </div>
              <div>
                <h1 className="verse-hero__title">The Monarch&rsquo;s Verse Chamber</h1>
                <p className="verse-hero__subtitle">
                  Read each verse like an illuminated leaf from a royal archive:
                  ravens at the margins, ancient manuscript styling, and highlighted meaning notes that draw the eye to what matters most.
                </p>
              </div>
            </div>
          </div>

          <div className="grid grid-cols-2 gap-3 xl:min-w-[320px]">
            <div className="royal-stat">
              <span className="royal-stat__label">Verses Displayed</span>
              <span className="royal-stat__value">{verses.length}</span>
            </div>
            <div className="royal-stat">
              <span className="royal-stat__label">Reading Mode</span>
              <span className="royal-stat__value royal-stat__value--small">{searchMode === 'semantic' ? 'AI Court Search' : 'Keyword Search'}</span>
            </div>
            <div className="royal-stat">
              <span className="royal-stat__label">Chapter Scope</span>
              <span className="royal-stat__value royal-stat__value--small">{ch ? `Chapter ${ch}` : 'All Chapters'}</span>
            </div>
            <div className="royal-stat">
              <span className="royal-stat__label">Pinned Leaves</span>
              <span className="royal-stat__value">{pinned.length}/3</span>
            </div>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="verse-control-panel rounded-[28px] p-4 md:p-5 mb-6 space-y-4">
        <div className="flex flex-wrap gap-3 items-end">
          <div className="flex-1 min-w-44">
            <label className="label mb-1 block">Search</label>
            <div className="relative">
              {searchMode === 'semantic'
                ? <Sparkles size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-saffron/70 pointer-events-none" />
                : <Search   size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
              }
              <input
                className="manuscript-input pl-8"
                placeholder={searchMode === 'semantic' ? 'Describe your situation or question…' : 'karma, yoga, dharma…'}
                value={q}
                onChange={e => handleSearch(e.target.value)}
                onKeyDown={handleKeyDown}
              />
            </div>
          </div>
          {/* Search mode toggle */}
          <div className="flex gap-0.5 rounded-lg border border-border bg-bg-3 p-0.5 self-end">
            {[{ key: 'keyword', label: 'Keyword', icon: Search }, { key: 'semantic', label: 'AI Search', icon: Sparkles }].map(({ key, label, icon: Icon }) => (
              <button
                key={key}
                onClick={() => setSearchMode(key)}
                className={`manuscript-mode-toggle flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-medium transition-all ${
                  searchMode === key ? 'manuscript-mode-toggle--active' : 'text-ink-2 hover:text-ink-1'
                }`}
              >
                <Icon size={10} />
                {label}
              </button>
            ))}
          </div>
          {searchMode === 'keyword' && (
            <div className="w-36">
              <label className="label mb-1 block">Chapter</label>
              <select className="manuscript-input" value={ch} onChange={e => setCh(e.target.value)}>
                <option value="">All Chapters</option>
                {CHAPTERS.map(c => <option key={c} value={c}>Chapter {c}</option>)}
              </select>
            </div>
          )}
        </div>

        {/* Search history chips */}
        {history.length > 0 && (
          <div className="flex flex-wrap items-center gap-1.5">
            <Clock size={10} className="text-ink-3" />
            {history.map(h => (
              <button
                key={h}
                onClick={() => handleSearch(h)}
                className="royal-history-chip"
              >
                {h}
              </button>
            ))}
            <button
              onClick={() => { localStorage.removeItem('gita_search_history'); setHistory([]) }}
              className="text-[10px] text-ink-3/50 hover:text-crimson transition-colors ml-1"
              title="Clear history"
            >
              <X size={10} />
            </button>
          </div>
        )}

        <div className="flex items-center gap-2 flex-wrap">
          <span className="label">Show:</span>
          {LANG_OPTIONS.map(({ key, label }) => (
            <button
              key={key}
              onClick={() => toggle(key)}
              className={`manuscript-toggle flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
                langs[key]
                  ? 'manuscript-toggle--active'
                  : 'border-border text-ink-2 hover:text-ink-1 hover:border-border-bright'
              }`}
            >
              <span className={`w-3 h-3 rounded-sm border flex items-center justify-center shrink-0 transition-colors ${
                langs[key] ? 'border-gold bg-gold' : 'border-ink-2'
              }`}>
                {langs[key] && (
                  <svg viewBox="0 0 10 10" className="w-2 h-2 fill-none stroke-current text-bg-1" strokeWidth="1.8" strokeLinecap="round" strokeLinejoin="round">
                    <path d="M1.5 5l2.5 2.5 4.5-4.5" />
                  </svg>
                )}
              </span>
              {label}
            </button>
          ))}
          <button
            onClick={() => setShowTranslit(t => !t)}
            className={`manuscript-toggle ml-auto flex items-center gap-1.5 text-xs px-3 py-1.5 rounded-full border transition-all duration-200 ${
              showTranslit
                ? 'border-teal/50 bg-teal/10 text-teal shadow-[0_0_18px_rgba(26,188,156,0.12)]'
                : 'border-border/80 text-ink-2 hover:text-ink-1 hover:border-border-bright'
            }`}
          >
            <Type size={11} />
            Transliteration
          </button>
        </div>

        <div className="flex items-center gap-2 text-[11px] text-ink-3 pt-0.5">
          <Filter size={10} />
          {isFetchingAny ? 'Loading…' : `${verses.length} verse${verses.length !== 1 ? 's' : ''} shown${searchMode === 'semantic' ? ' (AI ranked)' : ''}`}
          {highlightQuery.trim() && (
            <span className="ml-2 text-gold/80">Highlighted for “{highlightQuery.trim()}”</span>
          )}
          {pinned.length > 0 && (
            <span className="ml-auto text-gold flex items-center gap-1">
              <Pin size={10} /> {pinned.length} pinned
            </span>
          )}
        </div>
      </div>

      {/* Verse list — virtualised */}
      {isFetchingAny && !verses.length ? (
        <div className="space-y-4">
          {Array.from({ length: 5 }).map((_, i) => (
            <div key={i} className="rounded-[28px] border border-[#4b3b22] p-6 space-y-4 bg-[linear-gradient(145deg,rgba(33,24,14,0.95),rgba(12,10,10,0.94))]">
              <Skeleton className="h-5 w-2/3 mx-auto" />
              <div className="h-px bg-border/50" />
              <Skeleton className="h-4 w-full" />
              <Skeleton className="h-4 w-4/5" />
            </div>
          ))}
        </div>
      ) : verses.length > 0 ? (
        <VirtualVerseList
          verses={verses}
          langs={langs}
          showTranslit={showTranslit}
          pinnedKeys={pinnedKeys}
          onPin={handlePin}
          highlightQuery={highlightQuery}
        />
      ) : (
        <div className="verses-empty-state text-center py-16 text-ink-3 text-sm">
          No verses found in the archive
        </div>
      )}

      {/* Comparison panel */}
      <ComparisonPanel pinned={pinned} onUnpin={handlePin} langs={langs} />
    </div>
  )
}
