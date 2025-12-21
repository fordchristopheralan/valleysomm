import { supabase } from './supabase'

// Generate or retrieve session ID
const getSessionId = () => {
  if (typeof window === 'undefined') return null
  
  let sessionId = sessionStorage.getItem('survey_session_id')
  if (!sessionId) {
    sessionId = crypto.randomUUID()
    sessionStorage.setItem('survey_session_id', sessionId)
  }
  return sessionId
}

// Get or create analytics session in database
const getOrCreateAnalyticsSession = async () => {
  const sessionId = getSessionId()
  if (!sessionId) return null

  // Check if session exists
  const { data: existing } = await supabase
    .from('survey_analytics')
    .select('id')
    .eq('session_id', sessionId)
    .single()

  if (existing) {
    return existing.id
  }

  // Create new analytics session
  const { data: newSession, error } = await supabase
    .from('survey_analytics')
    .insert([{
      session_id: sessionId,
      source: getUTMSource(),
      referrer: typeof window !== 'undefined' ? document.referrer : null,
      device_type: getDeviceType(),
      started_at: new Date().toISOString(),
      last_activity_at: new Date().toISOString(),
    }])
    .select()
    .single()

  if (error) {
    console.error('Error creating analytics session:', error)
    return null
  }

  return newSession.id
}

// Extract UTM source (primary source tracking)
const getUTMSource = () => {
  if (typeof window === 'undefined') return null
  
  const params = new URLSearchParams(window.location.search)
  return params.get('utm_source') || params.get('source') || null
}

// Get all UTM parameters
const getUTMParams = () => {
  if (typeof window === 'undefined') return {}
  
  const params = new URLSearchParams(window.location.search)
  return {
    utm_source: params.get('utm_source'),
    utm_medium: params.get('utm_medium'),
    utm_campaign: params.get('utm_campaign'),
    utm_content: params.get('utm_content'),
    utm_term: params.get('utm_term'),
  }
}

// Get device type
const getDeviceType = () => {
  if (typeof window === 'undefined') return 'unknown'
  const ua = navigator.userAgent.toLowerCase()
  if (/mobile|android|iphone|ipad|ipod/.test(ua)) return 'mobile'
  if (/tablet|ipad/.test(ua)) return 'tablet'
  return 'desktop'
}

// Track step event
export const trackStepEvent = async (stepNumber, stepName, eventType = 'started') => {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    // Get current analytics record
    const { data: analytics } = await supabase
      .from('survey_analytics')
      .select('step_events')
      .eq('session_id', sessionId)
      .single()

    if (!analytics) {
      await getOrCreateAnalyticsSession()
    }

    const stepEvent = {
      step: stepNumber,
      step_name: stepName,
      event: eventType,
      timestamp: new Date().toISOString(),
    }

    // Append to step_events array
    const { error } = await supabase
      .from('survey_analytics')
      .update({
        step_events: analytics ? [...(analytics.step_events || []), stepEvent] : [stepEvent],
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error tracking step event:', error)
    }

    // Also track to GA4 if available
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', `survey_step_${eventType}`, {
        step_number: stepNumber,
        step_name: stepName,
        session_id: sessionId,
      })
    }
  } catch (error) {
    console.error('Error in trackStepEvent:', error)
  }
}

// Track question interaction
export const trackQuestionEvent = async (questionId, questionText, eventType, value = null) => {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const { data: analytics } = await supabase
      .from('survey_analytics')
      .select('question_events')
      .eq('session_id', sessionId)
      .single()

    const questionEvent = {
      question_id: questionId,
      question_text: questionText,
      event: eventType, // 'focused', 'answered', 'changed', 'skipped'
      value: value,
      timestamp: new Date().toISOString(),
    }

    const { error } = await supabase
      .from('survey_analytics')
      .update({
        question_events: analytics ? [...(analytics.question_events || []), questionEvent] : [questionEvent],
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error tracking question event:', error)
    }
  } catch (error) {
    console.error('Error in trackQuestionEvent:', error)
  }
}

// Track survey completion
export const trackSurveyComplete = async (responseId) => {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const { data: analytics } = await supabase
      .from('survey_analytics')
      .select('started_at')
      .eq('session_id', sessionId)
      .single()

    if (!analytics) return

    const startedAt = new Date(analytics.started_at)
    const completedAt = new Date()
    const durationSeconds = Math.floor((completedAt - startedAt) / 1000)

    const { error } = await supabase
      .from('survey_analytics')
      .update({
        response_id: responseId,
        completed: true,
        completed_at: completedAt.toISOString(),
        total_duration_seconds: durationSeconds,
        last_activity_at: completedAt.toISOString(),
      })
      .eq('session_id', sessionId)

    if (error) {
      console.error('Error tracking completion:', error)
    }

    // Track to GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'survey_complete', {
        session_id: sessionId,
        duration_seconds: durationSeconds,
      })
    }
  } catch (error) {
    console.error('Error in trackSurveyComplete:', error)
  }
}

// Track abandonment
export const trackAbandon = async (lastStep) => {
  try {
    const sessionId = getSessionId()
    if (!sessionId) return

    const { error } = await supabase
      .from('survey_analytics')
      .update({
        abandoned_at_step: lastStep,
        last_activity_at: new Date().toISOString(),
      })
      .eq('session_id', sessionId)
      .eq('completed', false) // Only update if not completed

    if (error) {
      console.error('Error tracking abandon:', error)
    }

    // Track to GA4
    if (typeof window !== 'undefined' && window.gtag) {
      window.gtag('event', 'survey_abandon', {
        last_step: lastStep,
        session_id: sessionId,
      })
    }
  } catch (error) {
    console.error('Error in trackAbandon:', error)
  }
}

// Initialize analytics session on page load
export const initAnalytics = async () => {
  try {
    await getOrCreateAnalyticsSession()
    
    // Track page view to GA4
    if (typeof window !== 'undefined' && window.gtag) {
      const utmParams = getUTMParams()
      window.gtag('event', 'page_view', {
        page_title: 'Wine Country Trip Survey',
        page_location: window.location.href,
        ...utmParams,
      })
    }
  } catch (error) {
    console.error('Error initializing analytics:', error)
  }
}

// Convenience functions
export const trackStepStart = (stepNumber, stepName) => {
  return trackStepEvent(stepNumber, stepName, 'started')
}

export const trackStepComplete = (stepNumber, stepName) => {
  return trackStepEvent(stepNumber, stepName, 'completed')
}

export const trackStepBack = (fromStep, toStep) => {
  return trackStepEvent(toStep, 'Navigation', 'back_from_' + fromStep)
}