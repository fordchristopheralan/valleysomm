// Enhanced Questionnaire Component with 8 questions
// Optimal UX flow: Date → Occasion → Vibe → Wines → Group → Stops → Origin → Special Requests

'use client';

import { useState, useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { Wine, Users, MapPin, Calendar, PartyPopper, MessageSquare, Check, ChevronRight, X } from 'lucide-react';
import { AIInput } from '@/lib/types';
import { trackEvent } from '@/lib/analytics';

// Question type with enhanced fields
type Question = {
  id: keyof AIInput | 'visitDate' | 'occasion' | 'specialRequests';
  question: string;
  icon: React.ReactNode;
  type: 'single' | 'multiple' | 'date-range' | 'text';
  options?: { value: string; label: string; emoji?: string }[];
  placeholder?: string;
  helpText?: string;
};

// Enhanced questions in optimal UX order
const QUESTIONS: Question[] = [
  // 1. Visit Date (sets context for everything)
  {
    id: 'visitDate',
    question: 'When are you planning to visit?',
    icon: <Calendar className="w-6 h-6" />,
    type: 'date-range',
    helpText: 'This helps us recommend wineries with special events or seasonal offerings'
  },
  
  // 2. Occasion (establishes mood/vibe before wine preferences)
  {
    id: 'occasion',
    question: 'What's bringing you to Yadkin Valley?',
    icon: <PartyPopper className="w-6 h-6" />,
    type: 'single',
    options: [
      { value: 'casual', label: 'Casual Visit', emoji: '🍷' },
      { value: 'romantic', label: 'Romantic Getaway', emoji: '💕' },
      { value: 'celebration', label: 'Celebration (Birthday/Anniversary)', emoji: '🎉' },
      { value: 'bachelorette', label: 'Bachelorette/Bachelor Party', emoji: '🥂' },
      { value: 'corporate', label: 'Corporate Event', emoji: '💼' },
      { value: 'education', label: 'Wine Education', emoji: '📚' },
      { value: 'group-outing', label: 'Group Outing', emoji: '👥' },
      { value: 'other', label: 'Other', emoji: '✨' }
    ]
  },
  
  // 3. Vibe (now informed by occasion)
  {
    id: 'vibe',
    question: 'What's your ideal wine tasting vibe?',
    icon: <Wine className="w-6 h-6" />,
    type: 'single',
    options: [
      { value: 'elegant', label: 'Elegant & Upscale', emoji: '✨' },
      { value: 'casual', label: 'Casual & Relaxed', emoji: '😊' },
      { value: 'scenic', label: 'Scenic Views & Photos', emoji: '📸' },
      { value: 'educational', label: 'Educational & Informative', emoji: '🎓' }
    ]
  },
  
  // 4. Wine Preferences
  {
    id: 'winePreferences',
    question: 'What wines do you enjoy?',
    icon: <Wine className="w-6 h-6" />,
    type: 'multiple',
    options: [
      { value: 'dry-reds', label: 'Dry Reds', emoji: '🍷' },
      { value: 'sweet', label: 'Sweet Wines', emoji: '🍯' },
      { value: 'dry-whites', label: 'Dry Whites', emoji: '🥂' },
      { value: 'rose', label: 'Rosé', emoji: '🌸' },
      { value: 'variety', label: 'I like variety!', emoji: '🎨' }
    ]
  },
  
  // 5. Group Type
  {
    id: 'groupType',
    question: 'Who's joining you?',
    icon: <Users className="w-6 h-6" />,
    type: 'single',
    options: [
      { value: 'solo', label: 'Just me', emoji: '🧘' },
      { value: 'couple', label: 'Couple / Date', emoji: '💑' },
      { value: 'small', label: 'Small group (3-6)', emoji: '👥' },
      { value: 'large', label: 'Large group (7+)', emoji: '👨‍👩‍👧‍👦' }
    ]
  },
  
  // 6. Number of Stops
  {
    id: 'stops',
    question: 'How many wineries would you like to visit?',
    icon: <MapPin className="w-6 h-6" />,
    type: 'single',
    options: [
      { value: '3', label: '3 stops', emoji: '⚡', description: 'Half day (~3 hours)' },
      { value: '4', label: '4 stops', emoji: '🌟', description: 'Most of the day (~5 hours)' },
      { value: '5', label: '5 stops', emoji: '🚀', description: 'Full day adventure (~7 hours)' }
    ]
  },
  
  // 7. Origin City (enhanced with "Other" option)
  {
    id: 'originCity',
    question: 'Where are you starting from?',
    icon: <MapPin className="w-6 h-6" />,
    type: 'single',
    options: [
      { value: 'charlotte', label: 'Charlotte', emoji: '🏙️' },
      { value: 'winston-salem', label: 'Winston-Salem', emoji: '🌆' },
      { value: 'greensboro', label: 'Greensboro', emoji: '🏘️' },
      { value: 'raleigh', label: 'Raleigh', emoji: '🏛️' },
      { value: 'other', label: 'Other location', emoji: '📍' }
    ]
  },
  
  // 8. Special Requests (catch-all for accessibility, dietary, etc.)
  {
    id: 'specialRequests',
    question: 'Anything else we should know?',
    icon: <MessageSquare className="w-6 h-6" />,
    type: 'text',
    placeholder: 'e.g., "Looking for pet-friendly wineries", "Someone uses a wheelchair", "We love live music"',
    helpText: 'Optional - any special considerations or preferences'
  }
];

type QuestionnaireProps = {
  onCancel?: () => void;
};

export default function EnhancedQuestionnaire({ onCancel }: QuestionnaireProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Record<string, any>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);
  
  // For "Other" option text inputs
  const [otherOccasion, setOtherOccasion] = useState('');
  const [otherCity, setOtherCity] = useState('');

  const currentQ = QUESTIONS[step];
  const progress = ((step + 1) / QUESTIONS.length) * 100;
  const isLastStep = step === QUESTIONS.length - 1;

  // Track quiz start
  useEffect(() => {
    trackEvent('quiz_started', {
      step: 0,
      question_id: currentQ.id,
    });
  }, []);

  // Track abandonment
  useEffect(() => {
    const handleBeforeUnload = () => {
      if (!isGenerating && step < QUESTIONS.length - 1) {
        trackEvent('quiz_abandoned', {
          last_step_reached: step,
          last_question_id: currentQ.id,
          answers_so_far: answers,
        });
      }
    };

    window.addEventListener('beforeunload', handleBeforeUnload);
    return () => window.removeEventListener('beforeunload', handleBeforeUnload);
  }, [step, isGenerating, answers, currentQ.id]);

  const handleAnswer = (value: string) => {
    if (currentQ.type === 'single') {
      const newAnswers = { ...answers, [currentQ.id]: value };
      setAnswers(newAnswers);

      trackEvent('quiz_answer', {
        question_id: currentQ.id,
        answer: value,
        step: step + 1,
      });

      // If "other" is selected, don't auto-advance (wait for text input)
      if (value !== 'other') {
        setIsAnimating(true);
        setTimeout(() => {
          setIsAnimating(false);
          if (isLastStep) {
            generateTrail(newAnswers);
          } else {
            setStep(step + 1);
          }
        }, 300);
      }
    }
  };

  const handleMultiple = (value: string) => {
    const current = (answers.winePreferences as string[]) || [];
    const newPrefs = current.includes(value)
      ? current.filter(v => v !== value)
      : [...current, value];
    setAnswers({ ...answers, winePreferences: newPrefs });

    trackEvent('quiz_answer', {
      question_id: currentQ.id,
      answer: value,
      selected: !current.includes(value),
    });
  };

  const handleDateChange = (field: 'start' | 'end', value: string) => {
    const newAnswers = {
      ...answers,
      visitDate: {
        ...(answers.visitDate || {}),
        [field]: value
      }
    };
    setAnswers(newAnswers);
  };

  const handleTextInput = (value: string) => {
    setAnswers({ ...answers, [currentQ.id]: value });
  };

  const handleNext = () => {
    // Handle "Other" option with text input
    if (currentQ.id === 'occasion' && answers.occasion === 'other' && otherOccasion) {
      answers.occasion = `other: ${otherOccasion}`;
    }
    if (currentQ.id === 'originCity' && answers.originCity === 'other' && otherCity) {
      answers.originCity = `other: ${otherCity}`;
    }

    trackEvent('quiz_continue', {
      from_step: step,
      question_id: currentQ.id,
    });

    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      if (isLastStep) {
        generateTrail(answers);
      } else {
        setStep(step + 1);
      }
    }, 200);
  };

  const handleBack = () => {
    trackEvent('quiz_back', {
      from_step: step,
      to_step: step - 1,
    });

    setIsAnimating(true);
    setTimeout(() => {
      setIsAnimating(false);
      setStep(step - 1);
    }, 200);
  };

  const canContinue = () => {
    if (currentQ.type === 'multiple') {
      return (answers.winePreferences as string[] || []).length > 0;
    }
    if (currentQ.type === 'date-range') {
      return answers.visitDate?.start && answers.visitDate?.end;
    }
    if (currentQ.type === 'text') {
      return true; // Optional field
    }
    if (currentQ.id === 'occasion' && answers.occasion === 'other') {
      return otherOccasion.trim().length > 0;
    }
    if (currentQ.id === 'originCity' && answers.originCity === 'other') {
      return otherCity.trim().length > 0;
    }
    return !!answers[currentQ.id];
  };

  const generateTrail = async (finalAnswers: Record<string, any>) => {
    setIsGenerating(true);
    setGenerationError(false);

    trackEvent('quiz_completed', {
      total_steps: QUESTIONS.length,
      answers: finalAnswers,
    });

    try {
      // Transform answers to API format
      const apiInput = {
        vibe: finalAnswers.vibe,
        winePreferences: finalAnswers.winePreferences,
        groupType: finalAnswers.groupType,
        stops: finalAnswers.stops,
        originCity: finalAnswers.originCity,
        occasion: finalAnswers.occasion,
        visitDateStart: finalAnswers.visitDate?.start,
        visitDateEnd: finalAnswers.visitDate?.end,
        specialRequests: finalAnswers.specialRequests || ''
      };

      const response = await fetch('/api/generate-trail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(apiInput),
      });

      if (!response.ok) throw new Error('Failed to generate trail');

      const data = await response.json();
      
      trackEvent('trail_generated', {
        trail_id: data.id,
        ...apiInput
      });

      router.push(`/trails/${data.id}`);
    } catch (error) {
      console.error('Trail generation error:', error);
      setGenerationError(true);
      trackEvent('trail_generation_failed', {
        error: error instanceof Error ? error.message : 'Unknown error',
        answers: finalAnswers,
      });
    }
  };

  // Loading state
  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4">
        <div className="text-center">
          <div className="w-20 h-20 border-4 border-white border-t-transparent rounded-full animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-2">
            Crafting Your Perfect Wine Trail
          </h2>
          <p className="text-white/80 text-lg">
            Analyzing your preferences and matching wineries...
          </p>
        </div>
      </div>
    );
  }

  // Error state
  if (generationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4">
        <div className="text-center">
          <h2 className="text-3xl font-bold text-white mb-4">
            Something went wrong
          </h2>
          <p className="text-xl text-white/90 mb-8">
            We couldn't generate your trail right now. Please try again.
          </p>
          <button
            onClick={() => {
              setGenerationError(false);
              setIsGenerating(false);
            }}
            className="bg-white text-purple-600 px-8 py-4 rounded-xl font-bold text-lg hover:bg-white/90 transition-colors"
          >
            Try Again
          </button>
        </div>
      </div>
    );
  }

  // Main questionnaire render
  return (
    <div className="w-full max-w-2xl mx-auto">
      {/* Close button */}
      {onCancel && (
        <button
          onClick={onCancel}
          className="absolute top-4 right-4 p-2 text-gray-400 hover:text-gray-600 transition-colors z-10"
          aria-label="Close questionnaire"
        >
          <X className="w-6 h-6" />
        </button>
      )}

      {/* Progress Bar */}
      <div className="mb-8">
        <div className="h-2 bg-white/20 rounded-full overflow-hidden">
          <div 
            className="h-full bg-white transition-all duration-500 ease-out"
            style={{ width: `${progress}%` }}
          />
        </div>
        <p className="text-sm text-white/80 mt-2 text-center font-medium">
          Step {step + 1} of {QUESTIONS.length}
        </p>
      </div>

      {/* Question Card */}
      <div 
        className={`bg-white rounded-2xl shadow-2xl p-8 transition-all duration-300 ${
          isAnimating ? 'opacity-0 transform scale-95' : 'opacity-100 transform scale-100'
        }`}
      >
        {/* Question header with icon */}
        <div className="flex items-center gap-3 mb-6">
          <div className="text-purple-600">{currentQ.icon}</div>
          <h2 className="text-2xl md:text-3xl font-bold text-gray-900">
            {currentQ.question}
          </h2>
        </div>

        {/* Help text if provided */}
        {currentQ.helpText && (
          <p className="text-sm text-gray-500 mb-4">{currentQ.helpText}</p>
        )}

        {/* Render based on question type */}
        {currentQ.type === 'single' && (
          <div className="space-y-3">
            {currentQ.options?.map((option) => {
              const isSelected = answers[currentQ.id] === option.value;

              return (
                <div key={option.value}>
                  <button
                    onClick={() => handleAnswer(option.value)}
                    className={`w-full p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                      isSelected
                        ? 'border-purple-600 bg-purple-50 shadow-md'
                        : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                    }`}
                  >
                    <div className="flex items-center justify-between">
                      <div className="flex items-center gap-3">
                        {option.emoji && (
                          <span className="text-2xl">{option.emoji}</span>
                        )}
                        <div>
                          <span className="font-medium text-gray-900">{option.label}</span>
                          {option.description && (
                            <p className="text-sm text-gray-500 mt-1">{option.description}</p>
                          )}
                        </div>
                      </div>
                      {isSelected && (
                        <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                      )}
                    </div>
                  </button>

                  {/* Show text input if "Other" is selected */}
                  {option.value === 'other' && isSelected && (
                    <input
                      type="text"
                      value={currentQ.id === 'occasion' ? otherOccasion : otherCity}
                      onChange={(e) => 
                        currentQ.id === 'occasion' 
                          ? setOtherOccasion(e.target.value)
                          : setOtherCity(e.target.value)
                      }
                      placeholder={currentQ.id === 'occasion' ? 'e.g., Wine club meetup' : 'e.g., Asheville, NC'}
                      className="w-full mt-2 p-3 border-2 border-purple-300 rounded-lg focus:border-purple-600 focus:outline-none"
                      autoFocus
                    />
                  )}
                </div>
              );
            })}
          </div>
        )}

        {currentQ.type === 'multiple' && (
          <div className="space-y-3">
            {currentQ.options?.map((option) => {
              const isSelected = (answers.winePreferences as string[] || []).includes(option.value);

              return (
                <button
                  key={option.value}
                  onClick={() => handleMultiple(option.value)}
                  className={`w-full p-4 rounded-xl border-2 text-left transition-all transform hover:scale-[1.02] ${
                    isSelected
                      ? 'border-purple-600 bg-purple-50 shadow-md'
                      : 'border-gray-200 hover:border-purple-300 hover:shadow-sm'
                  }`}
                >
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-3">
                      {option.emoji && (
                        <span className="text-2xl">{option.emoji}</span>
                      )}
                      <span className="font-medium text-gray-900">{option.label}</span>
                    </div>
                    {isSelected && (
                      <Check className="w-5 h-5 text-purple-600 flex-shrink-0" />
                    )}
                  </div>
                </button>
              );
            })}
          </div>
        )}

        {currentQ.type === 'date-range' && (
          <div className="space-y-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Start Date
              </label>
              <input
                type="date"
                value={answers.visitDate?.start || ''}
                onChange={(e) => handleDateChange('start', e.target.value)}
                min={new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                End Date
              </label>
              <input
                type="date"
                value={answers.visitDate?.end || ''}
                onChange={(e) => handleDateChange('end', e.target.value)}
                min={answers.visitDate?.start || new Date().toISOString().split('T')[0]}
                className="w-full p-3 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none"
              />
            </div>
          </div>
        )}

        {currentQ.type === 'text' && (
          <textarea
            value={answers[currentQ.id] || ''}
            onChange={(e) => handleTextInput(e.target.value)}
            placeholder={currentQ.placeholder}
            rows={4}
            className="w-full p-4 border-2 border-gray-200 rounded-lg focus:border-purple-600 focus:outline-none resize-none"
          />
        )}

        {/* Continue button (for multiple choice, date-range, and text) */}
        {(currentQ.type === 'multiple' || currentQ.type === 'date-range' || currentQ.type === 'text') && (
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className={`mt-6 w-full py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] ${
              canContinue()
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Build My Trail' : 'Continue'} 
            <ChevronRight className="inline w-5 h-5 ml-2" />
          </button>
        )}

        {/* Continue button for "Other" options */}
        {currentQ.type === 'single' && answers[currentQ.id] === 'other' && (
          <button
            onClick={handleNext}
            disabled={!canContinue()}
            className={`mt-6 w-full py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] ${
              canContinue()
                ? 'bg-purple-600 text-white hover:bg-purple-700 shadow-lg'
                : 'bg-gray-200 text-gray-400 cursor-not-allowed'
            }`}
          >
            {isLastStep ? 'Build My Trail' : 'Continue'} 
            <ChevronRight className="inline w-5 h-5 ml-2" />
          </button>
        )}
      </div>

      {/* Back button */}
      {step > 0 && (
        <button
          onClick={handleBack}
          className="mt-4 text-white hover:text-white/80 font-medium transition-colors flex items-center gap-2"
        >
          <ChevronRight className="w-4 h-4 rotate-180" />
          Back
        </button>
      )}
    </div>
  );
}
