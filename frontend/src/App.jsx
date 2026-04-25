import { Routes, Route, Navigate } from 'react-router-dom'
import { AnimatePresence } from 'framer-motion'
import { useLocation } from 'react-router-dom'
import { useState } from 'react'
import { Menu } from 'lucide-react'
import Sidebar from './components/layout/Sidebar'
import PageTransition from './components/layout/PageTransition'
import Home        from './pages/Home'
import Verses      from './pages/Verses'
import Graph       from './pages/Graph'
import Search      from './pages/Search'
import Ask         from './pages/Ask'
import Planner     from './pages/Planner'
import Uncertainty from './pages/Uncertainty'
import Expert      from './pages/Expert'

export default function App() {
  const location = useLocation()
  const [sidebarOpen, setSidebarOpen] = useState(false)

  return (
    <div className="flex h-screen w-screen overflow-hidden bg-bg-1">
      {/* Candleflame ambient glows */}
      <div className="pointer-events-none fixed inset-0 overflow-hidden z-0">
        <div className="absolute -top-24 -left-24 w-[28rem] h-[28rem] rounded-full bg-gold/[0.07] blur-[80px] animate-aurora" />
        <div className="absolute -bottom-16 -right-16 w-80 h-80 rounded-full bg-saffron/[0.06] blur-[60px] animate-aurora [animation-delay:3s]" />
        <div className="absolute top-1/3 right-1/4 w-56 h-56 rounded-full bg-gold/[0.04] blur-[50px] animate-aurora [animation-delay:5s]" />
        {/* Vignette overlay — deepen the corners like aged parchment */}
        <div className="absolute inset-0" style={{background:'radial-gradient(ellipse at center, transparent 45%, rgba(5,3,1,0.55) 100%)'}} />
      </div>

      {/* Desktop sidebar — always visible on md+ */}
      <div className="hidden md:flex">
        <Sidebar />
      </div>

      {/* Mobile sidebar overlay */}
      <AnimatePresence>
        {sidebarOpen && (
          <>
            {/* Backdrop */}
            <div
              className="fixed inset-0 bg-black/50 z-30 md:hidden"
              onClick={() => setSidebarOpen(false)}
            />
            {/* Drawer */}
            <div className="fixed left-0 top-0 bottom-0 z-40 md:hidden">
              <Sidebar onClose={() => setSidebarOpen(false)} />
            </div>
          </>
        )}
      </AnimatePresence>

      <main className="flex-1 overflow-y-auto relative z-10 flex flex-col">
        {/* Mobile top bar */}
        <div className="md:hidden flex items-center gap-3 px-4 py-3 border-b border-border bg-bg-2/80 backdrop-blur-sm sticky top-0 z-20">
          <button
            onClick={() => setSidebarOpen(true)}
            className="text-ink-2 hover:text-ink-1 transition-colors"
            aria-label="Open menu"
          >
            <Menu size={20} />
          </button>
          <span className="font-cinzel font-bold text-sm shimmer-text">GitaGraph</span>
        </div>

        <AnimatePresence mode="wait">
          <Routes location={location} key={location.pathname}>
            <Route path="/"            element={<PageTransition><Home /></PageTransition>} />
            <Route path="/verses"      element={<PageTransition><Verses /></PageTransition>} />
            <Route path="/graph"       element={<PageTransition><Graph /></PageTransition>} />
            <Route path="/search"      element={<PageTransition><Search /></PageTransition>} />
            <Route path="/ask"         element={<PageTransition><Ask /></PageTransition>} />
            <Route path="/planner"     element={<PageTransition><Planner /></PageTransition>} />
            <Route path="/uncertainty" element={<PageTransition><Uncertainty /></PageTransition>} />
            <Route path="/expert"      element={<PageTransition><Expert /></PageTransition>} />
            <Route path="*"            element={<Navigate to="/" replace />} />
          </Routes>
        </AnimatePresence>
      </main>
    </div>
  )
}
