import { useState } from 'react'
import { useQuery } from '@tanstack/react-query'
import { motion, AnimatePresence } from 'framer-motion'
import { Brain, List, ChevronDown, ChevronUp, User } from 'lucide-react'
import { api } from '../api'
import { Card, Badge, CFBar, Gauge, EmptyState } from '../components/ui'
import Tabs from '../components/ui/Tabs'
import { PageHeader } from '../components/layout/PageTransition'

function ProfileCard({ profile, index }) {
  const [open, setOpen] = useState(false)
  const cf = profile.top_recommendation?.cf ?? profile.confidence ?? 0

  return (
    <motion.div initial={{ opacity: 0, y: 20 }} animate={{ opacity: 1, y: 0 }}
      transition={{ delay: index * 0.08 }}>
      <div className="parchment-card overflow-hidden">
        <button className="w-full flex items-center gap-4 text-left p-5"
          onClick={() => setOpen(o => !o)}>
          <div className="w-10 h-10 rounded-full flex items-center justify-center shrink-0"
            style={{ background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.28)' }}>
            <User size={17} style={{ color: '#C9A84C' }} />
          </div>
          <div className="flex-1 min-w-0">
            <div className="flex items-center gap-2 flex-wrap">
              <span className="font-cinzel font-bold text-sm capitalize" style={{ color: '#f5edcf' }}>
                {profile.name ?? profile.reader_type ?? `Profile ${index + 1}`}
              </span>
              {profile.stage  && <Badge variant="gold">{profile.stage}</Badge>}
              {profile.nature && <Badge variant="teal">{profile.nature}</Badge>}
            </div>
            <p className="font-fell mt-0.5 truncate" style={{ fontSize: '0.78rem', color: 'rgba(122,96,64,0.8)' }}>
              {profile.top_recommendation?.concept ?? profile.goal ?? '—'}
            </p>
          </div>
          <div className="flex items-center gap-3 shrink-0">
            <Gauge value={cf} size={44} label="" />
            {open
              ? <ChevronUp size={13} style={{ color: 'rgba(122,96,64,0.7)' }} />
              : <ChevronDown size={13} style={{ color: 'rgba(122,96,64,0.7)' }} />}
          </div>
        </button>

        <AnimatePresence initial={false}>
          {open && (
            <motion.div key="detail"
              initial={{ height: 0, opacity: 0 }} animate={{ height: 'auto', opacity: 1 }}
              exit={{ height: 0, opacity: 0 }} transition={{ duration: 0.25 }}
              className="overflow-hidden">
              <div className="px-5 pb-5 pt-3 space-y-4"
                style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}>
                {profile.top_recommendation && (
                  <div className="space-y-2">
                    <p className="font-cinzel uppercase tracking-[0.18em]"
                      style={{ fontSize: '0.58rem', color: 'rgba(122,96,64,0.8)' }}>
                      Top Recommendation
                    </p>
                    <p className="font-fell leading-relaxed" style={{ color: '#f5edcf', fontSize: '0.88rem' }}>
                      {profile.top_recommendation.recommendation}
                    </p>
                    <CFBar value={cf} label="Confidence" />
                    {profile.top_recommendation.start_verse && (
                      <Badge variant="saffron">Start: {profile.top_recommendation.start_verse}</Badge>
                    )}
                  </div>
                )}

                {profile.top_recommendation?.fired_rules?.length > 0 && (
                  <div>
                    <p className="font-cinzel uppercase tracking-[0.18em] mb-2"
                      style={{ fontSize: '0.58rem', color: 'rgba(122,96,64,0.8)' }}>
                      Fired Rules
                    </p>
                    <div className="space-y-1.5">
                      {profile.top_recommendation.fired_rules.map((r, i) => (
                        <div key={i} className="flex items-start gap-2" style={{ fontSize: '0.78rem', color: '#c4a97a' }}>
                          <span className="w-1.5 h-1.5 rounded-full mt-1.5 shrink-0" style={{ background: '#C9A84C' }} />
                          <span>{r}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}

                {profile.all_recommendations?.length > 1 && (
                  <div>
                    <p className="font-cinzel uppercase tracking-[0.18em] mb-2"
                      style={{ fontSize: '0.58rem', color: 'rgba(122,96,64,0.8)' }}>
                      All Recommendations
                    </p>
                    <div className="space-y-2">
                      {profile.all_recommendations.slice(1).map((rec, i) => (
                        <div key={i} className="flex items-center gap-3 p-2.5 rounded-lg"
                          style={{ background: 'rgba(31,23,16,0.7)', border: '1px solid rgba(61,46,30,0.8)' }}>
                          <Badge variant="default" className="shrink-0">{rec.concept}</Badge>
                          <CFBar value={rec.cf ?? 0} showLabel={false} />
                          <span className="font-mono shrink-0" style={{ fontSize: '0.7rem', color: '#C9A84C' }}>
                            {(rec.cf ?? 0).toFixed(2)}
                          </span>
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
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
          <div key={i} className="h-20 rounded-xl animate-pulse"
            style={{ background: 'rgba(31,23,16,0.7)', border: '1px solid rgba(61,46,30,0.8)' }} />
        ))}
      </div>
    )
  }

  if (!profiles.length) {
    return <EmptyState title="No profiles available" description="The /api/profiles endpoint returned no data" />
  }

  return (
    <div className="space-y-4">
      <p className="font-fell" style={{ fontSize: '0.8rem', color: 'rgba(122,96,64,0.75)' }}>
        {profiles.length} reader profiles · Click to expand inference trace
      </p>
      {profiles.map((p, i) => <ProfileCard key={i} profile={p} index={i} />)}
    </div>
  )
}

const RULES = [
  { id: 'R1', condition: 'concern = stress AND stage = beginner',     action: 'recommend Karma-Yoga (Ch 2)',        cf: 0.90, specificity: 3, concepts: ['KarmaYoga', 'Equanimity'] },
  { id: 'R2', condition: 'concern = purpose AND nature = active',     action: 'recommend Nishkama-Karma (Ch 3)',    cf: 0.85, specificity: 2, concepts: ['NishkamaKarma'] },
  { id: 'R3', condition: 'concern = meditation AND stage = intermediate', action: 'recommend Dhyana-Yoga (Ch 6)', cf: 0.88, specificity: 2, concepts: ['Dhyana', 'Samadhi'] },
  { id: 'R4', condition: 'goal = liberation AND nature = devotional',  action: 'recommend Bhakti-Yoga path',        cf: 0.92, specificity: 2, concepts: ['BhaktiYoga', 'Moksha'] },
  { id: 'R5', condition: 'concern = wisdom AND stage = advanced',      action: 'recommend Jnana-Yoga (Ch 4)',       cf: 0.87, specificity: 2, concepts: ['JnanaYoga', 'AtmaJnana'] },
  { id: 'R6', condition: 'concern = desire AND nature = contemplative', action: 'recommend ChittaShuddhi path',     cf: 0.75, specificity: 2, concepts: ['ChittaShuddhi', 'Viveka'] },
  { id: 'R7', condition: 'stage = beginner (default)',                 action: 'recommend Ch 2 overview',           cf: 0.65, specificity: 1, concepts: ['SthitaPrajna'] },
  { id: 'R8', condition: 'goal = inner-peace (any stage)',             action: 'recommend Equanimity verses',       cf: 0.78, specificity: 1, concepts: ['Equanimity', 'Shanti'] },
]

function RuleBasePanel() {
  const [sort, setSort] = useState('specificity')
  const sorted = [...RULES].sort((a, b) => sort === 'cf' ? b.cf - a.cf : b.specificity - a.specificity)

  return (
    <div className="space-y-5">
      <div className="flex items-center justify-between flex-wrap gap-3">
        <p className="font-fell" style={{ fontSize: '0.82rem', color: 'rgba(122,96,64,0.75)' }}>
          {RULES.length} production rules · forward-chaining with specificity-ordered conflict resolution
        </p>
        <div className="flex gap-2">
          {['specificity', 'cf'].map(s => (
            <button key={s} onClick={() => setSort(s)}
              className="font-cinzel uppercase tracking-[0.12em] transition-colors"
              style={{
                fontSize: '0.6rem', padding: '0.28rem 0.75rem', borderRadius: 999,
                border: sort === s ? '1px solid rgba(201,168,76,0.45)' : '1px solid rgba(61,46,30,0.8)',
                background: sort === s ? 'rgba(201,168,76,0.10)' : 'transparent',
                color: sort === s ? '#f0d8a0' : 'rgba(122,96,64,0.7)',
              }}>
              Sort by {s === 'cf' ? 'CF' : 'Specificity'}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {sorted.map((rule, i) => (
          <motion.div key={rule.id} layout
            initial={{ opacity: 0, y: 16 }} animate={{ opacity: 1, y: 0 }}
            transition={{ delay: i * 0.05 }}>
            <div className="parchment-card p-4">
              <div className="flex items-start gap-4">
                <div className="shrink-0">
                  <span className="font-mono font-bold"
                    style={{
                      fontSize: '0.72rem', color: '#C9A84C',
                      background: 'rgba(201,168,76,0.10)', border: '1px solid rgba(201,168,76,0.30)',
                      padding: '0.25rem 0.6rem', borderRadius: 8, display: 'inline-block',
                    }}>
                    {rule.id}
                  </span>
                </div>

                <div className="flex-1 min-w-0 space-y-2">
                  <div className="space-y-1">
                    <div className="flex gap-2">
                      <span className="w-8 shrink-0 font-cinzel uppercase tracking-wider"
                        style={{ fontSize: '0.58rem', color: 'rgba(122,96,64,0.8)', fontWeight: 700, paddingTop: 2 }}>
                        IF
                      </span>
                      <span className="font-mono" style={{ fontSize: '0.75rem', color: '#c4a97a' }}>{rule.condition}</span>
                    </div>
                    <div className="flex gap-2">
                      <span className="w-8 shrink-0 font-cinzel uppercase tracking-wider"
                        style={{ fontSize: '0.58rem', color: '#4A9E7A', fontWeight: 700, paddingTop: 2 }}>
                        THEN
                      </span>
                      <span className="font-fell" style={{ fontSize: '0.88rem', color: '#f5edcf' }}>{rule.action}</span>
                    </div>
                  </div>

                  <div className="flex items-center gap-3">
                    <div className="flex-1"><CFBar value={rule.cf} showLabel={false} /></div>
                    <span className="font-mono shrink-0" style={{ fontSize: '0.7rem', color: '#C9A84C' }}>
                      {rule.cf.toFixed(2)}
                    </span>
                  </div>

                  <div className="flex items-center gap-2 flex-wrap">
                    {rule.concepts.map(c => (
                      <span key={c} className="wax-chip">{c}</span>
                    ))}
                    <span className="ml-auto font-mono" style={{ fontSize: '0.62rem', color: 'rgba(122,96,64,0.65)' }}>
                      specificity={rule.specificity}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          </motion.div>
        ))}
      </div>

      {/* Legend */}
      <div className="parchment-card p-4">
        <p className="font-cinzel uppercase tracking-[0.18em] mb-3"
          style={{ fontSize: '0.58rem', color: 'rgba(122,96,64,0.8)' }}>
          Conflict Resolution Strategy
        </p>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {[
            { name: 'Specificity',      desc: 'More specific rules fire first (higher condition count wins)' },
            { name: 'CF Threshold',     desc: 'Only rules with CF ≥ 0.5 are considered credible' },
            { name: 'Recency',          desc: 'Newer working memory facts take priority in tie-breaking' },
            { name: 'Fwd. Chaining',    desc: 'All matching rules fire; results merged via MYCIN CF combination' },
          ].map(({ name, desc }) => (
            <div key={name} className="flex gap-2">
              <span className="font-cinzel uppercase tracking-wider shrink-0"
                style={{ fontSize: '0.58rem', fontWeight: 700, color: 'rgba(122,96,64,0.8)', width: 88, paddingTop: 2 }}>
                {name}
              </span>
              <span className="font-fell leading-relaxed" style={{ fontSize: '0.82rem', color: '#c4a97a' }}>{desc}</span>
            </div>
          ))}
        </div>
      </div>
    </div>
  )
}

export default function Expert() {
  return (
    <div className="p-6 md:p-8 max-w-4xl mx-auto">
      <PageHeader
        title="Expert System"
        subtitle="Forward-chaining rule engine with specificity-ordered conflict resolution"
        module="MODULE 4 — Expert System"
        icon={Brain}
      />
      <Tabs items={[
        { label: 'Reader Profiles', icon: User, content: <ProfilesPanel /> },
        { label: 'Rule Base',       icon: List, content: <RuleBasePanel /> },
      ]} />
    </div>
  )
}
