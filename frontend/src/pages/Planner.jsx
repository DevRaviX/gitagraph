import { useState } from 'react'
import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { CalendarDays, Save, Check, ChevronDown, ChevronUp, Brain, Printer, RotateCcw, ThumbsUp, ThumbsDown } from 'lucide-react'
import { api } from '../api'
import { Card, MetricCard, Button, EmptyState } from '../components/ui'
import { PageHeader } from '../components/layout/PageTransition'

const GOALS    = ['meditation','liberation','karma','wisdom','devotion']
const CH_COLOR = { 2: '#C9A84C', 3: '#3498DB', 6: '#1ABC9C' }

function getSessionId() {
  let id = localStorage.getItem('gita_session_id')
  if (!id) {
    id = `sess_${Date.now()}_${Math.random().toString(36).slice(2, 8)}`
    localStorage.setItem('gita_session_id', id)
  }
  return id
}

const SESSION_ID = getSessionId()

// ── Flashcard Quiz Mode ───────────────────────────────────────────────────────
function FlashcardMode({ plan, onClose }) {
  // Flatten all verses from plan into flashcard deck
  const deck = plan.flatMap((s, si) =>
    (s.verses ?? s.verse_pairs ?? []).map(v => ({
      verse: v,
      session: si + 1,
      theme: s.theme ?? s.shared_theme ?? '',
      concepts: s.concepts ?? s.shared_concepts ?? [],
    }))
  )

  const [idx, setIdx]         = useState(0)
  const [flipped, setFlipped] = useState(false)
  const [correct, setCorrect] = useState(0)
  const [incorrect, setIncorrect] = useState(0)
  const [done, setDone]       = useState(false)

  const card = deck[idx]

  const advance = (wasCorrect) => {
    if (wasCorrect) setCorrect(c => c + 1)
    else setIncorrect(c => c + 1)
    setFlipped(false)
    if (idx + 1 >= deck.length) setDone(true)
    else setIdx(i => i + 1)
  }

  const restart = () => { setIdx(0); setFlipped(false); setCorrect(0); setIncorrect(0); setDone(false) }

  if (done) return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4">
      <motion.div initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="glass-gold rounded-2xl border border-gold/40 p-8 max-w-sm w-full text-center shadow-card">
        <p className="font-cinzel text-xl text-gold mb-2">Quiz Complete!</p>
        <div className="grid grid-cols-2 gap-4 my-6">
          <div className="bg-teal/10 border border-teal/30 rounded-xl p-4">
            <p className="text-2xl font-mono font-bold text-teal">{correct}</p>
            <p className="text-xs text-ink-3 mt-1">Correct</p>
          </div>
          <div className="bg-crimson/10 border border-crimson/30 rounded-xl p-4">
            <p className="text-2xl font-mono font-bold text-crimson">{incorrect}</p>
            <p className="text-xs text-ink-3 mt-1">Incorrect</p>
          </div>
        </div>
        <p className="text-sm text-ink-2 mb-6">{Math.round((correct / deck.length) * 100)}% score on {deck.length} cards</p>
        <div className="flex gap-3 justify-center">
          <Button variant="outline" onClick={restart}><RotateCcw size={13} /> Try Again</Button>
          <Button variant="gold" onClick={onClose}>Done</Button>
        </div>
      </motion.div>
    </div>
  )

  return (
    <div className="fixed inset-0 bg-black/70 z-50 flex items-center justify-center p-4" onClick={() => !flipped && setFlipped(true)}>
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }} animate={{ scale: 1, opacity: 1 }}
        className="w-full max-w-lg"
        onClick={e => e.stopPropagation()}
      >
        {/* Progress */}
        <div className="flex items-center gap-3 mb-4">
          <div className="flex-1 h-1.5 rounded-full bg-bg-4 overflow-hidden">
            <div className="h-full rounded-full bg-gold transition-all" style={{ width: `${(idx / deck.length) * 100}%` }} />
          </div>
          <span className="text-xs font-mono text-ink-3">{idx + 1}/{deck.length}</span>
          <button onClick={onClose} className="text-ink-3 hover:text-crimson transition-colors text-xs">✕ Exit</button>
        </div>

        {/* Card */}
        <div
          className="glass-gold rounded-2xl border border-gold/30 p-8 min-h-52 cursor-pointer shadow-card select-none"
          onClick={() => setFlipped(f => !f)}
        >
          {!flipped ? (
            <div className="text-center space-y-3">
              <p className="text-xs text-ink-3 uppercase tracking-widest">Session {card.session} · Tap to reveal</p>
              <p className="font-cinzel text-3xl font-bold text-gold">{String(card.verse)}</p>
              {card.theme && <p className="text-sm text-ink-2 italic">{card.theme}</p>}
            </div>
          ) : (
            <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
              <p className="text-xs text-ink-3 uppercase tracking-widest">Concepts covered</p>
              {(Array.isArray(card.concepts) ? card.concepts : [card.concepts]).filter(Boolean).map(c => (
                <span key={c} className="chip chip-gold mr-2">{c}</span>
              ))}
              {card.concepts.length === 0 && <p className="text-sm text-ink-2">Practice this verse and reflect on its teaching.</p>}
            </motion.div>
          )}
        </div>

        {/* Actions */}
        <AnimatePresence>
          {flipped && (
            <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }} className="flex gap-3 mt-4">
              <button onClick={() => advance(false)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-crimson/40 text-crimson hover:bg-crimson/10 transition-colors">
                <ThumbsDown size={15} /> Didn't know
              </button>
              <button onClick={() => advance(true)}
                className="flex-1 flex items-center justify-center gap-2 py-3 rounded-xl border border-teal/40 text-teal hover:bg-teal/10 transition-colors">
                <ThumbsUp size={15} /> Got it
              </button>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </div>
  )
}

// ── Print helper ──────────────────────────────────────────────────────────────
function printPlan(goal, plan) {
  const lines = [
    `BHAGAVAD GĪTĀ STUDY PLAN`,
    `Goal: ${goal.charAt(0).toUpperCase() + goal.slice(1)}`,
    `Sessions: ${plan.length}`,
    `Generated: ${new Date().toLocaleDateString()}`,
    '',
    '─'.repeat(50),
  ]
  plan.forEach((s, i) => {
    const verses = s.verses ?? s.verse_pairs ?? []
    const theme  = s.theme ?? s.shared_theme ?? ''
    const concs  = s.concepts ?? s.shared_concepts ?? []
    lines.push('')
    lines.push(`Session ${i + 1}${theme ? ` — ${theme}` : ''}`)
    lines.push(`Verses: ${verses.join(', ')}`)
    if (concs.length) lines.push(`Concepts: ${(Array.isArray(concs) ? concs : [concs]).join(', ')}`)
  })
  lines.push('')
  lines.push('─'.repeat(50))
  lines.push('GitaGraph · Digital Bhaṣya 2.0 · NIT Kurukshetra')

  const w = window.open('', '_blank')
  w.document.write(`<pre style="font-family:monospace;font-size:14px;padding:32px;max-width:700px;margin:auto;">${lines.join('\n')}</pre>`)
  w.document.close()
  w.print()
}

export default function Planner() {
  const [goal, setGoal]         = useState('meditation')
  const [sessions, setSessions] = useState(5)
  const [vps, setVps]           = useState(2)
  const [savedMsg, setSavedMsg] = useState(false)
  const [expandedPlan, setExpandedPlan] = useState(null)
  const [flashcardMode, setFlashcardMode] = useState(false)

  const queryClient = useQueryClient()

  // ── Generate plan ──────────────────────────────────────────────────────────
  const { mutate, data, isPending } = useMutation({
    mutationFn: () => api.plan({ goal, sessions, verses_per: vps }),
  })
  const plan = data?.plan ?? []

  // ── Save plan ──────────────────────────────────────────────────────────────
  const { mutate: savePlan, isPending: isSaving } = useMutation({
    mutationFn: () => api.plansSave({ session_id: SESSION_ID, goal, plan }),
    onSuccess: () => {
      setSavedMsg(true)
      setTimeout(() => setSavedMsg(false), 2500)
      queryClient.invalidateQueries({ queryKey: ['plans', SESSION_ID] })
    },
  })

  // ── Saved plans list ───────────────────────────────────────────────────────
  const { data: savedPlansData } = useQuery({
    queryKey: ['plans', SESSION_ID],
    queryFn:  () => api.plansList(SESSION_ID),
  })
  const savedPlans = savedPlansData?.plans ?? []

  // ── Progress ───────────────────────────────────────────────────────────────
  const { data: progressData, refetch: refetchProgress } = useQuery({
    queryKey: ['progress', SESSION_ID],
    queryFn:  () => api.progressGet(SESSION_ID),
  })

  const progressMap = {}
  ;(progressData?.progress ?? []).forEach(p => {
    progressMap[`${p.chapter}:${p.verse}`] = Boolean(p.completed)
  })

  const { mutate: updateProgress } = useMutation({
    mutationFn: api.progressUpdate,
    onSuccess:  () => refetchProgress(),
  })

  // ── Helpers ────────────────────────────────────────────────────────────────
  const chapterOf = (v) => parseInt(String(v).split('.')[0]) || 0

  const VerseChip = ({ v, interactive = true }) => {
    const [chStr, vStr] = String(v).split('.')
    const isDone = progressMap[`${chStr}:${vStr}`] ?? false
    const ch     = parseInt(chStr)
    const style  = isDone ? {} : {
      borderColor: (CH_COLOR[ch] ?? '#2A2A42') + '66',
      color:        CH_COLOR[ch] ?? '#B0A090',
      background:  (CH_COLOR[ch] ?? '#2A2A42') + '11',
    }
    const cls = `text-xs font-mono px-2 py-0.5 rounded border transition-all ${
      isDone
        ? 'border-teal/40 bg-teal/5 text-teal/60 line-through'
        : 'font-semibold'
    } ${interactive ? 'cursor-pointer hover:opacity-80' : ''}`

    if (!interactive) return <span className={cls} style={style}>{v}</span>

    return (
      <button
        className={cls}
        style={style}
        onClick={() => updateProgress({
          user_session_id: SESSION_ID,
          chapter: chStr, verse: vStr,
          completed: !isDone,
        })}
        title={isDone ? 'Mark as unread' : 'Mark as read'}
      >
        {isDone && <Check size={9} className="inline mr-0.5" />}
        {v}
      </button>
    )
  }

  const SessionProgress = ({ verses }) => {
    const total = verses.length
    const done  = verses.filter(v => {
      const [c, vv] = String(v).split('.')
      return progressMap[`${c}:${vv}`]
    }).length
    const pct = total > 0 ? Math.round((done / total) * 100) : 0
    return (
      <div className="flex items-center gap-2 mt-2">
        <div className="flex-1 h-1 rounded-full bg-bg-4 overflow-hidden">
          <div
            className="h-full rounded-full bg-gradient-to-r from-teal/60 to-teal transition-all duration-500"
            style={{ width: `${pct}%` }}
          />
        </div>
        <span className="text-[10px] font-mono text-teal/70 shrink-0">{done}/{total}</span>
      </div>
    )
  }

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Study Planner"
        subtitle="Backtracking CSP solver with MRV heuristic generates personalized verse schedules"
        module="MODULE 5 — CSP"
        icon={CalendarDays}
      />

      {/* Controls */}
      <Card hover={false} className="mb-6">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label mb-1 block">Spiritual Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)}>
              {GOALS.map(g => <option key={g} value={g}>{g.charAt(0).toUpperCase() + g.slice(1)}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 flex justify-between">
              <span>Sessions</span>
              <span className="text-gold font-mono">{sessions}</span>
            </label>
            <input type="range" min={3} max={7} value={sessions} onChange={e => setSessions(+e.target.value)} />
          </div>
          <div>
            <label className="label mb-1 flex justify-between">
              <span>Verses / Session</span>
              <span className="text-gold font-mono">{vps}</span>
            </label>
            <input type="range" min={2} max={3} value={vps} onChange={e => setVps(+e.target.value)} />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="gold" loading={isPending} onClick={() => mutate()}>
            Generate Plan
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {data && plan.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6">
            {/* Metrics + Save */}
            <div className="flex items-start gap-4 flex-wrap">
              <div className="grid grid-cols-2 md:grid-cols-4 gap-3 flex-1">
                <MetricCard value={plan.length} label="Sessions" color="gold" delay={0} />
                <MetricCard value={plan.flatMap(s => s.verses ?? s.verse_pairs ?? []).length} label="Total Verses" color="teal" delay={0.1} />
                <MetricCard value={new Set(plan.flatMap(s => (s.verses ?? s.verse_pairs ?? []).map(v => String(v).split('.')[0]))).size} label="Chapters" color="saffron" delay={0.2} />
                <MetricCard value={data.backtracks ?? 0} label="Backtracks" color="crimson" delay={0.3} />
              </div>
              <div className="flex items-center gap-2 self-end pb-0.5 flex-wrap">
                <Button variant="outline" onClick={() => savePlan()} loading={isSaving}>
                  <Save size={13} /> Save Plan
                </Button>
                <Button variant="outline" onClick={() => setFlashcardMode(true)}>
                  <Brain size={13} /> Flashcards
                </Button>
                <Button variant="outline" onClick={() => printPlan(goal, plan)}>
                  <Printer size={13} /> Print
                </Button>
                <AnimatePresence>
                  {savedMsg && (
                    <motion.span
                      initial={{ opacity: 0, x: -6 }}
                      animate={{ opacity: 1, x: 0 }}
                      exit={{ opacity: 0 }}
                      className="text-xs text-teal flex items-center gap-1"
                    >
                      <Check size={11} /> Saved!
                    </motion.span>
                  )}
                </AnimatePresence>
              </div>
            </div>

            {/* Timeline */}
            <div className="relative pl-8">
              <div className="absolute left-3 top-0 bottom-0 w-px bg-border" />
              {plan.map((session, i) => {
                const verses   = session.verses ?? session.verse_pairs ?? []
                const theme    = session.theme ?? session.shared_theme ?? ''
                const concepts = session.concepts ?? session.shared_concepts ?? []

                return (
                  <motion.div
                    key={i}
                    initial={{ opacity: 0, x: -20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: i * 0.1 + 0.3 }}
                    className="relative mb-5"
                  >
                    <div className="absolute -left-5 top-3 w-4 h-4 rounded-full border-2 border-gold-dim bg-bg-1 flex items-center justify-center">
                      <div className="w-2 h-2 rounded-full bg-gold" />
                    </div>

                    <div className="glass rounded-xl border border-border p-4 hover:border-border-bright transition-colors">
                      <div className="flex items-start justify-between mb-2">
                        <div>
                          <span className="font-cinzel text-sm font-bold text-gold">Session {i + 1}</span>
                          {theme && <p className="text-xs text-ink-2 mt-0.5">{theme}</p>}
                        </div>
                        <div className="flex gap-1.5 flex-wrap justify-end">
                          {verses.map((v, j) => <VerseChip key={j} v={v} />)}
                        </div>
                      </div>

                      <SessionProgress verses={verses} />

                      {concepts.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-3">
                          {(Array.isArray(concepts) ? concepts : [concepts]).map(c => (
                            <span key={c} className="chip chip-gold">{c}</span>
                          ))}
                        </div>
                      )}
                    </div>
                  </motion.div>
                )
              })}
            </div>

            {/* CSP explanation */}
            <Card hover={false}>
              <p className="label mb-3">CSP Solver Details</p>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
                {[
                  { name: 'Algorithm',       val: 'Backtracking + MRV + Forward Checking' },
                  { name: 'Variables',       val: `${sessions} study sessions` },
                  { name: 'Hard Constraints', val: '7 (theme coherence, chapter coverage, prerequisites, non-repetition…)' },
                  { name: 'Heuristic',       val: 'Minimum Remaining Values (fail-first)' },
                ].map(({ name, val }) => (
                  <div key={name} className="flex gap-2">
                    <span className="label w-28 shrink-0 pt-0.5">{name}</span>
                    <span className="text-ink-2 text-xs">{val}</span>
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {!data && !isPending && <EmptyState title="Configure and generate a plan" description="The CSP solver will find a constraint-satisfying study schedule" />}

      {/* ── My Saved Plans ──────────────────────────────────────────────────── */}
      {savedPlans.length > 0 && (
        <div className="mt-12">
          <p className="section-title mb-4">My Saved Plans</p>
          <div className="space-y-3">
            {savedPlans.map(sp => {
              const spVerses = sp.plan.flatMap(s => s.verses ?? s.verse_pairs ?? [])
              const done     = spVerses.filter(v => {
                const [c, vv] = String(v).split('.')
                return progressMap[`${c}:${vv}`]
              }).length
              const pct = spVerses.length > 0 ? Math.round((done / spVerses.length) * 100) : 0

              return (
                <div key={sp.id} className="glass rounded-xl border border-border overflow-hidden">
                  <button
                    onClick={() => setExpandedPlan(expandedPlan === sp.id ? null : sp.id)}
                    className="w-full flex items-center justify-between px-5 py-3.5 hover:bg-bg-3 transition-colors"
                  >
                    <div className="flex items-center gap-3">
                      <span className="font-cinzel text-sm font-semibold text-gold">
                        {sp.goal.charAt(0).toUpperCase() + sp.goal.slice(1)} Plan
                      </span>
                      <span className="text-[10px] text-ink-3 font-mono">
                        {sp.created_at.slice(0, 10)} · {sp.plan.length} sessions
                      </span>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="flex items-center gap-1.5">
                        <div className="w-20 h-1 rounded-full bg-bg-4 overflow-hidden">
                          <div
                            className="h-full rounded-full bg-teal/60 transition-all"
                            style={{ width: `${pct}%` }}
                          />
                        </div>
                        <span className="text-[10px] font-mono text-teal/70">{pct}%</span>
                      </div>
                      {expandedPlan === sp.id
                        ? <ChevronUp size={14} className="text-ink-3" />
                        : <ChevronDown size={14} className="text-ink-3" />
                      }
                    </div>
                  </button>

                  <AnimatePresence>
                    {expandedPlan === sp.id && (
                      <motion.div
                        initial={{ height: 0, opacity: 0 }}
                        animate={{ height: 'auto', opacity: 1 }}
                        exit={{ height: 0, opacity: 0 }}
                        className="overflow-hidden"
                      >
                        <div className="px-5 pb-4 space-y-2 border-t border-border/40 pt-3">
                          {sp.plan.map((session, si) => {
                            const sv = session.verses ?? session.verse_pairs ?? []
                            return (
                              <div key={si} className="flex items-center gap-4 py-1.5 border-b border-border/30 last:border-0">
                                <span className="text-[10px] font-cinzel text-gold w-20 shrink-0">
                                  Session {si + 1}
                                </span>
                                <div className="flex gap-1.5 flex-wrap flex-1">
                                  {sv.map((v, vi) => <VerseChip key={vi} v={v} />)}
                                </div>
                                <div className="shrink-0 w-16">
                                  <SessionProgress verses={sv} />
                                </div>
                              </div>
                            )
                          })}
                        </div>
                      </motion.div>
                    )}
                  </AnimatePresence>
                </div>
              )
            })}
          </div>
        </div>
      )}

      {/* Flashcard overlay */}
      <AnimatePresence>
        {flashcardMode && plan.length > 0 && (
          <FlashcardMode plan={plan} onClose={() => setFlashcardMode(false)} />
        )}
      </AnimatePresence>
    </div>
  )
}
