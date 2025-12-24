// app/v1/page.js
import ChatInterface from '@/components/ChatInterface'

export default function V1Page() {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
      {/* V1 Landing Hero */}
      <div className="max-w-4xl mx-auto px-6 py-12 text-center">
        <h1 className="text-4xl font-bold text-stone-800 mb-3">
          Plan Your Yadkin Valley Wine Adventure
        </h1>
        <p className="text-xl text-stone-600 mb-8">
          Chat with AI. Get a personalized itinerary. Book your wineries.
        </p>
      </div>

      <ChatInterface />
    </div>
  )
}