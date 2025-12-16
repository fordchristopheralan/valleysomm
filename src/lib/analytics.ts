// Analytics utility for tracking events
// This is a simple client-side analytics wrapper

export type AnalyticsEvent = {
  event: string;
  properties?: Record<string, any>;
};

/**
 * Track an analytics event
 * @param eventName - Name of the event to track
 * @param properties - Optional event properties
 */
export function trackEvent(eventName: string, properties?: Record<string, any>): void {
  // In development, just log to console
  if (process.env.NODE_ENV === 'development') {
    console.log('[Analytics]', eventName, properties);
    return;
  }

  // Send to your analytics API endpoint
  try {
    fetch('/api/analytics/event', {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({
        event: eventName,
        properties: properties || {},
        timestamp: new Date().toISOString(),
      }),
    }).catch((error) => {
      // Silently fail - don't block user experience
      console.error('Analytics error:', error);
    });
  } catch (error) {
    // Silently fail
    console.error('Analytics error:', error);
  }
}

/**
 * Track a page view
 * @param page - Page path
 */
export function trackPageView(page: string): void {
  trackEvent('page_view', { page });
}

/**
 * Track user identification
 * @param userId - User ID
 * @param properties - User properties
 */
export function identifyUser(userId: string, properties?: Record<string, any>): void {
  trackEvent('identify', { userId, ...properties });
}