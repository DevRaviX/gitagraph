import { useState } from 'react'
import { motion } from 'framer-motion'
import clsx from 'clsx'

export default function Tabs({ items, defaultIndex = 0 }) {
  const [active, setActive] = useState(defaultIndex)
  const { content } = items[active]

  return (
    <div>
      <div className="flex gap-1 p-1 rounded-xl bg-bg-3 border border-border w-fit mb-5">
        {items.map(({ label, icon: Icon }, i) => (
          <button
            key={i}
            onClick={() => setActive(i)}
            className={clsx(
              'relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg text-sm font-medium',
              'transition-colors duration-200',
              active === i ? 'text-gold' : 'text-ink-2 hover:text-ink-1'
            )}
          >
            {active === i && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 bg-gold-faint border border-gold-dim rounded-lg"
                transition={{ duration: 0.25, ease: 'easeInOut' }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon size={14} />}
              {label}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {content}
      </motion.div>
    </div>
  )
}
