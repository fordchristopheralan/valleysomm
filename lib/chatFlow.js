// ============================================================================
// CHAT FLOW DETECTION LOGIC
// ============================================================================
// Analyzes conversation to determine current step and extract user preferences
// ============================================================================

export function detectCurrentStep(messages, currentData) {
  const userMessages = messages.filter(m => m.role === 'user')
  
  // If no user messages yet, we're at step 0
  if (userMessages.length === 0) {
    return {
      currentStep: 0,
      stepsCompleted: [false, false, false, false, false, false, false]
    }
  }

  const lastUserMessage = userMessages[userMessages.length - 1].content.toLowerCase()
  const lastAssistantMessage = messages.filter(m => m.role === 'assistant').pop()?.content.toLowerCase() || ''

  let stepData = {
    currentStep: currentData.currentStep || 0,
    stepsCompleted: [...(currentData.stepsCompleted || [false, false, false, false, false, false, false])],
    currentSuggestions: currentData.currentSuggestions || []
  }

  // =========================================================================
  // STEP 0: WHEN
  // =========================================================================
  if (!stepData.stepsCompleted[0]) {
    // Look for timing keywords in user message
    const hasTimingInfo = /\b(weekend|saturday|sunday|tomorrow|today|next month|week|january|february|march|april|may|june|july|august|september|october|november|december|\d{1,2}\/\d{1,2})\b/i.test(lastUserMessage)
    
    if (hasTimingInfo) {
      stepData.stepsCompleted[0] = true
      stepData.when = lastUserMessage
      stepData.currentStep = 1
      return stepData
    }
  }

  // =========================================================================
  // STEP 1: GROUP SIZE
  // =========================================================================
  if (stepData.stepsCompleted[0] && !stepData.stepsCompleted[1]) {
    // Check if assistant is asking about group size
    const askingGroupSize = lastAssistantMessage.includes('how many') || 
                           lastAssistantMessage.includes('group') ||
                           lastAssistantMessage.includes('people')
    
    if (askingGroupSize) {
      const hasGroupInfo = /\b(just me|myself|solo|partner|spouse|friend|people|person|two|three|four|five|six|seven|eight|group|family|couple|\d+)\b/i.test(lastUserMessage)
      
      if (hasGroupInfo) {
        stepData.stepsCompleted[1] = true
        stepData.groupSize = lastUserMessage
        stepData.currentStep = 2
        return stepData
      }
    }
  }

  // =========================================================================
  // STEP 2: WINE PREFERENCES
  // =========================================================================
  if (stepData.stepsCompleted[1] && !stepData.stepsCompleted[2]) {
    const askingWinePrefs = lastAssistantMessage.includes('wine') && 
                           (lastAssistantMessage.includes('prefer') || 
                            lastAssistantMessage.includes('like') ||
                            lastAssistantMessage.includes('gravitate'))
    
    if (askingWinePrefs) {
      const hasWinePrefs = /\b(dry|sweet|red|white|rosé|rose|cabernet|merlot|chardonnay|variety|mix|everything|wines)\b/i.test(lastUserMessage)
      
      if (hasWinePrefs) {
        stepData.stepsCompleted[2] = true
        stepData.winePrefs = lastUserMessage
        stepData.currentStep = 3
        return stepData
      }
    }
  }

  // =========================================================================
  // STEP 3: VIBE
  // =========================================================================
  if (stepData.stepsCompleted[2] && !stepData.stepsCompleted[3]) {
    const askingVibe = lastAssistantMessage.includes('vibe') || 
                      lastAssistantMessage.includes('atmosphere') ||
                      (lastAssistantMessage.includes('kind') && lastAssistantMessage.includes('going for'))
    
    if (askingVibe) {
      const hasVibeInfo = /\b(romantic|intimate|social|lively|educational|learn|relaxed|scenic|fun|party|quiet|peaceful)\b/i.test(lastUserMessage)
      
      if (hasVibeInfo) {
        stepData.stepsCompleted[3] = true
        stepData.vibe = lastUserMessage
        stepData.currentStep = 4
        return stepData
      }
    }
  }

  // =========================================================================
  // STEP 4: LOGISTICS
  // =========================================================================
  if (stepData.stepsCompleted[3] && !stepData.stepsCompleted[4]) {
    const askingLogistics = (lastAssistantMessage.includes('reservation') || 
                            lastAssistantMessage.includes('drive') ||
                            lastAssistantMessage.includes('walk-in'))
    
    if (askingLogistics) {
      const hasLogisticsInfo = /\b(reservation|reserve|book|walk-in|fine|okay|ok|drive|minutes|comfortable|concern|prefer)\b/i.test(lastUserMessage)
      
      if (hasLogisticsInfo) {
        stepData.stepsCompleted[4] = true
        stepData.logistics = lastUserMessage
        stepData.currentStep = 5
        return stepData
      }
    }
  }

  // =========================================================================
  // STEP 5: TRANSPORTATION
  // =========================================================================
  if (stepData.stepsCompleted[4] && !stepData.stepsCompleted[5]) {
    const askingTransportation = lastAssistantMessage.includes('driver') || 
                                lastAssistantMessage.includes('transportation') ||
                                lastAssistantMessage.includes('dd') ||
                                lastAssistantMessage.includes('designated')
    
    if (askingTransportation) {
      const hasTransportInfo = /\b(driver|dd|designated|tour|uber|lyft|hire|service|have|sorted|yes|no)\b/i.test(lastUserMessage)
      
      if (hasTransportInfo) {
        stepData.stepsCompleted[5] = true
        stepData.transportation = lastUserMessage
        stepData.currentStep = 6
        return stepData
      }
    }
  }

  // =========================================================================
  // STEP 6: ADD-ONS (FINAL STEP)
  // =========================================================================
  if (stepData.stepsCompleted[5] && !stepData.stepsCompleted[6]) {
    const askingAddons = lastAssistantMessage.includes('lunch') || 
                        lastAssistantMessage.includes('activities') ||
                        lastAssistantMessage.includes('other') ||
                        lastAssistantMessage.includes('last question')
    
    if (askingAddons) {
      const hasAddonsInfo = /\b(lunch|food|eat|activities|just wine|wine only|yes|no|sure|nope|maybe)\b/i.test(lastUserMessage)
      
      if (hasAddonsInfo) {
        stepData.stepsCompleted[6] = true
        stepData.addons = lastUserMessage
        stepData.currentStep = 6 // Stay at 6 (last step index is 6, not 7)
        return stepData
      }
    }
  }

  return stepData
}

// ============================================================================
// HELPER: Extract specific preference details
// ============================================================================

export function extractPreferences(messages) {
  const userMessages = messages
    .filter(m => m.role === 'user')
    .map(m => m.content.toLowerCase())
    .join(' ')

  return {
    // Wine type
    prefersDry: /\bdry\b/.test(userMessages),
    prefersSweet: /\bsweet\b/.test(userMessages),
    prefersRed: /\bred\b/.test(userMessages),
    prefersWhite: /\bwhite\b/.test(userMessages),
    
    // Vibe
    isRomantic: /\bromantic\b|\bintimate\b/.test(userMessages),
    isSocial: /\bsocial\b|\blively\b|\bfun\b/.test(userMessages),
    isEducational: /\beducational\b|\blearn\b|\beducation\b/.test(userMessages),
    isRelaxed: /\brelaxed\b|\bscenic\b|\bpeaceful\b/.test(userMessages),
    
    // Logistics
    needsReservations: /\breservation\b|\breserve\b|\bbook\b/.test(userMessages),
    prefersWalkIn: /\bwalk-in\b|\bwalk in\b/.test(userMessages),
    
    // Transportation
    hasDD: /\bdd\b|\bdesignated driver\b|\bhave a driver\b/.test(userMessages),
    needsDriver: /\bhire\b|\btour\b|\bservice\b|\buber\b/.test(userMessages),
    
    // Add-ons
    wantsLunch: /\blunch\b|\bfood\b|\beat\b/.test(userMessages),
    wantsActivities: /\bactivities\b|\bother\b/.test(userMessages),
  }
}