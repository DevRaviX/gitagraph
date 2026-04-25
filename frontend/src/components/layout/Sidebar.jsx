import { NavLink } from 'react-router-dom'
import { motion } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Share2, Search,
  MessageCircle, CalendarDays, HelpCircle, Brain, X
} from 'lucide-react'

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard',       module: 'M0' },
  { to: '/verses',      icon: BookOpen,        label: 'Verse Browser',   module: 'M2' },
  { to: '/graph',       icon: Share2,          label: 'Knowledge Graph', module: 'M2' },
  { to: '/search',      icon: Search,          label: 'Graph Search',    module: 'M3' },
  { to: '/ask',         icon: MessageCircle,   label: 'Ask the Gītā',    module: 'M4' },
  { to: '/planner',     icon: CalendarDays,    label: 'Study Planner',   module: 'M5' },
  { to: '/uncertainty', icon: HelpCircle,      label: 'Uncertainty',     module: 'M6' },
  { to: '/expert',      icon: Brain,           label: 'Expert System',   module: 'M4' },
]

const sidebarVariants = {
  hidden:  { x: -260, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { x: -260, opacity: 0, transition: { duration: 0.2 } },
}

const itemVariants = {
  hidden:  { x: -16, opacity: 0 },
  visible: (i) => ({ x: 0, opacity: 1, transition: { delay: i * 0.05 + 0.1, duration: 0.3 } }),
}

/* Raven silhouette SVG — inline for zero-dependency */
function RavenSigil({ className = '' }) {
  return (
    <svg viewBox="0 0 64 48" className={className} fill="currentColor" aria-hidden>
      <path d="M32 4 C28 4 22 8 18 14 C14 20 12 28 14 34 C10 32 6 30 4 32 C8 34 12 38 16 40
               C18 44 22 46 26 46 C28 46 30 44 30 42 C30 40 28 38 26 38 C24 38 22 40 22 40
               C20 38 18 34 20 30 C22 26 26 24 28 22 C26 26 24 30 26 34 C28 36 32 36 34 34
               C36 32 36 28 34 24 C38 22 44 20 48 16 C52 12 54 8 52 6
               C50 4 46 6 44 10 C42 14 42 18 40 20 C38 16 36 10 32 4 Z
               M48 8 C50 8 52 10 50 12 C48 14 44 14 42 12 C44 10 46 8 48 8 Z" />
    </svg>
  )
}

export default function Sidebar({ onClose }) {
  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-[220px] shrink-0 flex flex-col z-20 relative h-full"
      style={{
        background: 'linear-gradient(180deg, #1a1008 0%, #120d07 60%, #0e0b05 100%)',
        borderRight: '1px solid rgba(201,168,76,0.18)',
        boxShadow: '4px 0 32px rgba(0,0,0,0.55), inset -1px 0 0 rgba(201,168,76,0.06)',
      }}
    >
      {/* Subtle wood-grain texture overlay */}
      <div className="absolute inset-0 pointer-events-none opacity-[0.03]"
        style={{
          backgroundImage: 'repeating-linear-gradient(92deg, transparent, transparent 3px, rgba(201,168,76,1) 3px, rgba(201,168,76,1) 4px)',
        }}
      />

      {/* Logo / Header */}
      <div className="relative px-5 pt-6 pb-5 flex items-center justify-between"
        style={{ borderBottom: '1px solid rgba(201,168,76,0.14)' }}
      >
        {/* Candle glow behind logo */}
        <div className="absolute top-0 left-0 w-full h-20 pointer-events-none"
          style={{ background: 'radial-gradient(ellipse at 50% 0%, rgba(201,168,76,0.10) 0%, transparent 70%)' }}
        />

        <div className="relative flex items-center gap-3">
          {/* Raven sigil in logo area */}
          <div className="relative w-9 h-9 flex items-center justify-center">
            <div className="absolute inset-0 rounded-lg"
              style={{
                background: 'linear-gradient(135deg, rgba(201,168,76,0.15), rgba(201,168,76,0.04))',
                border: '1px solid rgba(201,168,76,0.30)',
                boxShadow: '0 0 14px rgba(201,168,76,0.12)',
              }}
            />
            <RavenSigil className="relative w-5 h-5 text-gold" />
          </div>

          <div>
            <h1 className="font-cinzel font-bold text-[15px] shimmer-text leading-tight tracking-wide">
              GitaGraph
            </h1>
            <p className="text-[9.5px] tracking-[0.22em] uppercase mt-0.5"
              style={{ color: 'rgba(138,110,42,0.9)' }}>
              Digital Bhaṣya 2.0
            </p>
          </div>
        </div>

        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden transition-colors ml-1"
            style={{ color: 'rgba(196,169,122,0.6)' }}
            aria-label="Close sidebar"
          >
            <X size={15} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-2.5 py-4 space-y-0.5 overflow-y-auto">
        <p className="px-3 mb-3 text-[10px] font-semibold uppercase tracking-[0.22em]"
          style={{ color: 'rgba(122,96,64,0.85)' }}>
          Scrolls
        </p>

        {NAV.map(({ to, icon: Icon, label, module }, i) => (
          <motion.div key={to} custom={i} variants={itemVariants} initial="hidden" animate="visible">
            <NavLink
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `group flex items-center gap-3 px-3 py-2.5 rounded-lg cursor-pointer text-sm font-medium transition-all duration-200 ${isActive ? 'nav-active' : 'nav-idle'}`
              }
              style={({ isActive }) => isActive ? {
                background: 'linear-gradient(90deg, rgba(201,168,76,0.14), rgba(201,168,76,0.05))',
                borderLeft: '2px solid rgba(201,168,76,0.75)',
                paddingLeft: '10px',
                color: '#f0d8a0',
                boxShadow: 'inset 0 1px 0 rgba(255,241,195,0.04)',
              } : {
                color: 'rgba(196,169,122,0.72)',
                borderLeft: '2px solid transparent',
              }}
            >
              {({ isActive }) => (
                <>
                  <Icon size={14} className="shrink-0" style={{ color: isActive ? '#C9A84C' : 'rgba(138,110,42,0.75)' }} />
                  <span className="flex-1 truncate font-fell text-[13px]">{label}</span>
                  <span className="text-[9px] font-mono" style={{ color: isActive ? 'rgba(201,168,76,0.55)' : 'rgba(90,70,45,0.7)' }}>
                    {module}
                  </span>
                </>
              )}
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Knotwork separator */}
      <div className="mx-4 mb-2 knotwork-rule">
        <span>✦</span>
      </div>

      {/* Footer */}
      <div className="px-5 py-4" style={{ borderTop: '1px solid rgba(201,168,76,0.10)' }}>
        {/* Tiny raven silhouette */}
        <RavenSigil className="w-6 h-4 mb-2 opacity-20 text-gold" />
        <p className="text-[10px] leading-relaxed" style={{ color: 'rgba(122,96,64,0.75)' }}>
          NIT Kurukshetra<br />
          <span style={{ color: 'rgba(138,110,42,0.65)' }}>MCA Semester 4 · 2024</span>
        </p>
      </div>
    </motion.aside>
  )
}
