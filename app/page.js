'use client'

import { useState, useEffect } from 'react'
import { supabase } from '@/lib/supabase'

const questions = [
  {
    id: 'regions',
    type: 'multiselect',
    question: 'Which wine region(s) have you visited in the past 2 years?',
    options: [
      'Napa / Sonoma (CA)',
      'Willamette Valley (OR)',
      'Finger Lakes (NY)',
      'Texas Hill Country',
      'Virginia Wine Country',
      'Yadkin Valley (NC)',
      'Walla Walla (WA)',
      'Paso Robles (CA)',
      'Other US region',
      'International',
    ],
    otherFields: {
      'Other US region': { id: 'regions_other_us', placeholder: 'Which US region?' },
      'International': { id: 'regions_international', placeholder: 'Which country/region?' },
    },
  },
  {
    id: 'planning_time',
    type: 'single',
    question: 'How far in advance did you start planning your most recent wine trip?',
    options: [
      'Same week — spontaneous!',
      '1–2 weeks before',
      'About a month out',
      '2+ months of planning',
      "Didn't really plan, just went",
    ],
  },
  {
    id: 'group_type',
    type: 'single',
    question: 'Who did you travel with?',
    options: [
      'Solo',
      'Partner / spouse',
      'Small group of friends (3–6)',
      'Large group (7+) / celebration',
      'Family with kids',
      'Organized tour group',
    ],
  },
  {
    id: 'hardest_part',
    type: 'textarea',
    question: 'What was the hardest part of planning your wine country trip?',
    placeholder: 'Be as specific as possible — this is the most valuable question for us...',
  },
  {
    id: 'discovery',
    type: 'multiselect',
    question: 'How did you decide which wineries to visit?',
    options: [
      'Google search',
      'Instagram / TikTok',
      'Friend or family recommendation',
      'Wine club membership',
      'Yelp / Tripadvisor reviews',
      'Official wine trail website',
      'Just drove around and stopped',
      'Hotel concierge',
      'Blog or article',
      'Other',
    ],
    otherFields: {
      'Other': { id: 'discovery_other', placeholder: 'How did you find wineries?' },
    },
  },
  {
    id: 'confidence',
    type: 'scale',
    question: 'How confident were you that you picked wineries matching your taste and vibe?',
    lowLabel: 'Total guesswork',
    highLabel: 'Nailed it',
  },
  {
    id: 'driver',
    type: 'single',
    question: 'How did you handle the designated driver situation?',
    options: [
      'One person in our group abstained',
      'Hired a tour, limo, or driver',
      'Used Uber / Lyft',
      'Stayed somewhere walkable to wineries',
      "We... didn't really think about it",
      'Bike or e-bike',
      'Other',
    ],
    otherFields: {
      'Other': { id: 'driver_other', placeholder: 'How did you handle it?' },
    },
  },
  {
    id: 'reservations',
    type: 'single',
    question: 'Did you book tastings in advance or just show up?',
    options: [
      'Booked everything in advance',
      'Booked some, winged the rest',
      'Just showed up everywhere',
      "Didn't realize reservations were needed",
    ],
  },
  {
    id: 'easier',
    type: 'textarea',
    question: 'What would have made planning your trip easier?',
    placeholder: "A tool, resource, or piece of information that would've helped...",
  },
  {
    id: 'surprise',
    type: 'textarea',
    question: 'What surprised you (good or bad) once you arrived?',
    placeholder: "Things you wish you'd known beforehand...",
  },
  {
    id: 'pay',
    type: 'single',
    question: 'If a tool existed that solved your biggest wine trip planning headache, would you pay for it?',
    options: [
      'Yes — take my money',
      'Maybe, depending on cost',
      "Probably not, I'd use a free version",
      'No, I enjoy figuring it out myself',
    ],
  },
  {
    id: 'source',
    type: 'single',
    question: 'How did you find this survey?',
    options: [
      'Reddit',
      'Facebook group',
      'Twitter / X',
      'LinkedIn',
      'Friend or text',
      'Other',
    ],
    otherFields: {
      'Other': { id: 'source_other', placeholder: 'Where did you find it?' },
    },
  },
  {
    id: 'email_capture',
    type: 'email_with_options',
    question: 'Want to stay connected?',
    subtext: "Totally optional — leave blank to stay anonymous.",
    placeholder: 'your@email.com',
  },
]

const steps = [
  { title: 'Your Experience', questions: [0, 1, 2] },
  { title: 'Planning & Discovery', questions: [3, 4, 5] },
  { title: 'Logistics', questions: [6, 7] },
  { title: 'Insights & Wrap-up', questions: [8, 9, 10, 11, 12] },
]

// Countdown timer component
function CountdownTimer({ targetDate }) {
  const [timeLeft, setTimeLeft] = useState({ days: 0, hours: 0, minutes: 0 })

  useEffect(() => {
    const calculateTimeLeft = () => {
      const difference = targetDate - new Date()
      if (difference > 0) {
        setTimeLeft({
          days: Math.floor(difference / (1000 * 60 * 60 * 24)),
          hours: Math.floor((difference / (1000 * 60 * 60)) % 24),
          minutes: Math.floor((difference / 1000 / 60) % 60),
        })
      }
    }

    calculateTimeLeft()
    const timer = setInterval(calculateTimeLeft, 60000) // Update every minute
    return () => clearInterval(timer)
  }, [targetDate])

  return (
    <div className="flex justify-center gap-3">
      <div className="text-center">
        <div className="text-2xl sm:text-3xl font-bold text-white">{timeLeft.days}</div>
        <div className="text-xs text-white/70 uppercase tracking-wide">Days</div>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white/50">:</div>
      <div className="text-center">
        <div className="text-2xl sm:text-3xl font-bold text-white">{timeLeft.hours}</div>
        <div className="text-xs text-white/70 uppercase tracking-wide">Hours</div>
      </div>
      <div className="text-2xl sm:text-3xl font-bold text-white/50">:</div>
      <div className="text-center">
        <div className="text-2xl sm:text-3xl font-bold text-white">{timeLeft.minutes}</div>
        <div className="text-xs text-white/70 uppercase tracking-wide">Min</div>
      </div>
    </div>
  )
}

export default function SurveyPage() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [responseCount, setResponseCount] = useState(0)
  const [sessionId, setSessionId] = useState(null)

  const drawingEndDate = new Date('2026-01-20T23:59:59')

  // Initialize session and track landing page view
  useEffect(() => {
    const initSession = async () => {
      // Get or create session ID
      let sid = sessionStorage.getItem('survey_session_id')
      if (!sid) {
        sid = crypto.randomUUID()
        sessionStorage.setItem('survey_session_id', sid)
      }
      setSessionId(sid)

      // Track landing page view (only once per session)
      if (!sessionStorage.getItem('landing_tracked')) {
        const deviceType = /Mobile|Android|iPhone/i.test(navigator.userAgent) ? 'mobile' : 'desktop'
        const urlParams = new URLSearchParams(window.location.search)
        const source = urlParams.get('utm_source') || 'direct'

        const { error } = await supabase.from('survey_analytics').upsert({
          session_id: sid,
          landing_viewed: new Date().toISOString(),
          device_type: deviceType,
          source: source
        }, {
          onConflict: 'session_id'
        })
        
        if (error) {
          console.error('Analytics tracking error:', error)
        }

        sessionStorage.setItem('landing_tracked', 'true')
      }
    }

    initSession()
  }, [])

  // Fetch response count for landing page
  useEffect(() => {
    const fetchResponseCount = async () => {
      const { count } = await supabase
        .from('survey_responses')
        .select('*', { count: 'exact', head: true })
      
      setResponseCount(count || 0)
    }
    
    fetchResponseCount()
  }, [])

  const handleMultiSelect = (questionId, option) => {
    const current = answers[questionId] || []
    if (current.includes(option)) {
      setAnswers({ ...answers, [questionId]: current.filter((o) => o !== option) })
    } else {
      setAnswers({ ...answers, [questionId]: [...current, option] })
    }
  }

  const handleSingle = (questionId, option) => {
    setAnswers({ ...answers, [questionId]: option })
  }

  const handleText = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const handleScale = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: value })
  }

  const toggleEmailOption = (option) => {
    const current = answers.email_options || []
    if (current.includes(option)) {
      setAnswers({ ...answers, email_options: current.filter((o) => o !== option) })
    } else {
      setAnswers({ ...answers, email_options: [...current, option] })
    }
  }

  const handleSubmit = async () => {
    if (submitting) return
    
    setSubmitting(true)
    setError(null)

    const emailOptions = answers.email_options || []

    try {
      const { error: supabaseError } = await supabase.from('survey_responses').insert([
        {
          regions: answers.regions || [],
          regions_other_us: answers.regions_other_us || null,
          regions_international: answers.regions_international || null,
          planning_time: answers.planning_time || null,
          group_type: answers.group_type || null,
          hardest_part: answers.hardest_part || null,
          discovery: answers.discovery || [],
          discovery_other: answers.discovery_other || null,
          confidence: answers.confidence || null,
          driver: answers.driver || null,
          driver_other: answers.driver_other || null,
          reservations: answers.reservations || null,
          easier: answers.easier || null,
          surprise: answers.surprise || null,
          pay: answers.pay || null,
          source: answers.source || null,
          source_other: answers.source_other || null,
          email: answers.email || null,
          wants_drawing: emailOptions.includes('drawing'),
          wants_results: emailOptions.includes('results'),
          submitted_at: new Date().toISOString(),
        },
      ])

      if (supabaseError) throw supabaseError

      // Update analytics session to mark as completed
      if (sessionId) {
        await supabase.from('survey_analytics').update({
          completed: true,
          completed_at: new Date().toISOString()
        }).eq('session_id', sessionId)
      }

      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
      setError('Something went wrong. Please try again.')
      setSubmitting(false)
    }
  }

  const isOtherSelected = (questionId, optionName) => {
    const answer = answers[questionId]
    if (Array.isArray(answer)) {
      return answer.includes(optionName)
    }
    return answer === optionName
  }

  const renderQuestion = (q) => {
    switch (q.type) {
      case 'multiselect':
        return (
          <div className="space-y-2">
            {q.options.map((opt) => (
              <div key={opt}>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(answers[q.id] || []).includes(opt)}
                    onChange={() => handleMultiSelect(q.id, opt)}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-stone-700">{opt}</span>
                </label>
                {q.otherFields?.[opt] && isOtherSelected(q.id, opt) && (
                  <input
                    type="text"
                    value={answers[q.otherFields[opt].id] || ''}
                    onChange={(e) => handleText(q.otherFields[opt].id, e.target.value)}
                    placeholder={q.otherFields[opt].placeholder}
                    className="w-full mt-2 ml-7 p-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-stone-700 placeholder:text-stone-400"
                    style={{ width: 'calc(100% - 1.75rem)' }}
                  />
                )}
              </div>
            ))}
          </div>
        )
      case 'single':
        return (
          <div className="space-y-2">
            {q.options.map((opt) => (
              <div key={opt}>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === opt}
                    onChange={() => handleSingle(q.id, opt)}
                    className="w-4 h-4 text-amber-600 focus:ring-amber-500"
                  />
                  <span className="text-stone-700">{opt}</span>
                </label>
                {q.otherFields?.[opt] && isOtherSelected(q.id, opt) && (
                  <input
                    type="text"
                    value={answers[q.otherFields[opt].id] || ''}
                    onChange={(e) => handleText(q.otherFields[opt].id, e.target.value)}
                    placeholder={q.otherFields[opt].placeholder}
                    className="w-full mt-2 ml-7 p-3 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-stone-700 placeholder:text-stone-400"
                    style={{ width: 'calc(100% - 1.75rem)' }}
                  />
                )}
              </div>
            ))}
          </div>
        )
      case 'textarea':
        return (
          <textarea
            value={answers[q.id] || ''}
            onChange={(e) => handleText(q.id, e.target.value)}
            placeholder={q.placeholder}
            className="w-full h-32 p-4 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none resize-none text-stone-700 placeholder:text-stone-400"
          />
        )
      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-stone-500">
              <span>{q.lowLabel}</span>
              <span>{q.highLabel}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleScale(q.id, n)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all ${
                    answers[q.id] === n
                      ? 'bg-amber-500 text-white'
                      : 'bg-stone-100 text-stone-600 hover:bg-amber-100'
                  }`}
                >
                  {n}
                </button>
              ))}
            </div>
          </div>
        )
      case 'email_with_options':
        return (
          <div className="space-y-4">
            {q.subtext && <p className="text-sm text-stone-500">{q.subtext}</p>}
            <input
              type="email"
              value={answers.email || ''}
              onChange={(e) => handleText('email', e.target.value)}
              placeholder={q.placeholder}
              className="w-full p-4 rounded-lg border border-stone-200 focus:border-amber-400 focus:ring-2 focus:ring-amber-100 outline-none text-stone-700 placeholder:text-stone-400"
            />
            {answers.email && (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-stone-600 font-medium">What would you like?</p>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(answers.email_options || []).includes('drawing')}
                    onChange={() => toggleEmailOption('drawing')}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-stone-700">Enter the $50 gift card drawing</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border border-stone-200 hover:border-amber-300 hover:bg-amber-50 cursor-pointer transition-all">
                  <input
                    type="checkbox"
                    checked={(answers.email_options || []).includes('results')}
                    onChange={() => toggleEmailOption('results')}
                    className="w-4 h-4 text-amber-600 rounded focus:ring-amber-500"
                  />
                  <span className="text-stone-700">Send me the survey results</span>
                </label>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // Landing Screen - OPTIMIZED FOR CONVERSION
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100">
        {/* Hero Section - Everything above the fold */}
        <div className="px-4 pt-6 pb-4">
          <div className="max-w-lg mx-auto">
            {/* Compact Header */}
            <div className="text-center mb-4">
              <div className="inline-flex items-center gap-2 mb-3">
                <svg width="32" height="40" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M40 10C40 10 20 30 20 50C20 61.046 28.954 70 40 70C51.046 70 60 61.046 60 50C60 30 40 10 40 10Z" stroke="#6B2D3F" strokeWidth="2.5" fill="none"/>
                  <path d="M32 52C32 52 36 46 40 46C44 46 48 52 48 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
                  <path d="M40 70V88" stroke="#6B2D3F" strokeWidth="2"/>
                  <path d="M32 88H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
                </svg>
                <span className="text-sm font-semibold tracking-wide" style={{ color: '#6B2D3F' }}>VALLEY SOMM</span>
              </div>
            </div>

            {/* Main Value Prop Card */}
            <div className="bg-white rounded-2xl shadow-xl overflow-hidden">
              {/* Gift Card Banner - THE HOOK */}
              <div className="p-5 text-center" style={{ backgroundColor: '#6B2D3F' }}>
                <div className="text-3xl mb-2">🎁</div>
                <h1 className="text-xl sm:text-2xl font-bold text-white mb-1">
                  Win a $50 Wine.com Gift Card
                </h1>
                <p className="text-white/80 text-sm">
                  Planning wine trips is harder than it should be. Help us fix that.
                </p>
              </div>

              {/* Survey Ask */}
              <div className="p-5 text-center border-b border-stone-100">
                <h2 className="text-lg font-semibold text-stone-800 mb-2">
                  Share your wine trip experience
                </h2>
                <p className="text-stone-600 text-sm">
                  3-minute survey • 100% anonymous
                </p>
              </div>

              {/* Social Proof + CTA */}
              <div className="p-5">
                <div className="flex items-center justify-center gap-2 mb-4">
                  <div className="flex -space-x-2">
                    <div className="w-8 h-8 rounded-full bg-amber-200 flex items-center justify-center text-xs">🍷</div>
                    <div className="w-8 h-8 rounded-full bg-rose-200 flex items-center justify-center text-xs">🍇</div>
                    <div className="w-8 h-8 rounded-full bg-emerald-200 flex items-center justify-center text-xs">✨</div>
                  </div>
                  <span className="text-sm text-stone-600">
                    <strong style={{ color: '#6B2D3F' }}>{responseCount}+</strong> wine lovers have shared
                  </span>
                </div>

                {/* PRIMARY CTA - ABOVE THE FOLD */}
                <button
                  onClick={async () => {
                    setStarted(true)
                    setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
                    
                    // Track survey start
                    if (sessionId) {
                      await supabase.from('survey_analytics').update({
                        step_events: [{
                          step: 1,
                          timestamp: new Date().toISOString()
                        }]
                      }).eq('session_id', sessionId)
                    }
                  }}
                  className="w-full py-4 text-white font-bold text-lg rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg"
                  style={{ backgroundColor: '#6B2D3F' }}
                  onMouseEnter={(e) => e.target.style.backgroundColor = '#8B3A4D'}
                  onMouseLeave={(e) => e.target.style.backgroundColor = '#6B2D3F'}
                >
                  Share & Enter to Win →
                </button>
              </div>

              {/* Countdown Timer */}
              <div className="px-5 pb-5">
                <div className="rounded-xl p-4" style={{ backgroundColor: '#2D4A3E' }}>
                  <p className="text-center text-white/80 text-xs uppercase tracking-wide mb-2">Drawing ends in</p>
                  <CountdownTimer targetDate={drawingEndDate} />
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Below the fold - Additional info for scrollers */}
        <div className="px-4 pb-8">
          <div className="max-w-lg mx-auto">
            {/* What We're Building */}
            <div className="bg-white rounded-2xl shadow-lg p-6 mb-4">
              <h3 className="font-semibold text-stone-800 mb-3 text-center">Why your input matters</h3>
              <p className="text-stone-600 text-sm text-center mb-4">
                {"We're building an AI tool to make wine trip planning effortless. Your real experiences will shape what we create."}
              </p>
              <div className="space-y-3">
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🗺️</span>
                  </div>
                  <div>
                    <p className="text-sm text-stone-700"><strong>Tell us what frustrated you</strong></p>
                    <p className="text-xs text-stone-500">Research? Reservations? Routes?</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">💡</span>
                  </div>
                  <div>
                    <p className="text-sm text-stone-700"><strong>Share what would have helped</strong></p>
                    <p className="text-xs text-stone-500">Your ideas become features</p>
                  </div>
                </div>
                <div className="flex items-start gap-3">
                  <div className="w-8 h-8 rounded-full bg-amber-100 flex items-center justify-center flex-shrink-0">
                    <span className="text-sm">🎁</span>
                  </div>
                  <div>
                    <p className="text-sm text-stone-700"><strong>Get entered to win $50</strong></p>
                    <p className="text-xs text-stone-500">Wine.com gift card</p>
                  </div>
                </div>
              </div>
            </div>

            {/* Trust Signals */}
            <div className="bg-white rounded-2xl shadow-lg p-6">
              <h3 className="font-semibold text-stone-800 mb-3 text-center">What to expect</h3>
              <ul className="space-y-2">
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#2D4A3E' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span><strong>3 minutes</strong> — 13 quick questions</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#2D4A3E' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span><strong>100% anonymous</strong> — email optional</span>
                </li>
                <li className="flex items-center gap-2 text-sm text-stone-600">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#2D4A3E' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span><strong>No spam</strong> — just the drawing + results</span>
                </li>
              </ul>

              {/* Secondary CTA */}
              <button
                onClick={async () => {
                  setStarted(true)
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
                  
                  if (sessionId) {
                    await supabase.from('survey_analytics').update({
                      step_events: [{
                        step: 1,
                        timestamp: new Date().toISOString()
                      }]
                    }).eq('session_id', sessionId)
                  }
                }}
                className="w-full mt-4 py-3 text-white font-semibold rounded-xl transition-all"
                style={{ backgroundColor: '#6B2D3F' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#8B3A4D'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#6B2D3F'}
              >
                Share & Enter to Win →              </button>
            </div>

            <p className="text-center text-xs text-stone-400 mt-4">
              Valley Somm • Building better wine country experiences
            </p>
          </div>
        </div>
      </div>
    )
  }

  // Thank You Screen
  if (submitted) {
    const emailOptions = answers.email_options || []
    const wantsDrawing = emailOptions.includes('drawing')
    const wantsResults = emailOptions.includes('results')

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="w-16 h-16 mx-auto mb-4 rounded-full flex items-center justify-center" style={{ backgroundColor: '#2D4A3E' }}>
            <svg className="w-8 h-8 text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Thank you!</h2>
          <p className="text-stone-600 mb-4">
            Your insights will help make wine country trips better for everyone. Cheers! 🍷
          </p>
          {answers.email && (wantsDrawing || wantsResults) && (
            <div className="bg-amber-50 rounded-lg p-4 mb-6 text-left">
              <p className="text-sm font-medium text-stone-700 mb-2">{"What's next:"}</p>
              <ul className="text-sm text-stone-600 space-y-1">
                {wantsDrawing && <li>✓ {"You're entered in the $50 gift card drawing"}</li>}
                {wantsResults && <li>✓ {"We'll email you the survey results"}</li>}
              </ul>
              <p className="text-xs text-stone-500 mt-2">Drawing: January 20, 2026</p>
            </div>
          )}
          <a 
            href="https://beta.valleysomm.com" 
            className="inline-block w-full py-3 text-white font-medium rounded-lg transition-colors"
            style={{ backgroundColor: '#6B2D3F' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#8B3A4D'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#6B2D3F'}
          >
            Preview ValleySomm Beta →
          </a>
          <p className="text-sm text-stone-400 mt-4">
            See what {"we're"} building at <a href="https://beta.valleysomm.com" className="hover:underline" style={{ color: '#8B3A4D' }}>beta.valleysomm.com</a>
          </p>
        </div>
      </div>
    )
  }

  // Survey Questions (unchanged)
  const currentQuestions = steps[currentStep].questions.map((i) => questions[i])
  const progressPercent = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-4 sm:p-6">
      <div className="max-w-2xl mx-auto">
        {/* Compact Header */}
        <div className="text-center mb-4">
          <div className="inline-flex items-center gap-2 mb-2">
            <svg width="28" height="35" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 10C40 10 20 30 20 50C20 61.046 28.954 70 40 70C51.046 70 60 61.046 60 50C60 30 40 10 40 10Z" stroke="#6B2D3F" strokeWidth="2.5" fill="none"/>
              <path d="M32 52C32 52 36 46 40 46C44 46 48 52 48 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M40 70V88" stroke="#6B2D3F" strokeWidth="2"/>
              <path d="M32 88H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
            <span className="text-sm font-semibold" style={{ color: '#6B2D3F' }}>Wine Trip Survey</span>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-6">
          <div className="flex justify-between items-center mb-2">
            <span className="text-xs font-medium text-stone-500">
              Step {currentStep + 1} of {steps.length}
            </span>
            <span className="text-xs font-medium" style={{ color: '#6B2D3F' }}>
              {steps[currentStep].title}
            </span>
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: '#6B2D3F'
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-5 sm:p-8 space-y-6">
          {currentQuestions.map((q) => (
            <div key={q.id} className="space-y-3">
              <h3 className="text-base sm:text-lg font-semibold text-stone-800">{q.question}</h3>
              {renderQuestion(q)}
            </div>
          ))}

          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          <div className="flex justify-between pt-4 border-t border-stone-100">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => {
                  setCurrentStep(currentStep - 1)
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
                }}
                disabled={submitting}
                className="px-4 sm:px-6 py-2 text-stone-600 hover:text-stone-800 font-medium disabled:opacity-50"
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={async () => {
                  const nextStep = currentStep + 2
                  setCurrentStep(currentStep + 1)
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
                  
                  if (sessionId) {
                    const { data: currentData } = await supabase
                      .from('survey_analytics')
                      .select('step_events')
                      .eq('session_id', sessionId)
                      .maybeSingle()
                    
                    const existingEvents = currentData?.step_events || []
                    await supabase.from('survey_analytics').update({
                      step_events: [...existingEvents, {
                        step: nextStep,
                        timestamp: new Date().toISOString()
                      }]
                    }).eq('session_id', sessionId)
                  }
                }}
                disabled={submitting}
                className="px-5 sm:px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#6B2D3F' }}
                onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#8B3A4D')}
                onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = '#6B2D3F')}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-5 sm:px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
                style={{ backgroundColor: submitting ? '#C4637A' : '#6B2D3F' }}
                onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#8B3A4D')}
                onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = '#6B2D3F')}
              >
                {submitting ? (
                  <>
                    <svg className="animate-spin h-4 w-4" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                      <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                      <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                    </svg>
                    Submitting...
                  </>
                ) : (
                  'Submit Survey 🍷'
                )}
              </button>
            )}
          </div>
        </div>

        <p className="text-center text-xs text-stone-400 mt-4">
          🎁 Drawing ends January 20, 2026
        </p>
      </div>
    </div>
  )
}
