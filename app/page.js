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

export default function SurveyPage() {
  const [started, setStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [responseCount, setResponseCount] = useState(0)
  const [sessionId, setSessionId] = useState(null)

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

  // Landing Screen
  if (!started) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-6">
        <div className="max-w-2xl w-full">
          <div className="bg-white rounded-2xl shadow-xl p-8 sm:p-12">
            {/* Wine glass icon */}
            <div className="flex justify-center mb-6">
              <svg width="70" height="87" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 10C40 10 20 30 20 50C20 61.046 28.954 70 40 70C51.046 70 60 61.046 60 50C60 30 40 10 40 10Z" stroke="#6B2D3F" strokeWidth="2.5" fill="none"/>
                <path d="M32 52C32 52 36 46 40 46C44 46 48 52 48 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M40 70V88" stroke="#6B2D3F" strokeWidth="2"/>
                <path d="M32 88H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>

            {/* Brand name */}
            <div className="text-center mb-6">
              <h1 className="text-sm font-medium tracking-wide mb-2" style={{ color: '#8B3A4D' }}>VALLEY SOMM</h1>
              <h2 className="text-3xl sm:text-4xl font-bold text-stone-800 mb-3">Wine Country Trip Survey</h2>
              <p className="text-lg text-stone-600 mb-6">
                Help us build the perfect wine trip planning tool
              </p>
            </div>

            {/* Response Counter - Social Proof */}
            <div className="mb-8">
              <div className="bg-gradient-to-br from-amber-50 to-stone-50 rounded-xl p-6 text-center border border-amber-100">
                <div className="text-4xl font-bold mb-2" style={{ color: '#6B2D3F' }}>
                  {responseCount}+
                </div>
                <div className="text-sm text-stone-600">Wine lovers have shared their experiences</div>
              </div>
            </div>

            {/* Why Your Input Matters */}
            <div className="space-y-3 mb-8">
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex-shrink-0 text-xl">🍷</div>
                <div className="text-sm text-stone-700">
                  <span className="font-semibold">Your experience matters</span> — every insight helps us understand real trip planning challenges
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex-shrink-0 text-xl">🗺️</div>
                <div className="text-sm text-stone-700">
                  <span className="font-semibold">Shape the future</span> — your feedback directly influences what we build for wine travelers
                </div>
              </div>
              <div className="flex items-start gap-3 p-4 bg-amber-50 rounded-lg border border-amber-100">
                <div className="flex-shrink-0 text-xl">✨</div>
                <div className="text-sm text-stone-700">
                  <span className="font-semibold">Join the community</span> — be part of making wine country trips easier for everyone
                </div>
              </div>
            </div>

            {/* Urgency Banner */}
            <div className="mb-8 p-4 rounded-lg text-center border" style={{ backgroundColor: '#6B2D3F', color: 'white', borderColor: '#8B3A4D' }}>
              <div className="text-sm font-medium mb-1">⏰ Drawing closes January 20, 2025</div>
              <div className="text-xs opacity-90">Complete the survey to enter for a $50 Yadkin Valley gift card</div>
            </div>

            {/* What to Expect */}
            <div className="mb-8">
              <h3 className="font-semibold text-stone-800 mb-3">What to expect:</h3>
              <ul className="space-y-2 text-sm text-stone-600">
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#8B3A4D' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span><strong>3 minutes</strong> • 13 questions about your wine trip planning</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#8B3A4D' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span><strong>100% anonymous</strong> • Email optional for gift card drawing only</span>
                </li>
                <li className="flex items-center gap-2">
                  <svg className="w-5 h-5 flex-shrink-0" style={{ color: '#8B3A4D' }} fill="currentColor" viewBox="0 0 20 20">
                    <path fillRule="evenodd" d="M10 18a8 8 0 100-16 8 8 0 000 16zm3.707-9.293a1 1 0 00-1.414-1.414L9 10.586 7.707 9.293a1 1 0 00-1.414 1.414l2 2a1 1 0 001.414 0l4-4z" clipRule="evenodd"/>
                  </svg>
                  <span><strong>Make an impact</strong> • Help improve wine tourism experiences</span>
                </li>
              </ul>
            </div>

            {/* CTA Button */}
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
              className="w-full py-4 text-white font-semibold rounded-lg transition-all transform hover:scale-[1.02] shadow-lg"
              style={{ backgroundColor: '#6B2D3F' }}
              onMouseEnter={(e) => e.target.style.backgroundColor = '#8B3A4D'}
              onMouseLeave={(e) => e.target.style.backgroundColor = '#6B2D3F'}
            >
              Start Survey 🍷
            </button>

            <p className="text-center text-xs text-stone-400 mt-4">
              Your insights help us build better wine country experiences
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
          <div className="flex justify-center mb-4">
            <svg width="60" height="75" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 10C40 10 20 30 20 50C20 61.046 28.954 70 40 70C51.046 70 60 61.046 60 50C60 30 40 10 40 10Z" stroke="#6B2D3F" strokeWidth="2.5" fill="none"/>
              <path d="M32 52C32 52 36 46 40 46C44 46 48 52 48 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M40 70V88" stroke="#6B2D3F" strokeWidth="2"/>
              <path d="M32 88H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Thank you!</h2>
          <p className="text-stone-600 mb-4">
            Your insights will help make wine country trips better for everyone. Cheers to that.
          </p>
          {answers.email && (wantsDrawing || wantsResults) && (
            <div className="text-sm text-stone-500 space-y-1 mb-6">
              {wantsDrawing && <p>{"You're entered in the gift card drawing."}</p>}
              {wantsResults && <p>{"We'll send you the results when they're ready."}</p>}
            </div>
          )}
          <a 
            href="https://valleysomm.com" 
            className="inline-block px-6 py-3 text-white font-medium rounded-lg transition-colors"
            style={{ backgroundColor: '#8B3A4D' }}
            onMouseEnter={(e) => e.target.style.backgroundColor = '#6B2D3F'}
            onMouseLeave={(e) => e.target.style.backgroundColor = '#8B3A4D'}
          >
            Explore Yadkin Valley Wineries
          </a>
          <p className="text-sm text-stone-400 mt-4">
            Learn more about ValleySomm at <a href="https://valleysomm.com" className="hover:underline" style={{ color: '#8B3A4D' }}>valleysomm.com</a>
          </p>
        </div>
      </div>
    )
  }

  // Survey Questions
  const currentQuestions = steps[currentStep].questions.map((i) => questions[i])
  const progressPercent = ((currentStep + 1) / steps.length) * 100

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-6">
          <div className="flex justify-center mb-3">
            <svg width="50" height="62" viewBox="0 0 80 100" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 10C40 10 20 30 20 50C20 61.046 28.954 70 40 70C51.046 70 60 61.046 60 50C60 30 40 10 40 10Z" stroke="#6B2D3F" strokeWidth="2.5" fill="none"/>
              <path d="M32 52C32 52 36 46 40 46C44 46 48 52 48 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M40 70V88" stroke="#6B2D3F" strokeWidth="2"/>
              <path d="M32 88H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-sm font-medium mb-2" style={{ color: '#8B3A4D' }}>Valley Somm</div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Wine Country Trip Survey</h1>
          <p className="text-stone-600">{"Help us understand what makes wine trips great (and what doesn't)"}</p>
          <p className="text-sm text-stone-500 mt-1">3 minutes • Anonymous • Win $50 gift card</p>
        </div>

        <div className="mb-8">
          <div className="hidden sm:flex justify-between mb-2">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`text-xs font-medium transition-colors ${
                  i === currentStep ? 'text-wine-burgundy' : i < currentStep ? 'text-amber-400' : 'text-stone-400'
                }`}
                style={i === currentStep ? { color: '#8B3A4D' } : {}}
              >
                {step.title}
              </div>
            ))}
          </div>
          
          <div className="sm:hidden text-center mb-2">
            <span className="text-sm font-medium" style={{ color: '#8B3A4D' }}>
              Step {currentStep + 1} of {steps.length}
            </span>
          </div>
          
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full transition-all duration-300"
              style={{ 
                width: `${progressPercent}%`,
                backgroundColor: '#8B3A4D'
              }}
            />
          </div>
        </div>

        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
          {currentQuestions.map((q) => (
            <div key={q.id} className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800">{q.question}</h3>
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
                className="px-6 py-2 text-stone-600 hover:text-stone-800 font-medium disabled:opacity-50"
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
                  const nextStep = currentStep + 2 // currentStep is 0-indexed, but steps are 1-4
                  setCurrentStep(currentStep + 1)
                  setTimeout(() => window.scrollTo({ top: 0, behavior: 'smooth' }), 0)
                  
                  // Track step progression
                  if (sessionId) {
                    const { data: currentData } = await supabase
                      .from('survey_analytics')
                      .select('step_events')
                      .eq('session_id', sessionId)
                      .single()
                    
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
                className="px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50"
                style={{ backgroundColor: '#8B3A4D' }}
                onMouseEnter={(e) => !submitting && (e.target.style.backgroundColor = '#6B2D3F')}
                onMouseLeave={(e) => !submitting && (e.target.style.backgroundColor = '#8B3A4D')}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 text-white font-medium rounded-lg transition-colors disabled:opacity-50 flex items-center gap-2"
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

        <p className="text-center text-sm text-stone-400 mt-6">
          Drawing ends January 20, 2025
        </p>
      </div>
    </div>
  )
}