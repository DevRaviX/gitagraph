import { useState } from 'react'
import { useQuery, useMutation } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, List, ChevronDown, ChevronUp, User } from 'lucide-react'
import { api } from '../api'
import { Card, Badge, CFBar, Gauge, Button, EmptyState } from '../components/ui'
import Tabs from '../components/ui/Tabs'
import { PageHeader } from '../components/layout/PageTransition'

function ProfileCard({ profile, index }) {
  const [open, setOpen] = useState(false)

  const cf = profile.top_recommendation?.cf ?? profile.confidence ?? 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}
    >
      <Card hover className="overflow-hidden">
        {/* Header row */}
        <button
          className="w-full flex items-center gap-4 text-left"
          onClick={() => setOpen(o => !o)}
        >
          <div className="w-10 h-10 rounded-full bg-gold-faint border border-gold-dim flex items-center justify-center shrink-0">
            <User size={18} className="text-gold" />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-cinzel font-bold text-sm text-ink-1 capitalize">
                {profile.name ?? profile.reader_type ?? `Profile ${index + 1}`}
              </span>
              {profile.stage && <Badge variant="gold">{profile.stage}</Badge>}
              {profile.nature && <Badge variant="teal">{profile.nature}</Badge>}
            </div>
            <p className="text-xs text-ink-3 mt-0.5 truncate">
              {profile.top_recommendation?.concept ?? profile.goal ?? '—'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Gauge value={cf} size={44} label="" />
            {open ? <ChevronUp size={14} className="text-ink-3" /> : <ChevronDown size={14} className="text-ink-3" />}
          </div>
        </button>

        {/* Expandable detail */}
        <AnimatePresence initial={false}>
          {open && (
            <motion.div
              key="detail"
              initial={{ height: 0, opacity: 0 }}
              animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }}
              transition={{ duration: 0.25 }}
              className="overflow-hidden"
            >
              <div className="mt-4 pt-4 border-t border-border space-y-4">
                {/* Recommendation */}
                {profile.top_recommendation && (
                  <div className="space-y-2">
                    <p className="label">Top Recommendation</p>
                    <p className="text-sm text-ink-1">{profile.top_recommendation.recommendation}</p>
                    <CFBar value={cf} label="Confidence" />
                    {profile.top_recommendation.start_verse && (
                      <Badge variant="saffron">Start: {profile.top_recommendation.start_verse}</Badge>
                    )}
                  </div>
                )}

                {/* Fired rules */}
                {profile.top_recommendation?.fired_rules?.length > 0 && (
                  <div>
                    <p className="label mb-2">Fired Rules</p>
                    <div className="space-y-1.5">
                      {profile.top_recommendation.fired_rules.map((r, i) => (
                        <div key={i} className="flex items-start gap-2 text-xs">
                          <span className="w-1.5 h-1.5 rounded-full bg-gold mt-1.5 shrink-0" />
                          <span className="text-ink-2">{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {/* All recommendations */}
                {profile.all_recommendations?.length > 1 && (
                  <div>
                    <p className="label mb-2">All Recommendations</p>
                    <div className="space-y-2">
                      {profile.all_recommendations.slice(1).map((rec, i) => (
                        <div key={i} className="flex items-center gap-3 p-2 rounded-lg bg-bg-3 border border-border">
                          <Badge variant="default" className="shrink-0">{rec.concept}</Badge>
                          <CFBar value={rec.cf ?? 0} showLabel={false} className="flex-1" />
                          <span className="font-mono text-xs text-gold shrink-0">{(rec.cf ?? 0).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </Card>
    </motion.div>
  )
}

function ProfilesPanel() {
  const { data, isLoading } = useQuery({ queryKey: ['profiles'], queryFn: api.profiles })

  const profiles = Array.isArray(data) ? data : (data?.profiles ?? [])

  if (isLoading) {
    return (
      <div className="space-y-3">
        {[0, 1, 2].map(i => (
          <div key={i} className="h-20 rounded-xl bg-bg-3 border border-border animate-pulse" />
        ))}
      </div>
    )
  }

  if (!profiles.length) {
    return <EmptyState title="No profiles available" description="The /api/profiles endpoint returned no data" />
  }

  return (
    <div className="space-y-4">
      <p className="text-xs text-ink-3">{profiles.length} reader profiles · Click to expand inference trace</p>
      {profiles.map((p, i) => <ProfileCard key={i} profile={p} index={i} />)}
    </div>
  )
}

const RULE_VARIANTS = { gold: 'gold', teal: 'teal', saffron: 'saffron', crimson: 'crimson' }

const RULES = [
  {
    id: 'R1', condition: 'concern = stress AND stage = beginner',
    action: 'recommend Karma-Yoga (Ch 2)', cf: 0.9,
    specificity: 3, concepts: ['KarmaYoga', 'Equanimity'],
  },
  {
    id: 'R2', condition: 'concern = purpose AND nature = active',
    action: 'recommend Nishkama-Karma (Ch 3)', cf: 0.85,
    specificity: 2, concepts: ['NishkamaKarma'],
  },
  {
    id: 'R3', condition: 'concern = meditation AND stage = intermediate',
    action: 'recommend Dhyana-Yoga (Ch 6)', cf: 0.88,
    specificity: 2, concepts: ['Dhyana', 'Samadhi'],
  },
  {
    id: 'R4', condition: 'goal = liberation AND nature = devotional',
    action: 'recommend Bhakti-Yoga path', cf: 0.92,
    specificity: 2, concepts: ['BhaktiYoga', 'Moksha'],
  },
  {
    id: 'R5', condition: 'concern = wisdom AND stage = advanced',
    action: 'recommend Jnana-Yoga (Ch 4)', cf: 0.87,
    specificity: 2, concepts: ['JnanaYoga', 'AtmaJnana'],
  },
  {
    id: 'R6', condition: 'concern = desire AND nature = contemplative',
    action: 'recommend ChittaShuddhi path', cf: 0.75,
    specificity: 2, concepts: ['ChittaShuddhi', 'Viveka'],
  },
  {
    id: 'R7', condition: 'stage = beginner (default)',
    action: 'recommend Ch 2 overview', cf: 0.65,
    specificity: 1, concepts: ['SthitaPrajna'],
  },
  {
    id: 'R8', condition: 'goal = inner-peace (any stage)',
    action: 'recommend Equanimity verses', cf: 0.78,
    specificity: 1, concepts: ['Equanimity', 'Shanti'],
  },
]

function RuleBasePanel() {
  const [sort, setSort] = useState('specificity')

  const sorted = [...RULES].sort((a, b) =>
    sort === 'cf' ? b.cf - a.cf : b.specificity - a.specificity
  )

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between">
        <p className="text-xs text-ink-3">{RULES.length} production rules · forward-chaining with specificity-ordered conflict resolution</p>
        <div className="flex gap-2">
          {['specificity', 'cf'].map(s => (
            <button
              key={s}
              onClick={() => setSort(s)}
              className={`text-xs px-3 py-1 rounded-full border transition-colors ${
                sort === s ? 'border-gold-dim bg-gold-faint text-gold' : 'border-border text-ink-2 hover:text-ink-1'
              }`}
            >
              Sort by {s === 'cf' ? 'CF' : 'Specificity'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((rule, i) => (
          <motion.div
            key={rule.id}
            layout
            initial={{ opacity: 0, y: 16 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}
          >
            <Card hover={false} className="p-4">
              <div className="flex items-start gap-4">
                {/* Rule ID badge */}
                <div className="shrink-0">
                  <span className="font-mono text-gold text-xs border border-gold-dim bg-gold-faint px-2.5 py-1 rounded-lg font-bold">
                    {rule.id}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  {/* IF / THEN */}
                  <div className="space-y-1">
                    <div className="flex gap-2 text-xs">
                      <span className="text-ink-3 w-8 shrink-0 font-semibold">IF</span>
                      <span className="text-ink-2 font-mono">{rule.condition}</span>
                    </div>
                    <div className="flex gap-2 text-xs">
                      <span className="text-teal w-8 shrink-0 font-semibold">THEN</span>
                      <span className="text-ink-1">{rule.action}</span>
                    </div>
                  </div>

                  {/* CF bar + specificity */}
                  <div className="flex items-center gap-3">
                    <div className="flex-1">
                      <CFBar value={rule.cf} showLabel={false} />
                    </div>
                    <span className="font-mono text-gold text-xs shrink-0">{rule.cf.toFixed(2)}</span>
                  </div>

                  {/* Concepts + specificity chip */}
                  <div className="flex items-center gap-2 flex-wrap">
                    {rule.concepts.map(c => (
                      <span key={c} className="chip chip-gold">{c}</span>
                    ))}
                    <span className="ml-auto text-[10px] text-ink-3 font-mono">
                      specificity={rule.specificity}
                    </span>
                  </div>
                </div>
              </div>
            </Card>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <Card hover={false}>
        <p className="label mb-3">Conflict Resolution Strategy</p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3 text-xs text-ink-2">
          {[
            { name: 'Specificity', desc: 'More specific rules fire first (higher condition count wins)' },
            { name: 'CF Threshold', desc: 'Only rules with CF ≥ 0.5 are considered credible' },
            { name: 'Recency', desc: 'Newer working memory facts take priority in tie-breaking' },
            { name: 'Forward Chaining', desc: 'All matching rules fire; results merged via MYCIN CF combination' },
          ].map(({ name, desc }) => (
            <div key={name} className="flex gap-2">
              <span className="label w-24 shrink-0">{name}</span>
              <span>{desc}</span>
            </div>
          ))}
        </div>
      </Card>
    </div>
  )
}

export default function Expert() {
  return (
    <div className="p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Expert System"
        subtitle="Forward-chaining rule engine with specificity-ordered conflict resolution"
        module="MODULE 4 — Expert System"
        icon={Brain}
      />
      <Tabs items={[
        { label: 'Reader Profiles', icon: User,   content: <ProfilesPanel /> },
        { label: 'Rule Base',       icon: List,   content: <RuleBasePanel /> },
      ]} />
    </div>
  )
}
