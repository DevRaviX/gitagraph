import { useState } from 'react'
import { useMutation, useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { HelpCircle, Sliders, Activity } from 'lucide-react'
import { RadarChart, PolarGrid, PolarAngleAxis, Radar, ResponsiveContainer } from 'recharts'
import { api } from '../api'
import { Card, CFBar, Gauge, Badge, Button, EmptyState } from '../components/ui'
import Tabs from '../components/ui/Tabs'
import { PageHeader } from '../components/layout/PageTransition'

const SOURCES = ['Textual Evidence', 'Tradition Authority', 'Contextual Merit']

function MYCINPanel({ concepts }) {
  const [verse, setVerse]     = useState('2.47')
  const [concept, setConcept] = useState('')
  const [sliders, setSliders] = useState([0.9, 0.85, 0.7])
  const { mutate, data, isPending } = useMutation({ mutationFn: api.cf })

  const combinedCF = sliders.reduce((acc, cf) =>
    acc >= 0 && cf >= 0 ? acc + cf * (1 - acc)
    : acc < 0 && cf < 0 ? acc + cf * (1 + acc)
    : (acc + cf) / (1 - Math.min(Math.abs(acc), Math.abs(cf)))
  )

  return (
    <div className="space-y-5">
      <Card hover={false}>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 items-end">
          <div>
            <label className="label mb-1 block">Verse</label>
            <input placeholder="e.g. 2.47" value={verse} onChange={e => setVerse(e.target.value)} />
          </div>
          <div>
            <label className="label mb-1 block">Concept</label>
            <select value={concept} onChange={e => setConcept(e.target.value)}>
              <option value="">Select concept…</option>
              {(concepts?.concepts ?? concepts ?? []).map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
          <Button variant="gold" loading={isPending}
            onClick={() => verse && concept && mutate({ verse, concept })}>
            Compute CF
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card hover={false}>
              <div className="flex items-center gap-6">
                <Gauge value={data.combined_cf ?? 0} size={100} label="Combined CF" />
                <div className="flex-1 space-y-2">
                  <p className="text-sm font-semibold text-ink-1">{verse} → {concept}</p>
                  <p className="text-xs font-mono text-ink-3">
                    CF = CF₁ + CF₂×(1−CF₁)
                  </p>
                  <CFBar value={data.combined_cf ?? 0} />
                </div>
              </div>
            </Card>
            <Card hover={false}>
              <p className="label mb-3">Evidence Sources</p>
              <div className="space-y-3">
                {(data.sources ?? []).map((s, i) => (
                  <div key={i} className="space-y-1">
                    <div className="flex justify-between text-xs">
                      <span className="text-ink-2">{s.source}</span>
                      <span className="font-mono text-gold">{s.cf?.toFixed(3)}</span>
                    </div>
                    <CFBar value={s.cf ?? 0} showLabel={false} />
                  </div>
                ))}
              </div>
            </Card>
          </motion.div>
        )}
      </AnimatePresence>

      {/* Interactive CF simulator */}
      <Card hover={false}>
        <p className="label mb-4">CF Combination Simulator</p>
        <div className="space-y-4">
          {SOURCES.map((src, i) => (
            <div key={src} className="space-y-1">
              <div className="flex justify-between text-xs">
                <span className="text-ink-2">{src}</span>
                <span className="font-mono text-gold">{sliders[i].toFixed(2)}</span>
              </div>
              <input type="range" min={0} max={1} step={0.01} value={sliders[i]}
                onChange={e => setSliders(s => s.map((v,j) => j===i ? +e.target.value : v))} />
            </div>
          ))}
          <div className="pt-3 border-t border-border">
            <div className="flex items-center justify-between">
              <span className="text-sm text-ink-2">MYCIN Combined CF</span>
              <div className="flex items-center gap-3">
                <span className="font-mono text-2xl font-bold text-teal">{combinedCF.toFixed(4)}</span>
                <Gauge value={combinedCF} size={60} />
              </div>
            </div>
          </div>
        </div>
      </Card>
    </div>
  )
}

function FuzzyPanel() {
  const [verse, setVerse] = useState('6.47')
  const { mutate, data, isPending } = useMutation({ mutationFn: (v) => api.fuzzy(v) })

  const chartData = (data?.yoga_paths ?? []).map((p, i) => ({
    path: p, μ: data.memberships[i] ?? 0
  }))

  return (
    <div className="space-y-5">
      <Card hover={false}>
        <div className="flex gap-4 items-end">
          <div className="flex-1">
            <label className="label mb-1 block">Verse</label>
            <input placeholder="e.g. 6.47" value={verse} onChange={e => setVerse(e.target.value)} />
          </div>
          <Button variant="gold" loading={isPending} onClick={() => verse && mutate(verse)}>
            Compute Fuzzy
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {data && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }}
            className="grid grid-cols-1 md:grid-cols-2 gap-5">
            <Card hover={false}>
              <p className="label mb-4">Yoga-Path Membership μ ∈ [0,1]</p>
              <div className="space-y-4">
                {(data.yoga_paths ?? []).map((path, i) => {
                  const μ = data.memberships?.[i] ?? 0
                  const lbl = data.linguistic_labels?.[i] ?? ''
                  return (
                    <div key={path} className="space-y-1.5">
                      <div className="flex justify-between text-xs items-center">
                        <span className="text-ink-1 font-medium">{path}</span>
                        <div className="flex items-center gap-2">
                          <Badge variant={μ >= 0.8 ? 'teal' : μ >= 0.5 ? 'gold' : 'default'}>
                            {lbl}
                          </Badge>
                          <span className="font-mono text-gold">{μ.toFixed(2)}</span>
                        </div>
                      </div>
                      <CFBar value={μ} showLabel={false} />
                    </div>
                  )
                })}
              </div>
            </Card>

            {chartData.length > 0 && (
              <Card hover={false}>
                <p className="label mb-2">Radar Chart</p>
                <ResponsiveContainer width="100%" height={220}>
                  <RadarChart data={chartData}>
                    <PolarGrid stroke="#2A2A42" />
                    <PolarAngleAxis dataKey="path" tick={{ fill: '#B0A090', fontSize: 11 }} />
                    <Radar dataKey="μ" stroke="#C9A84C" fill="#C9A84C" fillOpacity={0.25} strokeWidth={2} />
                  </RadarChart>
                </ResponsiveContainer>
              </Card>
            )}
          </motion.div>
        )}
      </AnimatePresence>

      {!data && !isPending && <EmptyState title="Enter a verse to compute fuzzy membership" description="Returns membership degree μ ∈ [0,1] across 4 yoga paths" />}
    </div>
  )
}

function BeliefPanel() {
  const [nature, setNature] = useState('active')
  const { mutate, data, isPending } = useMutation({ mutationFn: api.belief })

  const steps = data?.steps ?? []

  return (
    <div className="space-y-5">
      <Card hover={false}>
        <div className="flex gap-4 items-end">
          <div className="w-48">
            <label className="label mb-1 block">Reader Nature</label>
            <select value={nature} onChange={e => setNature(e.target.value)}>
              <option value="active">Active</option>
              <option value="contemplative">Contemplative</option>
              <option value="devotional">Devotional</option>
            </select>
          </div>
          <Button variant="gold" loading={isPending} onClick={() => mutate({ nature })}>
            Run Belief Revision
          </Button>
        </div>
      </Card>

      <AnimatePresence>
        {steps.length > 0 && (
          <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-3">
            {steps.map((step, i) => (
              <motion.div key={i}
                initial={{ opacity: 0, x: -16 }}
                animate={{ opacity: 1, x: 0 }}
                transition={{ delay: i * 0.08 }}
              >
                <Card hover={false} className="p-4">
                  <div className="flex items-center gap-2 mb-2">
                    <span className="font-mono text-gold text-xs border border-gold-dim bg-gold-faint px-2 py-0.5 rounded">
                      Step {i + 1}
                    </span>
                    <span className="text-sm font-medium text-ink-1">{step.title ?? step.event}</span>
                  </div>
                  {step.changes?.map((c, j) => (
                    <div key={j} className="flex items-start gap-2 mt-1.5 text-xs">
                      <Badge variant={c.action === 'ADD' ? 'teal' : 'crimson'} className="shrink-0 mt-0.5">
                        {c.action}
                      </Badge>
                      <span className="text-ink-2">{c.belief}</span>
                    </div>
                  ))}
                  {step.trigger && (
                    <p className="text-xs text-ink-3 mt-2 font-mono">trigger: {step.trigger}</p>
                  )}
                </Card>
              </motion.div>
            ))}
          </motion.div>
        )}
      </AnimatePresence>

      {!data && !isPending && <EmptyState title="Run belief revision" description="Shows how defaults are retracted as new verses are encountered" />}
    </div>
  )
}

export default function Uncertainty() {
  const { data: concepts } = useQuery({ queryKey: ['concepts'], queryFn: api.concepts })

  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Uncertainty Handling"
        subtitle="MYCIN Certainty Factors · Fuzzy Logic · Non-Monotonic Belief Revision"
        module="MODULE 6 — Uncertainty"
        icon={HelpCircle}
      />
      <Tabs items={[
        { label: 'MYCIN CF',        icon: Activity,  content: <MYCINPanel concepts={concepts} /> },
        { label: 'Fuzzy Membership',icon: Sliders,   content: <FuzzyPanel /> },
        { label: 'Belief Revision', icon: HelpCircle,content: <BeliefPanel /> },
      ]} />
    </div>
  )
}
