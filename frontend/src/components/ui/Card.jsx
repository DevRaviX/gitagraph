import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Card({ children, className, hover = true, glow, delay = 0, onClick }) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 16 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.35, delay, ease: [0.22, 1, 0.36, 1] }}
      whileHover={hover ? { y: -2, transition: { duration: 0.2 } } : undefined}
      onClick={onClick}
      className={clsx('parchment-card p-5 transition-shadow duration-300', onClick && 'cursor-pointer', className)}
      style={hover ? {
        '--hover-shadow': glow === 'gold'
          ? '0 0 28px rgba(201,168,76,0.22), 0 0 60px rgba(201,168,76,0.08)'
          : glow === 'teal'
          ? '0 0 20px rgba(74,158,122,0.2)'
          : '0 8px 40px rgba(0,0,0,0.55), 0 0 0 1px rgba(201,168,76,0.20)',
      } : undefined}
    >
      {children}
    </motion.div>
  )
}
