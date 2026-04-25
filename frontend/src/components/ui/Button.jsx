import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  gold:    { background: 'linear-gradient(135deg, #d5b35b, #ad8430)', color: '#160f08', border: 'none', boxShadow: '0 4px 16px rgba(201,168,76,0.22)' },
  outline: { background: 'transparent', color: '#C9A84C', border: '1px solid rgba(138,110,42,0.5)' },
  ghost:   { background: 'transparent', color: '#C4A97A', border: '1px solid transparent' },
  danger:  { background: 'rgba(176,48,32,0.18)', color: '#B03020', border: '1px solid rgba(176,48,32,0.4)' },
}

const hoverVariants = {
  gold:    { background: 'linear-gradient(135deg, #e0c570, #c09540)', boxShadow: '0 6px 22px rgba(201,168,76,0.30)' },
  outline: { background: 'rgba(201,168,76,0.08)', borderColor: 'rgba(201,168,76,0.65)' },
  ghost:   { background: 'rgba(61,46,30,0.6)', color: '#F5EDCF' },
  danger:  { background: 'rgba(176,48,32,0.28)' },
}

export default function Button({ children, variant = 'outline', size = 'md', loading, disabled, onClick, className, type = 'button' }) {
  const sz = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-sm'
  const v  = variants[variant] ?? variants.outline
  const hv = hoverVariants[variant] ?? hoverVariants.outline

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileHover={!disabled && !loading ? hv : undefined}
      whileTap={!disabled && !loading ? { scale: 0.96 } : undefined}
      transition={{ duration: 0.15 }}
      style={v}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-cinzel tracking-wide',
        'transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        'text-[11px] font-semibold uppercase letter-spacing-wider',
        sz, className
      )}
    >
      {loading && <Loader2 size={13} className="animate-spin" />}
      {children}
    </motion.button>
  )
}
