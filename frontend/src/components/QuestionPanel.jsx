import { useState, useRef, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { MessageCircle, Send, User, Bot, Loader } from 'lucide-react'
import axios from 'axios'

function QuestionPanel({ uploadedFile }) {
  const [question, setQuestion] = useState('')
  const [messages, setMessages] = useState([])
  const [isLoading, setIsLoading] = useState(false)
  const messagesEndRef = useRef(null)

  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  const askQuestion = async () => {
    if (!question.trim() || isLoading) return

    const userMessage = { role: 'user', text: question }
    setMessages((prev) => [...prev, userMessage])
    setQuestion('')
    setIsLoading(true)

    const formData = new FormData()
    formData.append('file', uploadedFile)
    formData.append('question', question)

    try {
      const res = await fetch(
        `http://localhost:8000/ask?question=${encodeURIComponent(question)}`,
        {
          method: 'POST',
          body: formData,
        }
      )

      const reader = res.body.getReader()
      const decoder = new TextDecoder()
      let aiText = ''

      setMessages((prev) => [...prev, { role: 'ai', text: '' }])

      while (true) {
        const { done, value } = await reader.read()
        if (done) break
        aiText += decoder.decode(value)
        setMessages((prev) => {
          const updated = [...prev]
          updated[updated.length - 1] = { role: 'ai', text: aiText }
          return updated
        })
      }
    } catch (err) {
      setMessages((prev) => [
        ...prev,
        { role: 'ai', text: 'Sorry, something went wrong. Make sure the backend is running.' },
      ])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      askQuestion()
    }
  }

  return (
    <motion.div
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.6 }}
      className="mb-10"
    >
      <div className="flex items-center gap-2 mb-6">
        <MessageCircle size={18} className="text-teal-400" />
        <h3 className="text-white font-semibold text-lg">Ask About Your Document</h3>
        <div className="flex-1 h-px bg-white/5 ml-2" />
      </div>

      {/* Messages */}
      <div className="bg-white/3 border border-white/10 rounded-2xl p-4 mb-4 min-h-[200px] max-h-[400px] overflow-y-auto">
        {messages.length === 0 ? (
          <div className="h-full flex flex-col items-center justify-center py-10 gap-3">
            <div className="w-12 h-12 rounded-2xl bg-teal-500/10 border border-teal-500/20 flex items-center justify-center">
              <Bot size={20} className="text-teal-400" />
            </div>
            <p className="text-white/30 text-sm text-center">
              Ask anything about your document.
              <br />
              I will answer based on its contents.
            </p>
            <div className="flex flex-wrap gap-2 justify-center mt-2">
              {[
                'Summarize this document',
                'What are the main points?',
                'Who is the author?',
                'What conclusions are drawn?',
              ].map((suggestion) => (
                <button
                  key={suggestion}
                  onClick={() => setQuestion(suggestion)}
                  className="text-xs text-teal-400/70 border border-teal-500/20 rounded-full px-3 py-1 hover:bg-teal-500/10 transition-all duration-200"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <AnimatePresence>
              {messages.map((msg, i) => (
                <motion.div
                  key={i}
                  initial={{ opacity: 0, y: 10 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ duration: 0.3 }}
                  className={`flex gap-3 ${msg.role === 'user' ? 'justify-end' : 'justify-start'}`}
                >
                  {msg.role === 'ai' && (
                    <div className="w-7 h-7 rounded-lg bg-teal-500/20 border border-teal-500/30 flex items-center justify-center shrink-0 mt-0.5">
                      <Bot size={13} className="text-teal-400" />
                    </div>
                  )}
                  <div
                    className={`max-w-[80%] rounded-2xl px-4 py-3 text-sm leading-relaxed ${
                      msg.role === 'user'
                        ? 'bg-teal-500/20 border border-teal-500/30 text-teal-100'
                        : 'bg-white/5 border border-white/10 text-white/80'
                    }`}
                  >
                    {msg.text || (
                      <span className="flex items-center gap-2 text-white/30">
                        <Loader size={12} className="animate-spin" />
                        Thinking...
                      </span>
                    )}
                  </div>
                  {msg.role === 'user' && (
                    <div className="w-7 h-7 rounded-lg bg-white/10 border border-white/20 flex items-center justify-center shrink-0 mt-0.5">
                      <User size={13} className="text-white/60" />
                    </div>
                  )}
                </motion.div>
              ))}
            </AnimatePresence>
            <div ref={messagesEndRef} />
          </div>
        )}
      </div>

      {/* Input */}
      <div className="flex gap-3">
        <input
          type="text"
          value={question}
          onChange={(e) => setQuestion(e.target.value)}
          onKeyDown={handleKeyDown}
          placeholder="Ask a question about your document..."
          className="flex-1 bg-white/5 border border-white/10 rounded-xl px-4 py-3 text-white/80 text-sm placeholder-white/20 focus:outline-none focus:border-teal-500/50 focus:bg-teal-500/5 transition-all duration-200"
        />
        <button
          onClick={askQuestion}
          disabled={!question.trim() || isLoading}
          className="w-12 h-12 rounded-xl bg-teal-500 hover:bg-teal-400 disabled:bg-white/5 disabled:border disabled:border-white/10 flex items-center justify-center transition-all duration-200 shrink-0"
        >
          {isLoading ? (
            <Loader size={16} className="text-white animate-spin" />
          ) : (
            <Send size={16} className="text-white" />
          )}
        </button>
      </div>
    </motion.div>
  )
}

export default QuestionPanel