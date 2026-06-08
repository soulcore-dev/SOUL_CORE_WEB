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

// Last N turns sent to the backend. Backend also caps. Keeping a small
// number keeps the request fast + the DeepSeek prompt cache hot (the
// SYSTEM tokens stay cached as long as they're the prefix).
const HISTORY_CAP = 10

/**
 * Lightweight markdown renderer for assistant replies. Handles only what
 * NEXUS actually emits:
 *  - **bold**
 *  - inline `code`
 *  - autolinked URLs (http/https)
 *  - line breaks
 * Anything else passes through as text.
 */
function renderMarkdown(text: string): React.ReactNode {
  const tokens: React.ReactNode[] = []
  let key = 0

  // Split by URL first (so we don't double-process inside links).
  const urlRegex = /(https?:\/\/[^\s)]+)/g
  const lines = text.split('\n')

  lines.forEach((line, lineIdx) => {
    let lastIndex = 0
    let match: RegExpExecArray | null
    const lineTokens: React.ReactNode[] = []

    urlRegex.lastIndex = 0
    while ((match = urlRegex.exec(line)) !== null) {
      if (match.index > lastIndex) {
        lineTokens.push(formatInline(line.slice(lastIndex, match.index), key++))
      }
      lineTokens.push(
        <a
          key={`url-${key++}`}
          href={match[0]}
          target="_blank"
          rel="noopener noreferrer"
          className="text-soul-purple-light underline hover:text-white"
        >
          {match[0]}
        </a>
      )
      lastIndex = match.index + match[0].length
    }
    if (lastIndex < line.length) {
      lineTokens.push(formatInline(line.slice(lastIndex), key++))
    }
    tokens.push(<span key={`line-${lineIdx}`}>{lineTokens}</span>)
    if (lineIdx < lines.length - 1) tokens.push(<br key={`br-${lineIdx}`} />)
  })

  return <>{tokens}</>
}

function formatInline(text: string, key: number): React.ReactNode {
  // Process **bold** and `code` together — alternating.
  const parts: React.ReactNode[] = []
  const regex = /(\*\*[^*]+\*\*|`[^`]+`)/g
  let lastIndex = 0
  let match: RegExpExecArray | null

  while ((match = regex.exec(text)) !== null) {
    if (match.index > lastIndex) {
      parts.push(text.slice(lastIndex, match.index))
    }
    const token = match[0]
    if (token.startsWith('**')) {
      parts.push(
        <strong key={`b-${key}-${match.index}`}>{token.slice(2, -2)}</strong>
      )
    } else {
      parts.push(
        <code
          key={`c-${key}-${match.index}`}
          className="px-1 py-0.5 bg-soul-dark-lighter rounded text-[11px] font-mono"
        >
          {token.slice(1, -1)}
        </code>
      )
    }
    lastIndex = match.index + token.length
  }
  if (lastIndex < text.length) parts.push(text.slice(lastIndex))
  return <span key={`f-${key}`}>{parts}</span>
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

  // Suggested prompts shown ONLY before the user sends a first message.
  // Drive shy visitors toward high-value questions NEXUS handles best.
  // (Hardcoded in English for now — i18n later: messages/*.json `chat.suggest{1..4}`)
  const suggestedPrompts: string[] = [
    'What services do you offer?',
    'Tell me about cybersecurity',
    'How do I start a project?',
    'Why choose SoulCore?',
  ]

  const userHasMessaged = messages.some((m) => m.role === 'user')

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  const sendMessage = async (text: string) => {
    const trimmed = text.trim()
    if (!trimmed || isLoading) return

    const userMessage: Message = {
      id: Date.now().toString(),
      role: 'user',
      content: trimmed,
    }

    // Compute the history we'll send: everything we have so far PLUS
    // the new user message. Cap at HISTORY_CAP turns.
    const next = [...messages, userMessage]
    const historyForServer = next
      .filter((m) => m.id !== '1') // skip the i18n greeting (it's UI-only)
      .slice(-HISTORY_CAP)
      .map((m) => ({ role: m.role, content: m.content }))

    setMessages(next)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetchAPI<ChatResponse>('/api/chat', {
        method: 'POST',
        body: JSON.stringify({
          messages: historyForServer,
          session_id: sessionId,
        }),
      })

      if (response.session_id) {
        setSessionId(response.session_id)
      }

      const assistantMessage: Message = {
        id: (Date.now() + 1).toString(),
        role: 'assistant',
        content: response.reply,
      }

      setMessages((prev) => [...prev, assistantMessage])
    } catch {
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

  const handleSend = () => sendMessage(input)

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
        <div className="fixed bottom-6 right-6 z-50 w-[min(380px,calc(100vw-3rem))] h-[min(560px,calc(100vh-6rem))] bg-soul-dark-card rounded-2xl shadow-2xl border border-soul-purple/30 flex flex-col overflow-hidden">
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
                  className={`flex items-start space-x-2 max-w-[85%] ${
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
                    <p className="text-sm leading-relaxed">
                      {message.role === 'assistant'
                        ? renderMarkdown(message.content)
                        : message.content}
                    </p>
                  </div>
                </div>
              </div>
            ))}

            {/* Suggested prompts — only before first user message */}
            {!userHasMessaged && !isLoading && (
              <div className="flex flex-wrap gap-2 pt-2">
                {suggestedPrompts.map((prompt) => (
                  <button
                    key={prompt}
                    onClick={() => sendMessage(prompt)}
                    className="px-3 py-1.5 text-xs rounded-full border border-soul-purple/40 text-soul-purple-light hover:bg-soul-purple/10 hover:border-soul-purple transition-colors"
                  >
                    {prompt}
                  </button>
                ))}
              </div>
            )}

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
