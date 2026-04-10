import { motion } from 'framer-motion'

const variants = {
  initial: { opacity: 0, y: 16, filter: 'blur(4px)' },
  animate: { opacity: 1, y: 0,  filter: 'blur(0px)',
    transition: { duration: 0.35, ease: [0.22, 1, 0.36, 1] } },
  exit:    { opacity: 0, y: -8, filter: 'blur(2px)',
    transition: { duration: 0.2 } },
}

export default function PageTransition({ children }) {
  return (
    <motion.div
      variants={variants}
      initial="initial"
      animate="animate"
      exit="exit"
      className="min-h-full"
    >
      {children}
    </motion.div>
  )
}

export function PageHeader({ title, subtitle, module, icon: Icon }) {
  return (
    <div className="mb-8">
      <div className="flex items-start justify-between">
        <div>
          {module && (
            <span className="inline-block text-[10px] font-mono font-semibold
                             text-gold border border-gold-dim bg-gold-faint
                             px-2 py-0.5 rounded mb-2">
              {module}
            </span>
          )}
          <h2 className="font-cinzel text-2xl font-bold shimmer-text leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="text-ink-2 text-sm mt-1.5">{subtitle}</p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl bg-gold-faint border border-gold-dim
                          flex items-center justify-center shrink-0">
            <Icon size={18} className="text-gold" />
          </div>
        )}
      </div>
      <div className="mt-4 h-px bg-gradient-to-r from-gold-dim via-gold/40 to-transparent" />
    </div>
  )
}
