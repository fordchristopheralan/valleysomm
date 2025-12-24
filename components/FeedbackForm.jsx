'use client'

import { useState } from 'react'
import { supabase } from '@/lib/supabase'

export default function FeedbackForm({ sessionId, onClose }) {
  const [step, setStep] = useState(1) // 1: Experience, 2: Itinerary, 3: Display, 4: Thank you
  const [submitting, setSubmitting] = useState(false)
  
  const [feedback, setFeedback] = useState({
    // Conversation Experience
    conversation_smoothness: 0,
    questions_clarity: 0,
    questions_quantity: '',
    conversation_comments: '',
    
    // Itinerary Quality
    recommendations_match: 0,
    wineries_appropriate: 0,
    timing_realistic: 0,
    itinerary_comments: '',
    missing_from_itinerary: '',
    
    // Display Preferences
    preferred_display: [],
    important_info_first: [],
    wants_edit_capability: null,
    edit_preferences: [],
    
    // Overall
    overall_rating: 0,
    would_use_again: null,
    would_recommend: null,
    additional_comments: '',
    
    // Optional
    tester_email: '',
    tester_name: '',
  })

  const handleSubmit = async () => {
    setSubmitting(true)
    
    try {
      const { error } = await supabase
        .from('tester_feedback')
        .insert({
          session_id: sessionId,
          ...feedback,
        })

      if (error) throw error

      setStep(4) // Thank you screen
    } catch (error) {
      console.error('Error submitting feedback:', error)
      alert('Error submitting feedback. Please try again.')
    } finally {
      setSubmitting(false)
    }
  }

  const toggleArray = (field, value) => {
    setFeedback(prev => ({
      ...prev,
      [field]: prev[field].includes(value)
        ? prev[field].filter(v => v !== value)
        : [...prev[field], value]
    }))
  }

  // ========================================================================
  // STEP 1: Conversation Experience
  // ========================================================================
  if (step === 1) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#6B2D3F' }}>
              Help Us Improve! 🍷
            </h2>
            <p className="text-stone-600 mb-6">
              We'd love your feedback on the planning experience. This will take about 2 minutes.
            </p>

            {/* Progress */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-2 bg-[#6B2D3F] rounded"></div>
              <div className="flex-1 h-2 bg-stone-200 rounded"></div>
              <div className="flex-1 h-2 bg-stone-200 rounded"></div>
            </div>

            <h3 className="font-semibold text-lg mb-4">Part 1: Conversation Experience</h3>

            {/* Smoothness Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                How smooth was the planning process?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setFeedback({ ...feedback, conversation_smoothness: n })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      feedback.conversation_smoothness === n
                        ? 'bg-[#6B2D3F] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>Very choppy</span>
                <span>Perfectly smooth</span>
              </div>
            </div>

            {/* Clarity Rating */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Were the questions clear and easy to understand?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setFeedback({ ...feedback, questions_clarity: n })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      feedback.questions_clarity === n
                        ? 'bg-[#6B2D3F] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>Very confusing</span>
                <span>Crystal clear</span>
              </div>
            </div>

            {/* Question Quantity */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Did the AI ask too many, too few, or just the right number of questions?
              </label>
              <div className="space-y-2">
                {[
                  { value: 'too_few', label: 'Too few - I wanted to provide more details' },
                  { value: 'just_right', label: 'Just right - perfect amount' },
                  { value: 'too_many', label: 'Too many - felt like an interrogation' }
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="radio"
                      name="questions_quantity"
                      checked={feedback.questions_quantity === opt.value}
                      onChange={() => setFeedback({ ...feedback, questions_quantity: opt.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Comments */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Anything confusing or that could be improved?
              </label>
              <textarea
                value={feedback.conversation_comments}
                onChange={(e) => setFeedback({ ...feedback, conversation_comments: e.target.value })}
                placeholder="Optional - tell us what could be better..."
                className="w-full p-3 border border-stone-200 rounded-lg resize-none h-24"
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={onClose}
                className="px-6 py-2 text-stone-600 hover:text-stone-800"
              >
                Skip for now
              </button>
              <button
                onClick={() => setStep(2)}
                disabled={!feedback.conversation_smoothness || !feedback.questions_clarity || !feedback.questions_quantity}
                className="px-6 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] disabled:bg-stone-300 text-white font-medium rounded-lg transition-colors"
              >
                Next: Itinerary Quality →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========================================================================
  // STEP 2: Itinerary Quality
  // ========================================================================
  if (step === 2) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-2 bg-[#6B2D3F] rounded"></div>
              <div className="flex-1 h-2 bg-[#6B2D3F] rounded"></div>
              <div className="flex-1 h-2 bg-stone-200 rounded"></div>
            </div>

            <h3 className="font-semibold text-lg mb-4">Part 2: Itinerary Quality</h3>

            {/* Recommendations Match */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Did the winery recommendations match what you asked for?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setFeedback({ ...feedback, recommendations_match: n })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      feedback.recommendations_match === n
                        ? 'bg-[#6B2D3F] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>Way off</span>
                <span>Perfect match</span>
              </div>
            </div>

            {/* Wineries Appropriate */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Were the wineries appropriate for your group?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setFeedback({ ...feedback, wineries_appropriate: n })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      feedback.wineries_appropriate === n
                        ? 'bg-[#6B2D3F] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>Not at all</span>
                <span>Perfect fit</span>
              </div>
            </div>

            {/* Timing Realistic */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Was the timing and routing realistic?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setFeedback({ ...feedback, timing_realistic: n })}
                    className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                      feedback.timing_realistic === n
                        ? 'bg-[#6B2D3F] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {n}
                  </button>
                ))}
              </div>
              <div className="flex justify-between text-xs text-stone-400 mt-1">
                <span>Impossible</span>
                <span>Very realistic</span>
              </div>
            </div>

            {/* Missing Info */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                What was missing from the itinerary (if anything)?
              </label>
              <textarea
                value={feedback.missing_from_itinerary}
                onChange={(e) => setFeedback({ ...feedback, missing_from_itinerary: e.target.value })}
                placeholder="e.g., prices, driving directions, opening hours..."
                className="w-full p-3 border border-stone-200 rounded-lg resize-none h-24"
              />
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(1)}
                className="px-6 py-2 text-stone-600 hover:text-stone-800"
              >
                ← Back
              </button>
              <button
                onClick={() => setStep(3)}
                disabled={!feedback.recommendations_match || !feedback.wineries_appropriate || !feedback.timing_realistic}
                className="px-6 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] disabled:bg-stone-300 text-white font-medium rounded-lg transition-colors"
              >
                Next: Display Preferences →
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========================================================================
  // STEP 3: Display Preferences
  // ========================================================================
  if (step === 3) {
    return (
      <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
        <div className="bg-white rounded-2xl shadow-2xl max-w-2xl w-full max-h-[90vh] overflow-y-auto">
          <div className="p-8">
            {/* Progress */}
            <div className="flex gap-2 mb-8">
              <div className="flex-1 h-2 bg-[#6B2D3F] rounded"></div>
              <div className="flex-1 h-2 bg-[#6B2D3F] rounded"></div>
              <div className="flex-1 h-2 bg-[#6B2D3F] rounded"></div>
            </div>

            <h3 className="font-semibold text-lg mb-4">Part 3: How Should We Display Itineraries?</h3>
            <p className="text-sm text-stone-600 mb-6">
              Help us design the best way to show your trip! Select all that appeal to you.
            </p>

            {/* Display Format */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                How would you prefer to view your itinerary? (Select all that apply)
              </label>
              <div className="space-y-2">
                {[
                  { value: 'chat_window', label: 'Keep it in the chat window', desc: 'Simple and immediate' },
                  { value: 'fullscreen_modal', label: 'Full-screen popup overlay', desc: 'Focus mode without leaving the page' },
                  { value: 'new_page_shareable', label: 'New page with shareable link', desc: 'Can bookmark and share with friends' },
                  { value: 'pdf_download', label: 'Download as PDF', desc: 'Print or save offline' },
                  { value: 'email', label: 'Email it to me', desc: 'Easy to reference later' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-start gap-3 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feedback.preferred_display.includes(opt.value)}
                      onChange={() => toggleArray('preferred_display', opt.value)}
                      className="w-4 h-4 mt-1"
                    />
                    <div className="flex-1">
                      <div className="font-medium text-sm">{opt.label}</div>
                      <div className="text-xs text-stone-500">{opt.desc}</div>
                    </div>
                  </label>
                ))}
              </div>
            </div>

            {/* Important Info */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                What information is most important to see first? (Select top 3)
              </label>
              <div className="space-y-2">
                {[
                  { value: 'map_route', label: 'Map with route' },
                  { value: 'timeline', label: 'Timeline view (hour-by-hour)' },
                  { value: 'winery_details', label: 'Winery details and descriptions' },
                  { value: 'budget_pricing', label: 'Budget and pricing info' },
                  { value: 'booking_links', label: 'Direct booking links' },
                ].map(opt => (
                  <label key={opt.value} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="checkbox"
                      checked={feedback.important_info_first.includes(opt.value)}
                      onChange={() => toggleArray('important_info_first', opt.value)}
                      disabled={!feedback.important_info_first.includes(opt.value) && feedback.important_info_first.length >= 3}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Edit Capability */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Would you want to edit the itinerary after it's generated?
              </label>
              <div className="space-y-2">
                {[
                  { value: true, label: "Yes, I'd want to make changes" },
                  { value: false, label: 'No, just give me the plan' },
                ].map(opt => (
                  <label key={opt.value.toString()} className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:bg-stone-50 cursor-pointer">
                    <input
                      type="radio"
                      checked={feedback.wants_edit_capability === opt.value}
                      onChange={() => setFeedback({ ...feedback, wants_edit_capability: opt.value })}
                      className="w-4 h-4"
                    />
                    <span className="text-sm">{opt.label}</span>
                  </label>
                ))}
              </div>
            </div>

            {/* Overall Rating */}
            <div className="mb-6 pt-6 border-t border-stone-200">
              <label className="block text-sm font-medium mb-2">
                Overall, how would you rate ValleySomm?
              </label>
              <div className="flex gap-2">
                {[1, 2, 3, 4, 5].map(n => (
                  <button
                    key={n}
                    onClick={() => setFeedback({ ...feedback, overall_rating: n })}
                    className={`flex-1 py-4 rounded-lg font-bold text-lg transition-all ${
                      feedback.overall_rating === n
                        ? 'bg-[#6B2D3F] text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    {'⭐'.repeat(n)}
                  </button>
                ))}
              </div>
            </div>

            {/* Would use/recommend */}
            <div className="grid grid-cols-2 gap-4 mb-6">
              <div>
                <label className="block text-sm font-medium mb-2">
                  Would you use this again?
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedback({ ...feedback, would_use_again: true })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      feedback.would_use_again === true
                        ? 'bg-green-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFeedback({ ...feedback, would_use_again: false })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      feedback.would_use_again === false
                        ? 'bg-red-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
              <div>
                <label className="block text-sm font-medium mb-2">
                  Would you recommend to a friend?
                </label>
                <div className="flex gap-2">
                  <button
                    onClick={() => setFeedback({ ...feedback, would_recommend: true })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      feedback.would_recommend === true
                        ? 'bg-green-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    Yes
                  </button>
                  <button
                    onClick={() => setFeedback({ ...feedback, would_recommend: false })}
                    className={`flex-1 py-2 rounded-lg text-sm font-medium ${
                      feedback.would_recommend === false
                        ? 'bg-red-500 text-white'
                        : 'bg-stone-100 text-stone-600 hover:bg-stone-200'
                    }`}
                  >
                    No
                  </button>
                </div>
              </div>
            </div>

            {/* Additional Comments */}
            <div className="mb-6">
              <label className="block text-sm font-medium mb-2">
                Any other thoughts or suggestions?
              </label>
              <textarea
                value={feedback.additional_comments}
                onChange={(e) => setFeedback({ ...feedback, additional_comments: e.target.value })}
                placeholder="Optional - anything else we should know..."
                className="w-full p-3 border border-stone-200 rounded-lg resize-none h-24"
              />
            </div>

            {/* Optional Contact */}
            <div className="mb-6 p-4 bg-stone-50 rounded-lg">
              <p className="text-sm text-stone-600 mb-3">
                <strong>Optional:</strong> Leave your email if you'd like updates or to be contacted about your feedback.
              </p>
              <div className="grid grid-cols-2 gap-3">
                <input
                  type="text"
                  value={feedback.tester_name}
                  onChange={(e) => setFeedback({ ...feedback, tester_name: e.target.value })}
                  placeholder="Your name"
                  className="p-2 border border-stone-200 rounded-lg text-sm"
                />
                <input
                  type="email"
                  value={feedback.tester_email}
                  onChange={(e) => setFeedback({ ...feedback, tester_email: e.target.value })}
                  placeholder="your@email.com"
                  className="p-2 border border-stone-200 rounded-lg text-sm"
                />
              </div>
            </div>

            {/* Navigation */}
            <div className="flex justify-between pt-4">
              <button
                onClick={() => setStep(2)}
                className="px-6 py-2 text-stone-600 hover:text-stone-800"
              >
                ← Back
              </button>
              <button
                onClick={handleSubmit}
                disabled={
                  submitting ||
                  !feedback.overall_rating ||
                  feedback.would_use_again === null ||
                  feedback.would_recommend === null
                }
                className="px-8 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] disabled:bg-stone-300 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Feedback 🍷'}
              </button>
            </div>
          </div>
        </div>
      </div>
    )
  }

  // ========================================================================
  // STEP 4: Thank You
  // ========================================================================
  return (
    <div className="fixed inset-0 bg-black/50 flex items-center justify-center z-50 p-4">
      <div className="bg-white rounded-2xl shadow-2xl max-w-md w-full p-8 text-center">
        <div className="text-6xl mb-4">🍷✨</div>
        <h2 className="text-2xl font-bold mb-2" style={{ fontFamily: 'Cormorant Garamond, serif', color: '#6B2D3F' }}>
          Thank You!
        </h2>
        <p className="text-stone-600 mb-6">
          Your feedback is incredibly valuable and will help us make ValleySomm even better!
        </p>
        <button
          onClick={onClose}
          className="px-6 py-3 bg-[#6B2D3F] hover:bg-[#8B3A4D] text-white font-medium rounded-lg transition-colors"
        >
          Close
        </button>
      </div>
    </div>
  )
}