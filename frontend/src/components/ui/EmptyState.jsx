import { motion } from 'framer-motion'
import { SearchX } from 'lucide-react'

export default function EmptyState({ icon: Icon = SearchX, title = 'Nothing here yet', description }) {
  return (
    <motion.div
      initial={{ opacity: 0 }} animate={{ opacity: 1 }}
      className="flex flex-col items-center justify-center py-16 text-center"
    >
      <div className="w-14 h-14 rounded-2xl bg-bg-4 border border-border flex items-center justify-center mb-4">
        <Icon size={22} className="text-ink-3" />
      </div>
      <p className="text-ink-1 font-medium">{title}</p>
      {description && <p className="text-ink-2 text-sm mt-1 max-w-xs">{description}</p>}
    </motion.div>
  )
}
