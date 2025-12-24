'use client'

import { useState, useEffect, useRef } from 'react'

export default function ChatInterface() {
  const [messages, setMessages] = useState([])
  const [input, setInput] = useState('')
  const [loading, setLoading] = useState(false)
  const [conversationData, setConversationData] = useState({})
  const messagesEndRef = useRef(null)

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // Initialize with welcome message
  useEffect(() => {
    setMessages([
      {
        role: 'assistant',
        content: "Welcome to ValleySomm! I'm your AI sommelier for Yadkin Valley wine adventures. I'll help you create the perfect wine country itinerary in just a few minutes. Ready to get started?",
        timestamp: new Date()
      }
    ])
  }, [])

  const sendMessage = async (messageText) => {
    const userMessage = messageText || input
    if (!userMessage.trim()) return

    // Add user message to UI
    const newUserMessage = {
      role: 'user',
      content: userMessage,
      timestamp: new Date()
    }
    setMessages(prev => [...prev, newUserMessage])
    setInput('')
    setLoading(true)

    try {
      // Send to API
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: [...messages, newUserMessage],
          conversationData
        })
      })

      if (!response.ok) throw new Error('API request failed')

      const data = await response.json()

      // Add assistant response
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: data.message,
        timestamp: new Date()
      }])

      // Update conversation data
      if (data.conversationData) {
        setConversationData(data.conversationData)
      }

      // Check if itinerary should be generated
      if (data.shouldGenerateItinerary) {
        // TODO: Trigger itinerary generation
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '🍷 Perfect! Generating your personalized Yadkin Valley itinerary...',
          timestamp: new Date()
        }])
      }

    } catch (error) {
      console.error('Chat error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm sorry, I encountered an error. Please try again.",
        timestamp: new Date()
      }])
    } finally {
      setLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage()
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  // Get suggested responses for current step
  const getSuggestions = () => {
    const lastMessage = messages[messages.length - 1]
    if (lastMessage?.role !== 'assistant' || loading) return []

    // Parse step from conversation data
    const currentStep = conversationData.currentStep || 1

    const suggestionMap = {
      1: ['This weekend', 'Next month', 'Not sure yet'],
      2: ['Just 2 of us', '3-4 people', 'Large group (6+)'],
      3: ['Dry reds', 'Sweet whites', 'Rosé', 'Surprise me!'],
      4: ['Romantic & intimate', 'Social & lively', 'Educational', 'Scenic views'],
      5: ['Yes, we need reservations', 'Walk-ins are fine', 'Mix of both'],
      6: ['We have a DD', 'Need transportation help', 'Interested in tours'],
      7: ['Lunch spots', 'Overnight stay', 'Just wineries']
    }

    return suggestionMap[currentStep] || []
  }

  const suggestions = getSuggestions()

  return (
    <div className="flex flex-col h-full max-w-4xl mx-auto">
      {/* Progress Bar */}
      {conversationData.currentStep && (
        <div className="bg-white border-b border-stone-200 px-6 py-3">
          <div className="flex justify-between text-xs text-stone-500 mb-2">
            <span>Step {conversationData.currentStep} of 7</span>
            <span>{Math.round((conversationData.currentStep / 7) * 100)}%</span>
          </div>
          <div className="w-full bg-stone-200 rounded-full h-2">
            <div
              className="bg-gradient-to-r from-wine-burgundy to-wine-deep h-2 rounded-full transition-all duration-500"
              style={{ width: `${(conversationData.currentStep / 7) * 100}%` }}
            />
          </div>
        </div>
      )}

      {/* Messages */}
      <div className="flex-1 overflow-y-auto px-6 py-4 space-y-4">
        {messages.map((message, index) => (
          <div
            key={index}
            className={`flex ${message.role === 'user' ? 'justify-end' : 'justify-start'}`}
          >
            <div
              className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                message.role === 'user'
                  ? 'bg-wine-burgundy text-white'
                  : 'bg-stone-100 text-stone-800'
              }`}
            >
              <p className="text-sm leading-relaxed whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs opacity-60 mt-1">
                {message.timestamp.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}
              </p>
            </div>
          </div>
        ))}

        {loading && (
          <div className="flex justify-start">
            <div className="bg-stone-100 rounded-2xl px-4 py-3">
              <div className="flex gap-1">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }} />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }} />
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }} />
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested Responses */}
      {suggestions.length > 0 && !loading && (
        <div className="px-6 py-3 bg-cream border-t border-stone-200">
          <p className="text-xs text-stone-500 mb-2">Quick replies:</p>
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-4 py-2 bg-white border border-stone-300 rounded-full text-sm text-stone-700 hover:border-wine-burgundy hover:text-wine-burgundy transition-colors"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input */}
      <div className="bg-white border-t border-stone-200 px-6 py-4">
        <form onSubmit={handleSubmit} className="flex gap-3">
          <input
            type="text"
            value={input}
            onChange={(e) => setInput(e.target.value)}
            placeholder="Type your message..."
            disabled={loading}
            className="flex-1 px-4 py-3 rounded-full border border-stone-300 focus:border-wine-burgundy focus:ring-2 focus:ring-wine-burgundy/20 outline-none disabled:opacity-50 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={loading || !input.trim()}
            className="px-6 py-3 bg-wine-burgundy text-white rounded-full font-medium hover:bg-wine-deep transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            Send
          </button>
        </form>
      </div>
    </div>
  )
}