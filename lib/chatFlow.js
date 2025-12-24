// lib/chatFlow.js - Fixed version with step counter bug resolved

export const CONVERSATION_STEPS = [
  {
    id: 'timing',
    title: 'Timing',
    question: 'When are you visiting?',
    isComplete: (data) => !!(data.timing || data.dates)
  },
  {
    id: 'group',
    title: 'Group Size',
    question: 'How many people?',
    isComplete: (data) => !!(data.groupSize || data.people)
  },
  {
    id: 'wine',
    title: 'Wine Preferences',
    question: 'What wines do you enjoy?',
    isComplete: (data) => !!(data.winePreferences || data.wines)
  },
  {
    id: 'vibe',
    title: 'Experience Type',
    question: 'What vibe are you after?',
    isComplete: (data) => !!(data.vibe || data.atmosphere)
  },
  {
    id: 'logistics',
    title: 'Logistics',
    question: 'Reservations & preferences?',
    isComplete: (data) => !!(data.reservations || data.logistics)
  },
  {
    id: 'transportation',
    title: 'Transportation',
    question: 'How are you handling driving?',
    isComplete: (data) => !!(data.transportation || data.driver)
  },
  {
    id: 'addons',
    title: 'Add-ons',
    question: 'Anything else?',
    isComplete: (data) => !!(data.addons || data.extras || data.food || data.completedAllSteps)
  }
]

export function getCurrentStep(conversationData) {
  // **FIX #1**: If itinerary has been generated or triggered, lock at final step
  if (conversationData.itineraryGenerated || conversationData.itineraryTriggered) {
    return CONVERSATION_STEPS.length - 1;
  }
  
  for (let i = 0; i < CONVERSATION_STEPS.length; i++) {
    const step = CONVERSATION_STEPS[i];
    if (!step.isComplete(conversationData)) {
      return i;
    }
  }
  
  // All steps complete - mark as such
  conversationData.completedAllSteps = true;
  return CONVERSATION_STEPS.length - 1;
}

export function parseUserResponse(userMessage, currentData = {}) {
  const lower = userMessage.toLowerCase();
  const updated = { ...currentData };

  // Timing detection
  if (!updated.timing) {
    const timingPatterns = [
      /this (weekend|saturday|sunday|week)/i,
      /next (weekend|week|month|saturday|sunday)/i,
      /(tomorrow|today|tonight)/i,
      /(january|february|march|april|may|june|july|august|september|october|november|december)/i,
      /\d{1,2}\/\d{1,2}/,
      /(flexible|not sure|don't know)/i
    ];
    
    if (timingPatterns.some(pattern => pattern.test(userMessage))) {
      updated.timing = userMessage;
    }
  }

  // Group size detection
  if (!updated.groupSize) {
    const groupPatterns = [
      { pattern: /(just me|solo|myself|alone)/i, value: 1 },
      { pattern: /(me and my|partner|spouse|two of us|couple)/i, value: 2 },
      { pattern: /(small group|3|4|5|6|few friends)/i, value: 'small' },
      { pattern: /(large group|7|8|9|10|big|party)/i, value: 'large' },
      { pattern: /(family|kids|children)/i, value: 'family' }
    ];
    
    for (const { pattern, value } of groupPatterns) {
      if (pattern.test(lower)) {
        updated.groupSize = value;
        break;
      }
    }
  }

  // Wine preferences detection
  if (!updated.winePreferences) {
    const wineKeywords = [];
    
    if (/(dry|bold|tannic|full.bodied)/i.test(lower)) wineKeywords.push('dry');
    if (/(sweet|dessert|port)/i.test(lower)) wineKeywords.push('sweet');
    if (/(red|cabernet|merlot|pinot noir|syrah)/i.test(lower)) wineKeywords.push('red');
    if (/(white|chardonnay|riesling|sauvignon blanc)/i.test(lower)) wineKeywords.push('white');
    if (/(ros[eé]|pink)/i.test(lower)) wineKeywords.push('rosé');
    if (/(everything|all|adventurous|try new|explore)/i.test(lower)) wineKeywords.push('adventurous');
    
    if (wineKeywords.length > 0) {
      updated.winePreferences = wineKeywords.join(', ');
    }
  }

  // Vibe detection
  if (!updated.vibe) {
    const vibePatterns = [
      { pattern: /(romantic|intimate|quiet|cozy|date)/i, value: 'romantic' },
      { pattern: /(social|lively|fun|party|group)/i, value: 'social' },
      { pattern: /(educational|learn|tour|winemaker|behind.scenes)/i, value: 'educational' },
      { pattern: /(scenic|views|beautiful|peaceful|relax)/i, value: 'scenic' }
    ];
    
    for (const { pattern, value } of vibePatterns) {
      if (pattern.test(lower)) {
        updated.vibe = value;
        break;
      }
    }
  }

  // Reservations detection
  if (!updated.reservations) {
    if (/(reservation|book|reserve|call ahead)/i.test(lower)) {
      updated.reservations = 'prefer reservations';
    } else if (/(walk.in|spontaneous|flexible|no reservation)/i.test(lower)) {
      updated.reservations = 'walk-in friendly';
    }
  }

  // Transportation detection
  if (!updated.transportation) {
    const transportPatterns = [
      { pattern: /(i'll be|i'm the|i'll drive|i'm driving)/i, value: 'designated driver' },
      { pattern: /(one of us|someone will|partner will)/i, value: 'DD in group' },
      { pattern: /(hire|driver|limo|car service)/i, value: 'hired driver' },
      { pattern: /(tour|group tour|wine tour)/i, value: 'tour' },
      { pattern: /(uber|lyft|rideshare)/i, value: 'rideshare' }
    ];
    
    for (const { pattern, value } of transportPatterns) {
      if (pattern.test(lower)) {
        updated.transportation = value;
        break;
      }
    }
  }

  // Add-ons detection
  if (!updated.addons) {
    const addonKeywords = [];
    
    if (/(food|lunch|dinner|meal|restaurant|eat)/i.test(lower)) addonKeywords.push('food');
    if (/(stay|overnight|lodging|hotel|airbnb)/i.test(lower)) addonKeywords.push('lodging');
    if (/(music|live music|entertainment)/i.test(lower)) addonKeywords.push('music');
    if (/(just wine|only wine|wine only)/i.test(lower)) addonKeywords.push('wine only');
    
    if (addonKeywords.length > 0) {
      updated.addons = addonKeywords.join(', ');
    }
  }

  return updated;
}

export function shouldTriggerItinerary(conversationData) {
  // **FIX #2**: Check if already triggered to prevent duplicates
  if (conversationData.itineraryTriggered) {
    return false;
  }

  // Quick plan mode - minimal info needed
  const hasQuickPlanKeywords = conversationData.timing && (
    conversationData.timing.toLowerCase().includes('tomorrow') ||
    conversationData.timing.toLowerCase().includes('today') ||
    conversationData.timing.toLowerCase().includes('this weekend')
  );

  if (hasQuickPlanKeywords && conversationData.groupSize && conversationData.winePreferences) {
    return true;
  }

  // Full plan mode - MUST complete ALL 7 steps
  const completedSteps = CONVERSATION_STEPS.filter(step => step.isComplete(conversationData)).length;
  
  // Only trigger when ALL steps are complete
  return completedSteps === CONVERSATION_STEPS.length;
}

export function getSuggestions(currentStep, conversationData) {
  const suggestions = {
    0: ['This weekend', 'Next month', 'Flexible dates'],
    1: ['Just me', 'Me and my partner', 'Small group (3-6)'],
    2: ['Dry reds', 'Sweet whites', 'Try everything'],
    3: ['Romantic', 'Educational', 'Scenic views'],
    4: ['Make reservations', 'Walk-in friendly', 'Mix of both'],
    5: ['One of us DD', 'Hire a driver', 'Take a tour'],
    6: ['Food recommendations', 'Just wine', 'Lodging nearby']
  };

  return suggestions[currentStep] || [];
}