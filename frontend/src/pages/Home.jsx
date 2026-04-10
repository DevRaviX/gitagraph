import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BookOpen, Network, Brain, Layers, Cpu, Sparkles, ArrowRight, GitBranch, Search, CalendarDays, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { MetricCard, Card } from '../components/ui'
import { PageHeader } from '../components/layout/PageTransition'

const MODULES = [
  { icon: Layers,       title: 'Knowledge Base',  desc: 'OWL 2 ontology · 658 RDF triples · 16 classes', path: '/graph',       color: 'text-gold',    module: 'M2' },
  { icon: GitBranch,    title: 'Graph Search',     desc: 'BFS · DFS · A* · IDDFS on 61-node graph',       path: '/search',      color: 'text-teal',    module: 'M3' },
  { icon: Brain,        title: 'Expert System',    desc: '8 forward-chaining rules · SPARQL CQs',          path: '/ask',         color: 'text-saffron', module: 'M4' },
  { icon: CalendarDays, title: 'Study Planner',    desc: 'CSP backtracking · MRV · 7 constraints',         path: '/planner',     color: 'text-gold',    module: 'M5' },
  { icon: HelpCircle,   title: 'Uncertainty',      desc: 'MYCIN CFs · Fuzzy logic · Belief revision',      path: '/uncertainty', color: 'text-crimson', module: 'M6' },
  { icon: Search,       title: 'Verse Browser',    desc: '701 verses · Sanskrit · English · Hindi',        path: '/verses',      color: 'text-teal',    module: 'M2' },
]

const PEAS = [
  { label: 'Performance', value: 'Verse relevance, path optimality, constraint satisfaction rate' },
  { label: 'Environment', value: 'Partially observable, sequential, deterministic, discrete' },
  { label: 'Actuators',   value: 'Verse recommendations, study plans, uncertainty scores' },
  { label: 'Sensors',     value: 'Reader query, emotional state, philosophical goal' },
]

const container = {
  hidden: {},
  show: { transition: { staggerChildren: 0.07, delayChildren: 0.2 } },
}
const item = {
  hidden: { opacity: 0, y: 20 },
  show:   { opacity: 1, y: 0, transition: { duration: 0.4 } },
}

export default function Home() {
  const nav = useNavigate()
  const { data } = useQuery({ queryKey: ['stats'], queryFn: api.stats })

  const metrics = [
    { label: 'Total Verses',  value: data?.total_verses   ?? 701,  icon: BookOpen,  color: 'gold'    },
    { label: 'AI Corpus',     value: data?.corpus_verses  ?? 30,   icon: Cpu,       color: 'teal'    },
    { label: 'Concepts',      value: data?.concepts       ?? 24,   icon: Sparkles,  color: 'saffron' },
    { label: 'Graph Edges',   value: data?.edges          ?? 175,  icon: Network,   color: 'gold'    },
    { label: 'RDF Triples',   value: data?.rdf_triples    ?? 658,  icon: Layers,    color: 'teal'    },
    { label: 'AI Modules',    value: 6,                            icon: Brain,     color: 'saffron' },
  ]

  return (
    <div className="p-8 max-w-6xl mx-auto">
      <PageHeader
        title="GitaGraph Dashboard"
        subtitle="Ontology-Driven AI System for Philosophical Navigation of the Bhagavad Gītā"
        module="MODULE 0 — Overview"
        icon={Sparkles}
      />

      {/* Metrics */}
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8"
      >
        {metrics.map((m, i) => (
          <motion.div key={m.label} variants={item}>
            <MetricCard {...m} delay={i * 0.06} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* PEAS Framework */}
        <Card className="lg:col-span-2" delay={0.3} hover={false}>
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel font-bold text-lg text-gold">PEAS Framework</h3>
            <span className="chip chip-gold">Goal-Based Agent</span>
          </div>
          <div className="space-y-3">
            {PEAS.map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="label w-24 shrink-0 pt-0.5">{label}</span>
                <span className="text-sm text-ink-2 leading-relaxed">{value}</span>
              </div>
            ))}
          </div>
        </Card>

        {/* System Stats ring */}
        <Card delay={0.35} hover={false}>
          <h3 className="font-cinzel font-bold text-base text-gold mb-4">Graph Topology</h3>
          <div className="space-y-3">
            {[
              { label: 'Verses',   val: 32,  color: '#C9A84C' },
              { label: 'Concepts', val: 24,  color: '#1ABC9C' },
              { label: 'Edges',    val: 175, color: '#FF9933', max: 200 },
              { label: 'Triples',  val: 658, color: '#9B59B6', max: 700 },
            ].map(({ label, val, color, max = 40 }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between text-xs">
                  <span className="text-ink-2">{label}</span>
                  <span className="font-mono" style={{ color }}>{val}</span>
                </div>
                <div className="h-1.5 bg-bg-4 rounded-full overflow-hidden">
                  <motion.div
                    initial={{ width: 0 }}
                    animate={{ width: `${Math.min((val / max) * 100, 100)}%` }}
                    transition={{ duration: 1, delay: 0.5, ease: 'easeOut' }}
                    className="h-full rounded-full"
                    style={{ background: color }}
                  />
                </div>
              </div>
            ))}
          </div>
        </Card>
      </div>

      {/* Module Cards */}
      <h3 className="section-title mb-4">AI Modules</h3>
      <motion.div
        variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4"
      >
        {MODULES.map(({ icon: Icon, title, desc, path, color, module }, i) => (
          <motion.div key={title} variants={item}>
            <Card onClick={() => nav(path)} glow="gold" delay={0.4 + i * 0.05}>
              <div className="flex items-start justify-between mb-3">
                <div className={`w-9 h-9 rounded-lg bg-bg-4 border border-border flex items-center justify-center ${color}`}>
                  <Icon size={16} />
                </div>
                <span className="chip">{module}</span>
              </div>
              <h4 className="font-semibold text-ink-1 mb-1">{title}</h4>
              <p className="text-xs text-ink-2 leading-relaxed mb-3">{desc}</p>
              <div className="flex items-center gap-1 text-xs text-gold opacity-70 hover:opacity-100 transition-opacity">
                <span>Explore</span>
                <ArrowRight size={11} />
              </div>
            </Card>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
