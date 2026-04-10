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
      className={clsx(
        'rounded-xl p-5 glass shadow-card transition-shadow duration-300',
        hover && 'cursor-pointer hover:shadow-card-hover hover:border-border-bright',
        glow === 'gold' && 'hover:shadow-glow-gold',
        glow === 'teal' && 'hover:shadow-glow-teal',
        onClick && 'cursor-pointer',
        className
      )}
    >
      {children}
    </motion.div>
  )
}
