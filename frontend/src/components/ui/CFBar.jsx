import { motion } from 'framer-motion'

function cfColor(v) {
  if (v >= 0.8) return { bar: '#1ABC9C', text: 'text-teal', label: 'Strong' }
  if (v >= 0.6) return { bar: '#C9A84C', text: 'text-gold', label: 'Moderate' }
  if (v >= 0.4) return { bar: '#FF9933', text: 'text-saffron', label: 'Weak' }
  return             { bar: '#C0392B', text: 'text-crimson', label: 'Poor' }
}

export default function CFBar({ value = 0, label, showLabel = true, height = 6 }) {
  const { bar, text, label: lvl } = cfColor(value)
  const pct = Math.round(value * 100)

  return (
    <div className="w-full space-y-1">
      {(label || showLabel) && (
        <div className="flex justify-between items-center">
          {label && <span className="text-xs text-ink-2">{label}</span>}
          {showLabel && (
            <span className={`text-xs font-semibold font-mono ${text}`}>
              {pct}% · {lvl}
            </span>
          )}
        </div>
      )}
      <div
        className="w-full rounded-full bg-bg-4 overflow-hidden"
        style={{ height }}
      >
        <motion.div
          initial={{ width: 0 }}
          animate={{ width: `${pct}%` }}
          transition={{ duration: 0.8, ease: 'easeOut', delay: 0.2 }}
          className="h-full rounded-full"
          style={{ background: `linear-gradient(90deg, ${bar}99, ${bar})` }}
        />
      </div>
    </div>
  )
}
