import { motion, useMotionValue, useTransform, animate } from 'framer-motion'
import { useEffect } from 'react'
import clsx from 'clsx'

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

export default function MetricCard({ value, label, icon: Icon, color = 'gold', delay = 0, suffix = '' }) {
  const colors = {
    gold:    'text-gold    border-gold-dim    bg-gold-faint',
    teal:    'text-teal    border-teal/30     bg-teal/5',
    saffron: 'text-saffron border-saffron/30  bg-saffron/5',
    crimson: 'text-crimson border-crimson/30  bg-crimson/5',
  }

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.92 }}
      animate={{ opacity: 1, scale: 1 }}
      transition={{ duration: 0.4, delay, ease: 'backOut' }}
      className={clsx(
        'rounded-xl p-4 glass border flex flex-col gap-2',
        'hover:shadow-card-hover transition-shadow duration-300',
        colors[color]
      )}
    >
      <div className="flex items-center justify-between">
        <span className="label text-current opacity-70">{label}</span>
        {Icon && <Icon size={15} className="opacity-60" />}
      </div>
      <p className="font-cinzel text-3xl font-bold">
        <CountUp value={typeof value === 'number' ? value : 0} delay={delay} />
        {suffix}
      </p>
    </motion.div>
  )
}
