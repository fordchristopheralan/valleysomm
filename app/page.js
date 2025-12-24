'use client'

import { useState } from 'react'
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
  const [hasStarted, setHasStarted] = useState(false)
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)

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

      setSubmitted(true)
    } catch (err) {
      console.error('Submission error:', err)
      setError('Something went wrong. Please try again.')
    } finally {
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
                <label className="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer" 
                  style={{ 
                    borderColor: (answers[q.id] || []).includes(opt) ? '#8B3A4D' : '#E8E0D5',
                    backgroundColor: (answers[q.id] || []).includes(opt) ? '#FAF7F2' : 'transparent'
                  }}>
                  <input
                    type="checkbox"
                    checked={(answers[q.id] || []).includes(opt)}
                    onChange={() => handleMultiSelect(q.id, opt)}
                    className="w-4 h-4 rounded focus:ring-2"
                    style={{ 
                      accentColor: '#8B3A4D',
                      '--tw-ring-color': '#C9A962'
                    }}
                  />
                  <span style={{ color: '#2C2C30' }}>{opt}</span>
                </label>
                {q.otherFields?.[opt] && isOtherSelected(q.id, opt) && (
                  <input
                    type="text"
                    value={answers[q.otherFields[opt].id] || ''}
                    onChange={(e) => handleText(q.otherFields[opt].id, e.target.value)}
                    placeholder={q.otherFields[opt].placeholder}
                    className="w-full mt-2 ml-7 p-3 rounded-lg border outline-none"
                    style={{ 
                      width: 'calc(100% - 1.75rem)',
                      borderColor: '#E8E0D5',
                      color: '#2C2C30'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8B3A4D'}
                    onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
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
                <label className="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                  style={{ 
                    borderColor: answers[q.id] === opt ? '#8B3A4D' : '#E8E0D5',
                    backgroundColor: answers[q.id] === opt ? '#FAF7F2' : 'transparent'
                  }}>
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === opt}
                    onChange={() => handleSingle(q.id, opt)}
                    className="w-4 h-4"
                    style={{ accentColor: '#8B3A4D' }}
                  />
                  <span style={{ color: '#2C2C30' }}>{opt}</span>
                </label>
                {q.otherFields?.[opt] && isOtherSelected(q.id, opt) && (
                  <input
                    type="text"
                    value={answers[q.otherFields[opt].id] || ''}
                    onChange={(e) => handleText(q.otherFields[opt].id, e.target.value)}
                    placeholder={q.otherFields[opt].placeholder}
                    className="w-full mt-2 ml-7 p-3 rounded-lg border outline-none"
                    style={{ 
                      width: 'calc(100% - 1.75rem)',
                      borderColor: '#E8E0D5',
                      color: '#2C2C30'
                    }}
                    onFocus={(e) => e.target.style.borderColor = '#8B3A4D'}
                    onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
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
            className="w-full h-32 p-4 rounded-lg border outline-none resize-none"
            style={{ 
              borderColor: '#E8E0D5',
              color: '#2C2C30'
            }}
            onFocus={(e) => e.target.style.borderColor = '#8B3A4D'}
            onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
          />
        )
      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm" style={{ color: '#4A4A50' }}>
              <span>{q.lowLabel}</span>
              <span>{q.highLabel}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleScale(q.id, n)}
                  className="flex-1 py-3 rounded-lg font-medium transition-all"
                  style={{
                    backgroundColor: answers[q.id] === n ? '#8B3A4D' : '#FAF7F2',
                    color: answers[q.id] === n ? 'white' : '#4A4A50'
                  }}
                  onMouseEnter={(e) => {
                    if (answers[q.id] !== n) {
                      e.target.style.backgroundColor = '#E8E0D5'
                    }
                  }}
                  onMouseLeave={(e) => {
                    if (answers[q.id] !== n) {
                      e.target.style.backgroundColor = '#FAF7F2'
                    }
                  }}
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
            {q.subtext && <p className="text-sm" style={{ color: '#4A4A50' }}>{q.subtext}</p>}
            <input
              type="email"
              value={answers.email || ''}
              onChange={(e) => handleText('email', e.target.value)}
              placeholder={q.placeholder}
              className="w-full p-4 rounded-lg border outline-none"
              style={{ 
                borderColor: '#E8E0D5',
                color: '#2C2C30'
              }}
              onFocus={(e) => e.target.style.borderColor = '#8B3A4D'}
              onBlur={(e) => e.target.style.borderColor = '#E8E0D5'}
            />
            {answers.email && (
              <div className="space-y-2 pt-2">
                <p className="text-sm font-medium" style={{ color: '#4A4A50' }}>What would you like?</p>
                <label className="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                  style={{ 
                    borderColor: (answers.email_options || []).includes('drawing') ? '#8B3A4D' : '#E8E0D5',
                    backgroundColor: (answers.email_options || []).includes('drawing') ? '#FAF7F2' : 'transparent'
                  }}>
                  <input
                    type="checkbox"
                    checked={(answers.email_options || []).includes('drawing')}
                    onChange={() => toggleEmailOption('drawing')}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#8B3A4D' }}
                  />
                  <span style={{ color: '#2C2C30' }}>Enter the $50 gift card drawing</span>
                </label>
                <label className="flex items-center gap-3 p-3 rounded-lg border transition-all cursor-pointer"
                  style={{ 
                    borderColor: (answers.email_options || []).includes('results') ? '#8B3A4D' : '#E8E0D5',
                    backgroundColor: (answers.email_options || []).includes('results') ? '#FAF7F2' : 'transparent'
                  }}>
                  <input
                    type="checkbox"
                    checked={(answers.email_options || []).includes('results')}
                    onChange={() => toggleEmailOption('results')}
                    className="w-4 h-4 rounded"
                    style={{ accentColor: '#8B3A4D' }}
                  />
                  <span style={{ color: '#2C2C30' }}>Send me the survey results</span>
                </label>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  // THANK YOU SCREEN
  if (submitted) {
    const emailOptions = answers.email_options || []
    const wantsDrawing = emailOptions.includes('drawing')
    const wantsResults = emailOptions.includes('results')

    return (
      <div className="min-h-screen flex items-center justify-center p-6" style={{ background: 'linear-gradient(to bottom right, #FAF7F2, #E8E0D5)' }}>
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          {/* Logo */}
          <div className="flex justify-center mb-4">
            <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
              <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="#6B2D3F" strokeWidth="2" fill="none"/>
              <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M40 68V76" stroke="#6B2D3F" strokeWidth="2"/>
              <path d="M32 76H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          
          <h2 className="text-2xl font-bold mb-2" style={{ color: '#2C2C30' }}>Thank you!</h2>
          <p className="mb-6 leading-relaxed" style={{ color: '#4A4A50' }}>
            Your insights will help make wine country trips better for everyone. Cheers to that.
          </p>
          
          {answers.email && (wantsDrawing || wantsResults) && (
            <div className="text-sm mb-6 p-4 rounded-lg" style={{ backgroundColor: '#FAF7F2', color: '#4A4A50' }}>
              {wantsDrawing && <p className="mb-1">✓ You're entered in the gift card drawing</p>}
              {wantsResults && <p>✓ We'll send you the results when ready</p>}
            </div>
          )}

          {/* CTA - Explore ValleySomm */}
          <div className="space-y-3">
            <a
              href="/"
              className="block w-full py-3 px-6 text-white font-semibold rounded-xl transition-all shadow-lg text-center"
              style={{ background: 'linear-gradient(135deg, #8B3A4D 0%, #6B2D3F 100%)' }}
            >
              Explore Yadkin Valley Wineries
            </a>
            <p className="text-xs" style={{ color: '#B8A99A' }}>
              Learn more about ValleySomm at{' '}
              <a href="/" className="underline" style={{ color: '#6B2D3F' }}>
                valleysomm.com
              </a>
            </p>
          </div>
        </div>
      </div>
    )
  }

  // START SCREEN - MOBILE OPTIMIZED WITH VALLEYSOMM BRANDING
  if (!hasStarted) {
    return (
      <div className="min-h-screen p-4 sm:p-6" style={{ background: 'linear-gradient(to bottom right, #FAF7F2, #E8E0D5)' }}>
        <div className="max-w-2xl mx-auto">
          {/* Header with Logo - COMPACT */}
          <div className="text-center mb-6">
            {/* Logo - Slightly Smaller on Mobile */}
            <div className="flex justify-center mb-3">
              <svg width="50" height="50" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[60px] sm:h-[60px]">
                <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="#6B2D3F" strokeWidth="2" fill="none"/>
                <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M40 68V76" stroke="#6B2D3F" strokeWidth="2"/>
                <path d="M32 76H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="text-xs sm:text-sm font-medium mb-1.5" style={{ color: '#6B2D3F' }}>Valley Somm</div>
            <h1 className="text-2xl sm:text-3xl font-bold mb-1.5 leading-tight" style={{ color: '#2C2C30' }}>Wine Country Trip Survey</h1>
            <p className="text-sm sm:text-base" style={{ color: '#4A4A50' }}>Help us understand wine trip planning</p>
          </div>

          {/* Main Start Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-4">
            {/* Social Proof Banner - COMPACT */}
            <div className="px-4 py-3 text-white text-center" style={{ background: 'linear-gradient(135deg, #6B2D3F 0%, #8B3A4D 100%)' }}>
              <p className="font-semibold text-base sm:text-lg">🍷 Join 340+ wine lovers</p>
            </div>

            <div className="p-5 sm:p-8">
              {/* The Problem - CONDENSED */}
              <div className="mb-5">
                <h2 className="text-xl sm:text-2xl font-bold mb-2 leading-tight" style={{ color: '#2C2C30' }}>
                  Planning a wine trip shouldn't be stressful
                </h2>
                <p className="text-sm sm:text-base leading-relaxed mb-3" style={{ color: '#4A4A50' }}>
                  Yet many visitors tell us it is. We're learning what makes planning hard—and what would make it easier.
                </p>
              </div>

              {/* Quick Stats - MORE COMPACT */}
              <div className="rounded-xl p-4 mb-5" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8E0D5' }}>
                <p className="text-xs font-semibold mb-2.5" style={{ color: '#6B2D3F' }}>🎯 What we're learning:</p>
                <ul className="space-y-1.5 text-xs sm:text-sm" style={{ color: '#4A4A50' }}>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>Couples dominate</strong> wine country visits</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>1-2 weeks advance planning</strong> is typical</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>Confidence varies widely</strong> in winery selection</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold mt-0.5" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>Google is the starting point</strong> for most</span>
                  </li>
                </ul>
              </div>

              {/* Why Take This - COMPACT ICONS */}
              <div className="space-y-2.5 mb-5">
                <div className="flex items-center gap-2.5 text-sm" style={{ color: '#4A4A50' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#C9A962" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>3 minutes</strong> (actually timed)</span>
                </div>
                <div className="flex items-center gap-2.5 text-sm" style={{ color: '#4A4A50' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#C9A962" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>100% anonymous</strong></span>
                </div>
                <div className="flex items-center gap-2.5 text-sm" style={{ color: '#4A4A50' }}>
                  <svg className="w-4 h-4 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#C9A962" strokeWidth="2">
                    <path strokeLinecap="round" strokeLinejoin="round" d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span><strong>Win $50</strong> gift card (Jan 20)</span>
                </div>
              </div>

              {/* CTA Button - PROMINENT */}
              <button
                onClick={() => setHasStarted(true)}
                className="w-full py-4 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg text-base sm:text-lg"
                style={{ background: 'linear-gradient(135deg, #8B3A4D 0%, #6B2D3F 100%)' }}
              >
                Share Your Experience 🍷
              </button>

              <p className="text-xs text-center mt-3 leading-relaxed" style={{ color: '#B8A99A' }}>
                Your honest feedback helps improve wine tourism
              </p>
            </div>
          </div>

          {/* Footer - COMPACT */}
          <p className="text-center text-xs sm:text-sm" style={{ color: '#B8A99A' }}>
            Questions? Email hello@valleysomm.com
          </p>
        </div>
      </div>
    )
  }

  // SURVEY QUESTIONS
  const currentQuestions = steps[currentStep].questions.map((i) => questions[i])

  return (
    <div className="min-h-screen p-4 sm:p-6" style={{ background: 'linear-gradient(to bottom right, #FAF7F2, #E8E0D5)' }}>
      <div className="max-w-2xl mx-auto">
        {/* Header with Logo */}
        <div className="text-center mb-6">
          {/* Logo */}
          <div className="flex justify-center mb-3">
            <svg width="40" height="40" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg" className="sm:w-[50px] sm:h-[50px]">
              <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="#6B2D3F" strokeWidth="2" fill="none"/>
              <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
              <path d="M40 68V76" stroke="#6B2D3F" strokeWidth="2"/>
              <path d="M32 76H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
            </svg>
          </div>
          <div className="text-xs sm:text-sm font-medium mb-1" style={{ color: '#6B2D3F' }}>Valley Somm</div>
          <h1 className="text-xl sm:text-2xl font-bold mb-1" style={{ color: '#2C2C30' }}>Wine Country Trip Survey</h1>
          <p className="text-xs sm:text-sm" style={{ color: '#4A4A50' }}>3 minutes • Anonymous • Win $50 gift card</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, i) => (
              <div
                key={i}
                className="text-xs sm:text-sm font-medium"
                style={{
                  color: i === currentStep ? '#6B2D3F' : i < currentStep ? '#8B3A4D' : '#B8A99A'
                }}
              >
                {step.title}
              </div>
            ))}
          </div>
          <div className="h-2 rounded-full overflow-hidden" style={{ backgroundColor: '#E8E0D5' }}>
            <div
              className="h-full transition-all duration-300"
              style={{ 
                width: `${((currentStep + 1) / steps.length) * 100}%`,
                background: 'linear-gradient(90deg, #8B3A4D 0%, #6B2D3F 100%)'
              }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
          {currentQuestions.map((q) => (
            <div key={q.id} className="space-y-4">
              <h3 className="text-lg font-semibold" style={{ color: '#2C2C30' }}>{q.question}</h3>
              {renderQuestion(q)}
            </div>
          ))}

          {/* Error message */}
          {error && (
            <div className="p-4 rounded-lg text-sm" style={{ backgroundColor: '#FEE2E2', borderColor: '#F87171', color: '#991B1B', border: '1px solid' }}>
              {error}
            </div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4" style={{ borderTop: '1px solid #E8E0D5' }}>
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 font-medium"
                style={{ color: '#4A4A50' }}
                onMouseEnter={(e) => e.target.style.color = '#2C2C30'}
                onMouseLeave={(e) => e.target.style.color = '#4A4A50'}
              >
                ← Back
              </button>
            ) : (
              <div />
            )}

            {currentStep < steps.length - 1 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep + 1)}
                className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
                style={{ backgroundColor: '#8B3A4D' }}
                onMouseEnter={(e) => e.target.style.backgroundColor = '#6B2D3F'}
                onMouseLeave={(e) => e.target.style.backgroundColor = '#8B3A4D'}
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 text-white font-medium rounded-lg transition-colors"
                style={{ backgroundColor: submitting ? '#B8A99A' : '#6B2D3F' }}
                onMouseEnter={(e) => {
                  if (!submitting) e.target.style.backgroundColor = '#8B3A4D'
                }}
                onMouseLeave={(e) => {
                  if (!submitting) e.target.style.backgroundColor = '#6B2D3F'
                }}
              >
                {submitting ? 'Submitting...' : 'Submit Survey 🍷'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm mt-6" style={{ color: '#B8A99A' }}>
          Your responses are anonymous and help improve wine tourism for everyone.
        </p>
      </div>
    </div>
  )
}