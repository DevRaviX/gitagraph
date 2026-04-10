import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Search as SearchIcon, GitBranch, Zap, Layers, RefreshCw } from 'lucide-react'
import { api } from '../api'
import { Card, CFBar, Badge, Button, EmptyState } from '../components/ui'
import Tabs from '../components/ui/Tabs'
import { PageHeader } from '../components/layout/PageTransition'

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
            <label className="label mb-1 flex justify-between">
              <span>Max Hops</span>
              <span className="text-gold font-mono">{hops}</span>
            </label>
            <input type="range" min={1} max={3} value={hops} onChange={e => setHops(+e.target.value)} />
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
          <p className="label mb-3">{data.verses?.length ?? 0} verses reachable within {hops} hop{hops > 1 ? 's' : ''}</p>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
            {(data.verses ?? []).map((v, i) => (
              <motion.div
                key={v.id ?? i}
                initial={{ opacity: 0, x: -12 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.04 }}
                className="glass rounded-lg p-3 border border-border hover:border-border-bright transition-colors"
              >
                <div className="flex items-center gap-2 mb-1.5">
                  <span className="font-mono text-saffron text-sm">{v.id}</span>
                  <span
                    className="text-xs px-1.5 py-0.5 rounded-full font-mono"
                    style={{ background: HOP_COLOR[v.hop_depth] + '22', color: HOP_COLOR[v.hop_depth] }}
                  >
                    hop {v.hop_depth}
                  </span>
                  {v.reached_via && <span className="chip">{v.reached_via}</span>}
                </div>
                <p className="text-xs text-ink-2 line-clamp-2">{v.translation}</p>
              </motion.div>
            ))}
          </div>
        </motion.div>
      )}
      {!data && !isPending && <EmptyState title="Select a concept and run BFS" description="Finds all verses reachable within k hops" />}
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
          <p className="label">{data.chain.length}-step causal chain</p>
          {data.chain.map((step, i) => (
            <motion.div
              key={i}
              initial={{ opacity: 0, x: -20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ delay: i * 0.1 }}
              className="flex gap-4"
            >
              <div className="flex flex-col items-center">
                <div className="w-7 h-7 rounded-full bg-gold-faint border border-gold-dim flex items-center justify-center text-xs font-mono text-gold font-bold shrink-0">
                  {i + 1}
                </div>
                {i < data.chain.length - 1 && <div className="flex-1 w-px bg-border mt-1 mb-0 min-h-4" />}
              </div>
              <div className="glass rounded-xl p-3 border border-border flex-1 mb-3">
                <div className="flex items-center gap-2 mb-1">
                  <span className="font-semibold text-ink-1 text-sm">{step.node}</span>
                  {step.type && <Badge variant="gold">{step.type}</Badge>}
                </div>
                {step.definition && <p className="text-xs text-ink-2">{step.definition}</p>}
                {step.verse && <p className="text-xs text-gold-dim mt-1 font-mono">→ {step.verse}</p>}
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

      {data?.path && (
        <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-4">
          {/* Path visualisation */}
          <Card hover={false}>
            <p className="label mb-3">Optimal Path — {data.path.length - 1} hops</p>
            <div className="flex flex-wrap items-center gap-2">
              {data.path.map((node, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    i === 0 ? 'border-saffron/50 text-saffron bg-saffron/10' :
                    i === data.path.length - 1 ? 'border-teal/50 text-teal bg-teal/10' :
                    'border-border text-ink-1 bg-bg-4'
                  }`}>{node}</span>
                  {i < data.path.length - 1 && <span className="text-gold text-lg">→</span>}
                </span>
              ))}
            </div>
          </Card>

          {/* f-value trace */}
          {data.trace?.length > 0 && (
            <Card hover={false}>
              <p className="label mb-3">f(n) = g(n) + h(n) Expansion Trace</p>
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
                      <tr key={i} className="border-b border-border/50 hover:bg-bg-3 transition-colors">
                        <td className="py-2 pr-4 font-medium text-ink-1">{row.node}</td>
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
            <label className="label mb-1 flex justify-between">
              <span>Max Depth</span>
              <span className="text-gold font-mono">{maxDepth}</span>
            </label>
            <input type="range" min={2} max={10} value={maxDepth} onChange={e => setMaxDepth(+e.target.value)} />
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
              { label: 'Path Length', val: data.path?.length ?? '—', color: 'text-gold' },
              { label: 'Found at Depth', val: data.depth_found ?? '—', color: 'text-teal' },
              { label: 'Nodes Explored', val: data.nodes_explored ?? '—', color: 'text-saffron' },
            ].map(({ label, val, color }) => (
              <div key={label} className="glass rounded-xl border border-border p-3 text-center">
                <p className={`text-xl font-mono font-bold ${color}`}>{val}</p>
                <p className="text-[10px] text-ink-3 mt-0.5">{label}</p>
              </div>
            ))}
          </div>

          {/* Path */}
          <Card hover={false}>
            <p className="label mb-3">Path Found — iterative deepening (depth {data.depth_found})</p>
            <div className="flex flex-wrap items-center gap-2">
              {(data.path ?? []).map((node, i) => (
                <span key={i} className="flex items-center gap-2">
                  <span className={`px-2.5 py-1 rounded-lg text-xs font-semibold border ${
                    i === 0 ? 'border-saffron/50 text-saffron bg-saffron/10' :
                    i === (data.path.length - 1) ? 'border-teal/50 text-teal bg-teal/10' :
                    'border-border text-ink-1 bg-bg-4'
                  }`}>{node}</span>
                  {i < data.path.length - 1 && <span className="text-gold">→</span>}
                </span>
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
          <p className="text-sm text-crimson">No path found from <span className="font-mono">{start}</span> to <span className="font-mono">{goal}</span> within depth {maxDepth}. Try increasing max depth.</p>
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
    <div className="p-8 max-w-4xl mx-auto">
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
