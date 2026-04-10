import { motion } from 'framer-motion'

export default function Gauge({ value = 0, size = 100, label }) {
  const r = 36
  const circ = 2 * Math.PI * r
  const pct  = Math.min(Math.max(value, 0), 1)
  const dash = circ * pct
  const col  = pct >= 0.8 ? '#1ABC9C' : pct >= 0.6 ? '#C9A84C' : pct >= 0.4 ? '#FF9933' : '#C0392B'

  return (
    <div className="flex flex-col items-center gap-1" style={{ width: size }}>
      <svg width={size} height={size} viewBox="0 0 80 80">
        <circle cx="40" cy="40" r={r} fill="none" stroke="#2A2A42" strokeWidth="7" />
        <motion.circle
          cx="40" cy="40" r={r}
          fill="none"
          stroke={col}
          strokeWidth="7"
          strokeLinecap="round"
          strokeDasharray={circ}
          initial={{ strokeDashoffset: circ }}
          animate={{ strokeDashoffset: circ - dash }}
          transition={{ duration: 1, ease: 'easeOut', delay: 0.3 }}
          style={{ transformOrigin: 'center', transform: 'rotate(-90deg)' }}
        />
        <text x="40" y="44" textAnchor="middle"
          fill={col} fontSize="14" fontWeight="700" fontFamily="JetBrains Mono">
          {Math.round(pct * 100)}%
        </text>
      </svg>
      {label && <span className="text-xs text-ink-2 text-center leading-tight">{label}</span>}
    </div>
  )
}
