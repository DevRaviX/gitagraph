import { useState } from 'react'
import { motion } from 'framer-motion'

export default function Tabs({ items, defaultIndex = 0 }) {
  const [active, setActive] = useState(defaultIndex)
  const { content } = items[active]

  return (
    <div>
      {/* Tab bar — manuscript chapter style */}
      <div className="flex gap-0.5 p-1 rounded-xl w-fit mb-6"
        style={{
          background: 'rgba(18,13,9,0.85)',
          border: '1px solid rgba(61,46,30,0.9)',
          boxShadow: 'inset 0 1px 0 rgba(255,241,195,0.03)',
        }}>
        {items.map(({ label, icon: Icon }, i) => (
          <button key={i} onClick={() => setActive(i)}
            className="relative flex items-center gap-1.5 px-4 py-1.5 rounded-lg transition-colors duration-200"
            style={{
              color: active === i ? '#f0d8a0' : 'rgba(122,96,64,0.75)',
              fontSize: '0.72rem',
              fontFamily: 'Cinzel, serif',
              fontWeight: 600,
              letterSpacing: '0.10em',
              textTransform: 'uppercase',
            }}>
            {active === i && (
              <motion.div
                layoutId="tab-pill"
                className="absolute inset-0 rounded-lg"
                style={{
                  background: 'linear-gradient(135deg, rgba(201,168,76,0.16), rgba(201,168,76,0.06))',
                  border: '1px solid rgba(201,168,76,0.30)',
                  boxShadow: '0 2px 10px rgba(201,168,76,0.08)',
                }}
                transition={{ duration: 0.22, ease: 'easeInOut' }}
              />
            )}
            <span className="relative z-10 flex items-center gap-1.5">
              {Icon && <Icon size={13} style={{ color: active === i ? '#C9A84C' : 'rgba(138,110,42,0.65)' }} />}
              {label}
            </span>
          </button>
        ))}
      </div>

      <motion.div
        key={active}
        initial={{ opacity: 0, y: 8 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.25 }}
      >
        {content}
      </motion.div>
    </div>
  )
}
