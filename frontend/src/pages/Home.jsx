import { useQuery } from '@tanstack/react-query'
import { motion } from 'framer-motion'
import { BookOpen, Network, Brain, Layers, Cpu, Sparkles, ArrowRight, GitBranch, Search, CalendarDays, HelpCircle } from 'lucide-react'
import { useNavigate } from 'react-router-dom'
import { api } from '../api'
import { MetricCard } from '../components/ui'
import { PageHeader } from '../components/layout/PageTransition'

const MODULES = [
  { icon: Layers,       title: 'Knowledge Base',  desc: 'OWL 2 ontology · 658 RDF triples · 16 classes', path: '/graph',       accent: '#C9A84C', module: 'M2' },
  { icon: GitBranch,    title: 'Graph Search',     desc: 'BFS · DFS · A* · IDDFS on 61-node graph',       path: '/search',      accent: '#4A9E7A', module: 'M3' },
  { icon: Brain,        title: 'Expert System',    desc: '8 forward-chaining rules · SPARQL CQs',          path: '/ask',         accent: '#E8861A', module: 'M4' },
  { icon: CalendarDays, title: 'Study Planner',    desc: 'CSP backtracking · MRV · 7 constraints',         path: '/planner',     accent: '#C9A84C', module: 'M5' },
  { icon: HelpCircle,   title: 'Uncertainty',      desc: 'MYCIN CFs · Fuzzy logic · Belief revision',      path: '/uncertainty', accent: '#B03020', module: 'M6' },
  { icon: Search,       title: 'Verse Browser',    desc: '701 verses · Sanskrit · English · Hindi',        path: '/verses',      accent: '#4A9E7A', module: 'M2' },
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
  const nav  = useNavigate()
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
    <div className="p-6 md:p-8 max-w-6xl mx-auto">
      <PageHeader
        title="GitaGraph Dashboard"
        subtitle="Ontology-Driven AI System for Philosophical Navigation of the Bhagavad Gītā"
        module="MODULE 0 — Overview"
        icon={Sparkles}
      />

      {/* Metrics */}
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3 mb-8">
        {metrics.map((m, i) => (
          <motion.div key={m.label} variants={item}>
            <MetricCard {...m} delay={i * 0.06} />
          </motion.div>
        ))}
      </motion.div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-5 mb-8">
        {/* PEAS Framework */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.3 }}
          className="lg:col-span-2 parchment-card p-5">
          <div className="flex items-center justify-between mb-4">
            <h3 className="font-cinzel font-bold text-lg shimmer-text">PEAS Framework</h3>
            <span style={{
              fontSize: '0.65rem', fontFamily: 'Cinzel, serif', fontWeight: 700,
              letterSpacing: '0.15em', textTransform: 'uppercase',
              color: '#f0d8a0', background: 'rgba(201,168,76,0.10)',
              border: '1px solid rgba(201,168,76,0.28)', padding: '0.25rem 0.7rem', borderRadius: 999,
            }}>Goal-Based Agent</span>
          </div>
          <div className="space-y-3">
            {PEAS.map(({ label, value }) => (
              <div key={label} className="flex gap-3">
                <span className="shrink-0 pt-0.5 font-cinzel uppercase tracking-[0.15em]"
                  style={{ fontSize: '0.6rem', fontWeight: 700, color: 'rgba(122,96,64,0.85)', width: 88 }}>
                  {label}
                </span>
                <span className="font-fell leading-relaxed" style={{ color: '#c4a97a', fontSize: '0.88rem' }}>
                  {value}
                </span>
              </div>
            ))}
          </div>
        </motion.div>

        {/* Graph topology bars */}
        <motion.div initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.35, delay: 0.35 }}
          className="parchment-card p-5">
          <h3 className="font-cinzel font-bold text-base shimmer-text mb-4">Graph Topology</h3>
          <div className="space-y-3.5">
            {[
              { label: 'Verses',   val: 32,  color: '#C9A84C', max: 40 },
              { label: 'Concepts', val: 24,  color: '#4A9E7A', max: 30 },
              { label: 'Edges',    val: 175, color: '#E8861A', max: 200 },
              { label: 'Triples',  val: 658, color: '#9B7BC4', max: 700 },
            ].map(({ label, val, color, max }) => (
              <div key={label} className="space-y-1">
                <div className="flex justify-between">
                  <span style={{ fontSize: '0.7rem', color: 'rgba(196,169,122,0.8)' }}>{label}</span>
                  <span className="font-mono" style={{ fontSize: '0.7rem', color }}>{val}</span>
                </div>
                <div className="h-1.5 rounded-full overflow-hidden" style={{ background: 'rgba(61,46,30,0.7)' }}>
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
        </motion.div>
      </div>

      {/* Module Cards */}
      <p className="font-cinzel font-bold text-xl shimmer-text mb-4">AI Modules</p>
      <motion.div variants={container} initial="hidden" animate="show"
        className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
        {MODULES.map(({ icon: Icon, title, desc, path, accent, module }, i) => (
          <motion.div key={title} variants={item}>
            <motion.div
              whileHover={{ y: -3, transition: { duration: 0.2 } }}
              onClick={() => nav(path)}
              className="parchment-card p-5 cursor-pointer transition-shadow duration-300 group"
              style={{ position: 'relative', overflow: 'hidden' }}
            >
              {/* Hover glow overlay */}
              <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"
                style={{ background: `radial-gradient(circle at top left, ${accent}0D, transparent 60%)` }} />

              <div className="relative flex items-start justify-between mb-3">
                <div className="w-9 h-9 rounded-lg flex items-center justify-center"
                  style={{ background: `${accent}15`, border: `1px solid ${accent}35` }}>
                  <Icon size={16} style={{ color: accent }} />
                </div>
                <span style={{
                  fontSize: '0.58rem', fontFamily: 'Cinzel, serif', fontWeight: 700,
                  letterSpacing: '0.18em', textTransform: 'uppercase',
                  color: 'rgba(122,96,64,0.7)', background: 'rgba(31,23,16,0.6)',
                  border: '1px solid rgba(61,46,30,0.8)', padding: '0.18rem 0.55rem', borderRadius: 6,
                }}>
                  {module}
                </span>
              </div>
              <h4 className="relative font-cinzel font-semibold mb-1.5" style={{ color: '#f5edcf', fontSize: '0.88rem' }}>
                {title}
              </h4>
              <p className="relative font-fell leading-relaxed mb-4" style={{ color: 'rgba(196,169,122,0.75)', fontSize: '0.82rem' }}>
                {desc}
              </p>
              <div className="relative flex items-center gap-1.5 font-cinzel uppercase tracking-[0.14em] transition-colors group-hover:gap-2"
                style={{ fontSize: '0.6rem', color: accent, opacity: 0.75 }}>
                <span>Explore</span>
                <ArrowRight size={10} />
              </div>
            </motion.div>
          </motion.div>
        ))}
      </motion.div>
    </div>
  )
}
