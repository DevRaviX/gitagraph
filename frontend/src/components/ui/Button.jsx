import { motion } from 'framer-motion'
import clsx from 'clsx'
import { Loader2 } from 'lucide-react'

const variants = {
  gold:    'bg-gold text-bg-1 hover:bg-gold-light active:bg-gold-dim',
  outline: 'border border-gold-dim text-gold hover:bg-gold-faint',
  ghost:   'text-ink-2 hover:text-ink-1 hover:bg-bg-4',
  danger:  'bg-crimson text-white hover:bg-crimson-dim',
}

export default function Button({ children, variant = 'outline', size = 'md', loading, disabled, onClick, className, type = 'button' }) {
  const sz = size === 'sm' ? 'px-3 py-1.5 text-xs' : size === 'lg' ? 'px-6 py-3 text-sm' : 'px-4 py-2 text-sm'

  return (
    <motion.button
      type={type}
      onClick={onClick}
      disabled={disabled || loading}
      whileTap={{ scale: 0.97 }}
      className={clsx(
        'inline-flex items-center justify-center gap-2 rounded-lg font-medium',
        'transition-colors duration-200 disabled:opacity-40 disabled:cursor-not-allowed',
        variants[variant], sz, className
      )}
    >
      {loading && <Loader2 size={13} className="animate-spin" />}
      {children}
    </motion.button>
  )
}
