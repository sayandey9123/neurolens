import { useState, useRef } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { Upload, FileText, Image, File, X, Zap } from 'lucide-react'
import axios from 'axios'

function UploadZone({ uploadedFile, setUploadedFile, setAnalysisData, setIsAnalyzing }) {
  const [error, setError] = useState(null)
  const [isDragActive, setIsDragActive] = useState(false)
  const inputRef = useRef(null)

  const handleFile = (file) => {
    if (!file) return
    const allowed = ['application/pdf', 'image/png', 'image/jpeg', 'image/webp', 'text/plain']
    if (!allowed.includes(file.type)) {
      setError('Unsupported file type. Please upload PDF, PNG, JPG, or TXT.')
      return
    }
    if (file.size > 10 * 1024 * 1024) {
      setError('File too large. Maximum size is 10MB.')
      return
    }
    setError(null)
    setUploadedFile(file)
    setAnalysisData(null)
    analyzeFile(file)
  }

  const analyzeFile = async (file) => {
    setIsAnalyzing(true)
    setAnalysisData(null)
    const formData = new FormData()
    formData.append('file', file)
    try {
      const res = await axios.post('http://localhost:8000/analyze', formData, {
        headers: { 'Content-Type': 'multipart/form-data' },
      })
      setAnalysisData(res.data)
    } catch (err) {
      setError('Analysis failed. Make sure the backend is running.')
    } finally {
      setIsAnalyzing(false)
    }
  }

  const removeFile = () => {
    setUploadedFile(null)
    setAnalysisData(null)
    setError(null)
  }

  const onDragOver = (e) => {
    e.preventDefault()
    setIsDragActive(true)
  }

  const onDragLeave = () => setIsDragActive(false)

  const onDrop = (e) => {
    e.preventDefault()
    setIsDragActive(false)
    const file = e.dataTransfer.files[0]
    handleFile(file)
  }

  const onInputChange = (e) => {
    const file = e.target.files[0]
    handleFile(file)
  }

  const getFileIcon = (file) => {
    if (!file) return null
    if (file.type === 'application/pdf') return <FileText size={20} className="text-teal-400" />
    if (file.type.startsWith('image/')) return <Image size={20} className="text-teal-400" />
    return <File size={20} className="text-teal-400" />
  }

  const formatSize = (bytes) => {
    if (bytes < 1024) return bytes + ' B'
    if (bytes < 1024 * 1024) return (bytes / 1024).toFixed(1) + ' KB'
    return (bytes / (1024 * 1024)).toFixed(1) + ' MB'
  }

  return (
    <div className="mb-10">
      <motion.div
        initial={{ opacity: 0, y: 30 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.6 }}
        className="text-center mb-10"
      >
        <h2 className="text-4xl font-bold text-white mb-3">
          Drop your document,{' '}
          <span className="text-teal-400">get instant insights</span>
        </h2>
        <p className="text-white/40 text-lg">
          PDF, image, or text — our AI reads, understands, and explains everything
        </p>
      </motion.div>

      <AnimatePresence mode="wait">
        {!uploadedFile ? (
          <motion.div
            key="dropzone"
            initial={{ opacity: 0, scale: 0.97 }}
            animate={{ opacity: 1, scale: 1 }}
            exit={{ opacity: 0, scale: 0.97 }}
            transition={{ duration: 0.3 }}
            onDragOver={onDragOver}
            onDragLeave={onDragLeave}
            onDrop={onDrop}
            onClick={() => inputRef.current.click()}
            className={`relative border-2 border-dashed rounded-2xl p-16 text-center cursor-pointer transition-all duration-300 ${
              isDragActive
                ? 'border-teal-400 bg-teal-500/10'
                : 'border-white/10 hover:border-teal-500/50 hover:bg-teal-500/5'
            }`}
          >
            <input
              ref={inputRef}
              type="file"
              accept=".pdf,.png,.jpg,.jpeg,.webp,.txt"
              onChange={onInputChange}
              className="hidden"
            />
            <div className="flex flex-col items-center gap-4">
              <div className={`w-16 h-16 rounded-2xl flex items-center justify-center transition-all duration-300 ${
                isDragActive ? 'bg-teal-400/20' : 'bg-white/5'
              }`}>
                <Upload size={28} className={isDragActive ? 'text-teal-400' : 'text-white/30'} />
              </div>
              <div>
                <p className="text-white/70 text-lg font-medium mb-1">
                  {isDragActive ? 'Drop it here!' : 'Drag and drop your document'}
                </p>
                <p className="text-white/30 text-sm">
                  or click to browse — PDF, PNG, JPG, TXT up to 10MB
                </p>
              </div>
              <div className="flex items-center gap-3 mt-2">
                {['PDF', 'PNG', 'JPG', 'TXT'].map((type) => (
                  <span
                    key={type}
                    className="text-xs text-teal-400/60 border border-teal-500/20 rounded-full px-3 py-1"
                  >
                    {type}
                  </span>
                ))}
              </div>
            </div>
          </motion.div>
        ) : (
          <motion.div
            key="filebox"
            initial={{ opacity: 0, y: 10 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -10 }}
            transition={{ duration: 0.3 }}
            className="bg-white/5 border border-white/10 rounded-2xl p-5 flex items-center justify-between"
          >
            <div className="flex items-center gap-4">
              <div className="w-10 h-10 rounded-xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
                {getFileIcon(uploadedFile)}
              </div>
              <div>
                <p className="text-white font-medium text-sm">{uploadedFile.name}</p>
                <p className="text-white/30 text-xs mt-0.5">{formatSize(uploadedFile.size)}</p>
              </div>
            </div>
            <div className="flex items-center gap-3">
              <div className="flex items-center gap-2 text-teal-400 text-xs">
                <Zap size={12} />
                <span>Analyzing...</span>
              </div>
              <button
                onClick={removeFile}
                className="w-8 h-8 rounded-lg bg-white/5 hover:bg-red-500/20 border border-white/10 hover:border-red-500/30 flex items-center justify-center transition-all duration-200"
              >
                <X size={14} className="text-white/40" />
              </button>
            </div>
          </motion.div>
        )}
      </AnimatePresence>

      {error && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="mt-4 p-4 bg-red-500/10 border border-red-500/20 rounded-xl text-red-400 text-sm text-center"
        >
          {error}
        </motion.div>
      )}
    </div>
  )
}

export default UploadZone