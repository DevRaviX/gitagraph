import { NavLink } from 'react-router-dom'
import { motion, AnimatePresence } from 'framer-motion'
import {
  LayoutDashboard, BookOpen, Share2, Search,
  MessageCircle, CalendarDays, HelpCircle, Brain,
  Sparkles, X
} from 'lucide-react'

const NAV = [
  { to: '/',            icon: LayoutDashboard, label: 'Dashboard',      module: 'M0' },
  { to: '/verses',      icon: BookOpen,        label: 'Verse Browser',  module: 'M2' },
  { to: '/graph',       icon: Share2,          label: 'Knowledge Graph',module: 'M2' },
  { to: '/search',      icon: Search,          label: 'Graph Search',   module: 'M3' },
  { to: '/ask',         icon: MessageCircle,   label: 'Ask the Gītā',   module: 'M4' },
  { to: '/planner',     icon: CalendarDays,    label: 'Study Planner',  module: 'M5' },
  { to: '/uncertainty', icon: HelpCircle,      label: 'Uncertainty',    module: 'M6' },
  { to: '/expert',      icon: Brain,           label: 'Expert System',  module: 'M4' },
]

const sidebarVariants = {
  hidden:  { x: -260, opacity: 0 },
  visible: { x: 0, opacity: 1, transition: { duration: 0.3, ease: 'easeOut' } },
  exit:    { x: -260, opacity: 0, transition: { duration: 0.2 } },
}

const itemVariants = {
  hidden:  { x: -20, opacity: 0 },
  visible: (i) => ({ x: 0, opacity: 1, transition: { delay: i * 0.05 + 0.1, duration: 0.3 } }),
}

export default function Sidebar({ onClose }) {
  return (
    <motion.aside
      variants={sidebarVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      className="w-[220px] shrink-0 flex flex-col border-r border-border bg-bg-2 z-20 relative h-full"
    >
      {/* Logo */}
      <div className="px-5 pt-6 pb-5 border-b border-border flex items-center justify-between">
        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gold-faint border border-gold-dim flex items-center justify-center">
            <Sparkles size={15} className="text-gold" />
          </div>
          <div>
            <h1 className="font-cinzel font-bold text-base shimmer-text leading-tight">
              GitaGraph
            </h1>
            <p className="text-ink-3 text-[10px] tracking-widest uppercase mt-0.5">
              Digital Bhaṣya 2.0
            </p>
          </div>
        </div>
        {/* Close button — mobile only */}
        {onClose && (
          <button
            onClick={onClose}
            className="md:hidden text-ink-3 hover:text-ink-1 transition-colors ml-2"
            aria-label="Close sidebar"
          >
            <X size={16} />
          </button>
        )}
      </div>

      {/* Nav */}
      <nav className="flex-1 px-3 py-4 space-y-0.5 overflow-y-auto">
        <p className="label px-2 mb-3">Navigation</p>
        {NAV.map(({ to, icon: Icon, label, module }, i) => (
          <motion.div key={to} custom={i} variants={itemVariants} initial="hidden" animate="visible">
            <NavLink
              to={to}
              end={to === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                `nav-item group ${isActive ? 'active' : ''}`
              }
            >
              <Icon size={15} className="shrink-0" />
              <span className="flex-1 truncate">{label}</span>
              <span className="text-[10px] font-mono text-ink-3 group-[.active]:text-gold-dim">
                {module}
              </span>
            </NavLink>
          </motion.div>
        ))}
      </nav>

      {/* Footer */}
      <div className="px-5 py-4 border-t border-border">
        <p className="text-ink-3 text-[10px] leading-relaxed">
          NIT Kurukshetra<br />
          <span className="text-gold-dim">MCA Semester 4 · 2024</span>
        </p>
      </div>
    </motion.aside>
  )
}
