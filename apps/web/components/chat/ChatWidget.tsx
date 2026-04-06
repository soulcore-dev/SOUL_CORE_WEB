'use client'

import { useState, useRef, useEffect } from 'react'

import { MessageCircle, X, Send, Bot, User } from 'lucide-react'
import { fetchAPI } from '@/lib/utils'
import { useTranslations } from 'next-intl'

interface Message {
  id: string
  role: 'user' | 'assistant'
  content: string
}

interface ChatResponse {
  reply: string
  session_id: string
}

export function ChatWidget() {
  const t = useTranslations('chat')

  const [isOpen, setIsOpen] = useState(false)
  const [messages, setMessages] = useState<Message[]>([
    {
      id: '1',
      role: 'assistant',
      content: t('greeting'),
    },
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [sessionId, setSessionId] = useState<string | null>(null)
  const messagesEndRef = useRef<HTMLDivElement>(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const handleSend = async () => {
    if (!input.trim() || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: input.trim(),
    }

    setMessages((prev) => [...prev, userMessage])
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetchAPI<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          message: userMessage.content,
          session_id: sessionId
        }),
      })

      // Store session_id for conversation continuity
      if (response.session_id) {
        setSessionId(response.session_id)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch (error) {
      const fallbackMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: t('offline'),
      }
      setMessages((prev) => [...prev, fallbackMessage])
    } finally {
      setIsLoading(false)
    }
  }

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault()
      handleSend()
    }
  }

  return (
    <>
      {/* Chat Button */}
      <button
        
        
        
        whileTap={{ scale: 0.9 }}
        onClick={() => setIsOpen(true)}
        className={`fixed bottom-6 right-6 z-50 w-14 h-14 rounded-full bg-soul-purple shadow-lg flex items-center justify-center glow ${
          isOpen ? 'hidden' : ''
        }`}
        aria-label={t('openChat')}
      >
        <MessageCircle size={24} className="text-white" />
      </button>

      {/* Chat Window */}
      
        {isOpen && (
          <div
            
            
            
            className="fixed bottom-6 right-6 z-50 w-[min(380px,calc(100vw-3rem))] h-[min(500px,calc(100vh-6rem))] bg-soul-dark-card rounded-2xl shadow-2xl border border-soul-purple/30 flex flex-col overflow-hidden"
          >
            {/* Header */}
            <div className="bg-soul-purple px-4 py-3 flex items-center justify-between">
              <div className="flex items-center space-x-3">
                <div className="w-10 h-10 rounded-full bg-white/20 flex items-center justify-center">
                  <Bot size={20} className="text-white" />
                </div>
                <div>
                  <h3 className="text-white font-semibold">NEXUS</h3>
                  <p className="text-white/70 text-xs">{t('assistant')}</p>
                </div>
              </div>
              <button
                onClick={() => setIsOpen(false)}
                className="p-2 hover:bg-white/10 rounded-lg transition-colors"
                aria-label={t('closeChat')}
              >
                <X size={20} className="text-white" />
              </button>
            </div>

            {/* Messages */}
            <div className="flex-1 overflow-y-auto p-4 space-y-4">
              {messages.map((message) => (
                <div
                  key={message.id}
                  className={`flex ${
                    message.role === 'user' ? 'justify-end' : 'justify-start'
                  }`}
                >
                  <div
                    className={`flex items-start space-x-2 max-w-[80%] ${
                      message.role === 'user' ? 'flex-row-reverse space-x-reverse' : ''
                    }`}
                  >
                    <div
                      className={`w-8 h-8 rounded-full flex items-center justify-center flex-shrink-0 ${
                        message.role === 'user'
                          ? 'bg-soul-purple-light'
                          : 'bg-soul-purple'
                      }`}
                    >
                      {message.role === 'user' ? (
                        <User size={16} className="text-white" />
                      ) : (
                        <Bot size={16} className="text-white" />
                      )}
                    </div>
                    <div
                      className={`px-4 py-2 rounded-2xl ${
                        message.role === 'user'
                          ? 'bg-soul-purple text-white'
                          : 'bg-soul-dark-lighter text-gray-200'
                      }`}
                    >
                      <p className="text-sm">{message.content}</p>
                    </div>
                  </div>
                </div>
              ))}
              {isLoading && (
                <div className="flex justify-start">
                  <div className="flex items-center space-x-2">
                    <div className="w-8 h-8 rounded-full bg-soul-purple flex items-center justify-center">
                      <Bot size={16} className="text-white" />
                    </div>
                    <div className="bg-soul-dark-lighter px-4 py-2 rounded-2xl">
                      <div className="flex space-x-1">
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-100" />
                        <div className="w-2 h-2 bg-gray-400 rounded-full animate-bounce delay-200" />
                      </div>
                    </div>
                  </div>
                </div>
              )}
              <div ref={messagesEndRef} />
            </div>

            {/* Input */}
            <div className="p-4 border-t border-gray-800">
              <div className="flex items-center space-x-2">
                <input
                  type="text"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  onKeyDown={handleKeyDown}
                  placeholder={t('placeholder')}
                  className="flex-1 bg-soul-dark-lighter border border-gray-700 rounded-xl px-4 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-soul-purple focus:border-soul-purple transition-colors"
                  disabled={isLoading}
                  aria-label={t('placeholder')}
                />
                <button
                  onClick={handleSend}
                  disabled={!input.trim() || isLoading}
                  className="p-2 bg-soul-purple rounded-xl hover:bg-soul-purple-dark disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
                  aria-label={t('send')}
                >
                  <Send size={18} className="text-white" />
                </button>
              </div>
            </div>
          </div>
        )}
      
    </>
  )
}
