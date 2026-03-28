import { motion } from 'framer-motion'
import {
  FileText, Brain, TrendingUp, Tag,
  Clock, Globe, Zap, BookOpen, Lightbulb,
  Download, Copy, Check
} from 'lucide-react'
import { useState } from 'react'

function AnalysisPanel({ data, isLoading }) {
  const [copied, setCopied] = useState(false)

  const handleCopy = () => {
    navigator.clipboard.writeText(JSON.stringify(data, null, 2))
    setCopied(true)
    setTimeout(() => setCopied(false), 2000)
  }

  const handleDownload = () => {
    const blob = new Blob([JSON.stringify(data, null, 2)], { type: 'application/json' })
    const url = URL.createObjectURL(blob)
    const a = document.createElement('a')
    a.href = url
    a.download = 'neurolens-analysis.json'
    a.click()
    URL.revokeObjectURL(url)
  }

  if (isLoading) {
    return (
      <motion.div
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        className="mb-10"
      >
        <div className="flex items-center gap-3 mb-6">
          <div className="w-5 h-5 rounded-full border-2 border-teal-400 border-t-transparent animate-spin" />
          <span className="text-white/50 text-sm">Analyzing document with AI...</span>
        </div>
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">
          {[...Array(4)].map((_, i) => (
            <div key={i} className="h-32 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
          ))}
        </div>
        <div className="h-40 rounded-2xl bg-white/5 border border-white/5 animate-pulse mb-4" />
        <div className="grid grid-cols-2 gap-4">
          <div className="h-40 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
          <div className="h-40 rounded-2xl bg-white/5 border border-white/5 animate-pulse" />
        </div>
      </motion.div>
    )
  }

  if (!data) return null

  const sentimentColor = {
    Positive: 'text-green-400 bg-green-500/10 border-green-500/20',
    Negative: 'text-red-400 bg-red-500/10 border-red-500/20',
    Neutral: 'text-blue-400 bg-blue-500/10 border-blue-500/20',
    Mixed: 'text-yellow-400 bg-yellow-500/10 border-yellow-500/20',
  }

  const complexityColor = {
    Simple: 'text-green-400',
    Moderate: 'text-yellow-400',
    Complex: 'text-red-400',
  }

  const scorePercent = Math.round(Math.abs(parseFloat(data.sentiment_score) || 0) * 100)

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-10"
    >
      {/* Header */}
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center gap-2">
          <Brain size={18} className="text-teal-400" />
          <h3 className="text-white font-semibold text-lg">AI Analysis Results</h3>
          <div className="flex-1 h-px bg-white/5 ml-2" />
        </div>
        <div className="flex items-center gap-2">
          <button
            onClick={handleCopy}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-white/5 border border-white/10 hover:bg-white/10 transition-all duration-200 text-xs text-white/50 hover:text-white"
          >
            {copied ? <Check size={12} className="text-teal-400" /> : <Copy size={12} />}
            {copied ? 'Copied!' : 'Copy JSON'}
          </button>
          <button
            onClick={handleDownload}
            className="flex items-center gap-2 px-3 py-1.5 rounded-lg bg-teal-500/10 border border-teal-500/20 hover:bg-teal-500/20 transition-all duration-200 text-xs text-teal-400"
          >
            <Download size={12} />
            Export
          </button>
        </div>
      </div>

      {/* Top Stats Grid */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-4">

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.1 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <TrendingUp size={14} className="text-white/40" />
            <span className="text-white/40 text-xs uppercase tracking-wider">Sentiment</span>
          </div>
          <div className={`inline-flex items-center gap-1.5 px-3 py-1 rounded-full border text-sm font-medium ${sentimentColor[data.sentiment] || sentimentColor['Neutral']}`}>
            {data.sentiment}
          </div>
          <div className="mt-3">
            <div className="flex justify-between text-xs text-white/30 mb-1">
              <span>Score</span>
              <span>{scorePercent}%</span>
            </div>
            <div className="h-1.5 bg-white/5 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${scorePercent}%` }}
                transition={{ duration: 1, delay: 0.3 }}
                className="h-full bg-teal-400 rounded-full"
              />
            </div>
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Tag size={14} className="text-white/40" />
            <span className="text-white/40 text-xs uppercase tracking-wider">Category</span>
          </div>
          <p className="text-white font-semibold text-lg">{data.classification}</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Clock size={14} className="text-white/40" />
            <span className="text-white/40 text-xs uppercase tracking-wider">Reading Time</span>
          </div>
          <p className="text-white font-semibold text-lg">{data.reading_time}</p>
          <p className="text-white/30 text-xs mt-1">{data.word_count} words</p>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-4"
        >
          <div className="flex items-center gap-2 mb-3">
            <Zap size={14} className="text-white/40" />
            <span className="text-white/40 text-xs uppercase tracking-wider">Complexity</span>
          </div>
          <p className={`font-semibold text-lg ${complexityColor[data.complexity] || 'text-white'}`}>
            {data.complexity}
          </p>
          <div className="flex items-center gap-1 mt-2">
            <Globe size={10} className="text-white/20" />
            <span className="text-white/30 text-xs">{data.language}</span>
          </div>
        </motion.div>
      </div>

      {/* Summary */}
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.5 }}
        className="bg-white/5 border border-white/10 rounded-2xl p-5 mb-4"
      >
        <div className="flex items-center gap-2 mb-3">
          <FileText size={14} className="text-teal-400" />
          <span className="text-white/60 text-xs uppercase tracking-wider">Summary</span>
        </div>
        <p className="text-white/80 leading-relaxed">{data.summary}</p>
      </motion.div>

      {/* Key Topics + Key Insights */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.6 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <BookOpen size={14} className="text-teal-400" />
            <span className="text-white/60 text-xs uppercase tracking-wider">Key Topics</span>
          </div>
          <div className="flex flex-wrap gap-2">
            {(data.key_topics || []).map((topic, i) => (
              <span
                key={i}
                className="text-xs text-teal-300 bg-teal-500/10 border border-teal-500/20 rounded-full px-3 py-1"
              >
                {topic}
              </span>
            ))}
          </div>
        </motion.div>

        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.7 }}
          className="bg-white/5 border border-white/10 rounded-2xl p-5"
        >
          <div className="flex items-center gap-2 mb-4">
            <Lightbulb size={14} className="text-teal-400" />
            <span className="text-white/60 text-xs uppercase tracking-wider">Key Insights</span>
          </div>
          <ul className="space-y-2">
            {(data.key_insights || []).map((insight, i) => (
              <li key={i} className="flex items-start gap-2">
                <div className="w-1.5 h-1.5 rounded-full bg-teal-400 mt-1.5 shrink-0" />
                <span className="text-white/60 text-sm">{insight}</span>
              </li>
            ))}
          </ul>
        </motion.div>
      </div>
    </motion.div>
  )
}

export default AnalysisPanel