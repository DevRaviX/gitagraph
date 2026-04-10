import { useState, useRef, useEffect } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, Database, ChevronDown, ChevronUp, Sparkles } from 'lucide-react'
import { api } from '../api'
import { Card, Badge, CFBar, Button, Gauge } from '../components/ui'
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

function ChatPanel() {
  const [messages, setMessages]   = useState([
    { role: 'system', text: 'Ask me about your spiritual concern or goal. I will search the Bhagavad Gītā and infer the most relevant verses for you.' }
  ])
  const [concern, setConcern]     = useState('')
  const [goal, setGoal]           = useState('')
  const [stage, setStage]         = useState('beginner')
  const [nature, setNature]       = useState('active')
  const [expanded, setExpanded]   = useState(null)
  const bottomRef = useRef(null)

  const { mutate, isPending } = useMutation({
    mutationFn: api.infer,
    onSuccess: (data) => {
      setMessages(m => [...m, { role: 'system', data }])
    }
  })

  useEffect(() => { bottomRef.current?.scrollIntoView({ behavior: 'smooth' }) }, [messages, isPending])

  const send = () => {
    if (!concern) return
    setMessages(m => [...m, { role: 'user', text: concern }])
    mutate({ concern, goal, stage, nature })
    setConcern('')
  }

  return (
    <div className="space-y-4">
      {/* Controls */}
      <Card hover={false}>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
          <div>
            <label className="label mb-1 block">Stage</label>
            <select value={stage} onChange={e => setStage(e.target.value)}>
              <option value="beginner">Beginner</option>
              <option value="intermediate">Intermediate</option>
              <option value="advanced">Advanced</option>
            </select>
          </div>
          <div>
            <label className="label mb-1 block">Nature</label>
            <select value={nature} onChange={e => setNature(e.target.value)}>
              <option value="active">Active</option>
              <option value="contemplative">Contemplative</option>
              <option value="devotional">Devotional</option>
            </select>
          </div>
          <div className="md:col-span-2">
            <label className="label mb-1 block">Goal (optional)</label>
            <input placeholder="e.g., liberation, inner peace…" value={goal} onChange={e => setGoal(e.target.value)} />
          </div>
        </div>
      </Card>

      {/* Chat window */}
      <div className="glass rounded-xl border border-border overflow-hidden">
        <div className="h-80 overflow-y-auto p-4 space-y-3">
          <AnimatePresence>
            {messages.map((msg, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, y: 8 }}
                animate={{ opacity: 1, y: 0 }}
                className={`flex ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
              >
                {msg.role === 'user' ? (
                  <div className="max-w-xs bg-gold-faint border border-gold-dim rounded-2xl rounded-tr-sm px-4 py-2.5 text-sm text-ink-1">
                    {msg.text}
                  </div>
                ) : msg.text ? (
                  <div className="max-w-sm bg-bg-4 border border-border rounded-2xl rounded-tl-sm px-4 py-2.5 text-sm text-ink-2">
                    {msg.text}
                  </div>
                ) : msg.data ? (
                  <div className="max-w-md bg-bg-3 border border-border rounded-2xl rounded-tl-sm p-4 space-y-3">
                    <div className="flex items-center gap-2">
                      <Badge variant="gold">📌 {msg.data.concept}</Badge>
                      {msg.data.start_verse && <Badge variant="teal">📖 {msg.data.start_verse}</Badge>}
                    </div>
                    <p className="text-sm text-ink-1">{msg.data.recommendation}</p>
                    <CFBar value={msg.data.cf ?? 0} label="Confidence" />
                    {msg.data.fired_rules?.length > 0 && (
                      <div>
                        <button
                          onClick={() => setExpanded(expanded === i ? null : i)}
                          className="flex items-center gap-1 text-xs text-ink-3 hover:text-ink-1 transition-colors"
                        >
                          {expanded === i ? <ChevronUp size={12} /> : <ChevronDown size={12} />}
                          {msg.data.fired_rules.length} rule{msg.data.fired_rules.length > 1 ? 's' : ''} fired
                        </button>
                        <AnimatePresence>
                          {expanded === i && (
                            <motion.div initial={{ height: 0 }} animate={{ height: 'auto' }} exit={{ height: 0 }} className="overflow-hidden">
                              <div className="mt-2 space-y-1">
                                {msg.data.fired_rules.map((r, j) => (
                                  <div key={j} className="text-xs text-ink-2 flex items-center gap-1.5">
                                    <span className="w-1.5 h-1.5 rounded-full bg-gold shrink-0" />
                                    {r}
                                  </div>
                                ))}
                              </div>
                            </motion.div>
                          )}
                        </AnimatePresence>
                      </div>
                    )}
                  </div>
                ) : null}
              </motion.div>
            ))}

            {isPending && (
              <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="flex justify-start">
                <div className="bg-bg-4 border border-border rounded-2xl rounded-tl-sm px-4 py-3 flex gap-1 items-center">
                  {[0,1,2].map(d => (
                    <motion.div key={d} className="w-1.5 h-1.5 rounded-full bg-gold"
                      animate={{ y: [0,-4,0] }}
                      transition={{ repeat: Infinity, duration: 0.8, delay: d * 0.15 }}
                    />
                  ))}
                </div>
              </motion.div>
            )}
          </AnimatePresence>
          <div ref={bottomRef} />
        </div>

        {/* Input bar */}
        <div className="border-t border-border p-3 flex gap-2">
          <input
            className="flex-1"
            placeholder="Describe your concern or emotion…"
            value={concern}
            onChange={e => setConcern(e.target.value)}
            onKeyDown={e => e.key === 'Enter' && !e.shiftKey && send()}
          />
          <Button variant="gold" onClick={send} loading={isPending} disabled={!concern}>
            <Send size={13} />
          </Button>
        </div>
      </div>
    </div>
  )
}

function SPARQLPanel() {
  const [cq, setCq] = useState('cq1')
  const { mutate, data, isPending } = useMutation({ mutationFn: (id) => api.sparql(id) })

  return (
    <div className="space-y-4">
      <Card hover={false}>
        <div className="flex gap-3 items-end">
          <div className="flex-1">
            <label className="label mb-1 block">Competency Question</label>
            <select value={cq} onChange={e => setCq(e.target.value)}>
              {CQS.map(c => <option key={c.id} value={c.id}>{c.label}</option>)}
            </select>
          </div>
          <Button variant="gold" loading={isPending} onClick={() => mutate(cq)}>
            Execute SPARQL
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {data.query && (
              <Card hover={false}>
                <p className="label mb-2">Query</p>
                <pre className="text-xs font-mono text-ink-2 overflow-x-auto bg-bg-1 p-3 rounded-lg border border-border leading-relaxed whitespace-pre-wrap">
                  {data.query}
                </pre>
              </Card>
            )}
            <Card hover={false}>
              <p className="label mb-3">{data.rows?.length ?? 0} results</p>
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  {data.headers && (
                    <thead>
                      <tr className="border-b border-border">
                        {data.headers.map(h => (
                          <th key={h} className="text-left py-2 pr-4 text-ink-3 font-semibold">{h}</th>
                        ))}
                      </tr>
                    </thead>
                  )}
                  <tbody>
                    {(data.rows ?? []).map((row, i) => (
                      <tr key={i} className="border-b border-border/40 hover:bg-bg-3 transition-colors">
                        {(Array.isArray(row) ? row : Object.values(row)).map((cell, j) => (
                          <td key={j} className="py-2 pr-4 text-ink-2 font-mono">{String(cell)}</td>
                        ))}
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

function SemanticPanel() {
  const [q, setQ]             = useState('')
  const [submitted, setSubmitted] = useState('')

  const { mutate, data, isPending, isError } = useMutation({
    mutationFn: (query) => api.semanticSearch(query, 12),
  })

  const search = () => {
    const trimmed = q.trim()
    if (!trimmed) return
    setSubmitted(trimmed)
    mutate(trimmed)
  }

  return (
    <div className="space-y-4">
      <Card hover={false}>
        <p className="text-xs text-ink-2 mb-3 leading-relaxed">
          Search all 701 verses using semantic similarity — no keyword matching required.
          Describe a feeling, situation, or question in natural language.
        </p>
        <div className="flex gap-2">
          <div className="relative flex-1">
            <Sparkles size={13} className="absolute left-3 top-1/2 -translate-y-1/2 text-ink-3 pointer-events-none" />
            <input
              className="pl-8"
              placeholder="e.g. feeling lost in duty, grief over loss of a loved one…"
              value={q}
              onChange={e => setQ(e.target.value)}
              onKeyDown={e => e.key === 'Enter' && search()}
            />
          </div>
          <Button variant="gold" loading={isPending} onClick={search}>
            Search
          </Button>
        </div>
      </Card>

      {isError && (
        <Card hover={false}>
          <p className="text-sm text-crimson">
            Semantic search unavailable. Run <code className="font-mono text-xs">python generate_embeddings.py</code> to enable it.
          </p>
        </Card>
      )}

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            <p className="label">{data.count} verses matched for "{submitted}"</p>
            {(data.results ?? []).map((v, i) => (
              <motion.div
                key={v.key}
                initial={{ opacity: 0, y: 10 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-xl border border-border p-4 space-y-2"
              >
                <div className="flex items-center justify-between gap-2">
                  <span className="font-cinzel text-sm font-bold text-gold">
                    {v.chapter}.{v.verse}
                  </span>
                  <div className="flex items-center gap-2 ml-auto">
                    <span className="text-[10px] font-mono text-teal">
                      {(v.score * 100).toFixed(1)}% match
                    </span>
                    {v.ai_corpus && (
                      <span className="text-[10px] px-2 py-0.5 rounded-full border border-gold/25 text-gold/60 font-mono">
                        AI Corpus
                      </span>
                    )}
                  </div>
                </div>

                {/* Score bar */}
                <div className="h-0.5 w-full rounded-full bg-bg-4 overflow-hidden">
                  <div
                    className="h-full rounded-full bg-gradient-to-r from-teal to-gold transition-all"
                    style={{ width: `${Math.max(v.score * 100, 4)}%` }}
                  />
                </div>

                <p className="font-playfair text-[13px] text-ink-2 leading-relaxed">{v.en}</p>

                {v.concepts?.length > 0 && (
                  <div className="flex flex-wrap gap-1 pt-0.5">
                    {v.concepts.map(c => (
                      <span key={c} className="chip chip-gold text-[10px]">{c}</span>
                    ))}
                  </div>
                )}
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>
    </div>
  )
}

export default function Ask() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Ask the Gītā"
        subtitle="Expert system with forward-chaining inference, SPARQL competency queries, and semantic RAG search"
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
