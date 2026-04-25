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
      <div className="flex items-start justify-between gap-4">
        <div>
          {module && (
            <span className="inline-block mb-2 font-cinzel font-semibold uppercase tracking-[0.2em]"
              style={{
                fontSize: '0.6rem',
                color: 'rgba(138,110,42,0.9)',
                border: '1px solid rgba(138,110,42,0.35)',
                background: 'rgba(201,168,76,0.07)',
                padding: '0.2rem 0.65rem',
                borderRadius: 6,
              }}>
              {module}
            </span>
          )}
          <h2 className="font-cinzel text-2xl font-bold shimmer-text leading-tight">
            {title}
          </h2>
          {subtitle && (
            <p className="font-fell mt-1.5" style={{ color: '#C4A97A', fontSize: '0.92rem', lineHeight: 1.6 }}>
              {subtitle}
            </p>
          )}
        </div>
        {Icon && (
          <div className="w-10 h-10 rounded-xl flex items-center justify-center shrink-0"
            style={{
              background: 'rgba(201,168,76,0.08)',
              border: '1px solid rgba(201,168,76,0.28)',
              boxShadow: '0 0 16px rgba(201,168,76,0.10)',
            }}>
            <Icon size={18} style={{ color: '#C9A84C' }} />
          </div>
        )}
      </div>
      {/* Knotwork rule divider */}
      <div className="mt-5 knotwork-rule"><span>✦</span></div>
    </div>
  )
}
