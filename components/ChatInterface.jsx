'use client'

import { useState, useRef, useEffect } from 'react'
import { CONVERSATION_STEPS, getSuggestions } from '@/lib/chatFlow'

export default function ChatInterface({ onClose }) {
  const [messages, setMessages] = useState([
    {
      role: 'assistant',
      content: "Welcome to ValleySomm! I'm your AI sommelier for Yadkin Valley wine adventures. I'll help you create the perfect wine country itinerary in just a few minutes. Ready to get started?"
    }
  ])
  const [input, setInput] = useState('')
  const [isLoading, setIsLoading] = useState(false)
  const [conversationData, setConversationData] = useState({})
  const messagesEndRef = useRef(null)

  // NEW: Detect Quick Plan mode
  const isQuickPlan = messages.some(m => 
    m.role === 'user' && 
    /\b(tomorrow|today)\b/i.test(m.content)
  )

  const scrollToBottom = () => {
    messagesEndRef.current?.scrollIntoView({ behavior: 'smooth' })
  }

  useEffect(() => {
    scrollToBottom()
  }, [messages])

  // NEW: Auto-detect itinerary generation completion
  useEffect(() => {
    const lastMessage = messages[messages.length - 1]
    
    // Detect if itinerary was generated (look for structured headers)
    if (lastMessage?.role === 'assistant' && 
        lastMessage.content.includes('**Morning (') &&
        lastMessage.content.includes('**Afternoon (')) {
      
      // Itinerary detected - mark as complete
      setConversationData(prev => ({
        ...prev,
        itineraryGenerated: true
      }))
    }
  }, [messages])

  const currentStep = conversationData.currentStep || 0
  const progress = Math.min(((currentStep + 1) / CONVERSATION_STEPS.length) * 100, 100)
  
  // Don't show suggestions if itinerary is being generated or already done
  const showSuggestions = !isLoading && 
                         !conversationData.itineraryTriggered && 
                         !conversationData.itineraryGenerated
  
  const suggestions = showSuggestions ? getSuggestions(currentStep, conversationData) : []

  const sendMessage = async (messageText) => {
    if (!messageText.trim() || isLoading) return

    // Don't send if itinerary already generated
    if (conversationData.itineraryGenerated) {
      return
    }

    const userMessage = { role: 'user', content: messageText }
    const updatedMessages = [...messages, userMessage]
    setMessages(updatedMessages)
    setInput('')
    setIsLoading(true)

    try {
      const response = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          messages: updatedMessages,
          conversationData
        })
      })

      const data = await response.json()

      // Add AI response
      setMessages([...updatedMessages, {
        role: 'assistant',
        content: data.message
      }])

      // Update conversation data
      setConversationData(data.conversationData)

      // If itinerary should be generated, trigger AI to create it
      if (data.shouldGenerateItinerary && !conversationData.itineraryTriggered) {
        // Add the "Generating..." message
        setMessages(prev => [...prev, {
          role: 'assistant',
          content: '🍷 Perfect! Generating your personalized Yadkin Valley itinerary...'
        }])
        
        // Mark as triggered to prevent duplicates
        setConversationData(prev => ({ ...prev, itineraryTriggered: true }))
        
        // Actually generate the itinerary by sending a final message to AI
        setTimeout(async () => {
          try {
            const generateResponse = await fetch('/api/chat', {
              method: 'POST',
              headers: { 'Content-Type': 'application/json' },
              body: JSON.stringify({
                messages: [
                  ...updatedMessages,
                  { role: 'assistant', content: data.message },
                  { 
                    role: 'user', 
                    content: 'Please generate my complete itinerary now with specific winery names, times, and details.' 
                  }
                ],
                conversationData: { ...data.conversationData, itineraryTriggered: true }
              })
            })
            
            const itineraryData = await generateResponse.json()
            
            // Add the full itinerary
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: itineraryData.message
            }])
            
            // Mark as fully generated
            setConversationData(prev => ({
              ...prev,
              itineraryGenerated: true
            }))
            
          } catch (error) {
            console.error('Error generating itinerary:', error)
            setMessages(prev => [...prev, {
              role: 'assistant',
              content: "I had trouble generating your itinerary. Let me try again - could you tell me one more time what kind of experience you're looking for?"
            }])
          }
        }, 1000)
      }

    } catch (error) {
      console.error('Error:', error)
      setMessages(prev => [...prev, {
        role: 'assistant',
        content: "I'm having trouble connecting right now. Please try again!"
      }])
    } finally {
      setIsLoading(false)
    }
  }

  const handleSubmit = (e) => {
    e.preventDefault()
    sendMessage(input)
  }

  const handleSuggestionClick = (suggestion) => {
    sendMessage(suggestion)
  }

  return (
    <div className="flex flex-col h-full bg-white">
      {/* Header with progress */}
      <div className="bg-gradient-to-r from-wine-burgundy to-wine-deep text-white p-4 rounded-t-2xl">
        <div className="flex justify-between items-center mb-2">
          <h3 className="font-semibold">
            {/* UPDATED: Hide step counter in Quick Plan mode */}
            {!isQuickPlan && (
              <>Step {Math.min(currentStep + 1, CONVERSATION_STEPS.length)} of {CONVERSATION_STEPS.length}</>
            )}
            {isQuickPlan && 'Quick Plan'}
          </h3>
          <button 
            onClick={onClose}
            className="text-white hover:text-cream transition-colors"
          >
            <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </button>
        </div>
        {/* UPDATED: Show progress bar for both modes */}
        <div className="w-full bg-wine-deep/30 rounded-full h-2">
          <div 
            className="bg-gold-accent h-2 rounded-full transition-all duration-500"
            style={{ width: `${Math.min(progress, 100)}%` }}
          />
        </div>
        {/* UPDATED: Only show step title in normal mode */}
        {!isQuickPlan && currentStep < CONVERSATION_STEPS.length && (
          <p className="text-sm mt-2 text-cream/90">
            {CONVERSATION_STEPS[currentStep]?.title}
          </p>
        )}
        {isQuickPlan && (
          <p className="text-sm mt-2 text-cream/90">
            Fast planning mode
          </p>
        )}
      </div>

      {/* Messages */}
      <div className="flex-1 overflow-y-auto p-4 space-y-4">
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
              <p className="text-sm whitespace-pre-wrap">{message.content}</p>
              <p className="text-xs mt-1 opacity-60">
                {new Date().toLocaleTimeString('en-US', { 
                  hour: 'numeric', 
                  minute: '2-digit'
                })}
              </p>
            </div>
          </div>
        ))}

        {isLoading && (
          <div className="flex justify-start">
            <div className="bg-stone-100 rounded-2xl px-4 py-3">
              <div className="flex space-x-2">
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
                <div className="w-2 h-2 bg-stone-400 rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
              </div>
            </div>
          </div>
        )}

        <div ref={messagesEndRef} />
      </div>

      {/* Suggested responses */}
      {suggestions.length > 0 && (
        <div className="px-4 pb-2">
          <div className="flex flex-wrap gap-2">
            {suggestions.map((suggestion, index) => (
              <button
                key={index}
                onClick={() => handleSuggestionClick(suggestion)}
                className="px-3 py-1.5 text-sm bg-cream hover:bg-warm-beige text-wine-burgundy rounded-full transition-colors border border-warm-beige"
              >
                {suggestion}
              </button>
            ))}
          </div>
        </div>
      )}

      {/* Input - UPDATED: Lock when itinerary is generated */}
      {!conversationData.itineraryGenerated && (
        <form onSubmit={handleSubmit} className="p-4 border-t border-stone-200">
          <div className="flex gap-2">
            <input
              type="text"
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Type your message..."
              disabled={isLoading}
              className="flex-1 px-4 py-3 border border-stone-300 rounded-full focus:outline-none focus:ring-2 focus:ring-wine-burgundy focus:border-transparent disabled:bg-stone-100 disabled:cursor-not-allowed"
            />
            <button
              type="submit"
              disabled={!input.trim() || isLoading}
              className="px-6 py-3 bg-wine-burgundy hover:bg-wine-deep text-white rounded-full font-medium transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Send
            </button>
          </div>
        </form>
      )}

      {/* UPDATED: Completion message */}
      {conversationData.itineraryGenerated && (
        <div className="p-4 bg-cream text-center text-sm text-stone-600">
          Your itinerary is ready! Close this chat to explore or start planning another trip.
        </div>
      )}
    </div>
  )
}