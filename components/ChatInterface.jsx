'use client'

import { useState, useEffect, useRef } from 'react'
import { detectCurrentStep } from '@/lib/chatFlow'
import FeedbackForm from './FeedbackForm'

export default function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationData, setConversationData] = useState({
    currentStep: 0,
    stepsCompleted: [false, false, false, false, false, false, false],
    when: null,
    groupSize: null,
    winePrefs: null,
    vibe: null,
    logistics: null,
    transportation: null,
    addons: null,
    itineraryGenerated: false,
  })
  const [showFeedback, setShowFeedback] = useState(false)
  const [sessionId, setSessionId] = useState(null)
  const [sessionStartTime, setSessionStartTime] = useState(null)
  const messagesEndRef = useRef(null)

  // =========================================================================
  // SESSION MANAGEMENT
  // =========================================================================
  
  useEffect(() => {
    // Create session on mount
    const newSessionId = crypto.randomUUID()
    setSessionId(newSessionId)
    setSessionStartTime(Date.now())

    // Save session start
    saveToDatabase('start', {
      session_id: newSessionId,
      metadata: {
        user_agent: navigator.userAgent,
        referrer: document.referrer,
      }
    })
  }, [])

  // =========================================================================
  // DETECT QUICK PLAN MODE
  // =========================================================================
  
  const isQuickPlan = messages.some(m => 
    m.role === 'user' && 
    /\b(tomorrow|today)\b/i.test(m.content)
  )

  // =========================================================================
  // AUTO-SCROLL
  // =========================================================================
  
  useEffect(() => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }, [messages])

  // =========================================================================
  // DETECT ITINERARY GENERATION & SHOW FEEDBACK
  // =========================================================================
  
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    
    // Detect itinerary by looking for structured headers
    if (lastMessage?.role === 'assistant' && 
        lastMessage.content.includes('**Morning (') &&
        lastMessage.content.includes('**Afternoon (')) {
      
      if (!conversationData.itineraryGenerated) {
        setConversationData(prev => ({
          ...prev,
          itineraryGenerated: true
        }))

        // Save itinerary generation
        saveToDatabase('itinerary', {
          session_id: sessionId,
          itinerary_data: {
            markdown: lastMessage.content,
            share_token: crypto.randomUUID().slice(0, 8),
          }
        })

        // Mark conversation complete
        const duration = Math.floor((Date.now() - sessionStartTime) / 1000)
        saveToDatabase('complete', {
          session_id: sessionId,
          metadata: {
            duration_seconds: duration,
            quick_plan_mode: isQuickPlan,
          }
        })

        // Show feedback form after 2 seconds
        setTimeout(() => setShowFeedback(true), 2000)
      }
    }
  }, [messages, conversationData.itineraryGenerated, sessionId, sessionStartTime, isQuickPlan])

  // =========================================================================
  // UPDATE CONVERSATION DATA AFTER EACH MESSAGE
  // =========================================================================
  
  useEffect(() => {
    if (messages.length > 0) {
      const lastMessage = messages[messages.length - 1]
      const stepData = detectCurrentStep(messages, conversationData)
      
      setConversationData(prev => ({
        ...prev,
        ...stepData,
      }))

      // Save conversation data update
      if (sessionId && stepData.currentStep > (currentData.currentStep || 0)) {
        saveToDatabase('update_data', {
          session_id: sessionId,
          conversation_data: {
            ...conversationData,
            ...stepData,
          }
        })
      }
    }
  }, [messages])

  // =========================================================================
  // SAVE TO DATABASE
  // =========================================================================
  
  const saveToDatabase = async (action, data) => {
    try {
      await fetch('/api/save-conversation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ action, ...data })
      })
    } catch (error) {
      console.error('Error saving to database:', error)
      // Don't block user experience if logging fails
    }
  }

  // =========================================================================
  // SAVE INDIVIDUAL MESSAGE
  // =========================================================================
  
  const saveMessage = async (message, index, suggestionClicked = null) => {
    if (!sessionId) return

    await saveToDatabase('message', {
      session_id: sessionId,
      message_data: {
        index,
        role: message.role,
        content: message.content,
        suggestion_clicked: suggestionClicked,
      }
    })
  }

  // =========================================================================
  // SEND MESSAGE
  // =========================================================================
  
  const sendMessage = async (content, suggestionClicked = null) => {
    if (!content.trim() || loading) return

    const userMessage = { role: 'user', content }
    const newMessages = [...messages, userMessage]
    setMessages(newMessages)
    setInput('')
    setLoading(true)

    // Save user message
    await saveMessage(userMessage, newMessages.length - 1, suggestionClicked)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ 
          messages: newMessages,
          conversationData 
        }),
      })

      const data = await response.json()
      const assistantMessage = { role: 'assistant', content: data.message }
      const finalMessages = [...newMessages, assistantMessage]
      
      setMessages(finalMessages)

      // Save assistant message
      await saveMessage(assistantMessage, finalMessages.length - 1)

      // Update suggestions
      if (data.suggestions) {
        setConversationData(prev => ({
          ...prev,
          currentSuggestions: data.suggestions
        }))
      }
    } catch (error) {
      console.error('Error:', error)
      setMessages([...newMessages, {
        role: 'assistant',
        content: 'Sorry, something went wrong. Please try again.'
      }])
    } finally {
      setLoading(false)
    }
  }

  // =========================================================================
  // INITIAL GREETING
  // =========================================================================
  
  useEffect(() => {
    if (messages.length === 0) {
      const greeting = {
        role: 'assistant',
        content: "Welcome to ValleySomm! I'm your AI sommelier for Yadkin Valley wine adventures. I'll help you create the perfect wine country itinerary in just a few minutes.\n\nWhen are you planning to visit? Are we talking this weekend, next month, or just dreaming ahead for now?"
      }
      setMessages([greeting])
      saveMessage(greeting, 0)
      
      setConversationData(prev => ({
        ...prev,
        currentSuggestions: [
          "This weekend",
          "Next month",
          "Next Saturday"
        ]
      }))
    }
  }, [])

  // =========================================================================
  // SUGGESTION HANDLING
  // =========================================================================
  
  const handleSuggestionClick = (suggestion) => {
    if (conversationData.itineraryGenerated || loading) return
    sendMessage(suggestion, suggestion)
  }

  // =========================================================================
  // STEP LABELS
  // =========================================================================
  
  const stepLabels = [
    'When',
    'Group Size',
    'Wine Preferences',
    'Vibe',
    'Logistics',
    'Transportation',
    'Add-ons'
  ]

  // =========================================================================
  // RENDER
  // =========================================================================
  
  return (
    <div className="flex flex-col h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      {/* Header */}
      <div className="bg-white border-b border-stone-200 px-6 py-4 shadow-sm">
        <div className="max-w-4xl mx-auto flex justify-between items-center">
          <div>
            <h1 
              className="text-2xl font-medium" 
              style={{ 
                fontFamily: 'Cormorant Garamond, serif',
                color: '#6B2D3F'
              }}
            >
              Valley<span style={{ color: '#2D4A3E' }}>Somm</span>
            </h1>
            <p className="text-xs text-stone-500">Your AI Sommelier for Yadkin Valley</p>
          </div>
          <div className="text-right">
            <div className="text-sm font-medium text-stone-600">
              {!isQuickPlan && !conversationData.itineraryGenerated && (
                <>Step {conversationData.currentStep + 1} of 7</>
              )}
              {isQuickPlan && !conversationData.itineraryGenerated && (
                <span className="text-amber-600">Quick Plan</span>
              )}
              {conversationData.itineraryGenerated && (
                <span className="text-green-600">✓ Complete</span>
              )}
            </div>
            <div className="text-xs text-stone-400">
              {!conversationData.itineraryGenerated && stepLabels[conversationData.currentStep]}
              {conversationData.itineraryGenerated && 'Itinerary Ready'}
            </div>
          </div>
        </div>
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-8">
        <div className="max-w-4xl mx-auto space-y-6">
          {messages.map((message, index) => (
            <div
              key={index}
              className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
            >
              <div
                className={`max-w-[80%] rounded-2xl px-6 py-4 ${
                  message.role === 'user'
                    ? 'bg-gradient-to-br from-[#6B2D3F] to-[#8B3A4D] text-white'
                    : 'bg-white shadow-sm border border-stone-200 text-stone-800'
                }`}
              >
                <div className="whitespace-pre-wrap text-sm leading-relaxed">
                  {message.content.split('\n').map((line, i) => {
                    // Handle markdown-style headers
                    if (line.startsWith('**') && line.endsWith('**')) {
                      return (
                        <div key={i} className="font-semibold mt-3 mb-1">
                          {line.replace(/\*\*/g, '')}
                        </div>
                      )
                    }
                    // Handle markdown links
                    if (line.includes('📞')) {
                      return <div key={i} className="text-sm opacity-80 mt-1">{line}</div>
                    }
                    // Regular text
                    return line ? <div key={i}>{line}</div> : <div key={i} className="h-2" />
                  })}
                </div>
                <div className="text-xs opacity-60 mt-2">
                  {new Date().toLocaleTimeString('en-US', { 
                    hour: 'numeric', 
                    minute: '2-digit',
                    hour12: true 
                  })}
                </div>
              </div>
            </div>
          ))}

          {loading && (
            <div className="flex justify-start">
              <div className="bg-white shadow-sm border border-stone-200 rounded-2xl px-6 py-4">
                <div className="flex gap-2">
                  <div className="w-2 h-2 bg-[#6B2D3F] rounded-full animate-bounce"></div>
                  <div className="w-2 h-2 bg-[#8B3A4D] rounded-full animate-bounce" style={{ animationDelay: '0.1s' }}></div>
                  <div className="w-2 h-2 bg-[#C4637A] rounded-full animate-bounce" style={{ animationDelay: '0.2s' }}></div>
                </div>
              </div>
            </div>
          )}

          <div ref={messagesEndRef} />
        </div>
      </div>

      {/* Suggestions */}
      {!conversationData.itineraryGenerated && conversationData.currentSuggestions && conversationData.currentSuggestions.length > 0 && (
        <div className="px-6 py-3 bg-white border-t border-stone-200">
          <div className="max-w-4xl mx-auto">
            <div className="text-xs text-stone-500 mb-2">Quick replies:</div>
            <div className="flex flex-wrap gap-2">
              {conversationData.currentSuggestions.map((suggestion, index) => (
                <button
                  key={index}
                  onClick={() => handleSuggestionClick(suggestion)}
                  disabled={loading}
                  className="px-4 py-2 bg-stone-100 hover:bg-[#6B2D3F] hover:text-white text-stone-700 text-sm rounded-full transition-all disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {suggestion}
                </button>
              ))}
            </div>
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-stone-200 px-6 py-4">
        <div className="max-w-4xl mx-auto">
          {conversationData.itineraryGenerated ? (
            <div className="text-center py-4">
              <p className="text-stone-600 mb-2">Your itinerary is ready! Close this chat to explore or start planning another trip.</p>
              <button
                onClick={() => window.location.reload()}
                className="px-6 py-2 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white rounded-lg transition-colors"
              >
                Plan Another Trip
              </button>
            </div>
          ) : (
            <form
              onSubmit={(e) => {
                e.preventDefault()
                sendMessage(input)
              }}
              className="flex gap-3"
            >
              <input
                type="text"
                value={input}
                onChange={(e) => setInput(e.target.value)}
                placeholder="Type your answer..."
                disabled={loading}
                className="flex-1 px-6 py-3 rounded-full border border-stone-300 focus:border-[#6B2D3F] focus:ring-2 focus:ring-[#6B2D3F]/20 outline-none disabled:bg-stone-100 disabled:cursor-not-allowed"
              />
              <button
                type="submit"
                disabled={!input.trim() || loading}
                className="px-8 py-3 bg-gradient-to-br from-[#6B2D3F] to-[#8B3A4D] hover:from-[#8B3A4D] hover:to-[#6B2D3F] text-white rounded-full font-medium transition-all disabled:opacity-50 disabled:cursor-not-allowed shadow-lg hover:shadow-xl"
              >
                Send
              </button>
            </form>
          )}
        </div>
      </div>

      {/* Feedback Form */}
      {showFeedback && (
        <FeedbackForm 
          sessionId={sessionId}
          onClose={() => setShowFeedback(false)}
        />
      )}
    </div>
  )
}