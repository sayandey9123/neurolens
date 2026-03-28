import { useState } from 'react'
import Navbar from './components/Navbar'
import UploadZone from './components/UploadZone'
import AnalysisPanel from './components/AnalysisPanel'
import QuestionPanel from './components/QuestionPanel'
import { motion } from 'framer-motion'
import { Brain, FileText, MessageCircle, Zap } from 'lucide-react'

function HeroStats() {
  const stats = [
    { icon: FileText, label: "File Types", value: "PDF, IMG, TXT" },
    { icon: Brain, label: "AI Model", value: "Llama 3.3 70B" },
    { icon: Zap, label: "Analysis Time", value: "< 5 seconds" },
    { icon: MessageCircle, label: "Q&A", value: "Real-time Stream" },
  ]
  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mb-12">
      {stats.map((stat, i) => (
        <motion.div
          key={i}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2 + i * 0.1 }}
          className="bg-white/3 border border-white/8 rounded-xl p-4 flex items-center gap-3"
        >
          <div className="w-8 h-8 rounded-lg bg-teal-500/10 border border-teal-500/20 flex items-center justify-center shrink-0">
            <stat.icon size={14} className="text-teal-400" />
          </div>
          <div>
            <p className="text-white/30 text-xs">{stat.label}</p>
            <p className="text-white text-xs font-semibold mt-0.5">{stat.value}</p>
          </div>
        </motion.div>
      ))}
    </div>
  )
}

function BackgroundGlow() {
  return (
    <div className="fixed inset-0 pointer-events-none overflow-hidden z-0">
      <div className="absolute top-[-20%] left-[50%] translate-x-[-50%] w-[800px] h-[500px] bg-teal-500/5 rounded-full blur-[120px]" />
      <div className="absolute bottom-[-10%] left-[-10%] w-[400px] h-[400px] bg-cyan-500/5 rounded-full blur-[100px]" />
      <div className="absolute top-[40%] right-[-5%] w-[300px] h-[300px] bg-teal-400/5 rounded-full blur-[80px]" />
    </div>
  )
}

function App() {
  const [uploadedFile, setUploadedFile] = useState(null)
  const [analysisData, setAnalysisData] = useState(null)
  const [isAnalyzing, setIsAnalyzing] = useState(false)

  return (
    <div className="min-h-screen bg-[#080b14] relative">
      <BackgroundGlow />
      <div className="relative z-10">
        <Navbar />
        <main className="max-w-5xl mx-auto px-4 py-12">
          {!uploadedFile && !analysisData && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ duration: 0.5 }}
              className="text-center mb-12"
            >
              <motion.div
                initial={{ scale: 0.8, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                transition={{ duration: 0.5 }}
                className="inline-flex items-center gap-2 bg-teal-500/10 border border-teal-500/20 rounded-full px-4 py-1.5 mb-6"
              >
                <div className="w-1.5 h-1.5 bg-teal-400 rounded-full animate-pulse" />
                <span className="text-teal-300 text-xs font-medium tracking-wide">
                  AI-Powered Document Intelligence
                </span>
              </motion.div>

              <motion.h1
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ delay: 0.1 }}
                className="text-5xl md:text-6xl font-bold text-white mb-4 leading-tight"
              >
                Understand any
                <br />
                <span className="text-transparent bg-clip-text bg-gradient-to-r from-teal-400 to-cyan-400">
                  document instantly
                </span>
              </motion.h1>

              <motion.p
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                transition={{ delay: 0.2 }}
                className="text-white/40 text-lg max-w-xl mx-auto mb-10"
              >
                Upload a PDF, image, or text file and get AI-powered summaries,
                sentiment analysis, key insights, and answers to your questions.
              </motion.p>

              <HeroStats />
            </motion.div>
          )}

          <UploadZone
            uploadedFile={uploadedFile}
            setUploadedFile={setUploadedFile}
            setAnalysisData={setAnalysisData}
            setIsAnalyzing={setIsAnalyzing}
          />

          {(isAnalyzing || analysisData) && (
            <AnalysisPanel
              data={analysisData}
              isLoading={isAnalyzing}
            />
          )}

          {uploadedFile && !isAnalyzing && (
            <QuestionPanel uploadedFile={uploadedFile} />
          )}

          {!uploadedFile && (
            <motion.p
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.6 }}
              className="text-center text-white/20 text-xs mt-8"
            >
              No data stored. Files are processed in memory only.
            </motion.p>
          )}
        </main>
      </div>
    </div>
  )
}

export default App