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

// Wine drop logo SVG component
const WineLogo = ({ className = "w-6 h-6" }) => (
  <svg className={className} viewBox="0 0 80 80" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M40 8C40 8 20 28 20 48C20 59.046 28.954 68 40 68C51.046 68 60 59.046 60 48C60 28 40 8 40 8Z" stroke="currentColor" strokeWidth="3" fill="none"/>
    <path d="M30 52C30 52 35 44 40 44C45 44 50 52 50 52" stroke="#C9A962" strokeWidth="2.5" fill="none" strokeLinecap="round"/>
  </svg>
)

export default function SurveyPage() {
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

  // Check if an "other" option is selected for a given question
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
                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${(answers[q.id] || []).includes(opt) 
                      ? 'border-wine-burgundy bg-wine-rose/10' 
                      : 'border-warm-beige hover:border-wine-rose hover:bg-wine-rose/5'}`}
                >
                  <input
                    type="checkbox"
                    checked={(answers[q.id] || []).includes(opt)}
                    onChange={() => handleMultiSelect(q.id, opt)}
                    className="w-4 h-4 rounded border-warm-beige text-wine-burgundy focus:ring-wine-rose"
                  />
                  <span className="text-charcoal">{opt}</span>
                </label>
                {/* Show text input if this "other" option is selected */}
                {q.otherFields?.[opt] && isOtherSelected(q.id, opt) && (
                  <input
                    type="text"
                    value={answers[q.otherFields[opt].id] || ''}
                    onChange={(e) => handleText(q.otherFields[opt].id, e.target.value)}
                    placeholder={q.otherFields[opt].placeholder}
                    className="w-full mt-2 ml-7 p-3 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none text-charcoal placeholder:text-taupe"
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
                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${answers[q.id] === opt 
                      ? 'border-wine-burgundy bg-wine-rose/10' 
                      : 'border-warm-beige hover:border-wine-rose hover:bg-wine-rose/5'}`}
                >
                  <input
                    type="radio"
                    name={q.id}
                    checked={answers[q.id] === opt}
                    onChange={() => handleSingle(q.id, opt)}
                    className="w-4 h-4 border-warm-beige text-wine-burgundy focus:ring-wine-rose"
                  />
                  <span className="text-charcoal">{opt}</span>
                </label>
                {/* Show text input if this "other" option is selected */}
                {q.otherFields?.[opt] && isOtherSelected(q.id, opt) && (
                  <input
                    type="text"
                    value={answers[q.otherFields[opt].id] || ''}
                    onChange={(e) => handleText(q.otherFields[opt].id, e.target.value)}
                    placeholder={q.otherFields[opt].placeholder}
                    className="w-full mt-2 ml-7 p-3 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none text-charcoal placeholder:text-taupe"
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
            className="w-full h-32 p-4 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none resize-none text-charcoal placeholder:text-taupe"
          />
        )
      case 'scale':
        return (
          <div className="space-y-3">
            <div className="flex justify-between text-sm text-slate">
              <span>{q.lowLabel}</span>
              <span>{q.highLabel}</span>
            </div>
            <div className="flex gap-2">
              {[1, 2, 3, 4, 5].map((n) => (
                <button
                  key={n}
                  type="button"
                  onClick={() => handleScale(q.id, n)}
                  className={`flex-1 py-3 rounded-lg font-medium transition-all duration-200 ${
                    answers[q.id] === n
                      ? 'bg-wine-burgundy text-white'
                      : 'bg-warm-beige text-slate hover:bg-wine-rose/20'
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
            {q.subtext && <p className="text-sm text-slate">{q.subtext}</p>}
            <input
              type="email"
              value={answers.email || ''}
              onChange={(e) => handleText('email', e.target.value)}
              placeholder={q.placeholder}
              className="w-full p-4 rounded-lg border border-warm-beige focus:border-wine-rose focus:ring-2 focus:ring-wine-rose/20 outline-none text-charcoal placeholder:text-taupe"
            />
            {answers.email && (
              <div className="space-y-2 pt-2">
                <p className="text-sm text-charcoal font-medium">What would you like?</p>
                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${(answers.email_options || []).includes('drawing') 
                      ? 'border-wine-burgundy bg-wine-rose/10' 
                      : 'border-warm-beige hover:border-wine-rose hover:bg-wine-rose/5'}`}
                >
                  <input
                    type="checkbox"
                    checked={(answers.email_options || []).includes('drawing')}
                    onChange={() => toggleEmailOption('drawing')}
                    className="w-4 h-4 rounded border-warm-beige text-wine-burgundy focus:ring-wine-rose"
                  />
                  <span className="text-charcoal">Enter the $50 gift card drawing</span>
                </label>
                <label 
                  className={`flex items-center gap-3 p-3 rounded-lg border cursor-pointer transition-all duration-200
                    ${(answers.email_options || []).includes('results') 
                      ? 'border-wine-burgundy bg-wine-rose/10' 
                      : 'border-warm-beige hover:border-wine-rose hover:bg-wine-rose/5'}`}
                >
                  <input
                    type="checkbox"
                    checked={(answers.email_options || []).includes('results')}
                    onChange={() => toggleEmailOption('results')}
                    className="w-4 h-4 rounded border-warm-beige text-wine-burgundy focus:ring-wine-rose"
                  />
                  <span className="text-charcoal">Send me the survey results</span>
                </label>
              </div>
            )}
          </div>
        )
      default:
        return null
    }
  }

  if (submitted) {
    const emailOptions = answers.email_options || []
    const wantsDrawing = emailOptions.includes('drawing')
    const wantsResults = emailOptions.includes('results')

    return (
      <div className="min-h-screen bg-gradient-to-br from-cream to-warm-beige flex items-center justify-center p-6">
        <div className="bg-white rounded-2xl shadow-xl p-8 max-w-md text-center">
          <div className="text-5xl mb-4">🍷</div>
          <h2 className="text-2xl font-display font-semibold text-charcoal mb-2">Thank you!</h2>
          <p className="text-slate mb-4">
            Your insights will help make wine country trips better for everyone. Cheers to that.
          </p>
          {answers.email && (wantsDrawing || wantsResults) && (
            <div className="text-sm text-slate space-y-1">
              {wantsDrawing && <p>{"You're entered in the gift card drawing."}</p>}
              {wantsResults && <p>{"We'll send you the results when they're ready."}</p>}
            </div>
          )}
        </div>
      </div>
    )
  }

  const currentQuestions = steps[currentStep].questions.map((i) => questions[i])

  return (
    <div className="min-h-screen bg-gradient-to-br from-cream to-warm-beige p-6">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-2 mb-2">
            <WineLogo className="w-6 h-6 text-wine-burgundy" />
            <span className="font-display text-lg text-charcoal">ValleySomm</span>
          </div>
          <h1 className="text-3xl font-display font-semibold text-charcoal mb-2">Wine Country Trip Survey</h1>
          <p className="text-slate font-display italic">{"Help us understand what makes wine trips great (and what doesn't)"}</p>
          <p className="text-sm text-taupe mt-1">4 minutes • Anonymous • Enter by Jan 20 to win a $50 gift card</p>
        </div>

        {/* Progress */}
        <div className="mb-8">
          <div className="flex justify-between mb-2 gap-1">
            {steps.map((step, i) => (
              <div
                key={i}
                className={`text-xs sm:text-sm font-medium text-center flex-1 ${
                  i === currentStep ? 'text-wine-burgundy' : i < currentStep ? 'text-wine-rose' : 'text-taupe'
                }`}
              >
                <span className="hidden sm:inline">{step.title}</span>
                <span className="sm:hidden">{step.title.split(' ')[0]}</span>
              </div>
            ))}
          </div>
          <div className="h-2 bg-warm-beige rounded-full overflow-hidden">
            <div
              className="h-full bg-gradient-to-r from-wine-deep to-wine-burgundy transition-all duration-300"
              style={{ width: `${((currentStep + 1) / steps.length) * 100}%` }}
            />
          </div>
        </div>

        {/* Questions */}
        <div className="bg-white rounded-2xl shadow-xl p-6 sm:p-8 space-y-8">
          {currentQuestions.map((q) => (
            <div key={q.id} className="space-y-4">
              <h3 className="text-lg font-display font-semibold text-charcoal">{q.question}</h3>
              {renderQuestion(q)}
            </div>
          ))}

          {/* Error message */}
          {error && (
            <div className="p-4 bg-wine-rose/10 border border-wine-rose rounded-lg text-wine-deep text-sm">{error}</div>
          )}

          {/* Navigation */}
          <div className="flex justify-between pt-4 border-t border-warm-beige">
            {currentStep > 0 ? (
              <button
                type="button"
                onClick={() => setCurrentStep(currentStep - 1)}
                className="px-6 py-2 text-slate hover:text-charcoal font-medium transition-colors"
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
                className="px-6 py-3 bg-wine-burgundy hover:bg-wine-deep text-white font-medium rounded-lg transition-colors"
              >
                Continue →
              </button>
            ) : (
              <button
                type="button"
                onClick={handleSubmit}
                disabled={submitting}
                className="px-6 py-3 bg-wine-deep hover:bg-wine-burgundy disabled:bg-taupe text-white font-medium rounded-lg transition-colors"
              >
                {submitting ? 'Submitting...' : 'Submit Survey 🍷'}
              </button>
            )}
          </div>
        </div>

        {/* Footer */}
        <p className="text-center text-sm text-taupe mt-6">
          Your responses are anonymous and help improve wine tourism for everyone.
        </p>
      </div>
    </div>
  )
}
