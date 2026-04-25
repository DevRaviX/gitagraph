import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, GitBranch, Zap, Layers, RefreshCw, ChevronDown } from 'lucide-react'
import { api } from '../api'
import { Card, CFBar, Badge, Button, EmptyState } from '../components/ui'
import Tabs from '../components/ui/Tabs'
import { PageHeader } from '../components/layout/PageTransition'

function SearchVerseCard({ v, i, hopColor }) {
  const [expanded, setExpanded] = useState(false)
  const color = (hopColor && v.hop_depth != null ? hopColor[v.hop_depth] : null) || '#C9A84C'
  return (
    <motion.div
      initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.04 }}
      className="parchment-card hover:border-gold/30 transition-colors overflow-hidden"
    >
      {/* Header */}
      <div className="px-4 pt-4 pb-3">
        <div className="flex items-center gap-2 mb-2 flex-wrap">
          <span className="font-cinzel font-bold text-gold text-base">{v.chapter}.{v.verse_number}</span>
          {v.hop_depth != null && (
            <span className="text-[11px] px-2 py-0.5 rounded-full font-mono border"
              style={{ background: color + '22', color, borderColor: color + '44' }}>
              {v.hop_depth === 0 ? 'direct match' : `${v.hop_depth} link${v.hop_depth > 1 ? 's' : ''} away`}
            </span>
          )}
          {v.reached_via && (
            <span className="text-[11px] px-2 py-0.5 rounded-full border border-border text-ink-3 font-mono">
              via {v.reached_via.replace(/_inst$/, '').replace(/_/g, ' ')}
            </span>
          )}
          {v.speaker && (
            <span className={`text-[10px] px-1.5 py-0.5 rounded border font-semibold ${v.speaker === 'Krishna' ? 'border-teal/30 text-teal bg-teal/10' : 'border-saffron/30 text-saffron bg-saffron/10'}`}>
              {v.speaker}
            </span>
          )}
        </div>

        {/* Sanskrit */}
        {v.sa && <p className="text-[13px] font-dev text-gold/80 text-center whitespace-pre-line leading-loose mb-2">{v.sa}</p>}

        {/* Divider */}
        {v.sa && <div className="flex items-center gap-3 my-2">
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
          <div className="w-1 h-1 rounded-full bg-gold/35" />
          <div className="flex-1 h-px bg-gradient-to-r from-transparent via-gold/15 to-transparent" />
        </div>}

        {/* English */}
        {v.en && <p className="text-sm text-ink-1 leading-relaxed">{v.en}</p>}

        {/* Hindi */}
        {v.hi && <p className="text-[13px] text-ink-2 leading-relaxed mt-1.5">{v.hi}</p>}

        {/* Concepts */}
        {v.shared_concepts?.length > 0 && (
          <div className="flex flex-wrap gap-1.5 mt-2 pt-2 border-t border-border/50">
            {v.shared_concepts.map(c => (
              <span key={c} className="wax-chip">{c.replace(/_inst$/, '').replace(/_/g, ' ')}</span>
            ))}
          </div>
        )}

        {/* Expand toggle */}
        {(v.transliteration || v.word_meanings) && (
          <button onClick={() => setExpanded(e => !e)}
            className="flex items-center gap-1 mt-2 text-[11px] text-ink-3 hover:text-gold transition-colors">
            <motion.span animate={{ rotate: expanded ? 180 : 0 }} transition={{ duration: 0.2 }}>
              <ChevronDown size={12} />
            </motion.span>
            {expanded ? 'Less' : 'Transliteration & word meanings'}
          </button>
        )}
      </div>

      {/* Expandable section */}
      <AnimatePresence>
        {expanded && (
          <motion.div initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
            exit={{ height: 0, opacity: 0 }} className="overflow-hidden">
            <div className="px-4 pb-4 pt-2 border-t border-border/50 space-y-2">
              {v.transliteration && (
                <p className="text-[12px] italic text-ink-3 leading-relaxed">{v.transliteration}</p>
              )}
              {v.word_meanings && (
                <p className="text-[11px] text-ink-3 leading-relaxed">{v.word_meanings}</p>
              )}
            </div>
          </motion.div>
        )}
      </AnimatePresence>
    </motion.div>
  )
}

function BFSPanel({ concepts }) {
  const [concept, setConcept] = useState('')
  const [hops, setHops] = useState(2)
  const { mutate, data, isPending } = useMutation({ mutationFn: api.bfs })

  const HOP_COLOR = ['', '#C9A84C', '#1ABC9C', '#FF9933']

  return (
    <div className="space-y-5">
      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div className="md:col-span-2">
            <label className="label mb-1 block">Starting Concept</label>
            <select value={concept} onChange={e => setConcept(e.target.value)}>
              <option value="">Select concept…</option>
              {concepts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">How many links away</label>
            <input type="number" min={1} max={6} value={hops}
              onChange={e => setHops(Math.max(1, Math.min(6, +e.target.value || 1)))}
              className="w-full" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="gold" loading={isPending} onClick={() => concept && mutate({ concept, hops })}>
            Run BFS
          </Button>
        </div>
      </Card>

      {data && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}>
          <p className="label mb-3">
            Found <span className="text-gold">{data.results?.length ?? 0}</span> verse{(data.results?.length ?? 0) !== 1 ? 's' : ''} connected to <span className="text-gold">{data.concept}</span> within <span className="text-teal">{data.hops}</span> link{data.hops > 1 ? 's' : ''} in the knowledge graph
          </p>
          {(data.results?.length ?? 0) === 0 && (
            <p className="text-xs text-ink-3 mt-2">No verses found — try increasing Max Hops or selecting a different concept.</p>
          )}
          <div className="space-y-3 mt-3">
            {(data.results ?? []).map((v, i) => (
              <SearchVerseCard key={v.verse ?? i} v={v} i={i} hopColor={HOP_COLOR} />
            ))}
          </div>
        </motion.div>
      )}
      {!data && !isPending && <EmptyState title="Select a concept and run BFS" description="Finds all verses reachable within k links in the knowledge graph" />}
    </div>
  )
}

function DFSPanel({ concepts }) {
  const [start, setStart] = useState('')
  const { mutate, data, isPending } = useMutation({ mutationFn: api.dfs })

  return (
    <div className="space-y-5">
      <Card hover={false}>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="label mb-1 block">Start Node</label>
            <select value={start} onChange={e => setStart(e.target.value)}>
              <option value="">Select node…</option>
              {concepts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button variant="gold" loading={isPending} onClick={() => start && mutate({ start })}>
            Trace DFS Chain
          </Button>
        </div>
      </Card>

      {data?.chain?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
          <p className="label">{data.chain.length}-step causal chain via <span className="text-gold font-mono">leadsTo</span></p>
          {(data.annotated ?? data.chain.map(n => ({ node: n, category: '', definition: '', taught_by_verses: [] }))).map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.08 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0"
                  style={{ background: 'rgba(201,168,76,0.12)', border: '1px solid rgba(201,168,76,0.35)', color: '#C9A84C' }}>
                  {i + 1}
                </div>
                {i < data.chain.length - 1 && <div className="flex-1 w-px mt-1 mb-0 min-h-4" style={{ background: 'rgba(61,46,30,0.9)' }} />}
              </div>
              <div className="parchment-card p-3 flex-1 mb-3">
                <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                  <span className="font-semibold text-ink-1 text-sm">{step.node}</span>
                  {step.category && (
                    <Badge variant={step.category === 'DownfallCause' ? 'crimson' : 'gold'}>
                      {step.category}
                    </Badge>
                  )}
                </div>
                {step.definition && (
                  <p className="text-xs text-ink-2 leading-relaxed mb-2">{step.definition}</p>
                )}
                {step.taught_by_verses?.length > 0 && (
                  <div className="pt-2 border-t border-border/50 space-y-2">
                    <span className="text-[10px] text-ink-3">Taught by:</span>
                    {step.taught_by_verses.map((v, j) => (
                      <SearchVerseCard key={v.key ?? j} v={v} i={j} hopColor={null} />
                    ))}
                  </div>
                )}
                {i < data.chain.length - 1 && (
                  <p className="text-[10px] text-ink-3 mt-2">
                    <span className="text-gold">leadsTo</span> {data.chain[i + 1]}
                  </p>
                )}
              </div>
            </motion.div>
          ))}
        </motion.div>
      )}
      {!data && !isPending && <EmptyState title="Select a node to trace the DFS chain" description="Follows directed leadsTo edges depth-first" />}
    </div>
  )
}

function AStarPanel({ concepts }) {
  const [start, setStart] = useState('')
  const [goal, setGoal]   = useState('Moksha')
  const { mutate, data, isPending } = useMutation({ mutationFn: api.astar })

  return (
    <div className="space-y-5">
      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label mb-1 block">Start Node</label>
            <select value={start} onChange={e => setStart(e.target.value)}>
              <option value="">Select…</option>
              {concepts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)}>
              {['Moksha','Samadhi','AtmaJnana','ChittaShuddhi'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <Button variant="gold" loading={isPending} onClick={() => start && mutate({ start, goal })}>
            Run A*
          </Button>
        </div>
      </Card>

      {data && !data.path?.length && (
        <Card hover={false}>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-crimson">No path exists from <span className="font-mono">{start}</span> to <span className="font-mono">{goal}</span></p>
            <p className="text-xs text-ink-2 leading-relaxed">
              Downfall concepts like <span className="text-crimson font-mono">Kama</span>, <span className="text-crimson font-mono">Krodha</span>, and <span className="text-crimson font-mono">Moha</span> lead toward destruction, not liberation. There is no <em>leadsTo</em> path from this concept to {goal}.
            </p>
            <p className="text-xs text-ink-3">
              Start from a practice instead:
              {['NishkamaKarma','Abhyasa','Vairagya','DhyanaYoga','Sthitaprajna'].map(s => (
                <button key={s} onClick={() => setStart(s)}
                  className="ml-1.5 px-1.5 py-0.5 rounded border border-gold/30 text-gold text-[10px] font-mono hover:bg-gold/10 transition-colors">
                  {s}
                </button>
              ))}
            </p>
          </div>
        </Card>
      )}
      {data?.path?.length > 0 && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">

          {/* Step-by-step path with definitions */}
          <Card hover={false}>
            {(() => {
              const steps = data.path.length - 1
              const label = steps === 0 ? 'Already at goal'
                : steps === 1 ? `Direct path — ${data.path[0]} leads straight to ${data.path[1]}`
                : `Path found — ${steps} concept${steps !== 1 ? 's' : ''} to cross to reach ${data.path[data.path.length - 1]}`
              return <p className="label mb-4">{label}</p>
            })()}
            <div className="space-y-3">
              {(data.path_details?.length ? data.path_details : data.path.map(n => ({ name: n, category: '', definition: '', verses: [] }))).map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className="flex gap-3">
                    {/* Timeline line */}
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                        i === 0 ? 'bg-saffron/15 border-saffron/50 text-saffron' :
                        i === data.path.length - 1 ? 'bg-teal/15 border-teal/50 text-teal' :
                        'bg-gold-faint border-gold-dim text-gold'
                      }`}>{i + 1}</div>
                      {i < data.path.length - 1 && <div className="flex-1 w-px mt-1 min-h-4" style={{ background: 'rgba(61,46,30,0.9)' }} />}
                    </div>

                    {/* Node card */}
                    <div className="flex-1 parchment-card p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-ink-1">{step.name}</span>
                        {step.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-ink-3 font-mono">
                            {step.category}
                          </span>
                        )}
                        {i === 0 && <span className="text-[10px] text-saffron font-mono">START</span>}
                        {i === data.path.length - 1 && <span className="text-[10px] text-teal font-mono">GOAL</span>}
                      </div>

                      {step.definition && (
                        <p className="text-xs text-ink-2 leading-relaxed mb-2">{step.definition}</p>
                      )}

                      {step.verses?.length > 0 && (
                        <div className="pt-2 border-t border-border/50 space-y-2">
                          <span className="text-[10px] text-ink-3">Taught by:</span>
                          {step.verses.map((v, j) => (
                            <SearchVerseCard key={v.key ?? j} v={v} i={j} hopColor={null} />
                          ))}
                        </div>
                      )}

                      {/* Edge label to next */}
                      {i < data.path.length - 1 && (
                        <p className="text-[10px] text-ink-3 mt-2 flex items-center gap-1">
                          <span className="text-gold">leadsTo</span> {data.path[i + 1]}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* f-value trace table */}
          {data.trace?.length > 0 && (
            <Card hover={false}>
              <p className="label mb-3">f(n) = g(n) + h(n) Expansion Trace</p>
              {data.admissibility_note && (
                <p className="text-[11px] text-ink-3 mb-3 leading-relaxed">{data.admissibility_note}</p>
              )}
              <div className="overflow-x-auto">
                <table className="w-full text-xs">
                  <thead>
                    <tr className="border-b border-border">
                      {['Node','g(n) cost','h(n) heuristic','f(n) total'].map(h => (
                        <th key={h} className="text-left py-2 pr-4 text-ink-3 font-semibold">{h}</th>
                      ))}
                    </tr>
                  </thead>
                  <tbody>
                    {data.trace.map((row, i) => (
                      <tr key={i} className={`border-b border-border/50 hover:bg-bg-3 transition-colors ${
                        data.path?.includes(row.node) ? 'bg-gold/5' : ''
                      }`}>
                        <td className="py-2 pr-4 font-medium text-ink-1">
                          {row.node}
                          {data.path?.includes(row.node) && <span className="ml-1.5 text-gold text-[9px]">✓ path</span>}
                        </td>
                        <td className="py-2 pr-4 font-mono text-teal">{row.g}</td>
                        <td className="py-2 pr-4 font-mono text-gold">{row.h}</td>
                        <td className="py-2 pr-4 font-mono text-saffron font-semibold">{row.f}</td>
                      </tr>
                    ))}
                  </tbody>
                </table>
              </div>
            </Card>
          )}
        </motion.div>
      )}
      {!data && !isPending && <EmptyState title="Select start/goal and run A*" description="Finds the shortest path with an admissible heuristic" />}
    </div>
  )
}

function IDDFSPanel({ concepts }) {
  const [start, setStart]       = useState('')
  const [goal, setGoal]         = useState('Moksha')
  const [maxDepth, setMaxDepth] = useState(6)
  const { mutate, data, isPending } = useMutation({ mutationFn: api.iddfs })

  return (
    <div className="space-y-5">
      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label mb-1 block">Start Node</label>
            <select value={start} onChange={e => setStart(e.target.value)}>
              <option value="">Select…</option>
              {concepts.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">Goal</label>
            <select value={goal} onChange={e => setGoal(e.target.value)}>
              {['Moksha','Samadhi','AtmaJnana','ChittaShuddhi'].map(g => (
                <option key={g} value={g}>{g}</option>
              ))}
            </select>
          </div>
          <div>
            <label className="label mb-1 block">Search Limit (steps)</label>
            <input type="number" min={2} max={12} value={maxDepth}
              onChange={e => setMaxDepth(Math.max(2, Math.min(12, +e.target.value || 2)))}
              className="w-full" />
          </div>
        </div>
        <div className="mt-4 flex justify-end">
          <Button variant="gold" loading={isPending} onClick={() => start && mutate({ start, goal, max_depth: maxDepth })}>
            Run IDDFS
          </Button>
        </div>
      </Card>

      {data?.found && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Summary */}
          <div className="grid grid-cols-3 gap-3">
            {[
              { label: 'Concepts in Path', val: data.path?.length ?? '—', color: 'text-gold' },
              { label: 'Depth When Found', val: data.depth_found ?? '—', color: 'text-teal' },
              { label: 'Total Nodes Visited', val: data.nodes_explored ?? '—', color: 'text-saffron' },
            ].map(({ label, val, color }) => (
              <div key={label} className="parchment-card p-3 text-center">
                <p className={`text-xl font-mono font-bold ${color}`}>{val}</p>
                <p className="text-[10px] text-ink-3 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Path */}
          <Card hover={false}>
            <p className="label mb-4">Path found at depth {data.depth_found} — {data.path?.length - 1} step{data.path?.length - 1 !== 1 ? 's' : ''} from <span className="text-gold">{data.path?.[0]}</span> to <span className="text-teal">{data.path?.[data.path.length - 1]}</span></p>
            <div className="space-y-3">
              {(data.path_details?.length ? data.path_details : (data.path ?? []).map(n => ({ name: n, category: '', definition: '', verses: [] }))).map((step, i) => (
                <motion.div key={i} initial={{ opacity: 0, x: -12 }} animate={{ opacity: 1, x: 0 }} transition={{ delay: i * 0.08 }}>
                  <div className="flex gap-3">
                    <div className="flex flex-col items-center">
                      <div className={`w-8 h-8 rounded-full flex items-center justify-center text-xs font-mono font-bold shrink-0 border ${
                        i === 0 ? 'bg-saffron/15 border-saffron/50 text-saffron' :
                        i === data.path.length - 1 ? 'bg-teal/15 border-teal/50 text-teal' :
                        'bg-gold-faint border-gold-dim text-gold'
                      }`}>{i + 1}</div>
                      {i < data.path.length - 1 && <div className="flex-1 w-px mt-1 min-h-4" style={{ background: 'rgba(61,46,30,0.9)' }} />}
                    </div>
                    <div className="flex-1 parchment-card p-3 mb-3">
                      <div className="flex items-center gap-2 mb-1.5 flex-wrap">
                        <span className="font-semibold text-sm text-ink-1">{step.name}</span>
                        {step.category && (
                          <span className="text-[10px] px-1.5 py-0.5 rounded-full border border-border text-ink-3 font-mono">{step.category}</span>
                        )}
                        {i === 0 && <span className="text-[10px] text-saffron font-mono">START</span>}
                        {i === data.path.length - 1 && <span className="text-[10px] text-teal font-mono">GOAL</span>}
                      </div>
                      {step.definition && (
                        <p className="text-xs text-ink-2 leading-relaxed mb-2">{step.definition}</p>
                      )}
                      {step.verses?.length > 0 && (
                        <div className="pt-2 border-t border-border/50 space-y-2">
                          <span className="text-[10px] text-ink-3">Taught by:</span>
                          {step.verses.map((v, j) => (
                            <SearchVerseCard key={v.key ?? j} v={v} i={j} hopColor={null} />
                          ))}
                        </div>
                      )}
                      {i < data.path.length - 1 && (
                        <p className="text-[10px] text-ink-3 mt-2 flex items-center gap-1">
                          <span className="text-gold">leadsTo</span> {data.path[i + 1]}
                        </p>
                      )}
                    </div>
                  </div>
                </motion.div>
              ))}
            </div>
          </Card>

          {/* Iteration trace */}
          {data.iterations?.length > 0 && (
            <Card hover={false}>
              <p className="label mb-3">Depth Iterations</p>
              <div className="space-y-1.5">
                {data.iterations.map((it, i) => (
                  <div key={i} className="flex items-center gap-3 text-xs">
                    <span className="font-mono text-gold w-16 shrink-0">depth {it.depth}</span>
                    <div className="flex-1 h-1.5 rounded-full bg-bg-4 overflow-hidden">
                      <div
                        className="h-full rounded-full bg-gold/50 transition-all"
                        style={{ width: `${Math.min((it.nodes_explored / (data.nodes_explored || 1)) * 100, 100)}%` }}
                      />
                    </div>
                    <span className="font-mono text-ink-3 w-24 text-right">{it.nodes_explored} nodes</span>
                    {it.found && <span className="text-teal font-semibold">✓ found</span>}
                  </div>
                ))}
              </div>
            </Card>
          )}
        </motion.div>
      )}

      {data && !data.found && (
        <Card hover={false}>
          <div className="space-y-2">
            <p className="text-sm font-semibold text-crimson">No path exists from <span className="font-mono">{start}</span> to <span className="font-mono">{goal}</span></p>
            <p className="text-xs text-ink-2 leading-relaxed">
              Not all concepts lead toward {goal}. Some concepts like <span className="text-crimson font-mono">Kama</span>, <span className="text-crimson font-mono">Krodha</span>, and <span className="text-crimson font-mono">Moha</span> are downfall causes — they lead <em>away</em> from liberation, not toward it. Increasing the search limit will not help.
            </p>
            <p className="text-xs text-ink-3 mt-1">
              Try starting from a practice or attainment concept instead:
              {['NishkamaKarma','Abhyasa','Vairagya','DhyanaYoga','Sthitaprajna'].map(s => (
                <button key={s} onClick={() => setStart(s)}
                  className="ml-1.5 px-1.5 py-0.5 rounded border border-gold/30 text-gold text-[10px] font-mono hover:bg-gold/10 transition-colors">
                  {s}
                </button>
              ))}
            </p>
          </div>
        </Card>
      )}
      {!data && !isPending && <EmptyState title="Select start/goal and run IDDFS" description="Iterative deepening — memory-efficient depth-first with optimal path guarantee" />}
    </div>
  )
}

export default function Search() {
  const { data: concepts = [] } = useQuery({ queryKey: ['concepts'], queryFn: api.concepts })
  const cs = concepts?.concepts ?? concepts

  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Graph Search"
        subtitle="BFS · DFS · A* · IDDFS over the philosophical knowledge graph"
        module="MODULE 3 — Search"
        icon={SearchIcon}
      />
      <Tabs items={[
        { label: 'BFS',   icon: Layers,      content: <BFSPanel   concepts={cs} /> },
        { label: 'DFS',   icon: GitBranch,   content: <DFSPanel   concepts={cs} /> },
        { label: 'A*',    icon: Zap,         content: <AStarPanel concepts={cs} /> },
        { label: 'IDDFS', icon: RefreshCw,   content: <IDDFSPanel concepts={cs} /> },
      ]} />
    </div>
  )
}
