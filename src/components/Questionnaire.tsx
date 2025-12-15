'use client';

import React, { useState, useEffect } from 'react';
import { ChevronRight, Check, X, Loader2 } from 'lucide-react';
import { useRouter } from 'next/navigation';
import type { AIInput } from '@/lib/types';

// Fire-and-forget analytics tracker
const trackEvent = async (eventType: string, properties?: Record<string, any>) => {
  if (typeof window === 'undefined') return;

  try {
    await fetch('/api/analytics/event', {
      method: 'POST',
      body: JSON.stringify({
        event_type: eventType,
        properties: properties || {},
        timestamp: new Date().toISOString(),
      }),
      keepalive: true,
    });
  } catch (err) {
    console.warn('Analytics event failed:', err);
  }
};

type QuestionOption = {
  value: string;
  label: string;
  emoji?: string;
};

type Question = {
  id: keyof AIInput;
  question: string;
  options: QuestionOption[];
  type: 'single' | 'multiple';
};

const QUESTIONS: Question[] = [
  {
    id: 'vibe',
    question: "What's your ideal wine tasting vibe?",
    options: [
      { value: 'upscale', label: 'Elegant & sophisticated', emoji: '✨' },
      { value: 'casual', label: 'Relaxed & fun', emoji: '😎' },
      { value: 'scenic', label: 'Beautiful views', emoji: '🏔️' },
      { value: 'educational', label: 'Learn about wine', emoji: '📚' }
    ],
    type: 'single'
  },
  {
    id: 'winePreferences',
    question: 'What wines do you typically enjoy?',
    options: [
      { value: 'red', label: 'Reds (Cab, Merlot)', emoji: '🍷' },
      { value: 'white', label: 'Whites (Chard, Viognier)', emoji: '🥂' },
      { value: 'sweet', label: 'Sweet & fruit wines', emoji: '🍇' },
      { value: 'rosé', label: 'Rosé', emoji: '🌸' },
      { value: 'variety', label: 'I like variety!', emoji: '🎨' }
    ],
    type: 'multiple'
  },
  {
    id: 'groupType',
    question: "Who's joining you?",
    options: [
      { value: 'couple', label: 'Just the two of us', emoji: '💑' },
      { value: 'friends', label: 'Friends (3-6)', emoji: '👥' },
      { value: 'large', label: 'Larger group (7+)', emoji: '👨‍👩‍👧‍👦' },
      { value: 'family', label: 'Family with kids', emoji: '👨‍👩‍👧' }
    ],
    type: 'single'
  },
  {
    id: 'stops',
    question: 'How many wineries do you want to visit?',
    options: [
      { value: '3', label: '3 stops (relaxed pace)', emoji: '🚶' },
      { value: '4', label: '4 stops (moderate)', emoji: '🚶‍♂️' },
      { value: '5', label: '5 stops (full day)', emoji: '🏃' }
    ],
    type: 'single'
  },
  {
    id: 'originCity',
    question: 'Where are you traveling from?',
    options: [
      { value: 'charlotte', label: 'Charlotte', emoji: '🏙️' },
      { value: 'winston', label: 'Winston-Salem', emoji: '🌆' },
      { value: 'greensboro', label: 'Greensboro', emoji: '🏘️' },
      { value: 'raleigh', label: 'Raleigh', emoji: '🏛️' }
    ],
    type: 'single'
  }
];

type QuestionnaireProps = {
  onCancel?: () => void;
};

export default function Questionnaire({ onCancel }: QuestionnaireProps) {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const [answers, setAnswers] = useState<Partial<AIInput>>({});
  const [isAnimating, setIsAnimating] = useState(false);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generationError, setGenerationError] = useState(false);

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

  // Track abandonment if user leaves before completion
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

  const handleNext = () => {
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

  const canContinue = currentQ.type === 'multiple'
    ? (answers.winePreferences as string[] || []).length > 0
    : !!answers[currentQ.id];

  const handleBack = () => {
    if (step > 0) {
      trackEvent('quiz_back', {
        from_step: step,
        to_step: step - 1,
      });

      setIsAnimating(true);
      setTimeout(() => {
        setIsAnimating(false);
        setStep(step - 1);
      }, 200);
    }
  };

  const generateTrail = async (finalAnswers: Partial<AIInput>) => {
    setIsGenerating(true);

    trackEvent('quiz_completed', {
      answers: finalAnswers,
      total_steps: QUESTIONS.length,
    });

    try {
      const response = await fetch('/api/generate-trail', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(finalAnswers),
      });

      if (!response.ok) {
        throw new Error(`HTTP ${response.status}`);
      }

      const data = await response.json();

      trackEvent('trail_generated', {
        trail_id: data.id,
        num_stops: data.totalStops,
        vibe: finalAnswers.vibe,
        origin_city: finalAnswers.originCity,
        wine_preferences: finalAnswers.winePreferences,
      });

      router.push(`/trails/${data.id}`);
    } catch (err) {
      console.error('Trail generation failed:', err);
      setGenerationError(true);
      setIsGenerating(false);

      trackEvent('trail_generation_failed', {
        error: err instanceof Error ? err.message : String(err),
        answers: finalAnswers,
      });
    }
  };

  if (isGenerating) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4">
        <div className="text-center">
          <Loader2 className="w-16 h-16 text-white animate-spin mx-auto mb-6" />
          <h2 className="text-3xl font-bold text-white mb-4">Building your perfect trail...</h2>
          <p className="text-xl text-white/90">This usually takes 10–20 seconds</p>
        </div>
      </div>
    );
  }

  if (generationError) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-purple-600 to-pink-600 flex items-center justify-center px-4">
        <div className="text-center max-w-md">
          <h2 className="text-3xl font-bold text-white mb-4">Oops! Something went wrong</h2>
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
        <h2 className="text-2xl md:text-3xl font-bold text-gray-900 mb-6">
          {currentQ.question}
        </h2>

        <div className="space-y-3">
          {currentQ.options.map((option) => {
            const isSelected = currentQ.type === 'single'
              ? answers[currentQ.id] === option.value
              : (answers.winePreferences as string[] || []).includes(option.value);

            return (
              <button
                key={option.value}
                onClick={() => currentQ.type === 'single' 
                  ? handleAnswer(option.value)
                  : handleMultiple(option.value)
                }
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

        {/* Continue button for multiple choice */}
        {currentQ.type === 'multiple' && (
          <button
            onClick={handleNext}
            disabled={!canContinue}
            className={`mt-6 w-full py-4 rounded-xl font-semibold transition-all transform hover:scale-[1.02] ${
              canContinue
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