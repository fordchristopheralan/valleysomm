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
  const [currentStep, setCurrentStep] = useState(0)
  const [answers, setAnswers] = useState({})
  const [submitted, setSubmitted] = useState(false)
  const [submitting, setSubmitting] = useState(false)
  const [error, setError] = useState(null)
  const [hasStarted, setHasStarted] = useState(false)

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

  const handleCheckbox = (questionId, value) => {
    setAnswers({ ...answers, [questionId]: !answers[questionId] ? value : !answers[questionId] })
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

  // START SCREEN - WITH CORRECT BRANDING
  // START SCREEN - WITH LOGO AND CORRECT BRANDING
  if (!hasStarted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
        <div className="max-w-2xl mx-auto">
          {/* Header with Logo */}
          <div className="text-center mb-8">
            {/* Logo */}
            <div className="flex justify-center mb-4">
              <svg width="60" height="60" viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
                <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="#6B2D3F" strokeWidth="2" fill="none"/>
                <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2" fill="none" strokeLinecap="round"/>
                <path d="M40 68V76" stroke="#6B2D3F" strokeWidth="2"/>
                <path d="M32 76H48" stroke="#6B2D3F" strokeWidth="2" strokeLinecap="round"/>
              </svg>
            </div>
            
            <div className="text-sm font-medium mb-2" style={{ color: '#6B2D3F' }}>Valley Somm</div>
            <h1 className="text-3xl font-bold mb-2" style={{ color: '#2C2C30' }}>Wine Country Trip Survey</h1>
            <p style={{ color: '#4A4A50' }}>{"Help us understand what makes wine trips great (and what doesn't)"}</p>
          </div>

          {/* Main Start Card */}
          <div className="bg-white rounded-2xl shadow-xl overflow-hidden mb-6">
            {/* Social Proof Banner */}
            <div className="px-6 py-4 text-white text-center" style={{ background: 'linear-gradient(135deg, #6B2D3F 0%, #8B3A4D 100%)' }}>
              <p className="font-semibold text-lg">🍷 Join 340+ wine lovers sharing their stories</p>
            </div>

            <div className="p-8">
              {/* The Problem We're Understanding */}
              <div className="mb-6">
                <h2 className="text-2xl font-bold mb-3" style={{ color: '#2C2C30' }}>
                  Planning a wine trip shouldn't be stressful
                </h2>
                <p className="leading-relaxed mb-4" style={{ color: '#4A4A50' }}>
                  Yet so many visitors tell us it is. We're talking to wine country travelers to understand what makes trip planning hard - and what would make it easier.
                </p>
                <p className="leading-relaxed" style={{ color: '#4A4A50' }}>
                  Your honest experiences (the good, the frustrating, the "I wish I'd known that!") help us understand the real challenges people face.
                </p>
              </div>

              {/* What We're Learning - Real Patterns */}
              <div className="rounded-xl p-5 mb-6" style={{ backgroundColor: '#FAF7F2', border: '1px solid #E8E0D5' }}>
                <p className="text-sm font-semibold mb-3" style={{ color: '#6B2D3F' }}>🎯 What we've learned from 340+ responses:</p>
                <ul className="space-y-2 text-sm" style={{ color: '#4A4A50' }}>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>Couples traveling together</strong> represent the vast majority of wine country visitors</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>Most people plan 1-2 weeks in advance</strong> - not months ahead, not day-of</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>Confidence levels vary wildly</strong> - some nail their winery selection, others call it "total guesswork"</span>
                  </li>
                  <li className="flex items-start gap-2">
                    <span className="font-bold" style={{ color: '#C9A962' }}>•</span>
                    <span><strong>Google is the dominant starting point</strong>, but people use multiple sources to decide</span>
                  </li>
                </ul>
              </div>

              {/* Why Take This Survey */}
              <div className="space-y-4 mb-6">
                <div className="flex items-center gap-3" style={{ color: '#4A4A50' }}>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#C9A962">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>3 minutes</strong> - actually timed from real responses</span>
                </div>
                <div className="flex items-center gap-3" style={{ color: '#4A4A50' }}>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#C9A962">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 12h.01M12 12h.01M16 12h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
                  </svg>
                  <span><strong>100% anonymous</strong> - share honestly without any tracking</span>
                </div>
                <div className="flex items-center gap-3" style={{ color: '#4A4A50' }}>
                  <svg className="w-5 h-5 flex-shrink-0" fill="none" viewBox="0 0 24 24" stroke="#C9A962">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M12 8c-1.657 0-3 .895-3 2s1.343 2 3 2 3 .895 3 2-1.343 2-3 2m0-8c1.11 0 2.08.402 2.599 1M12 8V7m0 1v8m0 0v1m0-1c-1.11 0-2.08-.402-2.599-1" />
                  </svg>
                  <span><strong>Enter to win $50</strong> gift card - drawing closes Jan 20</span>
                </div>
              </div>

              {/* CTA Button */}
              <button
                onClick={() => setHasStarted(true)}
                className="w-full py-4 text-white font-semibold rounded-xl transition-all transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-xl text-lg"
                style={{ background: 'linear-gradient(135deg, #8B3A4D 0%, #6B2D3F 100%)' }}
                onMouseEnter={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #6B2D3F 0%, #8B3A4D 100%)'}
                onMouseLeave={(e) => e.currentTarget.style.background = 'linear-gradient(135deg, #8B3A4D 0%, #6B2D3F 100%)'}
              >
                Share Your Experience 🍷
              </button>

              <p className="text-xs text-center mt-4" style={{ color: '#B8A99A' }}>
                Your honest feedback helps improve wine tourism for everyone
              </p>
            </div>
          </div>

          {/* Footer */}
          <p className="text-center text-sm" style={{ color: '#B8A99A' }}>
            Questions? Email hello@valleysomm.com
          </p>
        </div>
      </div>
    )
  }

  // SUCCESS SCREEN
  if (submitted) {
    const emailOptions = answers.email_options || []
    const wantsDrawing = emailOptions.includes('drawing')
    const wantsResults = emailOptions.includes('results')

    return (
      <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🍷</div>
          <h2 className="text-2xl font-bold text-stone-800 mb-2">Thank you!</h2>
          <p className="text-stone-600 mb-4">
            Your insights will help make wine country trips better for everyone. Cheers to that.
          </p>
          {answers.email && (wantsDrawing || wantsResults) && (
            <div className="text-sm text-stone-500 space-y-1">
              {wantsDrawing && <p>{"You're entered in the gift card drawing."}</p>}
              {wantsResults && <p>{"We'll send you the results when they're ready."}</p>}
            </div>
          )}
        </div>
      </div>
    )
  }

  // SURVEY QUESTIONS
  const currentQuestions = steps[currentStep].questions.map((i) => questions[i])

  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-stone-100 p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="text-sm font-medium text-amber-700 mb-2">Valley Somm</div>
          <h1 className="text-3xl font-bold text-stone-800 mb-2">Wine Country Trip Survey</h1>
          <p className="text-stone-600">{"Help us understand what makes wine trips great (and what doesn't)"}</p>
          <p className="text-sm text-stone-500 mt-1">3 minutes • Anonymous • Enter by Jan 20 to win a $50 gift card</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`text-xs sm:text-sm font-medium ${
                  i === currentStep ? 'text-amber-600' : i < currentStep ? 'text-amber-400' : 'text-stone-400'
                }`}
              >
                {step.title}
              </div>
            ))}
          </div>
          <div className="h-2 bg-stone-200 rounded-full overflow-hidden">
            <div
              className="h-full bg-amber-500 transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
          {currentQuestions.map((q) => (
            <div key={q.id} className="space-y-4">
              <h3 className="text-lg font-semibold text-stone-800">{q.question}</h3>
              {renderQuestion(q)}
            </div>
          ))}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-red-50 border border-red-200 rounded-lg text-red-700 text-sm">{error}</div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-stone-100">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 text-stone-600 hover:text-stone-800 font-medium"
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
                className="px-6 py-3 bg-amber-500 hover:bg-amber-600 text-white font-medium rounded-lg transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-amber-600 hover:bg-amber-700 disabled:bg-amber-300 text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Survey 🍷'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-stone-400 mt-6">
          Your responses are anonymous and help improve wine tourism for everyone.
        </p>
      </div>
    </div>
  )
}