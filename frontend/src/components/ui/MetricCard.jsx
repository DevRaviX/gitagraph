import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'

function CountUp({ value, duration = 1.2 }) {
  const mv = useMotionValue(0)
  const display = useTransform(mv, (v) =>
    Number.isInteger(value) ? Math.round(v).toLocaleString() : v.toFixed(2)
  )
  useEffect(() => {
    const ctrl = animate(mv, typeof value === 'number' ? value : 0, { duration, ease: 'easeOut' })
    return ctrl.stop
  }, [value])
  return <motion.span>{display}</motion.span>
}

const colorMap = {
  gold:    { accent: '#C9A84C', border: 'rgba(201,168,76,0.25)', bg: 'rgba(201,168,76,0.07)', glow: 'rgba(201,168,76,0.12)' },
  teal:    { accent: '#4A9E7A', border: 'rgba(74,158,122,0.25)',  bg: 'rgba(74,158,122,0.07)',  glow: 'rgba(74,158,122,0.10)' },
  saffron: { accent: '#E8861A', border: 'rgba(232,134,26,0.25)', bg: 'rgba(232,134,26,0.07)', glow: 'rgba(232,134,26,0.10)' },
  crimson: { accent: '#B03020', border: 'rgba(176,48,32,0.25)',  bg: 'rgba(176,48,32,0.07)',  glow: 'rgba(176,48,32,0.10)' },
}

export default function MetricCard({ value, label, icon: Icon, color = 'gold', delay = 0, suffix = '' }) {
  const c = colorMap[color] ?? colorMap.gold

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'backOut' }}
      style={{
        borderRadius: 16,
        padding: '1rem 1.1rem',
        background: `linear-gradient(160deg, ${c.bg}, rgba(14,11,7,0.85))`,
        border: `1px solid ${c.border}`,
        boxShadow: `0 4px 24px rgba(0,0,0,0.35), 0 0 20px ${c.glow}`,
        display: 'flex', flexDirection: 'column', gap: 8,
      }}
    >
      <div className="flex items-center justify-between">
        <span style={{ fontSize: '0.6rem', fontWeight: 700, textTransform: 'uppercase', letterSpacing: '0.2em', color: 'rgba(122,96,64,0.85)' }}>
          {label}
        </span>
        {Icon && <Icon size={14} style={{ color: c.accent, opacity: 0.7 }} />}
      </div>
      <p className="font-cinzel text-3xl font-bold" style={{ color: c.accent, textShadow: `0 0 20px ${c.glow}` }}>
        <CountUp value={typeof value === 'number' ? value : 0} />
        {suffix}
      </p>
    </motion.div>
  )
}
