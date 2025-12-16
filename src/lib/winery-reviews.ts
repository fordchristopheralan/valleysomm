export interface WineryReviewData {
  rating: number;
  totalReviews: number;
  highlights: string[];
  priceLevel: number; // 1-4
}

export async function getWineryReviews(
  wineryName: string,
  coordinates: { latitude: number; longitude: number }
): Promise<WineryReviewData | null> {
  if (!process.env.GOOGLE_PLACES_API_KEY) {
    return null;
  }

  try {
    // Step 1: Find Place
    const searchUrl = `https://maps.googleapis.com/maps/api/place/findplacefromtext/json?input=${encodeURIComponent(wineryName)}&inputtype=textquery&fields=place_id&locationbias=circle:5000@${coordinates.latitude},${coordinates.longitude}&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    
    const searchResponse = await fetch(searchUrl);
    const searchData = await searchResponse.json();
    
    if (!searchData.candidates || searchData.candidates.length === 0) {
      return null;
    }
    
    const placeId = searchData.candidates[0].place_id;
    
    // Step 2: Get Place Details
    const detailsUrl = `https://maps.googleapis.com/maps/api/place/details/json?place_id=${placeId}&fields=rating,user_ratings_total,reviews,price_level&key=${process.env.GOOGLE_PLACES_API_KEY}`;
    
    const detailsResponse = await fetch(detailsUrl);
    const detailsData = await detailsResponse.json();
    
    if (!detailsData.result) {
      return null;
    }
    
    const result = detailsData.result;
    
    // Extract highlights from reviews
    const highlights = extractHighlights(result.reviews || []);
    
    return {
      rating: result.rating || 0,
      totalReviews: result.user_ratings_total || 0,
      highlights,
      priceLevel: result.price_level || 2
    };
  } catch (error) {
    console.error('Error fetching winery reviews:', error);
    return null;
  }
}

function extractHighlights(reviews: any[]): string[] {
  if (!reviews || reviews.length === 0) return [];
  
  // Common positive keywords to look for
  const positiveKeywords = [
    'beautiful', 'scenic', 'stunning', 'view', 'views',
    'friendly', 'knowledgeable', 'staff', 'service',
    'delicious', 'excellent', 'amazing', 'fantastic',
    'cozy', 'atmosphere', 'ambiance',
    'selection', 'variety', 'wines'
  ];
  
  const highlights: string[] = [];
  const highlightSet = new Set<string>();
  
  reviews.slice(0, 5).forEach(review => {
    const text = review.text.toLowerCase();
    
    if (text.includes('view') || text.includes('scenic')) {
      highlightSet.add('Beautiful scenic views');
    }
    if (text.includes('staff') || text.includes('friendly') || text.includes('knowledgeable')) {
      highlightSet.add('Friendly, knowledgeable staff');
    }
    if (text.includes('wine') && (text.includes('excellent') || text.includes('amazing'))) {
      highlightSet.add('Excellent wine selection');
    }
    if (text.includes('food') || text.includes('lunch') || text.includes('restaurant')) {
      highlightSet.add('Food available');
    }
  });
  
  return Array.from(highlightSet).slice(0, 3);
}

// Batch fetch for multiple wineries
export async function batchGetWineryReviews(
  wineries: Array<{ name: string; coordinates: { latitude: number; longitude: number } }>
): Promise<Map<string, WineryReviewData>> {
  const reviewsMap = new Map<string, WineryReviewData>();
  
  // Fetch in parallel with rate limiting
  const batchSize = 3; // Google Places has rate limits
  for (let i = 0; i < wineries.length; i += batchSize) {
    const batch = wineries.slice(i, i + batchSize);
    const promises = batch.map(w => getWineryReviews(w.name, w.coordinates));
    const results = await Promise.all(promises);
    
    batch.forEach((winery, index) => {
      if (results[index]) {
        reviewsMap.set(winery.name, results[index]!);
      }
    });
    
    // Rate limiting delay
    if (i + batchSize < wineries.length) {
      await new Promise(resolve => setTimeout(resolve, 1000));
    }
  }
  
  return reviewsMap;
}