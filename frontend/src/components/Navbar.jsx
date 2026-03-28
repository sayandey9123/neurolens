import { motion } from 'framer-motion'
import { Brain, Zap } from 'lucide-react'

function Navbar() {
  return (
    <motion.nav
      initial={{ y: -60, opacity: 0 }}
      animate={{ y: 0, opacity: 1 }}
      transition={{ duration: 0.6, ease: 'easeOut' }}
      className="border-b border-white/5 sticky top-0 z-50 bg-[#080b14]/90 backdrop-blur-md"
    >
      <div className="max-w-5xl mx-auto px-4 py-3 flex items-center justify-between">

        <div className="flex items-center gap-2.5">
          <div className="w-8 h-8 rounded-lg bg-gradient-to-br from-teal-400 to-cyan-600 flex items-center justify-center shadow-lg shadow-teal-500/20">
            <Brain size={16} className="text-white" />
          </div>
          <div>
            <h1 className="text-white font-bold text-lg leading-none">
              Neuro<span className="text-teal-400">Lens</span>
            </h1>
            <p className="text-white/25 text-[10px] uppercase tracking-widest hidden sm:block">
              Document Intelligence
            </p>
          </div>
        </div>

        <div className="hidden md:flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1">
          <Zap size={11} className="text-teal-400" />
          <span className="text-teal-300 text-xs font-medium">
            Powered by Groq AI
          </span>
        </div>

        <div className="flex items-center gap-2">
          <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
          <span className="text-white/30 text-xs">Live</span>
        </div>

      </div>
    </motion.nav>
  )
}

export default Navbar