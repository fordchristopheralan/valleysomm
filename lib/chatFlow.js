// Conversation flow management for ValleySomm chat interface

export const CONVERSATION_STEPS = [
  {
    step: 1,
    id: 'timing',
    question: 'When are you planning to visit Yadkin Valley?',
    extractKeys: ['visitDate', 'timeframe', 'flexibility'],
    validation: (data) => data.visitDate || data.timeframe
  },
  {
    step: 2,
    id: 'group',
    question: 'How many people will be in your group?',
    extractKeys: ['groupSize', 'groupType'],
    validation: (data) => data.groupSize || data.groupType
  },
  {
    step: 3,
    id: 'wine_preferences',
    question: 'What kind of wines do you enjoy?',
    extractKeys: ['wineTypes', 'drySweet', 'adventurousness'],
    validation: (data) => data.wineTypes || data.drySweet
  },
  {
    step: 4,
    id: 'vibe',
    question: 'What kind of experience are you looking for?',
    extractKeys: ['vibe', 'atmosphere', 'priorities'],
    validation: (data) => data.vibe || data.atmosphere
  },
  {
    step: 5,
    id: 'logistics',
    question: 'Any preferences on reservations or timing?',
    extractKeys: ['reservationPreference', 'driveTimeLimit', 'budget'],
    validation: (data) => data.reservationPreference
  },
  {
    step: 6,
    id: 'transportation',
    question: 'How will you handle transportation?',
    extractKeys: ['hasDD', 'needsTransportHelp', 'tourInterest'],
    validation: (data) => data.hasDD !== undefined || data.needsTransportHelp
  },
  {
    step: 7,
    id: 'addons',
    question: 'Anything else? (Food, lodging, non-wine activities?)',
    extractKeys: ['foodInterest', 'lodgingNeeded', 'otherActivities'],
    validation: (data) => true // Optional step, always valid
  }
]

/**
 * Determine current conversation step based on collected data
 */
export function getCurrentStep(conversationData) {
  for (let i = 0; i < CONVERSATION_STEPS.length; i++) {
    const step = CONVERSATION_STEPS[i]
    if (!step.validation(conversationData)) {
      return step.step
    }
  }
  return CONVERSATION_STEPS.length + 1 // All steps complete
}

/**
 * Parse user response and extract structured data
 * This is a simplified version - in production, you'd use more sophisticated NLP
 */
export function parseUserResponse(userMessage, existingData) {
  const data = { ...existingData }
  const message = userMessage.toLowerCase()

  // Step 1: Timing
  if (message.includes('weekend') || message.includes('saturday') || message.includes('sunday')) {
    data.timeframe = 'weekend'
  }
  if (message.includes('next month') || message.includes('few weeks')) {
    data.flexibility = 'flexible'
  }
  if (message.includes('tomorrow') || message.includes('this weekend') || message.includes('soon')) {
    data.timeframe = 'immediate'
    data.quickPlan = true // Flag for Quick Plan path
  }

  // Step 2: Group size
  if (message.match(/\b(\d+)\s*(people|person|of us)/)) {
    const match = message.match(/\b(\d+)\s*(people|person|of us)/)
    data.groupSize = parseInt(match[1])
  }
  if (message.includes('couple') || message.includes('partner') || message.includes('just us two')) {
    data.groupSize = 2
    data.groupType = 'couple'
  }
  if (message.includes('friends') || message.includes('group')) {
    data.groupType = 'friends'
  }
  if (message.includes('family')) {
    data.groupType = 'family'
  }

  // Step 3: Wine preferences
  const wineTypes = []
  if (message.includes('red')) wineTypes.push('red')
  if (message.includes('white')) wineTypes.push('white')
  if (message.includes('rosé') || message.includes('rose')) wineTypes.push('rosé')
  if (message.includes('dry')) data.drySweet = 'dry'
  if (message.includes('sweet')) data.drySweet = 'sweet'
  if (message.includes('surprise') || message.includes('anything') || message.includes('open')) {
    data.adventurousness = 'high'
  }
  if (wineTypes.length > 0) data.wineTypes = wineTypes

  // Step 4: Vibe
  if (message.includes('romantic') || message.includes('intimate') || message.includes('quiet')) {
    data.vibe = 'romantic'
  }
  if (message.includes('social') || message.includes('lively') || message.includes('fun')) {
    data.vibe = 'social'
  }
  if (message.includes('educational') || message.includes('learn') || message.includes('tour')) {
    data.priorities = 'educational'
  }
  if (message.includes('view') || message.includes('scenic') || message.includes('beautiful')) {
    data.priorities = 'scenic'
  }

  // Step 5: Logistics
  if (message.includes('reservation') || message.includes('book ahead')) {
    data.reservationPreference = message.includes('don\'t') || message.includes('no') ? 'walk-in' : 'reservations'
  }
  if (message.includes('walk-in') || message.includes('spontaneous')) {
    data.reservationPreference = 'walk-in'
    data.quickPlan = true
  }

  // Step 6: Transportation
  if (message.includes('designated driver') || message.includes('dd') || message.includes('driving')) {
    data.hasDD = true
  }
  if (message.includes('need help') || message.includes('transportation') || message.includes('shuttle')) {
    data.needsTransportHelp = true
  }
  if (message.includes('tour') || message.includes('guide')) {
    data.tourInterest = true
  }

  // Step 7: Add-ons
  if (message.includes('lunch') || message.includes('food') || message.includes('dinner')) {
    data.foodInterest = true
  }
  if (message.includes('stay') || message.includes('hotel') || message.includes('overnight')) {
    data.lodgingNeeded = true
  }

  return data
}

/**
 * Check if we have enough information to generate an itinerary
 */
export function shouldTriggerItinerary(conversationData) {
  // Must have at least: timeframe, group info, and some wine preferences
  const hasEssentials = (
    (conversationData.visitDate || conversationData.timeframe) &&
    (conversationData.groupSize || conversationData.groupType) &&
    (conversationData.wineTypes || conversationData.drySweet || conversationData.adventurousness)
  )

  // Check if all 7 steps are complete
  const currentStep = getCurrentStep(conversationData)
  const allStepsComplete = currentStep > CONVERSATION_STEPS.length

  // Trigger if Quick Plan mode OR all steps complete
  return conversationData.quickPlan || (hasEssentials && allStepsComplete)
}

/**
 * Get suggested button options for current step
 */
export function getStepSuggestions(currentStep) {
  const suggestions = {
    1: ['This weekend', 'Next month', 'Not sure yet'],
    2: ['Just 2 of us', '3-4 people', 'Large group (6+)'],
    3: ['Dry reds', 'Sweet whites', 'Rosé', 'Surprise me!'],
    4: ['Romantic & intimate', 'Social & lively', 'Educational', 'Scenic views'],
    5: ['Yes, we need reservations', 'Walk-ins are fine', 'Mix of both'],
    6: ['We have a DD', 'Need transportation help', 'Interested in tours'],
    7: ['Lunch spots', 'Overnight stay', 'Just wineries']
  }

  return suggestions[currentStep] || []
}